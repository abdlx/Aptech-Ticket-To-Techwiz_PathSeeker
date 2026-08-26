import * as dashboardService from '../services/dashboard.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard(req.user)
  res.status(200).json({ data: { dashboard } })
})

export default { getDashboard }
