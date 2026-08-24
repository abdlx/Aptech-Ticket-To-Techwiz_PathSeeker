# PathSeeker Full-Stack Project Task Sheet

> Based on `PathSeeker_Career_Passport_SRS_Clean.md` and an audit of the repository on 24 August 2026.
>
> This is a living checklist. Update it whenever a feature is completed, tested, or its scope changes.

## Status key

- [x] **Done** — present in the repository and usable at the stated level.
- [ ] **To do** — not implemented or not yet verified.
- **UI only** — the screen and local interactions exist, but it still uses fixture data or temporary React state.
- **Connected** — the frontend, Express API, and MongoDB persistence work together.
- **Optional** — identified as optional or advanced in the SRS; complete required work first.

## Current project snapshot

| Area | Current status | Honest assessment |  
| --- | --- | --- |
| React frontend foundation | Done | React 19 and Vite are configured. ESLint passes. |
| Public, authentication, user, and admin screens | UI only | A wide screen set exists and is navigable, but it is a prototype rather than an end-to-end application. |
| Responsive design | Done at UI level | Desktop and mobile layouts, mobile navigation, visible focus styles, and reduced-motion styles are present. |
| Frontend data | UI only | Careers, resources, stories, quiz questions, and several extended features use fixtures or component state. |
| API client boundary | Partly done | `frontend/src/services/pathseekerApi.js` defines an API root, endpoints, cookie-ready requests, and fixture records. Pages do not call `apiRequest()` yet. |
| Express backend | Not started | No server folder, Express app, controllers, routes, middleware, or backend dependencies exist. |
| MongoDB database | Not started | No database connection, Mongoose models, migrations/index setup, or seed scripts exist. |
| Authentication and authorization | Not started | Login and recovery screens exist, but accounts, password hashing, sessions/tokens, email verification, and role checks do not. |
| File/media storage | Not started | Upload, validation, storage, preview URLs, download tracking, and cleanup are not connected. |
| Automated testing | Not started | No frontend, API, integration, accessibility, or end-to-end test suite exists. |
| Production build | Needs re-verification | ESLint passes. The audit build reached compilation but could not clean the existing locked `frontend/dist/assets` directory. |
| Documentation and submission package | Mostly not started | The SRS and screen map exist; installation guide, database design, test data, credentials, diagrams, report, demo video, and submission package remain. |

## Definition of “complete”

A feature is only fully complete when all relevant layers are finished:

1. The page works on desktop and mobile.
2. The frontend validates input and shows loading, empty, success, and error states.
3. The page calls the Express API instead of fixture data.
4. The API validates and authorizes the request.
5. MongoDB saves or retrieves the correct data with suitable indexes.
6. Automated tests cover the normal path and important failure cases.
7. The feature has been manually verified with Student, Graduate, Professional, and Admin accounts where relevant.

---

# 1. Frontend task sheet

## 1.1 Frontend foundation and shared experience

- [x] React/Vite application scaffold exists in `frontend/`.
- [x] Shared application shell, sidebar/header, mobile menu, reusable icons, common page headings, cards, tables, forms, and Navi components exist.
- [x] Query-string navigation and browser back/forward handling exist.
- [x] A central Express-ready request helper and endpoint map exist.
- [x] Desktop and mobile screenshots exist for the main showcase screens.
- [x] ESLint passes as of this audit.
- [ ] Replace the query-string screen switch with React Router routes, route parameters, a not-found page, and lazy-loaded page bundles.
- [ ] Add protected user routes and protected admin routes.
- [ ] Add a global authentication/session provider.
- [ ] Add a global API error boundary and friendly fallback screen.
- [ ] Add consistent loading skeletons, empty states, retry actions, and toast messages.
- [ ] Move all fixture data behind API service modules or a development-only mock layer.
- [ ] Add `.env.example` with `VITE_API_URL` and document local/production values.
- [ ] Configure Vite development proxying to the Express server, if using same-site cookies locally.
- [ ] Re-run and record a clean production build after the locked `frontend/dist` process is resolved.
- [ ] Add the mandatory sitemap to the home page, not only as a developer Markdown file.

## 1.2 Public, onboarding, and authentication pages

Every page below exists visually. None is connected to real authentication yet.

