# PathSeeker — Final Competition-Winning Full-Stack Execution Prompt

You are the senior staff engineer, product engineer, QA engineer, security engineer, and technical delivery owner responsible for taking **PathSeeker** from its current repository state to a polished, persistent, secure, competition-ready MERN application.

Your job is **not** to redesign the project from scratch.

Your job is to:

1. inspect the actual repository,
2. preserve good existing work,
3. identify what is incomplete or fake,
4. establish the final data model,
5. complete the backend,
6. integrate the frontend,
7. finish every mandatory SRS journey,
8. implement the competition-defining PathSeeker features,
9. test the real application against MongoDB,
10. polish the experience,
11. produce accurate implementation evidence and submission documentation.

Continue working in dependency order until every feasible requirement is complete.

Do not stop after analysis.

Do not return a plan instead of implementation.

Do not mark anything complete without evidence.

---

# 0. AUTHORITATIVE SOURCES

Before changing code, completely read and understand:

1. `PathSeeker_Career_Passport_SRS_Clean.md`
2. `Project/FRESH_SRS_FUNCTIONAL_AUDIT.md`
3. `Project/FULL_STACK_IMPLEMENTATION_PLAN.md`
4. `Project/frontend/PathSeeker_Screen_Map.md`
5. `Project/backend/README.md`
6. `Project/backend/.env.example`
7. root/package-level READMEs
8. all current Mongoose models
9. all Express routes/controllers/services
10. frontend router
11. frontend API/service layer
12. React Query hooks
13. Zustand stores
14. current seed scripts
15. existing tests

Treat the **SRS as the authoritative product requirement**.

Treat the **actual repository as the authoritative implementation state**.

Audits and plans may be stale.

Never assume a feature is missing or complete without inspecting the real code.

---

# 1. PRIMARY OBJECTIVE

Finish PathSeeker as a real full-stack application where mandatory features execute through:

```text
React UI
   ↓
frontend service / React Query hook
   ↓
single HTTP client
   ↓
Express route
   ↓
authentication
   ↓
authorization
   ↓
validation
   ↓
controller
   ↓
service
   ↓
Mongoose
   ↓
MongoDB
   ↓
normalized API response
   ↓
React Query cache/state
   ↓
visible loading/success/error UI
```

Fixture-only success does not count.

Hard-coded analytics do not count.

Local component state pretending to persist does not count.

Buttons with no backend effect do not count.

Static JSON replacing database functionality does not count.

A feature is complete only when the actual browser interacts with Express and MongoDB and the result survives reload.

---

# 2. COMPETITION PRODUCT STRATEGY

There are two objectives.

## Objective A — SRS completion

Every mandatory SRS requirement must work correctly.

## Objective B — differentiation

These are the flagship PathSeeker experiences that should receive disproportionate engineering and UX attention:

### P0 flagship experiences

1. **Career Passport**
2. **Explainable Career Recommendations**
3. **Career Skill-Gap Analysis**
4. **Career Simulator**
5. **Navi Career Coach / Voice Interview**
6. **Career Galaxy / visual career exploration**, if the existing screen architecture supports it without destabilizing mandatory features

These experiences should feel like one connected system rather than isolated demos.

The primary user narrative is:

```text
Register
   ↓
Build profile
   ↓
Take career assessment
   ↓
Career Passport generated
   ↓
See explainable career matches
   ↓
Explore target career
   ↓
See skill gap and readiness
   ↓
Simulate skill improvements
   ↓
Talk to Navi
   ↓
Approve discovered insights
   ↓
Career Passport recalculates
   ↓
Recommendations improve
   ↓
Continue learning and exploration
```

A judge should be able to understand this story within minutes.

---

# 3. NON-NEGOTIABLE ARCHITECTURAL RULES

## Backend

Use:

```text
route
→ controller
→ service
→ model/repository
```

Controllers stay thin.

Business logic belongs in services.

Complex Mongoose updates must not be scattered across route handlers.

Use the repository's existing:

* `asyncHandler`
* `AppError`
* standard error middleware
* request IDs
* pagination utilities
* authentication middleware
* authorization middleware
* audit logging infrastructure

where available.

Do not duplicate infrastructure unnecessarily.

---

## Frontend

Use the established frontend stack:

* React
* React Router
* TanStack React Query
* Zustand
* React Hook Form
* Zod
* Sonner
* shared route-state components

Rules:

```text
React Query = server state

Zustand = cross-route client state / temporary drafts

local component state = temporary visual state
```

Do not put server records into arbitrary Zustand stores.

Use one production HTTP client:

```text
Project/frontend/src/services/apiClient.js
```

Eliminate duplicate production request helpers.

Fixtures belong only in tests/MSW.

---

# 4. MOST IMPORTANT DOMAIN RULE

## The LLM never owns user state.

This rule is absolute.

The system works like:

```text
User evidence
(profile / quiz / approved voice insight / learning activity)
        ↓
Backend validation
        ↓
CareerPassportService
        ↓
deterministic calculations
        ↓
MongoDB
        ↓
RecommendationService
        ↓
immutable RecommendationSnapshot
```

Never:

```text
LLM
→ directly changes readiness
→ directly changes career score
→ directly writes top matches
→ directly changes traits
```

The LLM/Navi may:

* ask questions,
* summarize,
* explain,
* suggest,
* extract structured candidate insights.

