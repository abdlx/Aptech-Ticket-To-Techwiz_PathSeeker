# PathSeeker Full-Stack Implementation Plan

**Plan date:** August 26, 2026<br>
**Scope:** Complete all remaining SRS requirements, make the backend operational, integrate every frontend screen with the API, and introduce maintainable frontend routing, state management, validation, testing, security, and deployment practices.<br>
**Source documents:** `PathSeeker_Career_Passport_SRS_Clean.md`, `PATHSEEKER_PROJECT_TASKSHEET.md`, and `Project/BACKEND_AUDIT_AND_REMAINING_WORK.md`.

## 1. Outcome and completion standard

The implementation is complete only when:

- Every mandatory SRS journey works against persistent backend data.
- The backend installs cleanly, starts reliably, connects to MongoDB, and passes unit/API/integration tests.
- The frontend has real URL routes, authenticated/role-protected navigation, session restoration, and no production fixture dependencies.
- Every data screen handles loading, empty, success, validation, unauthorized, forbidden, offline, and server-error states.
- Server state, client state, form state, and URL state have clearly separated ownership.
- User and admin mutations enforce authentication, authorization, ownership, validation, auditability, and safe error handling.
- Required accessibility, security, performance, documentation, deployment, backup, and demonstration deliverables are complete.

## 2. Ownership and status convention

- `[x] **Done by Hamza**` means the current repository already contains the audited foundation.
- `[ ]` means remaining implementation work.
- `Owner: Implementation` means the developer completing the remaining project work.
- A task is not complete because a route or component exists; its acceptance criteria and tests must pass.

## 3. Current foundation

- [x] **Done by Hamza** — React/Vite frontend and the full visual screen set.
- [x] **Done by Hamza** — Express/Mongoose backend structure and most domain models.
- [x] **Done by Hamza** — Authentication, session, catalog, quiz, content, personalization, notification, profile, settings, admin, and audit source modules.
- [x] **Done by Hamza** — 21 passing schema/seed tests.
- [x] **Done by Hamza** — Admin audit-log model/service and major mutation logging.
- [x] **Done by Hamza** — Profile and onboarding status endpoints.
- [x] **Done by Hamza** — Server-side quiz scoring foundation and match notification creation.
- [x] **Done by Hamza** — Media rating aggregation and recently-viewed upsert behavior.
- [x] **Done by Hamza** — Frontend API request helper and partial endpoint map.
- [ ] Backend startup and module imports are still broken.
- [ ] No frontend production page is integrated with the API.
- [ ] Mandatory Career Passport, dashboard aggregation, recommendations, sharing/export, secure uploads, and production hardening remain incomplete.

## 4. Target architecture

```text
Browser
  React Router
    Public routes
    Auth routes
    Protected user routes
    Protected admin routes
  Providers
    QueryClientProvider          server-state cache
    AuthProvider                 current session facade
    AccessibilityProvider       local UI preferences
    Toast/ErrorBoundary          user feedback and recovery
  Feature modules
    page -> query/mutation hook -> API module -> /api

Express API
  route -> validation -> auth/role/ownership -> controller -> service -> Mongoose
                                                       |-> audit log
                                                       |-> notification
                                                       |-> file storage

MongoDB
  identity/profile/catalog/quiz/passport/content/activity/admin collections

Object storage or controlled local development storage
  avatars/resumes/resources/media/story images
```

### Architectural rules

1. Pages never call `fetch` directly.
2. Pages never import fixture product data in production.
3. Controllers handle HTTP translation, not business logic.
4. Services own workflows and database writes.
5. Mongoose schemas enforce persistent invariants; request schemas reject invalid input before service execution.
6. Authentication comes from the session cookie, never a user ID supplied by the browser.
7. TanStack Query owns remote/server state.
8. Zustand owns cross-route client-only or resumable workflow state.
9. React Hook Form owns form state.
10. React Router owns navigation and shareable URL state.
11. Component `useState` is reserved for local presentation state.
12. Every mutation declares cache invalidation or a tested optimistic update/rollback.

## 5. Approved frontend platform decisions

### Required frontend dependencies

- [ ] Add `react-router-dom` for URL routing, route parameters, layouts, and guards.
- [ ] Add `@tanstack/react-query` for API caching, request deduplication, retries, invalidation, and mutation state.
- [ ] Add `zustand` for cross-page client/workflow state.
- [ ] Add `react-hook-form` for form state and accessible submission handling.
- [ ] Add `zod` and `@hookform/resolvers` for frontend validation schemas.
- [ ] Add a small toast library such as `sonner`, or implement one accessible project-native toast provider.
- [ ] Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, and `msw` for frontend testing.
- [ ] Add Playwright for browser end-to-end tests.

### Libraries deliberately not required initially

- Redux is not required; the state domains do not justify a second large state framework.
- Axios is not required; the existing fetch boundary can be upgraded with timeout, cancellation, and normalized errors.
- A separate form store is not required; React Hook Form owns transient form state.
- API responses must not be copied into Zustand.

