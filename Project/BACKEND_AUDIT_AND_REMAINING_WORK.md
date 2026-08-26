# PathSeeker Backend Audit and Remaining Work

**Audit date:** August 26, 2026<br>
**Last updated:** August 26, 2026 after the second backend version replaced the original backend.<br>
**Audited scope:** The current `Project/backend` (formerly `Project/backend1`), its frontend API boundary, and the requirements in the PathSeeker SRS/task sheet.

## Executive summary

The current PathSeeker backend is the second backend version. The original `Project/backend` was deleted and `Project/backend1` was renamed to `Project/backend`. All paths in this report now refer to the renamed second version.

This second version is materially better than the original audit target. It declares the main Express dependencies, exports the Milestone 2 models, passes the schema/seed test suite, adds authenticated profile and onboarding APIs, adds audit-log storage and admin access, expands environment documentation, and includes stronger admin statistics and audit coverage.

However, the backend is still **not complete or runnable in its current state**. Startup-script and import/file-name errors prevent the Express application from loading. The live MongoDB test is not run by default, API behavior is not covered by integration tests, several mandatory SRS capabilities remain missing, and the frontend still does not call the API. Most user-facing screens continue to use fixtures or local component state.

The current product should therefore be treated as:

- A strong frontend demonstration/prototype.
- A partially implemented backend codebase.
- Not yet an integrated full-stack application.
- Not ready for deployment or final SRS acceptance testing.

### Checklist ownership legend

- Checked items are labeled **Done by Hamza**.
- Unchecked items are remaining work and are not attributed to Hamza.
- All implemented/present backend work described in the completed-work and second-version-improvement sections is attributed to Hamza; verification results describe the audit, not authorship.

## Audit verification results

| Check | Result |
|---|---|
| Frontend ESLint | Passed |
| Frontend production build | Passed; 83 modules transformed |
| Backend test suite | 21 passed, 0 failed, 1 live MongoDB integration test skipped |
| Backend application import | Failed; `utils/tokens.js` does not exist |
| `npm start` | Failed; script points to nonexistent `src/server.js` |
| Backend dependency manifest | Improved; active Express dependencies are declared, but legacy `express-validator` imports remain undeclared |
| Live MongoDB persistence | Not verified in this audit; integration test skipped without test database variables |
| Frontend API calls | None found outside the unused API helper definition |
| Frontend automated tests | None found |
| End-to-end tests | None found |

## Improvements in the second backend version — Done by Hamza

This section records the changes verified after `backend1` replaced the original backend.

### 1. Dependency and package improvements

- [x] **Done by Hamza** — `express` is now declared in `package.json`.
- [x] **Done by Hamza** — `cors` is now declared in `package.json`.
- [x] **Done by Hamza** — `helmet` is now declared in `package.json`.
- [x] **Done by Hamza** — `cookie-parser` is now declared in `package.json`.
- [x] **Done by Hamza** — `express-rate-limit` is now declared in `package.json`.
- [x] **Done by Hamza** — `npm ls --depth=0` resolves the main declared runtime dependencies without the large extraneous dependency tree seen in the first version.
- [x] **Done by Hamza** — `dev` and `start` scripts were added, although their current `src/server.js` target is incorrect and must be fixed.

### 2. Model and test improvements

- [x] **Done by Hamza** — All active Phase 1 and Milestone 2 models are now exported from `src/models/index.js`.
- [x] **Done by Hamza** — The missing `Bookmark` export that broke the first version's Milestone 2 tests is fixed.
- [x] **Done by Hamza** — The complete default test run now reports 21 passing tests and no failures.
- [x] **Done by Hamza** — Milestone 2 tests now cover careers, quiz questions/attempts, resources, success stories, feedback, bookmarks, recently viewed, comparisons, saved filters, notifications, collection names, and validation rules.
- [x] **Done by Hamza** — Phase 1 model, index, seed, normalization, session-token, and verification-token tests still pass.
- [ ] The live MongoDB persistence/index test remains optional and was skipped during the audit.

### 3. User profile and onboarding improvements

