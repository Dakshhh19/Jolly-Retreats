import createServiceRoutes from './createServiceRoutes.js'
import { carRentalsModel } from '../models/carRentalsModel.js'
import { fallbackCarRentalsModel } from '../models/fallbackModels.js'
import { isPositiveInteger, isPositiveNumber } from '../utils/validators.js'

const validateCreate = (body) => {
  if (!body.carName || !body.company || body.pricePerDay === undefined || !body.location || body.seats === undefined || !body.fuelType) {
    return 'carName, company, pricePerDay, location, seats and fuelType are required'
  }
  if (!isPositiveNumber(body.pricePerDay)) {
    return 'pricePerDay must be a non-negative number'
  }
  if (!isPositiveInteger(body.seats)) {
    return 'seats must be a positive integer'
  }
  return null
}

const validateUpdate = (body) => {
  if (body.pricePerDay !== undefined && !isPositiveNumber(body.pricePerDay)) {
    return 'pricePerDay must be a non-negative number'
  }
  if (body.seats !== undefined && !isPositiveInteger(body.seats)) {
    return 'seats must be a positive integer'
  }
  return null
}

const normalizePayload = (body) => ({
  carName: body.carName,
  company: body.company,
  pricePerDay: body.pricePerDay !== undefined ? Number(body.pricePerDay) : undefined,
  location: body.location,
  seats: body.seats !== undefined ? Number(body.seats) : undefined,
  fuelType: body.fuelType,
  imageUrl: body.imageUrl || null
})

export default createServiceRoutes({
  model: carRentalsModel,
  fallbackModel: fallbackCarRentalsModel,
  validateCreate,
  validateUpdate,
  normalizePayload
})