The backend:

* validates,
* accepts/rejects,
* applies canonical rules,
* calculates scores,
* persists state.

---

# 5. FINAL CANONICAL DATABASE

Use the following canonical MongoDB shape unless the actual code reveals a strong compatibility reason requiring an equivalent implementation.

```text
AUTH
users
sessions
verificationTokens

USER
userProfiles
careerPassports

CAREER
careers
domains
skills

ASSESSMENT
quizzes
quizAttempts
recommendationSnapshots

VOICE
voiceSessions

CONTENT
contentItems
contentRatings
learningProgress

ACTIVITY
bookmarks
notes
savedFilters
recentlyViewed
interactionEvents
notifications
comparisons

COMMUNITY
successStories
feedback

ADMIN
auditLogs
settings
```

Do not add RAG/vector/embedding collections.

No RAG is required.

Do not add another collection unless a visible product feature requires independent persistence.

---

# 6. REQUIRED DATABASE REFACTOR

Complete this before depending on unstable model contracts.

## Merge content

Replace:

```text
multimedia
resources
```

with:

```text
contentItems
```

Use:

```text
kind:
video
podcast
document
article
course
infographic
help_article
```

Preserve required existing information.

Update all references.

---

Replace:

```text
mediaRatings
```

with:

```text
contentRatings
```

---

Merge:

```text
savedSearches
savedFilters
```

into:

```text
savedFilters
```

Suggested shape:

```js
{
  userId,
  name,
  query,
  filters: {
    domainSlugs,
    skillSlugs,
    salaryMin,
    salaryMax,
    demand
  },
  alerts,
  createdAt,
  updatedAt
}
```

---

Replace mutable global:

```text
quizQuestions
```

with versioned:

```text
quizzes
```

Published quiz versions must be immutable.

Each completed `quizAttempt` must retain enough information to explain its historical result.

---

# 7. CORE USER MODELS

## users

Contains identity/security/authorization only.

Required concepts:

```text
name
normalizedEmail
passwordHash
role
stage
status
emailVerified
emailVerifiedAt
lastLoginAt
timestamps
```

Roles may include:

```text
user
content_editor
support_manager
admin
super_admin
```

Stages:

```text
student
graduate
professional
```

One authentication system only.

Do not build a separate Admin authentication database.

---

# 8. userProfiles

This contains facts entered or explicitly supplied by the user.

Examples:

```text
education
skills
interests
experience
location
goals
work preferences
onboarding state
avatar
resume reference
accessibility preferences
notification preferences
```

Skills must use normalized `skillId` values.

Do not treat:

```text
JavaScript
javascript
JS
```

as three independent skills.

---

# 9. skills

Create a normalized skill taxonomy.

Conceptual structure:

```js
{
  slug,
  name,
  category,
  aliases,
  description,
  active
}
```

Career required skills reference these records.

---

# 10. careers

Careers must be structured enough to support:

* filtering,
* recommendation scoring,
* skill gaps,
* readiness,
* comparison,
* Career Simulator,
* Navi explanations.

Each career should support:

```text
slug
title
summary
description
domain
tags

requiredSkills:
  skillId
  importance
  minimumLevel
  category

trait expectations

work-preference expectations

education paths

salary ranges:
  region
  currency
  min
  median
  max
  date/source metadata

demand:
  level
  growthRate
  data date
  source label

daily activities

tools

work environments

generic learning path

status
revision
createdBy
updatedBy
publishedBy
publishedAt
```

Important career records should normally be archived rather than hard-deleted so historical recommendations remain explainable.

---

# 11. CAREER PASSPORT — CENTRAL PRODUCT MODEL

`careerPassports` is a **derived projection**.

One current document per user.

Unique:

```text
userId
```

Recommended conceptual model:

```js
{
  userId,

  version,

  archetype: {
    code,
    label
  },

  traits: {
    analyticalThinking,
    creativity,
    technicalInterest,
    communication,
    leadership,
    independence,
    entrepreneurialDrive
  },

  preferences: {
    teamwork,
    autonomy,
    remoteWork,
    stability,
    incomePriority,
    creativityPriority,
    socialInteraction
  },

  domainScores: [
    {
      domainId,
      score
    }
  ],

  strengths: [
    {
      skillId,
      score,
      evidenceSources: [
        {
          type,
          sourceId
        }
      ]
    }
  ],

  skillGaps: [
    {
      skillId,
      targetCareerId,
      currentLevel,
      requiredLevel,
      gap
    }
  ],

  targetCareerId,

  readiness: {
    score,
    algorithmVersion,
    calculatedAt
  },

  topMatches: [
    {
      careerId,
      score
    }
  ],

  completionPct,

  lastQuizAttemptId,

  calculation: {
    algorithmVersion,
    sources,
    calculatedAt
  },

  timestamps
}
```

Calculated values must have range validation.

The client cannot submit calculated Career Passport scores.

Only `CareerPassportService` can modify derived Passport fields.

---

# 12. CAREER MATCH VS CAREER READINESS

These are separate concepts.

Never conflate them.

## Career Match

Answers:

> How compatible is this career with this person?

A user may have:

```text
AI Product Engineer

Match:
94%
```

---

## Career Readiness

Answers:

> How prepared is this user to enter this career today?

The same user may have:

```text
Readiness:
58%
```

This distinction must be represented consistently in:

* backend,
* MongoDB,
* frontend,
* analytics,
* Navi explanations,
* Career Simulator.

---

# 13. CAREER MATCH ALGORITHM V1

Implement a deterministic, explainable V1.

Unless the existing scoring implementation is already stronger and tested, use:

```text
Quiz / trait alignment      25
Skill alignment             25
Interest alignment          20
Work preferences            15
Goals                        8
Stage / education            5
Behaviour                    2
                           ───
                           100
```

Version:

```text
career-match-v1.0
```

Behavior deliberately has low weight.

Opening a career repeatedly must not radically change suitability.

The result must expose component scores.

Example:

```js
{
  careerId,
  score: 88,

  components: {
    quizSignals: 22,
    skills: 21,
    interests: 18,
    preferences: 13,
    goals: 7,
    stage: 5,
    behaviour: 2
  },

  reasons: [
    "Strong technical-interest alignment",
    "You already satisfy several important skills",
    "Your preferred work style aligns with this career"
  ],

  confidence: 0.9,

  algorithmVersion: "career-match-v1.0"
}
```

Never use an LLM to authoritatively generate the numeric score.

---

# 14. READINESS ALGORITHM V1

Implement separately.

Default weighting:

```text
Required skills        65%
Recommended skills     15%
Relevant experience    10%
Education alignment     5%
Learning progress       5%
```

Version:

```text
readiness-v1.0
```

The calculation should expose enough components for Skill Gap explanations.

---

# 15. recommendationSnapshots

Every meaningful recalculation creates an immutable snapshot.

Do not overwrite historical snapshots.

Recommended shape:

```js
{
  userId,

  trigger: {
    type,
    sourceId
  },

  passport: {
    versionBefore,
    versionAfter,
    readinessBefore,
    readinessAfter
  },

  recommendations: [
    {
      careerId,
      score,

      components: {
        quizSignals,
        skills,
        interests,
        preferences,
        goals,
        stage,
        behaviour
      },

      reasons,
      confidence
    }
  ],

  rankedContent: [
    {
      itemId,
      kind,
      score,
      reasons
    }
  ],

  algorithmVersion,
  generatedAt
}
```

This provides:

* history,
* explainability,
* judge-friendly evidence,
* before/after comparison.

---

# 16. QUIZ SYSTEM

Use:

```text
quizzes
quizAttempts
```

A quiz must have:

```text
key
version
status
questions
scoring configuration
timestamps
```

Supported question types should include those required by the SRS/current UI:

```text
single_choice
multiple_choice
slider
likert
scenario
```

Published quiz versions are immutable.

Changing a published quiz creates a new version.

---

## quizAttempts

Persist:

```text
userId
quizId
quizVersion
status
answers
question snapshots where required
currentPosition
timing metadata
signal scores
archetype
domain scores
top career IDs
explain reasons
scoringVersion
startedAt
completedAt
```

The frontend sends answers.

The server calculates scores/signals.

Never trust React-supplied scoring values.

Completion must be idempotent.

Attempt history must remain available.

---

# 17. CAREER PASSPORT RECALCULATION TRIGGERS

Recalculate only after meaningful approved changes such as:

```text
quiz completed
profile interests changed
profile skills changed
target career changed
approved Navi insight
learning progress materially affects readiness
manual admin/development recalculation when appropriate
```

Avoid recalculating the entire system for every trivial event.

---

# 18. CAREER SIMULATOR — FLAGSHIP FEATURE

Implement Career Simulator as a **stateless calculation**.

No new MongoDB collection.

Example interaction:

```text
"What if I learn Python from level 4 to level 8?"
```

Request contains hypothetical modifications.

Backend:

1. loads canonical current state,
2. clones state in memory,
3. applies hypothetical changes,
4. recalculates match/readiness,
5. returns before/after results,
6. persists nothing.

Example response:

```js
{
  before: {
    careerId,
    match: 82,
    readiness: 61
  },

  after: {
    match: 88,
    readiness: 72
  },

  changes: {
    match: 6,
    readiness: 11
  },

  affectedCareers: [...]
}
```

Never mutate:

```text
userProfiles
careerPassports
quizAttempts
recommendationSnapshots
```

from simulation.

The frontend should make the before/after result visually memorable using smooth motion.

---

# 19. SKILL GAP EXPERIENCE

For a selected target career calculate:

```text
current skill level
required skill level
gap
importance
impact on readiness
```

Show:

* strongest existing skills,
* largest gaps,
* critical gaps,
* recommended skills,
* resulting readiness score.

Use actual normalized skill records.

Do not generate fake gap percentages in React.

---

# 20. NAVI — PRODUCT ROLE

Navi is PathSeeker's guide.

Navi should:

* guide onboarding,
* explain Career Passport results,
* answer profile-aware questions,
* conduct career discovery conversations,
* propose structured user insights,
* explain skill gaps,
* explain recommendations.

Navi must not:

* directly modify career scores,
* directly modify readiness,
* directly edit Passport traits,
* become the source of truth.

---

# 21. voiceSessions

Persist real Navi session state.

Recommended shape:

```js
{
  userId,

  provider,
  providerSessionId,

  purpose,

  status,

  startedAt,
  endedAt,
  durationSeconds,

  summary,

  transcript?, // optional, only if genuinely needed

  extractedInsights: [
    {
      key,
      value,
      confidence,
      approved,
      approvedAt,
      appliedAt
    }
  ],

  processingStatus,

  timestamps
}
```