- [x] **Done by Hamza** — `profile.routes.js`, `profile.controller.js`, and `profile.service.js` were added.
- [x] **Done by Hamza** — Authenticated profile retrieval is mounted at `GET /api/users/me/profile`.
- [x] **Done by Hamza** — Authenticated profile update is mounted at `PATCH /api/users/me/profile`.
- [x] **Done by Hamza** — Onboarding status/current-step persistence is mounted at `PATCH /api/users/me/profile/onboarding`.
- [x] **Done by Hamza** — Avatar/resume asset metadata can be attached through `PATCH /api/users/me/profile/assets/:assetType`.
- [x] **Done by Hamza** — Profile self-editing uses an editable-field allowlist.
- [x] **Done by Hamza** — Profile skill population is implemented for reads.
- [ ] Actual avatar/resume upload and storage are deliberately not implemented; the endpoint currently accepts asset metadata/URLs.

### 4. Admin audit and oversight improvements

- [x] **Done by Hamza** — `AuditLog` model was added with actor, action, target, details, timestamps, and useful indexes.
- [x] **Done by Hamza** — Audit-log service was added for recording and paginated listing.
- [x] **Done by Hamza** — Admin user, career, quiz-question, resource, media, story, and feedback mutations now attempt to record audit events.
- [x] **Done by Hamza** — `GET /api/admin/audit-logs` was added and restricted to higher-privilege management roles.
- [x] **Done by Hamza** — Admin usage statistics include total/active users, quiz attempts, active careers, popular careers, and popular resources.
- [x] **Done by Hamza** — Feedback analytics aggregate counts by category and status.

### 5. API and domain improvements

- [x] **Done by Hamza** — Profile routes are mounted in the central API router.
- [x] **Done by Hamza** — Quiz completion performs server-side domain-weight scoring, saves result fields, selects a top career, and creates a match notification.
- [x] **Done by Hamza** — Media rating upserts one user/media rating and recomputes aggregate average/count from rating records.
- [x] **Done by Hamza** — Recently viewed uses an upsert so repeat views update timestamps instead of creating unbounded duplicates for the same item.
- [x] **Done by Hamza** — Bookmark ownership, bookmark notes, saved filters, comparisons, story moderation, feedback responses, settings, and pagination remain represented.
- [x] **Done by Hamza** — Multimedia records include transcript and related-career metadata fields.

### 6. Configuration improvements

- [x] **Done by Hamza** — `.env.example` now documents API port and allowed frontend origins.
- [x] **Done by Hamza** — Session cookie name, TTL, secure flag, and same-site behavior are documented.
- [x] **Done by Hamza** — Bcrypt cost, email provider/from, verification/reset lifetimes, and authentication rate limits are documented.
- [ ] Required MongoDB and seed variables were lost from the current `.env.example` and must be restored.

### 7. Improvements that are present but not yet proven operationally

- Authentication, profile, quiz, content, personalization, notification, settings, audit, and admin implementations are substantially broader than the original Phase 1-only documentation suggests.
- These improvements are verified from source and schema tests, but not from live API/database integration tests because the application does not currently boot.
- The README is stale: it still describes a Phase 1 database-only package and says Express routes/controllers are absent even though they are present.

### 8. Second-version architecture graph findings

- The second-version graph contains 469 nodes, 966 built edges, and 24 communities.
- Shared cross-cutting abstractions are now visible: `AppError`, `isNonEmptyString`, pagination helpers, `logAction`, `asyncHandler`, and `requireAuth` connect the major service/controller groups.
- The graph confirms broad modules for application services, profile/search, database/seeds, authentication/admin controllers, admin content, authorization/routes, catalog, bookmarks/history, quiz, settings, and audit logging.
- Graph health reported 162 dangling-endpoint edges and 124 same-endpoint collapsed edges. The graph is useful for navigation but should not be treated as a lossless dependency model.
- Audit artifacts are stored in `Project/backend/graphify-out/`: `GRAPH_REPORT.md`, `graph.html`, and `graph.json`.

## Backend work already present — Done by Hamza

The items in this section exist in source. They should not all be considered production-complete until the startup errors are fixed and API integration tests pass.

### 1. Project structure and database foundation

- [x] **Done by Hamza** — Separate `backend/` project directory exists.
- [x] **Done by Hamza** — Node.js ES module configuration exists.
- [x] **Done by Hamza** — Mongoose is configured as the data layer.
- [x] **Done by Hamza** — Reusable database connection module exists.
- [x] **Done by Hamza** — Required MongoDB environment checks exist.
- [x] **Done by Hamza** — Development seed runner and reset command exist.
- [x] **Done by Hamza** — Deterministic seed IDs and seed modules exist.
- [x] **Done by Hamza** — Demo users exist for Admin, Student, Graduate, and Professional roles.
- [x] **Done by Hamza** — Existing Phase 1 model and seed tests cover schema rules, indexes, normalization, and referential consistency.

