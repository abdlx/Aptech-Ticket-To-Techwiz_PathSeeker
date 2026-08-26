# Graph Report - Project  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 759 nodes · 1681 edges · 36 communities (34 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `374aed3b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon.jsx
- routes/index.js
- RouterApp.jsx
- admin.service.js
- devDependencies
- dependencies
- dependencies
- run.js
- admin.controller.js
- compare-careers.jsx
- personalization.service.js
- auth.controller.js
- AppError
- models/index.js
- personalization.controller.js
- constants/database.js
- asyncHandler.js
- document-preview.jsx
- UserProfile.js
- ConnectedAuthPage.jsx
- models.milestone2.test.js
- quiz.service.js
- App.jsx
- Career.js
- content.controller.js
- pages/index.js
- quiz.controller.js
- QuizQuestion.js
- catalog.controller.js
- SavedSearch.js
- help-center.jsx

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 56 edges
2. `isNonEmptyString()` - 23 edges
3. `buildPaginationMeta()` - 21 edges
4. `parsePagination()` - 20 edges
5. `AppError` - 19 edges
6. `logAction()` - 18 edges
7. `asyncHandler()` - 14 edges
8. `useAuth()` - 14 edges
9. `requireAuth` - 13 edges
10. `env` - 10 edges

## Surprising Connections (you probably didn't know these)
- `getCareers` --calls--> `parsePagination()`  [EXTRACTED]
  backend/src/controllers/catalog.controller.js → backend/src/utils/pagination.js
- `getResources` --calls--> `parsePagination()`  [EXTRACTED]
  backend/src/controllers/content.controller.js → backend/src/utils/pagination.js
- `getMedia` --calls--> `parsePagination()`  [EXTRACTED]
  backend/src/controllers/content.controller.js → backend/src/utils/pagination.js
- `getStories` --calls--> `parsePagination()`  [EXTRACTED]
  backend/src/controllers/content.controller.js → backend/src/utils/pagination.js
- `submitStory` --calls--> `isNonEmptyString()`  [EXTRACTED]
  backend/src/controllers/content.controller.js → backend/src/utils/validators.js

## Import Cycles
- None detected.

## Communities (36 total, 2 thin omitted)

### Community 0 - "Icon.jsx"
Cohesion: 0.06
Nodes (47): Head(), Field(), AdminTable(), PageHead(), Status(), UserCell(), Brand(), AuthFrame() (+39 more)

### Community 1 - "routes/index.js"
Cohesion: 0.05
Nodes (51): createApp(), connectDatabase(), DEFAULT_OPTIONS, disconnectDatabase(), assertRequiredEnv(), env, USER_MANAGEMENT_ROLES, requireAuth (+43 more)

### Community 2 - "RouterApp.jsx"
Cohesion: 0.06
Nodes (45): AppErrorBoundary, EmptyState(), ErrorState(), Forbidden(), NotFound(), PageSkeleton(), queryClient, queryKeys (+37 more)

