import crypto from 'crypto'
import { query, withTransaction } from '../config/db.js'

const TAX_RATE = 0.12

const bookingSelect = `
  SELECT
    tb.booking_id,
    tb.user_id,
    tb.tour_id,
    DATE_FORMAT(tb.start_date, '%Y-%m-%d') AS start_date,
    DATE_FORMAT(tb.end_date, '%Y-%m-%d') AS end_date,
    tb.total_people,
    tb.price_per_person,
    tb.tax_amount,
    tb.total_amount,
    tb.booking_status,
    tb.primary_contact_name,
    tb.primary_contact_phone,
    tb.tour_name_snapshot,
    tb.tour_description_snapshot,
    tb.created_at,
    tb.updated_at,
    t.title AS tour_title,
    t.description AS tour_description,
    t.location AS tour_location,
    t.duration AS tour_duration,
    t.price AS current_tour_price,
    DATE_FORMAT(ta.min_start_date, '%Y-%m-%d') AS min_start_date,
    DATE_FORMAT(ta.max_end_date, '%Y-%m-%d') AS max_end_date,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.contact_number AS user_contact_number
  FROM tour_bookings tb
  INNER JOIN tours t ON t.id = tb.tour_id
  INNER JOIN users u ON u.id = tb.user_id
  INNER JOIN tour_availability ta ON ta.tour_id = tb.tour_id
`

const travelerSelect = `
  SELECT traveler_id, booking_id, name, age, gender, contact_number
  FROM booking_travelers
  WHERE booking_id = ?
  ORDER BY traveler_id ASC
`

const escapeLike = (value) => String(value).replace(/[%_]/g, '\\$&')

