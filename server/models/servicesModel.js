import { query, withTransaction } from '../config/db.js'
import { isPositiveInteger, isPositiveNumber, validServiceTypes } from '../utils/validators.js'

const calculateStatus = ({ maxCapacity, currentBookings, isEnabled, requestedStatus }) => {
  if (!isEnabled || requestedStatus === 'closed') return 'closed'
  const slots = maxCapacity - currentBookings
  if (slots <= 0) return 'full'
  if (slots <= 5) return 'limited'
  return 'available'
}

const selectServicesSql = `
  SELECT
    s.id,
    s.service_type,
    COALESCE(s.service_name, t.title, tr.title, r.name, c.car_name, p.name, CONCAT(UPPER(LEFT(s.service_type, 1)), SUBSTRING(s.service_type, 2), ' #', s.id)) AS service_name,
    COALESCE(s.description, t.description, tr.description, r.description, p.description) AS description,
    COALESCE(s.location, t.location, tr.location, r.location, c.location, p.location) AS location,
    COALESCE(s.price, t.price, tr.price, c.price_per_day, p.price_per_night, 0) AS price,
    s.max_capacity,
    s.current_bookings,
    (s.max_capacity - s.current_bookings) AS available_slots,
    s.status,
    s.is_enabled,
    s.created_at,
    s.updated_at,
    ROUND((s.current_bookings / NULLIF(s.max_capacity, 0)) * 100, 2) AS occupancy_rate
  FROM services s
  LEFT JOIN tours t ON s.service_type = 'tour' AND s.id = t.id
  LEFT JOIN treks tr ON s.service_type = 'trek' AND s.id = tr.id
  LEFT JOIN restaurants r ON s.service_type = 'restaurant' AND s.id = r.id
  LEFT JOIN car_rentals c ON s.service_type = 'car' AND s.id = c.id
  LEFT JOIN properties p ON s.service_type = 'property' AND s.id = p.id
`

export const servicesModel = {
  async getAll({ serviceType = null, status = null, includeClosed = false } = {}) {
    const clauses = []
    const params = []
    if (serviceType) {
      clauses.push('s.service_type = ?')
      params.push(serviceType)
    }
    if (status) {
      clauses.push('s.status = ?')
      params.push(status)
    }
    if (!includeClosed) {
      clauses.push('s.status <> ?')
      params.push('closed')
    }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    return query(`${selectServicesSql} ${whereSql} ORDER BY s.id DESC`, params)
  },

  async getById(id, serviceType = null) {
    const clauses = ['s.id = ?']
    const params = [id]
    if (serviceType) {
      clauses.push('s.service_type = ?')
      params.push(serviceType)
    }
    const rows = await query(`${selectServicesSql} WHERE ${clauses.join(' AND ')} LIMIT 1`, params)
    return rows[0] || null
  },

  async create(payload) {
    const serviceType = String(payload.serviceType || '').trim()
    if (!validServiceTypes.has(serviceType)) {
      throw new Error('Invalid service type')
    }
    const maxCapacity = Number(payload.maxCapacity ?? 50)
    if (!isPositiveInteger(maxCapacity)) {
      throw new Error('maxCapacity must be a positive integer')
    }
    const currentBookings = Number(payload.currentBookings ?? 0)
    if (!isPositiveInteger(currentBookings) && currentBookings !== 0) {
      throw new Error('currentBookings must be a non-negative integer')
    }
    if (currentBookings > maxCapacity) {
      throw new Error('currentBookings cannot exceed maxCapacity')
    }
    const price = payload.price !== undefined && payload.price !== null ? Number(payload.price) : null
    if (price !== null && !isPositiveNumber(price)) {
      throw new Error('price must be a non-negative number')
    }
    const isEnabled = payload.isEnabled !== undefined ? Boolean(payload.isEnabled) : true
    const status = calculateStatus({
      maxCapacity,
      currentBookings,
      isEnabled,
      requestedStatus: payload.status
    })

    const result = await query(
      `INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceType,
        payload.serviceName || null,
        payload.description || null,
        payload.location || null,
        price,
        maxCapacity,
        currentBookings,
        status,
        isEnabled ? 1 : 0
      ]
    )
    return this.getById(result.insertId)
  },

  async updateById(id, payload) {
    return withTransaction(async (connection) => {
      const [rows] = await connection.execute(
        `SELECT id, service_type, max_capacity, current_bookings, status, is_enabled FROM services WHERE id = ? LIMIT 1`,
        [id]
      )
      const service = rows[0]
      if (!service) {
        return null
      }

      const nextMaxCapacity = payload.maxCapacity !== undefined ? Number(payload.maxCapacity) : Number(service.max_capacity)
      if (!isPositiveInteger(nextMaxCapacity)) {
        throw new Error('maxCapacity must be a positive integer')
      }
      if (nextMaxCapacity < Number(service.current_bookings)) {
        throw new Error('maxCapacity cannot be lower than current bookings')
      }
      const nextCurrentBookings = payload.currentBookings !== undefined ? Number(payload.currentBookings) : Number(service.current_bookings)
      if (nextCurrentBookings < 0 || nextCurrentBookings > nextMaxCapacity) {
        throw new Error('currentBookings must be between 0 and maxCapacity')
      }
      const nextPrice = payload.price !== undefined ? Number(payload.price) : payload.price
      if (payload.price !== undefined && !isPositiveNumber(nextPrice)) {
        throw new Error('price must be a non-negative number')
      }
      const nextIsEnabled = payload.isEnabled !== undefined ? Boolean(payload.isEnabled) : Boolean(service.is_enabled)
      const nextStatus = calculateStatus({
        maxCapacity: nextMaxCapacity,
        currentBookings: nextCurrentBookings,
        isEnabled: nextIsEnabled,
        requestedStatus: payload.status
      })

      await connection.execute(
        `UPDATE services
         SET service_name = COALESCE(?, service_name),
             service_type = COALESCE(?, service_type),
             description = COALESCE(?, description),
             location = COALESCE(?, location),
             price = COALESCE(?, price),
             max_capacity = ?,
             current_bookings = ?,
             status = ?,
             is_enabled = ?
         WHERE id = ?`,
        [
          payload.serviceName ?? null,
          payload.serviceType ?? null,
          payload.description ?? null,
          payload.location ?? null,
          payload.price !== undefined ? nextPrice : null,
          nextMaxCapacity,
          nextCurrentBookings,
          nextStatus,
          nextIsEnabled ? 1 : 0,
          id
        ]
      )

      return this.getById(id)
    })
  },

  async deleteById(id) {
    const result = await query(`DELETE FROM services WHERE id = ?`, [id])
    return result.affectedRows > 0
  }
}

