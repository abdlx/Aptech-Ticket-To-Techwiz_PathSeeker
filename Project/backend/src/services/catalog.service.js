import { Career, Domain, Skill } from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'

export async function listDomains() {
  return Domain.find({ active: true }).sort({ sortOrder: 1, name: 1 })
}

export async function listSkills({ category } = {}) {
  const filter = { active: true }
  if (category) filter.category = category
  return Skill.find(filter).sort({ name: 1 })
}

// Resolves comma-separated domain/skill slugs from the query string into
// ObjectIds. Unknown slugs are silently ignored so a typo just narrows the
// result set to nothing instead of throwing.
async function resolveSlugsToIds(Model, slugsParam) {
  if (!slugsParam) return []
  const slugs = slugsParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (slugs.length === 0) return []
  const docs = await Model.find({ slug: { $in: slugs } }).select('_id')
  return docs.map((doc) => doc._id)
}

const SORTS = {
  relevance: { title: 1 },
  salary: { 'expectedSalary.max': -1 },
  growth: { growthRatePercent: -1 },
}

export async function listCareers({ q, domain, skill, demand, salaryMin, sort = 'relevance', page, limit, skip }) {
  const filter = { active: true }

  const domainIds = await resolveSlugsToIds(Domain, domain)
  if (domain) filter.domainId = { $in: domainIds }

  const skillIds = await resolveSlugsToIds(Skill, skill)
  if (skill) filter['requiredSkills.skillId'] = { $in: skillIds }

  if (demand) filter.demand = demand

  if (salaryMin) {
    filter['expectedSalary.max'] = { $gte: Number(salaryMin) }
  }

  if (q) {
    filter.$text = { $search: q }
  }

  const sortSpec = q && sort === 'relevance' ? { score: { $meta: 'textScore' } } : SORTS[sort] || SORTS.relevance
  const projection = q && sort === 'relevance' ? { score: { $meta: 'textScore' } } : undefined

  const [careers, total] = await Promise.all([
    Career.find(filter, projection)
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .populate('domainId', 'name slug')
      .populate('requiredSkills.skillId', 'name slug category'),
    Career.countDocuments(filter),
  ])

  return { careers, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getCareerBySlug(slug) {
  return Career.findOne({ slug: slug.trim().toLowerCase(), active: true })
    .populate('domainId', 'name slug')
    .populate('requiredSkills.skillId', 'name slug category')
}

export default { listDomains, listSkills, listCareers, getCareerBySlug }