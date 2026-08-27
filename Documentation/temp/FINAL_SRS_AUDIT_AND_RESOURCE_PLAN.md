# PathSeeker Final SRS Audit and Resource Plan

**Audit date:** 27 August 2026  
**Source of truth:** `PathSeeker_Career_Passport_SRS_Clean.md`  
**Scope:** Live repository inspection, graph traversal, automated checks, content verification, resource-file verification, and submission-readiness review.

## Executive finding

PathSeeker has a strong full-stack foundation and a polished visual system. Authentication, profile/onboarding, career catalog APIs, quiz attempts, Career Passport scoring, recommendations, bookmarks, notes, comparisons, saved filters, notifications, feedback, stories, admin APIs, accessibility preferences, and error states are represented in the live architecture.

The submission is not yet credible as complete because several judge-visible experiences still contain missing assets, placeholder content, decorative-only controls, or frontend/backend contract errors. The most important gaps are concentrated in the Career Bank and Resource Library rather than the core architecture.

## Verified baseline before this completion pass

- Frontend unit/component tests: **7 passing**.
- Frontend lint: **passing with zero errors**.
- Frontend production build: **passing**.
- Backend tests: **34 passing, 2 skipped live-database tests, 0 failing**.
- MongoDB was not running in the audit environment, so authenticated browser journeys could not be accepted as live-persistence evidence.
- The repository worktree was clean apart from an unrelated untracked `.claude/` directory, which this pass does not modify.

## SRS coverage matrix

| SRS area | Current state at audit | Key evidence | Completion work ordered |
| --- | --- | --- | --- |
| Authentication and roles | Implemented, live DB proof pending | Cookie session API, verification/reset flows, user/staff route guards | Preserve; re-run automated regression checks |
| Editable profile and onboarding | Implemented | Connected profile and onboarding pages use profile API | Preserve; include in final browser checklist |
| Personalized dashboard | Implemented | Connected dashboard aggregation, Career Passport, activity, bookmarks, trends | Preserve |
| Career Bank | Partial | Connected list/detail APIs, but only 6 careers; advanced filters and suggestions are not exposed; result count reads the wrong response path | Expand real career catalog; add filters, autocomplete, saving, source context, and correct metadata |
| Interest quiz | Implemented core, limited question formats | Server-owned multi-step attempt lifecycle and scoring; all seed questions are multiple choice | Preserve core; document optional slider/Likert limitation |
| Career Passport and recommendations | Implemented | Deterministic passport, explainable compatibility/readiness, simulator | Surface supporting career evidence more clearly |
| Multimedia Center | Partial and placeholder-bearing | Media APIs and rating exist, but both seeded videos use a placeholder ID and the player never embeds `media.url` | Replace with credible expert videos; add real iframe/audio playback, source attribution, learning notes, and related content |
| Resource Library | Partial and broken at asset layer | 5 resource records point to `/assets/documents/*.pdf`, but no document files exist | Author, render, visually verify, and ship every referenced PDF; add richer metadata and real preview/download behavior |
| Success Stories | Implemented core | Connected list/detail/submission and admin moderation | Preserve; synthetic demo stories must remain clearly demo content |
| Feedback and notifications | Implemented core | Connected submission, analytics, response notifications, read state | Preserve |
| Bookmarks, notes, export, and sharing | Partial | Bookmark/note CRUD is connected; comparison print exists; saved-items export/share controls are absent | Add printable saved portfolio, email/native share, and correct media bookmark routing |
| Recently viewed and related suggestions | Partial | Persistent API exists, but detail pages do not consistently record views | Record views from career/media/resource detail pages; expose related career/content routes |
| Admin control panel | Broadly implemented | Connected user, career, resource/media, quiz, story, feedback, settings, and overview screens | Preserve; resource metadata additions must remain admin-compatible |
| Accessibility | Implemented foundation | Theme, font scaling, reduced-motion store, breadcrumbs, labels, route states | Add media titles/labels and preserve keyboard-safe controls |
| Installation and evaluator readiness | Partial | Root/backend README exist, but no bundled MongoDB and current limitations still describe older migration gaps | Update instructions, asset inventory, evidence, and evaluator checklist after implementation |

