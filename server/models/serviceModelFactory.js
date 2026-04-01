import { query, withTransaction } from '../config/db.js'
import { buildUpdateClause } from './modelUtils.js'

const createBaseServiceModel = ({ tableName, serviceType, insertColumns, updateColumns, selectColumns }) => {
  const readColumns = [
    ...selectColumns.map((column) => `t.${column}`),
    's.max_capacity',
    's.current_bookings',
    '(s.max_capacity - s.current_bookings) AS available_slots',
    's.status',
    's.is_enabled',
    `ROUND((s.current_bookings / NULLIF(s.max_capacity, 0)) * 100, 2) AS occupancy_rate`
  ].join(', ')
  const insertKeys = insertColumns.map((col) => col.key)
  const insertValuesOrder = insertColumns.map((col) => col.value)

  const calculateStatus = ({ maxCapacity, currentBookings, isEnabled, requestedStatus }) => {
    if (!isEnabled || requestedStatus === 'closed') {
      return 'closed'
    }
    const slots = maxCapacity - currentBookings
    if (slots <= 0) return 'full'
    if (slots <= 5) return 'limited'
    return 'available'
  }

  const deriveServiceMetadata = (payload) => {
    const serviceName = payload.serviceName || payload.title || payload.name || payload.carName || null
    const description = payload.description || null
    const location = payload.location || null
    const price = payload.price ?? payload.pricePerDay ?? payload.pricePerNight ?? null
    return { serviceName, description, location, price: price === null ? null : Number(price) }
  }

  return {
    async getAll() {
      return query(
        `SELECT ${readColumns}
         FROM ${tableName} t
         INNER JOIN services s ON s.id = t.id AND s.service_type = ?
         ORDER BY t.id DESC`,
        [serviceType]
      )
    },

    async getById(id) {
      const rows = await query(
        `SELECT ${readColumns}
         FROM ${tableName} t
         INNER JOIN services s ON s.id = t.id AND s.service_type = ?
         WHERE t.id = ?
         LIMIT 1`,
        [serviceType, id]
      )
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
        const metadata = deriveServiceMetadata(payload)

        const [serviceResult] = await connection.execute(
          `INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          [serviceType, metadata.serviceName, metadata.description, metadata.location, metadata.price, maxCapacity, status, isEnabled ? 1 : 0]
        )
        const serviceId = serviceResult.insertId
        const values = insertValuesOrder.map((key) => payload[key])
        const columnsSql = ['id', ...insertKeys].join(', ')
        const placeholdersSql = ['?', ...insertKeys.map(() => '?')].join(', ')

        await connection.execute(
          `INSERT INTO ${tableName} (${columnsSql}) VALUES (${placeholdersSql})`,
          [serviceId, ...values]
        )

        const [rows] = await connection.execute(
          `SELECT ${readColumns}
           FROM ${tableName} t
           INNER JOIN services s ON s.id = t.id AND s.service_type = ?
           WHERE t.id = ?
           LIMIT 1`,
          [serviceType, serviceId]
        )
        return rows[0]
      })
    },

    async updateById(id, payload) {
      return withTransaction(async (connection) => {
        const fields = {}
        for (const column of updateColumns) {
          fields[column.key] = payload[column.value]
        }

        const update = buildUpdateClause(fields)
        if (update) {
          await connection.execute(`UPDATE ${tableName} SET ${update.setClause} WHERE id = ?`, [...update.values, id])
        }

        const [serviceRows] = await connection.execute(
          `SELECT id, max_capacity, current_bookings, status, is_enabled FROM services WHERE id = ? AND service_type = ? LIMIT 1`,
          [id, serviceType]
        )
        const service = serviceRows[0]
        if (!service) {
          return null
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
          requestedStatus: payload.status
        })
        const metadata = deriveServiceMetadata(payload)

        await connection.execute(
          `UPDATE services
           SET service_name = COALESCE(?, service_name),
               description = COALESCE(?, description),
               location = COALESCE(?, location),
               price = COALESCE(?, price),
               max_capacity = ?,
               status = ?,
               is_enabled = ?
           WHERE id = ? AND service_type = ?`,
          [
            metadata.serviceName,
            metadata.description,
            metadata.location,
            metadata.price,
            nextMaxCapacity,
            nextStatus,
            nextIsEnabled ? 1 : 0,
            id,
            serviceType
          ]
        )

        const [rows] = await connection.execute(
          `SELECT ${readColumns}
           FROM ${tableName} t
           INNER JOIN services s ON s.id = t.id AND s.service_type = ?
           WHERE t.id = ?
           LIMIT 1`,
          [serviceType, id]
        )
        return rows[0] || null
      })
    },

    async deleteById(id) {
      const result = await query(
        `DELETE FROM services WHERE id = ? AND service_type = ?`,
        [id, serviceType]
      )
      return result.affectedRows > 0
    }
  }
}

export default createBaseServiceModel
