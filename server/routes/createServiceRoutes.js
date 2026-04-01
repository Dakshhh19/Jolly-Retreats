import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { isDbConnected } from '../config/runtime.js'
import { isPositiveInteger } from '../utils/validators.js'

const createServiceRoutes = ({
  model,
  fallbackModel,
  validateCreate,
  validateUpdate,
  normalizePayload
}) => {
  const router = express.Router()
  const getModel = () => (isDbConnected() ? model : fallbackModel)
  const normalizeWithCapacity = (payload) => {
    const normalized = normalizePayload(payload)
    if (payload.maxCapacity !== undefined) normalized.maxCapacity = Number(payload.maxCapacity)
    if (payload.status !== undefined) normalized.status = payload.status
    if (payload.isEnabled !== undefined) normalized.isEnabled = Boolean(payload.isEnabled)
    return normalized
  }

  router.get('/', asyncHandler(async (req, res) => {
    const data = await getModel().getAll()
    res.json({ success: true, data })
  }))

  router.get('/:id', asyncHandler(async (req, res) => {
    const item = await getModel().getById(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Record not found' })
    }

    return res.json({ success: true, data: item })
  }))

  router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    if (req.body.maxCapacity !== undefined && !isPositiveInteger(req.body.maxCapacity)) {
      return res.status(400).json({ success: false, message: 'maxCapacity must be a positive integer' })
    }

    const validationError = validateCreate(req.body)
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError })
    }

    const data = await getModel().create(normalizeWithCapacity(req.body))
    return res.status(201).json({ success: true, data })
  }))

  router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const activeModel = getModel()
    const existing = await activeModel.getById(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found' })
    }

    if (req.body.maxCapacity !== undefined && !isPositiveInteger(req.body.maxCapacity)) {
      return res.status(400).json({ success: false, message: 'maxCapacity must be a positive integer' })
    }

    const validationError = validateUpdate(req.body)
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError })
    }

    const data = await activeModel.updateById(req.params.id, normalizeWithCapacity(req.body))
    return res.json({ success: true, data })
  }))

  router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await getModel().deleteById(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' })
    }

    return res.json({ success: true, message: 'Deleted successfully' })
  }))

  return router
}

export default createServiceRoutes