Raw transcripts are optional.

Do not require storing unnecessary sensitive raw conversation content.

---

# 22. NAVI INSIGHT PIPELINE

The correct flow is:

```text
Conversation
   ↓
Navi extracts candidate insight
   ↓
server validates schema/confidence
   ↓
user sees insight if approval UX exists
   ↓
insight approved
   ↓
approved evidence enters Passport input pipeline
   ↓
CareerPassportService recalculates
   ↓
RecommendationService recalculates
   ↓
Career Passport updated
   ↓
RecommendationSnapshot appended
```

Never:

```text
Navi
→ careerPassports.update()
```

directly.

---

# 23. VOICE PROVIDER ARCHITECTURE

Use a provider adapter.

Examples may include:

* Vapi
* Retell
* Twilio-compatible architecture
* another existing provider

The business layer must not depend directly on provider-specific payloads.

Normalize provider events before passing them to business services.

If n8n exists, it may be used for:

* asynchronous follow-up,
* email,
* analytics,
* post-session automation.

n8n must not own:

* canonical user state,
* Career Passport calculations,
* recommendation calculations,
* authorization,
* session ownership.

MongoDB + Express remain authoritative.

---

# 24. LOCAL NAVI FALLBACK

If no paid/external provider is configured:

provide a functional fallback.

At minimum:

```text
text Navi chat
→ same backend session model
→ same candidate insight extraction interface
→ same approval pipeline
```

Do not leave the entire Navi UI broken because an external API key is unavailable.

External services must use environment-based adapters.

Never commit secrets.

---

# 25. interactionEvents

Create a meaningful append-only event stream.

Use explicit names such as:

```text
career_viewed
career_bookmarked
career_unbookmarked
career_compared

search_performed

quiz_started
quiz_completed

recommendation_opened

content_viewed
content_started
content_completed
content_downloaded
content_rated

voice_session_started
voice_session_completed
```

Do not log meaningless UI clicks.

For the competition environment, do not automatically TTL these away.

They support:

* trending careers,
* admin analytics,
* recommendation behavior signals,
* demo evidence.

---

# 26. CONTENT MODEL

Unify resource/media functionality under:

```text
contentItems
```

Content kinds:

```text
video
podcast
document
article
course
infographic
help_article
```

Shared fields should cover:

```text
slug
title
description
kind
target audience
tags
related careers
related skills
asset metadata
thumbnail
transcript/text when relevant
duration/page count
status
view count
download count
publication metadata
```

Never store uploaded binary files directly in MongoDB.

Use a storage abstraction.

---

# 27. contentRatings

Unique:

```text
userId + contentId
```

Support create/update rating.

Display live aggregate rating.

---

# 28. learningProgress

Track real learning progress.

Conceptually:

```text
userId
contentId
kind
status
progressPct
lastPositionSeconds
startedAt
completedAt
updatedAt
```

Unique:

```text
userId + contentId
```

Use this for:

* Continue Learning,
* profile statistics,
* small readiness input,
* dashboard progress.

---

# 29. ACTIVITY FEATURES

Fully persist:

```text
bookmarks
notes
savedFilters
recentlyViewed
comparisons
notifications
```

Notes support multiple notes per target.

Bookmarks must enforce uniqueness.

Recently viewed should maintain sensible deduplication.

Saved filters must persist actual search/filter state.

Comparisons should only remain persistent if the current UI supports saved comparison state.

---

# 30. AUTHENTICATION AND SECURITY

Use the repository's established server-side session approach.

Prefer:

```text
opaque session
secure cookie
```

Do not introduce authentication tokens in `localStorage`.

Implement/test:

* registration,
* normalized unique email,
* password hashing,
* email verification,
* verification expiry,
* resend cooldown,
* login,
* `/auth/me`,
* logout,
* forgotten password,
* reset password,
* previous session revocation,
* suspension,
* deleted users,
* role authorization,
* record ownership.

Store hashes, never raw reset/session tokens.

---

# 31. COOKIE SECURITY

Correctly configure:

```text
HttpOnly
Secure in production
SameSite appropriate to deployment
expiration
domain/path where required
```

Test cookies through the actual browser.

Implement a clear CSRF strategy for cookie-authenticated mutations.

---

# 32. API RESPONSE CONTRACT

Standardize API responses.

Success:

```json
{
  "data": {},
  "meta": {},
  "message": "Optional success message"
}
```

Failure:

```json
{
  "message": "Safe human-readable message",
  "code": "STABLE_ERROR_CODE",
  "details": {},
  "requestId": "correlation-id"
}
```

Do not leak:

* stack traces,
* password hashes,
* tokens,
* secrets,
* internal exception details.

---

# 33. CORE API SURFACE

Adapt names to existing conventions where necessary, but the application should expose equivalent functionality.

## Auth

```text
POST /api/auth/register
POST /api/auth/verify
POST /api/auth/resend-verification
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

---

## Profile

```text
GET   /api/users/me/profile
PATCH /api/users/me/profile

GET   /api/users/me/passport
GET   /api/users/me/recommendations
```

Passport writes are service-driven, not client-driven.

---

## Careers

```text
GET /api/careers
GET /api/careers/:slug
GET /api/careers/suggestions