### 2. Models present in source

The backend contains model files for:

- [x] **Done by Hamza** — `User`
- [x] **Done by Hamza** — `UserProfile`
- [x] **Done by Hamza** — `Session`
- [x] **Done by Hamza** — `VerificationToken`
- [x] **Done by Hamza** — `Skill`
- [x] **Done by Hamza** — `Domain`
- [x] **Done by Hamza** — `Career`
- [x] **Done by Hamza** — `QuizQuestion`
- [x] **Done by Hamza** — `QuizAttempt`
- [x] **Done by Hamza** — `Bookmark`
- [x] **Done by Hamza** — `SavedFilter`
- [x] **Done by Hamza** — `SavedSearch`
- [x] **Done by Hamza** — `Comparison`
- [x] **Done by Hamza** — `RecentlyViewed`
- [x] **Done by Hamza** — `Resource`
- [x] **Done by Hamza** — `Multimedia`
- [x] **Done by Hamza** — `MediaRating`
- [x] **Done by Hamza** — `SuccessStory`
- [x] **Done by Hamza** — `Feedback`
- [x] **Done by Hamza** — `Notification`
- [x] **Done by Hamza** — `Settings`
- [x] **Done by Hamza** — `AuditLog`

Improvement over the first version: the active Phase 1 and Milestone 2 models are now exported from `src/models/index.js`, and the model-barrel test failure is resolved.

### 3. Express and security foundation present in source

- [x] **Done by Hamza** — Express application factory exists.
- [x] **Done by Hamza** — `/api` router mount exists.
- [x] **Done by Hamza** — Basic `GET /api/health` route exists.
- [x] **Done by Hamza** — CORS configuration includes explicit allowed origins and credentials support.
- [x] **Done by Hamza** — Helmet security headers are configured.
- [x] **Done by Hamza** — JSON body size limit is configured.
- [x] **Done by Hamza** — Cookie parsing is configured.
- [x] **Done by Hamza** — Central not-found and error middleware exists.
- [x] **Done by Hamza** — Authentication rate-limit middleware exists.
- [x] **Done by Hamza** — Cookie-based session authentication middleware exists.
- [x] **Done by Hamza** — Role-based authorization middleware exists.
- [x] **Done by Hamza** — Production error responses attempt to hide internal details.

### 4. Authentication implementation present in source

Routes and corresponding controller/service code exist for:

- [x] **Done by Hamza** — `POST /api/auth/register`
- [x] **Done by Hamza** — `POST /api/auth/login`
- [x] **Done by Hamza** — `POST /api/auth/admin/login`
- [x] **Done by Hamza** — `POST /api/auth/logout`
- [x] **Done by Hamza** — `GET /api/auth/me`
- [x] **Done by Hamza** — `POST /api/auth/verify-email`
- [x] **Done by Hamza** — `POST /api/auth/resend-verification`
- [x] **Done by Hamza** — `POST /api/auth/forgot-password`
- [x] **Done by Hamza** — `POST /api/auth/reset-password`
- [x] **Done by Hamza** — Password hashing with bcrypt.
- [x] **Done by Hamza** — Opaque session tokens intended to be stored as hashes.
- [x] **Done by Hamza** — `httpOnly` session-cookie configuration.
- [x] **Done by Hamza** — Session revocation operations.
- [x] **Done by Hamza** — Verification and password-reset token expiry concepts.
- [x] **Done by Hamza** — Console-based development email service.

### 5. Public catalog implementation present in source

- [x] **Done by Hamza** — Domain listing.
- [x] **Done by Hamza** — Skill listing and category filtering.
- [x] **Done by Hamza** — Career listing.
- [x] **Done by Hamza** — Career search and filters.
- [x] **Done by Hamza** — Career pagination support.
- [x] **Done by Hamza** — Career detail lookup by slug.
- [x] **Done by Hamza** — Public catalog controllers and services.

Mounted routes currently include:

- [x] **Done by Hamza** — `GET /api/domains`
- [x] **Done by Hamza** — `GET /api/skills`
- [x] **Done by Hamza** — `GET /api/careers`
- [x] **Done by Hamza** — `GET /api/careers/:slug`

### 6. Quiz implementation present in source