| Page | UI | Still required for full completion |
| --- | --- | --- |
| Welcome | Done | Load featured careers/resources from API; add visible sitemap link/section; verify all calls to action. |
| Sign up | UI only | Submit to API, validate duplicate email, choose Student/Graduate/Professional role, accept terms, create account, and start verification. |
| Log in | UI only | Submit credentials, establish secure session, load current user, redirect by role, and show invalid/locked account errors. |
| Guided onboarding | UI only | Save stage, interests, goals, education, and preferences to the user profile. Support resume upload if enabled. |
| Forgot password | UI only | Request a time-limited reset token without revealing whether an email exists. |
| Reset password | UI only | Verify token, enforce password rules, update the hash, revoke old sessions, and confirm success. |
| Verify email | UI only | Verify OTP/token, support resend cooldown and expiry, and update account status. |
| Admin login | UI only | Authenticate Admin accounts and redirect into a protected admin area. |

Authentication frontend tasks:

- [ ] Add client-side validation with field-level messages and accessible error summaries.
- [ ] Add pending/disabled button states to prevent duplicate submissions.
- [ ] Restore the current session after refresh via `GET /api/auth/me`.
- [ ] Add logout and session-expired handling.
- [ ] Add an unauthorized page and a forbidden page.
- [ ] Never store raw passwords or long-lived authentication secrets in local storage.

## 1.3 User Career Passport pages

| Page/module | UI | Still required for full completion |
| --- | --- | --- |
| Dashboard | UI only | Load greeting, progress, recent activity, latest quiz result, bookmarks, trending careers, and personalized picks from APIs. |
| Interest quiz | UI only | Fetch published questions, support all required question types, enforce optional timer, save progress/attempt, score on server, and handle refresh/resume. |
| Recommendations | UI only | Use saved profile, quiz answers, and interactions; store result explanations; connect save actions. |
| Career Bank | UI only | Server pagination, multi-level filters, sorting, smart search/autocomplete, spell correction or a simpler approved equivalent, and saved filters. |
| Career detail | UI only | Fetch by slug/ID, record view history, show related content, and connect bookmark/share actions. |
| Compare careers | UI only | Select persisted careers, compare live fields, share/restore comparison, and handle missing records. |
| Saved filters | UI only | CRUD through the API; apply saved filters; optionally schedule alerts. |
| Quiz history | UI only | Fetch the signed-in user's attempts with pagination. |
| Quiz result detail | UI only | Fetch an authorized attempt and its scoring breakdown. |
| Recently viewed | UI only | Record and fetch history; clear one item or all history; honor privacy controls. |
| Resources library | UI only | Fetch categorized/tagged media and documents; search/filter; track views/downloads; connect progress. |
| Multimedia detail/player | UI only | Stream real media, load transcript, persist rating, calculate rating average, and load related content. |
| Document preview | UI only | Load an authorized file URL/preview, download safely, and record view/download counts. |
| Saved items and notes | UI only | Bookmark careers/resources/media; CRUD notes; filter items; synchronize across devices. |
| Success stories | UI only | Fetch approved stories and filter by domain. |
| Success story detail | UI only | Fetch approved story and its timeline by slug/ID. |
| Submit success story | UI only | Save draft/submission, validate consent, upload permitted image, and set status to pending review. |
| Feedback | UI only | Save category, rating/message/context, contact consent, and show a real reference/status. |
| Notifications | UI only | Fetch notifications, mark read/unread, mark all read, and link to related records. |
| Profile and settings | UI only | Load/update profile, education, skills, interests, experience, avatar/resume, accessibility, notifications, privacy, and account controls. |
| Help center | UI only | Load searchable managed help content and connect a support/feedback action. |
| Navi voice mode | UI demonstration | Add real microphone permission, speech recognition, transcript/error states, backend intent or guidance processing, speech output, privacy notice, and non-voice fallback. |

Cross-feature user tasks:

- [ ] Add real bookmark toggling everywhere a save button appears.
- [ ] Add note create/edit/delete with ownership checks.
- [ ] Export bookmarks and notes as a real PDF.
- [ ] Add email/social sharing using safe public URLs.
- [ ] Add “If you liked this…” related-career/content results.
- [ ] Track interactions needed for recommendations without collecting unnecessary personal data.
- [ ] Add dark mode and persist the preference.
- [ ] Add font-size/accessibility preference and persist it.
- [ ] Add breadcrumbs on nested pages.
- [ ] Verify keyboard-only use, screen-reader labels, color contrast, media captions/transcripts, and reduced motion.

