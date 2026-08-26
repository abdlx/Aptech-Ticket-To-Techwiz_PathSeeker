import { domainIds, feedbackIds, storyIds, userIds } from './ids.js'

export const storiesSeed = [
  { _id: storyIds.aisha, submittedBy: userIds.student, authorName: 'Aisha Rahman', domainId: domainIds.design, storyText: 'I started with a psychology background and wanted people-centered work. A small UX research project helped me test the direction before committing to a new career path.', status: 'approved', approvedBy: userIds.superAdmin, approvedAt: new Date('2026-08-10T10:00:00Z') },
  { _id: storyIds.daniel, submittedBy: userIds.professional, authorName: 'Daniel Kim', domainId: domainIds.dataAi, storyText: 'My finance background gave me context for data analysis. I built small projects, strengthened SQL, and used those projects to make a deliberate transition.', status: 'approved', approvedBy: userIds.superAdmin, approvedAt: new Date('2026-08-11T10:00:00Z') },
]

export const feedbackSeed = [
  { _id: feedbackIds.sample, userId: userIds.student, category: 'suggestion', message: 'A side-by-side career comparison would make decisions easier.', status: 'open' },
]