POST /api/careers/simulate
POST /api/careers/compare
```

---

## Quiz

```text
GET   /api/quizzes/active
POST  /api/quiz-attempts
GET   /api/quiz-attempts/:id
PATCH /api/quiz-attempts/:id
POST  /api/quiz-attempts/:id/complete
GET   /api/users/me/quiz-attempts
```

---

## Navi

```text
POST /api/navi/sessions
GET  /api/navi/sessions
GET  /api/navi/sessions/:id
POST /api/navi/sessions/:id/messages
POST /api/navi/sessions/:id/approve-insights
POST /api/navi/sessions/:id/end
```

If using provider callbacks:

```text
POST /api/webhooks/voice/:provider
```

Authenticate webhooks appropriately.

---

## Content

```text
GET /api/content
GET /api/content/:slug

PUT/PATCH rating
PUT/PATCH learning progress
```

---

## Activity

Provide appropriate REST endpoints for:

```text
bookmarks
notes
saved filters
recent views
comparisons
notifications
```

---

## Community

Provide endpoints for:

```text
success stories
feedback
```

---

## Admin

Protected endpoints for:

```text
users
careers
content
quizzes
stories
feedback
settings
audit logs
analytics
```

---

# 34. PHASE 0 — REPOSITORY HEALTH

Before large changes:

* inspect git state,
* protect uncommitted user work,
* understand project scripts,
* verify environment handling,
* verify frontend/backend startup,
* verify MongoDB connection,
* verify seed behavior.

Required health checks:

```text
GET /api/health
GET /api/health/db
```

Both must work.

Fix stale READMEs.

Document actual local startup.

Do not begin feature work while basic runtime is broken.

---

# 35. PHASE 1 — DATABASE FINALIZATION

Complete canonical collection refactoring.

Update:

* models,
* references,
* seed scripts,
* indexes,
* model exports,
* test factories,
* integration tests.

Run migration or safe reset/reseed for development.

Verify no stale references remain to:

```text
Multimedia
Resource
MediaRating
QuizQuestion
SavedSearch
```

where they have been superseded.

---

# 36. DATABASE INDEX REQUIREMENTS

At minimum verify appropriate indexes for:

```text
unique normalized user email
unique career slug
career status/domain
career skills
career tags
career demand

unique quiz key/version

quizAttempt user/date

unique careerPassport userId

recommendationSnapshot user/date

voiceSession user/date
voice providerSessionId when present

unique bookmark user/target

unique contentRating user/content

unique learningProgress user/content

recentlyViewed user/date

interactionEvent user/date
interactionEvent event/date

notifications user/read/date

success story status/date

feedback status/date

audit entity/date

TTL:
sessions
verification tokens
other genuinely temporary records only
```

Actually verify indexes against MongoDB.

---

# 37. PHASE 2 — AUTH + PROFILE + ONBOARDING

Complete end to end.

Browser journeys:

```text
Student registration
Graduate registration
Professional registration

email verification

login
session restoration
logout

forgot password
reset password

