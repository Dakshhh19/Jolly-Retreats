import createServiceRoutes from './createServiceRoutes.js'
import { treksModel } from '../models/treksModel.js'
import { fallbackTreksModel } from '../models/fallbackModels.js'
import { isPositiveNumber } from '../utils/validators.js'

const validDifficultyLevels = new Set(['easy', 'moderate', 'hard', 'extreme'])

const validateCreate = (body) => {
  if (!body.title || !body.difficultyLevel || !body.location || !body.duration || body.price === undefined) {
    return 'title, difficultyLevel, location, duration and price are required'
  }
  if (!validDifficultyLevels.has(body.difficultyLevel)) {
    return 'difficultyLevel must be one of: easy, moderate, hard, extreme'
  }
  if (!isPositiveNumber(body.price)) {
    return 'price must be a non-negative number'
  }
  return null
}

const validateUpdate = (body) => {
  if (body.difficultyLevel !== undefined && !validDifficultyLevels.has(body.difficultyLevel)) {
    return 'difficultyLevel must be one of: easy, moderate, hard, extreme'
  }
  if (body.price !== undefined && !isPositiveNumber(body.price)) {
    return 'price must be a non-negative number'
  }
  return null
}

const normalizePayload = (body) => ({
  title: body.title,
  difficultyLevel: body.difficultyLevel,
  location: body.location,
  duration: body.duration,
  price: body.price !== undefined ? Number(body.price) : undefined,
  description: body.description || null,
  imageUrl: body.imageUrl || null
})

export default createServiceRoutes({
  model: treksModel,
  fallbackModel: fallbackTreksModel,
  validateCreate,
  validateUpdate,
  normalizePayload
})
