# PathSeeker Backend Audit and Remaining Work

**Audit date:** August 26, 2026  
**Audited scope:** `Project/backend`, its frontend API boundary, and the requirements in the PathSeeker SRS/task sheet.

## Executive summary

The PathSeeker backend contains a substantial amount of implementation work: Mongoose models, seed data, authentication/session services, public catalog services, quiz attempts, personalization, content, feedback, notifications, admin operations, middleware, and Express route definitions all exist in source.

However, the backend is **not complete or runnable in its current state**. Import/file-name errors prevent the Express application from loading, required server dependencies are not declared in `package.json`, one backend test suite fails, and the frontend does not call the API. Most user-facing screens still use fixtures or local component state.

The current product should therefore be treated as:

- A strong frontend demonstration/prototype.
- A partially implemented backend codebase.
- Not yet an integrated full-stack application.
- Not ready for deployment or final SRS acceptance testing.

## Audit verification results

| Check | Result |
|---|---|
| Frontend ESLint | Passed |
| Frontend production build | Passed; 83 modules transformed |
| Backend test suite | 10 passed, 1 failed, 1 MongoDB integration test skipped |
| Backend application import | Failed |
| Backend clean-install readiness | Failed; required runtime packages are undeclared |
| Frontend API calls | None found outside the unused API helper definition |
| Frontend automated tests | None found |
| End-to-end tests | None found |

## Backend work already present

The items in this section exist in source. They should not all be considered production-complete until the startup errors are fixed and API integration tests pass.

### 1. Project structure and database foundation

- [x] Separate `backend/` project directory exists.
- [x] Node.js ES module configuration exists.
- [x] Mongoose is configured as the data layer.
- [x] Reusable database connection module exists.
- [x] Required MongoDB environment checks exist.
- [x] Development seed runner and reset command exist.
- [x] Deterministic seed IDs and seed modules exist.
- [x] Demo users exist for Admin, Student, Graduate, and Professional roles.
- [x] Existing Phase 1 model and seed tests cover schema rules, indexes, normalization, and referential consistency.

### 2. Models present in source

The backend contains model files for:

- [x] `User`
- [x] `UserProfile`
- [x] `Session`
- [x] `VerificationToken`
- [x] `Skill`
- [x] `Domain`
- [x] `Career`
- [x] `QuizQuestion`
- [x] `QuizAttempt`
- [x] `Bookmark`
- [x] `SavedFilter`
- [x] `SavedSearch`
- [x] `Comparison`
- [x] `RecentlyViewed`
- [x] `Resource`
- [x] `Multimedia`
- [x] `MediaRating`
- [x] `SuccessStory`
- [x] `Feedback`
- [x] `Notification`
- [x] `Settings`

Important limitation: most Milestone 2 models are not exported from `src/models/index.js`, so consumers and tests cannot reliably import them.

### 3. Express and security foundation present in source

- [x] Express application factory exists.
- [x] `/api` router mount exists.
- [x] Basic `GET /api/health` route exists.
- [x] CORS configuration includes explicit allowed origins and credentials support.
- [x] Helmet security headers are configured.
- [x] JSON body size limit is configured.
- [x] Cookie parsing is configured.
- [x] Central not-found and error middleware exists.
- [x] Authentication rate-limit middleware exists.
- [x] Cookie-based session authentication middleware exists.
- [x] Role-based authorization middleware exists.
- [x] Production error responses attempt to hide internal details.

### 4. Authentication implementation present in source

Routes and corresponding controller/service code exist for:

- [x] `POST /api/auth/register`
- [x] `POST /api/auth/login`
- [x] `POST /api/auth/admin/login`
- [x] `POST /api/auth/logout`
- [x] `GET /api/auth/me`
- [x] `POST /api/auth/verify-email`
- [x] `POST /api/auth/resend-verification`
- [x] `POST /api/auth/forgot-password`
- [x] `POST /api/auth/reset-password`
- [x] Password hashing with bcrypt.
- [x] Opaque session tokens intended to be stored as hashes.
- [x] `httpOnly` session-cookie configuration.
- [x] Session revocation operations.
- [x] Verification and password-reset token expiry concepts.
- [x] Console-based development email service.

