import {
  Career,
  CareerPassport,
  RecommendationSnapshot,
  UserProfile,
} from '../models/index.js'
import AppError from '../utils/AppError.js'

export const PASSPORT_ALGORITHM_VERSION = 'passport-v1'
export const RECOMMENDATION_ALGORITHM_VERSION = 'recommendation-v1'

const TRAIT_LABELS = {
  creative: 'Creative', analytical: 'Analytical', people: 'People-focused', technical: 'Technical',
  communication: 'Communicative', empathy: 'Empathetic', organization: 'Organized',
}

const TRAIT_ARCHETYPES = {
  creative: 'Imaginative Builder', analytical: 'Insight Explorer', people: 'Collaborative Leader',
  technical: 'Practical Innovator', communication: 'Clear Connector', empathy: 'Thoughtful Builder',
  organization: 'Structured Strategist',
}

const IMPORTANCE_WEIGHT = { nice_to_have: 1, important: 2, critical: 3 }
const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)))
const idString = (value) => value?._id?.toString?.() || value?.toString?.() || String(value)

function normalizeScores(scoreMap, labelForKey = (key) => key) {
  const values = [...scoreMap.values()]
  const max = Math.max(0, ...values)
  return [...scoreMap.entries()]
    .map(([key, value]) => ({ key, label: labelForKey(key), score: max > 0 ? clamp((value / max) * 100) : 0 }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
}

export function calculatePassport({ attempt, profile, quiz, domainNames = new Map() }) {
  const questions = attempt.questionSnapshots?.length ? attempt.questionSnapshots : quiz.questions
  const questionMap = new Map(questions.map((question) => [question.key, question]))
  const traitTotals = new Map()
  const domainTotals = new Map()

  for (const answer of attempt.answers) {
    const question = questionMap.get(answer.questionKey)
    const option = question?.options?.find(({ key }) => key === answer.optionKey)
    if (!option) continue
    if (option.trait) traitTotals.set(option.trait, (traitTotals.get(option.trait) || 0) + 1)
    for (const weight of option.domainWeights || []) {
      const key = idString(weight.domainId)
      domainTotals.set(key, (domainTotals.get(key) || 0) + Number(weight.weight || 0))
    }
  }

  const traitScores = normalizeScores(traitTotals, (key) => TRAIT_LABELS[key] || key)
  const domainScores = normalizeScores(domainTotals, (key) => domainNames.get(key) || 'Career domain')
  const topTrait = traitScores[0]?.key || 'people'
  const evidence = [
    profile?.headline,
    profile?.education?.length,
    profile?.skills?.length,
    profile?.interests?.length,
    profile?.goals?.primaryGoal,
    profile?.onboarding?.status === 'completed',
    attempt.answers.length >= questions.length,
  ].filter(Boolean).length

  return {
    userId: attempt.userId,
    sourceAttemptId: attempt._id,
    profileVersion: profile?.updatedAt || profile?.createdAt || new Date(),
    archetype: TRAIT_ARCHETYPES[topTrait] || 'Career Explorer',
    traitScores,
    domainScores,
    skills: (profile?.skills || []).map((skill) => ({
      skillId: skill.skillId?._id || skill.skillId,
      level: skill.selfRating,
      source: 'profile',
    })),
    completionPercent: clamp((evidence / 7) * 100),
    algorithmVersion: PASSPORT_ALGORITHM_VERSION,
    calculatedAt: new Date(),
  }
}

function interestScore(profile, career) {
  const interests = (profile?.interests || []).map((value) => value.toLowerCase())
  const domain = career.domainId?.name?.toLowerCase() || ''
  const tags = (career.tags || []).map((value) => value.toLowerCase())
  if (interests.some((value) => domain.includes(value) || value.includes(domain))) return 100
  if (interests.some((value) => tags.some((tag) => tag.includes(value) || value.includes(tag)))) return 80
  return interests.length ? 35 : 50
}

export function scoreCareer({ passport, profile, career, skillOverrides = {} }) {
  const traitMap = new Map((passport.traitScores || []).map((item) => [item.key, item.score]))
  const relevantTraits = career.traits?.length ? career.traits : []
  const traitAlignment = relevantTraits.length
    ? relevantTraits.reduce((total, trait) => total + (traitMap.get(trait) || 25), 0) / relevantTraits.length
    : 50

  const passportSkills = new Map((passport.skills || []).map((item) => [idString(item.skillId), Number(item.level)]))
  Object.entries(skillOverrides).forEach(([skillId, level]) => passportSkills.set(skillId, Number(level)))
  let readinessTotal = 0
  let readinessWeight = 0
  let presentSkills = 0
  const skillGap = []

  for (const required of career.requiredSkills || []) {
    const skillId = idString(required.skillId)
    const currentLevel = clamp(passportSkills.get(skillId) || 0, 0, 10)
    const requiredLevel = required.requiredLevel || 7
    const difference = Math.max(0, requiredLevel - currentLevel)
    const weight = IMPORTANCE_WEIGHT[required.importance] || 2
    readinessTotal += Math.min(1, currentLevel / requiredLevel) * weight
    readinessWeight += weight
    if (currentLevel > 0) presentSkills += 1
    if (difference > 0) {
      skillGap.push({
        skillId: required.skillId?._id || required.skillId,
        currentLevel,
        requiredLevel,
        difference,
        importance: required.importance || 'important',
        readinessImpact: clamp((difference / requiredLevel) * weight * 20),
      })
    }
  }

  const readinessScore = readinessWeight ? clamp((readinessTotal / readinessWeight) * 100) : 50
  const skillAffinity = career.requiredSkills?.length ? clamp((presentSkills / career.requiredSkills.length) * 100) : 50
  const interests = interestScore(profile, career)
  const compatibilityScore = clamp(traitAlignment * 0.55 + interests * 0.25 + skillAffinity * 0.2)
  const evidenceCount = (passport.traitScores?.length || 0) + (passport.skills?.length || 0) + (profile?.interests?.length || 0)
  const confidence = clamp(55 + Math.min(40, evidenceCount * 4))
  const reasons = []
  if (relevantTraits.length) reasons.push(`Your ${relevantTraits.slice(0, 2).map((key) => TRAIT_LABELS[key]?.toLowerCase() || key).join(' and ')} signals align with this work.`)
  if (interests >= 80) reasons.push(`Your stated interests connect directly with ${career.domainId?.name || 'this career domain'}.`)
  if (presentSkills) reasons.push(`${presentSkills} of ${career.requiredSkills.length} required skills already appear in your Career Passport.`)
  if (!reasons.length) reasons.push('This match is based on your assessment signals and current profile evidence.')

  return {
    careerId: career._id,
    compatibilityScore,
    readinessScore,
    confidence,
    components: [
      { key: 'traits', label: 'Assessment signals', score: clamp(traitAlignment), weight: 0.55 },
      { key: 'interests', label: 'Interest alignment', score: interests, weight: 0.25 },
      { key: 'skills', label: 'Skill affinity', score: skillAffinity, weight: 0.2 },
    ],
    reasons,
    skillGap: skillGap.sort((a, b) => b.readinessImpact - a.readinessImpact),
  }
}

export async function generateCareerIntelligence({ userId, attempt, quiz }) {
  const [profile, careers] = await Promise.all([
    UserProfile.findOne({ userId }).populate('skills.skillId', 'name slug category'),
    Career.find({ active: true, status: 'published' })
      .populate('domainId', 'name slug')
      .populate('requiredSkills.skillId', 'name slug category'),
  ])
  if (!profile) throw new AppError(409, 'Complete your profile before generating a Career Passport.', 'PROFILE_REQUIRED')

  const domainNames = new Map(careers.map((career) => [idString(career.domainId), career.domainId?.name]).filter(([, name]) => name))
  const passportPayload = calculatePassport({ attempt, profile, quiz, domainNames })
  const existingPassport = await CareerPassport.findOne({ sourceAttemptId: attempt._id })
  const passport = existingPassport || await CareerPassport.create(passportPayload)
  const matches = careers.map((career) => scoreCareer({ passport, profile, career }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore || b.readinessScore - a.readinessScore)
    .slice(0, 10)
  const snapshot = await RecommendationSnapshot.findOneAndUpdate(
    { passportId: passport._id },
    { $setOnInsert: { userId, passportId: passport._id, sourceAttemptId: attempt._id, matches, algorithmVersion: RECOMMENDATION_ALGORITHM_VERSION } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  return { passport, snapshot }
}

export async function getLatestCareerIntelligence(userId) {
  const passport = await CareerPassport.findOne({ userId }).sort({ calculatedAt: -1 })
    .populate('skills.skillId', 'name slug category')
    .populate('targetCareerId', 'title slug')
  if (!passport) throw new AppError(404, 'Complete the career assessment to create your Career Passport.', 'PASSPORT_NOT_FOUND')
  const snapshot = await RecommendationSnapshot.findOne({ passportId: passport._id })
    .populate({
      path: 'matches.careerId',
      populate: [
        { path: 'domainId', select: 'name slug' },
        { path: 'requiredSkills.skillId', select: 'name slug category' },
      ],
    })
    .populate('matches.skillGap.skillId', 'name slug category')
  return { passport, snapshot }
}

export async function simulateCareer(userId, slug, adjustments) {
  const [{ passport }, profile, career] = await Promise.all([
    getLatestCareerIntelligence(userId),
    UserProfile.findOne({ userId }),
    Career.findOne({ slug: slug.toLowerCase(), active: true, status: 'published' })
      .populate('domainId', 'name slug')
      .populate('requiredSkills.skillId', 'name slug category'),
  ])
  if (!career) throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  const overrides = Object.fromEntries(adjustments.map(({ skillId, level }) => [String(skillId), level]))
  const before = scoreCareer({ passport, profile, career })
  const after = scoreCareer({ passport, profile, career, skillOverrides: overrides })
  return { career, before, after, persisted: false, algorithmVersion: RECOMMENDATION_ALGORITHM_VERSION }
}

export default { calculatePassport, scoreCareer, generateCareerIntelligence, getLatestCareerIntelligence, simulateCareer }
