import { Career, Domain, SavedSearch, Skill } from '../models/index.js'
import { AppError } from '../utils/appError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { CAREER_DEMAND_LEVELS } from '../constants/database.js'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 50

const SORT_OPTIONS = {
  salary_desc: { salaryMax: -1 },
  salary_asc: { salaryMin: 1 },
  growth_desc: { growthPercent: -1 },
  newest: { createdAt: -1 },
}

// GET /api/careers
// Query params: q, domain (slug), skill (slug, repeatable), demand, salaryMin, salaryMax, sort, page, pageSize
export const listCareers = asyncHandler(async (req, res) => {
  const { q, domain, skill, demand, salaryMin, salaryMax, sort, page = 1, pageSize = DEFAULT_PAGE_SIZE } = req.query

  const filter = { active: true }

  if (domain) {
    const domainDoc = await Domain.findOne({ slug: domain.toLowerCase(), active: true })
    if (!domainDoc) {
      return res.status(200).json({ careers: [], total: 0, page: Number(page), pageSize: Number(pageSize) })
    }
    filter.domainId = domainDoc._id
  }

  if (skill) {
    const skillSlugs = Array.isArray(skill) ? skill : [skill]
    const skillDocs = await Skill.find({ slug: { $in: skillSlugs.map((value) => value.toLowerCase()) } })
    if (skillDocs.length === 0) {
      return res.status(200).json({ careers: [], total: 0, page: Number(page), pageSize: Number(pageSize) })
    }
    filter.requiredSkillIds = { $in: skillDocs.map((doc) => doc._id) }
  }

  if (demand) {
    if (!CAREER_DEMAND_LEVELS.includes(demand)) {
      throw new AppError(`demand must be one of: ${CAREER_DEMAND_LEVELS.join(', ')}`, 400)
    }
    filter.demand = demand
  }

  // A career "matches" a salary search if its range overlaps the searcher's range.
  if (salaryMin) {
    filter.salaryMax = { $gte: Number(salaryMin) }
  }
  if (salaryMax) {
    filter.salaryMin = { $lte: Number(salaryMax) }
  }

  if (q) {
    filter.$text = { $search: q }
  }

  const sortOption = SORT_OPTIONS[sort] || (q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
  const projection = q ? { score: { $meta: 'textScore' } } : {}

  const pageNumber = Math.max(1, Number(page) || 1)
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE))
  const skip = (pageNumber - 1) * limit

  const [careers, total] = await Promise.all([
    Career.find(filter, projection)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('domainId', 'name slug icon')
      .populate('requiredSkillIds', 'name slug category'),
    Career.countDocuments(filter),
  ])

  res.status(200).json({ careers, total, page: pageNumber, pageSize: limit })
})

// GET /api/careers/search?q=de
// Lightweight autocomplete: title-prefix match + "contains" fallback on title/tags.
// Note: SRS mentions ElasticSearch "or similar" for this — ElasticSearch was not
// set up for this project, so this uses MongoDB regex matching as the "or similar"
// substitute. Documented in the handover notes below.
export const searchCareerSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ suggestions: [] })
  }

  const trimmed = q.trim()
  const prefixRegex = new RegExp(`^${trimmed}`, 'i')
  const containsRegex = new RegExp(trimmed, 'i')

  const suggestions = await Career.find({
    active: true,
    $or: [{ title: prefixRegex }, { title: containsRegex }, { tags: containsRegex }],
  })
    .select('title slug icon')
    .limit(8)

  res.status(200).json({ suggestions })
})

// GET /api/careers/:slug
export const getCareerBySlug = asyncHandler(async (req, res) => {
  const career = await Career.findOne({ slug: req.params.slug, active: true })
    .populate('domainId', 'name slug icon')
    .populate('requiredSkillIds', 'name slug category')

  if (!career) {
    throw new AppError('Career not found.', 404)
  }

  res.status(200).json({ career })
})

// GET /api/careers/saved-searches
export const listSavedSearches = asyncHandler(async (req, res) => {
  const savedSearches = await SavedSearch.find({ userId: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json({ savedSearches })
})

// POST /api/careers/saved-searches
export const createSavedSearch = asyncHandler(async (req, res) => {
  const { label, filters } = req.body
  const savedSearch = await SavedSearch.create({ userId: req.user._id, label, filters: filters || {} })
  res.status(201).json({ message: 'Search saved.', savedSearch })
})

// DELETE /api/careers/saved-searches/:id
export const deleteSavedSearch = asyncHandler(async (req, res) => {
  const savedSearch = await SavedSearch.findOneAndDelete({ _id: req.params.id, userId: req.user._id })

  if (!savedSearch) {
    throw new AppError('Saved search not found.', 404)
  }

  res.status(200).json({ message: 'Saved search deleted.' })
})