### 5. Public catalog implementation present in source

- [x] Domain listing.
- [x] Skill listing and category filtering.
- [x] Career listing.
- [x] Career search and filters.
- [x] Career pagination support.
- [x] Career detail lookup by slug.
- [x] Public catalog controllers and services.

Mounted routes currently include:

- [x] `GET /api/domains`
- [x] `GET /api/skills`
- [x] `GET /api/careers`
- [x] `GET /api/careers/:slug`

### 6. Quiz implementation present in source

- [x] Active quiz-question listing.
- [x] Start quiz attempt.
- [x] Save an answer against an attempt.
- [x] Complete an attempt.
- [x] Retrieve attempt history.
- [x] Retrieve an individual attempt.
- [x] Server-side quiz service and attempt ownership checks are represented.

Mounted routes currently include:

- [x] `GET /api/quiz-questions`
- [x] `GET /api/quiz-attempts`
- [x] `POST /api/quiz-attempts`
- [x] `GET /api/quiz-attempts/:id`
- [x] `PATCH /api/quiz-attempts/:id/answer`
- [x] `POST /api/quiz-attempts/:id/complete`

### 7. Personalization implementation present in source

- [x] Bookmark listing, creation, note update, and deletion.
- [x] Recently viewed listing and creation.
- [x] Saved-filter listing, creation, and deletion.
- [x] Comparison listing, creation, and deletion.
- [x] Ownership is derived from the authenticated user rather than a client-supplied user ID.

Mounted routes currently include operations under:

- [x] `/api/users/me/bookmarks`
- [x] `/api/users/me/recently-viewed`
- [x] `/api/users/me/saved-filters`
- [x] `/api/users/me/comparisons`

### 8. Content and community implementation present in source

- [x] Public resource listing and detail.
- [x] Resource download counter operation.
- [x] Public media listing and detail.
- [x] Authenticated media rating.
- [x] Public approved-story listing and detail.
- [x] Authenticated success-story submission.
- [x] Authenticated feedback submission.
- [x] Current-user feedback history.
- [x] Notification listing.
- [x] Mark one notification as read.
- [x] Mark all notifications as read.

### 9. Admin implementation present in source

- [x] Staff-role middleware is mounted on `/api/admin/*` routes.
- [x] User listing, detail, role/status update.
- [x] Career create, list, update, and delete.
- [x] Quiz-question create, list, update, and delete.
- [x] Resource create, list, update, and delete.
- [x] Media create, list, update, and delete.
- [x] Story listing, approval, and rejection.
- [x] Feedback listing, response, and analytics.
- [x] Usage statistics endpoint.
- [x] Admin settings read and update.

## Critical backend problems that must be fixed first

### 1. Backend startup is broken

- [ ] Rename `src/controllers/auth.controller.js.js` to `auth.controller.js`, or update every import consistently.
- [ ] Change imports of `../utils/tokens.js` to the existing `../utils/token.js`, or rename the utility file consistently.
- [ ] Resolve `careerRoutes.js` and `quizRoutes.js` imports of nonexistent `middleware/auth.js`.
- [ ] Decide whether legacy route/controller modules are still required. Remove them or migrate them to the active route structure.
- [ ] Add a module-import smoke test so missing imports fail in CI immediately.

Until these items are fixed, `src/app.js` cannot be imported and `server.js` cannot start.

### 2. Required runtime dependencies are missing from `package.json`

The application imports packages that are currently installed only as extraneous local modules. Add and lock at least:

- [ ] `express`
- [ ] `cors`
- [ ] `helmet`
- [ ] `cookie-parser`
- [ ] `express-rate-limit`
- [ ] `express-validator` if the older validation middleware remains in use.

Then:

- [ ] Run a clean `npm ci`.
- [ ] Confirm `npm ls --depth=0` reports no unexpected extraneous or missing packages.
- [ ] Confirm the server starts from a clean checkout.

### 3. Model barrel exports are incomplete

- [ ] Export every actively used model from `src/models/index.js`.
- [ ] At minimum, fix the missing `Bookmark` export that currently breaks `models.milestone2.test.js`.
- [ ] Verify all services import the same canonical model modules.
- [ ] Remove unused or duplicate model-import patterns.