## 6. Frontend state-management design

| State category | Owner | Examples | Persistence |
|---|---|---|---|
| Server state | TanStack Query | user, profile, careers, attempts, bookmarks, notifications, admin lists | In-memory cache; refetch after reload |
| Authentication facade | AuthProvider backed by `useQuery` | current user, role, onboarding status | Server session cookie; no token in local storage |
| URL state | React Router/search params | page, slug/ID, filters, sort, pagination, active admin record | URL/history |
| Workflow state | Zustand | in-progress quiz answers, comparison selection, multi-step story/onboarding drafts | `sessionStorage` unless explicitly long-lived |
| UI preferences | Zustand or context | theme, font size, reduced motion, Navi mute | `localStorage`; non-sensitive only |
| Form state | React Hook Form | login, profile, feedback, editors | Component lifetime; draft persistence only where required |
| Local presentation | `useState` | open modal, current tab, transcript visibility, mobile menu | None |

### Zustand stores

#### `useQuizDraftStore`

- `attemptId`
- `questionIds`
- `answersByQuestionId`
- `currentQuestionIndex`
- `startedAt`
- `clearDraft()`
- Persist to `sessionStorage`.
- Server remains authoritative; draft is reconstructed from the attempt API after reload.

#### `useComparisonStore`

- `selectedCareerIds`, maximum five.
- `addCareer(id)`, `removeCareer(id)`, `clear()`.
- Persist to `sessionStorage`.
- Save named comparisons through an API mutation, not store persistence.

#### `useAccessibilityStore`

- `theme`: `light | dark | system`.
- `fontScale`: bounded preference.
- `reducedMotion`.
- `naviMuted`.
- Persist non-sensitive values to `localStorage`.
- Synchronize server-supported preferences after profile load.

#### `useOnboardingDraftStore`

- Current step and unsaved form fragments.
- Persist to `sessionStorage`.
- Clear only after the API confirms completion.

### Query-key factory

Create `src/lib/queryKeys.js` with stable factories:

```js
queryKeys.auth.me()
queryKeys.profile.me()
queryKeys.careers.list(filters)
queryKeys.careers.detail(slug)
queryKeys.recommendations.me()
queryKeys.quiz.questions(version)
queryKeys.quiz.attempts.list(params)
queryKeys.quiz.attempts.detail(id)
queryKeys.bookmarks.list(params)
queryKeys.recentlyViewed.list(params)
queryKeys.savedFilters.list()
queryKeys.comparisons.list()
queryKeys.resources.list(filters)
queryKeys.resources.detail(id)
queryKeys.media.list(filters)
queryKeys.media.detail(id)
queryKeys.stories.list(filters)
queryKeys.stories.detail(id)
queryKeys.feedback.mine()
queryKeys.notifications.list(params)
queryKeys.admin.users.list(params)
queryKeys.admin.careers.list(params)
queryKeys.admin.content.list(params)
queryKeys.admin.feedback.list(params)
queryKeys.admin.stats()
queryKeys.admin.settings()
queryKeys.admin.auditLogs.list(params)
```

### Cache policy

- Session/profile: stale after 30–60 seconds; always refetch after login/logout/profile update.
- Public catalog/content: stale after 5 minutes.
- Notifications: stale after 30 seconds; refetch on window focus while authenticated.
- Admin lists: stale immediately after mutations.
- Quiz attempt detail: stale immediately while in progress; longer after completion.
- Do not retry 400, 401, 403, or 404 responses automatically.
- Retry transient network/5xx reads at most twice with backoff.
- Mutations are not automatically retried unless explicitly idempotent.

## 7. Standard API contract

### Success shapes

```json
{ "data": { "resource": {} }, "message": "Optional message" }
```

```json
{
  "data": { "items": [] },
  "meta": { "page": 1, "limit": 20, "total": 0, "pages": 0 }
}
```

### Error shape

```json
{
  "message": "Human-readable message",
  "code": "STABLE_MACHINE_CODE",
  "details": [{ "field": "email", "message": "Enter a valid email." }],
  "requestId": "optional-correlation-id"
}
```

### Contract tasks

- [ ] Choose `/api` or `/api/v1` and document the decision before frontend migration.
- [ ] Normalize pagination to one location (`meta`, not sometimes nested under `data`).
- [ ] Normalize resource naming and IDs across all endpoints.
- [ ] Add consistent 201, 200, and 204 mutation behavior.
- [ ] Add stable error codes for auth, validation, ownership, conflicts, rate limits, and server failures.
- [ ] Add request cancellation with `AbortController` and a 15-second default timeout.
- [ ] Create an OpenAPI document covering every route, payload, role, status, and error.
- [ ] Add contract tests that compare real responses with the documented schemas.

## 8. Critical path and phase dependencies

