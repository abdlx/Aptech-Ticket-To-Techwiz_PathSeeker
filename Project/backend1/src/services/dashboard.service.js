import {
  Bookmark,
  Career,
  CareerPassport,
  QuizAttempt,
  RecommendationSnapshot,
  RecentlyViewed,
  UserProfile,
} from '../models/index.js'

export async function getDashboard(user) {
  const [profile, passport, attempts, bookmarkCount, bookmarks, recentActivity, trendingCareers] = await Promise.all([
    UserProfile.findOne({ userId: user.id }),
    CareerPassport.findOne({ userId: user.id }).sort({ calculatedAt: -1 }).populate('skills.skillId', 'name slug'),
    QuizAttempt.find({ userId: user.id }).sort({ createdAt: -1 }).limit(3).populate('topCareerId', 'title slug'),
    Bookmark.countDocuments({ userId: user.id }),
    Bookmark.find({ userId: user.id }).sort({ createdAt: -1 }).limit(4).populate('itemId'),
    RecentlyViewed.find({ userId: user.id }).sort({ viewedAt: -1 }).limit(5).populate('itemId'),
    Career.find({ active: true, status: 'published' }).sort({ growthRatePercent: -1, title: 1 }).limit(4).populate('domainId', 'name slug'),
  ])
  const snapshot = passport
    ? await RecommendationSnapshot.findOne({ passportId: passport._id }).populate({
      path: 'matches.careerId',
      populate: [{ path: 'domainId', select: 'name slug' }, { path: 'requiredSkills.skillId', select: 'name slug' }],
    })
    : null

  return {
    user: { name: user.name, stage: user.stage },
    profile: {
      headline: profile?.headline,
      onboardingStatus: profile?.onboarding?.status,
      completionPercent: passport?.completionPercent || 0,
    },
    passport,
    topMatches: snapshot?.matches?.slice(0, 3) || [],
    latestAttempt: attempts[0] || null,
    attemptCount: attempts.filter(({ status }) => status === 'completed').length,
    bookmarkCount,
    bookmarks,
    recentActivity,
    trendingCareers,
  }
}

export default { getDashboard }