- [x] **Done by Hamza** — Active quiz-question listing.
- [x] **Done by Hamza** — Start quiz attempt.
- [x] **Done by Hamza** — Save an answer against an attempt.
- [x] **Done by Hamza** — Complete an attempt.
- [x] **Done by Hamza** — Retrieve attempt history.
- [x] **Done by Hamza** — Retrieve an individual attempt.
- [x] **Done by Hamza** — Server-side quiz service and attempt ownership checks are represented.

Mounted routes currently include:

- [x] **Done by Hamza** — `GET /api/quiz-questions`
- [x] **Done by Hamza** — `GET /api/quiz-attempts`
- [x] **Done by Hamza** — `POST /api/quiz-attempts`
- [x] **Done by Hamza** — `GET /api/quiz-attempts/:id`
- [x] **Done by Hamza** — `PATCH /api/quiz-attempts/:id/answer`
- [x] **Done by Hamza** — `POST /api/quiz-attempts/:id/complete`

### 7. Personalization implementation present in source

- [x] **Done by Hamza** — Bookmark listing, creation, note update, and deletion.
- [x] **Done by Hamza** — Recently viewed listing and creation.
- [x] **Done by Hamza** — Saved-filter listing, creation, and deletion.
- [x] **Done by Hamza** — Comparison listing, creation, and deletion.
- [x] **Done by Hamza** — Ownership is derived from the authenticated user rather than a client-supplied user ID.

Mounted routes currently include operations under:

- [x] **Done by Hamza** — `/api/users/me/bookmarks`
- [x] **Done by Hamza** — `/api/users/me/recently-viewed`
- [x] **Done by Hamza** — `/api/users/me/saved-filters`
- [x] **Done by Hamza** — `/api/users/me/comparisons`

### 8. Content and community implementation present in source

- [x] **Done by Hamza** — Public resource listing and detail.
- [x] **Done by Hamza** — Resource download counter operation.
- [x] **Done by Hamza** — Public media listing and detail.
- [x] **Done by Hamza** — Authenticated media rating.
- [x] **Done by Hamza** — Public approved-story listing and detail.
- [x] **Done by Hamza** — Authenticated success-story submission.
- [x] **Done by Hamza** — Authenticated feedback submission.
- [x] **Done by Hamza** — Current-user feedback history.
- [x] **Done by Hamza** — Notification listing.
- [x] **Done by Hamza** — Mark one notification as read.
- [x] **Done by Hamza** — Mark all notifications as read.

### 9. Admin implementation present in source

- [x] **Done by Hamza** — Staff-role middleware is mounted on `/api/admin/*` routes.
- [x] **Done by Hamza** — User listing, detail, role/status update.
- [x] **Done by Hamza** — Career create, list, update, and delete.
- [x] **Done by Hamza** — Quiz-question create, list, update, and delete.
- [x] **Done by Hamza** — Resource create, list, update, and delete.
- [x] **Done by Hamza** — Media create, list, update, and delete.
- [x] **Done by Hamza** — Story listing, approval, and rejection.
- [x] **Done by Hamza** — Feedback listing, response, and analytics.
- [x] **Done by Hamza** — Usage statistics endpoint.
- [x] **Done by Hamza** — Admin settings read and update.
- [x] **Done by Hamza** — Audit-log model and service.
- [x] **Done by Hamza** — Audit logging for major admin mutations.
- [x] **Done by Hamza** — Privileged paginated audit-log endpoint.

### 10. Profile implementation present in the second version

- [x] **Done by Hamza** — Authenticated profile retrieval.
- [x] **Done by Hamza** — Authenticated profile editing using a server-side editable-field allowlist.
- [x] **Done by Hamza** — Onboarding status and current-step persistence.
- [x] **Done by Hamza** — Avatar/resume asset metadata update.
- [ ] Actual file receipt, validation, scanning, and storage.

## Critical backend problems that must be fixed first

### 1. Backend startup is broken

- [ ] Correct `package.json` scripts: they currently run nonexistent `src/server.js`.
- [ ] Move/fix the server entry point. The root `server.js` imports `./app.js` and `./config/*`, while the real files are under `src/`.
- [ ] Rename `src/controllers/auth.controller.js.js` to `auth.controller.js`, or update every import consistently.
- [ ] Change imports of `../utils/tokens.js` to the existing `../utils/token.js`, or rename the utility file consistently.
- [ ] Resolve `careerRoutes.js` and `quizRoutes.js` imports of nonexistent `middleware/auth.js`.
- [ ] Decide whether legacy route/controller modules are still required. Remove them or migrate them to the active route structure.
- [ ] Add a module-import smoke test so missing imports fail in CI immediately.