## 1.4 Admin pages

Every admin page below exists visually, but its data and actions are not protected or persisted.

| Admin page/module | UI | Still required for full completion |
| --- | --- | --- |
| Overview | UI only | Live totals for users, active users, quiz attempts, popular careers/content, and recent activity. |
| Users | UI only | Server search/filter/pagination; view/edit role/status; suspend/reactivate; protect last-admin access. |
| User editor | UI only | Load and update permitted fields with validation and an audit record. |
| Career profiles | UI only | List/search/filter/paginate and perform draft/publish/archive/delete actions. |
| Career editor | UI only | Create/update all career, skills, salary, demand, education, roadmap, SEO, and publication fields. |
| Content library | UI only | List and manage video/audio/document/explainer records, tags, publication state, and files. |
| Content editor | UI only | Upload or link media safely, edit transcript/metadata/tags/audience, preview, and publish. |
| Quiz builder | UI only | CRUD questions/options/weights/signals, reorder, validate scoring, preview, version, and publish. |
| Success stories | UI only | Review queue with search/status filters and moderation actions. |
| Story review | UI only | Edit, request changes, approve/reject/publish/feature with consent record and reviewer identity. |
| Feedback inbox | UI only | Triage, assign, reply, add internal notes, change status, and notify the user. |
| Feedback analytics | UI only | Calculate sentiment/ratings/categories/status/resolution time from real feedback. |
| Admin settings | UI only | Persist workspace, team, notification, security, and data settings with strict permissions. |
| Admin help | UI only | Managed help content or links to operational documentation. |

Admin-wide tasks:

- [ ] Require authenticated Admin role on every `/api/admin/*` route.
- [ ] Add confirmation dialogs for destructive actions.
- [ ] Prefer archive/soft-delete where records are referenced elsewhere.
- [ ] Create audit logs for admin sign-in and data-changing actions.
- [ ] Add server pagination and safe sortable-field allowlists to all large tables.
- [ ] Prevent stored cross-site scripting in rich text, transcripts, stories, and help content.

---

# 2. Express backend task sheet

## 2.1 Backend foundation

- [ ] Create a root `backend/` directory with its own `package.json`.
- [ ] Install and configure Express, Mongoose, environment loading, validation, logging, and security dependencies.
- [ ] Suggested structure:

```text
backend/
  src/
    app.js                 # Express configuration
    server.js              # startup and graceful shutdown
    config/                # environment and database config
    models/                # Mongoose schemas
    routes/                # route definitions
    controllers/           # HTTP request/response logic
    services/              # business logic
    middleware/            # auth, roles, errors, validation, uploads
    validators/            # request schemas
    jobs/                  # notifications/cleanup/optional alerts
    utils/
  tests/
  scripts/                 # seed and maintenance scripts
  uploads/                 # local development only; ignored by Git
  .env.example
  package.json
```

- [ ] Validate required environment variables at startup and fail with a clear message.
- [ ] Connect to MongoDB before accepting traffic.
- [ ] Add `GET /api/health` for server status and `GET /api/health/db` for database readiness.
- [ ] Add JSON body limits and URL-encoded parsing only where needed.
- [ ] Configure CORS with an explicit frontend origin and credentials policy.
- [ ] Add `helmet`-style security headers.
- [ ] Add request logging with password/token/cookie redaction.
- [ ] Add centralized 404 and error middleware with safe production messages.
- [ ] Add graceful shutdown for HTTP and MongoDB connections.
- [ ] Version the API now or document the decision to keep `/api` unversioned for this release.

## 2.2 Authentication and account API

