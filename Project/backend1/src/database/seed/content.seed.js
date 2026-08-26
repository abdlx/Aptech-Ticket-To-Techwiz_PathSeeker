import mongoose from 'mongoose'
import { careerIds, domainIds, userIds } from './ids.js'

const { ObjectId } = mongoose.Types

function deterministicId(namespace, sequence) {
  return new ObjectId(`${namespace}${sequence.toString(16).padStart(23, '0')}`)
}

export const resourceIds = Object.freeze({
  r1: deterministicId('8', 1),
  r2: deterministicId('8', 2),
  r3: deterministicId('8', 3),
  r4: deterministicId('8', 4),
  r5: deterministicId('8', 5),
  r6: deterministicId('8', 6),
})

export const mediaIds = Object.freeze({
  m1: deterministicId('9', 1),
  m2: deterministicId('9', 2),
  m3: deterministicId('9', 3),
  m4: deterministicId('9', 4),
})

export const storyIds = Object.freeze({
  s1: deterministicId('a', 1),
  s2: deterministicId('a', 2),
  s3: deterministicId('a', 3),
})

export const notificationIds = Object.freeze({
  n1: deterministicId('b', 1),
  n2: deterministicId('b', 2),
  n3: deterministicId('b', 3),
  n4: deterministicId('b', 4),
})

export const resourcesSeed = [
  {
    _id: resourceIds.r1,
    title: 'Career Decision Workbook',
    description: 'A practical, 18-page guided workbook for comparing career possibilities, evaluating fit, and planning your next experiment.',
    type: 'pdf',
    file: {
      url: '/assets/documents/career-decision-workbook.pdf',
      mimeType: 'application/pdf',
      filename: 'career-decision-workbook.pdf',
      sizeBytes: 2_450_000,
    },
    pageCount: 18,
    tags: ['All careers', 'Planning', 'Decision making', 'Workbook'],
    targetAudience: ['student', 'graduate', 'professional'],
    downloadCount: 142,
    active: true,
    createdBy: userIds.superAdmin,
  },
  {
    _id: resourceIds.r2,
    title: 'UX Design Interview & Case Study Checklist',
    description: 'Step-by-step checklist to structure research interviews, validate user problems, and present case study results with confidence.',
    type: 'checklist',
    file: {
      url: '/assets/documents/ux-interview-checklist.pdf',
      mimeType: 'application/pdf',
      filename: 'ux-interview-checklist.pdf',
      sizeBytes: 890_000,
    },
    pageCount: 6,
    tags: ['UX Design', 'Design', 'Interview', 'Checklist'],
    targetAudience: ['student', 'graduate'],
    downloadCount: 98,
    active: true,
    createdBy: userIds.superAdmin,
  },
  {
    _id: resourceIds.r3,
    title: 'Junior Data Analyst 90-Day Roadmap',
    description: 'Actionable milestone guide covering SQL practice sets, business metrics modeling, and presentation decks for early-career analysts.',
    type: 'template',
    file: {
      url: '/assets/documents/data-analyst-roadmap.pdf',
      mimeType: 'application/pdf',
      filename: 'data-analyst-roadmap.pdf',
      sizeBytes: 1_200_000,
    },
    pageCount: 10,
    tags: ['Data & Business', 'Data Analysis', 'Roadmap'],
    targetAudience: ['graduate', 'professional'],
    downloadCount: 215,
    active: true,
    createdBy: userIds.superAdmin,
  },
  {
    _id: resourceIds.r4,
    title: 'High-Impact Portfolio Guide for Tech & Design',
    description: 'Learn how recruiters scan portfolios, how to frame non-linear experience, and what makes project case studies stand out.',
    type: 'infographic',
    file: {
      url: '/assets/documents/portfolio-guide.pdf',
      mimeType: 'application/pdf',
      filename: 'portfolio-guide.pdf',
      sizeBytes: 1_650_000,
    },
    pageCount: 12,
    tags: ['Career change', 'Portfolio', 'Design', 'Engineering'],
    targetAudience: ['student', 'graduate', 'professional'],
    downloadCount: 310,
    active: true,
    createdBy: userIds.superAdmin,
  },
  {
    _id: resourceIds.r5,
    title: 'Tech Skills Gap Analysis & Practice Template',
    description: 'Self-assessment spreadsheet template to rate your current proficiencies against target role benchmarks.',
    type: 'template',
    file: {
      url: '/assets/documents/skills-gap-template.pdf',
      mimeType: 'application/pdf',
      filename: 'skills-gap-template.pdf',
      sizeBytes: 740_000,
    },
    pageCount: 4,
    tags: ['Skill-building', 'Assessment', 'Template'],
    targetAudience: ['student', 'graduate', 'professional'],
    downloadCount: 87,
    active: true,
    createdBy: userIds.superAdmin,
  },
]