profile creation
profile editing
onboarding resume/recovery
```

Profile fields must come from the server after persistence.

No local-only success states.

---

# 38. PHASE 3 — CAREER BANK

Career Explorer must support:

* published careers,
* text search,
* autocomplete,
* typo-friendly suggestions where practical,
* domain,
* multiple skills,
* salary,
* demand,
* sorting,
* pagination,
* result counts,
* saved filters,
* URL-synchronized filtering if already part of UI.

Opening a career must update:

```text
recentlyViewed
interactionEvents
```

Career detail must show live structured data.

---

# 39. PHASE 4 — ASSESSMENT + PASSPORT + RECOMMENDATIONS

This is the first major flagship milestone.

Complete:

```text
active quiz loading
attempt creation
answer persistence
refresh/resume
timers
question types
completion
historical attempts
deterministic scoring
Career Passport generation
recommendation snapshot generation
real result UI
```

The Career Passport reveal should feel like a major product moment.

Use real values.

No fake percentages.

---

# 40. PHASE 5 — FLAGSHIP CAREER INTELLIGENCE

Complete:

## Explainable Matching

Show:

```text
overall match
component scores
reason strings
confidence where appropriate
```

---

## Skill Gap

Show:

```text
current
required
difference
importance
readiness impact
```

---

## Career Simulator

Smooth before/after interaction using stateless backend simulation.

---

## Career comparison

Use real records.

---

## Career Galaxy

If current architecture makes this feasible without delaying mandatory completion:

create an elegant interactive career relationship visualization using live:

```text
domains
skills
match scores
related careers
```

It should support click/tap navigation and not be visual-only decoration.

Do not create an entire graph database.

---

# 41. PHASE 6 — NAVI

Complete text fallback first so business behavior can always be tested.

Then connect the real voice-provider adapter if configured.

Navi should understand the user's:

```text
profile
Career Passport
top matches
target career
skill gaps
recent quiz result
```

without RAG.

Structured application data is sufficient.

After Navi discovers a candidate preference:

```text
display insight
→ approve
→ validated backend pipeline
→ recalculate passport
→ create recommendation snapshot
→ update UI
```

This should become one of the strongest live-demo moments.

---

# 42. PHASE 7 — DASHBOARD

Every visible number must be real.

Provide:

* greeting,
* profile/passport completion,
* current target career,
* Career Match,
* Career Readiness,
* latest quiz result,
* top picks,
* recent activity,
* bookmarks,
* continue learning,
* trending careers,
* recommended content,
* notifications,
* Navi context.

No hard-coded dashboard metrics.

Handle new users with empty state gracefully.

---

# 43. PHASE 8 — CONTENT + LEARNING

Complete unified content library.

For each kind implement suitable behavior:

```text
video
podcast
document
article
course
infographic
```

Support:

* list/detail,
* filters,
* text search,
* ratings,
* related items,
* authorized download/asset access,
* view/download tracking,
* transcript where applicable,
* learning progress.

Admin must be able to manage it.

---

# 44. PHASE 9 — BOOKMARKS, NOTES, SAVED FILTERS, HISTORY

Implement actual persistence for:

* bookmarks,
* multiple notes,
* recent views,
* saved filters,
* comparisons,
* notifications.

Implement required bookmark/note export if retained by the SRS/UI.

Never include private note content in public share URLs.

---

# 45. PHASE 10 — SUCCESS STORIES + FEEDBACK

Success stories:

```text
submit
review
approve/reject
publish
filter
view
```

Feedback:

```text
submit
categorize
status
admin response
user notification
analytics
```

If sentiment analysis is included, provide deterministic/local fallback.

---

# 46. PHASE 11 — ADMIN

Every admin surface must use live protected backend data.

Complete:

## Overview

Real metrics only.

## Users

```text
list
search
filter
pagination
detail
role management
status management
safe suspension/reactivation
```

## Careers

```text
create
edit
publish
archive
validate
```

## Content

```text
create
edit
upload
publish
archive
replace asset
```

## Quiz

```text
draft version
questions
ordering
scoring
validation
publish
new version
```

Never mutate historical published quiz versions.

## Stories

Review workflow.

## Feedback

Inbox/respond/status/analytics.

## Settings

Only real settings.

## Audit

Authorized audit log viewing.

No ordinary user can access admin data.

---

# 47. FILE STORAGE

Implement an abstraction.

Development:

```text
local storage adapter
```

Production:

```text
external object-storage adapter interface
```

Validate:

* MIME,
* extension,
* file signature where practical,
* maximum size,
* authorization,
* safe name,
* path traversal,
* replacement,
* deletion.

Do not store file blobs in MongoDB.

---

# 48. UI DESIGN DIRECTION

Preserve the application's existing strong design.

Do not replace the frontend with a generic admin template.

The product should feel:

```text
soft
calm
approachable
premium
easy to navigate
student-friendly without looking childish
```

Avoid:

```text
cyberpunk
neon
glowing UI
heavy purple AI gradients
glassmorphism everywhere
gaming dashboards
excessive gamification
```

Preferred direction:

```text
warm off-white / cream surfaces
soft muted sage
dusty blue
charcoal typography
subtle borders
controlled shadows
generous whitespace
rounded but not childish surfaces
```

Typography should remain consistent with the current visual system; if unfinished, prefer a clean modern sans such as:

```text
DM Sans
Plus Jakarta Sans
```

Navi should feel like a friendly guide, not a robot HUD.

---

# 49. MOTION

Use motion as interaction feedback, not decoration.

Prefer:

```text
180–280ms
buttons / small states

300–500ms
cards / sections

