import createServiceRoutes from './createServiceRoutes.js'
import { propertiesModel } from '../models/propertiesModel.js'
import { fallbackPropertiesModel } from '../models/fallbackModels.js'
import { isPositiveInteger, isPositiveNumber } from '../utils/validators.js'

const validateCreate = (body) => {
  if (!body.name || !body.location || body.pricePerNight === undefined) {
    return 'name, location and pricePerNight are required'
  }
  if (!isPositiveNumber(body.pricePerNight)) {
    return 'pricePerNight must be a non-negative number'
  }
  if (body.capacity !== undefined && !isPositiveInteger(body.capacity)) {
    return 'capacity must be a positive integer'
  }
  if (body.bedrooms !== undefined && !isPositiveInteger(body.bedrooms)) {
    return 'bedrooms must be a positive integer'
  }
  if (body.bathrooms !== undefined && !isPositiveInteger(body.bathrooms)) {
    return 'bathrooms must be a positive integer'
  }
  return null
}

const validateUpdate = (body) => {
  if (body.pricePerNight !== undefined && !isPositiveNumber(body.pricePerNight)) {
    return 'pricePerNight must be a non-negative number'
  }
  if (body.capacity !== undefined && !isPositiveInteger(body.capacity)) {
    return 'capacity must be a positive integer'
  }
  if (body.bedrooms !== undefined && !isPositiveInteger(body.bedrooms)) {
    return 'bedrooms must be a positive integer'
  }
  if (body.bathrooms !== undefined && !isPositiveInteger(body.bathrooms)) {
    return 'bathrooms must be a positive integer'
  }
  return null
}

const normalizePayload = (body) => ({
  name: body.name,
  location: body.location,
  pricePerNight: body.pricePerNight !== undefined ? Number(body.pricePerNight) : undefined,
  capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
  bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) : undefined,
  bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : undefined,
  imageUrl: body.imageUrl || null,
  description: body.description || null
})

export default createServiceRoutes({
  model: propertiesModel,
  fallbackModel: fallbackPropertiesModel,
  validateCreate,
  validateUpdate,
  normalizePayload
})