- [ ] `POST /api/auth/register` — validate role, unique email, password policy, and create unverified account/profile.
- [ ] `POST /api/auth/login` — verify password/status and create secure session.
- [ ] `POST /api/auth/admin/login` — admin login with the same secure session rules.
- [ ] `POST /api/auth/logout` — destroy/revoke the current session and clear cookie.
- [ ] `GET /api/auth/me` — return the safe current-user payload.
- [ ] `POST /api/auth/verify-email` — verify OTP or signed single-use token.
- [ ] `POST /api/auth/resend-verification` — rotate token and rate-limit requests.
- [ ] `POST /api/auth/forgot-password` — create time-limited single-use reset token and send email.
- [ ] `POST /api/auth/reset-password` — update password hash and revoke previous sessions/tokens.
- [ ] Hash passwords with Argon2id or bcrypt using an appropriate work factor.
- [ ] Use secure, `httpOnly`, appropriately `sameSite` cookies for sessions or refresh tokens.
- [ ] Add CSRF protection if cookie-authenticated state-changing requests can be sent cross-site.
- [ ] Rate-limit login, verification, reset, upload, and public submission routes.
- [ ] Record login/security events without storing secrets.

## 2.3 User profile and account API

- [ ] `GET /api/users/me`
- [ ] `PATCH /api/users/me`
- [ ] `PUT /api/users/me/profile`
- [ ] `POST /api/users/me/avatar`
- [ ] `POST /api/users/me/resume` — optional SRS feature.
- [ ] `DELETE /api/users/me/resume`
- [ ] `PATCH /api/users/me/preferences`
- [ ] `DELETE /api/users/me` — define deactivate vs permanent deletion and retention rules.
- [ ] Enforce ownership; users must not choose another user ID to access private data.

## 2.4 Careers, search, and recommendations API

- [ ] `GET /api/careers` — pagination, domain, skills, salary, demand, sort, and query parameters.
- [ ] `GET /api/careers/:careerIdOrSlug`
- [ ] `GET /api/careers/:careerId/related`
- [ ] `GET /api/search/suggestions?q=` — autocomplete and approved spell-correction approach.
- [ ] `GET /api/users/me/saved-filters`
- [ ] `POST /api/users/me/saved-filters`
- [ ] `PATCH /api/users/me/saved-filters/:filterId`
- [ ] `DELETE /api/users/me/saved-filters/:filterId`
- [ ] `GET /api/users/me/recommendations`
- [ ] `GET /api/users/me/comparisons`
- [ ] `PUT /api/users/me/comparisons` — store selected career IDs or a named comparison.
- [ ] Start with MongoDB text indexes or Atlas Search; use Elasticsearch only if its operational cost is justified.
- [ ] Keep recommendation rules explainable: return match reasons, inputs used, algorithm version, and generation time.

## 2.5 Quiz API

- [ ] `GET /api/quizzes/current` — return only published questions and never leak private scoring rules unnecessarily.
- [ ] `POST /api/quiz-attempts` — start an attempt and capture quiz version.
- [ ] `PATCH /api/quiz-attempts/:attemptId` — save answers/progress and enforce ownership.
- [ ] `POST /api/quiz-attempts/:attemptId/submit` — score once, store result, and return recommendations.
- [ ] `GET /api/quiz-attempts` — current user's paginated history.
- [ ] `GET /api/quiz-attempts/:attemptId` — authorized result detail.
- [ ] Calculate authoritative score/timing on the server; do not trust a score posted by the browser.
- [ ] Version published quiz content so old attempts remain understandable after edits.

## 2.6 Multimedia, documents, and resources API

- [ ] `GET /api/media` and `GET /api/media/:mediaId`
- [ ] `POST /api/media/:mediaId/ratings` — one current rating per user, with safe aggregation.
- [ ] `GET /api/resources` and `GET /api/resources/:resourceId`
- [ ] `POST /api/resources/:resourceId/view`
- [ ] `POST /api/resources/:resourceId/download` — authorize, increment count, then redirect/stream safely.
- [ ] Store metadata in MongoDB and binary files in an object store or controlled local storage for development.
- [ ] Validate extension, MIME type, file signature, and size; generate collision-safe file names.
- [ ] Never accept an arbitrary filesystem path or unrestricted remote URL from a request.
- [ ] Support HTTP range requests or a suitable media provider for efficient video/audio playback.

## 2.7 Bookmarks, notes, activity, and notifications API