500–700ms
major reveal moments
```

Use low-bounce motion.

Respect:

```text
prefers-reduced-motion
```

The major Career Passport reveal, score recalculation, and Navi insight application may receive stronger but restrained animation.

Nothing should feel flashy for its own sake.

---

# 50. ACCESSIBILITY

Complete the SRS accessibility requirements properly.

Implement:

* light/dark/system if retained,
* font-size preference,
* reduced motion,
* accessible breadcrumbs,
* visible focus,
* keyboard navigation,
* semantic headings,
* labels,
* error descriptions,
* dialogs,
* tables,
* live regions,
* accessible loading indicators,
* Escape behavior,
* focus trapping/restoration,
* touch targets,
* responsive zoom.

Test critical flows keyboard-only.

---

# 51. RESPONSIVENESS

Test at least:

```text
small mobile
large mobile
tablet
laptop
desktop
```

Fix:

* horizontal overflow,
* clipped dialogs,
* forms,
* charts,
* tables,
* cards,
* touch targets,
* navigation.

The flagship experiences must remain usable on mobile.

---

# 52. PERFORMANCE

Do not prematurely introduce Redis or distributed infrastructure.

First:

* index MongoDB properly,
* paginate,
* avoid N+1 patterns,
* avoid unbounded queries,
* avoid huge populate chains,
* lazy-load heavy frontend routes,
* cancel stale search requests,
* debounce search,
* optimize large images/media,
* use reasonable caching via React Query.

Set a realistic frontend performance budget.

Measure rather than guess.

---

# 53. SECURITY

Test:

* password hashing,
* token hashing,
* token expiry,
* reset replay prevention,
* session revocation,
* ownership,
* RBAC,
* CSRF,
* CORS,
* input validation,
* ObjectId validation,
* query injection,
* rate limits,
* file safety,
* sensitive log redaction,
* webhook authentication,
* secret handling.

Run dependency audits.

Do not weaken validation to make tests pass.

---

# 54. TESTING STRATEGY

Testing is part of implementation.

## Backend unit tests

Cover:

* scoring,
* Career Passport calculations,
* readiness,
* recommendation engine,
* Career Simulator,
* validation,
* permissions,
* analytics,
* important services.

---

## API integration tests

Use disposable test MongoDB.

Cover:

```text
public
authenticated user
staff
admin
super-admin
ownership denial
role denial
validation
duplicates
not-found
invalid IDs
pagination
database failures
idempotency
```

Test actual persistence.

---

## Frontend tests

Cover:

* forms,
* API contracts,
* React Query states,
* loading,
* empty,
* failure,
* retry,
* filters,
* quiz,
* timers,
* permission UI,
* Navi insight approval,
* Simulator states,
* accessibility.

Production pages cannot import fixture data.

---

# 55. REQUIRED PLAYWRIGHT JOURNEYS

At minimum automate and verify:

### Journey 1

```text
Student register
→ verify
→ onboarding
→ quiz
→ Passport
→ recommendations
→ career detail
→ bookmark
→ note
→ logout
→ login
→ persisted state
```

### Journey 2

Graduate registration and personalized exploration.

### Journey 3

Professional registration with work experience.

### Journey 4

Forgot password → reset → old session invalidated.

### Journey 5

Career search → filters → autocomplete → save filter → detail → recent view → comparison.

### Journey 6

Career Passport → Skill Gap → Career Simulator.

### Journey 7

Navi text/voice session → extracted insight → approval → Passport recalculation → recommendation change.

### Journey 8

Content playback/read/download → rating → progress persists.

### Journey 9

Story submission → admin approval → public visibility.

### Journey 10

Feedback → staff/admin response → user notification.

### Journey 11

Admin career/content/quiz CRUD.

### Journey 12

Unauthorized user denied protected staff/admin actions.

### Journey 13

Mobile critical flow.

### Journey 14

Keyboard-only critical flow.

### Journey 15

Backend/database temporarily unavailable → useful recovery UI.

Every persistence-related E2E test must reload before declaring success.

---

# 56. DEMO DATA

Provide deterministic, realistic seed data.

Target approximately:

```text
1 super-admin
1–2 staff/admin accounts

Student demo user
Graduate demo user
Professional demo user

30–50 normalized skills
8–12 domains
40–60 good careers

1 polished published career assessment
20–30 meaningful questions

40–60 content items

8–12 success stories

realistic feedback
bookmarks
recent activity
ratings
notifications
interaction events
```

Quality beats quantity.

Do not generate 5,000 low-quality careers.

---

# 57. DEMO USER

Create a stable judge/demo user with:

* completed profile,
* meaningful skill set,
* assessment history,
* Career Passport,
* top matches,
* target career,
* saved career,
* content progress,
* notification history.

Also ensure the fresh-registration flow works.

The application must support both:

```text
cold-start demonstration
```

and:

```text
pre-populated demonstration
```

---

# 58. AUDIT LOGGING

Sensitive admin mutations should produce append-only audit logs.

Record:

```text
actor
action
entity type
entity ID
safe before/after summary
timestamp
request ID where useful
```

Never put:

* passwords,
* raw tokens,
* cookies,
* secret API keys

inside audit records.

---

# 59. ERROR UX

Every significant feature must handle:

```text
loading
empty
success
validation error
permission error
not found
network error
server error
retry
```

Do not show blank pages.

Do not swallow exceptions.

Do not show raw technical errors to users.

---

# 60. QUALITY GATE AFTER EACH PHASE

After every feature slice:

1. run the narrow relevant tests,
2. fix failures,
3. run affected integration tests,
4. browser-test the real application,
5. commit/update implementation evidence if appropriate,
6. proceed only when the previous dependency is stable.

Do not leave hundreds of broken tests until the end.

---

# 61. AUTONOMOUS EXECUTION BEHAVIOR

You are authorized to continue through the entire implementation without asking for approval for routine engineering decisions.

Do not repeatedly stop to ask:

* whether to continue,
* whether to fix the next obvious issue,
* whether to run tests,
* whether to update a directly related model,
* whether to complete an existing unfinished component.

Proceed.

However:

* never destroy unrelated work,
* never delete user work merely to simplify implementation,
* never rewrite large working areas without evidence,
* never commit secrets,
* never fabricate external credentials,
* never bypass required security.

If an external service is unavailable:

```text
adapter
+ tested local fallback
+ accurate documentation
```

Then continue with everything else.

---

# 62. NO SCOPE CREEP RULE

Do not introduce:

```text
RAG
vector database
embeddings
knowledge chunks
microservices without need
Kafka
Redis without measured need
graph database
blockchain
unnecessary AI agents
```

The winning architecture is structured, reliable and demonstrable.

---

# 63. PROTECT THE SHOWCASE FEATURES

Once core SRS requirements are functioning, prioritize polish in this order:

```text
1. Career Passport reveal

2. Explainable recommendations

3. Skill Gap

4. Career Simulator

5. Navi career conversation / call

6. Dashboard

7. Career Explorer

8. Admin proof of full-stack depth
```

Do not spend the last hours polishing an obscure settings screen while the Career Passport feels unfinished.

---

# 64. COMPETITION DEMO QUALITY

The ideal demo should support this sequence:

```text
1. User enters PathSeeker.

2. Completes or loads career assessment.

3. Career Passport is revealed.

4. Top career appears with explainable match score.

