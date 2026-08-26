# PathSeeker — Career Passport

PathSeeker is a full-stack Career Passport application for students, graduates, and working professionals. The supplied React/Vite interface is backed by an Express/Mongoose API with MongoDB persistence.

## Architecture

- **Frontend:** React 19 + Vite
- **Backend:** Node.js 20+ + Express 4
- **Database:** MongoDB via Mongoose
- **Authentication:** bcrypt password hashing + MongoDB-backed opaque sessions in `httpOnly` cookies
- **Content:** MongoDB metadata with controlled external/local-development asset URLs

The project preserves the supplied MongoDB/Express/React/Node architecture.

## Project structure

```text
Project/
  frontend/
  backend/
```

## Requirements

- Node.js 20+
- MongoDB 7+ or a compatible MongoDB Atlas deployment
- npm

## Backend setup

```bash
cd Project/backend
cp .env.example .env
npm ci
npm run seed:reset
npm run dev
```

The backend defaults to `http://localhost:4000`.

### Environment

At minimum configure:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=pathseeker
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
SESSION_COOKIE_NAME=ps_session
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=lax
SEED_DEMO_PASSWORD=ChangeMe123!
```

Never commit a real `.env` file or real credentials.

## Demo accounts

The seed creates one Super Admin and three user stages. The password comes from `SEED_DEMO_PASSWORD`; it is intentionally not hard-coded in the application source.

- Admin: `admin@pathseeker.local`
- Student: `demo.student@pathseeker.local`
- Graduate: `demo.graduate@pathseeker.local`
- Professional: `demo.professional@pathseeker.local`

## Frontend setup

```bash
cd Project/frontend
cp .env.example .env
npm ci
npm run dev
```

The frontend defaults to `http://localhost:5173` and proxies `/api` to port 4000. For a separately hosted API, set `VITE_API_URL`.

## Verification

Backend syntax verification:

```bash
cd Project/backend
find src test -name '*.js' -print0 | xargs -0 -n1 node --check
npm test
```

Frontend:

```bash
cd Project/frontend
npm run lint
npm run build
```

The repository environment used for this completion pass did not have the npm dependency cache required for a clean `npm ci`, so runtime npm tests/builds must be run on a machine with package registry access and MongoDB. Do not interpret static syntax checks as successful integration tests.

## API health

- `GET /api/health`
- `GET /api/health/db`

## Main user journey

Register → verify email → login → onboarding/profile → Career Bank → search/filter → career detail → bookmark/note → quiz → server scoring → explainable recommendations → resources/media → stories/feedback → notifications.

## Main admin journey

Admin login → overview → users → career management → quiz management → content management → story moderation → feedback → analytics → settings → audit logs.

## Security notes

- Passwords are hashed with bcrypt.
- Session tokens are stored only as hashes in MongoDB.
- Authentication uses `httpOnly` cookies.
- Auth routes are rate-limited.
- Admin routes enforce server-side role checks.
- User-owned bookmarks, history, notifications, quiz attempts, and profiles are scoped to the authenticated user.
- Mongoose validation and invalid-ID handling are centralized.
- Helmet and explicit CORS configuration are enabled.

## Submission artifacts still requiring human/environment work

The SRS requires a complete report, test data/credentials, diagrams, a hosted URL, and an MP4 demonstration. The source tree contains the implementation and documentation foundation, but a genuine hosted deployment and screen-recorded MP4 cannot be fabricated inside a source-editing environment.