- [ ] `GET /api/users/me/bookmarks`
- [ ] `POST /api/users/me/bookmarks`
- [ ] `DELETE /api/users/me/bookmarks/:bookmarkId`
- [ ] `GET /api/users/me/notes`
- [ ] `POST /api/users/me/notes`
- [ ] `PATCH /api/users/me/notes/:noteId`
- [ ] `DELETE /api/users/me/notes/:noteId`
- [ ] `GET /api/users/me/bookmarks/export.pdf`
- [ ] `GET /api/users/me/recently-viewed`
- [ ] `POST /api/users/me/recently-viewed`
- [ ] `DELETE /api/users/me/recently-viewed/:activityId`
- [ ] `DELETE /api/users/me/recently-viewed`
- [ ] `GET /api/notifications`
- [ ] `PATCH /api/notifications/:notificationId/read`
- [ ] `PATCH /api/notifications/read-all`
- [ ] Add expiration/retention limits to high-volume activity and notification records.

## 2.8 Stories and feedback API

- [ ] `GET /api/stories` — public approved/published stories only.
- [ ] `GET /api/stories/:storyIdOrSlug`
- [ ] `POST /api/stories` — authenticated submission with consent and pending status.
- [ ] `PATCH /api/stories/:storyId` — owner can edit only while permitted by workflow.
- [ ] `POST /api/feedback`
- [ ] `GET /api/users/me/feedback` — optional but useful for response tracking.
- [ ] Sanitize user-authored text and validate all enum/status fields on the server.

## 2.9 Admin API

- [ ] `GET/PATCH /api/admin/users` and `/api/admin/users/:userId`
- [ ] CRUD and publish/archive routes under `/api/admin/careers`.
- [ ] CRUD and publish/archive routes under `/api/admin/content` or separate media/resource routes.
- [ ] CRUD, reorder, version, preview, and publish routes under `/api/admin/quizzes`.
- [ ] Review/approve/reject/request-changes routes under `/api/admin/stories`.
- [ ] List/assign/respond/resolve routes under `/api/admin/feedback`.
- [ ] `GET /api/admin/feedback/analytics`
- [ ] `GET /api/admin/analytics/overview`
- [ ] `GET/PATCH /api/admin/settings`
- [ ] `GET /api/admin/audit-logs`
- [ ] Validate every admin request; never rely on the frontend hiding a button.

---

# 3. MongoDB database task sheet

## 3.1 Database connection and lifecycle

- [ ] Choose MongoDB local/Atlas environments for development, test, and production.
- [ ] Add `MONGODB_URI` and `MONGODB_DB_NAME` placeholders to `backend/.env.example` without real credentials.
- [ ] Create one reusable Mongoose connection module with timeouts and event logging.
- [ ] Prevent server startup when the initial database connection fails.
- [ ] Use a separate test database and automatically clean only test-owned records.
- [ ] Configure backups, retention, and a restore drill for production.
- [ ] Document how developers seed and reset development data safely.

## 3.2 Required collections/models

| Collection | Main fields and relationships | Important indexes/rules |
| --- | --- | --- |
| `users` | name, email, passwordHash, role, status, emailVerifiedAt, lastLoginAt, timestamps | Unique normalized email; role enum; password hash excluded from normal queries. |
| `userProfiles` | userId, education, skills, interests, workExperience, avatar, resume, preferences, onboarding status | Unique `userId`; reference `users`; validate uploaded asset metadata. |
| `sessions` | userId, token hash/session ID, IP/user agent summary, expiresAt, revokedAt | TTL on `expiresAt`; index userId; never store a reusable raw refresh token. |
| `verificationTokens` | userId, purpose, tokenHash/otpHash, attempts, expiresAt, usedAt | TTL on expiry; single-use; rate-limit issuance and attempts. |
| `careers` | slug, title, description, domain, skills, educationPath, salary range/currency, demand/growth, roadmap, status, createdBy | Unique slug; search/domain/status indexes; timestamps and soft-delete/archive fields. |
| `quizzes` | title, version, status, question IDs or embedded versioned questions, scoring configuration, publishedAt | Unique version; immutable published versions or revision history. |
| `quizAttempts` | userId, quizId/version, answers, startedAt, submittedAt, score/signals, recommendedCareerIds | User/date index; ownership; one authoritative submission state. |
| `resources` | slug, title, category, description, asset URL/key, tags, audience, status, views, downloads, createdBy | Slug/status/category/tag indexes; non-negative counters. |
| `media` | slug, title, type, URL/key, tags, transcript, duration, status, ratingSum, ratingCount | Slug/status/type/tag indexes; calculated average, not user-supplied. |
| `mediaRatings` | mediaId, userId, value, timestamps | Unique compound index `{ mediaId, userId }`. |
| `successStories` | slug, userId/submittedBy, display name, domain, story/timeline, image, consent, status, reviewer, reviewedAt, publishedAt | Status/domain/date indexes; moderation and consent history. |
| `feedback` | userId, category, rating, message, context, consent/contact, status, assignee, response, timestamps | Status/category/date/assignee indexes; never expose internal notes to users. |
| `bookmarks` | userId, targetType, targetId, note summary, timestamps | Unique compound index `{ userId, targetType, targetId }`. |
| `notes` | userId, bookmarkId or target reference, title, body, color, timestamps | User/date index; strict ownership checks. |
| `savedFilters` | userId, name, domains, skills, salary, demand, alerts | User/name index; reasonable per-user limit. |
| `recentlyViewed` | userId, targetType, targetId, viewedAt | User/date index; TTL/retention policy; upsert repeated views if desired. |
| `notifications` | userId, type, title, body, target, readAt, createdAt, expiresAt | User/read/date indexes; optional TTL. |
| `auditLogs` | actorId, action, entityType, entityId, before/after summary, request metadata, createdAt | Actor/entity/date indexes; append-only permissions. |
| `appSettings` | key/scope, safe value, updatedBy, timestamps | Unique key/scope; secrets belong in a secret manager, not this collection. |