export const mediaSeed = [
  {
    _id: mediaIds.m1,
    title: 'A Day in the Life of a Data Analyst',
    type: 'video',
    url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    transcript: '00:00 - Sam: Most days start with a question, not a spreadsheet. Today our product team wants to understand why new users drop off during setup.\n03:18 - Sam: Cleaning data is less glamorous than the chart, but it is where careful thinking matters most.\n05:46 - Sam: The goal is not to show everything you found. It is to help someone make a better decision.',
    tags: ['Data & Business', 'Data Analysis', 'Video', 'Career Day'],
    relatedCareerIds: [careerIds.dataAnalyst],
    ratingAvg: 4.8,
    ratingCount: 45,
    active: true,
    createdBy: userIds.superAdmin,
  },
  {
    _id: mediaIds.m2,
    title: 'Think Like a UX Designer: Foundations Mini Course',
    type: 'video',
    url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    transcript: '00:00 - Maya: Human-centered design is not about making buttons pretty; it begins by deeply listening to user pain points.\n04:15 - Maya: We map customer journeys to spot invisible friction and test simple wireframe prototypes early.',
    tags: ['UX Design', 'Design', 'Video', 'Mini Course'],
    relatedCareerIds: [careerIds.uxDesigner],
    ratingAvg: 4.9,
    ratingCount: 62,
    active: true,
    createdBy: userIds.superAdmin,
  },
  {
    _id: mediaIds.m3,
    title: 'How I Broke into Product Design: Podcast Interview',
    type: 'audio',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    transcript: '00:00 - Luis: I spent three years in hospitality before transitioning to design. The customer empathy I developed was my secret weapon.',
    tags: ['Design', 'Career Change', 'Podcast'],
    relatedCareerIds: [careerIds.uxDesigner, careerIds.productManager],
    ratingAvg: 4.7,
    ratingCount: 29,
    active: true,
    createdBy: userIds.superAdmin,
  },
  {
    _id: mediaIds.m4,
    title: 'The Skills Employers Need Next in 2026',
    type: 'audio',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    transcript: '00:00 - Host: Today we explore why cross-disciplinary versatility and continuous learning define modern career trajectories.',
    tags: ['Future of Work', 'Skills', 'Podcast'],
    relatedCareerIds: [careerIds.softwareEngineer, careerIds.productManager],
    ratingAvg: 4.6,
    ratingCount: 18,
    active: true,
    createdBy: userIds.superAdmin,
  },
]

export const storiesSeed = [
  {
    _id: storyIds.s1,
    submittedBy: userIds.graduate,
    authorName: 'Aisha Rahman',
    domainId: domainIds.design,
    storyText: 'After graduating with a psychology degree, I knew I wanted people-centered work but could not see how my background connected to technology. A PathSeeker quiz surfaced UX design and research roles. Instead of enrolling in another long degree, I tested the waters with a small campus project. Once I stopped trying to hide my background, everything clicked. Understanding people was exactly the point. Four months later, I accepted my first junior UX role at Looma.',
    image: {
      url: '/assets/avatars/aisha.png',
      mimeType: 'image/png',
      filename: 'aisha.png',
    },
    status: 'approved',
    approvedBy: userIds.superAdmin,
    approvedAt: new Date('2026-08-20T10:00:00Z'),
  },
  {
    _id: storyIds.s2,
    submittedBy: userIds.professional,
    authorName: 'Daniel Kim',
    domainId: domainIds.dataAi,
    storyText: 'I worked in retail logistics for five years and realized I enjoyed the spreadsheet optimization far more than floor operations. PathSeeker gave me a structured roadmap to learn SQL and Python while keeping my day job. Within 8 months, I pivoted into a Data Analyst position helping our supply chain forecasting team.',
    image: {
      url: '/assets/avatars/daniel.png',
      mimeType: 'image/png',
      filename: 'daniel.png',
    },
    status: 'approved',
    approvedBy: userIds.superAdmin,
    approvedAt: new Date('2026-08-22T14:30:00Z'),
  },
  {
    _id: storyIds.s3,
    submittedBy: userIds.student,
    authorName: 'Fatima Noor',
    domainId: domainIds.softwareEngineering,
    storyText: 'As a pre-engineering student, I felt overwhelmed by conflicting advice on web dev vs AI vs systems. PathSeeker’s Career Simulator showed me how frontend fundamentals combine with product thinking. Building my first open-source project gave me the confidence to secure a competitive software engineering internship.',
    image: {
      url: '/assets/avatars/fatima.png',
      mimeType: 'image/png',
      filename: 'fatima.png',
    },
    status: 'approved',
    approvedBy: userIds.superAdmin,
    approvedAt: new Date('2026-08-24T09:15:00Z'),
  },
]

export const notificationsSeed = [
  {
    _id: notificationIds.n1,
    userId: userIds.student,
    type: 'match',
    title: 'Your career matches are ready',
    body: 'Navi found top career paths that align with your latest assessment signals and profile strengths.',
    icon: 'sparkles',
    read: false,
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    _id: notificationIds.n2,
    userId: userIds.student,
    type: 'resource',
    title: 'A saved resource has a new lesson',
    body: 'UX Research: Start with Why added a practical interview worksheet.',
    icon: 'book',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    _id: notificationIds.n3,
    userId: userIds.student,
    type: 'feedback',
    title: 'The PathSeeker team replied',
    body: 'Your career comparison suggestions have been added to our roadmap.',
    icon: 'message',
    read: true,
    readAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    _id: notificationIds.n4,
    userId: userIds.student,
    type: 'reminder',
    title: 'Keep your Career Passport current',
    body: 'Add one recent project or skill to improve your compatibility score.',
    icon: 'target',
    read: true,
    readAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
]
