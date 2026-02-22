# PTO Planner

Mobile-friendly PTO planning app built with React + TypeScript + Vite.

## Stack

- React + TypeScript + Vite
- TailwindCSS
- date-fns
- zod
- Supabase Auth (email/password)
- Supabase table persistence for cross-device sync
- localStorage fallback/cache (scoped per signed-in user)

## Features

- Vacation leave planning with status tracking (planned/requested/approved/rejected)
- Sick leave logging that does not reduce entitlement
- Work schedule ranges by date range (for changing work weeks)
- Half-day support (0.5 day at start/end)
- Carryover and forfeiture metrics
- Key events that can be linked to leave blocks
- Year-level import/export JSON with zod validation

## App Navigation

1. Dashboard
2. Planner
3. Leaves
4. Events
5. Settings

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm run test
```

## Build

```bash
npm run build
```

## Deploy (Railway + HTTPS)

1. Push this repo to GitHub.
2. In Railway, create a new project from that GitHub repo.
3. Railway will use `railway.json`:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
   - Healthcheck: `/healthz`
4. Set Railway environment variables from `.env.example`.
5. Open the generated Railway domain. HTTPS is enabled automatically by Railway.

Recommended Railway build/runtime variable:

- `NIXPACKS_NODE_VERSION=24`

### Step 1 (Mandatory): Server Auth Gate

This repo now enforces server-side Basic Auth by default in production.

- `APP_BASIC_AUTH_MODE=required` (default)
- `APP_BASIC_AUTH_USER=...`
- `APP_BASIC_AUTH_PASSWORD=...`

If credentials are missing while mode is `required`, the server fails to start.

### Step 2 (Mandatory): In-App User Auth (Supabase)

Create a Supabase project, then configure:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase dashboard setup:

1. Go to `Authentication -> Providers` and enable `Email`.
2. Go to `Authentication -> URL Configuration`.
3. Add your Railway URL to:
   - Site URL
   - Redirect URLs
4. Go to `SQL Editor` and run `supabase/migrations/20260222_create_planner_states.sql`.

### Important Data Note

Planner state sync now targets Supabase table `public.planner_states` by signed-in user id.
LocalStorage remains as a fallback/cache.

## Suggested Production Path (Step-by-Step)

1. Deploy on Railway with HTTPS.
2. Configure mandatory Basic Auth env vars.
3. Configure Supabase Auth env vars.
4. Run the planner state SQL migration in Supabase.
5. Verify sign-up/sign-in and cross-device planner sync on your Railway domain.

## Data model and sync

The app stores `AppState` in localStorage under:

- `pto-planner-app-state-v1-{supabase_user_id}`

- `activeYear: number`
- `years: Record<number, YearPlan>`

`YearPlan` includes settings, leave blocks, and key events.

Cloud sync table:

- `public.planner_states`
  - `user_id uuid primary key`
  - `state jsonb`
  - `updated_at timestamptz`

## Notes

- Vacation totals exclude rejected requests.
- Sick leaves are logged and reported, but not deducted from entitlement.
- For single included day ranges, leave units use `min(startFraction, endFraction)`.
