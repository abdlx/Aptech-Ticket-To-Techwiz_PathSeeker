import { contentIds, userIds } from './ids.js'

export const resourcesSeed = [
  { _id: contentIds.workbook, title: 'Career decision workbook', description: 'A practical workbook for comparing career options and planning a next experiment.', type: 'pdf', file: { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', mimeType: 'application/pdf', originalName: 'career-decision-workbook.pdf' }, pageCount: 18, tags: ['Beginner', 'Skill-Building'], targetAudience: ['student', 'graduate', 'professional'], active: true, createdBy: userIds.superAdmin },
]

export const mediaSeed = [
  { _id: contentIds.uxCourse, title: 'Think like a UX designer', type: 'video', url: 'https://www.youtube.com/watch?v=9BdtGjoIN4E', transcript: 'A practical introduction to human-centered design and user research.', tags: ['Design', 'Beginner'], active: true, createdBy: userIds.superAdmin },
  { _id: contentIds.analystVideo, title: 'A day in the life of a data analyst', type: 'video', url: 'https://www.youtube.com/watch?v=5ZbR7m0Qv7Y', transcript: 'A walkthrough of cleaning data, building a report, and presenting a recommendation.', tags: ['Data', 'Business'], active: true, createdBy: userIds.superAdmin },
]
