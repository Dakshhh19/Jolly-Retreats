import { query, withTransaction } from '../config/db.js'
import { buildUpdateClause } from './modelUtils.js'

const selectClause = `
  SELECT id, user_id, service_type, service_id, booking_count, booking_date, status, created_at
  FROM bookings
`

const countTowardsCapacity = (status) => status !== 'cancelled'

const calculateServiceStatus = ({ maxCapacity, currentBookings, isEnabled, requestedStatus }) => {
  if (!isEnabled || requestedStatus === 'closed') return 'closed'
  const slots = maxCapacity - currentBookings
  if (slots <= 0) return 'full'
  if (slots <= 5) return 'limited'
  return 'available'
}

const defaultMaxCapacity = 50

const getServiceSeedSql = (serviceType) => {
  if (serviceType === 'tour') {
    return `SELECT id, title AS service_name, description, location, price FROM tours WHERE id = ? LIMIT 1`
  }
  if (serviceType === 'trek') {
    return `SELECT id, title AS service_name, description, location, price FROM treks WHERE id = ? LIMIT 1`
  }
  if (serviceType === 'restaurant') {
    return `SELECT id, name AS service_name, description, location, NULL AS price FROM restaurants WHERE id = ? LIMIT 1`
  }
  if (serviceType === 'car') {
    return `SELECT id, car_name AS service_name, NULL AS description, location, price_per_day AS price FROM car_rentals WHERE id = ? LIMIT 1`
  }
  if (serviceType === 'property') {
    return `SELECT id, name AS service_name, description, location, price_per_night AS price FROM properties WHERE id = ? LIMIT 1`
  }
  return null
}

const getServiceForUpdate = async (connection, serviceId, serviceType) => {
  const [serviceRows] = await connection.execute(
    `SELECT id, max_capacity, current_bookings, status, is_enabled
     FROM services
     WHERE id = ? AND service_type = ?
     LIMIT 1
     FOR UPDATE`,
    [serviceId, serviceType]
  )
  return serviceRows[0] || null
}

const getServiceByNameForUpdate = async (connection, serviceType, serviceName) => {
  const [rows] = await connection.execute(
    `SELECT id, max_capacity, current_bookings, status, is_enabled
     FROM services
     WHERE service_type = ? AND LOWER(service_name) = LOWER(?)
     LIMIT 1
     FOR UPDATE`,
    [serviceType, serviceName]
  )
  return rows[0] || null
}

const ensureServiceExistsForBooking = async (connection, serviceId, serviceType, metadata = {}) => {
  let service = await getServiceForUpdate(connection, serviceId, serviceType)
  if (service) return service

  if (metadata.serviceName) {
    service = await getServiceByNameForUpdate(connection, serviceType, metadata.serviceName)
    if (service) return service
  }

  const seedSql = getServiceSeedSql(serviceType)
  if (seedSql) {
    const [seedRows] = await connection.execute(seedSql, [serviceId])
    const seed = seedRows[0]
    if (seed) {
      try {
        await connection.execute(
          `INSERT INTO services (id, service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'available', 1)`,
          [
            Number(seed.id),
            serviceType,
            seed.service_name || `${serviceType} #${serviceId}`,
            seed.description || null,
            seed.location || null,
            seed.price !== undefined && seed.price !== null ? Number(seed.price) : null,
            defaultMaxCapacity
          ]
        )
      } catch {
        // ID may be occupied by another service type; continue to name-based fallback.
      }
      service = await getServiceForUpdate(connection, serviceId, serviceType)
      if (service) return service
    }
  }

  if (metadata.serviceName) {
    const [insertResult] = await connection.execute(
      `INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'available', 1)`,
      [
        serviceType,
        metadata.serviceName,
        metadata.serviceDescription || null,
        metadata.serviceLocation || null,
        metadata.servicePrice !== undefined && metadata.servicePrice !== null ? Number(metadata.servicePrice) : null,
        defaultMaxCapacity
      ]
    )
    service = await getServiceForUpdate(connection, insertResult.insertId, serviceType)
    if (service) return service
  }

  return service
}