```text
P0 Backend boot
  -> P1 API contracts and test harness
    -> P2 Frontend routing/API/state foundation
      -> P3 Authentication/profile vertical slice
        -> P4 Careers/dashboard vertical slice
          -> P5 Quiz/passport/recommendations
            -> P6 Personalization
              -> P7 Content/community/notifications
                -> P8 Admin operations
                  -> P9 Security/accessibility/performance
                    -> P10 Deployment and final acceptance
```

No feature migration should begin before P0. P3 must be complete before any protected user/admin mutation is considered integrated.

## 9. Phase P0 — Make the backend boot reliably

**Goal:** A clean checkout can install, start, connect to MongoDB, and answer health checks.

### P0 tasks

- [ ] **P0-01 — Server entry point:** create/fix `src/server.js`, or point scripts to a corrected root entry point. Use imports from `src/app.js` and `src/config/*` consistently.
- [ ] **P0-02 — Token utility import:** rename `token.js`/`tokens.js` or update all imports to one canonical filename.
- [ ] **P0-03 — Auth controller filename:** rename `auth.controller.js.js` to `auth.controller.js`.
- [ ] **P0-04 — Remove legacy duplicates:** resolve `careerRoutes.js`, `quizRoutes.js`, duplicate controllers, duplicate auth middleware, and duplicate error handlers.
- [ ] **P0-05 — Dependency cleanup:** remove legacy `express-validator` usage or declare it intentionally.
- [ ] **P0-06 — Environment template:** restore MongoDB URI/name, seed password, environment, production seed guard, and all API variables.
- [ ] **P0-07 — Readiness:** add `GET /api/health/db` that verifies connection state without exposing secrets.
- [ ] **P0-08 — Shutdown:** close HTTP and MongoDB connections on `SIGINT`/`SIGTERM`.
- [ ] **P0-09 — Logging:** add request IDs and structured logs with secret/cookie/token redaction.
- [ ] **P0-10 — Smoke tests:** import `src/app.js`, start the app on an ephemeral port, and test `/api/health` and `/api/health/db`.

### P0 acceptance criteria

- `npm ci` succeeds from a clean directory.
- `npm test` passes.
- `npm start` remains running rather than exiting with an import error.
- Health returns 200; readiness returns 200 only with MongoDB connected.
- Missing required environment values fail fast with actionable messages.
- Shutdown leaves no hanging server or database handle.

## 10. Phase P1 — Backend validation, contracts, and test harness

**Goal:** Stabilize the backend boundary before frontend integration.

### P1 tasks

- [ ] **P1-01 — Request schemas:** standardize validation using Zod or one selected validator for params, query, and bodies.
- [ ] **P1-02 — ObjectId validation:** reject malformed IDs with 400 before database queries.
- [ ] **P1-03 — Query allowlists:** reject unknown MongoDB operators and unsafe sort fields.
- [ ] **P1-04 — Response helpers:** create helpers for item, collection, created, no-content, and validation responses.
- [ ] **P1-05 — API documentation:** create OpenAPI route documentation.
- [ ] **P1-06 — Integration database:** use a disposable database and deterministic setup/teardown.
- [ ] **P1-07 — API test client:** use Node test plus Supertest, or another single selected HTTP test tool.
- [ ] **P1-08 — Route coverage:** add success, validation, unauthorized, forbidden, not-found, and conflict tests per route group.
- [ ] **P1-09 — Index verification:** run index/persistence integration tests in CI.
- [ ] **P1-10 — Seed coverage:** extend seeds to resources, media, stories, feedback, notifications, bookmarks, comparisons, and settings.

### P1 acceptance criteria

- Every mounted route has a documented request/response contract.
- Every protected route has authentication/role/ownership tests.
- No controller passes raw `req.body` or unbounded query objects into updates without an allowlist.
- CI creates and destroys only a disposable test database.

## 11. Phase P2 — Frontend platform foundation

**Goal:** Replace query-string screen switching with a real application platform.

### P2 route structure

```text
/
/signup
/login
/verify-email
/forgot-password
/reset-password
/onboarding

/app                         protected user layout
/app/dashboard
/app/quiz
/app/quiz/history
/app/quiz/results/:attemptId
/app/recommendations
/app/careers
/app/careers/:slug
/app/careers/compare
/app/resources
/app/resources/:resourceId
/app/media/:mediaId
/app/saved
/app/saved-filters
/app/recently-viewed
/app/stories
/app/stories/submit
/app/stories/:storyId
/app/profile
/app/feedback
/app/notifications
/app/help

/admin/login
/admin                        protected staff layout
/admin/users
/admin/users/:userId
/admin/careers
/admin/careers/new
/admin/careers/:careerId
/admin/content
/admin/content/new
/admin/content/:contentId
/admin/quiz
/admin/stories
/admin/stories/:storyId
/admin/feedback
/admin/feedback/analytics
/admin/settings
/admin/audit-logs

/unauthorized
/forbidden
/*                             not found
```

### P2 tasks

