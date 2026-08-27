import mongoose from 'mongoose'

const { ObjectId } = mongoose.Types

function deterministicId(namespace, sequence) {
  return new ObjectId(`${namespace}${sequence.toString(16).padStart(23, '0')}`)
}

export const skillIds = Object.freeze({
  javascript: deterministicId('1', 1),
  python: deterministicId('1', 2),
  sql: deterministicId('1', 3),
  react: deterministicId('1', 4),
  apiDesign: deterministicId('1', 5),
  dataAnalysis: deterministicId('1', 6),
  cybersecurity: deterministicId('1', 7),
  cloudComputing: deterministicId('1', 8),
  uxResearch: deterministicId('1', 9),
  uiDesign: deterministicId('1', 10),
  prototyping: deterministicId('1', 11),
  seo: deterministicId('1', 12),
  contentStrategy: deterministicId('1', 13),
  financialAnalysis: deterministicId('1', 14),
  projectManagement: deterministicId('1', 15),
  productStrategy: deterministicId('1', 16),
  communication: deterministicId('1', 17),
  teamwork: deterministicId('1', 18),
  leadership: deterministicId('1', 19),
  criticalThinking: deterministicId('1', 20),
  problemSolving: deterministicId('1', 21),
  creativity: deterministicId('1', 22),
  empathy: deterministicId('1', 23),
  presentation: deterministicId('1', 24),
  research: deterministicId('1', 25),
  businessAnalysis: deterministicId('1', 26),
  digitalMarketing: deterministicId('1', 27),
  teaching: deterministicId('1', 28),
  networkSecurity: deterministicId('1', 29),
  machineLearning: deterministicId('1', 30),
  statistics: deterministicId('1', 31),
  dataVisualization: deterministicId('1', 32),
  cloudInfrastructure: deterministicId('1', 33),
  devOps: deterministicId('1', 34),
  softwareTesting: deterministicId('1', 35),
  testAutomation: deterministicId('1', 36),
  riskManagement: deterministicId('1', 37),
  patientCare: deterministicId('1', 38),
  clinicalPractice: deterministicId('1', 39),
  engineeringDesign: deterministicId('1', 40),
  cad: deterministicId('1', 41),
  instructionalDesign: deterministicId('1', 42),
  learningAssessment: deterministicId('1', 43),
  stakeholderManagement: deterministicId('1', 44),
})

export const domainIds = Object.freeze({
  softwareEngineering: deterministicId('2', 1),
  dataAi: deterministicId('2', 2),
  design: deterministicId('2', 3),
  healthcare: deterministicId('2', 4),
  finance: deterministicId('2', 5),
  marketing: deterministicId('2', 6),
  education: deterministicId('2', 7),
  engineering: deterministicId('2', 8),
  business: deterministicId('2', 9),
  cybersecurity: deterministicId('2', 10),
})

export const userIds = Object.freeze({
  superAdmin: deterministicId('3', 1),
  student: deterministicId('3', 2),
  graduate: deterministicId('3', 3),
  professional: deterministicId('3', 4),
})

export const profileIds = Object.freeze({
  student: deterministicId('4', 1),
  graduate: deterministicId('4', 2),
  professional: deterministicId('4', 3),
})

export const careerIds = Object.freeze({
  uxDesigner: deterministicId('5', 1),
  dataAnalyst: deterministicId('5', 2),
  softwareEngineer: deterministicId('5', 3),
  digitalMarketer: deterministicId('5', 4),
  cybersecurityAnalyst: deterministicId('5', 5),
  productManager: deterministicId('5', 6),
  dataScientist: deterministicId('5', 7),
  projectManager: deterministicId('5', 8),
  financialAnalyst: deterministicId('5', 9),
  registeredNurse: deterministicId('5', 10),
  mechanicalEngineer: deterministicId('5', 11),
  learningDesigner: deterministicId('5', 12),
  qaEngineer: deterministicId('5', 13),
  businessAnalyst: deterministicId('5', 14),
  cloudEngineer: deterministicId('5', 15),
})

export const quizQuestionIds = Object.freeze({
  q1: deterministicId('6', 1),
  q2: deterministicId('6', 2),
  q3: deterministicId('6', 3),
  q4: deterministicId('6', 4),
  q5: deterministicId('6', 5),
  q6: deterministicId('6', 6),
  q7: deterministicId('6', 7),
})

export const quizIds = Object.freeze({
  careerPassportV1: deterministicId('7', 1),
})
