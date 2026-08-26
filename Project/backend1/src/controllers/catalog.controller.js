import * as catalogService from '../services/catalog.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parsePagination } from '../utils/pagination.js'
import { CAREER_DEMAND_LEVELS, SKILL_CATEGORIES } from '../constants/database.js'

export const getDomains = asyncHandler(async (_req, res) => {
  const domains = await catalogService.listDomains()
  res.status(200).json({ data: { domains } })
})

export const getSkills = asyncHandler(async (req, res) => {
  const { category } = req.query
  if (category && !SKILL_CATEGORIES.includes(category)) {
    throw new AppError(400, `category must be one of: ${SKILL_CATEGORIES.join(', ')}`, 'VALIDATION_ERROR')
  }

  const skills = await catalogService.listSkills({ category })
  res.status(200).json({ data: { skills } })
})

export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await catalogService.searchSuggestions(req.query.q)
  res.status(200).json({ data: { suggestions } })
})

export const getCareers = asyncHandler(async (req, res) => {
  const { q, domain, skill, demand, salaryMin, sort } = req.query

  if (demand && !CAREER_DEMAND_LEVELS.includes(demand)) {
    throw new AppError(400, `demand must be one of: ${CAREER_DEMAND_LEVELS.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (sort && !['relevance', 'salary', 'growth'].includes(sort)) {
    throw new AppError(400, 'sort must be one of: relevance, salary, growth', 'VALIDATION_ERROR')
  }
  if (salaryMin && Number.isNaN(Number(salaryMin))) {
    throw new AppError(400, 'salaryMin must be a number', 'VALIDATION_ERROR')
  }

  const { page, limit, skip } = parsePagination(req.query)

  const { careers, meta } = await catalogService.listCareers({
    q,
    domain,
    skill,
    demand,
    salaryMin,
    sort,
    page,
    limit,
    skip,
  })

  res.status(200).json({ data: { careers, meta } })
})

export const getCareerBySlug = asyncHandler(async (req, res) => {
  const career = await catalogService.getCareerBySlug(req.params.slug)
  if (!career) {
    throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  }
  res.status(200).json({ data: { career } })
})

export const getRelatedCareers = asyncHandler(async (req, res) => {
  const careers = await catalogService.getRelatedCareers(req.params.slug, Number(req.query.limit) || 4)
  if (!careers) throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  res.status(200).json({ data: { careers } })
})

export const getRelatedContent = asyncHandler(async (req, res) => {
  const content = await catalogService.getRelatedContent(req.params.slug, Number(req.query.limit) || 6)
  if (!content) throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  res.status(200).json({ data: content })
})

export default {
  getDomains,
  getSkills,
  getSearchSuggestions,
  getCareers,
  getCareerBySlug,
  getRelatedCareers,
  getRelatedContent,
}
