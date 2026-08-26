# PathSeeker screen map

This screen inventory translates the supplied product brief and TechWiz judging guide into an implementation checklist. The Markdown supplied with the project is a judging guide, not the official detailed SRS, so this map records the interpretation used for the current build.

## Public and onboarding

| Screen | URL | Requirements covered |
| --- | --- | --- |
| Welcome | `?screen=welcome` | Product introduction, Career Bank/resources entry points, voice-agent entry point |
| Sign up | `?screen=signup` | Account creation, password guidance, social sign-in presentation, privacy reassurance |
| Log in | `?screen=login` | Returning-user access and password recovery entry point |
| Guided onboarding | `?screen=onboarding` | User stage, interests, goals, Career Passport setup |
| Forgot password | `?screen=forgot-password` | Password recovery request and sent state |
| Reset password | `?screen=reset-password` | New-password form and completion state |
| Admin login | `?screen=admin-login` | Dedicated protected-workspace entry |

## User Career Passport

| Screen | URL | Requirements covered |
| --- | --- | --- |
| Dashboard | `?screen=dashboard` | Personalized progress, matches, learning activity, recommendations |
| Career quiz | `?screen=quiz` | Interest questions, progress, selectable answers, optional voice answering |
| Recommendations | `?screen=recommendations` | Personality profile, match ranking, match explanations, bookmarks |
| Career Bank | `?screen=careers` | Search, category filters, salary/demand filters, sorting |
| Career detail | `?screen=career-detail&career=ux-designer` | Salary, demand, work activities, skills, tools, roadmap, expert content |
| Resources | `?screen=resources` | Courses, videos, podcasts, guides, downloadable documents, progress |
| Saved and notes | `?screen=saved` | Career/resource bookmarks and personal notes |
| Success stories | `?screen=stories` | Featured and community career-transition stories |
| Profile and settings | `?screen=profile` | Career Passport, personal details, preferences, notifications, privacy/data |
| Feedback | `?screen=feedback` | Rating, categorized feedback, contact consent, success confirmation |
| Voice mode | `?screen=dashboard&voice=1` | Persistent voice-agent presentation with idle, listening, thinking, and speaking states |
| Notifications | `?screen=notifications` | Read/unread career, learning, feedback, and account updates |
| Quiz history | `?screen=quiz-history` | Previous attempts and result changes over time |
| Quiz result detail | `?screen=quiz-result` | Signal breakdown, answer patterns, and ranked careers |
| Recently viewed | `?screen=recently-viewed` | Cross-content activity history and continuation links |
| Compare careers | `?screen=compare` | Side-by-side fit, salary, growth, skills, and readiness comparison |
| Saved filters | `?screen=saved-filters` | Create, edit, apply, and alert on Career Bank filters |
| Multimedia player | `?screen=media-detail` | Video controls, transcript, rating, and related resources |
| Document preview | `?screen=document-preview` | In-app workbook/PDF preview and contents navigation |
| Success story detail | `?screen=story-detail` | Long-form journey and timeline storytelling |
| Submit success story | `?screen=submit-story` | Three-step user submission and consent flow |
| Help center | `?screen=help` | Searchable support topics and contact entry point |

## Administration

| Screen | URL | Requirements covered |
| --- | --- | --- |
| Admin overview | `?screen=admin` | Platform KPIs, user stages, activity, popular careers |
| Users | `?screen=admin-users` | User search, stage/status filters, access management presentation |
| Career profiles | `?screen=admin-careers` | Career publishing status, views, match scores, CRUD entry points |
| Content library | `?screen=admin-content` | Course/video/podcast/document management |
| Quiz builder | `?screen=admin-quiz` | Question list, answer editing, signal mapping, preview/publish |
| Success stories | `?screen=admin-stories` | Submission review, editing, publishing, featuring |
| Feedback inbox | `?screen=admin-feedback` | Triage, rating/context, internal notes, assignment/resolution |
| Feedback analytics | `?screen=admin-feedback-analytics` | Sentiment, response-type, resolution, and topic analytics |
| User editor | `?screen=admin-user-editor` | Profile, role, status, and account-access editing |
| Career editor | `?screen=admin-career-editor` | Overview, market, skills, roadmap, and matching fields |
| Content editor | `?screen=admin-content-editor` | Media/document metadata, upload presentation, and tagging |
| Story review | `?screen=admin-story-review` | Editorial review, consent, notes, and publishing status |
| Admin settings | `?screen=admin-settings` | Workspace, team, notifications, security, and data controls |
| Admin help | `?screen=admin-help` | Searchable administrator guidance and support |

## Backend integration boundary

The extended pages currently use frontend fixtures and interaction state. `src/services/pathseekerApi.js` centralizes future Express endpoint paths, JSON request handling, and MongoDB-compatible opaque string IDs so the UI can move to live data without changing page structure.

## Voice-agent behavior

Navi is accessible from the public welcome page, desktop header, sidebar, quiz, recommendations, and mobile navigation. The voice layer has four visual states:

1. Idle — invites an open question.
2. Listening — shows live-transcript feedback.
3. Thinking — signals that preferences and activity are being considered.
4. Speaking — explains a recommendation and reminds users to verify important details.

## Responsive and accessibility interpretation

- Desktop application shell with persistent navigation; mobile bottom navigation and slide-out menu.
- Semantic buttons, form labels, dialog roles, live-region feedback, visible focus states, and reduced-motion support.
- Responsive layouts for public, user, voice, and admin surfaces.
- Original visual system based on the provided signup concept: warm ivory, sage green, navy type, rounded cards, and Navi-led guidance.
