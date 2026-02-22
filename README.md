# PTO Planner

Mobile-friendly PTO planning app built with React + TypeScript + Vite.

## Stack

- React + TypeScript + Vite
- TailwindCSS
- date-fns
- zod
- Supabase Auth (email/password)
- localStorage persistence (scoped per signed-in user)

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
   - Build: `npm ci && npm run build`
   - Start: `npm run start`
4. Set Railway environment variables from `.env.example`.
5. Open the generated Railway domain. HTTPS is enabled automatically by Railway.

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

### Important Data Note

This app currently stores planning data in browser localStorage, namespaced by signed-in user id.
That means each browser/device still has separate plan data unless you add database sync.

## Suggested Production Path (Step-by-Step)

1. Deploy on Railway with HTTPS.
2. Configure mandatory Basic Auth env vars.
3. Configure Supabase Auth env vars.
4. Verify sign-up/sign-in works on your Railway domain.
5. Optional next phase: move planner data from localStorage into Supabase tables for cross-device sync.

## Data model

The app stores `AppState` in localStorage under:

- `pto-planner-app-state-v1-{supabase_user_id}`

- `activeYear: number`
- `years: Record<number, YearPlan>`

`YearPlan` includes settings, leave blocks, and key events.

## Notes

- Vacation totals exclude rejected requests.
- Sick leaves are logged and reported, but not deducted from entitlement.
- For single included day ranges, leave units use `min(startFraction, endFraction)`.