const generateBookingId = () => `TB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

const parseDurationDays = (duration) => {
  const match = String(duration || '').match(/(\d+)/)
  const parsed = match ? Number(match[1]) : NaN
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const getTripLengthInDays = (startDate, endDate) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startDate || '')) || !/^\d{4}-\d{2}-\d{2}$/.test(String(endDate || ''))) {
    return null
  }
  const startUtc = new Date(`${startDate}T00:00:00Z`).getTime()
  const endUtc = new Date(`${endDate}T00:00:00Z`).getTime()
  if (Number.isNaN(startUtc) || Number.isNaN(endUtc) || endUtc < startUtc) {
    return null
  }
  return Math.floor((endUtc - startUtc) / 86400000) + 1
}

const readRows = async (executor, sql, params = []) => {
  if (executor?.execute) {
    const [rows] = await executor.execute(sql, params)
    return rows
  }
  return query(sql, params)
}

const attachTravelers = async (rows, executor = null) => {
  if (!rows.length) return []
  const travelerMap = new Map()
  await Promise.all(rows.map(async (row) => {
    const travelers = await readRows(executor, travelerSelect, [row.booking_id])
    travelerMap.set(row.booking_id, travelers)
  }))
  return rows.map((row) => ({
    ...row,
    travelers: travelerMap.get(row.booking_id) || [],
    primary_contact_person: row.primary_contact_name,
    primary_contact_phone: row.primary_contact_phone
  }))
}

const getBookingById = async (bookingId, executor = null) => {
  const rows = await readRows(executor, `${bookingSelect} WHERE tb.booking_id = ? LIMIT 1`, [bookingId])
  const [booking] = await attachTravelers(rows, executor)
  return booking || null
}

const getTourForUpdate = async (connection, tourId) => {
  const [rows] = await connection.execute(
    `SELECT
       t.id,
       t.title,
       t.description,
       t.location,
       t.duration,
       t.price,
       s.max_capacity,
       s.current_bookings,
       s.status,
       s.is_enabled,
       DATE_FORMAT(ta.min_start_date, '%Y-%m-%d') AS min_start_date,
       DATE_FORMAT(ta.max_end_date, '%Y-%m-%d') AS max_end_date
     FROM tours t
     INNER JOIN services s ON s.id = t.id AND s.service_type = 'tour'
     INNER JOIN tour_availability ta ON ta.tour_id = t.id
     WHERE t.id = ?
     LIMIT 1
     FOR UPDATE`,
    [tourId]
  )
  return rows[0] || null
}

export const tourBookingsModel = {
  async list(filters = {}, requestUser = null) {
    const clauses = []
    const params = []

    if (requestUser?.role !== 'admin') {
      clauses.push('tb.user_id = ?')
      params.push(Number(requestUser?.id))
    }
    if (filters.tourId) {
      clauses.push('tb.tour_id = ?')
      params.push(Number(filters.tourId))
    }
    if (filters.status) {
      clauses.push('tb.booking_status = ?')
      params.push(filters.status)
    }
    if (filters.startDate) {
      clauses.push('tb.start_date >= ?')
      params.push(filters.startDate)
    }
    if (filters.endDate) {
      clauses.push('tb.end_date <= ?')
      params.push(filters.endDate)
    }
    if (filters.search) {
      clauses.push('(t.title LIKE ? ESCAPE \'\\\\\' OR tb.booking_id LIKE ? ESCAPE \'\\\\\')')
      const pattern = `%${escapeLike(filters.search)}%`
      params.push(pattern, pattern)
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const rows = await query(`${bookingSelect} ${where} ORDER BY tb.created_at DESC`, params)
    return attachTravelers(rows)
  },

  async getByBookingId(bookingId) {
    return getBookingById(bookingId)
  },

  async create({ userId, tourId, startDate, endDate, totalPeople, travelers }) {
    return withTransaction(async (connection) => {
      const tour = await getTourForUpdate(connection, tourId)
      if (!tour) {
        throw new Error('Tour not found')
      }
      if (!tour.is_enabled || tour.status === 'closed') {
        throw new Error('Tour is currently unavailable')
      }
      if (startDate < String(tour.min_start_date) || endDate > String(tour.max_end_date)) {
        throw new Error('Selected dates fall outside the available range')
      }
      const maxTripDays = parseDurationDays(tour.duration)
      const tripLength = getTripLengthInDays(startDate, endDate)
      if (maxTripDays && tripLength && tripLength > maxTripDays) {
        throw new Error(`This tour can be booked for up to ${maxTripDays} day${maxTripDays > 1 ? 's' : ''}`)
      }

      const availableSlots = Number(tour.max_capacity) - Number(tour.current_bookings)
      if (Number(totalPeople) > availableSlots) {
        throw new Error(availableSlots > 0 ? `Only ${availableSlots} slots left` : 'Tour is fully booked')
      }

      const subtotal = Number(tour.price) * Number(totalPeople)
      const taxAmount = Number((subtotal * TAX_RATE).toFixed(2))
      const totalAmount = Number((subtotal + taxAmount).toFixed(2))
      const bookingId = generateBookingId()
      const primaryTraveler = travelers[0]

      await connection.execute(
        `INSERT INTO tour_bookings
           (booking_id, booking_reference, user_id, tour_id, start_date, end_date, total_people, price_per_person, tax_amount, total_amount, booking_status, primary_contact_name, primary_contact_phone, tour_name_snapshot, tour_description_snapshot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?)`,
        [
          bookingId,
          bookingId,
          Number(userId),
          Number(tourId),
          startDate,
          endDate,
          Number(totalPeople),
          Number(tour.price),
          taxAmount,
          totalAmount,
          primaryTraveler.name,
          primaryTraveler.contact_number,
          tour.title,
          tour.description || null
        ]
      )

      for (const traveler of travelers) {
        await connection.execute(
          `INSERT INTO booking_travelers (booking_id, name, age, gender, contact_number)
           VALUES (?, ?, ?, ?, ?)`,
          [bookingId, traveler.name, Number(traveler.age), traveler.gender, traveler.contact_number]
        )
      }

      const nextCurrent = Number(tour.current_bookings) + Number(totalPeople)
      const nextStatus = nextCurrent >= Number(tour.max_capacity)
        ? 'full'
        : (Number(tour.max_capacity) - nextCurrent <= 5 ? 'limited' : 'available')

      await connection.execute(
        `UPDATE services
         SET current_bookings = ?, status = ?
         WHERE id = ? AND service_type = 'tour'`,
        [nextCurrent, nextStatus, Number(tourId)]
      )

      return getBookingById(bookingId, connection)
    })
  },

  async updateStatus(bookingId, status) {
    return withTransaction(async (connection) => {
      const [bookingRows] = await connection.execute(
        `SELECT booking_id, tour_id, total_people, booking_status
         FROM tour_bookings
         WHERE booking_id = ?
         LIMIT 1
         FOR UPDATE`,
        [bookingId]
      )
      const booking = bookingRows[0]
      if (!booking) {
        return null
      }

      if (booking.booking_status !== status) {
        const tour = await getTourForUpdate(connection, booking.tour_id)
        if (!tour) {
          throw new Error('Tour not found')
        }

        const currentApplied = booking.booking_status === 'cancelled' ? 0 : Number(booking.total_people)
        const nextApplied = status === 'cancelled' ? 0 : Number(booking.total_people)
        const delta = nextApplied - currentApplied
        const availableSlots = Number(tour.max_capacity) - Number(tour.current_bookings)
        if (delta > availableSlots) {
          throw new Error('Tour does not have enough remaining capacity')
        }

        const nextCurrent = Math.max(0, Number(tour.current_bookings) + delta)
        const nextStatus = !tour.is_enabled || tour.status === 'closed'
          ? 'closed'
          : nextCurrent >= Number(tour.max_capacity)
            ? 'full'
            : (Number(tour.max_capacity) - nextCurrent <= 5 ? 'limited' : 'available')

        await connection.execute(
          `UPDATE services SET current_bookings = ?, status = ? WHERE id = ? AND service_type = 'tour'`,
          [nextCurrent, nextStatus, Number(booking.tour_id)]
        )
      }

      await connection.execute(
        `UPDATE tour_bookings SET booking_status = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`,
        [status, bookingId]
      )

      return getBookingById(bookingId, connection)
    })
  },

  async getInvoiceData(bookingId) {
    return this.getByBookingId(bookingId)
  }
}

export const tourBookingTaxRate = TAX_RATE
