import { Feedback, Skill, UserProfile } from '../models/index.js'

const NAVIGATION_TARGETS = [
  { keys: ['career bank', 'careers', 'career page', 'jobs'], intent: 'careers', label: 'Career Bank' },
  { keys: ['career quiz', 'quiz', 'assessment', 'test'], intent: 'quiz', label: 'career assessment' },
  { keys: ['recommendations', 'recommendation', 'matches', 'match page'], intent: 'recommendations', label: 'recommendations' },
  { keys: ['saved items', 'saved page', 'bookmarks', 'bookmark page'], intent: 'saved', label: 'saved items' },
  { keys: ['resources', 'resource page', 'documents', 'media'], intent: 'resources', label: 'resources' },
  { keys: ['success stories', 'stories', 'story page'], intent: 'stories', label: 'success stories' },
  { keys: ['profile', 'career passport', 'settings', 'account'], intent: 'profile', label: 'Career Passport' },
  { keys: ['feedback'], intent: 'feedback', label: 'feedback form' },
  { keys: ['help center', 'help page', 'help'], intent: 'help', label: 'help center' },
  { keys: ['compare careers', 'comparison', 'compare'], intent: 'compare', label: 'career comparison' },
  { keys: ['quiz history', 'assessment history'], intent: 'quiz-history', label: 'assessment history' },
  { keys: ['dashboard', 'home page', 'home'], intent: 'dashboard', label: 'dashboard' },
]

const KNOWLEDGE_INTENTS = [
  {
    keys: ['what can you do', 'capabilities', 'who are you', 'how can you help', 'features'],
    intent: 'help',
    reply: 'I am Navi, PathSeeker\'s career guide. I can explain careers, assessments, recommendations, resources, and saved items. When you are signed in, I can also add profile details such as experience, education, skills, interests, goals, location, and feedback.',
  },
  {
    keys: ['career', 'careers', 'job', 'jobs', 'roadmap', 'demand', 'salary'],
    intent: 'careers',
    reply: 'Career Bank lets you compare responsibilities, skills, salary evidence, demand, growth, and learning roadmaps. Ask me to open Career Bank when you are ready to explore.',
  },
  {
    keys: ['quiz', 'assessment', 'test', 'strengths'],
    intent: 'quiz',
    reply: 'The career assessment turns your answers into an explainable Career Passport. Your recommendations keep compatibility and current skill readiness separate.',
  },
  {
    keys: ['recommend', 'matches', 'best fit', 'suggestions'],
    intent: 'recommendations',
    reply: 'Your recommendations use assessment signals, interests, and skills. Each match explains compatibility, readiness, confidence, and the skill gaps you can work on.',
  },
  {
    keys: ['resources', 'resource', 'guide', 'pdf', 'video', 'media'],
    intent: 'resources',
    reply: 'Resources includes tagged documents and multimedia, with previews, transcripts, ratings, and related career links where available.',
  },
  {
    keys: ['saved', 'bookmark', 'bookmarks', 'notes'],
    intent: 'saved',
    reply: 'Saved items keeps your bookmarked careers and learning content together with your private notes. You can also export or share your collection.',
  },
  {
    keys: ['story', 'stories', 'community', 'journey'],
    intent: 'stories',
    reply: 'Success Stories contains approved community journeys. You can read published stories or submit your own experience for review.',
  },
  {
    keys: ['profile', 'passport', 'settings', 'account'],
    intent: 'profile',
    reply: 'Your Career Passport combines education, experience, skills, interests, goals, assessment evidence, and accessibility preferences. Tell me one detail you want to add or update.',
  },
  {
    keys: ['hello', 'hi', 'hey', 'navi', 'good morning', 'good afternoon', 'good evening'],
    intent: 'help',
    reply: 'Hello, I am Navi. I can help you explore a direction, understand your Career Passport, navigate PathSeeker, or update one of your saved profile details.',
  },
  {
    keys: ['thank you', 'thanks', 'appreciate it'],
    intent: 'help',
    reply: 'You are welcome. Ask whenever you want to explore another path or update your Career Passport.',
  },
]

const NAVIGATION_PHRASES = ['open ', 'take me', 'go to', 'show me', 'navigate', 'launch ', 'visit ']
const MUTATION_PHRASES = ['add ', 'save ', 'record ', 'set ', 'update ', 'change ', 'submit ', 'worked as ', 'i work as ', 'i studied ', 'want to become ', 'i live ', 'i am based ', 'my headline is ']