- [ ] **P2-01 — Router:** install React Router and create public, auth, user, and admin layouts.
- [ ] **P2-02 — Navigation migration:** replace `navigate(screen)` and `?screen=` branching with links/navigation hooks.
- [ ] **P2-03 — Route params:** replace default career/media/story IDs with URL parameters.
- [ ] **P2-04 — Query client:** install/configure TanStack Query with retry/error defaults.
- [ ] **P2-05 — API client:** replace the current helper with timeout, cancellation, normalized errors, query serialization, and safe 204 handling.
- [ ] **P2-06 — Service modules:** split auth, profile, careers, quiz, personalization, content, stories, feedback, notifications, and admin APIs.
- [ ] **P2-07 — Providers:** add query, auth, accessibility, toast, and error-boundary providers.
- [ ] **P2-08 — Forms:** install React Hook Form/Zod and shared field-error components.
- [ ] **P2-09 — Stores:** add quiz draft, comparison, onboarding draft, and accessibility stores.
- [ ] **P2-10 — Environment:** add `frontend/.env.example` and Vite `/api` proxy.
- [ ] **P2-11 — Common states:** implement `PageSkeleton`, `EmptyState`, `ErrorState`, `OfflineState`, `Unauthorized`, `Forbidden`, and `NotFound`.
- [ ] **P2-12 — Test setup:** configure Vitest, Testing Library, MSW, and accessible render helpers.
- [ ] **P2-13 — Lazy loading:** lazy-load route modules and admin bundles.

### P2 acceptance criteria

- Refreshing or directly opening every route renders the correct page.
- Browser back/forward works without custom popstate logic.
- A network error produces a recoverable error state, not a blank page.
- No auth/session token is stored in local storage.
- Lint, build, router smoke tests, and provider tests pass.

## 12. Phase P3 — Authentication, authorization, profile, and onboarding

**Goal:** Deliver the first complete full-stack vertical slice.

### Backend tasks

- [ ] Confirm register creates both user and profile atomically or with safe compensation.
- [ ] Add allow-new-registration setting enforcement.
- [ ] Verify email/resend attempt limits and token rotation.
- [ ] Verify login status/role/email verification checks.
- [ ] Verify admin login rejects non-staff roles.
- [ ] Verify logout revokes the server session and clears the cookie.
- [ ] Verify password reset revokes all existing sessions/tokens.
- [ ] Add account update/deactivate/delete and retention policy.
- [ ] Validate the full profile/onboarding payload.
- [ ] Implement safe avatar/resume upload or explicitly disable the optional resume UI.

### Frontend tasks

- [ ] Replace signup form defaults with controlled validated fields.
- [ ] Connect signup and handle email conflicts/validation.
- [ ] Connect verification and resend countdown.
- [ ] Connect user and admin login.
- [ ] Add `useCurrentUser()` using `/auth/me`.
- [ ] Add `RequireUser`, `RequireStaff`, and onboarding-completion guards.
- [ ] Add session restoration splash/skeleton.
- [ ] Add logout everywhere and handle 401 globally by clearing session cache.
- [ ] Connect forgot/reset password with token from URL.
- [ ] Connect onboarding steps to profile/onboarding endpoints.
- [ ] Connect profile/settings forms, including optimistic-free save confirmation.
- [ ] Preserve an intended destination across login.

### Required tests

- Registration → verification → onboarding → dashboard.
- User and admin login success/failure.
- Refresh restores session.
- Logged-out user cannot open `/app/*`.
- User cannot open `/admin/*`.
- Suspended/deleted user loses access.
- Expired/revoked session returns to login without losing a safe intended route.
- Password reset invalidates old sessions.

## 13. Phase P4 — Careers and personalized dashboard

**Goal:** Replace the main product fixtures and establish reusable list/detail patterns.

### Backend tasks

- [ ] Complete career filters for domain, skill, salary range, demand, and safe sort.
- [ ] Mount autocomplete/suggestions under the canonical router.
- [ ] Add text indexes or a documented search strategy; implement lightweight typo tolerance if Elasticsearch is not used.
- [ ] Add `GET /api/careers/:slug/related`.
- [ ] Add saved-filter update endpoint.
- [ ] Resolve duplicate saved-search vs saved-filter concepts.
- [ ] Add `GET /api/users/me/dashboard` aggregation returning greeting/profile summary, recent activity, latest quiz result, bookmarks, trending careers, and top picks.

### Frontend tasks

- [ ] Migrate Career Bank to `useCareers(filters)`.
- [ ] Put search/filter/sort/page state in URL search params.
- [ ] Debounce suggestions and cancel stale requests.
- [ ] Migrate Career Detail to slug route/query.
- [ ] Record recently viewed after a successful detail fetch.
- [ ] Connect save/bookmark actions.
- [ ] Migrate Dashboard widgets to dashboard API data.
- [ ] Connect Saved Filters create/edit/delete/apply.
- [ ] Implement pagination or accessible load-more behavior.

### Tests and acceptance

