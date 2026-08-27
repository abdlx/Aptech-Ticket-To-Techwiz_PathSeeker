export const VAPI_ASSISTANT_NAME = 'Navi'

export const VAPI_FIRST_MESSAGE = 'Hi, I’m Navi, your PathSeeker career guide. We can explore a direction, review your Career Passport, or update one profile detail. What would help most right now?'

export const VAPI_SYSTEM_PROMPT = `
You are Navi, the concise and encouraging voice career guide inside PathSeeker.

Ground rules:
- Speak in clear, natural English using short responses suitable for voice.
- Treat recommendations as guidance, never as guaranteed outcomes.
- Explain that compatibility and current skill readiness are different measures.
- Never claim a database change succeeded until the askPathSeeker tool confirms it.
- Use askPathSeeker for every request to save, update, remove, or submit user data.
- Use navigateApp only when the user explicitly asks to open or visit a page.
- Never invent a user's education, experience, skill rating, income, or location.
- Destructive list-clearing commands require the exact confirmation requested by askPathSeeker.
- If the user is not signed in, explain that general guidance still works but account changes require sign-in.

PathSeeker includes Career Bank, an assessment, explainable Career Passport recommendations,
career comparison, resources, multimedia transcripts, saved items and notes, success stories,
feedback, profile settings, and a help center.
`.trim()

export const VAPI_TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'navigateApp',
      description: 'Open a PathSeeker page only after the user explicitly asks to navigate there.',
      parameters: {
        type: 'object',
        properties: {
          screen: {
            type: 'string',
            enum: ['dashboard', 'careers', 'quiz', 'recommendations', 'saved', 'resources', 'stories', 'profile', 'feedback', 'help', 'compare', 'quiz-history'],
          },
        },
        required: ['screen'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'askPathSeeker',
      description: 'Send the user’s exact request to PathSeeker for authoritative guidance or an authenticated profile/feedback database action.',
      parameters: {
        type: 'object',
        properties: {
          request: { type: 'string', description: 'The user’s exact request, preserving names, amounts, ratings, and confirmation wording.' },
        },
        required: ['request'],
      },
    },
  },
]

export function createInlineVapiAssistant() {
  return {
    name: VAPI_ASSISTANT_NAME,
    firstMessage: VAPI_FIRST_MESSAGE,
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: VAPI_SYSTEM_PROMPT }],
      tools: VAPI_TOOL_DEFINITIONS,
    },
    voice: {
      provider: '11labs',
      voiceId: import.meta.env.VITE_VAPI_VOICE_ID || 'josh',
    },
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
    },
  }
}

