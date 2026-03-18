import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get all orders (admin only)
router.get('/admin', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  // Return empty array - orders feature not implemented
  res.json({ success: true, data: [] })
}))

// Get all invoices (admin only)
router.get('/invoices', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  // Return empty array - invoices feature not implemented
  res.json({ success: true, data: [] })
}))

// Get invoice by order ID
router.get('/:id/invoice', requireAuth, asyncHandler(async (req, res) => {
  return res.status(404).json({ success: false, message: 'Invoice not found' })
}))

// Email invoice
router.post('/:id/invoice/email', requireAuth, asyncHandler(async (req, res) => {
  return res.status(404).json({ success: false, message: 'Invoice not found' })
}))

export default router