- Search/filter URLs are shareable and reloadable.
- Stale suggestions never replace newer results.
- Empty results, invalid slugs, and backend failures render useful states.
- Bookmark and saved-filter changes survive refresh.
- Dashboard renders correctly for a new user with no activity and an established user.

## 14. Phase P5 — Quiz, Career Passport, and recommendations

**Goal:** Implement the core Career Passport workflow required by the product theme.

### Data/model tasks

- [ ] Add quiz publication/version model or version fields.
- [ ] Store quiz version and immutable question/option snapshots on attempts.
- [ ] Add `CareerPassport` model with user, source attempt/profile version, calculated traits/domain scores, generation version, reasons, and timestamps.
- [ ] Add recommendation result model or documented reproducible calculation policy.
- [ ] Add indexes for user/latest passport and user/latest recommendations.

### Backend workflow

- [ ] Return published questions without exposing unnecessary private scoring details.
- [ ] Enforce question timing where time limits are configured.
- [ ] Enforce attempt state transitions and idempotent completion.
- [ ] Require appropriate completion rules rather than accepting one answer unless intentionally specified.
- [ ] Calculate authoritative server scores.
- [ ] Generate/update Career Passport on completion.
- [ ] Return multiple career recommendations with match percentage and explainable reasons.
- [ ] Incorporate approved trends and profile signals without opaque claims.
- [ ] Add latest passport and recommendation endpoints.
- [ ] Notify the user after successful recommendation generation.

### Frontend workflow

- [ ] Fetch/start/resume an attempt.
- [ ] Keep current draft in Zustand/session storage while persisting answers to the server.
- [ ] Disable duplicate answer/complete submissions.
- [ ] Implement timer semantics and accessible announcements.
- [ ] Recover after reload/network interruption.
- [ ] Route completed attempts to `/app/quiz/results/:attemptId`.
- [ ] Migrate history and detail pages from fixtures.
- [ ] Migrate recommendations with match-reason UI.
- [ ] Display Career Passport on profile/dashboard.

### Tests and acceptance

- Old attempts remain understandable after questions change.
- Browser-posted scores are ignored.
- Attempt ownership is enforced.
- Double completion does not duplicate passport/recommendation/notification records.
- Reload resumes the same attempt safely.
- Recommendation reasons correspond to stored inputs and algorithm version.

## 15. Phase P6 — Bookmarks, notes, comparisons, and activity

### Backend tasks

- [ ] Decide embedded bookmark notes versus dedicated Note documents and document the contract.
- [ ] Complete note CRUD and ownership validation.
- [ ] Add bookmark/note PDF export with safe escaping and deterministic layout.
- [ ] Add safe public sharing URLs or explicit email/social share metadata.
- [ ] Add similar career/content suggestions based on bookmarks.
- [ ] Add saved-filter update.
- [ ] Add recently-viewed delete-one and clear-all.
- [ ] Add activity retention policy.
- [ ] Validate comparison career IDs and prevent duplicates.

### Frontend tasks

- [ ] Migrate Saved page from fixture data.
- [ ] Implement bookmark note edit/delete states.
- [ ] Implement PDF export download with pending/error feedback.
- [ ] Implement Web Share API with copy-link fallback where permitted.
- [ ] Connect comparison selection store and saved comparison mutation.
- [ ] Migrate Recently Viewed and deletion controls.
- [ ] Invalidate dashboard/bookmarks/recommendations after mutations.

### Acceptance criteria

- Ownership cannot be bypassed by changing IDs.
- PDF contains the current user's selected bookmarks/notes only.
- Comparison selection survives navigation in the session.
- Deleted activity disappears from all dependent screens after cache invalidation.

## 16. Phase P7 — Resources, media, stories, feedback, and notifications

### File/storage foundation

- [ ] Select object storage for production and controlled local storage for development.
- [ ] Add upload middleware with extension, MIME, file-signature, and size validation.
- [ ] Generate collision-safe object keys.
- [ ] Prevent arbitrary paths and unrestricted remote URLs.
- [ ] Add malware-scanning/quarantine strategy appropriate to deployment.
- [ ] Authorize private downloads and implement signed/controlled access.
- [ ] Add range request/media-provider support.

### Resources and media

- [ ] Add resource view tracking and safe download redirect/stream.
- [ ] Add document preview metadata/thumbnail generation.
- [ ] Return transcripts and related content.
- [ ] Connect resource list/detail/document preview.
- [ ] Connect media detail, playback metadata, transcript toggle, rating, and related content.
- [ ] Preserve playback UI state locally; do not store it globally unless cross-page continuation is required.

### Stories

- [ ] Expand story schema for title, current role, starting point, challenges, turning point, outcome, consent, and workflow notes.
- [ ] Allow owner editing while status permits.
- [ ] Add request-changes moderation state.
- [ ] Sanitize story content before storage/rendering.
- [ ] Connect story listing, detail, multi-step submission, and status feedback.

### Feedback and notifications

