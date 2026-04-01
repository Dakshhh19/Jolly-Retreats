import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { servicesModel } from '../models/servicesModel.js'
import { validServiceTypes } from '../utils/validators.js'

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const serviceType = req.query.serviceType ? String(req.query.serviceType) : null
  const status = req.query.status ? String(req.query.status) : null
  const includeClosed = String(req.query.includeClosed || 'false') === 'true'

  if (serviceType && !validServiceTypes.has(serviceType)) {
    return res.status(400).json({ success: false, message: 'Invalid serviceType filter' })
  }

  const data = await servicesModel.getAll({ serviceType, status, includeClosed })
  return res.json({ success: true, data })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const serviceType = req.query.serviceType ? String(req.query.serviceType) : null
  const data = await servicesModel.getById(req.params.id, serviceType)
  if (!data) {
    return res.status(404).json({ success: false, message: 'Service not found' })
  }
  return res.json({ success: true, data })
}))

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!req.body.serviceType || !validServiceTypes.has(String(req.body.serviceType))) {
    return res.status(400).json({ success: false, message: 'Invalid serviceType' })
  }
  const data = await servicesModel.create(req.body)
  return res.status(201).json({ success: true, data })
}))

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (req.body.serviceType !== undefined && !validServiceTypes.has(String(req.body.serviceType))) {
    return res.status(400).json({ success: false, message: 'Invalid serviceType' })
  }
  const data = await servicesModel.updateById(req.params.id, req.body)
  if (!data) {
    return res.status(404).json({ success: false, message: 'Service not found' })
  }
  return res.json({ success: true, data })
}))

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const deleted = await servicesModel.deleteById(req.params.id)
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Service not found' })
  }
  return res.json({ success: true, message: 'Service deleted successfully' })
}))

export default router
