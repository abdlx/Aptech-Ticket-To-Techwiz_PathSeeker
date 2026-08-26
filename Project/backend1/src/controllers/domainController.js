import { Domain } from '../models/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/domains
export const listDomains = asyncHandler(async (req, res) => {
  const domains = await Domain.find({ active: true }).sort({ sortOrder: 1, name: 1 })
  res.status(200).json({ domains })
})