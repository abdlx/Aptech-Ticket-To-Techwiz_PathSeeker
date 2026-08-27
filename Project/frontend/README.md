# PathSeeker frontend

## Navi voice assistant

Navi supports three deliberate interaction paths:

- **Cloud conversation** uses Vapi for a continuous spoken session when `VITE_VAPI_PUBLIC_KEY` is configured.
- **Browser voice** uses the browser's speech recognition and speech synthesis APIs without starting a cloud call.
- **Typed chat** is always available and sends requests to PathSeeker's assistant API.

Copy `.env.example` to `.env` and configure the values needed for your environment:

```env
VITE_API_URL=/api
VITE_VAPI_PUBLIC_KEY=
VITE_VAPI_ASSISTANT_ID=
VITE_VAPI_VOICE_ID=josh
```

`VITE_VAPI_ASSISTANT_ID` is optional. Without it, Navi uses the versioned inline assistant configuration in `src/voiceAgent/vapiAssistantConfig.js`. Never place a private provider key in a Vite environment variable; Vite variables are visible to the browser.

The microphone starts only after the user presses the microphone button. Profile changes and feedback are validated and executed by the authenticated backend; the browser does not write database records directly. Destructive list-clearing commands require explicit confirmation.

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

For the most reliable browser speech recognition, use a current Chromium-based browser and allow microphone access for the site. Typed chat remains available when speech recognition is unsupported or permission is denied.