### Community 3 - "admin.service.js"
Cohesion: 0.06
Nodes (42): AuditLog, MediaRating, mediaRatingSchema, approveStory(), createCareer(), createMedia(), createQuizQuestion(), createResource() (+34 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (33): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+25 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, @hookform/resolvers, react, react-dom, react-hook-form, react-router-dom, sonner, @tanstack/react-query (+23 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (30): dependencies, bcryptjs, cookie-parser, cors, dotenv, express, express-rate-limit, helmet (+22 more)

### Community 7 - "run.js"
Cohesion: 0.16
Nodes (19): careersSeed, domainsSeed, skillsSeed, careerIds, domainIds, profileIds, quizQuestionIds, skillIds (+11 more)

### Community 8 - "admin.controller.js"
Cohesion: 0.10
Nodes (24): approveStory, deleteCareer, deleteMedia, deleteQuizQuestion, deleteResource, getAuditLogs, getCareers, getFeedback (+16 more)

### Community 9 - "compare-careers.jsx"
Cohesion: 0.15
Nodes (13): PageTitle(), CompareCareersPage(), NotificationsPage(), QuizHistoryPage(), RecentlyViewedPage(), SavedFiltersPage(), CompareCareersPage, NotificationsPage (+5 more)

### Community 10 - "personalization.service.js"
Cohesion: 0.13
Nodes (7): SAVABLE_ITEM_TYPES, Bookmark, bookmarkSchema, ITEM_TYPE_TO_MODEL, RecentlyViewed, recentlyViewedSchema, listBookmarks()

### Community 11 - "auth.controller.js"
Cohesion: 0.21
Nodes (18): adminLogin, forgotPassword, issueSessionCookie(), login, loginWithRole(), logout, me, register (+10 more)

### Community 12 - "AppError"
Cohesion: 0.13
Nodes (10): ONBOARDING_STATUSES, getMyFeedback, submitFeedback, getMyProfile, updateAsset, updateMyProfile, updateOnboarding, UserProfile (+2 more)

### Community 13 - "models/index.js"
Cohesion: 0.13
Nodes (10): SKILL_CATEGORIES, TOKEN_PURPOSES, auditLogSchema, Session, sessionSchema, Skill, skillSchema, User (+2 more)

### Community 14 - "personalization.controller.js"
Cohesion: 0.13
Nodes (17): createCareer, createMedia, createQuizQuestion, createResource, respondToFeedback, createBookmark, createComparison, createRecentlyViewed (+9 more)

### Community 15 - "constants/database.js"
Cohesion: 0.17
Nodes (13): EMAIL_PATTERN, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, MULTIMEDIA_TYPES, QUIZ_TRAITS, STAFF_ROLES, USER_ROLES, USER_STAGES (+5 more)

### Community 16 - "asyncHandler.js"
Cohesion: 0.16
Nodes (10): listDomains, getNotifications, markAllRead, markRead, getSettings, updateSettings, listSkills, router (+2 more)

### Community 17 - "document-preview.jsx"
Cohesion: 0.15
Nodes (11): Back(), DocumentPreviewPage(), MediaDetailPage(), QuizResultDetailPage(), StoryDetailPage(), SubmitStoryPage(), DocumentPreviewPage, MediaDetailPage (+3 more)

### Community 18 - "UserProfile.js"
Cohesion: 0.15
Nodes (12): PROFILE_SKILL_SOURCES, REMOTE_PREFERENCES, RESOURCE_TYPES, STORY_STATUSES, Resource, resourceSchema, successStorySchema, educationSchema (+4 more)

### Community 19 - "ConnectedAuthPage.jsx"
Cohesion: 0.15
Nodes (13): AppShell(), ConnectedAuthPage(), loginSchema, password, signupSchema, AdminPage(), LoginPage(), SignupPage() (+5 more)

### Community 20 - "models.milestone2.test.js"
Cohesion: 0.13
Nodes (7): NOTIFICATION_TYPES, Comparison, comparisonSchema, Feedback, Notification, notificationSchema, SuccessStory

### Community 21 - "quiz.service.js"
Cohesion: 0.17
Nodes (6): QUIZ_ATTEMPT_STATUSES, quizAnswerSchema, QuizAttempt, quizAttemptSchema, createNotification(), completeAttempt()

### Community 22 - "App.jsx"
Cohesion: 0.18
Nodes (10): App(), readLocation(), copyForState, NaviAssistant(), poseForState, ConnectedCareerDetailPage(), DashboardPage(), FeedbackPage() (+2 more)

### Community 23 - "Career.js"
Cohesion: 0.20
Nodes (8): CAREER_DEMAND_LEVELS, SKILL_IMPORTANCE_LEVELS, Career, careerSchema, requiredSkillSchema, salarySchema, SavedFilter, savedFilterSchema

### Community 24 - "content.controller.js"
Cohesion: 0.20
Nodes (9): downloadResource, getMedia, getMediaById, getResourceById, getResources, getStories, getStoryById, rateMedia (+1 more)

### Community 25 - "pages/index.js"
Cohesion: 0.36
Nodes (4): AdminLoginFlow(), ForgotPasswordFlow(), ResetPasswordFlow(), VerifyEmailFlow()

### Community 26 - "quiz.controller.js"
Cohesion: 0.29
Nodes (6): answerQuestion, completeAttempt, getAttempt, getAttempts, getQuestions, startAttempt

### Community 27 - "QuizQuestion.js"
Cohesion: 0.33
Nodes (5): QUIZ_QUESTION_TYPES, domainWeightSchema, quizOptionSchema, QuizQuestion, quizQuestionSchema

### Community 28 - "catalog.controller.js"
Cohesion: 0.40
Nodes (4): getCareerBySlug, getCareers, getDomains, getSkills

## Knowledge Gaps
- **151 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `AppError` to `routes/index.js`, `admin.service.js`, `admin.controller.js`, `personalization.service.js`, `auth.controller.js`, `personalization.controller.js`, `quiz.service.js`, `content.controller.js`, `quiz.controller.js`, `catalog.controller.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Icon()` connect `Icon.jsx` to `RouterApp.jsx`, `compare-careers.jsx`, `document-preview.jsx`, `ConnectedAuthPage.jsx`, `App.jsx`, `pages/index.js`, `help-center.jsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `isNonEmptyString()` connect `personalization.controller.js` to `admin.controller.js`, `auth.controller.js`, `AppError`, `content.controller.js`, `quiz.controller.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Icon.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05891016200294551 - nodes in this community are weakly interconnected._
- **Should `routes/index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.052100840336134456 - nodes in this community are weakly interconnected._
- **Should `RouterApp.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.057971014492753624 - nodes in this community are weakly interconnected._