## 3.3 Data integrity and relationships

- [ ] Decide which relationships are referenced and which small immutable snapshots are embedded.
- [ ] Validate ObjectIds and return 400 for malformed IDs rather than crashing or issuing unsafe queries.
- [ ] Add unique, compound, text/search, TTL, and pagination indexes before load testing.
- [ ] Decide deletion behavior for users and content referenced by attempts, bookmarks, stories, and audit logs.
- [ ] Use transactions for multi-document workflows that must succeed or fail together.
- [ ] Add timestamps and actor IDs to important editable records.
- [ ] Do not store computed analytics that can drift unless update/rebuild rules are documented.
- [ ] Create seed data for at least one Admin and one Student, Graduate, and Professional, plus careers, quiz, resources, media, stories, and feedback.
- [ ] Keep demo passwords outside source control; include safe evaluator credentials only in the final private submission instructions.
- [ ] Commit schema/model definitions and a documented seed script as the SRS database/schema deliverable.

## 3.4 Core relationship map

```text
User 1 ── 1 UserProfile
User 1 ── * Session / QuizAttempt / Bookmark / Note
User 1 ── * SavedFilter / RecentlyViewed / Notification / Feedback
Quiz 1 ── * QuizAttempt
Career * ── * QuizAttempt recommendations
Career/Resource/Media 1 ── * Bookmark and RecentlyViewed
Media 1 ── * MediaRating
User 1 ── * SuccessStory submissions
Admin(User) 1 ── * reviewed Stories / managed Content / AuditLogs
```

---

# 4. Frontend-to-backend connection task sheet

## 4.1 Local connection setup

- [ ] Run frontend and backend on documented ports, for example `5173` and `4000`.
- [ ] Set `VITE_API_URL=http://localhost:4000/api` or configure a Vite `/api` proxy.
- [ ] Configure `FRONTEND_URL`, `PORT`, `MONGODB_URI`, session/token secrets, mail settings, and storage settings on the backend.
- [ ] If using cookies across origins, configure credentials on both CORS and `fetch`, and use correct `SameSite`/`Secure` values per environment.
- [ ] Verify `GET /api/health`, database readiness, registration, login, and `GET /api/auth/me` before connecting feature pages.
- [ ] Add an API timeout/cancellation approach for searches and page navigation.
- [ ] Normalize API success, pagination, validation error, and general error response shapes.

Suggested response shapes:

```json
{
  "data": {},
  "meta": { "page": 1, "pageSize": 20, "total": 0 }
}
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": { "email": "Enter a valid email address." }
  }
}
```

## 4.2 Replace fixtures in a safe order

- [ ] Authentication and current user.
- [ ] Profile/onboarding and role-based routing.
- [ ] Careers list/detail/search/filter.
- [ ] Quiz, server scoring, history, and recommendations.
- [ ] Bookmarks, notes, saved filters, comparisons, and recently viewed.
- [ ] Resources, media, transcripts, ratings, documents, and download tracking.
- [ ] Stories and feedback.
- [ ] Notifications.
- [ ] Admin CRUD, moderation, settings, audit logs, and analytics.
- [ ] Delete or clearly isolate `frontendFixtures` after every consumer is connected.

