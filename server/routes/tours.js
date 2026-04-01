import createServiceRoutes from './createServiceRoutes.js'
import { toursModel } from '../models/toursModel.js'
import { fallbackToursModel } from '../models/fallbackTourModels.js'
import { isPositiveInteger, isPositiveNumber } from '../utils/validators.js'

const hasValidDateRange = (minStartDate, maxEndDate) => {
  if (!minStartDate || !maxEndDate) return false
  return String(maxEndDate) >= String(minStartDate)
}

const validateCreate = (body) => {
  if (!body.title || !body.location || body.price === undefined || !body.duration || !body.minStartDate || !body.maxEndDate) {
    return 'title, location, price, duration, minStartDate and maxEndDate are required'
  }
  if (!isPositiveNumber(body.price)) {
    return 'price must be a non-negative number'
  }
  if (body.maxCapacity !== undefined && !isPositiveInteger(body.maxCapacity)) {
    return 'maxCapacity must be a positive integer'
  }
  if (!hasValidDateRange(body.minStartDate, body.maxEndDate)) {
    return 'maxEndDate must be on or after minStartDate'
  }
  return null
}

const validateUpdate = (body) => {
  if (body.price !== undefined && !isPositiveNumber(body.price)) {
    return 'price must be a non-negative number'
  }
  if (body.maxCapacity !== undefined && !isPositiveInteger(body.maxCapacity)) {
    return 'maxCapacity must be a positive integer'
  }
  if ((body.minStartDate !== undefined && body.maxEndDate === undefined) || (body.maxEndDate !== undefined && body.minStartDate === undefined)) {
    return 'minStartDate and maxEndDate must be provided together'
  }
  if ((body.minStartDate !== undefined || body.maxEndDate !== undefined) && !hasValidDateRange(body.minStartDate, body.maxEndDate)) {
    return 'maxEndDate must be on or after minStartDate'
  }
  return null
}

const normalizePayload = (body) => ({
  title: body.title,
  description: body.description || null,
  location: body.location,
  price: body.price !== undefined ? Number(body.price) : undefined,
  duration: body.duration,
  maxCapacity: body.maxCapacity !== undefined ? Number(body.maxCapacity) : undefined,
  imageUrl: body.imageUrl || null,
  minStartDate: body.minStartDate,
  maxEndDate: body.maxEndDate
})

export default createServiceRoutes({
  model: toursModel,
  fallbackModel: fallbackToursModel,
  validateCreate,
  validateUpdate,
  normalizePayload
})
