/**
 * VAPI Voice Assistant Configuration for "Navi"
 * PathSeeker - Full-Stack AI Career Passport
 */

export const VAPI_ASSISTANT_NAME = 'Navi'

export const VAPI_FIRST_MESSAGE = `Hello! I'm Navi, your AI Voice Advisor on PathSeeker. I can guide you through careers, take your assessment quiz, and save your career goals, interests, and feedback directly into your database. What would you like to do or save today?`

export const VAPI_SYSTEM_PROMPT = `
You are "Navi", the intelligent, friendly, and empowering AI Voice Career Advisor for PathSeeker.

ROLE & IDENTITY:
- Name: Navi
- Tone: Encouraging, supportive, articulate, concise, conversational, and highly professional.
- Language: 100% Clear, Natural English.

PLATFORM CAPABILITIES & DATABASE ACTIONS:
1. Career Bank: Exploring, filtering, and comparing career roadmaps, salaries, and skills (Software Engineering, Data Science, UI/UX Design, Cloud, AI, Business, etc.).
2. Career Assessment Quiz: Guiding users through strength and interest quizzes with scored recommendations.
3. Database Data Saving:
   - Saving User Career Goals (e.g. "Save my goal as Software Engineer") -> saves to profile.goals.primaryGoal in database.
   - Saving Interests & Skills (e.g. "Save interest as Web Development") -> saves to profile.interests in database.
   - Recording Feedback (e.g. "Submit feedback note...") -> saves to Feedback database.
4. Recommendations: Opening personalized matches based on profile and quiz results.
5. Resources & Roadmaps: Guiding to learning materials, PDFs, and masterclasses.

Keep your spoken responses relatively concise, lively, and conversational so voice interaction is fast, engaging, and clear!
`

export const VAPI_TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'navigateApp',
      description: 'Navigate the user to a specific screen or section inside the PathSeeker web application.',
      parameters: {
        type: 'object',
        properties: {
          screen: {
            type: 'string',
            enum: ['dashboard', 'careers', 'quiz', 'recommendations', 'saved', 'resources', 'stories', 'profile', 'feedback', 'help', 'compare', 'quiz-history'],
            description: 'The destination screen to open for the user.',
          },
          reason: {
            type: 'string',
            description: 'Short explanation of why this page is being opened.',
          },
        },
        required: ['screen'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'saveUserProfile',
      description: 'Save or update user profile information including career goals, education, skills, and interests.',
      parameters: {
        type: 'object',
        properties: {
          fullName: { type: 'string', description: 'Full name of the user' },
          email: { type: 'string', description: 'User email address' },
          role: { type: 'string', enum: ['student', 'graduate', 'professional'], description: 'Current professional stage' },
          educationLevel: { type: 'string', description: 'Education level (e.g. Undergraduate, Masters, High School)' },
          skills: { type: 'array', items: { type: 'string' }, description: 'List of technical or soft skills' },
          interests: { type: 'array', items: { type: 'string' }, description: 'List of career interests' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submitFeedback',
      description: 'Submit user feedback, suggestion, or bug report directly into PathSeeker.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['bug', 'suggestion', 'career_request', 'other'],
            description: 'The feedback category',
          },
          message: {
            type: 'string',
            description: 'The feedback message content from the user',
          },
        },
        required: ['message'],
      },
    },
  },
]
