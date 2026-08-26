const INTENTS = [
  { keys: ['career', 'careers', 'job', 'jobs'], intent: 'careers', reply: 'Open Career Bank to search, filter, compare, and save career paths.' },
  { keys: ['quiz', 'test', 'assessment'], intent: 'quiz', reply: 'Open the career quiz and answer the questions. Your result is scored on the server.' },
  { keys: ['recommend', 'match', 'matches'], intent: 'recommendations', reply: 'Your matches page shows explainable career recommendations based on your profile and quiz activity.' },
  { keys: ['save', 'saved', 'bookmark', 'bookmarks', 'note', 'notes'], intent: 'saved', reply: 'Saved and notes keeps the careers and learning items you bookmarked.' },
  { keys: ['resource', 'resources', 'pdf', 'document', 'documents', 'video', 'media'], intent: 'resources', reply: 'Resources contains documents and multimedia with transcripts, ratings, and download tracking.' },
  { keys: ['story', 'stories'], intent: 'stories', reply: 'Success stories lets you read approved community journeys or submit your own for review.' },
  { keys: ['profile', 'settings', 'preferences'], intent: 'profile', reply: 'Profile and settings is where you manage your interests, education, experience, notifications, privacy, and accessibility preferences.' },
]

export function respondToIntent(text) {
  const normalized = String(text || '').toLowerCase().trim()
  const match = INTENTS.find(({ keys }) => keys.some((key) => normalized.includes(key)))
  return (
    match || {
      intent: 'help',
      reply:
        'I can help you find careers, start the quiz, review matches, open resources, manage saved items, read stories, or update your profile.',
    }
  )
}

export default { respondToIntent }
