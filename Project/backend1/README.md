# PathSeeker database package

This directory contains the Phase 1 MongoDB/Mongoose domain layer. It intentionally does not include Express controllers or routes.

## Included models

- `Skill`
- `Domain`
- `User`
- `UserProfile`
- `Session`
- `VerificationToken`

`UserProfile` stores user-provided facts. Calculated Career Passport state belongs to the Phase 2 `CareerPassport` model and must be written only by its future domain service.

## Local setup

1. Install Node.js 20 or newer and MongoDB 7 or newer.
2. Copy `.env.example` to `.env` and replace the placeholder demo password.
3. Run `npm install`.
4. Run `npm test`.
5. Start MongoDB and run `npm run seed`.

Use `npm run seed:reset` to remove and recreate only the deterministic records owned by the seed scripts. It does not delete arbitrary development data.

## Live database tests

The normal test suite validates Mongoose schemas and index contracts without requiring MongoDB. To additionally exercise persistence and unique/TTL index creation, set `TEST_MONGODB_URI` and `TEST_MONGODB_DB_NAME` to a disposable test database before running `npm test`.

Never point the integration tests or reset seed command at a database containing important data.

## Demo identities created by the seed

- `admin@pathseeker.local` — super administrator
- `demo.student@pathseeker.local` — student
- `demo.graduate@pathseeker.local` — graduate
- `demo.professional@pathseeker.local` — professional

All demo identities use the private password supplied through `SEED_DEMO_PASSWORD`; the password is never committed.
