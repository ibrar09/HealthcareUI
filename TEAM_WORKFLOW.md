# Frontend Team Workflow — 2 Developers, 10 Modules

## The core rule

**Each module folder has exactly one owner at a time.** You almost never edit inside a module you don't own. This is what makes parallel work possible without constant merge conflicts.

```
src/
├── shared/              ⚠️  BOTH devs — PR review required, changes affect everyone
├── app/
│   └── router.tsx        ⚠️  BOTH devs — but low-conflict, just 2-line additions per module
└── modules/
    ├── auth/              👤 owner: whoever needs it first (usually shared groundwork)
    ├── doctor-portal/      👤 Dev A
    ├── laboratory/         👤 Dev A
    ├── radiology/          👤 Dev A
    ├── hospital-admin/     👤 Dev B
    ├── pharmacy/           👤 Dev B
    ├── patient-app/        👤 Dev B
    ├── nursing-ipd/        👤 (Phase 2 — assign later)
    ├── emergency/          👤 (Phase 2 — assign later)
    ├── billing/            👤 (Phase 2 — assign later)
    └── platform-admin/     👤 (Phase 2 — assign later)
```

## Why this split (Dev A vs Dev B)

Matches the backend Phase 1 vertical slice dependency order, and groups modules that share a mental model:

- **Dev A — Clinical/diagnostic track:** Doctor Portal → Laboratory → Radiology. All three are "a clinician looking at patient data and creating orders." Deep familiarity with the Encounter/Order/Result pattern carries across all three.
- **Dev B — Operational/consumer track:** Hospital Admin → Pharmacy → Patient App. Admin config screens, dispensing workflow, and the consumer-facing app — a different rhythm (more forms, more lists, more "manage a record" patterns) than Dev A's clinical screens.

If you'd rather split differently (e.g. by screen *type* — one dev does all dashboards, the other all forms — that also works), the folder-ownership rule is what matters, not this specific pairing.

## Daily workflow

1. **Pull `main`, branch per screen or small batch:** `feature/doctor-portal-patient-search`, not one giant `feature/doctor-portal-everything` branch that lives for two weeks.
2. **Work only inside your module folder** (`pages/`, `components/`, `api/`, and your own `routes.tsx`).
3. **Need something from `shared/`?** Two cases:
   - It already exists → just import it, no PR needed for that.
   - It doesn't exist yet (new component, new color, new type) → open a small PR against `shared/` *first*, tag the other dev for review, merge that, *then* build your screen on top of it. Never inline a one-off style or duplicate a type to avoid this step — that's exactly how the design system drifts.
4. **PR your module work independently.** Since you're not touching the same files, these merge fast with minimal review friction — the reviewer is mainly checking "does this match Clinical Ink" not "does this conflict with my code."
5. **Router additions** (`app/router.tsx`) are one line each — add yours, don't touch the other dev's line.

## Adding a new screen — the actual steps

Using Doctor Portal as the reference (already fully built this way):

1. Check `src/shared/design-system/components/` — does `Button`, `Card`, `CardRow`, `StatusChip`, `KPICard`, `Sparkline`, `RadialGauge`, or `IconBadge` cover what this screen needs? Almost always yes.
2. Add any new mock data + a fetch function to `src/modules/<your-module>/api/index.ts`.
3. Build the screen in `src/modules/<your-module>/pages/<section>/YourScreen.tsx`, importing shared components via `@shared/design-system/components`. `<section>` is the module-map section it belongs to (see below) — don't drop new screens flat into `pages/`.
4. Register the route in `src/modules/<your-module>/routes.tsx` — just add one line to the array.
5. If this is your module's *first* screen, add the module's mount point to `src/app/router.tsx` (2-line PR, tag the other dev since it's a shared file).

### Section subfolders inside a module

Once a module has more than a handful of screens, `pages/` and `components/`
are split into subfolders matching that module's information architecture
(for Hospital Admin, that's `HOSPITAL_ADMIN_MODULE_MAP.md`'s top-level
sections — `dashboard/`, `patients/`, `facilities/`, `staff/`, and so on).

- A page goes in `pages/<section>/`, matching the module-map section it
  implements (e.g. `pages/patients/PatientDetail.tsx`).
- A component goes in `components/<section>/` if only that section uses it
  (e.g. `components/patients/PatientRow.tsx`). If **two or more sections**
  within the same module use it (like `DonutChart` or `FormPrimitives` in
  Hospital Admin), it stays at `components/` root — same "promote when a
  second consumer needs it" rule as shared/module-local, just one level down.
- Imports use the full aliased path (`@modules/<module>/components/<section>/X`),
  never a relative `../` path, so moving a file between sections later is a
  path-string edit, not a restructuring exercise.
- A module's `sign-in` page stays flat at `pages/` root — it's the auth gate,
  not part of the module's own screen tree.

## When you actually will touch the same file

- `src/shared/design-system/tokens.css` — if a new module needs a signature color not yet defined (matches the module accent colors already in the Stitch prompts — Teal for Lab, Purple for Radiology, Amber-Gold for Pharmacy, etc.)
- `src/shared/types/domain.ts` — if a screen needs a new field on `Patient`, `Appointment`, etc.
- `src/app/router.tsx` — only the 2-line module mount, not route contents

Treat these three files as "ask before you edit, not after" — a quick Slack message before the PR, not a surprise in review.

## What NOT to do

- Don't fork `AppShell` per module ("I'll just copy it and tweak it for Pharmacy") — extend its props in a shared PR instead. A forked shell is how the 9 portals stop looking like one product.
- Don't put a component only your module uses into `shared/` "just in case." Keep it in your module's `components/` folder until a second module genuinely needs it — then promote it.
- Don't build ahead into another dev's module because you're blocked — pull the next screen in *your* module's queue instead, or work on a `shared/` improvement both of you benefit from.

## Hospital Admin's full screen list

`HOSPITAL_ADMIN_MODULE_MAP.md` is the canonical information architecture for
everything under `hospital-admin/` — the full section/screen tree, which
sections are full builds vs. admin-oversight-only (Lab/Radiology/Pharmacy/
Nursing/OT/Emergency/OPD have their own dedicated clinical portals elsewhere
in this table), and the near-term build queue. Check it before adding a new
Hospital Admin screen.

## Suggested build order (matches backend Phase 1)

| Order | Dev A | Dev B |
|---|---|---|
| 1 | Doctor Sign In, Dashboard ✅ *(done — reference implementation)* | Hospital Admin Sign In, Executive Dashboard |
| 2 | Patient Search, Patient Chart Overview | Facility List, Department Config, Staff Directory |
| 3 | Encounter Workspace, Diagnosis Entry | Patient Admin List, MPI Duplicate Review Queue |
| 4 | Lab Order Form, Medication Order Form | Patient App: Splash → Identity Verification (onboarding) |
| 5 | Laboratory: Sign In, Specimen Worklist, Result Entry | Patient App: Home Dashboard, Appointment booking flow |
| 6 | Laboratory: Result Validation | Pharmacy: Sign In, Prescription Queue, Validation, Dispensing |

By the end of this, both tracks meet in the middle at the same Phase 1 backend milestone — the full patient journey demo.
