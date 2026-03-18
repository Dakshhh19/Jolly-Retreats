import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth, requireUser } from '../middleware/auth.js'
import { bookingsModel } from '../models/bookingsModel.js'
import { fallbackBookingsModel } from '../models/fallbackModels.js'
import { isDbConnected } from '../config/runtime.js'
import {
  isPositiveInteger,
  validBookingStatuses,
  validServiceTypes
} from '../utils/validators.js'

const router = express.Router()
const getBookingsStore = () => (isDbConnected() ? bookingsModel : fallbackBookingsModel)

const canAccessBooking = (requestUser, bookingUserId) => {
  return requestUser.role === 'admin' || Number(requestUser.id) === Number(bookingUserId)
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const bookingsStore = getBookingsStore()
  const data = req.user.role === 'admin'
    ? await bookingsStore.getAll()
    : await bookingsStore.getByUserId(req.user.id)

  res.json({ success: true, data })
}))

router.get('/service/:serviceId', requireAuth, asyncHandler(async (req, res) => {
  const serviceId = Number(req.params.serviceId)
  if (!isPositiveInteger(serviceId)) {
    return res.status(400).json({ success: false, message: 'serviceId must be a positive integer' })
  }
  const serviceType = req.query.serviceType ? String(req.query.serviceType) : null
  if (serviceType && !validServiceTypes.has(serviceType)) {
    return res.status(400).json({ success: false, message: 'Invalid serviceType' })
  }

  const data = await getBookingsStore().getByServiceId(serviceId, serviceType)
  return res.json({ success: true, data })
}))

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const bookingsStore = getBookingsStore()
  const booking = await bookingsStore.getById(req.params.id)
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' })
  }

  if (!canAccessBooking(req.user, booking.user_id)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  return res.json({ success: true, data: booking })
}))

router.post('/', requireAuth, requireUser, asyncHandler(async (req, res) => {
  const {
    serviceType,
    serviceId,
    bookingCount = 1,
    bookingDate,
    status,
    serviceName,
    serviceDescription,
    serviceLocation,
    servicePrice
  } = req.body

  if (!serviceType || serviceId === undefined || !bookingDate) {
    return res.status(400).json({
      success: false,
      message: 'serviceType, serviceId and bookingDate are required'
    })
  }
  if (!validServiceTypes.has(serviceType)) {
    return res.status(400).json({ success: false, message: 'Invalid serviceType' })
  }
  if (!isPositiveInteger(serviceId)) {
    return res.status(400).json({ success: false, message: 'serviceId must be a positive integer' })
  }
  if (!isPositiveInteger(bookingCount)) {
    return res.status(400).json({ success: false, message: 'bookingCount must be a positive integer' })
  }
  if (status !== undefined && !validBookingStatuses.has(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status' })
  }

  try {
    const booking = await getBookingsStore().create({
      userId: Number(req.user.id),
      serviceType,
      serviceId: Number(serviceId),
      bookingCount: Number(bookingCount),
      bookingDate,
      status: status || 'pending',
      serviceName: serviceName ? String(serviceName) : undefined,
      serviceDescription: serviceDescription ? String(serviceDescription) : undefined,
      serviceLocation: serviceLocation ? String(serviceLocation) : undefined,
      servicePrice: servicePrice !== undefined && servicePrice !== null ? Number(servicePrice) : undefined
    })
    res.status(201).json({ success: true, data: booking })
  } catch (error) {
    return res.status(409).json({ success: false, message: error.message || 'Service full' })
  }
}))

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const bookingsStore = getBookingsStore()
  const booking = await bookingsStore.getById(req.params.id)
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' })
  }
  if (!canAccessBooking(req.user, booking.user_id)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  const { bookingDate, status, bookingCount } = req.body
  if (status !== undefined && !validBookingStatuses.has(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status' })
  }
  if (bookingCount !== undefined && !isPositiveInteger(bookingCount)) {
    return res.status(400).json({ success: false, message: 'bookingCount must be a positive integer' })
  }

  try {
    const updated = await bookingsStore.updateById(req.params.id, {
      bookingDate,
      status,
      bookingCount
    })
    return res.json({ success: true, data: updated })
  } catch (error) {
    return res.status(409).json({ success: false, message: error.message || 'Unable to update booking' })
  }
}))

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const bookingsStore = getBookingsStore()
  const booking = await bookingsStore.getById(req.params.id)
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' })
  }
  if (!canAccessBooking(req.user, booking.user_id)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  await bookingsStore.deleteById(req.params.id)
  return res.json({ success: true, message: 'Booking deleted successfully' })
}))

export default router