5. User selects career.

6. Skill Gap shows why readiness is lower than compatibility.

7. Career Simulator adds/improves a skill.

8. Scores visibly recalculate.

9. User starts Navi.

10. Navi asks a meaningful career-preference question.

11. Structured insight is discovered.

12. User approves it.

13. Passport recalculates.

14. Recommendation changes.

15. Switch to Admin.

16. Show real users, career management, quiz/content management and analytics.
```

This sequence should feel seamless.

---

# 65. DOCUMENTATION

Produce/update accurate documentation.

Required:

* real root README,
* installation instructions,
* environment setup,
* database setup,
* seeding,
* development commands,
* production build/start,
* architecture,
* data model,
* indexes,
* scoring algorithms,
* user flows,
* admin flows,
* test strategy,
* test data,
* evaluator credentials,
* known limitations.

Documentation must match reality.

Do not claim:

```text
production ready
fully secure
fully tested
100% complete
```

unless evidence supports it.

---

# 66. DATABASE DIAGRAM

Produce a clear diagram/reference for:

```text
users
→ userProfiles
→ careerPassports

users
→ quizAttempts
→ quizzes

careerPassports
→ careers
→ domains
→ skills

recommendationSnapshots
→ careers

voiceSessions
→ approved insights
→ Passport recalculation

careers/content
→ bookmarks
→ notes

content
→ ratings
→ learningProgress

users
→ interactionEvents
→ analytics

admin
→ auditLogs
```

---

# 67. SRS TRACEABILITY

Maintain a traceability matrix:

```text
SRS requirement
→ implementation
→ API
→ model
→ frontend screen
→ automated test
→ browser evidence
→ status
```

A feature is not complete merely because a similarly named file exists.

---

# 68. SUBMISSION REQUIREMENTS

Ensure final project artifacts include what the SRS requires.

Prepare:

* database/schema artifact,
* test data documentation,
* installation instructions,
* evaluator credentials,
* complete project report,
* ReadMe/assumptions artifact where required,
* sitemap,
* hosted URL if feasible,
* mandatory feature demonstration video plan/evidence.

Remove stale placeholders.

Remove default Vite/project boilerplate.

Remove false claims.

---

# 69. FINAL QUALITY GATES

Backend:

```powershell
npm.cmd test
npm.cmd start
```

Verify:

```text
/api/health
/api/health/db
```

Frontend:

```powershell
npm.cmd test -- --run
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
```

Also run all security/accessibility/performance checks introduced by the project.

If the repository uses different scripts, use the canonical existing equivalents and update documentation.

---

# 70. DEFINITION OF DONE

The application is complete only when:

* all mandatory SRS functionality is implemented,
* real data persists in MongoDB,
* frontend fixtures no longer masquerade as production data,
* authentication survives reload,
* roles and ownership are enforced,
* quiz results are reproducible,
* Career Passport is real derived state,
* recommendations are deterministic and explainable,
* Career Match and Readiness are separate,
* Skill Gap is based on normalized skills,
* Career Simulator works without persisting hypothetical state,
* Navi cannot directly mutate calculated state,
* Navi fallback works without external voice credentials,
* content/activity/community features persist,
* admin is fully connected,
* mobile works,
* accessibility is implemented,
* production build succeeds,
* tests pass,
* real browser flows pass,
* documentation matches implementation,
* no mandatory requirement is falsely marked complete.

---

# 71. FINAL REPORT FORMAT

When implementation is truly finished, return a concise engineering completion report containing:

## A. Overall status

```text
COMPLETE
```

or

```text
NOT COMPLETE
```

Do not use COMPLETE if a mandatory requirement remains.

## B. SRS completion

Group requirements by SRS section and report:

```text
DONE
PARTIAL
BLOCKED
```

with evidence.

## C. Competition differentiators

Report implementation status for:

```text
Career Passport
Explainable Recommendations
Skill Gap
Career Simulator
Navi
Career Galaxy if implemented
```

## D. Database

Report:

* final collection list,
* migrations,
* important indexes,
* seed counts,
* algorithm versions.

## E. Backend

Report route groups and major services completed.

## F. Frontend

Report real integrated screens completed.

## G. Tests

Report exact:

```text
passed
failed
skipped
```

counts for:

* backend,
* frontend,
* integration,
* E2E,
* accessibility,
* security,
* build/lint.

## H. Browser journeys

List the actual user/admin journeys tested.

## I. Remaining issues

List every genuine unresolved item.

Never hide one to make the project appear complete.

---

# 72. FINAL ENGINEERING STANDARD

Do not optimize for:

```text
number of files
number of endpoints
number of features
amount of generated code
```

Optimize for:

```text
correctness
integration
persistence
clarity
explainability
smooth UX
reliability
demo quality
SRS compliance
```

The final product should not feel like:

> a collection of student-project CRUD pages with an AI button.

It should feel like:

> a coherent career intelligence system that understands the user, builds a Career Passport, explains where they fit, shows what they lack, lets them simulate improvement, and gives them a personal Navi guide — backed by a complete real MERN application.

Begin now.

Start by inspecting the complete repository and git state.

Protect existing work.

Establish the real current implementation status.

Then execute the phases above in dependency order.

Do not stop at planning.

Do not fabricate completion.

Keep going until the application is as complete, polished, tested, and competition-ready as the available repository and environment permit.