### 4. Duplicate and inconsistent modules need consolidation

Examples include:

- `quizController.js` and `quiz.controller.js`
- `auth.middleware.js` in both `controllers/` and `middleware/`
- `errorHandler.js` and `error.middleware.js`
- `careerRoutes.js` and catalog career routes
- `quizRoutes.js` and the active quiz route modules
- `AppError.js` imports using inconsistent filename casing

Required work:

- [ ] Select one naming convention, preferably dotted resource names such as `quiz.controller.js`.
- [ ] Keep one authentication middleware implementation.
- [ ] Keep one error-handler implementation.
- [ ] Keep one active route implementation for each API resource.
- [ ] Remove dead modules only after confirming no active imports depend on them.
- [ ] Ensure filename casing also works on Linux production hosts.

## Backend features still missing or incomplete

### 1. User profile and account lifecycle

- [ ] `GET /api/users/me` user/profile endpoint, separate from basic auth session information if needed.
- [ ] `PATCH /api/users/me` account update.
- [ ] `PUT/PATCH /api/users/me/profile`.
- [ ] Persist frontend onboarding answers.
- [ ] Avatar upload/change/remove.
- [ ] Resume upload/remove if the optional SRS feature is retained.
- [ ] User preference update, including accessibility preferences.
- [ ] Account deactivate/delete workflow.
- [ ] Privacy and data-retention behavior.

### 2. Career Passport and recommendations

- [ ] Create the Career Passport model/service described by the domain notes.
- [ ] Build recommendations from profile and quiz information.
- [ ] Return explainable match reasons.
- [ ] Store algorithm/version metadata and generation timestamps.
- [ ] Add related-career endpoint.
- [ ] Add related-content endpoint.
- [ ] Add dedicated current-user recommendations endpoint.
- [ ] Implement autocomplete/search suggestions on the mounted API.

### 3. Career and saved-filter API gaps

- [ ] Add/update the required saved-filter edit route.
- [ ] Decide whether saved searches and saved filters are separate concepts; consolidate if not.
- [ ] Add safer sortable-field allowlists.
- [ ] Verify salary, demand, skill, domain, search, and pagination filters with integration tests.
- [ ] Add text indexes or an explicitly documented search solution.

### 4. Quiz gaps

- [ ] Version quiz questions and published quiz sets.
- [ ] Preserve the version used by old attempts.
- [ ] Verify server-authoritative scoring; never accept a client-computed final score.
- [ ] Add recommendation generation after completion.
- [ ] Prevent completing/scoring an attempt multiple times.
- [ ] Add incomplete-attempt resume and progress rules.
- [ ] Add comprehensive scoring, ownership, validation, and history tests.

### 5. Bookmarks, notes, and history gaps

- [ ] Decide whether notes remain embedded on bookmarks or require a dedicated Note model/API.
- [ ] Add the complete note create/read/update/delete workflow required by the UI/SRS.
- [ ] Add bookmarks/notes PDF export.
- [ ] Add recently-viewed item deletion.
- [ ] Add clear-all recently-viewed operation.
- [ ] Add retention/expiry limits for high-volume history.
- [ ] Add safe sharing URLs and server-side sharing rules where required.

### 6. Resources, media, and uploads

- [ ] Implement actual binary/object storage; current code primarily represents metadata.
- [ ] Validate extension, MIME type, file signature, and size.
- [ ] Generate collision-safe filenames.
- [ ] Prevent arbitrary local paths or unrestricted remote URLs.
- [ ] Add authenticated/private download rules where appropriate.
- [ ] Add resource view tracking in addition to download tracking.
- [ ] Support HTTP range requests or a media provider for audio/video.
- [ ] Add transcript storage and retrieval.
- [ ] Verify one-current-rating-per-user and safe aggregate rating updates.
- [ ] Add upload and download security tests.

### 7. Stories and feedback gaps

