# PathSeeker

PathSeeker is a MERN Career Passport application for students, graduates, and working professionals. The current implementation includes secure server-side sessions, profile onboarding, a persistent career catalog, a versioned career assessment, deterministic Career Passport generation, explainable recommendations, skill-gap analysis, and a stateless Career Simulator.

## Repository layout

- `Project/frontend` — React 19, React Router, TanStack Query, Zustand, React Hook Form, Zod, and Vite.
- `Project/backend1` — Express, Mongoose, session authentication, domain services, deterministic seeds, and Node tests.
- `PathSeeker_Career_Passport_SRS_Clean.md` — authoritative SRS.
- `Project/PATHSEEKER_COMPLETION_PROMPT.md` — engineering completion specification.

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB 7 or newer, listening locally or reachable through a MongoDB URI

## Local installation

Backend:

```powershell
cd Project\backend1
Copy-Item .env.example .env
npm.cmd ci
npm.cmd run seed
npm.cmd start
```

The API listens on `http://localhost:4000` by default. Verify `GET /api/health` and `GET /api/health/db` before starting a full browser journey.

Frontend, in another terminal:

```powershell
cd Project\frontend
Copy-Item .env.example .env
npm.cmd ci
npm.cmd run dev
```

The Vite development server proxies `/api` to the backend. Keep `VITE_API_URL=/api` for the normal local same-origin proxy flow.

## Deterministic demo accounts

The seed creates these users:

- `admin@pathseeker.local` — super administrator
- `demo.student@pathseeker.local` — student
- `demo.graduate@pathseeker.local` — graduate
- `demo.professional@pathseeker.local` — professional

All use the password supplied through `SEED_DEMO_PASSWORD`. The `.env.example` value is development-only and must be replaced outside a local demo.

## Architecture

The primary request flow is:

```text
React page → TanStack Query/service module → apiClient → Express route
→ authentication/authorization → controller → domain service → Mongoose → MongoDB
```

Server records remain in TanStack Query. Zustand contains only resumable client workflows and accessibility preferences. The backend calculates all Career Passport, match, readiness, and simulation values; the browser never submits authoritative scores.

## Career intelligence algorithms

- `passport-v1` converts immutable assessment answer snapshots into normalized trait/domain signals and combines them with saved profile skills.
- `recommendation-v1` calculates Career Match from assessment signals, interests, and skill affinity.
- Career Readiness is calculated separately from the user's current level versus each career's required skill level and importance.
- Career Simulator requests are stateless. They return before/after scores and never mutate the saved profile, passport, or recommendation snapshot.

Published quiz versions and completed-attempt question snapshots preserve historical explainability. Recommendation snapshots are immutable per Career Passport calculation.

## Main collections

Identity and profile: `users`, `sessions`, `verificationTokens`, `userProfiles`, `careerPassports`.

Career intelligence: `careers`, `domains`, `skills`, `quizzes`, `quizAttempts`, `recommendationSnapshots`.

Activity and community: `bookmarks`, `savedFilters`, `recentlyViewed`, `comparisons`, `notifications`, `successStories`, `feedback`, `auditLogs`, `settings`.

Legacy `quizQuestions`, `resources`, `multimedia`, and `mediaRatings` remain for compatibility while their admin/content migration is incomplete.

## Verification

```powershell
cd Project\backend1
npm.cmd test

cd ..\frontend
npm.cmd test -- --run
npm.cmd run lint
npm.cmd run build
```

Live MongoDB verification requires `TEST_MONGODB_URI` and `TEST_MONGODB_DB_NAME` pointing to a disposable database. Never use a database containing important data for integration tests or `seed:reset`.

## Current limitations

The repository is not fully SRS-complete. MongoDB is not bundled; live persistence and browser journeys require a running instance. Several content, community, notification, saved-item, and admin screens still need complete API migration. Unified `contentItems`, production object storage, real email delivery, the external voice provider, full Playwright/accessibility/security suites, submission report artifacts, hosting, and the mandatory demonstration video remain outstanding.