For each connection:

- [ ] Call a dedicated service function rather than `fetch` directly inside the page.
- [ ] Show loading, empty, validation, offline/network, unauthorized, and server-error states.
- [ ] Cancel stale search requests and prevent duplicate mutations.
- [ ] Update the UI only after success, or implement a tested rollback for optimistic updates.
- [ ] Re-fetch or update cached data after create/edit/delete operations.
- [ ] Confirm the API never returns password hashes, token hashes, internal notes, or private admin data.

---

# 5. Security, privacy, and reliability

- [ ] Validate and sanitize every request on the backend; frontend validation is only for usability.
- [ ] Apply least-privilege role and ownership checks to every protected endpoint.
- [ ] Prevent NoSQL injection by validating query keys/operators and never passing request objects directly to MongoDB.
- [ ] Protect against XSS in story, feedback, note, transcript, and admin-managed content.
- [ ] Add CORS, CSRF/cookie strategy, security headers, rate limits, request size limits, and secure error handling.
- [ ] Add brute-force protection and security-event logging for authentication.
- [ ] Keep secrets and real credentials out of Git; rotate anything accidentally committed.
- [ ] Add file upload scanning/validation and authenticated access where needed.
- [ ] Add privacy controls for activity history, notifications, profile, resume, voice transcripts, and account deletion.
- [ ] Define retention rules for activity, sessions, tokens, uploads, feedback, and audit logs.
- [ ] Add structured logs, uptime/health monitoring, and database error alerts.
- [ ] Back up production data and test restoration before launch.

---

# 6. Testing and quality assurance

## 6.1 Automated tests

- [ ] Frontend component tests for forms, filters, quiz controls, dialogs, and state transitions.
- [ ] Frontend service tests for success, validation, unauthorized, network, and server error responses.
- [ ] Backend unit tests for scoring, recommendations, validation, permissions, and analytics calculations.
- [ ] API integration tests using an isolated MongoDB test database.
- [ ] Authentication tests: registration, verification, login, logout, expiry, reset, rate limit, and role denial.
- [ ] CRUD and ownership tests for every user-owned resource.
- [ ] Admin authorization and audit-log tests.
- [ ] File upload type/size/signature and unauthorized download tests.
- [ ] End-to-end tests for the main Student, Graduate, Professional, and Admin journeys.

## 6.2 Manual acceptance journeys

- [ ] New Student registers, verifies email, completes onboarding, takes quiz, receives matches, bookmarks a career, and adds a note.
- [ ] Graduate logs in, filters careers, saves a filter, compares roles, views media/transcript, and downloads a resource.
- [ ] Professional updates experience, retakes the quiz, reviews history, and submits a success story.
- [ ] User submits categorized feedback and later receives a response notification.
- [ ] Admin signs in, creates/publishes a career and resource, updates a quiz, approves a story, and resolves feedback.
- [ ] Unauthorized users cannot access private or admin records by changing URLs or IDs.
- [ ] Refreshing or opening a deep link retains the correct route and session.
- [ ] Mobile, tablet, and desktop layouts work in current Chrome, Firefox, Edge, and Safari.
- [ ] Keyboard-only and screen-reader smoke tests pass.
- [ ] Slow network, offline state, empty database, expired session, and server error behaviors are understandable.

## 6.3 Performance targets to define and measure

- [ ] Set measurable targets for initial page load, API latency, search latency, media start time, and supported concurrent users.
- [ ] Paginate large collections and avoid unbounded MongoDB queries.
- [ ] Add suitable indexes and inspect slow queries.
- [ ] Optimize images, split frontend bundles, lazy-load noncritical pages/media, and cache public content safely.
- [ ] Run a basic load test for login, careers search, quiz submission, and admin analytics.

---

# 7. Documentation and SRS deliverables

