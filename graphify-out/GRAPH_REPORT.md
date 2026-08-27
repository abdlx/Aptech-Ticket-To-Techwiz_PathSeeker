# Graph Report - Project  (2026-08-26)

## Corpus Check
- 229 files · ~488,252 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 759 nodes · 1681 edges · 36 communities (34 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 103 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30

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
  backend1/src/controllers/catalog.controller.js → backend1/src/utils/pagination.js
- `getResources` --calls--> `parsePagination()`  [EXTRACTED]
  backend1/src/controllers/content.controller.js → backend1/src/utils/pagination.js
- `getMedia` --calls--> `parsePagination()`  [EXTRACTED]
  backend1/src/controllers/content.controller.js → backend1/src/utils/pagination.js
- `getStories` --calls--> `parsePagination()`  [EXTRACTED]
  backend1/src/controllers/content.controller.js → backend1/src/utils/pagination.js
- `submitStory` --calls--> `isNonEmptyString()`  [EXTRACTED]
  backend1/src/controllers/content.controller.js → backend1/src/utils/validators.js

## Import Cycles
- None detected.

## Communities (36 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (47): Head(), Field(), AdminTable(), PageHead(), Status(), UserCell(), Brand(), AuthFrame() (+39 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (51): createApp(), connectDatabase(), DEFAULT_OPTIONS, disconnectDatabase(), assertRequiredEnv(), env, USER_MANAGEMENT_ROLES, requireAuth (+43 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (45): AppErrorBoundary, EmptyState(), ErrorState(), Forbidden(), NotFound(), PageSkeleton(), queryClient, queryKeys (+37 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (42): AuditLog, MediaRating, mediaRatingSchema, approveStory(), createCareer(), createMedia(), createQuizQuestion(), createResource() (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (33): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): dependencies, @hookform/resolvers, react, react-dom, react-hook-form, react-router-dom, sonner, @tanstack/react-query (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (30): dependencies, bcryptjs, cookie-parser, cors, dotenv, express, express-rate-limit, helmet (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (19): careersSeed, domainsSeed, skillsSeed, careerIds, domainIds, profileIds, quizQuestionIds, skillIds (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (24): approveStory, deleteCareer, deleteMedia, deleteQuizQuestion, deleteResource, getAuditLogs, getCareers, getFeedback (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (13): PageTitle(), CompareCareersPage(), NotificationsPage(), QuizHistoryPage(), RecentlyViewedPage(), SavedFiltersPage(), CompareCareersPage, NotificationsPage (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (7): SAVABLE_ITEM_TYPES, Bookmark, bookmarkSchema, ITEM_TYPE_TO_MODEL, RecentlyViewed, recentlyViewedSchema, listBookmarks()

### Community 11 - "Community 11"
Cohesion: 0.21
Nodes (18): adminLogin, forgotPassword, issueSessionCookie(), login, loginWithRole(), logout, me, register (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (10): ONBOARDING_STATUSES, getMyFeedback, submitFeedback, getMyProfile, updateAsset, updateMyProfile, updateOnboarding, UserProfile (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (10): SKILL_CATEGORIES, TOKEN_PURPOSES, auditLogSchema, Session, sessionSchema, Skill, skillSchema, User (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (17): createCareer, createMedia, createQuizQuestion, createResource, respondToFeedback, createBookmark, createComparison, createRecentlyViewed (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (13): EMAIL_PATTERN, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, MULTIMEDIA_TYPES, QUIZ_TRAITS, STAFF_ROLES, USER_ROLES, USER_STAGES (+5 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (10): listDomains, getNotifications, markAllRead, markRead, getSettings, updateSettings, listSkills, router (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (11): Back(), DocumentPreviewPage(), MediaDetailPage(), QuizResultDetailPage(), StoryDetailPage(), SubmitStoryPage(), DocumentPreviewPage, MediaDetailPage (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (12): PROFILE_SKILL_SOURCES, REMOTE_PREFERENCES, RESOURCE_TYPES, STORY_STATUSES, Resource, resourceSchema, successStorySchema, educationSchema (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (13): AppShell(), ConnectedAuthPage(), loginSchema, password, signupSchema, AdminPage(), LoginPage(), SignupPage() (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (7): NOTIFICATION_TYPES, Comparison, comparisonSchema, Feedback, Notification, notificationSchema, SuccessStory

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (6): QUIZ_ATTEMPT_STATUSES, quizAnswerSchema, QuizAttempt, quizAttemptSchema, createNotification(), completeAttempt()

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (10): App(), readLocation(), copyForState, NaviAssistant(), poseForState, ConnectedCareerDetailPage(), DashboardPage(), FeedbackPage() (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (8): CAREER_DEMAND_LEVELS, SKILL_IMPORTANCE_LEVELS, Career, careerSchema, requiredSkillSchema, salarySchema, SavedFilter, savedFilterSchema

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): downloadResource, getMedia, getMediaById, getResourceById, getResources, getStories, getStoryById, rateMedia (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.36
Nodes (4): AdminLoginFlow(), ForgotPasswordFlow(), ResetPasswordFlow(), VerifyEmailFlow()

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): answerQuestion, completeAttempt, getAttempt, getAttempts, getQuestions, startAttempt

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (5): QUIZ_QUESTION_TYPES, domainWeightSchema, quizOptionSchema, QuizQuestion, quizQuestionSchema

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (4): getCareerBySlug, getCareers, getDomains, getSkills

## Knowledge Gaps
- **151 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authFlows()` connect `Community 2` to `Community 25`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `AdminPage` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05891016200294551 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.052100840336134456 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.057971014492753624 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05786090005844535 - nodes in this community are weakly interconnected._