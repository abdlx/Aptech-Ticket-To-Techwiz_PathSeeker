# PathSeeker Backend

Express + Mongoose API for PathSeeker.

## Scripts

- `npm run dev` — Node watch mode
- `npm start` — production-style startup
- `npm test` — Node test runner
- `npm run seed` — upsert demo catalog/users/content
- `npm run seed:reset` — remove seed-owned records and reseed

## API

All application routes are under `/api`.

The current API covers authentication, profile/onboarding, catalog/search, recommendations, quiz attempts/scoring/history, bookmarks/notes, saved filters, comparisons, recently viewed, resources/downloads, multimedia/ratings, stories, feedback, notifications, admin CRUD/moderation/analytics/settings, and audit logs.

## Storage boundary

The SRS makes resume upload optional. No storage provider was supplied with the project, so profile asset endpoints store metadata only. Resource/media admin records accept controlled URLs rather than arbitrary filesystem paths. A production object-storage provider should be added before accepting binary uploads.

## File uploads

Admin content uploads are handled by the built-in development storage boundary at `UPLOAD_DIR` (default `./uploads`). Uploaded files are MIME/signature validated, size-limited, renamed to collision-safe UUID filenames, and exposed through `/uploads/<assetKey>`. Production deployments should place this storage directory on persistent storage or replace the boundary with object storage while keeping the returned asset contract unchanged.