Until these items are fixed, `src/app.js` cannot be imported and `server.js` cannot start.

### 2. Dependency manifest must be finalized

Improvement: `express`, `cors`, `helmet`, `cookie-parser`, and `express-rate-limit` are now declared and installed normally.

Remaining work:

- [ ] Add `express-validator` if the legacy `validate.js`, `careerRoutes.js`, and `quizRoutes.js` modules remain in use, or remove those dead legacy modules.
- [ ] Rename the package and description from the stale Phase 1 database-only identity if this directory is now the complete API.

Then:

- [ ] Run a clean `npm ci`.
- [ ] Confirm `npm ls --depth=0` reports no unexpected extraneous or missing packages.
- [ ] Confirm the server starts from a clean checkout.

### 3. Model barrel exports are fixed, but model behavior needs integration testing

- [x] **Done by Hamza** — Active models are exported from `src/models/index.js`.
- [x] **Done by Hamza** — The missing `Bookmark` export and Milestone 2 test failure are fixed.
- [ ] Verify all models and indexes against live MongoDB in the normal CI flow.
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
- [x] **Done by Hamza** — `GET/PATCH /api/users/me/profile` is mounted and implemented in source.
- [x] **Done by Hamza** — Onboarding status and current step can be persisted.
- [x] **Done by Hamza** — Avatar/resume asset metadata can be updated.
- [ ] Persist and validate the complete frontend onboarding-answer payload, not only status/current step.
- [ ] Actual avatar upload/change/remove with safe storage.
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
- [x] **Done by Hamza** — Multimedia schema includes transcript storage.
- [ ] Add a dedicated/verified transcript retrieval contract if full media responses are insufficient.
- [x] **Done by Hamza** — Source implements one current rating per user/media pair and recalculates aggregate values.
- [ ] Verify rating concurrency and aggregate correctness with database integration tests.
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
- [x] **Done by Hamza** — Add audit-log model, service, and privileged endpoint.
- [x] **Done by Hamza** — Record major admin data-changing operations.
- [ ] Record admin sign-in/security events and confirm every important mutation is covered.
- [ ] Add richer analytics overview endpoint.
- [x] **Done by Hamza** — Core large admin listings use pagination helpers.
- [ ] Confirm pagination and bounded queries across every large table and audit-log query.
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

- [x] **Done by Hamza** — `backend/.env.example` documents `PORT` and `FRONTEND_ORIGIN`.
- [x] **Done by Hamza** — Session cookie settings are documented.
- [x] **Done by Hamza** — Bcrypt cost settings are documented.
- [x] **Done by Hamza** — Email provider/from settings are documented.
- [x] **Done by Hamza** — Authentication rate-limit settings are documented.
- [x] **Done by Hamza** — Verification/reset expiry settings are documented.
- [ ] Restore required `MONGODB_URI` and `MONGODB_DB_NAME` placeholders.
- [ ] Restore `SEED_DEMO_PASSWORD`, `NODE_ENV`, and `ALLOW_PRODUCTION_SEED` documentation.
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

- [x] **Done by Hamza** — The current default schema/seed unit test suite passes: 21 passed and 0 failed.
- [x] **Done by Hamza** — Milestone 2 schema tests that failed in the first version now pass.
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
- Correct the `start`/`dev` entry point and server import paths.
- Restore required database and seed variables in `.env.example`.
- Keep the now-declared runtime dependencies and resolve/remove the legacy `express-validator` dependency.
- Consolidate duplicate modules.
- Keep the now-complete active model exports.
- Keep the now-passing schema/seed tests green.
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

The renamed second backend version is a clear improvement over the original: dependency declarations, model exports, schema coverage, profile/onboarding APIs, quiz logic, audit logging, admin statistics, and environment documentation are stronger, and the default test suite now passes. These improvements materially reduce the first version's structural incompleteness.

The backend is nevertheless **partially implemented, internally inconsistent, unable to boot, and disconnected from the frontend**. Passing schema tests do not prove that authentication, API routes, permissions, scoring, uploads, or persistence work together. The immediate milestone remains a cleanly installable and runnable server with live database/API integration tests. The next milestone should be a fully integrated authentication/profile flow and one complete database-backed product journey. Only after those foundations are stable should the remaining SRS intelligence, sharing, storage, security, and production features be completed.
