import { domainIds, quizQuestionIds } from './ids.js'

const weights = {
  creative: [{ domainId: domainIds.design, weight: 3 }],
  analytical: [{ domainId: domainIds.dataAi, weight: 3 }, { domainId: domainIds.cybersecurity, weight: 1 }],
  people: [{ domainId: domainIds.business, weight: 3 }],
  technical: [{ domainId: domainIds.softwareEngineering, weight: 3 }, { domainId: domainIds.cybersecurity, weight: 2 }],
  communication: [{ domainId: domainIds.business, weight: 2 }, { domainId: domainIds.marketing, weight: 2 }],
  empathy: [{ domainId: domainIds.design, weight: 2 }, { domainId: domainIds.healthcare, weight: 2 }],
  organization: [{ domainId: domainIds.business, weight: 2 }, { domainId: domainIds.business, weight: 2 }],
}

function option(key, label, trait) {
  return { key, label, domainWeights: weights[trait] || [] }
}

export const quizQuestionsSeed = [
  { _id: quizQuestionIds.q1, order: 1, questionText: 'When you start a new project, what excites you most?', type: 'multiple_choice', options: [option('a', 'Sketching how it could look and feel', 'creative'), option('b', 'Figuring out the data behind it', 'analytical'), option('c', 'Rallying the team around a plan', 'people'), option('d', 'Figuring out how to build it', 'technical')], active: true },
  { _id: quizQuestionIds.q2, order: 2, questionText: 'In a group project, which role do you naturally take?', type: 'multiple_choice', options: [option('a', 'The one who explains ideas clearly', 'communication'), option('b', 'The one who checks in on how everyone feels', 'empathy'), option('c', 'The one who keeps everything on schedule', 'organization'), option('d', 'The one who leads and makes decisions', 'people')], active: true },
  { _id: quizQuestionIds.q3, order: 3, questionText: 'You are given a messy problem with no clear answer. What is your first move?', type: 'multiple_choice', options: [option('a', 'Break it into smaller, logical pieces', 'analytical'), option('b', 'Sketch a few different possible solutions', 'creative'), option('c', 'Try building a quick working version', 'technical'), option('d', 'Ask people affected what they actually need', 'empathy')], active: true },
  { _id: quizQuestionIds.q4, order: 4, questionText: 'What would make a work day feel genuinely satisfying?', type: 'multiple_choice', options: [option('a', 'Finishing everything on my to-do list', 'organization'), option('b', 'Having a great conversation that changes someone’s mind', 'communication'), option('c', 'Solving a tricky technical bug', 'technical'), option('d', 'Helping a teammate who was struggling', 'empathy')], active: true },
  { _id: quizQuestionIds.q5, order: 5, questionText: 'When learning a new skill, what pulls you in?', type: 'multiple_choice', options: [option('a', 'Understanding the underlying logic or numbers', 'analytical'), option('b', 'Making something visually interesting with it', 'creative'), option('c', 'Teaching it to someone else', 'communication'), option('d', 'Organizing it into a clear step-by-step system', 'organization')], active: true },
  { _id: quizQuestionIds.q6, order: 6, questionText: 'When a deadline is tight, what do you focus on first?', type: 'multiple_choice', options: [option('a', 'Making a clear plan and checklist', 'organization'), option('b', 'Getting the team aligned fast', 'people'), option('c', 'Just diving in and building', 'technical'), option('d', 'Making sure no one is left confused or stressed', 'empathy')], active: true },
  { _id: quizQuestionIds.q7, order: 7, questionText: 'Which achievement would make you proudest a year from now?', type: 'multiple_choice', options: [option('a', 'Built something technically impressive', 'technical'), option('b', 'Led a team to a great outcome', 'people'), option('c', 'Created something people found beautiful or useful', 'creative'), option('d', 'Became known as a clear, trusted communicator', 'communication')], active: true },
]
