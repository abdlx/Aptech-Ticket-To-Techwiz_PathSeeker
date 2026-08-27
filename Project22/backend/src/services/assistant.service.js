import { UserProfile, Feedback, Career, Bookmark, Skill, User } from '../models/index.js'

/* ───────────────────────────────────────────────────────────
   KNOWLEDGE BASE — informational responses (no database ops)
   ─────────────────────────────────────────────────────────── */
const KNOWLEDGE_INTENTS = [
  {
    keys: ['what can you do', 'capabilities', 'who are you', 'help me', 'features', 'what do you do', 'database', 'save data', 'how does this work'],
    reply: 'I am Navi, your full-stack AI Career Advisor on PathSeeker! I have complete control of your database: I can add, update, or remove your Work Experience, Education records, Technical Skills with 1 to 10 ratings, Career Goals, Target Interests, Location, Profile Headline, and Feedback. What would you like to update or explore?'
  },
  {
    keys: ['career bank', 'explore careers', 'roadmap', 'demand', 'jobs in tech'],
    reply: 'Career Bank features in-depth roadmaps, live salary benchmarks, required skills, and market growth outlooks for careers across Software Engineering, AI and Data, UI/UX Design, Cloud Architecture, and Business. Say "take me to careers page" to explore!'
  },
  {
    keys: ['quiz', 'career quiz', 'assessment', 'test', 'evaluate', 'strengths'],
    reply: 'The Career Assessment Quiz analyzes your interests, technical strengths, and problem-solving styles to score your top career matches. Say "open quiz page" to start!'
  },
  {
    keys: ['recommend', 'matches', 'my matches', 'suggestions', 'best career for me'],
    reply: 'Your Matches page shows explainable career scores based on your saved profile skills, education, and quiz attempts. Say "take me to matches page" to view them!'
  },
  {
    keys: ['resources', 'multimedia', 'guides', 'pdf', 'video', 'masterclass', 'podcast'],
    reply: 'The Resources section has verified career roadmaps, PDF downloads, and video masterclasses. Say "go to resources page" to browse!'
  },
  {
    keys: ['saved', 'bookmarks', 'favorites', 'notes', 'saved items'],
    reply: 'Your Saved and Notes dashboard keeps all your bookmarked careers and learning resources. Say "open saved page" to view them!'
  },
  {
    keys: ['stories', 'success stories', 'community', 'inspiration', 'transformation'],
    reply: 'Success Stories features verified career journeys from students and career switchers. Say "take me to stories page" to explore them!'
  },
  {
    keys: ['profile', 'passport', 'settings', 'account details'],
    reply: 'Your Career Passport holds your complete profile: Work Experience, Education, Skills, Interests, Career Goals, Location, and Headline. Tell me what you want to add, update, or remove!'
  },
  {
    keys: ['hello', 'hi', 'hey', 'navi', 'how are you', 'good morning', 'good afternoon', 'good evening'],
    reply: 'Hello! I am Navi, your AI Voice Advisor. I can manage your entire database profile including Work Experience, Education, Skills, Goals, Location, and Feedback. What would you like to do today?'
  },
  {
    keys: ['thank you', 'thanks', 'appreciate it', 'awesome', 'great', 'perfect'],
    reply: 'You are very welcome! If you want to add work experience, update skills, or explore careers, just ask me anytime.'
  },
]

/* ───────────────────────────────────────────────────────────
   HELPER — ensure profile document exists for authenticated user
   ─────────────────────────────────────────────────────────── */
async function ensureProfile(userId) {
  let profile = await UserProfile.findOne({ userId }).catch(() => null)
  if (!profile) {
    profile = await UserProfile.create({ userId }).catch(() => null)
  }
  return profile
}

/* ═══════════════════════════════════════════════════════════
   MAIN HANDLER — universal intent matching + CRUD execution
   ═══════════════════════════════════════════════════════════ */
