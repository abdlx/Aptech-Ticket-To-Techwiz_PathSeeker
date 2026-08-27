import { Career, Domain, Skill, Multimedia, Resource } from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'

const publishedCareer = { $or: [{ status: 'published' }, { status: { $exists: false }, active: true }] }
const publishedContent = { $or: [{ status: 'published' }, { status: { $exists: false }, active: true }] }

export async function listDomains() {
  return Domain.find({ active: true }).sort({ sortOrder: 1, name: 1 })
}

export async function listSkills({ category } = {}) {
  const filter = { active: true }
  if (category) filter.category = category
  return Skill.find(filter).sort({ name: 1 })
}

async function resolveSlugsToIds(Model, slugsParam) {
  if (!slugsParam) return []
  const values = slugsParam.split(',').map((s) => s.trim()).filter(Boolean)
  if (!values.length) return []
  const slugValues = values.map((value) => value.toLowerCase())
  const objectIds = values.filter((value) => /^[a-f0-9]{24}$/i.test(value))
  const clauses = [{ slug: { $in: slugValues } }]
  if (objectIds.length) clauses.push({ _id: { $in: objectIds } })
  const docs = await Model.find({ $or: clauses }).select('_id')
  return docs.map((doc) => doc._id)
}

const SORTS = {
  relevance: { title: 1 },
  salary: { 'expectedSalary.median': -1 },
  growth: { growthRatePercent: -1 },
}

export async function listCareers({ q, domain, skill, demand, salaryMin, sort = 'relevance', page, limit, skip }) {
  const filter = { ...publishedCareer }
  const domainIds = await resolveSlugsToIds(Domain, domain)
  if (domain) filter.domainId = { $in: domainIds }
  const skillIds = await resolveSlugsToIds(Skill, skill)
  if (skill) filter['requiredSkills.skillId'] = { $in: skillIds }
  if (demand) filter.demand = demand
  if (salaryMin) filter['expectedSalary.median'] = { $gte: Number(salaryMin) }
  if (q) filter.$text = { $search: q }

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
  const value = String(slug || '').trim()
  const filter = /^[a-f0-9]{24}$/i.test(value)
    ? { _id: value, ...publishedCareer }
    : { slug: value.toLowerCase(), ...publishedCareer }
  return Career.findOne(filter)
    .populate('domainId', 'name slug')
    .populate('requiredSkills.skillId', 'name slug category')
}

export async function getRelatedCareers(slug, limit = 4) {
  const career = await getCareerBySlug(slug)
  if (!career) return null
  return Career.find({
    _id: { $ne: career._id },
    $and: [
      publishedCareer,
      {
        $or: [
          { domainId: career.domainId?._id || career.domainId },
          ...(career.tags?.length ? [{ tags: { $in: career.tags.slice(0, 6) } }] : []),
          ...(career.requiredSkills?.length
            ? [
                {
                  'requiredSkills.skillId': {
                    $in: career.requiredSkills.slice(0, 5).map((item) => item.skillId?._id || item.skillId),
                  },
                },
              ]
            : []),
        ],
      },
    ],
  })
    .populate('domainId', 'name slug')
    .populate('requiredSkills.skillId', 'name slug category')
    .limit(Math.min(12, Math.max(1, limit)))
}

function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]
}

export async function searchSuggestions(q) {
  const query = String(q || '').trim()
  if (query.length < 2) return []
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const [careers, skills] = await Promise.all([
    Career.find({ $and: [publishedCareer, { $or: [{ title: regex }, { tags: regex }] }] }).limit(8).select('slug title'),
    Skill.find({ active: true, $or: [{ name: regex }, { aliases: regex }] }).limit(8).select('slug name'),
  ])
  const direct = [
    ...careers.map((item) => ({ type: 'career', id: item.slug, label: item.title })),
    ...skills.map((item) => ({ type: 'skill', id: item.slug, label: item.name })),
  ]
  if (direct.length) return direct.slice(0, 10)

  const candidates = await Career.find(publishedCareer).limit(100).select('slug title').lean()
  return candidates
    .map((item) => ({ ...item, distance: editDistance(query.toLowerCase(), item.title.toLowerCase()) }))
    .filter((item) => item.distance <= Math.max(2, Math.floor(query.length / 3)))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((item) => ({ type: 'correction', id: item.slug, label: item.title, corrected: true }))
}

export async function getRelatedContent(slug, limit = 6) {
  const career = await getCareerBySlug(slug)
  if (!career) return null
  const tags = (career.tags || []).slice(0, 8)
  const [media, resources] = await Promise.all([
    Multimedia.find({
      $and: [
        publishedContent,
        { $or: [{ relatedCareerIds: career._id }, ...(tags.length ? [{ tags: { $in: tags } }] : [])] },
      ],
    })
      .sort({ ratingAvg: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
    Resource.find({
      $and: [
        publishedContent,
        { $or: [{ relatedCareerIds: career._id }, ...(tags.length ? [{ tags: { $in: tags } }] : [])] },
      ],
    })
      .sort({ downloadCount: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
  ])
  return { media, resources }
}

export default {
  listDomains,
  listSkills,
  listCareers,
  getCareerBySlug,
  getRelatedCareers,
  searchSuggestions,
  getRelatedContent,
}
