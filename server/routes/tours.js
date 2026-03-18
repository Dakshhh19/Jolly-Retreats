import createServiceRoutes from './createServiceRoutes.js'
import { toursModel } from '../models/toursModel.js'
import { fallbackToursModel } from '../models/fallbackModels.js'
import { isPositiveNumber } from '../utils/validators.js'

const validateCreate = (body) => {
  if (!body.title || !body.location || body.price === undefined || !body.duration) {
    return 'title, location, price and duration are required'
  }
  if (!isPositiveNumber(body.price)) {
    return 'price must be a non-negative number'
  }
  return null
}

const validateUpdate = (body) => {
  if (body.price !== undefined && !isPositiveNumber(body.price)) {
    return 'price must be a non-negative number'
  }
  return null
}

const normalizePayload = (body) => ({
  title: body.title,
  description: body.description || null,
  location: body.location,
  price: body.price !== undefined ? Number(body.price) : undefined,
  duration: body.duration,
  imageUrl: body.imageUrl || null
})

export default createServiceRoutes({
  model: toursModel,
  fallbackModel: fallbackToursModel,
  validateCreate,
  validateUpdate,
  normalizePayload
})