export async function respondToIntent(text, user = null) {
  const normalized = String(text || '').toLowerCase().trim()
  const original = String(text || '').trim()

  // Get or create profile for authenticated user
  let profile = null
  if (user?._id) {
    profile = await ensureProfile(user._id)
  }

  // ─────────────────────────────────────────────────────────
  // 1. WORK EXPERIENCE — add / delete / clear
  // ─────────────────────────────────────────────────────────
  const expTriggers = ['experience', 'work as', 'worked at', 'job as', 'internship', 'role at', 'position']
  if (expTriggers.some(t => normalized.includes(t))) {

    // ASK for info if user just says "experience" or "work experience"
    if (!normalized.includes('add') && !normalized.includes('save') && !normalized.includes('insert') && !normalized.includes('delete') && !normalized.includes('remove') && !normalized.includes('clear') && !normalized.includes(' at ') && !normalized.includes(' as ')) {
      return {
        intent: null,
        reply: 'I can save your Work Experience into the database! Please tell me your Job Title and Company. For example: "Add experience Frontend Developer at Google" or "I worked as Data Analyst at Microsoft".',
      }
    }

    if (!user?._id) return { intent: 'login', reply: 'Please log in to manage your work experience.' }

    // DELETE / CLEAR
    if (normalized.includes('delete') || normalized.includes('remove') || normalized.includes('clear')) {
      profile.experience = []
      profile.markModified('experience')
      await profile.save()
      return { intent: null, reply: 'Done! I have cleared all your work experience records from the database.', dataSaved: true, entity: 'experience' }
    }

    // ADD / INSERT
    let clean = original
    // Strip leading instruction words
    clean = clean.replace(/^(add|save|insert|update|set)\s+(my\s+)?(work\s+)?/i, '')
    clean = clean.replace(/(experience|internship|position|role|job)\s*/i, '')
    clean = clean.replace(/^(as|is|to|at)\s+/i, '')
    clean = clean.trim()

    let title = 'Software Engineer'
    let organization = 'Tech Company'

    if (clean.toLowerCase().includes(' at ')) {
      const parts = clean.split(/\s+at\s+/i)
      title = parts[0].trim() || title
      organization = parts[1].trim() || organization
    } else if (clean.toLowerCase().includes(' in ')) {
      const parts = clean.split(/\s+in\s+/i)
      title = parts[0].trim() || title
      organization = parts[1].trim() || organization
    } else if (clean.length > 2) {
      title = clean
    }

    profile.experience.unshift({
      title,
      organization,
      description: `Recorded via Navi AI: ${title} at ${organization}`,
      current: true,
      startDate: new Date(),
    })
    profile.markModified('experience')
    await profile.save()

    return {
      intent: null,
      reply: `Success! I have added "${title}" at "${organization}" to your Work Experience in the database. Would you like to add another role or record your education next?`,
      dataSaved: true,
      entity: 'experience',
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. EDUCATION — add / delete / clear
  // ─────────────────────────────────────────────────────────
  const eduTriggers = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'studied', 'school', 'phd', 'matric', 'diploma']
  if (eduTriggers.some(t => normalized.includes(t))) {

    // ASK for info
    if (!normalized.includes('add') && !normalized.includes('save') && !normalized.includes('insert') && !normalized.includes('delete') && !normalized.includes('remove') && !normalized.includes('clear') && !normalized.includes(' at ') && !normalized.includes(' in ') && !normalized.includes(' from ')) {
      return {
        intent: null,
        reply: 'I can record your Education in the database! Please tell me your Degree and Institution. For example: "Add education Bachelor of Computer Science at Stanford University" or "I studied Master of AI at MIT".',
      }
    }

    if (!user?._id) return { intent: 'login', reply: 'Please log in to manage your education records.' }

    // DELETE / CLEAR
    if (normalized.includes('delete') || normalized.includes('remove') || normalized.includes('clear')) {
      profile.education = []
      profile.markModified('education')
      await profile.save()
      return { intent: null, reply: 'Done! I have cleared all your education records from the database.', dataSaved: true, entity: 'education' }
    }

    // ADD / INSERT
    let clean = original
    clean = clean.replace(/^(add|save|insert|update|set)\s+(my\s+)?/i, '')
    clean = clean.replace(/(education|degree|diploma)\s*/i, '')
    clean = clean.replace(/^(is|as|to)\s+/i, '')
    clean = clean.trim()

    let level = 'Bachelor of Science'
    let institution = 'University'
    let field = 'Computer Science'

    if (clean.toLowerCase().includes(' at ')) {
      const parts = clean.split(/\s+at\s+/i)
      level = parts[0].trim() || level
      institution = parts[1].trim() || institution
    } else if (clean.toLowerCase().includes(' from ')) {
      const parts = clean.split(/\s+from\s+/i)
      level = parts[0].trim() || level
      institution = parts[1].trim() || institution
    } else if (clean.toLowerCase().includes(' in ')) {
      const parts = clean.split(/\s+in\s+/i)
      level = parts[0].trim() || level
      field = parts[1].trim() || field
    } else if (clean.length > 2) {
      level = clean
    }

    profile.education.unshift({
      level,
      institution,
      field,
      current: true,
      startYear: new Date().getFullYear(),
    })
    profile.markModified('education')
    await profile.save()

    return {
      intent: null,
      reply: `Success! I have recorded your education "${level}" at "${institution}" in the database. Would you like to add skills next?`,
      dataSaved: true,
      entity: 'education',
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. SKILLS — add / update / delete  (with 1-10 rating)
  // ─────────────────────────────────────────────────────────
  const skillTriggers = ['skill', 'skills', 'technical skill', 'soft skill']
  if (skillTriggers.some(t => normalized.includes(t))) {

    // ASK for info
    if (!normalized.includes('add') && !normalized.includes('save') && !normalized.includes('insert') && !normalized.includes('delete') && !normalized.includes('remove') && !normalized.includes('rating') && !normalized.includes('rate')) {
      return {
        intent: null,
        reply: 'I can record your technical and soft skills with ratings! For example, say "Add skill React rating 9" or "Add skill Python rating 8" and I will save it to your database profile.',
      }
    }

    if (!user?._id) return { intent: 'login', reply: 'Please log in to manage your skills.' }

    // DELETE
    if (normalized.includes('delete') || normalized.includes('remove')) {
      const clean = original.replace(/.*(delete|remove)\s+(skill\s*)?/i, '').trim()
      if (clean.length > 1) {
        const skillDoc = await Skill.findOne({
          $or: [
            { name: new RegExp(clean, 'i') },
            { aliases: new RegExp(clean, 'i') },
          ]
        }).catch(() => null)
        if (skillDoc) {
          profile.skills = profile.skills.filter(s => s.skillId.toString() !== skillDoc._id.toString())
          profile.markModified('skills')
          await profile.save()
          return { intent: null, reply: `I have removed "${clean}" from your skills in the database.`, dataSaved: true, entity: 'skills' }
        }
      }
      return { intent: null, reply: `I could not find a skill matching "${clean}" in your profile. Please try again with the exact skill name.` }
    }

    // ADD / UPDATE
    let clean = original
    clean = clean.replace(/^(add|save|insert|update|set)\s+(my\s+)?/i, '')
    clean = clean.replace(/(skill|skills)\s*/i, '')
    clean = clean.replace(/^(is|as|to)\s+/i, '')
    clean = clean.trim()

    // Extract rating from text
    let rating = 8
    const ratingMatch = original.match(/rating\s*(\d+)|rate\s*(\d+)|(\d+)\s*out\s*of\s*10|(\d+)\s*\/\s*10/i)
    if (ratingMatch) {
      rating = Math.min(10, Math.max(1, parseInt(ratingMatch[1] || ratingMatch[2] || ratingMatch[3] || ratingMatch[4], 10)))
    }

    // Skill name is everything before "rating" or "rate"
    let skillName = clean.replace(/\s*(rating|rate|with)\s*\d*.*/gi, '').trim()
    if (!skillName || skillName.length < 2) skillName = 'JavaScript'

    // Find existing skill or create new one
    let skillDoc = await Skill.findOne({
      $or: [
        { name: new RegExp(`^${skillName}$`, 'i') },
        { aliases: new RegExp(`^${skillName}$`, 'i') },
        { name: new RegExp(skillName, 'i') },
      ]
    }).catch(() => null)

    if (!skillDoc) {
      const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      skillDoc = await Skill.create({
        name: skillName,
        slug: slug || `skill-${Date.now()}`,
        category: 'technical',
        description: `Added via Navi AI Voice Advisor`,
      }).catch((err) => {
        console.error('Skill create error:', err.message)
        return null
      })
    }

    if (skillDoc) {
      // Remove existing entry for this skill (to allow update)
      profile.skills = profile.skills.filter(s => s.skillId.toString() !== skillDoc._id.toString())
      profile.skills.push({
        skillId: skillDoc._id,
        selfRating: rating,
        experienceMonths: 12,
        source: 'self_reported',
      })
      profile.markModified('skills')
      await profile.save()

      return {
        intent: null,
        reply: `Success! I have added "${skillName}" with a self-rating of ${rating} out of 10 to your database skills profile! Would you like to add another skill?`,
        dataSaved: true,
        entity: 'skills',
      }
    }

    return { intent: null, reply: `I encountered an issue saving the skill "${skillName}". Please try again.` }
  }

  // ─────────────────────────────────────────────────────────
  // 4. CAREER GOAL & DESIRED SALARY
  // ─────────────────────────────────────────────────────────
  const goalTriggers = ['goal', 'target role', 'become', 'want to be', 'dream job', 'aspire']
  const salaryTriggers = ['salary', 'income', 'package', 'pay', 'earning']
  
  if (goalTriggers.some(t => normalized.includes(t)) || salaryTriggers.some(t => normalized.includes(t))) {
    if (!user?._id) return { intent: 'login', reply: 'Please log in to update your career goals.' }

    // SALARY
    if (salaryTriggers.some(t => normalized.includes(t))) {
      const numMatch = original.match(/[\d,]+/g)
      const amount = numMatch ? parseInt(numMatch[0].replace(/,/g, ''), 10) : 85000
      if (!profile.goals) profile.goals = {}
      profile.goals.desiredIncome = amount
      profile.goals.desiredIncomeCurrency = 'USD'
      profile.markModified('goals')
      await profile.save()
      return {
        intent: null,
        reply: `Success! I have saved your target salary as ${amount.toLocaleString()} USD in your database profile.`,
        dataSaved: true,
        entity: 'goals',
      }
    }

    // GOAL
    let clean = original
    clean = clean.replace(/^(set|save|update|add|insert)\s+(my\s+)?/i, '')
    clean = clean.replace(/(goal|target|career goal|dream job)\s*/i, '')
    clean = clean.replace(/^(is|as|to|a|an)\s+/i, '')
    clean = clean.trim()
    const cleanGoal = clean.length > 2 ? clean : 'Software Engineer'

    if (!profile.goals) profile.goals = {}
    profile.goals.primaryGoal = cleanGoal
    profile.markModified('goals')
    await profile.save()
    return {
      intent: null,
      reply: `Success! I have saved "${cleanGoal}" as your primary career goal in your database profile. Would you like to set your target skills or add work experience?`,
      dataSaved: true,
      entity: 'goals',
    }
  }

  // ─────────────────────────────────────────────────────────
  // 5. LOCATION — city & country
  // ─────────────────────────────────────────────────────────
  const locTriggers = ['location', 'city', 'country', 'live in', 'based in', 'living in', 'from ']
  if (locTriggers.some(t => normalized.includes(t))) {
    if (!user?._id) return { intent: 'login', reply: 'Please log in to update your location.' }

    let clean = original
    clean = clean.replace(/^(set|save|update|change|add)\s+(my\s+)?/i, '')
    clean = clean.replace(/(location|city|country)\s*/i, '')
    clean = clean.replace(/^(is|as|to|in|at)\s+/i, '')
    clean = clean.trim()

    let city = ''
    let country = ''

    if (clean.includes(',')) {
      const parts = clean.split(',')
      city = parts[0].trim()
      country = parts[1].trim()
    } else {
      const words = clean.split(/\s+/)
      if (words.length >= 2) {
        // Last word is country, rest is city
        country = words[words.length - 1]
        city = words.slice(0, -1).join(' ')
      } else {
        city = clean
      }
    }

    if (!city) city = 'Karachi'
    if (!country) country = 'Pakistan'

    if (!profile.location) profile.location = {}
    profile.location.city = city
    profile.location.country = country
    profile.markModified('location')
    await profile.save()
    return {
      intent: null,
      reply: `Success! I have saved your location as "${city}, ${country}" in your database profile.`,
      dataSaved: true,
      entity: 'location',
    }
  }

  // ─────────────────────────────────────────────────────────
  // 6. INTERESTS
  // ─────────────────────────────────────────────────────────
  if (normalized.includes('interest')) {
    if (!user?._id) return { intent: 'login', reply: 'Please log in to save your interests.' }

    // DELETE
    if (normalized.includes('delete') || normalized.includes('remove') || normalized.includes('clear')) {
      profile.interests = []
      profile.markModified('interests')
      await profile.save()
      return { intent: null, reply: 'Done! I have cleared all your interests from the database.', dataSaved: true, entity: 'interests' }
    }

    let clean = original
    clean = clean.replace(/^(add|save|insert|set|update)\s+(my\s+)?/i, '')
    clean = clean.replace(/(interest|interests)\s*/i, '')
    clean = clean.replace(/^(is|as|to|in)\s+/i, '')
    clean = clean.trim()

    if (clean.length > 2 && clean.length < 100) {
      if (!profile.interests) profile.interests = []
      const exists = profile.interests.some(i => i.toLowerCase() === clean.toLowerCase())
      if (!exists) {
        profile.interests.push(clean)
        profile.markModified('interests')
        await profile.save()
      }
      return {
        intent: null,
        reply: `I have saved "${clean}" to your profile interests in the database!`,
        dataSaved: true,
        entity: 'interests',
      }
    }

    return {
      intent: null,
      reply: 'I can save your interests! Please tell me your area of interest, for example: "Add interest in Artificial Intelligence" or "Save interest in Web Development".',
    }
  }

  // ─────────────────────────────────────────────────────────
  // 7. HEADLINE / BIO
  // ─────────────────────────────────────────────────────────
  if (normalized.includes('headline') || normalized.includes('bio')) {
    if (!user?._id) return { intent: 'login', reply: 'Please log in to update your headline.' }

    let clean = original
    clean = clean.replace(/^(set|save|update|change)\s+(my\s+)?/i, '')
    clean = clean.replace(/(headline|bio)\s*/i, '')
    clean = clean.replace(/^(is|as|to)\s+/i, '')
    clean = clean.trim()
    const cleanHeadline = clean.length > 2 ? clean : 'Computer Science Graduate'

    profile.headline = cleanHeadline
    await profile.save()
    return {
      intent: null,
      reply: `Your profile headline has been updated to "${cleanHeadline}" in the database!`,
      dataSaved: true,
      entity: 'headline',
    }
  }

  // ─────────────────────────────────────────────────────────
  // 8. FEEDBACK
  // ─────────────────────────────────────────────────────────
  if (normalized.includes('feedback') || normalized.includes('submit feedback')) {
    // ASK for info
    if (!normalized.includes('save') && !normalized.includes('submit') && !normalized.includes(':') && normalized.split(' ').length < 5) {
      return {
        intent: null,
        reply: 'I can record your feedback directly! Just say your message, for example: "Submit feedback: Great platform experience" or "Save feedback the quiz was really helpful".',
      }
    }

    let clean = original
    clean = clean.replace(/^(submit|save|add)\s+(my\s+)?/i, '')
    clean = clean.replace(/(feedback|note|suggestion)\s*/i, '')
    clean = clean.replace(/^(is|:)\s*/i, '')
    clean = clean.trim()
    const msg = clean.length > 2 ? clean : original

    await Feedback.create({
      userId: user?._id || null,
      category: 'general',
      message: msg,
      status: 'new',
    }).catch(() => null)

    return {
      intent: null,
      reply: `Your feedback: "${msg}" has been recorded into the database. Thank you!`,
      dataSaved: true,
      entity: 'feedback',
    }
  }

  // ─────────────────────────────────────────────────────────
  // 9. KNOWLEDGE BASE — informational responses
  // ─────────────────────────────────────────────────────────
  const match = KNOWLEDGE_INTENTS.find(({ keys }) => keys.some((key) => normalized.includes(key)))
  if (match) return { intent: null, ...match }

  // ─────────────────────────────────────────────────────────
  // 10. FALLBACK — encourage user to try database features
  // ─────────────────────────────────────────────────────────
  return {
    intent: null,
    reply: `You said: "${original}". I can save this as your Work Experience, Education, Skill, Career Goal, Interest, or Location in the database. Or I can guide you through career roadmaps and quizzes. What would you like to do?`,
  }
}

export default { respondToIntent }
