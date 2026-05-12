# SkillBridge Stage 5 - Scoring Engine + Tier Assignment

Independent NestJS backend feature that stores candidate component scores, computes weighted composite score, assigns tier, and enforces candidate/admin access control.

## Stack

- NestJS + TypeScript
- TypeORM (PostgreSQL in deployment, SQL.js in tests)
- JWT guard (Bearer token)

## Product Rules Implemented

- Assessment weight: 60%
- Task weight: 40%
- Tier bands:
  - Not Ready: 0-49
  - Emerging: 50-74
  - Job Ready: 75-100
- `pending` status until both component scores exist
- Auto-calculate and persist when both scores are available
- Recalculate and persist on component score updates
- Candidate owner and admin can read results

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment values from `.env.example`.

3. For PostgreSQL deployment, set:

- `DB_TYPE=postgres`
- `TYPEORM_SYNC=false`

4. Apply the TypeORM migration:

```bash
npm run migration:run
```

The repository also includes the SQL equivalent at `db/migrations/001_create_score_results.sql` for review.

5. Start API:

```bash
npm run start:dev
```

## Deploy on Cyclic.sh (Step-by-Step)

### 1. Prepare repository

- Push the latest code to GitHub.
- Confirm app builds locally:

```bash
npm run build
```

### 2. Provision PostgreSQL

- Create a managed PostgreSQL database (for example Supabase, Neon, Railway, or Render Postgres).
- Copy connection values: host, port, database, username, password, and SSL requirement.

### 3. Create app on Cyclic

- Sign in to Cyclic and connect your GitHub account.
- Click **Deploy** and select this repository.
- Set these commands in Cyclic project settings:
  - Build command: `npm run build`
  - Start command: `npm run start:prod`

### 4. Configure environment variables on Cyclic

Set the following variables in Cyclic:

- `NODE_ENV=production`
- `PORT=3000` (Cyclic may override this automatically)
- `JWT_SECRET=<strong-random-secret>`
- `DB_TYPE=postgres`
- `DB_HOST=<your-db-host>`
- `DB_PORT=<your-db-port>`
- `DB_USERNAME=<your-db-username>`
- `DB_PASSWORD=<your-db-password>`
- `DB_DATABASE=<your-db-name>`
- `TYPEORM_SYNC=false`
- `TYPEORM_MIGRATIONS_RUN=true`
- `DB_SSL=true` (set `false` only if your DB does not require SSL)

You can use alias names if preferred:
- `DB_USER` as alternative to `DB_USERNAME`
- `DB_NAME` as alternative to `DB_DATABASE`

### 5. Deploy

- Trigger a deploy from Cyclic dashboard.
- Wait for build and startup logs.
- Verify app health by opening:

`https://<your-cyclic-domain>/api/scores/me/result`

You should receive a response (auth placeholder or auth error is still a valid server-up signal).

### 6. Post-deploy checks

- Confirm app binds to Cyclic port (already handled by `PORT` + `0.0.0.0`).
- Confirm migration execution in logs (`TYPEORM_MIGRATIONS_RUN=true`).
- Test one admin score submission and one retrieval endpoint.

### 7. Troubleshooting

- `ECONNREFUSED`: DB host/port incorrect or DB is not reachable from the internet.
- `password authentication failed`: wrong DB username/password.
- SSL errors: set `DB_SSL=true` for managed cloud Postgres.
- Missing table errors: ensure `TYPEORM_MIGRATIONS_RUN=true` and redeploy.

## Deploy on Supabase + Vercel (Recommended)

Use this order: **Supabase first**, then **Vercel**.

### A. Supabase Setup (Database First)

1. Create Supabase project
- Go to Supabase dashboard and create a new project.
- Choose region close to your users and set a strong database password.

2. Get Postgres connection details
- In Supabase, open **Project Settings -> Database**.
- Copy these values:
  - Host
  - Port
  - Database name
  - User
  - Password

3. Network and SSL expectations
- Supabase Postgres requires SSL for external connections.
- In this app, set `DB_SSL=true` for production.

4. Prepare local migration run against Supabase
- Update local `.env` (or use terminal env vars) with Supabase DB values.
- Keep:
  - `DB_TYPE=postgres`
  - `TYPEORM_SYNC=false`

5. Run migrations once before Vercel deploy

```bash
npm run migration:run
```

6. Verify schema
- In Supabase SQL editor/table browser, confirm `score_results` table exists.

