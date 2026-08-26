# PathSeeker API

This package is the Express/Mongoose backend for PathSeeker. It contains the HTTP API, secure opaque-session authentication, validation/controllers/services, MongoDB models, deterministic seeds, and automated tests.

See the repository [README](../../README.md) for complete full-stack setup, architecture, evaluator identities, and current limitations.

## Commands

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run seed
npm.cmd run seed:reset
npm.cmd start
```

Copy `.env.example` to `.env` before starting or seeding. `seed:reset` removes only deterministic seed-owned records, but it must still never target a database containing important data.

## Health

- `GET /api/health` checks the Express process.
- `GET /api/health/db` returns ready only while Mongoose is connected.

## Career intelligence API

- `GET /api/quiz-questions` — active published quiz without private scoring weights.
- `POST /api/quiz-attempts` — create or resume the current version's attempt.
- `PATCH /api/quiz-attempts/:id/answer` — persist an answer by immutable question key.
- `POST /api/quiz-attempts/:id/complete` — generate the Passport and recommendation snapshot.
- `GET /api/users/me/passport` — latest Career Passport.
- `GET /api/users/me/recommendations` — latest explainable recommendation snapshot.
- `GET /api/users/me/careers/:slug/intelligence` — match, readiness, and skill gap.
- `POST /api/users/me/careers/:slug/simulate` — stateless skill-level simulation.
- `GET /api/users/me/dashboard` — live user dashboard aggregation.

All `/users/me` and assessment-mutation endpoints require the session cookie. Scores are calculated by backend services and are never trusted from client payloads.
