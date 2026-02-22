# PTO Planner (Local-First)

Mobile-friendly PTO planning app built with React + TypeScript + Vite.

## Stack

- React + TypeScript + Vite
- TailwindCSS
- date-fns
- zod
- localStorage persistence (no backend)

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

## Data model

The app stores `AppState` in localStorage under `pto-planner-app-state-v1`.

- `activeYear: number`
- `years: Record<number, YearPlan>`

`YearPlan` includes settings, leave blocks, and key events.

## Notes

- Vacation totals exclude rejected requests.
- Sick leaves are logged and reported, but not deducted from entitlement.
- For single included day ranges, leave units use `min(startFraction, endFraction)`.
