import createServiceRoutes from './createServiceRoutes.js'
import { restaurantsModel } from '../models/restaurantsModel.js'
import { fallbackRestaurantsModel } from '../models/fallbackModels.js'

const validateCreate = (body) => {
  if (!body.name || !body.cuisineType || !body.location || !body.priceRange) {
    return 'name, cuisineType, location and priceRange are required'
  }
  if (body.rating !== undefined) {
    const rating = Number(body.rating)
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return 'rating must be between 0 and 5'
    }
  }
  return null
}

const validateUpdate = (body) => {
  if (body.rating !== undefined) {
    const rating = Number(body.rating)
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return 'rating must be between 0 and 5'
    }
  }
  return null
}

const normalizePayload = (body) => ({
  name: body.name,
  cuisineType: body.cuisineType,
  location: body.location,
  priceRange: body.priceRange,
  rating: body.rating !== undefined ? Number(body.rating) : null,
  description: body.description || null,
  imageUrl: body.imageUrl || null
})

export default createServiceRoutes({
  model: restaurantsModel,
  fallbackModel: fallbackRestaurantsModel,
  validateCreate,
  validateUpdate,
  normalizePayload
})
