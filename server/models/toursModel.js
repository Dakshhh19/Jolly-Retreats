import { query, withTransaction } from '../config/db.js'
import { buildUpdateClause } from './modelUtils.js'

const selectClause = `
  SELECT
    t.id,
    t.title,
    t.description,
    t.location,
    t.price,
    t.duration,
    t.image_url,
    t.created_at,
    s.max_capacity,
    s.current_bookings,
    (s.max_capacity - s.current_bookings) AS available_slots,
    s.status,
    s.is_enabled,
    ROUND((s.current_bookings / NULLIF(s.max_capacity, 0)) * 100, 2) AS occupancy_rate,
    DATE_FORMAT(ta.min_start_date, '%Y-%m-%d') AS min_start_date,
    DATE_FORMAT(ta.max_end_date, '%Y-%m-%d') AS max_end_date
  FROM tours t
  INNER JOIN services s ON s.id = t.id AND s.service_type = 'tour'
  LEFT JOIN tour_availability ta ON ta.tour_id = t.id
`

const calculateStatus = ({ maxCapacity, currentBookings, isEnabled, requestedStatus }) => {
  if (!isEnabled || requestedStatus === 'closed') {
    return 'closed'
  }
  const slots = maxCapacity - currentBookings
  if (slots <= 0) return 'full'
  if (slots <= 5) return 'limited'
  return 'available'
}

export const toursModel = {
  async getAll() {
    return query(`${selectClause} ORDER BY t.id DESC`)
  },

  async getById(id) {
    const rows = await query(`${selectClause} WHERE t.id = ? LIMIT 1`, [id])
    return rows[0] || null
  },

  async create(payload) {
    return withTransaction(async (connection) => {
      const maxCapacity = Number(payload.maxCapacity || 50)
      const isEnabled = payload.isEnabled !== undefined ? Boolean(payload.isEnabled) : true
      const status = calculateStatus({
        maxCapacity,
        currentBookings: 0,
        isEnabled,
        requestedStatus: payload.status
      })

      const [serviceResult] = await connection.execute(
        `INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
         VALUES ('tour', ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          payload.title,
          payload.description || null,
          payload.location,
          Number(payload.price),
          maxCapacity,
          status,
          isEnabled ? 1 : 0
        ]
      )

      const serviceId = Number(serviceResult.insertId)
      await connection.execute(
        `INSERT INTO tours (id, title, description, location, price, duration, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          serviceId,
          payload.title,
          payload.description || null,
          payload.location,
          Number(payload.price),
          payload.duration,
          payload.imageUrl || null
        ]
      )
      await connection.execute(
        `INSERT INTO tour_availability (tour_id, min_start_date, max_end_date)
         VALUES (?, ?, ?)`,
        [serviceId, payload.minStartDate, payload.maxEndDate]
      )

      const [rows] = await connection.execute(`${selectClause} WHERE t.id = ? LIMIT 1`, [serviceId])
      return rows[0] || null
    })
  },

  async updateById(id, payload) {
    return withTransaction(async (connection) => {
      const [serviceRows] = await connection.execute(
        `SELECT id, max_capacity, current_bookings, status, is_enabled
         FROM services
         WHERE id = ? AND service_type = 'tour'
         LIMIT 1
         FOR UPDATE`,
        [id]
      )
      const service = serviceRows[0]
      if (!service) {
        return null
      }

      const update = buildUpdateClause({
        title: payload.title,
        description: payload.description,
        location: payload.location,
        price: payload.price !== undefined ? Number(payload.price) : undefined,
        duration: payload.duration,
        image_url: payload.imageUrl
      })
      if (update) {
        await connection.execute(`UPDATE tours SET ${update.setClause} WHERE id = ?`, [...update.values, id])
      }

      const nextMaxCapacity = payload.maxCapacity !== undefined ? Number(payload.maxCapacity) : Number(service.max_capacity)
      if (nextMaxCapacity < Number(service.current_bookings)) {
        throw new Error('maxCapacity cannot be lower than current bookings')
      }
      const nextIsEnabled = payload.isEnabled !== undefined ? Boolean(payload.isEnabled) : Boolean(service.is_enabled)
      const nextStatus = calculateStatus({
        maxCapacity: nextMaxCapacity,
        currentBookings: Number(service.current_bookings),
        isEnabled: nextIsEnabled,
        requestedStatus: payload.status || service.status
      })

      await connection.execute(
        `UPDATE services
         SET service_name = COALESCE(?, service_name),
             description = COALESCE(?, description),
             location = COALESCE(?, location),
             price = COALESCE(?, price),
             max_capacity = ?,
             status = ?,
             is_enabled = ?
         WHERE id = ? AND service_type = 'tour'`,
        [
          payload.title,
          payload.description,
          payload.location,
          payload.price !== undefined ? Number(payload.price) : null,
          nextMaxCapacity,
          nextStatus,
          nextIsEnabled ? 1 : 0,
          id
        ]
      )

      const availabilityUpdate = buildUpdateClause({
        min_start_date: payload.minStartDate,
        max_end_date: payload.maxEndDate
      })
      if (availabilityUpdate) {
        await connection.execute(
          `UPDATE tour_availability SET ${availabilityUpdate.setClause} WHERE tour_id = ?`,
          [...availabilityUpdate.values, id]
        )
      }

      const [rows] = await connection.execute(`${selectClause} WHERE t.id = ? LIMIT 1`, [id])
      return rows[0] || null
    })
  },

  async deleteById(id) {
    const result = await query(`DELETE FROM services WHERE id = ? AND service_type = 'tour'`, [id])
    return result.affectedRows > 0
  }
}
