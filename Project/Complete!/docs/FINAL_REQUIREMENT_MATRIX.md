# PathSeeker — Code-Level Requirement Matrix

This matrix is limited to implementation/integration scope. Runtime-dependent checks are explicitly separated.

| Requirement | Status | Implementation location |
|---|---|---|
| Registration by Student/Graduate/Professional | COMPLETE | `backend/src/services/auth.service.js`, `frontend/src/components/auth/AuthPage.jsx` |
| Terms acceptance | COMPLETE | auth controller + signup UI |
| Login/session/logout/current user | COMPLETE | auth/session services + `AuthContext.jsx` |
| Email OTP verification/resend/reset | COMPLETE | auth service/controller + auth pages |
| Configurable real email provider | IMPLEMENTED | `backend/src/services/email.service.js` |
| Profile education/skills/interests/experience | COMPLETE | `UserProfile.js`, profile service + `SettingsForm.jsx` |
| Onboarding persistence | COMPLETE | profile service + onboarding page |
| Preferences/privacy/accessibility | COMPLETE | profile model/service + settings UI |
| Account deactivation | COMPLETE | profile service/controller |
| Dashboard personalization/recent activity | COMPLETE | `dashboard.jsx` + personalization APIs |
| Career search/filter/pagination | COMPLETE | catalog service/controller + Career Bank |
| Autocomplete/spell correction | COMPLETE | catalog suggestions + Career Bank |
| Career detail/related careers/related content | COMPLETE | catalog APIs + career detail UI |
| Bookmarks/notes | COMPLETE | personalization service/routes + user UI |
| Recently viewed + privacy | COMPLETE | personalization service/model + UI |
| Saved filters CRUD/apply | COMPLETE | personalization service/routes + UI |
| Career comparisons/share/restore | COMPLETE | comparison service + comparison UI + ID/slug lookup |
| Explainable recommendations | COMPLETE | personalization service + recommendations UI |
| Quiz persistence/resume | COMPLETE | quiz service/model/UI |
| Multiple-choice/Likert/slider quiz UI | COMPLETE | quiz UI + quiz model |
| Optional question timer | IMPLEMENTED | quiz UI + `timeLimitSeconds` schema support |
| Server-side quiz scoring | COMPLETE | `quiz.service.js` |
| Quiz version/snapshot consistency | COMPLETE | `QuizQuestion` + `QuizAttempt` |
| Quiz score breakdown | COMPLETE | `scoreBreakdown` + result UI |
| Media playback/transcript/rating | COMPLETE | content service + media UI |
| Related media | COMPLETE | `/media/:id/related` + media UI |
| Resource preview/view/download | COMPLETE | content service/routes + document UI |
| Validated admin uploads | COMPLETE | upload middleware + admin content editor |
| Upload cleanup on replacement/deletion | COMPLETE | admin content service |
| Success stories/domain filtering | COMPLETE | story APIs + UI |
| Story timeline fields | COMPLETE | story model/service/UI |
| Story image upload | COMPLETE | authenticated upload route + submit UI |
| Story moderation/request changes | COMPLETE | admin story APIs/UI |
| Story moderation notifications | COMPLETE | notification service + admin service |
| Feedback submission/reference/status | COMPLETE | feedback API + feedback UI |
| Feedback triage/assignment/internal notes/response | COMPLETE | admin feedback API/UI |
| Feedback response notification | COMPLETE | notification service |
| Notification list/read/read-all/target navigation | COMPLETE | notification model/service/UI |
| Admin users/careers/content/quiz/stories/feedback | COMPLETE | admin routes/services/controllers/UI |
| Admin settings/audit logs | COMPLETE | settings/audit services + admin UI |
| Server-side admin authorization | COMPLETE | admin route middleware |
| Security headers/CORS/CSRF/rate limiting | COMPLETE | Express middleware |
| XSS/text/URL/upload validation | COMPLETE | sanitizers/validators/upload middleware |
| Global error boundary | COMPLETE | `ErrorBoundary.jsx` |
| 404/403 frontend handling | COMPLETE | public pages + `App.jsx` |
| Homepage sitemap | COMPLETE | `welcome.jsx` |
| Production fixture elimination | COMPLETE | frontend search confirms no production fixture imports |
| React Router + route params + lazy-loaded pages | COMPLETE | `frontend/src/App.jsx`, `react-router-dom` dependency |
| Managed Help Center CMS | COMPLETE | `HelpArticle` model/service/routes + user/admin help pages |
| Career/resource/media draft → publish → archive | COMPLETE | publication status fields, transition services/routes, admin UI |
| Success Story owner edit/resubmit after changes requested | COMPLETE | `/stories/mine/*`, ownership checks, moderation notes/notifications, edit UI |
| Quiz Builder reorder/preview/publish/version management | COMPLETE | `QuizVersion`, reorder/preview/publish routes + admin builder |
| Clean npm runtime/build/lint | NOT RUNTIME-VERIFIED | Environment-dependent |
| MongoDB integration tests | NOT RUNTIME-VERIFIED | Environment-dependent |
| Browser/E2E acceptance | NOT RUNTIME-VERIFIED | Environment-dependent |
| Deployment/MP4/submission artifacts | OUT OF CODE SCOPE | Environment/evaluator work |
