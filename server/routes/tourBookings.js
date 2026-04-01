import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth, requireAdmin, requireUser } from '../middleware/auth.js'
import { isDbConnected } from '../config/runtime.js'
import { tourBookingsModel } from '../models/tourBookingsModel.js'
import { fallbackTourBookingsModel } from '../models/fallbackTourModels.js'
import { buildTourInvoicePdf } from '../utils/pdfInvoice.js'
import { isPositiveInteger, isValidPhoneNumber, normalizePhoneNumber, normalizeWhitespace } from '../utils/validators.js'

const router = express.Router()
const store = () => (isDbConnected() ? tourBookingsModel : fallbackTourBookingsModel)
const validStatuses = new Set(['confirmed', 'cancelled'])
const validGenders = new Set(['Male', 'Female', 'Other'])
const validName = /^[A-Za-z\s]+$/
const validDate = /^\d{4}-\d{2}-\d{2}$/

const ensureOwnerOrAdmin = (req, booking) => req.user.role === 'admin' || Number(req.user.id) === Number(booking.user_id)

const validateTraveler = (traveler, index) => {
  const name = normalizeWhitespace(traveler?.name || '')
  if (!name || !validName.test(name)) {
    return `Traveler ${index + 1}: name is required and must contain letters only`
  }
  const age = Number(traveler?.age)
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return `Traveler ${index + 1}: age must be a whole number between 1 and 120`
  }
  if (!validGenders.has(String(traveler?.gender || ''))) {
    return `Traveler ${index + 1}: gender is required`
  }
  const contact = normalizePhoneNumber(traveler?.contactNumber || traveler?.contact_number || '')
  if (!isValidPhoneNumber(contact)) {
    return `Traveler ${index + 1}: contact number must include country code`
  }
  return null
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const data = await store().list({
    tourId: req.query.tourId ? Number(req.query.tourId) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
    startDate: req.query.startDate ? String(req.query.startDate) : undefined,
    endDate: req.query.endDate ? String(req.query.endDate) : undefined,
    search: req.query.search ? String(req.query.search) : undefined
  }, req.user)
  res.json({ success: true, data })
}))

router.get('/:bookingId', requireAuth, asyncHandler(async (req, res) => {
  const booking = await store().getByBookingId(req.params.bookingId)
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' })
  }
  if (!ensureOwnerOrAdmin(req, booking)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  res.json({ success: true, data: booking })
}))

router.post('/', requireAuth, requireUser, asyncHandler(async (req, res) => {
  const {
    tourId,
    startDate,
    endDate,
    totalPeople,
    travelers
  } = req.body

  if (!isPositiveInteger(tourId)) {
    return res.status(400).json({ success: false, message: 'tourId must be a positive integer' })
  }
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'startDate and endDate are required' })
  }
  if (!validDate.test(String(startDate)) || !validDate.test(String(endDate))) {
    return res.status(400).json({ success: false, message: 'startDate and endDate must use YYYY-MM-DD format' })
  }
  if (!isPositiveInteger(totalPeople)) {
    return res.status(400).json({ success: false, message: 'totalPeople must be a positive integer' })
  }
  if (!Array.isArray(travelers) || travelers.length !== Number(totalPeople)) {
    return res.status(400).json({ success: false, message: 'Traveler details are required for each person' })
  }
  if (endDate < startDate) {
    return res.status(400).json({ success: false, message: 'endDate must be on or after startDate' })
  }

  for (let index = 0; index < travelers.length; index += 1) {
    const error = validateTraveler(travelers[index], index)
    if (error) {
      return res.status(400).json({ success: false, message: error })
    }
  }

  try {
    const booking = await store().create({
      userId: Number(req.user.id),
      tourId: Number(tourId),
      startDate: String(startDate),
      endDate: String(endDate),
      totalPeople: Number(totalPeople),
      travelers: travelers.map((traveler) => ({
        name: normalizeWhitespace(traveler.name),
        age: Number(traveler.age),
        gender: traveler.gender,
        contact_number: normalizePhoneNumber(traveler.contactNumber || traveler.contact_number)
      }))
    })
    res.status(201).json({ success: true, data: booking })
  } catch (error) {
    res.status(409).json({ success: false, message: error.message || 'Unable to create booking' })
  }
}))

router.put('/:bookingId/status', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const status = String(req.body?.status || '')
  if (!validStatuses.has(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status' })
  }
  try {
    const updated = await store().updateStatus(req.params.bookingId, status)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(409).json({ success: false, message: error.message || 'Unable to update booking status' })
  }
}))

router.get('/:bookingId/invoice', requireAuth, asyncHandler(async (req, res) => {
  const booking = await store().getInvoiceData(req.params.bookingId)
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' })
  }
  if (!ensureOwnerOrAdmin(req, booking)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  const pdf = buildTourInvoicePdf(booking)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${booking.booking_id}.pdf"`)
  res.setHeader('Content-Length', pdf.length)
  res.send(pdf)
}))

export default router