- [ ] Replace the root template README with the actual PathSeeker overview.
- [ ] Add mandatory installation instructions for Node.js, MongoDB, environment variables, seed data, frontend, backend, tests, and production build.
- [ ] Document assumptions and known limitations.
- [ ] Document the selected MERN architecture and why MongoDB is being used with Express/React/Node.
- [ ] Confirm with the evaluator that MongoDB is acceptable: the SRS lists MERN as a supported backend stack but separately names MySQL/SQL Server in the database subsection.
- [ ] Add architecture/component diagram.
- [ ] Add public/user/admin flowcharts.
- [ ] Add context-level and detailed Data Flow Diagrams.
- [ ] Add database design/ER-style relationship diagram and data dictionary.
- [ ] Add API documentation with request, response, authentication, role, validation, and error examples.
- [ ] Add test plan, test cases, test data, results, and defect summary.
- [ ] Add safe demo credentials for Student, Graduate, Professional, and Admin to private submission instructions.
- [ ] Add licenses/attribution for images, videos, audio, documents, fonts, and disclosed AI-generated imagery.
- [ ] Add the mandatory application sitemap to the home page.
- [ ] Prepare the complete report without source code, as required by the SRS.
- [ ] Prepare schema/model and seed files; include `.sql` only if the evaluator specifically requires SQL rather than the selected MongoDB schema format.
- [ ] Record the mandatory MP4 demonstration covering every functional requirement.
- [ ] Deploy the working application and document its URL, environment, backup, and recovery process.
- [ ] Create the final ZIP with the requested report, assumptions ReadMe document, schema files, test material, and video/link.

---

# 8. Recommended implementation order

## Milestone 1 — Make the application truly full stack

- [ ] Create Express server, environment validation, MongoDB connection, health route, errors, logging, and security baseline.
- [ ] Implement User/Profile models, secure authentication, sessions, email verification/reset, and role guards.
- [ ] Connect signup, login, onboarding, profile, logout, and protected routing.
- [ ] Add test accounts and authentication integration tests.

**Exit condition:** a real user can register, verify, sign in, refresh safely, edit a persisted profile, and log out; Admin routes reject non-admins.

## Milestone 2 — Deliver the core Career Passport journey

- [ ] Careers CRUD and public search/filter/detail APIs.
- [ ] Quiz versioning, attempt persistence, server scoring, history, and recommendation results.
- [ ] Connect dashboard, Career Bank, career detail, quiz, recommendations, and history pages.
- [ ] Add bookmarks, notes, recently viewed, comparisons, and saved filters.

**Exit condition:** each user type can complete the main discovery journey and see the same saved data after signing in on another session.

## Milestone 3 — Content, community, and communication

- [ ] Resources/media/documents with safe storage, preview, transcript, rating, and counters.
- [ ] Success-story submission and moderation.
- [ ] Feedback workflow, replies, analytics, and notifications.
- [ ] Connect remaining user pages and related-content suggestions.

**Exit condition:** content and community workflows work from user submission through admin management and back to user notification.

## Milestone 4 — Complete administration and quality

- [ ] Connect all admin lists, editors, settings, analytics, and audit logs.
- [ ] Complete accessibility preferences, error/loading/empty states, responsive QA, and browser testing.
- [ ] Complete automated tests, security review, performance checks, monitoring, backups, and restore test.
- [ ] Complete installation guide, diagrams, database/API/test documentation, credentials, deployment, sitemap, and demo video.

**Exit condition:** the project satisfies the SRS, passes its test plan, can be installed from documentation, and can be demonstrated end to end without fixture data.

---

# 9. Final release gate

Do not mark the project finished until every statement below is true.

- [ ] No production page depends on `frontendFixtures` or hard-coded product records.
- [ ] All required user and admin actions persist correctly in MongoDB.
- [ ] Authentication, role authorization, ownership, validation, security headers, rate limits, and safe uploads are verified.
- [ ] Student, Graduate, Professional, and Admin acceptance journeys pass.
- [ ] Lint, frontend build, backend tests, frontend tests, API integration tests, and end-to-end tests pass in a clean checkout.
- [ ] The mandatory homepage sitemap, installation guide, diagrams, database design, test data/results, credentials, report, schema files, deployment URL, and MP4 demo are ready.
- [ ] A fresh evaluator can install or open the project using only the supplied documentation.

## Next task to start

Create the Express backend foundation and MongoDB connection, then implement authentication and connect the existing signup/login/onboarding screens. This unlocks every other persisted user and admin feature.