- [ ] Allow story owners to edit submissions while workflow rules permit it.
- [ ] Add request-changes moderation state if required.
- [ ] Validate and sanitize all story content.
- [ ] Validate feedback categories, ratings, contact consent, and page/device metadata if those UI fields are retained.
- [ ] Align `GET /api/feedback/mine` with the SRS/frontend naming for current-user feedback.
- [ ] Generate response notifications when an admin responds to feedback.

### 8. Notification gaps

- [ ] Connect notification creation to quiz, feedback, content, and recommendation events.
- [ ] Add pagination and retention rules.
- [ ] Add delivery/read/ownership tests.
- [ ] Add email notification preferences if alerts are retained.

### 9. Admin gaps

- [ ] Add publish/archive workflows instead of relying only on create/update/delete.
- [ ] Add confirmation and reference checks for destructive operations.
- [ ] Prefer soft deletion/archive when records are referenced by attempts or bookmarks.
- [ ] Add quiz reordering, previewing, versioning, and publishing.
- [ ] Add feedback assignment and full resolution workflow.
- [ ] Add story request-changes workflow.
- [ ] Add audit-log model, service, and endpoint.
- [ ] Record admin sign-in and every important data-changing operation.
- [ ] Add richer analytics overview endpoint.
- [ ] Paginate all large admin tables.
- [ ] Validate safe sort/filter fields.
- [ ] Add admin permission and role-denial tests.

## Security and production-readiness work

- [ ] Define and implement CSRF protection for cookie-authenticated mutations.
- [ ] Validate every body, parameter, and query field with one consistent validation system.
- [ ] Validate MongoDB ObjectIds and return HTTP 400 for malformed IDs.
- [ ] Prevent NoSQL operator injection.
- [ ] Sanitize user-authored and admin-authored rich content against stored XSS.
- [ ] Rate-limit public story/feedback submissions and upload endpoints, not only authentication.
- [ ] Add brute-force/security event logging.
- [ ] Redact passwords, tokens, cookies, and private fields from logs.
- [ ] Add structured request logging.
- [ ] Add graceful HTTP server and MongoDB shutdown.
- [ ] Add `GET /api/health/db` or equivalent database-readiness endpoint.
- [ ] Add uptime and database-error monitoring.
- [ ] Document backup, retention, and restore procedures.
- [ ] Test secure cookie values for local, staging, and production environments.
- [ ] Decide and document whether `/api` remains unversioned or changes to `/api/v1`.

## Environment and documentation work

- [ ] Expand `backend/.env.example` to document `PORT` and `FRONTEND_ORIGIN`.
- [ ] Document session cookie settings.
- [ ] Document bcrypt cost settings.
- [ ] Document email provider/from settings.
- [ ] Document rate-limit settings.
- [ ] Document verification/reset expiry settings.
- [ ] Add storage/upload settings when file storage is implemented.
- [ ] Replace the outdated backend README statement that says Express controllers/routes are intentionally absent.
- [ ] Add complete installation, database, seed, start, test, and production instructions.
- [ ] Add API documentation with request/response/error examples.
- [ ] Document standard API response, validation-error, and pagination shapes.

## Frontend-to-backend integration still required

### Current state

- The frontend defines `apiRequest()` and a partial endpoint map.
- No frontend page calls `apiRequest()`.
- Authentication forms navigate without authentication.
- Feedback and story forms show success without persistence.
- Careers, quiz, resources, stories, notifications, saved filters, and other screens use fixtures or component state.
- Admin pages are accessible from the `screen` query parameter without verifying an admin session.

### Required integration foundation

- [ ] Add `frontend/.env.example` with `VITE_API_URL`.
- [ ] Configure a Vite `/api` proxy for local cookie-based development, or document cross-origin development correctly.
- [ ] Keep `credentials: 'include'` and verify backend CORS/cookie settings in every environment.
- [ ] Expand the endpoint map to match the mounted backend routes.
- [ ] Resolve endpoint mismatches such as frontend `/admin/content` versus backend `/admin/resources` and `/admin/media`.
- [ ] Define a consistent success/error/pagination response contract.
- [ ] Add an API timeout/cancellation strategy.
- [ ] Add loading, empty, retry, validation, unauthorized, forbidden, offline, and server-error UI states.

### Required integration order