const includesAny = (text, values) => values.some((value) => text.includes(value))
const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim()
const cleanValue = (value, maxLength) => normalize(value).replace(/^[,:;\-\s]+|[,:;\-\s]+$/g, '').slice(0, maxLength)
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const userIdFrom = (user) => user?.id || user?._id?.toString?.() || user?._id

function explicitNavigation(normalized) {
  if (!includesAny(normalized, NAVIGATION_PHRASES)) return null
  return NAVIGATION_TARGETS.find(({ keys }) => includesAny(normalized, keys)) || null
}

function loginRequired(entity) {
  return {
    intent: 'login',
    reply: `Please sign in before I change your ${entity}. You can still ask me general career questions without signing in.`,
    requiresAuth: true,
  }
}

async function getOrCreateProfile(userId) {
  return UserProfile.findOne({ userId }).then((profile) => profile || UserProfile.create({ userId }))
}

function saved(reply, entity) {
  return { intent: null, reply, dataSaved: true, entity }
}

function parseExperience(original) {
  const patterns = [
    /(?:add|save|record|update)\s+(?:my\s+)?(?:work\s+)?(?:experience|job|role|position)\s+(?:as\s+)?(.+?)\s+(?:at|with)\s+(.+)$/i,
    /(?:i\s+)?(?:worked|work)\s+as\s+(.+?)\s+(?:at|with)\s+(.+)$/i,
  ]
  for (const pattern of patterns) {
    const match = original.match(pattern)
    if (match) return { title: cleanValue(match[1], 150), organization: cleanValue(match[2], 200) }
  }
  return null
}

function parseEducation(original) {
  const match = original.match(/(?:add|save|record|update|i studied)\s+(?:my\s+)?(?:education|degree)?\s*(.+?)\s+(?:at|from)\s+(.+)$/i)
  if (!match) return null
  const qualification = cleanValue(match[1], 250)
  const institution = cleanValue(match[2], 200)
  const fieldMatch = qualification.match(/^(.+?)\s+in\s+(.+)$/i)
  return {
    level: cleanValue(fieldMatch?.[1] || qualification, 100),
    field: cleanValue(fieldMatch?.[2] || '', 150),
    institution,
  }
}

function parseSkill(original) {
  const match = original.match(/(?:add|save|record|update|set)\s+(?:my\s+)?skills?\s+(.+)$/i)
  if (!match) return null
  const value = match[1]
  const ratingMatch = value.match(/(?:rating|rate|at)\s*(\d{1,2})|\b(\d{1,2})\s*(?:\/|out of)\s*10\b/i)
  const rating = Number(ratingMatch?.[1] || ratingMatch?.[2] || 5)
  const name = cleanValue(value.replace(ratingMatch?.[0] || '', ''), 100)
  return { name, rating: Math.min(10, Math.max(1, rating)) }
}

function parseGoal(original) {
  const command = original.match(/(?:add|save|record|set|update|change)\s+(?:my\s+)?(?:career\s+)?goal\s+(?:as|to|is)?\s*(.+)$/i)
  const aspiration = original.match(/(?:i\s+)?want\s+to\s+become\s+(?:an|a)?\s*(.+)$/i)
  return cleanValue(command?.[1] || aspiration?.[1] || '', 200)
}

function parseSalary(original) {
  const match = original.match(/([\d,]+(?:\.\d+)?)\s*(k)?\s*(usd|pkr|gbp|eur|aed|cad|aud)?/i)
  if (!match) return null
  const base = Number(match[1].replace(/,/g, ''))
  if (!Number.isFinite(base)) return null
  return { amount: Math.round(base * (match[2] ? 1_000 : 1)), currency: (match[3] || 'USD').toUpperCase() }
}

function parseLocation(original) {
  let value = original.replace(/^.*?(?:location|live|living|based)\s+(?:is|to|in|at)?\s*/i, '')
  value = cleanValue(value, 220)
  const parts = value.includes(',') ? value.split(',') : value.split(/\s+in\s+/i)
  if (parts.length < 2) return null
  return { city: cleanValue(parts[0], 100), country: cleanValue(parts.slice(1).join(' '), 100) }
}

