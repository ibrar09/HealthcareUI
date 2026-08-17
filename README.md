# Universal Healthcare Platform — Frontend

React + TypeScript + Vite + Tailwind, implementing the **Clinical Ink** design system.
Structure merges two ideas: **modules stay portal-based** (one owner per folder, no
merge conflicts between developers) while adopting real app infrastructure
(layouts, global store, hooks, constants, providers) for how a production
frontend actually needs to be organized.

👉 **If you're a developer joining this project, read `TEAM_WORKFLOW.md` first.**

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Folder structure

```
public/                     Static files served as-is (favicon, robots.txt)
src/
├── app/
│   ├── App.tsx              Composes providers, mounts the router
│   ├── providers/           AuthProvider, ThemeProvider, QueryProvider
│   └── routes/
│       ├── index.tsx        THE root router — mounts every module under a URL prefix
│       ├── protected-routes.tsx   Auth-gate wrapper
│       └── role-routes.tsx        Role-gate wrapper (<RoleRoute allow={[...]}>)
│
├── assets/                  Images/icons/logos bundled into the build
│
├── layouts/                 Role-specific page shells (wrap shared/AppShell once)
│   ├── AuthLayout.tsx        Split-screen sign-in shell, used by every module's Sign In
│   ├── DoctorLayout.tsx
│   ├── HospitalAdminLayout.tsx
│   └── PatientLayout.tsx     Mobile shell + bottom tab bar
│
├── modules/                 ONE portal per folder, ONE owner each — see TEAM_WORKFLOW.md
│   ├── doctor-portal/        ✅ reference implementation
│   │   ├── pages/
│   │   ├── api/
│   │   ├── components/       Module-local only — see "shared vs local" rule below
│   │   └── routes.tsx
│   ├── hospital-admin/       ✅ second reference implementation
│   ├── laboratory/ · radiology/ · pharmacy/ · nursing-ipd/
│   ├── emergency/ · billing/ · platform-admin/ · patient-app/ · auth/
│
├── shared/                   ⚠️ BOTH devs, PR-reviewed
│   ├── design-system/
│   │   ├── tokens.css         Clinical Ink colors/type — single source of truth
│   │   ├── components/        Button, Card, CardRow, StatusChip, KPICard, Sparkline, RadialGauge, IconBadge
│   │   └── layout/AppShell.tsx
│   ├── lib/api/client.ts      Base mock request helper — swap for real fetch() later
│   └── types/domain.ts        Patient, Doctor, Appointment, etc.
│
├── store/
│   └── authStore.ts          Zustand — current user/role/token
│
├── hooks/
│   ├── useAuth.ts             The only way modules read auth state
│   ├── usePermissions.ts      Role-based UI gating (can(PERMISSIONS.X))
│   └── useDebounce.ts
│
├── constants/
│   ├── roles.ts               Every platform role
│   ├── permissions.ts         Role → permission mapping
│   ├── statuses.ts            Shared status vocabularies (appointment/order/lab result)
│   └── routes.ts              Centralized path strings
│
├── config/
│   └── environment.ts         Reads Vite env vars in one place
│
└── main.tsx
```

## The `shared vs. module-local` rule

Building a piece of UI, ask: **"Would a second module genuinely need this same thing?"**
- No → keep it in `modules/<name>/components/` (see `hospital-admin/components/DonutChart.tsx`)
- Yes, and a second module already needs it → promote it to `shared/design-system/components/` via a small PR

Don't pre-build into `shared/` "just in case" — that's how it becomes a dumping ground nobody trusts.

## Path aliases

`@/*` → `src/*` · `@shared/*` → `src/shared/*` · `@modules/*` → `src/modules/*` · `@app/*` → `src/app/*`

## The mock-to-real-backend swap

Every module's `api/index.ts` calls `mockRequest()` from `@shared/lib/api/client.ts`.
When a backend service goes live: only `client.ts` changes — no module's pages change.
Toggle via `VITE_USE_MOCK_API` in `.env`.

## Auth flow right now

`useAuth()` (from `hooks/`) wraps a Zustand store (`store/authStore.ts`). Sign-in
pages call `signIn(user, token)` then navigate — no persistence yet, no real
backend call yet. `AuthProvider` is a documented placeholder for where session
bootstrapping (reading a stored token on load) gets added once IAM Service exists.

## Build order

See `TEAM_WORKFLOW.md` for the 2-developer module split, and the separate
`Development_Phase_Kickoff_Plan.md` for how this maps to the backend
microservices build order.