- [ ] Align frontend categories with backend enums.
- [ ] Store experience rating, contact consent, page, and device metadata if retained.
- [ ] Add sentiment summary using a documented, reviewable method.
- [ ] Create a notification when an admin responds.
- [ ] Connect feedback submission/history.
- [ ] Connect notification list/read-one/read-all.
- [ ] Add notification pagination, retention, and preferences.

### Acceptance criteria

- Invalid or disguised uploads are rejected.
- Users cannot download unauthorized private files.
- Rating updates remain correct under concurrent requests.
- Only approved stories are public.
- Admin response becomes visible to the submitting user and creates one notification.

## 17. Phase P8 — Fully functional admin workspace

### Admin state strategy

- Filters, sort, page, and selected record IDs live in URLs.
- Lists/details use TanStack Query.
- Editor forms use React Hook Form/Zod.
- Unsaved editor drafts remain local unless an explicit draft API exists.
- Mutations invalidate the affected list, detail, stats, and audit-log queries.

### Tasks

- [ ] Connect admin login and staff guard.
- [ ] Connect overview statistics.
- [ ] Connect users list/detail/update with role-based action visibility.
- [ ] Connect career list/editor with create/update/publish/archive.
- [ ] Connect media/resource list/editor and upload pipeline.
- [ ] Connect quiz editor, reordering, versioning, preview, and publishing.
- [ ] Connect story moderation including request changes.
- [ ] Connect feedback inbox, assignment, internal notes, response, and resolution.
- [ ] Connect feedback analytics including required sentiment summary.
- [ ] Connect settings.
- [ ] Add and connect audit-log page.
- [ ] Add confirmation dialogs and dependency warnings for destructive actions.
- [ ] Prefer archive/soft deletion for referenced records.
- [ ] Ensure every admin mutation records actor/action/target and safe metadata.

### Acceptance criteria

- Hiding buttons is never the only permission control.
- Editors show validation and conflict errors without discarding input.
- Successful mutations update lists/details/statistics without full reload.
- Destructive actions require confirmation and do not orphan referenced data.
- Audit logs identify the acting staff member and affected record.

## 18. Frontend page migration matrix

| Page | Current source | Target query/mutation | Required local state |
|---|---|---|---|
| Welcome | Static | optional health/public stats | voice modal only |
| Signup/Login | Local navigation | auth mutations | form state |
| Verify/Reset | Local flags | verification/reset mutations | OTP/reset form |
| Onboarding | Component state | profile/onboarding mutations | onboarding draft store |
| Dashboard | `data.js` | dashboard query | widget presentation only |
| Career Bank | `data.js` | careers/suggestions queries | URL filters |
| Career Detail | `data.js` | career detail, view, bookmark | note/modal state |
| Quiz | `data.js` | questions/attempt mutations | quiz draft store |
| Quiz History/Result | fixtures | attempt queries | none |
| Recommendations | `data.js` | passport/recommendations | comparison selection |
| Saved | `data.js` | bookmarks query/mutations | selected tab in URL |
| Saved Filters | fixtures | saved-filter CRUD | editor form |
| Compare | `data.js` | career details/comparison CRUD | comparison store |
| Recently Viewed | fixtures | activity query/delete | filter in URL |
| Resources | `data.js` | resources query | filters in URL |
| Media Detail | `data.js` | media query/rating | playback/transcript UI |
| Document Preview | Static | resource detail/download | current preview page |
| Stories | `data.js` | stories query | domain filter in URL |
| Story Detail | Static | story detail | none |
| Submit Story | Component state | story mutation/upload | form wizard |
| Feedback | Local success flag | feedback mutation/history | form state |
| Notifications | fixtures | notification queries/mutations | filter in URL |
| Profile | Component state | profile/passport queries/mutations | active section in URL |
| Admin pages | Mostly hard-coded | admin queries/mutations | URLs/forms only |

## 19. Mutation and cache-invalidation matrix

| Mutation | Invalidate/update |
|---|---|
| Login | auth me, profile, protected dashboard prefetch |
| Logout | clear entire user-specific query cache and Zustand workflow stores |
| Profile update | profile, auth me if shared fields, dashboard, recommendations |
| Complete quiz | attempt detail/list, passport, recommendations, dashboard, notifications |
| Add/update/delete bookmark | bookmarks, dashboard, career detail, recommendations |
| Save/delete filter | saved filters |
| Save/delete comparison | comparisons |
| Record/delete view | recently viewed, dashboard, admin stats where applicable |
| Rate media | media detail/list |
| Submit story | user's story/status query; do not expose publicly until approved |
| Submit feedback | feedback mine |
| Admin respond feedback | admin feedback, analytics, user feedback, notifications |
| Admin content mutation | admin list/detail, public content list/detail, stats, audit logs |
| Admin settings update | settings and any behavior-dependent queries |

## 20. Common frontend behavior requirements

Every query-backed page must implement:

- Initial loading skeleton matching final layout.
- Empty state with an appropriate next action.
- Inline recoverable error state with retry.
- Offline explanation where detectable.
- Not-found state for missing records.
- Unauthorized/forbidden routing.
- Cancellation on route/filter changes where applicable.
- Accessible status announcements for async changes.

Every mutation must implement:

- Pending/disabled duplicate-submission prevention.
- Field-level validation errors.
- General server/network error feedback.
- Success feedback.
- Cache invalidation or tested optimistic rollback.
- Confirmation for destructive actions.
- Focus management after dialogs and errors.

## 21. Security implementation plan

- [ ] Use secure, `httpOnly`, environment-correct session cookies.
- [ ] Implement CSRF protection for cookie-authenticated mutations.
- [ ] Keep strict credentialed CORS allowlists.
- [ ] Apply rate limits to auth, uploads, feedback, stories, sharing/export, and sensitive admin endpoints.
- [ ] Hash passwords and opaque tokens at suitable cost/strength.
- [ ] Revoke sessions on password reset, suspension, deletion, and security-sensitive changes.
- [ ] Sanitize stored user/admin text and render it safely.
- [ ] Validate all IDs, enums, numbers, arrays, and query keys.
- [ ] Prevent NoSQL operator injection.
- [ ] Restrict file types, signatures, sizes, names, paths, and access.
- [ ] Redact secrets and personal data from logs.
- [ ] Add security headers and explicit content security policy compatible with required media.
- [ ] Add audit/security events for login failures, role/status changes, and admin mutations.
- [ ] Define retention/deletion for accounts, activity, sessions, tokens, uploads, feedback, and audit logs.
- [ ] Run dependency and application security checks in CI.

## 22. Accessibility and responsive plan

- [ ] Preserve semantic headings and landmarks through routing migration.
- [ ] Add skip navigation and visible keyboard focus.
- [ ] Ensure all icon-only buttons have accessible names.
- [ ] Ensure form errors are associated and summarized.
- [ ] Announce route changes and async outcomes.
- [ ] Trap/restore focus in dialogs.
- [ ] Verify contrast in light/dark modes.
- [ ] Add font-size preference without layout breakage.
- [ ] Respect reduced motion.
- [ ] Provide transcripts/captions for media.
- [ ] Verify keyboard-only flows for all user/admin journeys.
- [ ] Test current Chrome, Firefox, Edge, Safari, mobile, tablet, and desktop layouts.

## 23. Testing pyramid and required suites

### Backend unit tests

- Validators and pagination.
- Scoring and recommendation rules.
- Passport generation.
- Permission and ownership helpers.
- File validation.
- Feedback sentiment/analytics.
- Audit payload redaction.

### Backend API/integration tests

- Auth lifecycle and rate limits.
- Profile/onboarding ownership.
- Career filters/search/detail.
- Quiz version/attempt/complete/passport/recommendations.
- Bookmark/note/export/share.
- Activity, filters, comparisons.
- Resource/media/upload/download/rating.
- Story submission/moderation.
- Feedback response/notification.
- Admin role denial and CRUD.
- Audit logs and settings.

### Frontend component/integration tests

- Route guards and session restoration.
- Forms: success, field validation, general errors, pending state.
- Career filters and stale request cancellation.
- Quiz resume and duplicate-completion prevention.
- Bookmark/note/cache invalidation.
- Admin editors preserving data on errors.
- Loading/empty/error/unauthorized states.
- Accessibility-store persistence.

### End-to-end journeys

1. Student registers, verifies, onboards, takes quiz, sees passport/recommendations, bookmarks, and notes.
2. Graduate filters/saves careers, compares roles, watches/rates media, and downloads a resource.
3. Professional updates profile, retakes quiz, reviews history, and submits a story.
4. User submits feedback; admin responds; user receives a notification.
5. Admin signs in, publishes career/content/quiz changes, moderates a story, resolves feedback, and checks audit logs.
6. Unauthorized users fail to access records by editing routes/IDs.
7. Refresh/deep-link/slow-network/offline/expired-session/server-error behavior remains understandable.

## 24. CI quality gates

- [ ] Clean backend `npm ci`.
- [ ] Backend syntax/import smoke test.
- [ ] Backend unit tests.
- [ ] Backend API/integration tests with disposable MongoDB.
- [ ] Clean frontend `npm ci`.
- [ ] Frontend lint.
- [ ] Frontend component/integration tests.
- [ ] Frontend production build.
- [ ] Critical Playwright journeys.
- [ ] Dependency/security scan.
- [ ] OpenAPI/response contract validation.
- [ ] No committed secrets or production fixture imports.

No merge is accepted if a required gate fails.

## 25. Performance and scalability plan

- [ ] Define measurable initial-load, API, search, and media-start targets.
- [ ] Paginate all unbounded collections.
- [ ] Add/verify indexes using real query patterns.
- [ ] Inspect MongoDB explain plans for careers, activity, admin lists, and analytics.
- [ ] Debounce and cancel searches.
- [ ] Lazy-load route bundles and noncritical media.
- [ ] Optimize image formats/sizes.
- [ ] Cache public content with safe invalidation.
- [ ] Avoid N+1 population/query patterns.
- [ ] Run load tests for login, careers, quiz completion, and admin analytics.
- [ ] Record baseline results in project documentation.