## Judge-visible defects confirmed

1. `content.seed.js` uses `dQw4w9WgXcQ` for both expert videos.
2. `Project/frontend/public/assets/documents/` does not exist although every seeded document points there.
3. The media detail screen simulates progress but never renders the media URL.
4. The document preview is a generic worksheet mock for every resource rather than the actual document.
5. `careersApi` exports `list`, `detail`, and `domains`, while Compare Careers and Saved Filters call nonexistent `getCareers` and `getDomains` methods.
6. The Career Bank reads pagination metadata from `response.meta`; the backend returns it at `response.data.meta`.
7. Career cards show a bookmark control without a mutation in the connected Career Bank.
8. The Career Bank does not expose the backend's skill, demand, salary, autocomplete, or spelling-correction capabilities.
9. Seeded career coverage is too narrow for the SRS phrase “global job roles”: only six records cover five practical pathways.
10. Career salary/growth values have no visible source, reference year, location, or “local market varies” disclaimer.
11. Audio bookmarks are routed to the document preview because the saved page infers media only when `type === 'video'`.
12. Multiple production strings contain mojibake sequences such as `â€™`, `Â·`, and `Ã—`, reducing presentation quality.

## Resource creation order

The following files will be authored as original PathSeeker materials and shipped as working downloads:

1. Career Decision Workbook
2. UX Interview and Case Study Checklist
3. Data Analyst 90-Day Roadmap
4. High-Impact Portfolio Guide for Tech and Design
5. Skills Gap Analysis and Practice Template
6. Career Interview Preparation Pack

Every PDF must:

- contain useful exercises rather than filler;
- identify its audience and intended outcome;
- distinguish occupational reference data from guarantees;
- cite authoritative career-information sources;
- use stable PathSeeker branding, page numbers, and accessible contrast;
- be rendered to PNG and visually checked before being copied into the public app assets.

## Career information policy

- Occupation outlook and U.S. median-pay references use the U.S. Bureau of Labor Statistics 2024 data and 2024-2034 projections.
- The UI must identify those values as U.S. reference figures, not global salary promises.
- Education paths must acknowledge degree, certificate, portfolio, apprenticeship, and regulated-license differences where applicable.
- Healthcare and other regulated careers must explicitly state that local licensing requirements apply.
- Career descriptions, responsibilities, pathways, and tools are original summaries informed by BLS Occupational Outlook Handbook and O*NET occupation profiles.
- External expert media must identify its publisher and link to the original source.

## Acceptance gates for this pass

- No placeholder video IDs remain in production seeds.
- Every published resource URL resolves to a real local file.
- Media playback uses the stored URL and has an external-source fallback.
- At least 15 credible career profiles span the 10 seeded domains.
- Advanced career filters, suggestions, bookmarking, and saved-filter application work against the existing APIs.
- Career profiles display responsibilities, pathway, tools, readiness time, source year/location, and related learning.
- Saved items can be printed/exported and shared using browser/email fallbacks.
- Frontend tests, lint, production build, backend tests, seed/model validation, and asset-link checks pass.
- A final implementation trace and honest limitations section are added to this document.

## Remaining external acceptance dependencies

These cannot be proven solely inside the repository:

- A reachable MongoDB instance is required for live authentication and persistence.
- Real email delivery requires provider credentials.
- YouTube availability, regional access, embedding policy, and third-party URLs can change.
- Production hosting, DNS, HTTPS, backups, and the mandatory demonstration video remain deployment/team deliverables unless supplied separately.

## Final implementation trace

Completed in this pass:

