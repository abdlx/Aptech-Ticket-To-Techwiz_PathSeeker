# PathSeeker screen map

This screen inventory translates the supplied product brief and TechWiz judging guide into an implementation checklist. The Markdown supplied with the project is a judging guide, not the official detailed SRS, so this map records the interpretation used for the current build.

## Public and onboarding

| Screen | URL | Requirements covered |
| --- | --- | --- |
| Welcome | `?screen=welcome` | Product introduction, Career Bank/resources entry points, voice-agent entry point |
| Sign up | `?screen=signup` | Account creation, password guidance, social sign-in presentation, privacy reassurance |
| Log in | `?screen=login` | Returning-user access and password recovery entry point |
| Guided onboarding | `?screen=onboarding` | User stage, interests, goals, Career Passport setup |

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