1. [ ] Health and database readiness.
2. [ ] Signup, verification, login, logout, and session restoration.
3. [ ] Protected user and admin routes.
4. [ ] Onboarding and profile persistence.
5. [ ] Careers list, filters, detail, and saved filters.
6. [ ] Quiz questions, attempts, answers, completion, history, and recommendations.
7. [ ] Bookmarks, notes, comparisons, and recently viewed.
8. [ ] Resources, media, ratings, documents, transcripts, and downloads.
9. [ ] Stories, feedback, and notifications.
10. [ ] Admin CRUD, moderation, settings, audit logs, and analytics.
11. [ ] Remove or development-gate `frontendFixtures` and hard-coded product data.

## Testing still required

- [ ] Make the complete backend unit test suite pass.
- [ ] Run database integration tests automatically against an isolated disposable database.
- [ ] Test backend boot from a clean `npm ci` installation.
- [ ] Add API integration tests for every route group.
- [ ] Add authentication tests for registration, verification, login, logout, expiry, reset, rate limiting, and role denial.
- [ ] Add ownership tests for every user-owned resource.
- [ ] Add backend tests for scoring, recommendations, validation, permissions, and analytics.
- [ ] Add frontend component and API-service tests.
- [ ] Add end-to-end tests for Student, Graduate, Professional, and Admin journeys.
- [ ] Test expired sessions, empty databases, slow networks, offline state, malformed IDs, validation errors, and server errors.
- [ ] Add CI that runs clean install, lint, tests, module-import smoke test, and production build.

## Recommended implementation phases

### Phase 1: Make the backend runnable

- Fix missing and incorrectly named imports.
- Declare all runtime dependencies.
- Consolidate duplicate modules.
- Export all active models.
- Make `npm test` pass.
- Start the server from a clean install.
- Verify health and database readiness.

### Phase 2: Complete authentication and profile

- Test authentication APIs end to end.
- Connect frontend auth forms.
- Add session restoration and protected routes.
- Persist onboarding/profile data.
- Add logout and expired-session handling.

### Phase 3: Deliver one complete product journey

Recommended first vertical slice:

1. Load careers from MongoDB.
2. Search/filter through the API.
3. Open a career detail from API data.
4. Authenticate and bookmark the career.
5. Add/edit a bookmark note.
6. Verify persistence after refresh.
7. Cover the complete path with API and end-to-end tests.

### Phase 4: Quiz and recommendations

- Version quiz content.
- Persist attempts and progress.
- Score on the server.
- Generate explainable recommendations.
- Connect dashboard, quiz, results, recommendations, and history screens.

### Phase 5: Content, community, and admin

- Implement safe storage and delivery for resources/media.
- Connect ratings, transcripts, and download tracking.
- Connect stories, feedback, and notifications.
- Complete admin publishing, moderation, analytics, settings, and audit logs.

### Phase 6: Production acceptance

- Complete security hardening.
- Complete accessibility testing.
- Add load/performance targets and tests.
- Add monitoring, backups, and restore procedure.
- Complete the installation guide, diagrams, API docs, test evidence, deployment, and mandatory demonstration material.

## Definition of backend complete

The backend should not be called complete until all of the following are true:

- [ ] A clean `npm ci` succeeds with no required extraneous dependencies.
- [ ] `server.js` starts without import/runtime errors.
- [ ] MongoDB connects before the server accepts traffic.
- [ ] Health and database-readiness checks pass.
- [ ] All backend unit and integration tests pass.
- [ ] Every frontend production feature reads/writes through a documented API.
- [ ] Authentication, authorization, ownership, validation, and error behavior are tested.
- [ ] No production frontend page depends on fixtures or hard-coded product records.
- [ ] Required SRS user and admin journeys pass end to end.
- [ ] Security, deployment, backup, monitoring, and operating documentation are complete.

## Final assessment

The project has a useful backend foundation and many route/service/model implementations, but it is currently **partially implemented, internally inconsistent, and disconnected from the frontend**. The first milestone should be a cleanly installable, runnable, tested backend. The second should be a fully integrated authentication flow and one complete database-backed user journey. Only after those foundations are stable should the remaining screens be connected and the system prepared for production acceptance.