### B. Vercel Setup (App Hosting)

This repository is now prepared for Vercel serverless routing via `vercel.json` and `api/index.ts`.

1. Push code to GitHub

```bash
git add .
git commit -m "chore: prepare Nest app for Vercel + Supabase deployment"
git push
```

2. Import project in Vercel
- Go to Vercel dashboard -> **Add New Project**.
- Import this GitHub repository.

3. Configure framework/build settings
- Framework: `Other` (or auto-detected Node project).
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave empty.

4. Add environment variables in Vercel

Required:
- `NODE_ENV=production`
- `JWT_SECRET=<strong-random-secret>`
- `DB_TYPE=postgres`
- `DB_HOST=<supabase-host>`
- `DB_PORT=<supabase-port>`
- `DB_USERNAME=<supabase-user>`
- `DB_PASSWORD=<supabase-password>`
- `DB_DATABASE=<supabase-database>`
- `DB_SSL=true`
- `TYPEORM_SYNC=false`
- `TYPEORM_MIGRATIONS_RUN=false`

Optional aliases (supported by this app):
- `DB_USER` as alternative to `DB_USERNAME`
- `DB_NAME` as alternative to `DB_DATABASE`

5. Deploy
- Trigger the first production deployment in Vercel.
- Watch deployment logs for startup errors.

6. Validate live API
- Open:
  - `https://<your-vercel-domain>/api/scores/me/result`
- A response confirms serverless runtime is active (auth response is acceptable).

### C. Why `TYPEORM_MIGRATIONS_RUN=false` on Vercel

- Vercel runs serverless functions on demand; startup can happen many times.
- Running migrations on every cold start is unsafe and can cause contention.
- Best practice: run migrations in a controlled step (local CI/CD job) before or during release.

### D. Release Workflow (Production Safe)

1. Update code and push to main branch.
2. Run migration against Supabase from trusted environment.
3. Deploy to Vercel.
4. Smoke test key endpoints.

### E. Troubleshooting (Supabase + Vercel)

- `ECONNREFUSED` / timeout:
  - Wrong host/port or temporary DB networking issue.
- `no pg_hba.conf entry` or SSL-related failures:
  - Ensure `DB_SSL=true`.
- Authentication failed:
  - Verify DB user/password from Supabase database settings.
- Missing relation/table:
  - Run `npm run migration:run` against Supabase and redeploy.
- 500 error only on Vercel:
  - Check Vercel function logs and confirm all env vars exist in Production scope.

## Auth Token Shape

All endpoints require `Authorization: Bearer <jwt>`.

Expected JWT payload:

```json
{
  "sub": 1,
  "role": "candidate",
  "candidateId": 1
}
```

Admin example:

```json
{
  "sub": 99,
  "role": "admin"
}
```

## API Routes

Base prefix: `/api`

- `POST /scores`
  - Create or upsert component scores.
- `PATCH /scores/:candidateId`
  - Update one or both component scores and trigger rescoring.
- `GET /scores/:candidateId`
  - Get score result for a candidate.
- `GET /scores/me/result`
  - Candidate-only shortcut for current user's score.

## Request Examples

Create assessment-only score (pending):

```json
{
  "candidateId": 1,
  "assessmentScore": 80
}
```

Complete/update score:

```json
{
  "taskScore": 70
}
```

## Response Shape

```json
{
  "candidate_id": 1,
  "assessment_score": 80,
  "task_score": 70,
  "composite_score": 76,
  "tier": "Job Ready",
  "status": "completed",
  "score_breakdown": {
    "assessment_weight": 0.6,
    "task_weight": 0.4,
    "assessment_contribution": 48,
    "task_contribution": 28,
    "formula": "(80 * 0.6) + (70 * 0.4) = 76"
  },
  "scored_at": "2026-05-11T00:00:00.000Z",
  "created_at": "2026-05-11T00:00:00.000Z",
  "updated_at": "2026-05-11T00:00:00.000Z"
}
```

## Tests

- Unit:

```bash
npm test
```

- E2E:

```bash
npm run test:e2e
```

Coverage includes:

- pending state
- weighted calculation
- tier assignment
- rescoring
- access control
- missing-score validation

## Implementation Note

This Stage 5 repository is implemented in NestJS with TypeORM. The scoring feature remains on that stack so it stays independently deployable within the repo's actual backend architecture, rather than introducing FastAPI or Sequelize alongside it.
