# Graph Report - .  (2026-08-26)

## Corpus Check
- Corpus is ~20,934 words - fits in a single context window. You may not need a graph.

## Summary
- 469 nodes · 966 edges · 24 communities (20 shown, 4 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Application Services
- Profiles and Search
- Database and Seeds
- Auth and Admin Controllers
- Admin Content Operations
- Authorization and Routes
- Runtime Dependencies
- Server Configuration
- Catalog Controllers
- Bookmarks and History
- Domain Constants
- User Content Models
- Profiles and Stories
- Career Model
- Settings Service
- Quiz Questions
- Quiz Attempts
- Resources and Stages
- Saved Searches
- Deferred Career Passport
- Ownership Contract
- Schema Test Scope

## God Nodes (most connected - your core abstractions)
1. `AppError` - 24 edges
2. `isNonEmptyString()` - 24 edges
3. `buildPaginationMeta()` - 21 edges
4. `parsePagination()` - 20 edges
5. `logAction()` - 18 edges
6. `asyncHandler()` - 17 edges
7. `requireAuth` - 13 edges
8. `env` - 10 edges
9. `User` - 9 edges
10. `Career` - 8 edges

## Surprising Connections (you probably didn't know these)
- `getCareers` --calls--> `parsePagination()`  [EXTRACTED]
  src/controllers/catalog.controller.js → src/utils/pagination.js
- `getNotifications` --calls--> `parsePagination()`  [EXTRACTED]
  src/controllers/notification.controller.js → src/utils/pagination.js
- `getRecentlyViewed` --calls--> `parsePagination()`  [EXTRACTED]
  src/controllers/personalization.controller.js → src/utils/pagination.js
- `updateAsset` --calls--> `isNonEmptyString()`  [EXTRACTED]
  src/controllers/profile.controller.js → src/utils/validators.js
- `answerQuestion` --calls--> `isNonEmptyString()`  [EXTRACTED]
  src/controllers/quiz.controller.js → src/utils/validators.js

## Import Cycles
- None detected.

## Communities (24 total, 4 thin omitted)

### Community 0 - "Application Services"
Cohesion: 0.06
Nodes (42): AuditLog, auditLogSchema, MediaRating, mediaRatingSchema, approveStory(), createCareer(), createMedia(), createQuizQuestion() (+34 more)

### Community 1 - "Profiles and Search"
Cohesion: 0.06
Nodes (26): ONBOARDING_STATUSES, createSavedSearch, deleteSavedSearch, getCareerBySlug, listCareers, listSavedSearches, searchCareerSuggestions, SORT_OPTIONS (+18 more)

### Community 2 - "Database and Seeds"
Cohesion: 0.10
Nodes (29): connectDatabase(), DEFAULT_OPTIONS, disconnectDatabase(), careersSeed, domainsSeed, skillsSeed, careerIds, domainIds (+21 more)

### Community 3 - "Auth and Admin Controllers"
Cohesion: 0.08
Nodes (39): createCareer, createMedia, createQuizQuestion, createResource, respondToFeedback, adminLogin, forgotPassword, issueSessionCookie() (+31 more)

### Community 4 - "Admin Content Operations"
Cohesion: 0.07
Nodes (37): MULTIMEDIA_TYPES, RESOURCE_TYPES, STORY_STATUSES, approveStory, deleteCareer, deleteMedia, deleteQuizQuestion, deleteResource (+29 more)

### Community 5 - "Authorization and Routes"
Cohesion: 0.13
Nodes (17): USER_MANAGEMENT_ROLES, requireAuth, requireRole(), authRateLimiter, router, router, router, router (+9 more)

### Community 6 - "Runtime Dependencies"
Cohesion: 0.06
Nodes (30): bcryptjs, cookie-parser, cors, dotenv, express, express-rate-limit, helmet, mongoose (+22 more)

### Community 7 - "Server Configuration"
Cohesion: 0.12
Nodes (18): createApp(), env, requireAuth, errorHandler(), notFoundHandler(), router, forgotPassword(), issueEmailVerificationOtp() (+10 more)

### Community 8 - "Catalog Controllers"
Cohesion: 0.09
Nodes (20): getCareerBySlug, getCareers, getDomains, getSkills, listDomains, getNotifications, markAllRead, markRead (+12 more)

### Community 9 - "Bookmarks and History"
Cohesion: 0.13
Nodes (7): SAVABLE_ITEM_TYPES, Bookmark, bookmarkSchema, ITEM_TYPE_TO_MODEL, RecentlyViewed, recentlyViewedSchema, listRecentlyViewed()

### Community 10 - "Domain Constants"
Cohesion: 0.16
Nodes (13): EMAIL_PATTERN, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, QUIZ_TRAITS, SKILL_CATEGORIES, STAFF_ROLES, TOKEN_PURPOSES, USER_ROLES (+5 more)

### Community 11 - "User Content Models"
Cohesion: 0.16
Nodes (6): NOTIFICATION_TYPES, Comparison, comparisonSchema, Feedback, Notification, notificationSchema

### Community 12 - "Profiles and Stories"
Cohesion: 0.20
Nodes (9): PROFILE_SKILL_SOURCES, REMOTE_PREFERENCES, SuccessStory, successStorySchema, educationSchema, experienceSchema, profileSkillSchema, userProfileSchema (+1 more)

### Community 13 - "Career Model"
Cohesion: 0.20
Nodes (8): CAREER_DEMAND_LEVELS, SKILL_IMPORTANCE_LEVELS, Career, careerSchema, requiredSkillSchema, salarySchema, SavedFilter, savedFilterSchema

### Community 14 - "Settings Service"
Cohesion: 0.33
Nodes (5): Settings, settingsSchema, getSettings(), SINGLETON_FILTER, updateSettings()

### Community 15 - "Quiz Questions"
Cohesion: 0.33
Nodes (5): QUIZ_QUESTION_TYPES, domainWeightSchema, quizOptionSchema, QuizQuestion, quizQuestionSchema

### Community 16 - "Quiz Attempts"
Cohesion: 0.40
Nodes (4): QUIZ_ATTEMPT_STATUSES, quizAnswerSchema, QuizAttempt, quizAttemptSchema

### Community 17 - "Resources and Stages"
Cohesion: 0.50
Nodes (3): USER_STAGES, Resource, resourceSchema

## Knowledge Gaps
- **110 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `Profiles and Search` to `Application Services`, `Auth and Admin Controllers`, `Admin Content Operations`, `Authorization and Routes`, `Server Configuration`, `Catalog Controllers`, `Bookmarks and History`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `asyncHandler()` connect `Catalog Controllers` to `Profiles and Search`, `Auth and Admin Controllers`, `Admin Content Operations`, `Authorization and Routes`, `Server Configuration`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `isNonEmptyString()` connect `Auth and Admin Controllers` to `Catalog Controllers`, `Profiles and Search`, `Admin Content Operations`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application Services` be split into smaller, more focused modules?**
  _Cohesion score 0.05952380952380952 - nodes in this community are weakly interconnected._
- **Should `Profiles and Search` be split into smaller, more focused modules?**
  _Cohesion score 0.0596078431372549 - nodes in this community are weakly interconnected._
- **Should `Database and Seeds` be split into smaller, more focused modules?**
  _Cohesion score 0.09830866807610994 - nodes in this community are weakly interconnected._