export const bookingsModel = {
  async getAll() {
    return query(`${selectClause} ORDER BY created_at DESC`)
  },

  async getByUserId(userId) {
    return query(`${selectClause} WHERE user_id = ? ORDER BY created_at DESC`, [userId])
  },

  async getById(id) {
    const rows = await query(`${selectClause} WHERE id = ? LIMIT 1`, [id])
    return rows[0] || null
  },

  async getByServiceId(serviceId, serviceType = null) {
    const clauses = ['service_id = ?']
    const params = [serviceId]
    if (serviceType) {
      clauses.push('service_type = ?')
      params.push(serviceType)
    }
    return query(`${selectClause} WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`, params)
  },

  async create({
    userId,
    serviceType,
    serviceId,
    bookingCount = 1,
    bookingDate,
    status = 'pending',
    serviceName,
    serviceDescription,
    serviceLocation,
    servicePrice
  }) {
    return withTransaction(async (connection) => {
      const service = await ensureServiceExistsForBooking(connection, serviceId, serviceType, {
        serviceName,
        serviceDescription,
        serviceLocation,
        servicePrice
      })
      if (!service) {
        throw new Error('Service not found')
      }
      if (!service.is_enabled || service.status === 'closed') {
        throw new Error('Service is closed')
      }

      const slots = Number(service.max_capacity) - Number(service.current_bookings)
      if (bookingCount > slots) {
        throw new Error(slots > 0 ? `Only ${slots} slots left` : 'Service full')
      }

      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings (user_id, service_type, service_id, booking_count, booking_date, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, serviceType, Number(service.id), bookingCount, bookingDate, status]
      )

      const increment = countTowardsCapacity(status) ? bookingCount : 0
      const nextCurrent = Number(service.current_bookings) + increment
      const nextStatus = calculateServiceStatus({
        maxCapacity: Number(service.max_capacity),
        currentBookings: nextCurrent,
        isEnabled: Boolean(service.is_enabled)
      })
      await connection.execute(
        `UPDATE services SET current_bookings = ?, status = ? WHERE id = ? AND service_type = ?`,
        [nextCurrent, nextStatus, Number(service.id), serviceType]
      )

      const [bookingRows] = await connection.execute(`${selectClause} WHERE id = ? LIMIT 1`, [bookingResult.insertId])
      return bookingRows[0] || null
    })
  },

  async updateById(id, payload) {
    return withTransaction(async (connection) => {
      const [bookingRows] = await connection.execute(
        `${selectClause} WHERE id = ? LIMIT 1 FOR UPDATE`,
        [id]
      )
      const booking = bookingRows[0]
      if (!booking) {
        return null
      }

      const [serviceRows] = await connection.execute(
        `SELECT id, max_capacity, current_bookings, status, is_enabled
         FROM services
         WHERE id = ? AND service_type = ?
         LIMIT 1
         FOR UPDATE`,
        [booking.service_id, booking.service_type]
      )
      const service = serviceRows[0]
      if (!service) {
        throw new Error('Service not found')
      }

      const nextStatus = payload.status || booking.status
      const nextBookingCount = payload.bookingCount !== undefined ? Number(payload.bookingCount) : Number(booking.booking_count)

      const previousApplied = countTowardsCapacity(booking.status) ? Number(booking.booking_count) : 0
      const nextApplied = countTowardsCapacity(nextStatus) ? nextBookingCount : 0
      const delta = nextApplied - previousApplied

      const currentBookings = Number(service.current_bookings)
      const maxCapacity = Number(service.max_capacity)
      if (delta > (maxCapacity - currentBookings)) {
        throw new Error('Service full')
      }
      if (currentBookings + delta < 0) {
        throw new Error('Invalid booking adjustment')
      }

      const update = buildUpdateClause({
        booking_date: payload.bookingDate,
        booking_count: payload.bookingCount,
        status: payload.status
      })

      if (update) {
        await connection.execute(`UPDATE bookings SET ${update.setClause} WHERE id = ?`, [...update.values, id])
      }

      const recalculatedCurrent = currentBookings + delta
      const recalculatedStatus = calculateServiceStatus({
        maxCapacity,
        currentBookings: recalculatedCurrent,
        isEnabled: Boolean(service.is_enabled),
        requestedStatus: service.status
      })
      await connection.execute(
        `UPDATE services SET current_bookings = ?, status = ? WHERE id = ? AND service_type = ?`,
        [recalculatedCurrent, recalculatedStatus, booking.service_id, booking.service_type]
      )

      const [updatedRows] = await connection.execute(`${selectClause} WHERE id = ? LIMIT 1`, [id])
      return updatedRows[0] || null
    })
  },

  async deleteById(id) {
    return withTransaction(async (connection) => {
      const [bookingRows] = await connection.execute(
        `${selectClause} WHERE id = ? LIMIT 1 FOR UPDATE`,
        [id]
      )
      const booking = bookingRows[0]
      if (!booking) {
        return false
      }

      const [serviceRows] = await connection.execute(
        `SELECT id, max_capacity, current_bookings, status, is_enabled
         FROM services
         WHERE id = ? AND service_type = ?
         LIMIT 1
         FOR UPDATE`,
        [booking.service_id, booking.service_type]
      )
      const service = serviceRows[0]

      const [deleteResult] = await connection.execute(`DELETE FROM bookings WHERE id = ?`, [id])
      if (!deleteResult.affectedRows) {
        return false
      }

      if (service && countTowardsCapacity(booking.status)) {
        const nextCurrent = Math.max(0, Number(service.current_bookings) - Number(booking.booking_count || 1))
        const nextStatus = calculateServiceStatus({
          maxCapacity: Number(service.max_capacity),
          currentBookings: nextCurrent,
          isEnabled: Boolean(service.is_enabled),
          requestedStatus: service.status
        })
        await connection.execute(
          `UPDATE services SET current_bookings = ?, status = ? WHERE id = ? AND service_type = ?`,
          [nextCurrent, nextStatus, booking.service_id, booking.service_type]
        )
      }

      return true
    })
  }
}
