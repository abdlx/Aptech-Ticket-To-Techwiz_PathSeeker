import mongoose from 'mongoose'
import * as careerIntelligenceService from '../services/careerIntelligence.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getPassport = asyncHandler(async (req, res) => {
  const { passport } = await careerIntelligenceService.getLatestCareerIntelligence(req.user.id)
  res.status(200).json({ data: { passport } })
})

export const getRecommendations = asyncHandler(async (req, res) => {
  const { passport, snapshot } = await careerIntelligenceService.getLatestCareerIntelligence(req.user.id)
  res.status(200).json({ data: { passport, recommendationSnapshot: snapshot, matches: snapshot?.matches || [] } })
})

export const getCareerIntelligence = asyncHandler(async (req, res) => {
  const { passport, snapshot } = await careerIntelligenceService.getLatestCareerIntelligence(req.user.id)
  const match = snapshot?.matches?.find(({ careerId }) => careerId?.slug === req.params.slug.toLowerCase())
  if (!match) throw new AppError(404, 'This career is not present in your latest recommendation snapshot.', 'MATCH_NOT_FOUND')
  res.status(200).json({ data: { passport, match } })
})

export const simulateCareer = asyncHandler(async (req, res) => {
  const { adjustments } = req.body
  if (!Array.isArray(adjustments) || adjustments.length < 1 || adjustments.length > 20) {
    throw new AppError(400, 'adjustments must contain between 1 and 20 skill changes.', 'VALIDATION_ERROR')
  }
  const normalized = adjustments.map(({ skillId, level }) => {
    if (!mongoose.isValidObjectId(skillId) || !Number.isFinite(Number(level)) || Number(level) < 0 || Number(level) > 10) {
      throw new AppError(400, 'Each adjustment needs a valid skillId and a level from 0 to 10.', 'VALIDATION_ERROR')
    }
    return { skillId, level: Number(level) }
  })
  const simulation = await careerIntelligenceService.simulateCareer(req.user.id, req.params.slug, normalized)
  res.status(200).json({ data: { simulation } })
})

export default { getPassport, getRecommendations, getCareerIntelligence, simulateCareer }