1. Expanded the deterministic Career Bank from 6 to 15 real occupations spanning all 10 seeded domains.
2. Added 14 missing skill records and mapped every career to responsibilities, tools, traits, education routes, preparation estimates, salary range/median, demand, growth, and a named BLS source.
3. Added visible source geography, 2024 salary year, 2024-2034 outlook period, occupation/source link, and a responsible salary disclaimer to career details and comparisons.
4. Corrected the Career Bank pagination response path and added skill, domain, demand, median-salary, sorting, paging, autocomplete, spelling suggestions, bookmark toggling, and saved-filter persistence.
5. Added working aliases and routes for the previously mismatched Career, Domain, Skill, suggestions, related-career, related-content, related-media, and resource-view APIs.
6. Replaced all placeholder media seeds with six verified videos from Google Career Certificates. Each record includes the official watch link, privacy-enhanced embed URL, thumbnail, publisher attribution, learning objectives, and PathSeeker learning notes.
7. Replaced the decorative media mock with a real iframe/audio-capable player, publisher fallbacks, captions guidance, ratings, related videos, and downloadable next steps.
8. Authored six original PathSeeker PDF resources (51 pages total), copied them to the public app, and connected the database metadata to the exact file size and page count.
9. Replaced the generic worksheet mock with the actual browser PDF viewer plus source references, authorship/version/review metadata, working download action, view/download counters, and recently-viewed tracking.
10. Added recently-viewed tracking to career, media, and resource details; surfaced related careers, expert media, and career materials.
11. Repaired saved-filter application, preserved skill filters in the data model/controller, made comparison saving explicit, and added saved-collection print/PDF and native/email sharing.
12. Corrected the saved-resource media routing and removed the confirmed malformed UTF-8 sequences from production source files.
13. Updated evaluator setup/resource documentation and added a regression test that fails on missing resource files, placeholder videos, unsourced careers, or insufficient catalog breadth.
14. Replaced the static career/content admin mocks with connected create/edit/save-draft/publish forms, repaired the new-item routes, and restored missing navigation props on career, content, quiz, and feedback admin pages.
15. Added an explicit demo-content marker to seeded success stories so fictional evaluator data is never presented as a verified real-person claim; genuine future community submissions remain labeled separately.

## Final verification evidence

- Frontend tests: **7 passed, 0 failed**.
- Frontend lint: **passed with zero errors**.
- Frontend production build: **passed; 241 modules transformed**.
- Backend tests: **35 passed, 2 skipped live-database tests, 0 failed**.
- Content gate: **15 careers / 10 domains, 6 videos, 6 PDFs**.
- PDF gate: **51/51 pages rendered**, selectable text checked, artifact/public checksums matched, and all six contact sheets visually reviewed.
- Repository hygiene: `git diff --check` passed and no placeholder video ID or confirmed mojibake codepoint sequence remains in production source.

## Honest remaining limitations

- MongoDB is not running in this evaluation workspace. Authenticated live browser persistence therefore could not be replayed here; automated route, model, seed, service, and production-build checks passed instead.
- The in-app browser automation runtime was not exposed in this session, so the final interactive visual pass could not be captured through that surface. PDF visual QA was completed independently for every page.
- The optional SRS quiz timer, slider/Likert question variants, audio podcast catalog, and animated explainer format are not seeded. The required multi-step quiz, embedded expert videos, transcripts/learning notes, rating, and related-content experiences are implemented.
- The admin API supports career/content CRUD and publication state, but some legacy admin editor screens remain less complete than the connected public experience and should be the next enhancement if the judging rubric heavily weights editorial UI depth.
- Production email, object storage, external voice integrations, hosting, HTTPS, backup policy, and the mandatory demonstration video require deployment credentials or team-owned production work.
- Career figures are U.S. occupational references, not a worldwide salary database. The UI now states this explicitly; a production global rollout would add country-specific sources and regulated-career licensing feeds.