## 26. Deployment and operations plan

- [ ] Create development, test, staging, and production environment matrices.
- [ ] Provision managed MongoDB or documented production MongoDB.
- [ ] Provision production object storage.
- [ ] Configure HTTPS, cookies, CORS, CSP, secrets, and mail provider.
- [ ] Add database migration/index deployment procedure.
- [ ] Add structured logs, uptime checks, and database-error alerts.
- [ ] Configure backups, retention, and a tested restore drill.
- [ ] Deploy frontend and backend.
- [ ] Run smoke/E2E tests against staging and production.
- [ ] Document rollback and incident steps.

## 27. Documentation and SRS deliverables

- [ ] Replace root/backend template READMEs with actual project documentation.
- [ ] Add full installation and startup instructions.
- [ ] Add environment-variable reference.
- [ ] Add architecture/component diagram.
- [ ] Add public/user/admin flowcharts.
- [ ] Add context and detailed data-flow diagrams.
- [ ] Add database relationship diagram and data dictionary.
- [ ] Add OpenAPI documentation.
- [ ] Add test plan, cases, data, results, and defect summary.
- [ ] Add safe private demo credentials.
- [ ] Add asset/license/AI-image attribution.
- [ ] Add mandatory homepage sitemap.
- [ ] Prepare the report without source code as requested by the SRS.
- [ ] Prepare schema/seed deliverables.
- [ ] Record mandatory MP4 coverage of every functional requirement.
- [ ] Document deployment URL, backup, and recovery.

## 28. Recommended delivery increments

Use these as mergeable milestones rather than attempting a single large integration.

| Increment | Deliverable | Exit gate |
|---|---|---|
| I1 | Backend boot, health/readiness, clean env | startup/API smoke tests |
| I2 | Validation, standardized contracts, integration harness | route contract baseline |
| I3 | Router, Query, API client, stores, test platform | frontend foundation tests/build |
| I4 | Auth/profile/onboarding | first full-stack E2E journey |
| I5 | Careers/dashboard/saved filters | fixtures removed from main discovery flow |
| I6 | Quiz/passport/recommendations | core product journey complete |
| I7 | Bookmarks/notes/comparisons/activity | persistence/export/share verified |
| I8 | Resources/media/stories/feedback/notifications | content/community journey complete |
| I9 | Admin workspace | all admin CRUD/moderation/audit E2E |
| I10 | Security/a11y/performance/deployment/docs | final SRS acceptance |

## 29. Pull-request checklist

- [ ] Task IDs and SRS requirements are referenced.
- [ ] API contract is documented before or with implementation.
- [ ] Validation, auth, role, and ownership are covered.
- [ ] Loading, empty, error, and success UI states are covered.
- [ ] State is stored in the correct owner (URL/query/store/form/local).
- [ ] Mutation invalidation/rollback is defined.
- [ ] Unit/integration/E2E tests appropriate to risk are added.
- [ ] Accessibility and responsive behavior are checked.
- [ ] No fixtures, secrets, debug credentials, or unsafe logs are introduced.
- [ ] Lint, tests, build, and contract checks pass.
- [ ] Documentation and changelog/audit status are updated.

## 30. Definition of done for each feature

A feature is done only if:

1. Its backend route, validation, auth/role/ownership, service, model/index, and errors are implemented.
2. Its API contract and examples are documented.
3. Its frontend service, query/mutation hook, route, UI states, and form behavior are implemented.
4. Its state ownership and cache invalidation are explicit.
5. It has backend and frontend tests plus E2E coverage when it is a critical journey.
6. It works after refresh and direct navigation.
7. It works with empty data and handles failures.
8. It meets keyboard, screen-reader, responsive, and security expectations.
9. It uses persistent real data; production fixtures are removed.
10. Its completed checklist item is attributed to the implementing developer in the audit/report.

## 31. Immediate next actions

Start with these tasks in order:

1. [ ] Fix the backend entry point and import/file-name errors (`P0-01` through `P0-04`).
2. [ ] Restore the complete backend environment template (`P0-06`).
3. [ ] Add health/readiness/import/startup tests (`P0-07`, `P0-10`).
4. [ ] Select validation and standardize response contracts (`P1-01` through `P1-05`).
5. [ ] Build the disposable MongoDB API test harness (`P1-06` through `P1-09`).
6. [ ] Install and configure Router, Query, Hook Form/Zod, Zustand, MSW, and Vitest (`P2`).
7. [ ] Deliver authentication/profile/onboarding as the first integrated vertical slice (`P3`).

Do not begin bulk page migration before these seven steps are complete; otherwise every page will be built on unstable routing, session, API, and error contracts.