function parseInterest(original) {
  const match = original.match(/(?:add|save|record|set|update)\s+(?:my\s+)?interests?\s+(?:as|to|in)?\s*(.+)$/i)
  return match ? cleanValue(match[1], 100) : ''
}

function parseHeadline(original) {
  const match = original.match(/(?:add|save|record|set|update|change)\s+(?:my\s+)?(?:profile\s+)?(?:headline|bio)\s+(?:as|to|is)?\s*(.+)$/i)
  return match ? cleanValue(match[1], 180) : ''
}

function parseFeedback(original, normalized) {
  const match = original.match(/(?:submit|save|record|add)\s+(?:my\s+)?feedback\s*(?::|as|that)?\s*(.+)$/i)
  if (!match) return null
  const message = cleanValue(match[1], 2_000)
  const category = normalized.includes('bug') || normalized.includes('broken') || normalized.includes('error')
    ? 'bug'
    : normalized.includes('suggest') || normalized.includes('idea') || normalized.includes('request')
      ? 'suggestion'
      : 'query'
  return { category, message }
}

async function handleProfileMutation(original, normalized, user) {
  if (!includesAny(normalized, MUTATION_PHRASES) && !normalized.startsWith('confirm clear all ')) return null
  const userId = userIdFrom(user)

  if (includesAny(normalized, ['experience', 'worked as', 'work as', 'job at', 'role at', 'position at'])) {
    if (!userId) return loginRequired('work experience')
    if (includesAny(normalized, ['clear ', 'delete all', 'remove all'])) {
      if (!normalized.startsWith('confirm clear all experience')) {
        return { intent: null, reply: 'Clearing all experience cannot be undone. If that is what you want, say “confirm clear all experience”.' }
      }
      const profile = await getOrCreateProfile(userId)
      profile.experience = []
      await profile.save()
      return saved('Your work-experience list is now empty.', 'experience')
    }
    const value = parseExperience(original)
    if (!value?.title || !value.organization) return { intent: null, reply: 'Tell me both the role and organization, for example: “Add experience Frontend Developer at Acme”.' }
    const profile = await getOrCreateProfile(userId)
    profile.experience.unshift(value)
    await profile.save()
    return saved(`Added ${value.title} at ${value.organization} to your work experience.`, 'experience')
  }

  if (includesAny(normalized, ['education', 'degree', 'university', 'college', 'i studied'])) {
    if (!userId) return loginRequired('education')
    if (includesAny(normalized, ['clear ', 'delete all', 'remove all'])) {
      if (!normalized.startsWith('confirm clear all education')) {
        return { intent: null, reply: 'Clearing all education cannot be undone. If that is what you want, say “confirm clear all education”.' }
      }
      const profile = await getOrCreateProfile(userId)
      profile.education = []
      await profile.save()
      return saved('Your education list is now empty.', 'education')
    }
    const value = parseEducation(original)
    if (!value?.level || !value.institution) return { intent: null, reply: 'Tell me the qualification and institution, for example: “Add education Bachelor in Computer Science at Aptech”.' }
    const profile = await getOrCreateProfile(userId)
    profile.education.unshift(value)
    await profile.save()
    return saved(`Added ${value.level}${value.field ? ` in ${value.field}` : ''} at ${value.institution} to your education.`, 'education')
  }

  if (/\bskills?\b/i.test(normalized)) {
    if (!userId) return loginRequired('skills')
    const value = parseSkill(original)
    if (!value?.name) return { intent: null, reply: 'Name the skill and a rating from 1 to 10, for example: “Add skill React rating 8”.' }
    const skill = await Skill.findOne({
      $or: [
        { name: new RegExp(`^${escapeRegex(value.name)}$`, 'i') },
        { aliases: new RegExp(`^${escapeRegex(value.name)}$`, 'i') },
      ],
    })
    if (!skill) return { intent: 'profile', reply: `I could not find “${value.name}” in the approved skill catalog. Open your profile to choose the closest available skill.` }
    const profile = await getOrCreateProfile(userId)
    profile.skills = profile.skills.filter(({ skillId }) => skillId.toString() !== skill._id.toString())
    profile.skills.push({ skillId: skill._id, selfRating: value.rating, source: 'self_reported' })
    await profile.save()
    return saved(`Saved ${skill.name} with a self-rating of ${value.rating} out of 10.`, 'skills')
  }

  if (includesAny(normalized, ['desired salary', 'target salary', 'desired income', 'target income', 'set salary', 'save salary'])) {
    if (!userId) return loginRequired('career goals')
    const value = parseSalary(original)
    if (!value || value.amount < 0) return { intent: null, reply: 'Tell me an amount and currency, for example: “Set target salary to 120000 PKR”.' }
    const profile = await getOrCreateProfile(userId)
    profile.goals.desiredIncome = value.amount
    profile.goals.desiredIncomeCurrency = value.currency
    await profile.save()
    return saved(`Saved your target income as ${value.amount.toLocaleString()} ${value.currency}.`, 'goals')
  }

  if (includesAny(normalized, ['career goal', 'my goal', 'goal as', 'goal to', 'goal is', 'want to become'])) {
    if (!userId) return loginRequired('career goal')
    const goal = parseGoal(original)
    if (!goal) return { intent: null, reply: 'Tell me the direction you want to pursue, for example: “Set my career goal to Data Analyst”.' }
    const profile = await getOrCreateProfile(userId)
    profile.goals.primaryGoal = goal
    await profile.save()
    return saved(`Saved “${goal}” as your primary career goal.`, 'goals')
  }

  if (includesAny(normalized, ['location', 'live in', 'living in', 'based in'])) {
    if (!userId) return loginRequired('location')
    const value = parseLocation(original)
    if (!value?.city || !value.country) return { intent: null, reply: 'Tell me both city and country, for example: “Set location to Karachi, Pakistan”.' }
    const profile = await getOrCreateProfile(userId)
    profile.location = value
    await profile.save()
    return saved(`Saved your location as ${value.city}, ${value.country}.`, 'location')
  }

  if (/\binterests?\b/i.test(normalized)) {
    if (!userId) return loginRequired('interests')
    if (includesAny(normalized, ['clear ', 'delete all', 'remove all'])) {
      if (!normalized.startsWith('confirm clear all interests')) {
        return { intent: null, reply: 'Clearing all interests cannot be undone. If that is what you want, say “confirm clear all interests”.' }
      }
      const profile = await getOrCreateProfile(userId)
      profile.interests = []
      await profile.save()
      return saved('Your interests list is now empty.', 'interests')
    }
    const interest = parseInterest(original)
    if (!interest) return { intent: null, reply: 'Name one interest, for example: “Add interest in artificial intelligence”.' }
    const profile = await getOrCreateProfile(userId)
    if (!profile.interests.some((item) => item.toLowerCase() === interest.toLowerCase())) profile.interests.push(interest)
    await profile.save()
    return saved(`Added “${interest}” to your interests.`, 'interests')
  }

  if (includesAny(normalized, ['headline', 'bio'])) {
    if (!userId) return loginRequired('profile headline')
    const headline = parseHeadline(original)
    if (!headline) return { intent: null, reply: 'Tell me the headline you want, for example: “Set my headline to Junior Data Analyst”.' }
    const profile = await getOrCreateProfile(userId)
    profile.headline = headline
    await profile.save()
    return saved(`Updated your profile headline to “${headline}”.`, 'headline')
  }

  if (normalized.includes('feedback')) {
    if (!userId) return loginRequired('feedback')
    const value = parseFeedback(original, normalized)
    if (!value?.message || value.message.length < 5) return { intent: 'feedback', reply: 'Tell me the feedback message, for example: “Submit feedback: The comparison page is very helpful”.' }
    await Feedback.create({ userId, ...value, context: 'Submitted through Navi voice assistant' })
    return saved('Your feedback has been submitted. Thank you for helping improve PathSeeker.', 'feedback')
  }

  return null
}

export async function respondToIntent(text, user = null) {
  const original = normalize(text)
  const normalized = original.toLowerCase()

  const mutation = await handleProfileMutation(original, normalized, user)
  if (mutation) return mutation

  const navigation = explicitNavigation(normalized)
  if (navigation) return { intent: navigation.intent, reply: `Opening ${navigation.label}.` }

  const match = KNOWLEDGE_INTENTS.find(({ keys }) => includesAny(normalized, keys))
  if (match) return { intent: match.intent, reply: match.reply }

  return {
    intent: 'help',
    reply: 'I can help with careers, the assessment, recommendations, resources, saved items, stories, or your Career Passport. Try asking “Which careers match analytical work?” or “Open Career Bank”.',
  }
}

export default { respondToIntent }
