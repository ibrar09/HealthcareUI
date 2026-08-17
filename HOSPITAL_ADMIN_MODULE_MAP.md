# Hospital Admin Portal — Module Map

This is the canonical information architecture for the Hospital Admin module
(`src/modules/hospital-admin/`). Every new screen in this module should be
placed against this tree, not invented ad hoc. Update the status marker when a
screen ships.

## Scope rule — decided 2026-08-15

Several sections below (OPD, Emergency, IPD, Clinical/EMR, Laboratory,
Radiology, Pharmacy, Nursing, Operation Theatre) overlap with portals already
planned separately in `TEAM_WORKFLOW.md` (doctor-portal, laboratory,
radiology, pharmacy, nursing-ipd, emergency) — those are the deep clinical
workspaces for the people who actually do that work (a lab tech entering a
result, a nurse charting a medication administration, a surgeon's OT record).

**Hospital Admin's version of those sections is oversight/management only** —
dashboards, queues, volume, turnaround, status, configuration. Never the
actual clinical data-entry screen. Marked **[oversight]** below. Sections with
no dedicated portal elsewhere are **[full]** — Hospital Admin owns the whole
thing.

## Status legend

✅ built · 🚧 partially built (needs the fix-pass treatment) · ⬜ not started

## Folder layout

`pages/` and `components/` are split into subfolders matching this tree's
top-level sections (`dashboard/`, `patients/`, `facilities/`, `staff/`, ...) —
see `TEAM_WORKFLOW.md`'s "Section subfolders inside a module". A component
goes in its section's subfolder unless two or more sections use it (then it
stays at `components/` root, like `DonutChart` and `FormPrimitives`). The
sign-in page stays flat at `pages/` root.

## Reconciling what's already built

| Existing page | Maps to |
|---|---|
| `pages/HospitalAdminSignIn.tsx` | — |
| `pages/dashboard/HospitalAdminDashboard.tsx` | Dashboard |
| `pages/dashboard/ReceptionDashboard.tsx` | OPD Dashboard-adjacent (reception's own view, kept separate — not in this tree, still valid) |
| `pages/patients/PatientAdministration.tsx` + `PatientDetail.tsx` | Patient Management → Patient Directory, Patient Registration, Patient Identity/UHID (identifiers card). Re-audited 2026-08-15 against §5-7 line by line: added `managingOrganization` (facility link, bold-required in §5), identifier `period`, emergency contact relationship/address, marital status, communication preference, preferred name; search now covers phone/DOB/email per §7, results row shows DOB/phone/organization per §7. |
| `pages/patients/MpiDuplicateReview.tsx` + `MpiPairReview.tsx` | Patient Management → Duplicate Patients, Patient Merge |
| `pages/facilities/FacilityList.tsx` (Locations/Departments/Services/Wards & Beds tabs) | Facilities → Buildings, Floors, Wards, Rooms, Beds; Administration → Departments/Services/Locations *(same data, don't duplicate — see note below)* |
| `pages/staff/StaffDirectory.tsx` + `StaffDetail.tsx` | Staff & Workforce → Staff, Departments *(cross-ref)*, Shifts, Schedules. Doctors/Nurses are just role-filtered views of the same directory (filter already exists) |

**Note on overlap:** "Administration → Departments / Services / Locations"
in the tree below is the same data `FacilityList.tsx` already manages. Don't
build a second CRUD screen for it — `Administration` should deep-link to the
existing Facilities screen, or Facilities/Administration get merged into one
nav group later. `Facilities → Buildings/Floors/Wards/Rooms/Beds/Equipment` is
genuinely new — that's the physical-space hierarchy from
`HMS_DOMAIN_STANDARDS.md` §12 (`Hospital → Building → Floor → Ward → Room →
Bed`), which nothing built so far models yet, and which Bed Management will
need.

## The tree

```
HOSPITAL ADMIN PORTAL
│
├── Dashboard                                                ✅
│
├── Patient Management                                    [full]
│   ├── Patient Registration                                 ✅ (drawer on Patient Directory)
│   ├── Patient Search                                        🚧 (search bar exists, needs dedicated advanced-search screen)
│   ├── Patient Directory                                     ✅
│   ├── Patient Identity / UHID                                ✅ (Identifiers card)
│   ├── Duplicate Patients                                    ✅ (MpiDuplicateReview — queue, match confidence, matched-field chips)
│   └── Patient Merge                                          ✅ (MpiPairReview — side-by-side compare, pick canonical record, merge/dismiss)
│
├── Appointments                                            [full]
│   ├── Step 1 (Core UI) ✅ — Dashboard (today's status breakdown, doctor/dept
│   │     utilization, waiting/available/pending KPIs), Calendar (day view per
│   │     doctor, computed slot grid — never pre-stored, generated from Schedule
│   │     + Appointments), Appointments list (search/filter), Appointment
│   │     Details (read-only + View Patient, same pattern as Bed Details before
│   │     its Phase 2), Create Appointment (patient → facility → department →
│   │     doctor → type → date → slot → confirm, with double-booking guard).
│   │     Appointment Types are a configurable lookup table (spec §6), not
│   │     hardcoded. See `pages/appointments/Appointments.tsx`.
│   ├── Step 2 (Scheduling) ✅ — new "Schedules" tab: Add/Edit Doctor Schedule
│   │     (working days/hours/slot duration/facility/department), Doctor Leave
│   │     (whole-day unavailability, overrides working days), Blocked Time
│   │     (a window within a working day — surgery, meeting). Both feed directly
│   │     into `getDaySchedule()`, so Calendar, Create Appointment, and
│   │     Reschedule all correctly reflect leave/blocks the moment they're
│   │     added — verified end-to-end, not just that the config screen saves.
│   ├── Step 3 (Patient Operations) ✅ — Check-In, Queue (new tab, start/complete
│   │     consultation), Reschedule (new slot for the same doctor, original kept
│   │     and linked — never just edited in place), Cancellation (reason
│   │     required), No-Show marking. Appointment Details' action buttons are now
│   │     real, contextual per status — same pattern as Bed Details' Phase 2.
│   │     Waitlist deferred — matching patients to freed slots is a distinct,
│   │     more complex feature worth its own pass.
│   ├── Step 4 (Integration) ⬜ — Encounter, Billing, Insurance, Referral,
│   │     Notifications, Telemedicine — each depends on a module that doesn't
│   │     exist yet.
│   └── Step 5 (Administration) ⬜ — Booking/Cancellation/Reminder rules,
│         Capacity, Analytics, Audit/History.
│
├── OPD                                                  [oversight]
│   └── OPD Dashboard, Waiting Queue, Encounters, Consultation, Clinical Notes, Diagnoses, Prescriptions — admin sees volume/queue/status only  ⬜
│
├── Emergency                                            [full — MVP scope]
│   └── Full spec: `EMERGENCY_MODULE_SPEC.md` (27 sections, saved verbatim) —
│         MVP subset COMPLETE ✅ (2026-08-17), upgraded from the earlier
│         [oversight]-only placeholder the same way Radiology/OT/Pharmacy/
│         Inventory were, since the user's own spec asks for the full
│         clinical workflow. Per the user's own explicit "don't build every
│         screen immediately, start with these 10" instruction — a narrower
│         pass than OT/Pharmacy/Inventory's "do it all." Dashboard, Patient
│         Queue (+ patient detail drawer, spec's separate "Patient Details"
│         screen folded in per this project's drawer-not-tab pattern),
│         Triage (configurable priority lookup, never hardcoded to one
│         country's system), Treatment/Doctor Workspace (History/
│         Examination/Assessment/Plan), Orders (unified Laboratory/
│         Radiology/Medication/Procedure/Consultation/Monitoring tracker —
│         lab-type orders genuinely create a real Laboratory ServiceRequest),
│         Lab & Radiology Results (reads the real Laboratory/Radiology
│         modules, never a second results store), Observation, Disposition
│         (Discharge/Admission/Transfer combined per the user's own MVP
│         bundling — Admission genuinely creates a real Bed Management
│         request), Reports, Audit (kept even though not in the MVP list,
│         standing per-module discipline) — all ✅. Deferred past this MVP
│         pass: Treatment Areas/Bays as dedicated screens, standalone
│         Medication Administration/Procedures/Consultations screens, Staff
│         Assignment, Equipment, a dedicated Alerts tab, and Search/Filters
│         as its own screen
│
├── IPD / Inpatient                                       [full]
│   ├── Bed Management — Phase 1 ✅ + Phase 2 ✅ + Phase 3 ✅ (see `pages/beds/BedManagement.tsx` and
│   │     `components/beds/`). Full spec: 29 sections, built in 4 phases per the spec's own §29.
│   │     Phase 1 (Dashboard, Bed List, Bed Map, Wards, Rooms) — read-only foundation. Bed Types
│   │     are a configurable lookup table, not hardcoded, per spec §5.
│   │     Phase 2 (Requests + Cleaning tabs, and every Bed Details action): Assign Bed, Reserve Bed,
│   │     Confirm Admission, Transfer Patient, Release/Discharge, Report/Complete Maintenance,
│   │     Block/Unblock, Return to Service, Bed Request queue (assign/reject/create), Cleaning queue.
│   │     Lifecycle rule enforced in the data layer, not just the UI: occupied never jumps straight
│   │     to available — it always passes through `cleaning` first (spec §12).
│   │     Phase 3 (Isolation, Analytics, History, Audit — spec §19-25): `BedAuditEvent` log recorded
│   │     by every Phase 2 mutation (`recordBedAudit()` in `api/index.ts`) — foundational for both
│   │     History and Audit. New "Isolation" tab (`IsolationPanel.tsx`): active precautions +
│   │     isolation-capable inventory, plus Set/Clear Isolation actions on occupied beds (isolation
│   │     stays a bed *property*, not a status — a bed can be occupied AND under precaution at once).
│   │     New "Analytics" tab (`OccupancyAnalytics.tsx`): full status breakdown by ward and by bed
│   │     type, beyond the Dashboard's headline numbers — no fabricated timing metrics, since the
│   │     mock only has date-level `lastUpdated`, not real timestamps. New "History" section inside
│   │     `BedDetailsDrawer` (per-bed event trail) and new "Audit" tab (`BedAuditLog.tsx`,
│   │     hospital-wide, filterable by action). `performedBy` threaded through from `currentUserName`
│   │     at every call site so audit entries show a real actor, not a placeholder.
│   │     Phase 4 ✅ (spec §26-29) — new "Configuration" tab: Bed Types CRUD (`BedTypeConfigPanel.tsx`,
│   │     with an `active` flag — deactivate rather than delete, since existing beds may reference a
│   │     type), Room CRUD (`RoomConfigPanel.tsx`/`RoomFormDrawer.tsx` — lives here, not Facilities,
│   │     since Facilities' "Wards & Beds" tab is deliberately read-only inventory), and Bed CRUD
│   │     (`BedFormDrawer.tsx`: add a new physical bed to a room; `DecommissionBedDrawer.tsx`: the
│   │     first mutation that actually *sets* `out-of-service` — previously that status existed only
│   │     as a seed value with a "Return to Service" way out, no way in). All three feed the same
│   │     `recordBedAudit()` trail from Phase 3.
│   ├── Admissions · Patients · Ward Management · Transfers · Discharge · Discharge Summary  ⬜
│
├── Clinical / EMR                                       [oversight]
│   └── Chart access is admin-level audit/oversight, not a clinician workspace                                ⬜
│
├── Laboratory                                           [oversight]
│   └── Lab Dashboard, Orders (volume/full ServiceRequest detail), Critical Results (acknowledge-only),
│         Test Catalog (configurable LOINC-style lookup), Analytics (TAT/rejection/critical rate),
│         Audit — no result entry here                                                                ✅
│
├── Radiology                                            [oversight]
│   └── Full spec: `RADIOLOGY_MODULE_SPEC.md` (42 sections, saved verbatim) — module
│         COMPLETE ✅ (2026-08-16). Dashboard, Orders/Order Details/Scheduling/
│         Worklist/Studies/Study Details/Reports/Report Details/Critical Findings,
│         Modalities, Rooms, Radiologists, Technologists, Procedures (+ Protocols
│         as a second section), Equipment (+ Maintenance dashboard combined),
│         Integrations (PACS/DICOM/FHIR/HL7 status combined), Billing (+ Insurance
│         queue combined), Analytics, Audit, Settings — all ✅
│
├── Pharmacy                                              [full]
│   └── Full spec: `PHARMACY_MODULE_SPEC.md` (39 sections, saved verbatim) — module
│         COMPLETE ✅ (2026-08-17), built in one pass per the user's own explicit
│         instruction ("must complete also this not in phase just do all"),
│         superseding the earlier "no dispensing screen" placeholder note.
│         Dashboard, Prescriptions (full work queue + Verification warnings),
│         Dispensing, Patients (Pharmacy Profile — Prescribed→Dispensed only, never
│         Administered), Medication Catalog, Inventory, Batches & Expiry, Stock
│         Movements, Transfers, Procurement (Purchase Orders + Goods Receiving +
│         Suppliers), Returns, Recalls, Controlled Medicines (+ Register), Refills,
│         Inpatient Medication, Insurance, Reports, Audit, Settings — all ✅.
│         Verification warnings (allergy/duplicate-therapy/stock) are structured
│         flags, never a clinical-decision-support engine
│
├── Nursing                                              [oversight]
│   └── Nursing Dashboard, assignment/coverage view — no charting UI here                                     ⬜
│
├── Operation Theatre                                    [oversight]
│   └── Full spec: `OT_MODULE_SPEC.md` (45 sections, saved verbatim) — module
│         COMPLETE ✅ (2026-08-16), all 4 phases. Phase 1 (Core UI): OT Dashboard,
│         Surgery Schedule, Surgical Cases, Surgery Case Details, Surgery Request,
│         OT Rooms. Phase 2 (Clinical workflow): Pre-Op, Anesthesia, Intra-Op,
│         Post-Op/Recovery. Phase 3 (Supporting operations): Surgical Team,
│         Instruments, Consumables, Implants, Specimens, Equipment. Phase 4
│         (Management): Emergency OT, Cancellations, Delays, Reports, OT Settings,
│         Audit. Every field captured is structured/short-form, never a freeform
│         clinical-narrative editor; Consumables/Implants/Specimens stay
│         registries + traceability logs, never a second Pharmacy/Inventory system
│
├── Billing & Revenue                                      [full]
│   ├── Full spec: `BILLING_REVENUE_MODULE_SPEC.md` (60 sections, saved verbatim), built in 6
│   │     phases per the spec's own §61. Lives here in hospital-admin, not the separate unbuilt
│   │     `src/modules/billing/` stub (that folder predates the hospital-admin scope rule and
│   │     stays a placeholder for a possible future standalone billing-officer portal).
│   │     Phase 1 (Core Billing) ✅ — see `pages/billing/BillingManagement.tsx` and
│   │     `components/billing/`. Dashboard (revenue/receivables/aging — deliberately omits fake
│   │     Claims KPIs since Claims don't exist until Phase 3), Patient Financial Account (auto-
│   │     provisioned per patient, aggregates balance/insurance-pending/responsibility across
│   │     invoices), Charges (captured automatically from completed appointments + occupied-bed
│   │     daily running charges, plus manual Capture Charge for one-offs), Charge Review (real
│   │     validation checklist only — Patient/Service/Provider/Date/Quantity/Price; no fake
│   │     Coverage/Authorization checkmarks since Eligibility doesn't exist yet), Invoices (bills
│   │     a patient's validated charges, discount + billing-staff-estimated insurance amount, not
│   │     an adjudicated one), Invoice Details (line items, Record Payment, Cancel Invoice — charges
│   │     revert to validated on cancel), Payments (partial payment supported, configurable
│   │     methods), Receipts (a view of a successful Payment, not a separately stored entity).
│   │     Phase 2 (Insurance) ✅ — Payers tab (payer registry + nested Insurance Plans), Coverage +
│   │     Eligibility folded into the Patient Account drawer (patient-scoped per spec §11-12, not
│   │     standalone lists — `runEligibilityCheck()` is deterministic from the coverage's own
│   │     validity window, no fake payer connection), Authorizations tab (request/approve/reject +
│   │     Pending/Approved/Rejected/Expired dashboard counts), Contracts tab (payer rates + a
│   │     cross-payer Service Pricing reference table, spec §8-9/45-46). Real integration back into
│   │     Phase 1: `estimateInsuranceAmount()` pre-fills Create Invoice's insurance estimate from
│   │     the patient's active coverage's active contract rate — a genuine computed suggestion,
│   │     still editable, never presented as insurer-confirmed adjudication.
│   │     Phase 3 (Claims) ✅ — Claims tab (Claims Dashboard counts folded into the same tab as the
│   │     Claim List, spec §23-24), Claim Details with a live Claim Validation checklist (spec §26
│   │     — 6 real checks: Patient/Coverage/Provider/Service/Coding/Authorization; the Authorization
│   │     check actually cross-references Phase 2's eligibility-required-services list against
│   │     approved PreAuthorizations, no fake pass), Rejected vs Denied kept genuinely separate per
│   │     spec §27 (Rejected → Resubmit via the Claims tab; Denied → its own Denials tab with the
│   │     9-stage workflow from spec §28), Claim History timeline. Real integration: claims are
│   │     created from an Invoice's insurance amount (spec §23's own "Bill → Claim" diagram) via a
│   │     "Create Claim" button on Invoice Details once `insuranceAmount > 0`; `recordClaimPayment()`
│   │     applies the payer's payment as a real "insurance" Payment against the underlying Invoice
│   │     (same code path a manual payment uses), so the Patient Financial Account and Dashboard
│   │     never drift from a claim-only number. Simplification stated in code: spec §24's dashboard
│   │     mockup shows "Pending" as a count distinct from "Submitted" with no defined difference —
│   │     modeled as 7 real states (draft/ready/submitted/accepted/rejected/denied/paid), no
│   │     synthetic "pending" bucket.
│   │     Phase 4 (Finance) ✅ — Accounts Receivable + Aging share one ledger view (spec §31's own
│   │     column list already IS the aging table, so no separate near-duplicate screen), with
│   │     category breakdown (Insurance/Patient/Corporate/Government AR) and Assign Collector.
│   │     Refunds (spec §20: Request → Approve → Process, the only step that actually reverses
│   │     `invoice.amountPaid`). Credit Notes / Debit Adjustments (spec §21 — never edits the
│   │     original invoice's stored totals; netted in at read time, which is what "preserves
│   │     financial history" means in practice) and Write-Offs (spec §51 — request/approval, not
│   │     a silent `Outstanding = 0`), combined into one Adjustments tab, both created from Invoice
│   │     Details. Payment Reconciliation (spec §32 — create a payer payment batch, match against
│   │     that payer's accepted claims, allocate; `allocateToBatch()` reuses `recordClaimPayment()`
│   │     so a batch-allocated payment and a direct claim payment can never drift apart). This
│   │     closes out Billing & Revenue's full 60-section, 6-phase spec (§61) — Phases 1-4 done;
│   │     Phase 5 (Analytics) and Phase 6 (Administration) remain, lower priority per the spec's
│   │     own ordering.
│   │     Phase 5 (Analytics) ⬜ · Phase 6 (Administration: Billing Configuration, Payment
│   │     Methods, Approval Rules, Billing Roles, Audit — Service Catalog/Contracts done in Phase 2) ⬜
│
├── Insurance                                              [full]
│   ├── Payers · Eligibility · Pre-Authorization · Claims · Claim Responses · Denials · Appeals                ⬜
│
├── Inventory & Procurement                                 [full]
│   └── Full spec: `INVENTORY_MODULE_SPEC.md` (49 sections, saved verbatim) — module
│         COMPLETE ✅ (2026-08-17), built in one pass continuing the same "not in
│         phase just do all" instruction that shipped OT and Pharmacy. Dashboard,
│         Items (Item Master + Categories), Stock Overview (On Hand/Available/
│         Reserved/Damaged/Quarantined/In Transit/On Order, computed live), Batches
│         & Expiry (FEFO), Warehouses & Storage Locations, Requisitions (Department
│         → Approval → Picking → Issue → Received, doubles as the Stock Issues log),
│         Stock Returns, Stock Transfers, Procurement (Purchase Requests + Purchase
│         Orders + Goods Receiving + Suppliers), Inventory Counts (+ Variance →
│         real Adjustment rows on approval), Adjustments (never silent — reason/
│         user/approval/audit always required, 20+ unit changes route to a second
│         approver), Reservations, Recalls & Quarantine (initiating one immediately
│         quarantines every affected batch and traces prior issuance/implant usage),
│         Disposal, Asset & Implant Tracking (serial-tracked equipment + patient/
│         procedure/surgeon traceability for implants), Stock Movements ledger,
│         Alerts (stock/procurement/operational, computed live), Reports & Analytics
│         (turnover/slow-moving/dead-stock/expiry-loss/supplier-performance),
│         Audit, Settings — all ✅. Domain separation maintained per the spec's own
│         instruction: general hospital item/supply system only — never re-models
│         Pharmacy's medication/batch/prescription domain or OT's own per-case
│         Consumables/Implants usage tabs, both already built independently
│
├── Facilities                                              [full]
│   ├── Buildings · Floors · Wards · Rooms · Beds            ✅ (Facility = Building; Floor→Ward→Room→Bed chain modeled, "Wards & Beds" tab on FacilityList — read-only bed inventory, Add/Manage Ward)
│   ├── Overview                                             ✅ (real KPIs + Facility Status, done 2026-08-17 — see build-order #37)
│   └── Equipment · Maintenance · Incidents                  ✅ (infrastructure equipment only — clinical equipment stays owned by Radiology/OT/Laboratory; one real Work Order lifecycle, not a separate Request system; done 2026-08-17)
│
├── Staff & Workforce                                       [full]
│   ├── Doctors · Nurses · Staff                              ✅ (StaffDirectory, role-filtered)
│   ├── Departments                                            ✅ (cross-ref to Facilities)
│   ├── Roles · Credentials                                    ⬜
│   ├── Shifts · Schedules                                     ✅ (Roster)
│
├── Documents                                               [full]
│   └── Medical Documents · Discharge Summaries · Reports · Consent Documents · Templates                      ⬜
│
├── Alerts & Notifications                                  [full] ✅
│   └── Full spec: `ALERTS_NOTIFICATIONS_MODULE_SPEC.md` (39 sections,
│         saved verbatim) — full build COMPLETE ✅ (2026-08-17). Dashboard ·
│         Alert Center · Critical Alerts · My Alerts · Notification Center ·
│         Notification History · Templates (multi-language) · Alert Rules ·
│         Notification Rules · Escalation Policies · Channels (reuses
│         Configuration's `getCommunicationProviders()`, not duplicated) ·
│         User Preferences + Quiet Hours · Delivery Logs · Failed
│         Notifications (Push→SMS→Email retry) · Reports. Critical Lab/
│         Imaging alerts route acknowledge through to Laboratory's/
│         Radiology's own real acknowledge functions; Dashboard live
│         signals pull real counts from Inventory/Laboratory/Radiology/
│         Security. Internal Messages (staff-to-staff) was not in the
│         spec's own §38 page list — not built, stays backlog.
│
├── Reports & Analytics                                     [full]
│   └── Full spec: `REPORTS_MODULE_SPEC.md` (65 sections, saved verbatim) —
│         MVP subset COMPLETE ✅ (2026-08-17), the user's own explicit
│         ~13-report subset (Overview/Census/Patient Volume/OPD/Emergency/
│         Admissions & Discharges/Bed Occupancy/Laboratory/Radiology/
│         Pharmacy/OT-Surgery/Billing/Audit), deliberately deferring Report
│         Builder, Scheduled Reports, Export Center, Integration/Consent/
│         Notification reports, drill-down, and multi-hospital scoping.
│         Built as a thin READ-ONLY aggregation layer (`api/reports.ts`)
│         per the spec's own "Operational Systems -> Data -> Reporting
│         Layer -> Reports" architecture — Emergency/Bed Occupancy/
│         Laboratory/Radiology/Pharmacy/OT reuse each module's own real
│         dashboard/analytics component and data directly, never a
│         duplicate reporting system
│
├── Quality & Safety                                        [full]
│   └── Incidents · Clinical Quality · Infection Control · Patient Safety · Quality Indicators                 ⬜
│
├── Integrations                                            [full]
│   └── FHIR · HL7 · DICOM · LIS · PACS · External HMS · Devices                                               ⬜
│
├── Security & Audit                                        [full]
│   └── Full spec: `AUDIT_MODULE_SPEC.md` (48 sections, saved verbatim) —
│         COMPLETE ✅ (2026-08-17), the user's own explicit "full build, all
│         48 sections" choice. 15 tabs: Dashboard, All Events (search +
│         filters + saved queries + Filter Builder folded into the same
│         search), Event Details drawer (Actor/Patient Context/Resource/
│         Before-After changes/Where From/Source/Related Events), Patient
│         Access, Login Activity (+ Failed Login Analysis), Security (+
│         Permission Audit combined), Data Exports (Print/Download/Export
│         combined), Consent Activity, Emergency/Break-Glass Access,
│         Integration Audit (FHIR/HL7/DICOM), System Events (+ the real
│         per-module audit log rollup), Investigations (+ detail drawer),
│         Alerts (computed live from real access patterns), Reports/Export
│         Center, Retention + Integrity (combined). Additive to every other
│         module's own scoped audit log (Beds/Laboratory/Radiology/
│         Pharmacy/OT/Inventory/Emergency all keep `recordXAudit` + their
│         own Audit tab unchanged) — this is the hospital-wide trail,
│         aggregating those real logs (System Events tab) alongside curated
│         event streams for concepts nothing else tracks (Authentication,
│         Security, Export/Print/Download, Consent, Break-glass). Users/
│         Roles/Permissions administration (account/role CRUD, distinct
│         from tracking permission *changes*) stays out of scope — this
│         spec is about event auditing, not identity management
│
└── Configuration                                            [full] ✅
    └── Dashboard · Organization (Hospital profile + real structure tree) ·
        General Settings · Localization (4 languages, RTL/LTR) · Users &
        Access (13 roles × 16 permissions) · Patient (MRN format + live
        preview) · Appointment (scheduling rules) · Clinical Settings*
        (link-outs to each module's own real Settings tab, + nursing
        shifts/ratios + specialty catalog) · Financial (Billing + Insurance) ·
        Notifications + Communication providers · Interoperability
        (HL7/FHIR/Mirth/API clients/Webhooks) · Security · Audit Settings
        (what gets audited, not the log — that's the separate Security &
        Audit module) · Retention & Backup · Documents & Consent (type/
        template config) · Master Data (countries/currencies/ICD-11/SNOMED
        CT/LOINC/RxNorm/DICOM/UCUM) + scope-resolution demo · Workflow &
        Approvals + Queues · Numbering (9 entity formats) & Feature Flags ·
        Maintenance mode/Environment metadata · History (+ Draft→Submitted→
        Reviewed→Approved→Published change-request workflow for critical
        keys) · Export/Import (secrets always masked references, never
        real values)
        (*Departments/Rooms/Beds/Doctor/Nursing/Lab/Radiology/Pharmacy/
        Emergency/OT settings = same data as their owning modules, don't
        rebuild — this module link-outs to them)
```

## Build order (near-term, iterative — not a batch commitment)

We build and review one screen at a time, same as every module so far. Rough
near-term queue, picking up the Patient Management thread already in
progress:

1. ~~MPI — Duplicate Patients + Patient Merge~~ ✅ done 2026-08-15.
2. ~~Facilities → Building/Floor/Ward/Room/Bed chain~~ ✅ done 2026-08-15 —
   `Floor`/`Ward`/`Room`/`Bed` types + mock data in `api/index.ts`, "Wards &
   Beds" tab on `FacilityList.tsx` (read-only bed-status grid, Add/Manage
   Ward). Deliberately read-only at the bed level — admit/transfer/discharge
   actions belong to Bed Management, not Facilities.
3. ~~Bed Management Phase 1 (Foundation)~~ ✅ done 2026-08-15 — Dashboard
   (status breakdown, occupancy trend, department/ward breakdowns, expected
   discharges today), Bed List (search + status/ward/bed-type filters), Bed
   Map (visual ward → room → bed tiles), Wards tab (per-ward status
   breakdown + occupancy %), Rooms tab (capacity/occupancy/gender/isolation).
   Bed Details drawer is read-only by design — no admit/transfer/discharge
   actions yet, since those are Phase 2.
4. ~~Bed Management Phase 2 (Operations)~~ ✅ done 2026-08-15 — Bed Assignment,
   Reserve/Confirm Admission, Transfer, Release (discharge → cleaning →
   available, never a direct jump), Maintenance report/complete, Block/
   Unblock, Bed Request queue (create/assign/reject) on a new "Requests"
   tab, Cleaning queue on a new "Cleaning" tab. Every `BedDetailsDrawer`
   action button is now real, wired to `api/index.ts` mutations.
5. ~~Appointments Step 1 (Core UI)~~ ✅ done 2026-08-15 — Dashboard, Calendar
   (day view, computed slots), Appointments list, Appointment Details
   (read-only + View Patient), Create Appointment (full patient → facility →
   department → doctor → type → date → slot wizard, double-booking guarded).
6. ~~Appointments Step 3 (Patient Operations)~~ ✅ done 2026-08-15 — Check-In,
   Queue tab (start/complete consultation), Reschedule (slot picker, keeps
   original + link), Cancellation (reason required), No-Show. Caught and
   fixed a real race condition along the way: refreshing the selected
   appointment's data at the same time as closing its drawer could reopen it
   with stale data — split into `refreshLists()` (safe to always call) vs.
   `refreshSelected()` (only when intentionally keeping the drawer open).
7. ~~Appointments Step 2 (Doctor Schedule config, Blocked Time, Doctor
   Leave)~~ ✅ done 2026-08-15 — see `pages/appointments/Appointments.tsx`'s
   "Schedules" tab. This closes out Appointments' core loop (Steps 1-3 all
   done); Step 4 (Encounter/Billing/Insurance/Referral/Notifications/
   Telemedicine integration) and Step 5 (booking/cancellation/reminder
   rules, capacity, analytics, audit) both depend on modules that don't
   exist yet, so they wait.
8. ~~Bed Management Phase 3 (Isolation, Occupancy Analytics, Bed History,
   Audit)~~ ✅ done 2026-08-15 — `BedAuditEvent` log + `recordBedAudit()`
   retrofitted into all Phase 2 mutations; new Isolation tab (active
   precautions + isolation-capable inventory, Set/Clear Isolation actions);
   new Analytics tab (ward/bed-type breakdowns); History section in Bed
   Details; new hospital-wide, filterable Audit tab.
9. ~~Bed Management Phase 4 (Configuration)~~ ✅ done 2026-08-15 — new
   "Configuration" tab: Bed Types CRUD (add/edit/deactivate — lookup table,
   never hardcoded, per spec §5), Room CRUD (add/edit — genuinely new, not
   duplicating Facilities' read-only "Wards & Beds" tab), Bed CRUD (add a
   physical bed to a room; Decommission, the first real path to
   `out-of-service`, which previously only existed as a seed value).
   This closes out Bed Management's full 29-section spec across all 4
   phases.
10. ~~Billing & Revenue Phase 1 (Core Billing)~~ ✅ done 2026-08-16 — full
    60-section spec saved as `BILLING_REVENUE_MODULE_SPEC.md`, built in 6
    phases per the spec's own §61. Dashboard, Patient Financial Account,
    Charges (auto-generated from completed appointments + occupied-bed daily
    running charges, matching spec §6's "clinical systems generate the
    charge" pattern — plus manual Capture Charge for one-offs), Charge
    Review (real validation checklist only — no fake Coverage/Authorization
    checks since Eligibility doesn't exist until Phase 2), Invoices/Invoice
    Details (bills validated charges, discount + billing-staff-estimated
    insurance amount — never a fabricated adjudicated figure), Payments
    (partial payment supported), Receipts (a view of a successful Payment,
    not a separately stored entity). Dashboard KPIs deliberately omit
    Claims/AR figures the spec's own mockup shows, since Claims (Phase 3)
    and AR (Phase 4) don't exist yet — no decorative/fake numbers. Caught
    and fixed the same refreshLists()/refreshSelected() race-condition class
    as Appointments: `CancelInvoiceDrawer`'s onComplete cleared the selected
    invoice id and called a combined refresh in the same tick, which would
    have refetched the (now cancelled) invoice via a stale closure and
    reopened the drawer.
11. ~~Billing & Revenue Phase 2 (Insurance)~~ ✅ done 2026-08-16 — Payers tab
    (payer registry: insurance company/government/employer-corporate/TPA,
    each with nested Insurance Plans), Coverage + Eligibility added into the
    Patient Account drawer rather than standalone lists (patient-scoped per
    spec §11-12 — `runEligibilityCheck()` is deterministic from the
    coverage's own validity window since there's no real payer connection),
    Authorizations tab (request/approve/reject, Pending/Approved/Rejected/
    Expired dashboard counts per spec §13), Contracts tab (payer rates +
    a cross-payer Service Pricing reference, spec §8-9/45-46). Real
    integration back into Phase 1: `estimateInsuranceAmount()` now pre-fills
    Create Invoice's insurance estimate from the patient's active coverage's
    contract rate — computed from real configured data, still editable,
    never presented as an insurer-confirmed adjudication.
12. ~~Billing & Revenue Phase 3 (Claims)~~ ✅ done 2026-08-16 — Claims tab
    (dashboard counts + list + filter), Claim Details with a live 6-check
    Claim Validation (spec §26 — the Authorization check genuinely
    cross-references Phase 2 eligibility/preauthorization data, not a fake
    pass), Rejected → Resubmit vs. Denied → its own 9-stage Denials
    workflow kept properly separate per spec §27-28, Claim History
    timeline. "Create Claim" wired onto Invoice Details once an invoice has
    an insurance amount; `recordClaimPayment()` applies the payer's payment
    as a real Payment against the underlying Invoice so nothing drifts out
    of sync with the Patient Financial Account.
13. ~~Billing & Revenue Phase 4 (Finance)~~ ✅ done 2026-08-16 — Accounts
    Receivable + Aging (one shared ledger view, category breakdown, Assign
    Collector), Refunds (Request → Approve → Process, reverses
    `amountPaid` only on Process), Adjustments tab (Credit Notes/Debit
    Adjustments + Write-Off approval workflow, both triggered from Invoice
    Details, both netted into balance at read time rather than editing the
    original invoice), Reconciliation (payer payment batches matched and
    allocated against accepted claims, sharing `recordClaimPayment()` with
    the direct per-claim payment path). This closes out Billing & Revenue's
    full 60-section, 6-phase spec through Phase 4; Phase 5 (Analytics) and
    Phase 6 (Administration) remain, lower priority per the spec's own
    ordering.
14. ~~Fixed a real Drawer shading bug~~ ✅ done 2026-08-16 — user reported a
    dark band bleeding in from the right edge of Billing screens (worried
    their laptop screen was broken). Root cause: `Drawer.tsx` applied
    `shadow-2xl` unconditionally, even while `translate-x-full` (closed,
    off-screen). With Billing's 25+ simultaneously-mounted drawers, the
    blur-radius bleed from every closed one stacked into a visible dark
    band. Fixed by making the shadow class conditional on `open` — benefits
    every drawer in every module, not just Billing.
15. ~~Organization Hierarchy Step 1 (Department Types + lifecycle + full
    Department screen)~~ ✅ done 2026-08-16 — user proposed a large
    Organization→Facility→Floor→Department→Room→Bed architecture
    (`ORGANIZATION_HIERARCHY_SPEC.md`, saved verbatim + audited against the
    codebase); this is the first, lowest-risk phase of it. New configurable
    `DepartmentTypeConfig` lookup (mirrors Bed Type pattern, 11 seeded
    types: Clinical/Diagnostic/Therapeutic/Pharmacy/Administrative/Support/
    Emergency/Inpatient/Outpatient/Surgical/Critical Care) with real
    active/inactive lifecycle. `DepartmentConfig` extended with `typeId`,
    `floorId`, `additionalStaffIds`, `serviceCodes`, `appointmentTypeIds`,
    `workingHours`. New Department Detail drawer: primary staff (derived
    from `PractitionerRole.departmentId`, not duplicated) + additional
    staff, assigned billable services (reuses Billing's `BillableService`,
    deliberately not Facilities' separate/older `CatalogService` — decided
    not to unify the two catalogs this phase), assigned appointment types,
    working hours, and a rooms/beds rollup (via existing Ward→Room→Bed
    chain — confirmed Ward already serves as the proposal's "Unit" concept,
    so no new entity was added). Along the way, fixed a real pre-existing
    bug: Department create/edit in `FacilityList.tsx` only mutated local
    React state and never called the API, so edits were silently lost on
    navigation — now wired to real `api.createDepartment`/`updateDepartment`
    calls (Facility/Service have the same latent bug, left unfixed as a
    noted follow-up). Also fixed a drawer-stacking click-interception bug
    (Department Detail and Department Edit Form are both full-width
    right-side panels; closing Detail before opening Edit fixes it, same
    pattern used elsewhere). Deferred to later phases, per the user's own
    scope choice: Organization/Building hierarchy migration, global
    Hospital▼/Department▼ context selector, department-specific dashboards,
    Staff multi-department model, Appointment Service/Location/Room chain,
    Billing→Department FK, Department-scoped RBAC, multi-hospital-group
    support.
16. ~~Nav scaffolding for every remaining top-level section~~ ✅ done
    2026-08-16 — user pasted a 22-item checklist (Hospital overview,
    Patient statistics, Bed occupancy, Admissions, Discharges, Emergency,
    Appointments, Departments, Staff, Revenue, Billing, Insurance,
    Laboratory, Radiology, Pharmacy, Inventory, Operating theatre, ICU,
    Reports, Alerts, Audit, Configuration) and asked that these all exist
    first, with what to actually design in each to follow later. Most
    already had a home (Dashboard, Beds, Appointments, Departments, Staff,
    Billing, Insurance — the last inside Billing Phase 2, not rebuilt
    separately); ICU is the existing `dept-icu` department/bed type, not a
    new section. Added real, navigable (not blank) pages + sidebar nav +
    routes for the genuinely-missing ones: **Emergency**, **Laboratory**,
    **Radiology**, **Pharmacy**, **Operation Theatre** (all `[oversight]`
    per the scope rule above), **Inventory & Procurement**, **Reports &
    Analytics**, **Security & Audit** (global — distinct from Bed
    Management's own scoped Audit tab), **Administration/Configuration**,
    and **Alerts & Communication** (maps to the tree's Communication
    section; the user's list called it out individually so it got its own
    nav entry). Each new page uses a shared `OversightPlaceholder.tsx`
    component listing its planned sub-sections as "Not built yet" — real
    content awaits per-section direction from the user, per their own
    stated plan. Also wired up `Inventory` and `Reports`, whose sidebar
    buttons existed already but had no `onClick`/route (dead buttons).
17. ~~Laboratory (full [oversight] build)~~ ✅ done 2026-08-16 — user asked
    for Laboratory to be built out to the same depth as Billing/Beds,
    "international standard." FHIR-aligned per `HMS_DOMAIN_STANDARDS.md`
    §22-26: Lab Order → `ServiceRequest`, Specimen → `Specimen`, Result →
    `Observation`, Report → `DiagnosticReport`. Six tabs in
    `pages/laboratory/LaboratoryManagement.tsx`: **Dashboard** (orders
    today, avg TAT on verified orders, open critical count, rejected
    specimens, work-in-progress breakdown, by-priority/by-department
    volume); **Orders** (search/filter by status/priority, full
    ServiceRequest→Specimen→Observation→DiagnosticReport joined detail
    view per order); **Critical Results** (open vs. acknowledged, an
    Acknowledge action that's genuinely administrative — who was
    notified, what was done — never a result edit); **Test Catalog**
    (configurable LOINC-style lookup, same pattern as Bed Types/
    Department Types, panel vs. component tests e.g. CBC → Hemoglobin/
    WBC/Platelets per the domain doc's own example); **Analytics**
    (turnaround-time compliance against a CLSI/ISO 15189-style benchmark
    by priority, specimen rejection rate, critical-result rate, category
    volume — all computed from real seeded timestamps, no fabricated
    metrics); **Audit** (every administrative action, mirrors
    `recordBedAudit()`). Strictly [oversight] per the scope rule — the
    only mutations are administrative (capture a one-off order mirroring
    Billing's manual Capture Charge, cancel an order, acknowledge a
    critical result); no result-entry screen exists here, that's the
    separate `laboratory` portal's job. Added a real `dept-laboratory`
    department (new `laboratory` DepartmentCategory + practitioner Dr.
    Amina Farooqi as Lab Director) rather than leaving lab orders
    unlinked to the department model. Cross-references Billing's
    existing `BillableService` catalog where a real mapping exists
    (CBC-PANEL → LAB-001) instead of a second disconnected price.
    12 seeded orders spanning the full status lifecycle (ordered →
    verified) and all three priorities, one open critical result (STAT
    CBC, critical-low Hemoglobin) and one already-resolved historical one
    (Potassium), one rejected specimen (hemolyzed) for the rejection-rate
    metric. Fixed one real layout bug caught via screenshot during
    verification: the order-detail results table overflowed the drawer's
    fixed width and got clipped — replaced with a stacked card-per-result
    layout. Playwright-verified (11/11 steps, zero console errors).
    Noted, not fixed (pre-existing, hospital-admin-wide, not a Laboratory
    regression): the sidebar/`AppShell` doesn't collapse on narrow
    viewports — confirmed via a mobile-width screenshot during this
    verification pass; affects every hospital-admin page identically.
18. `api/index.ts` split ✅ done 2026-08-16 — the whole hospital-admin mock
    data/API layer had grown to 5,457 lines in one file across every phase
    above; split into 10 files by domain under `src/modules/hospital-admin/api/`
    (`core`/`dashboard`/`facilities`/`staff`/`patients`/`beds`/`appointments`/
    `billing`/`departments`/`laboratory`), with `index.ts` reduced to a
    dependency-ordered `export * from "./X"` barrel. Every consumer still
    imports the barrel unchanged. See project memory for the full breakdown
    and the circular-import traps hit along the way.
19. ~~Radiology Phase 1 (Dashboard)~~ ✅ done 2026-08-16 — user provided a
    42-section spec (`RADIOLOGY_MODULE_SPEC.md`, saved verbatim) and gave an
    explicit build discipline: one page at a time, user checks each before
    the next is built. Phase 1 per the spec's own §42: KPI cards (Orders
    Today/Scheduled/Waiting/In Progress/Completed/Awaiting Report/Critical
    Findings/Equipment Alerts), Today's Workflow funnel (7 stages), Volume
    by Modality donut, Modality Utilization panel, Pending Reports by TAT
    bucket, Radiology Alerts (derived from real critical/modality/overdue-
    report data, never fabricated), Today's Worklist preview table. New
    `api/radiology.ts` models the full FHIR-aligned chain (ServiceRequest→
    ImagingOrder, ImagingStudy, DiagnosticReport→RadiologyReport,
    CriticalFinding) plus Modality/Room/Procedure catalog — seeded now so
    Phase 2 doesn't need rework, but only Dashboard-level read functions are
    exposed yet; Phase 2's mutations (authorize/schedule/check-in/etc.)
    wait until that phase starts, per the user's own discipline. Added two
    real radiology staff (Dr. Farah Chaudhry, Chief Radiologist; Ali
    Rasheed, Radiologic Technologist) rather than inventing anonymous
    names. Cross-referenced two procedures to Billing's existing
    `BillableService` catalog (XR Chest→RAD-001, MRI Brain→RAD-002) instead
    of a disconnected price list. Playwright-verified (6/6 steps, zero
    console errors) plus a visual screenshot check.
20. ~~Radiology Phase 2 (Operational Workflow)~~ ✅ done 2026-08-16 — user
    said to proceed and complete the whole phase (superseding the per-page
    checkpoint for this one instance — see [[feedback_per_page_checkpoint]]
    in project memory). Page renamed `RadiologyDashboard.tsx` →
    `RadiologyManagement.tsx`, now tabbed (Dashboard/Orders/Scheduling/
    Worklist/Studies/Reports/Critical Findings), mirroring
    `LaboratoryManagement.tsx`'s pattern. `api/radiology.ts` extended with:
    a per-order workflow-timeline (`authorizedAt`/`checkedInAt`/
    `studyStartedAt`/`studyCompletedAt` fields, spec §8's 8-stage timeline
    computed straight from them, no separate audit-log system needed);
    DICOM/PACS technical fields on `ImagingStudy` (kept behind an
    Advanced/Technical toggle in Study Details, never shown by default, per
    spec §18/§20); and administrative mutations only —
    `authorizeImagingOrder`, `scheduleImagingOrder` (captures the spec §10
    preparation checklist as entered, never validates it against clinical
    rules), `checkInImagingOrder`, `startImagingStudy`/`completeImagingStudy`
    (the latter creates the `ImagingStudy` record — acquisition-technical,
    not clinical interpretation), `cancelImagingOrder`,
    `putImagingOrderOnHold`/`releaseImagingOrderHold`,
    `acknowledgeRadiologyCriticalFinding`. Reports stay strictly view-only —
    no draft/finalize mutation exists, matching Laboratory's "no reporting
    UI" boundary from the module map's own scope rule. Every mutation
    records `lastActionBy`/`lastActionAt` (fixed mid-build: had first added
    an `actor` parameter and then discarded it via `void actor` instead of
    actually using it — caught before shipping). Fixed one real bug found
    via Playwright: completing a study from the Worklist tab didn't refresh
    the Studies/Reports tabs' own data, so a just-completed study wouldn't
    appear until an unrelated state change — `refreshAllAfterMutation()` now
    refreshes every tab's data, not just Dashboard/Orders/Worklist.
    Playwright-verified (13/13 steps including the full authorize→schedule→
    check-in→start→complete chain, hold/release, cancel, and critical-finding
    acknowledgment), zero console errors, plus a visual screenshot check.
21. ~~Radiology Phase 3, first screen (Modalities)~~ ✅ done 2026-08-16 —
    user said "yes proceed" (shorter/less explicit than #20's "proceed
    complete the phase 2"), so treated as reverting to the module's default
    per-page checkpoint rather than another whole-phase override — built
    just Modalities, the first item in Phase 3's own list (spec §12-13), and
    stopped again. Real equipment registry, not a static dropdown:
    Modality ID/Name/Type/Manufacturer/Model/Serial/Room/DICOM AE Title/IP/
    PACS Destination/Next Maintenance, full add/edit, and a status cycle
    (🟢 Operational/🟡 Limited/🔵 Maintenance/🔴 Offline — Retired
    deliberately left out of the routine cycle, same reasoning as Bed's
    out-of-service). Utilization % is a real computation (today's scheduled
    procedure minutes ÷ the room's operating-hours window), not a fabricated
    number — CLAUDE.md's "never a decorative metric" rule applies here too.
    Added `getRadiologyRooms()` and swapped it in for the workaround Phase 2
    had used (deriving fake rooms from `getModalities()` output). Fixed two
    things caught before shipping, not after: a dead ternary
    (`room?.modalityId ? "dept-radiology" : "dept-radiology"` — always the
    same value either way) simplified to a plain assignment; and the same
    `void actor` smell from Phase 2 caught again in `setModalityStatus` —
    dropped the unused parameter entirely instead, matching how Bed
    Types/Department Types' own CRUD (the pattern being mirrored) never
    took one either. Playwright-verified (5/5 steps, including status
    change and add-modality, plus confirming the Dashboard's Equipment
    Alerts count updates from a Modalities-tab action), zero console
    errors, plus a visual check. **Next up: wait for the user to review
    this page before continuing Phase 3 (Rooms is next in the spec's own
    order) — do not build ahead.**
22. ~~Radiology Phase 3, second screen (Rooms)~~ ✅ done 2026-08-16 — another
    bare "yes proceed", read the same way as #21: default per-page pace,
    build the next single item in the spec's own order and stop again.
    Room → Modality (live-linked, shows the modality's real status, not a
    duplicated one), capacity, operating hours, and Assigned Staff
    (technologist multi-select, spec §14) with full add/edit and a
    close/reopen toggle. Real name collisions caught by `tsc`, not
    guessed: Bed Management already owns `Room`/`NewRoomInput`/`createRoom`/
    `updateRoom` for its own physical-hospital-room concept, so the
    Radiology versions became `RoomRow`/`NewRadiologyRoomInput`/
    `createRadiologyRoom`/`updateRadiologyRoom` — barrel re-export ambiguity
    errors flagged this immediately, no manual cross-file check needed
    (same category of catch as Phase 2's `AuthorizationStatus` collision
    with Billing). Also replaced the Phase 2 workaround that faked room
    data out of `getModalities()`'s output with a real `getRadiologyRooms()`
    getter now that Rooms has its own proper backing. Playwright-verified
    (5/5 steps, including add/edit-with-staff and close/reopen), zero
    console errors, plus a visual check. **Next up: wait for the user
    before continuing Phase 3 (Radiologists is next in the spec's own
    order) — do not build ahead.**
23. ~~Radiology Phase 3, third screen (Radiologists)~~ ✅ done 2026-08-16 —
    user's follow-up ("is the radiologist not complete there or something
    remaining in it") clarified there was no dedicated Radiologists screen
    yet, only the underlying staff record referenced inside Order Details/
    Reports — read as confirmation to build it, at the same one-page pace.
    Deliberately scoped as read-only (spec §15's roster/workload/
    credentials view), not a second personnel CRUD system — identity,
    license, and schedule stay owned by Staff & Workforce
    (`staffMembers`); this tab only adds radiology-specific workload on
    top: studies today, pending reports, and Assigned Modalities computed
    honestly from which modality types this radiologist has actually
    reported studies for (not a static/fabricated assignment). Only one
    radiologist exists in seed data (Dr. Farah Chaudhry) and the screen
    correctly shows exactly one row — no padding with invented names.
    Playwright-verified (3/3 steps, including the profile drawer's
    workload + assigned-modalities sections), zero console errors, plus a
    visual check. **Next up: wait for the user before continuing Phase 3
    (Technologists is next in the spec's own order) — do not build
    ahead.**
24. ~~Radiology Phase 3, fourth screen (Technologists)~~ ✅ done 2026-08-16
    — another bare "yes proceed", same one-page pace. Same read-only
    roster pattern as Radiologists (spec §16): identity/license/schedule
    owned by Staff & Workforce, this tab adds Modality Competency (computed
    from studies actually performed, not assigned statically), Current
    Room (from Rooms' own `assignedStaffIds`), and Current Study (any
    in-progress order). Surfaced an honest, not-fabricated pre-existing
    data quirk rather than papering over it: Elena Rostova's staff record
    is `on-leave` but she's still assigned to an in-progress order from
    Phase 2's seed data — the panel correctly prioritizes showing "On
    Leave" over a redundant "In a Study" badge, while still showing her
    real current-study data underneath rather than hiding it. Playwright
    caught this as a test-authoring mistake (asserted "In a Study" would
    be visible), not an app bug — confirmed via screenshot before
    "fixing" anything. Playwright-verified (2/2 steps), zero console
    errors, plus the visual check that resolved the question. **Next up:
    wait for the user before continuing Phase 3 (Procedures is next in the
    spec's own order) — do not build ahead.**
25. ~~Radiology — rest of the module (Phase 3 remainder + Phase 4 + Phase 5)~~
    ✅ done 2026-08-16 — the user gave an explicit, stronger override this
    time: "yes and complete all the next pages dont stop there" → self-
    interrupted → "i mean complet the radiology" — read as "finish the
    entire remaining module, don't stop for a checkpoint after each
    screen," superseding the per-page discipline used for every prior
    Radiology screen (see `feedback_per_page_checkpoint.md`). Built in one
    pass, spec's own order: **Procedures** (§26 — CRUD added on the
    existing `imagingProcedures` catalog, coded not free-text) with
    **Protocols** (§27 — CT Chest/MRI Brain sub-options, e.g. "With
    Contrast") folded in as a second section rather than a standalone tab,
    since protocols are inherently procedure-scoped; **Equipment** (§28 —
    service-history/warranty view of the same Modalities registry, new
    `installationDate`/`warrantyExpiration` fields) with **Maintenance**
    (§29 — Due Today/This Week/Overdue dashboard computed from each
    modality's own `nextMaintenance` date, no separate schedule data
    source) combined into one tab; **Integrations** (Phase 4 — PACS §19 +
    DICOM §20 + the lightweight FHIR/HL7 status mentions combined into one
    tab: connectivity summary, per-study transfer log surfaced from the
    `pacsTransferStatus` field that already existed on `ImagingStudy`, and
    a mock-only retry action — [oversight] means no real DICOM
    networking/PACS viewer lives here); **Billing** (§30) with
    **Insurance** (§31) combined into one tab — strictly a cross-reference
    view over `imagingProcedures.price`/`billingCode` and
    `ImagingOrder.authorizationStatus`, never a second ledger (the central
    Billing & Revenue module owns that); **Analytics** (§32 — volume by
    modality/department, avg turnaround/wait time, modality utilization,
    report status mix, all computed from real order/study/report records,
    same anti-fabrication discipline as the Dashboard); **Audit** (§34 — a
    genuinely new system this time, since Phase 2 had deliberately used
    lighter per-order timestamps instead; added `recordRadiologyAudit()`
    and wired it into all ~20 existing mutation functions — authorize,
    cancel, hold/release, schedule, check-in, no-show, start/complete
    study, critical-finding acknowledge, every Modality/Room/Procedure/
    Protocol CRUD action, and PACS retry — so the Audit tab shows real
    logged actions, not a decorative empty table); **Settings** (§35 — a
    configuration overview linking to Modalities/Rooms/Procedures rather
    than duplicating their CRUD). `Tab` type grew from 11 to 18 tabs.
    `tsc --noEmit` clean (only the two pre-existing unrelated errors in
    `environment.ts`/`CardRow.tsx`). Playwright-verified in two batches per
    the size of this change rather than one cycle per screen: an 18-check
    pass across all 7 new tabs (catalog content, add-procedure flow,
    maintenance KPIs, PACS/FHIR/HL7 status cards, billing/insurance
    tables, analytics KPIs, audit log content including a live
    maintenance-log action actually appearing in the log) and a 7-check
    regression pass confirming Dashboard/Orders/Modalities/Rooms/
    Radiologists/Technologists/Audit still render correctly after the
    `refreshAllAfterMutation()`/`handleSetModalityStatus()` wiring changes
    — both 100% passing, zero console errors. Standard cleanup done
    (test files, screenshots, `npm uninstall playwright`, verified
    `package.json`/`node_modules` clean).
26. ~~OT / Surgery Phase 1 (Core UI)~~ ✅ done 2026-08-16 — user pasted a
    45-section OT/Surgery spec (`OT_MODULE_SPEC.md`, saved verbatim) and said
    "proceed" (bare, no per-page checkpoint attached to this module unlike
    Radiology — see the spec file's own scope note). Followed the project's
    normal phase-level cadence and built the spec's own Phase 1 (§44): OT
    Dashboard, Surgery Schedule, Surgical Cases, Surgery Case Details, Surgery
    Request, OT Rooms. New `dept-ot` department (category `surgery`, added to
    `DepartmentConfig`'s category union and the Facilities UI's own
    `DepartmentCategory`/`categoryMeta`) and 5 new OT staff (Dr. Ahmed Hassan —
    Consultant Surgeon, Dr. Sara Malik — Consultant Anesthesiologist, Hina
    Tariq — Scrub Nurse, Nadia Yousaf — Circulating Nurse, Bilal Nadeem — OT
    Technician), joined the same Practitioner/PractitionerRole pattern as
    every other department. Data model (`api/ot.ts`): `OTRoom`
    (10-state status board, spec §5), `SurgicalProcedure` catalog (9 seeded
    procedures), `SurgicalCase` (full spec §8 standardized 13-stage lifecycle
    as an ordered array — `surgicalCaseLifecycle` — used to compute a
    `CaseLifecycleStage[]` timeline without fabricating per-stage timestamps
    for stages Phase 2's clinical screens don't exist to set yet; only
    real-captured timestamps — requested/approved/scheduled, and the
    intra-op fields that are pre-seeded on some cases — ever render as
    populated), `SurgeryRequest` capture (spec §9-11's full field set).
    Actions scoped to what Phase 1 owns (approve, schedule, reschedule,
    delay, postpone, cancel, no-show) — deliberately did NOT wire "Start"
    (→ Intra-Op) since that belongs to Phase 2 per the spec's own phase
    split. **Audit was built in from the start this time** (`recordOTAudit`
    hooked into all 13 mutation functions from day one), unlike Radiology
    where it was retrofitted in a later phase — a direct application of the
    lesson learned there. `tsc --noEmit` clean (only the two pre-existing
    unrelated errors). One real bug self-caught before shipping: a JSDoc
    comment containing the literal text `*status*/logistics` — the `*/`
    inside the comment prose terminated the block comment early and broke
    the whole file's parse; fixed by rewording, and confirmed no other new
    file had the same `*/`-inside-comment trap via a targeted grep.
    Playwright-verified in two passes (12/12 on dashboard/schedule/cases/
    rooms/new-request, 3/3 on the full approve→schedule→cancel action
    chain — one flaky first run on the cancel check, confirmed via
    screenshot + dialog text dump that the app was already behaving
    correctly, i.e. a test-timing issue not an app bug, before touching
    anything, same "look before fixing either side" discipline as
    Radiology's Technologists screen). Zero console errors both passes.
    Standard cleanup done. Replaced the old `OperationTheatreOversight.tsx`
    placeholder entirely (deleted, no longer referenced) with `OTManagement.tsx`.
27. ~~OT / Surgery Phase 2 (Clinical workflow)~~ ✅ done 2026-08-16 — the user
    just said "proceed" repeatedly across several turns while this was
    built; no phase named, so the project's normal phase-level default
    applied (ship the spec's own next phase, verify, report). Built all of
    §44's Phase 2: **Pre-Op** (§12-13 — 14-item configurable checklist via
    `preOpChecklistTemplate`/`togglePreOpChecklistItem`, `recordConsent`,
    `recordAnesthesiaAssessment`; `isPreOpReady()` computes READY FOR OT vs
    NOT READY live from real checklist/consent/anesthesia state, never a
    manual flag; `markReadyForOT()` re-validates server-side rather than
    trusting the client); **Anesthesia** (§15 — shares the same case-detail
    drawer as Pre-Op rather than duplicating the assessment form in a
    second UI surface); **Intra-Op** (§16-18 — three-stage WHO-style safety
    checklist via `safetyChecklistTemplate`, time-tracking mutations
    `transferPatientToOT`/`startCaseAnesthesia`/`startCaseSurgery` that
    Phase 1 had only reserved fields for, `completeCaseSurgery` capturing
    structured Procedure Documentation per §19 — performed procedure,
    findings, technique, complications, EBL, specimens/implants as
    boolean+note not a tracking system (that's Phase 3), closure — and
    freeing the OT room to "cleaning" status automatically); **Post-Op /
    Recovery** (§24-26 — PACU status cycling via `setPacuStatus`,
    `moveCaseToRecovery` defaulting destination to ICU vs Ward off the
    case's own `icuBedRequirement` flag, `recordPostOpNoteAndTransfer`
    closing out the case to `transferred`). `Tab` type grew 4→8.
    Checklist template *editing* UI deliberately deferred to OT Settings
    (Phase 4) — Phase 2 only ticks against whatever's configured, matching
    the spec's own "don't hard-code clinical rules" instruction.
    **Found and fixed two real bugs, not test artifacts** (confirmed via
    a `console.log` trace inside the drawer before touching anything,
    same "look before fixing either side" discipline as Radiology's
    Technologists screen): (1) `PreOpCaseDrawer`/`RecoveryCaseDrawer`'s own
    local form state was keyed on the whole `caseDetail` object in a
    `useEffect`, so any background refresh triggered by an action *within
    the same open drawer* (e.g. ticking a checklist item) silently reset
    unsaved Consent/Anesthesia/Post-Op-note field edits — fixed by keying
    on `caseDetail?.id` instead, so local edits only reset when the drawer
    switches to a different case, not on every same-case refetch; (2) a
    genuine architectural bug specific to Pre-Op/Intra-Op/Recovery (unlike
    Phase 1's Cancel/Postpone/Delay, which are separate drawers from the
    main details view, these three both mutate *and* self-close from the
    same drawer): `refreshAllAfterMutation`'s blanket "refetch the
    still-selected case" step closes over the pre-click selected id, so
    its refetch resolves ~250ms after an action that also calls
    `onClose()`, silently popping the drawer back open right after —
    deterministic, not a race, confirmed by tracing execution order end to
    end. Fixed with `preOpSelectedIdRef`/`intraOpSelectedIdRef`/
    `recoverySelectedIdRef` refs kept in sync via their own `useEffect`s,
    checked inside each refetch's `.then()` before applying the result —
    a since-cleared selection is never reapplied. `tsc --noEmit` clean.
    Playwright-verified in two passes given the debugging involved (15/15
    on the full Pre-Op→Ready-for-OT→Intra-Op→Complete-Surgery→Recovery→
    Transfer chain across two different seeded cases, chosen specifically
    to avoid the since-fixed reopen race polluting later assertions; 6/6
    regression pass confirming every Phase 1 tab still renders correctly).
    Zero console errors both passes. Standard cleanup done.
28. ~~OT / Surgery Phase 3 + Phase 4 (rest of the module)~~ ✅ done
    2026-08-16 — user said "first complete the OT and all related things"
    (whole-module override, same strength as Radiology's "complete the
    radiology" earlier) then, going to sleep, handed over the full Pharmacy
    spec with "must complete also this not in phase just do all." Built the
    entirety of §44's Phase 3 (Supporting operations) and Phase 4
    (Management) in one pass: **Surgical Team** (read-only roster, joined
    off Staff & Workforce); **Instruments** (`InstrumentSet` registry —
    sterilization status tracked separately from overall availability
    status, 6-state cycle); **Consumables** (catalog + usage log, every
    usage decrements catalog stock); **Implants** (serial/lot/UDI-tracked
    catalog + a permanent traceability log — never overwritten, per the
    spec's own emphasis); **Specimens** (auto-created off
    `completeCaseSurgery`'s `specimensCollected` flag, label/pathology
    status editable, result content itself stays pathology's own, never
    authored here); **Equipment** (per-item technical/service status,
    distinct from Rooms' own simple equipment display list); **Emergency
    OT** (filtered case view — same controlled status flow/audit trail as
    elective cases, no shortcut path); **Cancellations** (cancelled +
    postponed cases with their already-captured reasons); **Delays**
    (worst-first); **Reports** (surgeries per department/surgeon/room,
    turnaround, cancellation/emergency rate, complication count derived
    from Procedure Documentation's own complications field — no fabricated
    quality metric); **OT Settings** (overview linking to Rooms/
    Instruments/Team/Implants); **Audit** (UI for the `getOTAuditLog`
    backend that had been logging since Phase 1). `Tab` type grew 8→20.
    `tsc --noEmit` clean. Playwright-verified (17/17 covering every new
    tab plus an add-instrument-set round trip and an audit-log content
    check; 5/5 regression across Dashboard/Cases/Pre-Op/Intra-Op/Rooms).
    Zero console errors. Standard cleanup done. **OT/Surgery is now a
    fully complete module**, same standard as Billing/Beds/Laboratory/
    Radiology. Immediately continued into the full Pharmacy build per the
    same turn's instruction — see the entry below.
29. ~~Pharmacy — full module~~ ✅ done 2026-08-17 — same turn as #28: the user
    said "first complete the ot and all related things then go to the the
    other phase i am going to sleep so you complete all thest this here is
    the other one do it like this and must complete also this not in phase
    just do all," then pasted the full 39-section Pharmacy spec (saved
    verbatim as `PHARMACY_MODULE_SPEC.md`). Two explicit instructions in
    one: finish OT completely first (see #28), then build Pharmacy
    completely too, in one pass, not phased — the strongest override level
    seen yet, applied to a SECOND module in the same turn. New `dept-pharmacy`
    department (`pharmacy` category added to both `DepartmentConfig`'s union
    and the Facilities UI's separate `DepartmentCategory` type — the
    now-three-times-confirmed "two places to update" gotcha) and 3 new
    pharmacy staff (Chief Pharmacist, Pharmacy Technician, Pharmacy Manager
    — modeled with existing `roleType` values doctor/technician/admin rather
    than extending the global role union, since `StaffFormDrawer.tsx` keeps
    an exhaustive `Record<role, ...>` that a new role value would have broken).
    Built the entire spec in `api/pharmacy.ts` (~1500 lines): Medication
    Catalog (standardized Forms/Routes, never free text), Prescriptions (full
    NEW→RECEIVED→UNDER_REVIEW→VERIFIED→PREPARING→READY→DISPENSING→DISPENSED
    state machine plus CANCELLED/REJECTED/PARTIALLY_DISPENSED/RETURNED/
    EXPIRED), Medication Verification (`getVerificationWarnings` — allergy/
    duplicate-therapy/expired-medication/stock-unavailable/missing-info flags
    computed from real patient-allergy and batch-stock data, explicitly never
    a clinical-decision-support engine per the spec's own §4 instruction),
    Dispensing (`dispensePrescription` draws FEFO — first-expiry-first-out —
    from real batches, decrementing actual stock, never a silent quantity
    edit), Patient Pharmacy Profile (deliberately stops at Prescribed→
    Dispensed; Administered stays nursing's own MAR record per spec §20's
    explicit three-event split), Batch Management + Expiry Management (every
    unit of stock traces to a batch; 30/60/90-day buckets with Quarantine/
    Return-to-Supplier/Mark-Expired), Stock Movement (every inventory change
    is a `StockTransaction`, auditable by construction), Stock Transfer,
    Procurement (Purchase Orders → Goods Receiving creates the real Batch —
    inventory only ever grows through a receipt, never a direct edit —
    + Suppliers), Returns (restocking gated to sealed/unused condition only),
    Recalls (initiating one immediately quarantines every affected batch and
    flags prior dispensing records — no window where recalled stock could
    still be dispensed), Controlled Medicines + Register (every controlled-
    substance dispense auto-creates a permanent register entry with a running
    balance, never manually editable), Refills, Inpatient Medication (Doctor
    → Order → Pharmacy Verification → Preparation → Ward; stops at "Supplied
    to Ward," same Administration boundary as the Patient Profile), Insurance
    (cross-reference view only, never a duplicate of Billing & Revenue's own
    ledger), Reports, Settings, and Audit (built in from day one this time,
    continuing the discipline OT started — `recordPharmacyAudit` wired into
    every mutation from the first commit, not retrofitted). 19 tabs.
    `tsc --noEmit` clean (two minor lucide-icon `title`-prop errors self-
    caught and fixed before the final check). **Found and fixed two real
    bugs during Playwright verification** (confirmed by direct investigation
    before touching anything, not guessed from symptoms): (1) the allergy-
    matching logic only ever did literal substring comparison between a
    documented allergy term and a medication's generic name — meaning a
    real-world allergy like "NSAIDs" or "Penicillin" would NEVER match
    "Ibuprofen" or "Amoxicillin" despite being textbook drug-class
    relationships every pharmacist would expect flagged; fixed with a small
    explicit `allergyClassMap` lookup (still structured data driving a flag,
    not a reasoning engine) rather than leaving the feature quietly
    non-functional for realistic scenarios. (2) A seed-data gap: Ibuprofen's
    only batch was deliberately expired (the demonstration example for
    Expiry Management), leaving it with zero dispensable stock — meaning
    the one active prescription for it in the seed data could never be
    fully dispensed in a real test; added a second, available batch. `tsc
    --noEmit` clean throughout. Playwright-verified (31/31 covering every
    tab plus a full prescription lifecycle — receive→review→verify→
    prepare→ready→dispense with real batch decrement — a medication-catalog
    add, and a purchase-order→goods-receipt→inventory-increase round trip;
    4/4 cross-module regression on Facilities/Radiology/OT/Staff Directory
    since `facilities.ts`'s `DepartmentConfig` category union and
    `DepartmentFormDrawer.tsx` were touched for the new `pharmacy` category).
    Zero console errors. Standard cleanup done. **Pharmacy is now a fully
    complete module**, same standard as Billing/Beds/Laboratory/Radiology/
    OT — this closes out the entire "complete OT then Pharmacy, no phases"
    instruction for this session.
30. ~~Inventory Management — full module~~ ✅ done 2026-08-17, in the same
    session immediately after #29 (Pharmacy). The user pasted the full
    49-section Inventory Management spec (saved verbatim as
    `INVENTORY_MODULE_SPEC.md`) and said "now do all these there" — read
    as the same whole-module, no-phasing override established by #28/#29's
    "not in phase just do all," now extended to a third module chained
    into the same unsupervised stretch. New `dept-inventory` department
    (category reused as `"other"` deliberately — Inventory isn't a
    clinical department needing its own Facilities-UI icon, so this
    avoided a fourth trip through the "two places to update"
    department-category gotcha) and 3 new Inventory staff (Inventory
    Manager, Storekeeper, Procurement Officer — existing `roleType`
    values + descriptive `title`, same pattern as OT/Pharmacy). Built the
    entire spec in `api/inventory.ts` (~2100 lines): Item Master
    (category/subcategory/UOM/identifiers, configurable never hardcoded),
    Stock Overview (every quantity — On Hand/Available/Reserved/Allocated/
    Damaged/Quarantined/In Transit/On Order — computed live from real
    batch/asset/reservation/transfer/PO records, never stored), Batches +
    FEFO (`pickFefoBatch` draws earliest-expiry-first, same discipline as
    Pharmacy's `dispensePrescription`), Serialized Assets + Implant
    Tracking (patient/procedure/surgeon traceability, kept as a separate
    inventory-side stock record from OT's own per-case implant *usage*
    tab), Warehouses + Storage Locations (Warehouse→Aisle→Rack→Shelf→Bin),
    Requisitions (full DRAFT→SUBMITTED→UNDER_REVIEW→APPROVED→PICKING→
    ISSUED→RECEIVED state machine; issuing one draws FEFO batches and
    doubles as the spec's separate "Stock Issues" screen via a filtered
    movement-log view, avoiding a parallel workflow for the same event),
    Stock Returns, Stock Transfers, Purchase Requests → Purchase Orders →
    Goods Receiving (multi-line, real Partial Receiving — tracks received
    vs. remaining per line, never assumes full delivery) + Suppliers,
    Inventory Counts + Variance (approval creates real `InventoryAdjustment`
    rows per variance line, never a silent quantity overwrite), Adjustments
    (always reason/user/timestamp/audit; changes of 20+ units route to a
    second approver before applying), Reservations (Available shrinks,
    On Hand stays intact — e.g. OT case tomorrow), Recalls + Quarantine
    (initiating a recall immediately quarantines every affected batch and
    traces prior issuance and implant usage — same "no window where
    recalled stock could still move" discipline as Pharmacy's recalls),
    Disposal (method/reason/authorized-by, optional witness), Stock
    Movement ledger (every change is a transaction), Alerts (stock/
    procurement/operational, all computed live), Reports + Analytics
    (turnover, slow-moving, dead stock, expiry loss, supplier performance),
    Audit (built in from day one — `recordInventoryAudit` wired into every
    mutation from the first commit, continuing the discipline OT started).
    20 tabs. Domain separation explicitly maintained per the spec's own
    closing note ("Inventory != Pharmacy != Procurement != Asset Management
    != Billing") — no seed item uses category `"medicine"`, and OT's own
    Consumables/Implants usage tabs were left untouched.
    **Naming collisions found and fixed before shipping**: barrel `export *`
    ambiguity caught 20 exported symbols colliding with `pharmacy.ts`
    (`Supplier`, `suppliers`, `getSuppliers`, `NewSupplierInput`,
    `createSupplier`, `updateSupplier`, `setSupplierStatus`, `BatchStatus`,
    `RecallStatus`, `PurchaseOrderStatus`, `purchaseOrders`,
    `NewPurchaseOrderInput`, `createPurchaseOrder`, `getPurchaseOrders`,
    `receiveGoods`, `getBatches`, `getExpiringBatches`, `quarantineBatch`,
    `markBatchExpired`, `initiateRecall`, `getRecalls`, `closeRecall`),
    plus `stockTransfers`/`approveStockTransfer`/`getStockTransfers`
    against `pharmacy.ts`'s own transfer functions, `recordImplantUsage`
    against `ot.ts`'s per-case version, `getAdjustments` against
    `billing.ts`, and `NewAdjustmentInput` against `billing.ts` too — all
    renamed with an `Inventory`-specific prefix (e.g. `getInventoryBatches`,
    `createInventoryPurchaseOrder`, `recordInventoryImplantUsage`) before
    the barrel would even compile. This is now the largest cross-file
    collision count seen in one module addition this session — worth
    remembering that a general-purpose inventory/stock domain overlaps
    heavily with any other module that also tracks its own stock (Pharmacy)
    or its own usage records (OT, Billing's Adjustments). `tsc --noEmit`
    clean (also fixed one real bug caught by the type checker itself: a
    `"issue"` movement-type literal that didn't match the declared
    `StockMovementType` union — should have been `"requisition-issue"`).
    Production build passes except for two pre-existing, unrelated failures
    (`environment.ts`'s `ImportMeta.env` typing, `CardRow.tsx`'s `title`
    prop) that predate this session's work. Playwright-verified (30/30 —
    all 20 tabs plus 5 full workflows: item creation; a complete
    requisition lifecycle submit→review→approve→pick→issue→confirm-receipt;
    purchase-order→send→goods-receipt with real batch creation; a stock
    adjustment under the approval threshold; a recall that immediately
    quarantines its batch). One real test-locator bug found and fixed
    during verification, not a product bug: this module's in-page tab
    buttons share exact label text with several sidebar nav items
    (Dashboard/Reports/Audit/Alerts) and every Drawer in this codebase
    stays permanently mounted off-screen (never unmounted when closed) —
    unscoped `getByRole` clicks resolved ambiguously against the sidebar
    and against always-mounted, closed drawer buttons with the same label
    elsewhere in the tree. Fixed by scoping every tab click to the page's
    own `<main>` element and every drawer-submit click to that drawer's
    own `[role="dialog"][aria-label="..."]` container. Zero console errors.
    Standard cleanup done (Playwright uninstalled, test file and screenshot
    removed). **Inventory Management is now a fully complete module**, same
    standard as Billing/Beds/Laboratory/Radiology/OT/Pharmacy — this closes
    out the three-module "complete OT, then Pharmacy, then Inventory, no
    phases" instruction chain for this session.
31. ~~Emergency Department — MVP scope~~ ✅ done 2026-08-17, right after #30
    (Inventory) in the same session. The user pasted the full 27-section
    Emergency spec (saved verbatim as `EMERGENCY_MODULE_SPEC.md`) but closed
    with an explicit **scope-down** instruction this time — "Don't build
    every screen immediately. Start with these [10 items]... Then connect
    these visually to your existing Patient, Appointment, Bed, Pharmacy,
    Inventory, Laboratory, Radiology and Billing modules" — the opposite
    shape from #28-30's "do it all" override. Read as: build exactly the
    10-item MVP list (Dashboard, Patient Queue, Triage, Patient Details,
    Treatment/Doctor Workspace, Orders, Lab & Radiology Results,
    Observation, Admission/Transfer/Discharge, Reports), defer the rest
    (Treatment Areas/Bays as own screens, Medication Administration/
    Procedures/Consultations as own screens, Staff Assignment, Equipment,
    a dedicated Alerts tab, Search/Filters as its own screen). Kept Audit
    anyway since every other module in this project ships one from day one
    as standing discipline, not a new screen. This upgrades Emergency from
    its prior `[oversight]` placeholder scope note ("status/volume only...
    the clinical workspace lives in the separate emergency portal, not
    here") to `[full]` for the MVP screens, same explicit-spec-supersedes-
    placeholder precedent as Radiology/OT/Pharmacy/Inventory. New ED-specific
    staff (2 Emergency Physicians, ED Charge Nurse, Triage Nurse) — also
    fixed a pre-existing data inconsistency found while wiring this up:
    `dept-emergency`'s `headDoctorId` pointed at a Neurology attending
    (Dr. Robert Vance) rather than any actual ED staff; repointed it to the
    new Attending Emergency Physician and populated `additionalStaffIds`
    with the real ED roster.
    Built `api/emergency.ts` (~1300 lines): triage priority modeled as a
    configurable `TriageCategory[]` lookup rather than a hardcoded TS union,
    per the spec's own explicit "don't hardcode one country's triage system"
    instruction; the full visit state machine (waiting-triage→waiting-
    doctor→in-treatment→in-observation/disposition-pending→discharged/
    admitted/transferred/left-without-treatment); Triage (symptoms/onset/
    duration/severity + full vitals + configurable priority + area
    assignment in one workflow call); Clinical Assessment (History/
    Examination/Assessment/Plan); a unified cross-type Orders tracker
    (laboratory/radiology/medication/procedure/consultation/monitoring)
    with the spec's own 6-stage status pipeline; Medication Administration
    (own lightweight ED record — Prescribe != Dispense != Administer, per
    spec §12); Observation (with progress notes and a real "converted to
    admission" outcome); Disposition covering Discharge/Admission/Transfer.
    **Real cross-module integration, never a duplicate system** (the
    spec's own explicit instruction): lab-type Emergency Orders genuinely
    call `laboratory.ts`'s `createLabOrder()`; the Results tab reads real
    `getLabOrders({departmentId: "dept-emergency"})`/`getImagingOrders()`/
    `getRadiologyReports()`, filtered to current ED patients, never a
    second results store; Admission genuinely calls `beds.ts`'s
    `createBedRequest()` — the real Bed Management "Requests" queue picks
    it up from there, same as any other department's request. 10 tabs.
    **Applied the Inventory-collision lesson proactively this time**:
    every exported symbol was prefixed `Emergency`-something from the
    start (`EmergencyOrder`, `EmergencyDisposition`, `EmergencyVitals`,
    `EmergencyClinicalAssessment`, etc.) rather than using bare generic
    names and fixing collisions after the fact — `tsc --noEmit` came back
    completely clean against the barrel on the first pass, zero rename
    cleanup needed, unlike Inventory's 20+ post-hoc renames. Production
    build passes except the same two pre-existing, unrelated failures
    noted in #30. Playwright-verified (21/21 — all 10 tabs plus 5 full
    workflows: register a new arrival; perform triage end-to-end; save a
    doctor's clinical assessment; place an order that creates a real
    Laboratory order; complete a discharge disposition). Zero console
    errors. Standard cleanup done. **Emergency Department (MVP scope) is
    now a complete module** for its 10 screens, same verification standard
    as every other module this session — the remaining 17 spec sections
    stay documented in `EMERGENCY_MODULE_SPEC.md` as backlog, not built
    ahead of being asked for.
32. ~~Reports & Analytics — MVP scope~~ ✅ done 2026-08-17, right after #31
    (Emergency). The user pasted the full 65-section Reports spec (saved
    verbatim as `REPORTS_MODULE_SPEC.md`) with no attached scope
    instruction either way — the ambiguous case between the "do it all"
    override (#28-30) and the explicit scope-down (#31). Given the user
    had just raised a direct concern about session budget/token
    consumption, asked two clarifying questions via `AskUserQuestion`
    instead of guessing: (1) scope — MVP subset vs. full 65 sections vs.
    just the dashboard; (2) verification rigor — full (`tsc`+Playwright+
    docs) vs. lighter (`tsc` only). The user picked MVP subset + full
    rigor. Built exactly 13 reports: Overview, Hospital Census, Patient
    Volume, OPD, Emergency, Admissions & Discharges, Bed Occupancy,
    Laboratory, Radiology, Pharmacy, OT/Surgery, Billing, Audit —
    deliberately deferring Report Builder, Saved/Scheduled Reports, Export
    Center, Report Access Control as its own screen, Multi-Hospital
    Reporting, Drill-Down infrastructure, and the Integration/Consent/
    Notification/ICU/Nursing/Doctor/Referral/Staff/Inventory/Insurance-
    family reports (all still documented in the saved spec as backlog).
    **Built as a genuinely thin read-only aggregation layer**
    (`api/reports.ts`, ~350 lines — by far the smallest of this session's
    module API files), per the spec's own explicit architecture note
    ("Operational Systems -> Data -> Reporting Layer -> Reports"): Overview/
    Census/Patient Volume/OPD/Admissions & Discharges/Billing/Audit are
    genuinely new cross-module rollups (computed from real `patientSeeds`/
    `appointments`/`emergencyVisits`/bed-audit-log/charge records — Patient
    Volume in particular buckets real registration/appointment/ED-arrival
    dates, never a fabricated trend line); Emergency/Bed Occupancy/
    Laboratory/Radiology/Pharmacy/OT reuse each module's own real dashboard/
    analytics **component** directly (`EmergencyReportsPanel`,
    `OccupancyAnalytics`, `LabAnalyticsPanel`, `RadiologyAnalyticsPanel`,
    `PharmacyReportsPanel`, `OTReportsPanel`) rather than rebuilding a
    parallel display — a first for this session, and a direct payoff of
    every prior module already exposing exactly this kind of reusable
    component. Two real modeling bugs self-caught before the first `tsc`
    run, not left for the collision pass: `beds`/`Bed` actually live in
    `facilities.ts`, not `beds.ts` (which only imports them, doesn't
    re-export); and `Bed` carries no `wardName`/`wardType` directly — ward
    context requires a real `bed -> room -> ward` join, which
    `getOccupancyAnalytics()` already does internally but doesn't expose
    per-bed, so a small local `resolveWardForBed()` helper was added.
    `tsc --noEmit` and production build both clean (aside from the same
    two pre-existing, unrelated failures noted in #30-31) — zero
    barrel-collision renames needed, the smallest cleanup pass of any
    module this session. Playwright-verified 22/22 (all 13 tabs render
    with real content; Overview/Emergency/Bed-Occupancy/Laboratory tabs
    spot-checked for genuine reused-component data; Audit's real search
    and module filter both narrow results correctly). Zero console errors.
    Standard cleanup done. **Reports & Analytics (MVP scope) is now
    complete** for its 13 screens — the remaining 52 spec sections stay
    documented as backlog.
33. ~~Security & Audit — full module~~ ✅ done 2026-08-17, right after #32
    (Reports). The user pasted the full 48-section Audit spec (saved
    verbatim as `AUDIT_MODULE_SPEC.md`) with no scope signal either way —
    given the same genuine ambiguity as #32's Reports paste, asked the same
    two clarifying questions via `AskUserQuestion` (scope, verification
    rigor) rather than guessing again. This time the user chose **full
    build, all 48 sections** + full rigor — the strongest-scope option,
    confirming the "ask when ambiguous" pattern isn't a one-way ratchet
    toward smaller builds; it genuinely surfaces whatever the user wants.
    Built `api/audit.ts` (~750 lines) as an additive hospital-wide event
    trail: every other module's own scoped audit log (Beds/Laboratory/
    Radiology/Pharmacy/OT/Inventory/Emergency, each with its own
    `recordXAudit` + Audit tab) stays exactly as-is and untouched — this
    module aggregates and enriches those real logs (surfaced in the System
    Events tab via `getAggregatedModuleAuditLog()`, reusing the exact same
    7-source aggregation pattern Reports' Audit tab established) alongside
    curated event streams for concepts no existing module tracks yet:
    Authentication (login/logout/failed-login/MFA/lockout), Security
    (suspicious access, unauthorized API requests), Data Export/Print/
    Download (consolidated per this project's discipline), Consent, and
    Emergency/Break-glass Access. Modeled the spec's own rich AUDIT_EVENT
    schema (actor/patient-context/resource/before-after-changes/technical-
    context/severity/result/source/correlation-ID) as a single `AuditEvent`
    interface, with every curated seed event cross-referencing real
    patient/staff/department data from earlier in this session — not
    invented names. 15 tabs: Dashboard, All Events (search + category/
    severity filters + Saved Queries + the Filter-Builder concept folded
    into the same search bar), Event Details drawer (every §8-15 section:
    Actor/Patient Context/Resource/Before-After/Where From/Source/
    Traceability, plus §38's Related-Events prev/next chain computed from
    real per-patient chronology), Patient Access, Login Activity (+ Failed
    Login Analysis), Security (+ Permission Audit combined), Data Exports,
    Consent, Emergency Access, Integration (FHIR/HL7/DICOM), System Events,
    Investigations (+ detail drawer with notes/status workflow),
    Alerts (computed live — elevated-access-volume detection genuinely
    groups real events by actor within the seed data, not a fabricated
    number), Reports/Export Center, Retention + Integrity (combined,
    retention deliberately never a single hardcoded universal period per
    the spec's own instruction). Per the spec's own explicit framing
    (§39-44: Kafka/microservice event bus, FHIR AuditEvent/Provenance) —
    built the FRONTEND surface only with `correlationId`/`requestId`
    fields ready for a real backend to slot into later, never simulated
    microservices client-side. `tsc --noEmit` clean on the very first pass
    — zero barrel-collision renames needed, continuing Emergency's
    "prefix generic names up front" discipline rather than Inventory's
    post-hoc cleanup. Production build clean (same two pre-existing
    unrelated failures). **Playwright caught one real bug**, confirmed by
    direct investigation before fixing: the Investigation detail drawer's
    data-sync `useEffect` depended on the whole `investigationsList` array
    (not just the selected ID), so any background list refresh re-fetched
    and reset the drawer's investigation object mid-edit, silently
    clobbering the in-progress note textarea — the same root-cause class as
    OT's Pre-Op/Recovery local-form-state-reset bug from earlier this
    session. Fixed the same way: narrowed the effect to key only on the
    selected ID, and made the note/status mutation handlers update local
    drawer state directly from their own return value instead of
    triggering a redundant background re-fetch. (A second apparent failure
    during testing turned out to be a test-script bug, not a product bug —
    an already-open drawer from a prior workflow step intercepting a click
    meant for a list row behind it; fixed by reusing the open drawer
    instead of re-querying the list, the same always-mounted-drawer lesson
    from Inventory's test-locator fix.) Playwright-verified 25/25 — all 15
    tabs plus 5 workflows (open an event's details drawer; open an
    investigation directly from an event; add an investigation note and
    advance its status; generate an audit report into the Export Center;
    archive an event and confirm it moves to the Archived view). Zero
    console errors. Standard cleanup done. **Security & Audit is now a
    fully complete module**, same standard as every other module this
    session.
34. ~~Configuration — full module~~ ✅ done 2026-08-17, right after #33
    (Audit). The user pasted the full 47-section Configuration spec (saved
    verbatim as `CONFIGURATION_MODULE_SPEC.md`) with no scope signal either
    way — same genuine ambiguity as #32/#33, asked the same two clarifying
    questions via `AskUserQuestion`. The user chose **full build, all 47
    sections** + full rigor, a third data point confirming the "ask when
    ambiguous" pattern surfaces whatever the user actually wants rather than
    nudging toward a smaller build. Built `api/configuration.ts` (~1000+
    lines, ~150 exported symbols) covering: history/versioning + a real
    Draft→Submitted→Reviewed→Approved→Published approval workflow for
    `criticalConfigKeys` (auth policy, MRN format, invoice numbering,
    consent default scope, HL7 mapping, FHIR base URL); Organization/
    Hospital profile + a real structure tree built from `facilities[]`;
    General System Settings; Localization (4 languages, RTL/LTR); Users &
    Access (13 roles × 16 granular permissions — never a bare `ADMIN =
    EVERYTHING`, per the spec's own explicit instruction); Patient
    Configuration (MRN format with a live preview); Appointment
    Configuration (scheduling rules only — Appointment Types stay owned by
    the Appointments module); Clinical Settings (a link-out directory to
    every clinical module's own real Settings tab, plus nursing shifts/
    ratios and the specialty catalog as the only genuinely new items with
    no other home); Financial/Billing + Insurance Configuration; Notification
    events + Communication provider configs; full Interoperability (HL7 +
    FHIR + Mirth channels with start/stop + API clients with revoke +
    Webhooks); Security Configuration; Audit Configuration (what gets
    audited, not the audit log itself — that stays owned by #33); Data
    Retention policies (never a single hardcoded universal period) +
    Backup Configuration; Document + Consent type/template configuration;
    Master Data (countries/currencies + real terminology-system references:
    ICD-11/SNOMED CT/LOINC/RxNorm/DICOM/UCUM); a genuinely working
    most-specific-wins scope resolver (`resolveSetting()`, walking
    department→branch→hospital→organization→country→global) backing
    `SystemSetting`, demoed live via a toggle between "Hospital default"
    and "Cardiology dept" that visibly picks a different resolved value;
    Workflow/Approval/Queue Configuration; System Numbering (9 entity
    formats with live preview) + Feature Flags; Maintenance mode/read-only
    mode + Environment metadata (secrets-managed-by only, never a real
    secret — matches the spec's own explicit instruction); and Import/
    Export (`exportConfiguration()` explicitly excludes API keys/client
    secrets/credential references, always masked references like "Stored
    in Azure Key Vault — ref kv-fhir-client-secret", never real values).
    Every mutation function routes through an internal `recordConfigChange()`
    that logs to `configurationHistory` and bumps a per-key version counter
    — the spec's own closing §47 rule ("every important configuration
    should have: Scope + Version + Validation + Approval + Audit +
    Rollback") applied for real, not just diagrammed. Proactively prefixed
    every generic-sounding export before writing a line of barrel code;
    4 separate `Grep` passes across the full ~150-symbol surface against
    every other file in `api/` came back with zero collisions — continuing
    Emergency/Reports/Audit's "prefix up front" discipline. One real
    `tsc` catch (not a collision): 6 occurrences of
    `(x as Record<string, unknown>)[key]` failed TS2352 against the
    strongly-typed config interfaces (no index signature) — fixed via
    `as unknown as Record<string, unknown>` across all 6. 23 panel
    components built in `components/configuration/`, wired into a 20-tab
    `ConfigurationManagement.tsx` page — `tsc --noEmit` clean on the very
    first pass once the page was assembled (all ~150 prop/return-type
    pairings matched correctly), production build clean (same two
    pre-existing unrelated failures noted since #30). Playwright-verified
    27/27 — all 20 tabs render without artifacts, a feature-flag toggle
    genuinely flips state through the mock API, a General Settings edit
    enables and submits the Save button, and the Export dialog opens with
    a real JSON preview whose secrets are confirmed masked before closing
    cleanly. Zero console errors. Standard cleanup done. **Configuration is
    now a fully complete module** — every section from #16's original
    22-item checklist is now a real build.
35. ~~Alerts & Notifications — full module~~ ✅ done 2026-08-17, right after
    #34 (Configuration). The user pasted the full 39-section Alerts &
    Notifications spec (saved verbatim as
    `ALERTS_NOTIFICATIONS_MODULE_SPEC.md`) with no scope signal either way —
    same genuine ambiguity as #32-34, asked the same two clarifying
    questions via `AskUserQuestion`. The user chose **full build, all 39
    sections** + full rigor — a fourth data point confirming the pattern
    genuinely reflects what the user wants each time rather than nudging
    toward a smaller build. Replaces the old `AlertsCenter.tsx` placeholder.
    Built `api/alerts.ts` (~750 lines) covering: the full `Alert` lifecycle
    (new→acknowledged/in-progress→resolved/escalated/dismissed) across all
    15 categories from spec §4-18 (Clinical/Emergency/Laboratory/Pharmacy/
    Inventory/Appointment/Admission-Discharge/Nursing/Surgery/Radiology/
    Billing/Insurance/Patient/System/Security), ~32 curated seed alerts
    cross-referencing real patient/staff/department data from earlier in
    the session; Escalation Policies (§24) with real per-category/severity
    level chains (mirroring the spec's own 5/10/15/20-minute Laboratory
    example); an Alert Rules Builder (§23, WHEN/AND/THEN shape) and a
    separate, simpler Notification Rules table (§22, the event→condition→
    channel→escalation routing shape) — kept as two distinct data
    structures since the spec itself shows two different example formats;
    multi-language Notification Templates (§20-21, English/Arabic/Urdu
    variants of the same event with live `{{token}}` substitution preview);
    full delivery tracking (§29, CREATED→QUEUED→SENT→DELIVERED→READ→
    ACKNOWLEDGED→FAILED→RETRYING) with a real Push→SMS→Email channel-
    fallback retry mechanism (§30); Notification Preferences (§27, with
    Critical-severity Push+SMS hard-locked on per the spec's own explicit
    safety rule) and Quiet Hours (§28, critical always bypasses); and a
    Reports rollup (§37) computed from the real Alert/Notification records.
    Explicitly did NOT build §31-35 (Kafka event queue, a dedicated
    notification-service microservice, its own DB schema) as frontend
    screens — backend/architecture concepts "for later," same treatment
    Audit and Configuration gave their own backend-only sections. Real
    cross-module integration, not a duplicate alerting system: the
    Critical Lab Result and Critical Imaging Finding seed alerts route
    their acknowledge action through to Laboratory's and Radiology's own
    real `acknowledgeCriticalAlert`/`acknowledgeRadiologyCriticalFinding`
    functions so state never diverges; the Dashboard's "Live System
    Signals" pulls real current counts straight from Inventory/Laboratory/
    Radiology/Security's own alert-computation functions rather than a
    stale snapshot; the Channels tab reads Configuration's own
    `getCommunicationProviders()` directly instead of duplicating a second
    provider registry. Proactively prefixed every export (`NotificationRecord`
    instead of bare `Notification`, specifically to avoid shadowing the
    browser DOM `Notification` global) — zero collisions found in a
    dedicated `Grep` pass before registering in the barrel. Tab structure
    (15 tabs) follows the spec's own §38 "most important frontend pages"
    list exactly. **Playwright caught one real bug, not a test flake**:
    `mockRequest()` (the shared mock API client) resolves with the exact
    same object/array reference it was given rather than cloning it — so a
    handler that calls `setState()` with that identical reference and no
    other accompanying state change makes React bail out of re-rendering
    (Object.is sees no change at the top-level reference, even though a
    nested field was genuinely mutated). This silently broke the Alert
    Rules toggle and the Quiet Hours toggle, whose handlers only touched
    their own isolated state; found by a repeatable "toggle click, state
    unchanged" Playwright failure, confirmed by checking `mockRequest`'s
    implementation rather than assumed. Fixed by spreading every mutation's
    return value into a fresh reference before `setState` across all
    alert-lifecycle and preference handlers — the Configuration module's
    equivalent toggles happened to work only because their handlers also
    triggered an unrelated state refresh alongside them, not because the
    underlying pattern was safe; worth checking for elsewhere if a future
    module's toggle silently doesn't visually update. `tsc --noEmit` clean
    (only the two pre-existing unrelated failures), production build clean.
    18 new components in `components/alerts/` (a shared `AlertListTable`
    reused by Alert Center/Critical Alerts/My Alerts, `ConfigToggleRow`
    reused from Configuration for the Alert Rules enable switch). Playwright-
    verified 23/23 — all 15 tabs, an acknowledge→escalate workflow on a
    real seed alert, an alert-rule toggle, a notification retry, a quiet-
    hours toggle, and the template live-preview token substitution. Zero
    console errors. Standard cleanup done. **Alerts & Notifications is now
    a fully complete module.**
36. ~~Admin Dashboard + Reception Dashboard — real-data refactor~~ ✅ done
    2026-08-17, right after #35 (Alerts). The user pasted a 35-section
    Admin/Reception dashboard design spec (saved verbatim as
    `ADMIN_RECEPTION_DASHBOARD_SPEC.md`) with explicit framing attached this
    time — "add this like type of refactoring... think and do the best" —
    a direct instruction, not the usual ambiguous paste, so no
    `AskUserQuestion` this round. Rewrote `api/dashboard.ts` from a
    self-contained file of fabricated placeholder arrays into a genuine
    cross-module aggregation layer, same discipline as `reports.ts`/
    `audit.ts` — every number now comes from a real module: `beds.ts`
    (`getBedDashboard`/`getOccupancyAnalytics`), `appointments.ts`
    (`getAppointmentDashboard`/`getTodayQueue`/`getAppointments`),
    `emergency.ts`, `billing.ts` (`getBillingDashboard`/`getClaimsDashboard`/
    `getInvoices`), `laboratory.ts`/`radiology.ts`/`ot.ts`/`pharmacy.ts`
    dashboards, `configuration.ts`'s real `getMirthChannels()` status,
    `alerts.ts`'s real `getCriticalAlerts`/`getAlerts`, `audit.ts`'s real
    `getAggregatedModuleAuditLog()`, `patients.ts`'s real search/duplicate
    queue, and `staff.ts`'s real schedule/role data. New exports:
    `getAdminOverviewKpis`, `getTodaysActivityBreakdown`,
    `getTodaysPatientsByDepartment`, `getLiveHospitalStatus` (a per-module
    traffic light with real thresholds — Emergency/Laboratory/Pharmacy/
    Radiology/OT/Billing/Integration), `getStaffStatusSummary`,
    `getReceptionOverviewKpis`, `getPatientQueueByDepartment`,
    `getDoctorStatusBoard` (Available/With-Patient/Off-Duty only —
    deliberately not fabricating "On Break"/"Running Late" since nothing in
    the data model tracks staff breaks or lateness), `getPatientsRequiringAttention`
    (missing insurance, overdue invoices, possible duplicates via the real
    MPI `getDuplicateQueue()`, unconfirmed appointments — each a real
    computed exception, not an invented checklist), `getFrontDeskAlerts`
    (reuses `alerts.getAlerts()` filtered to reception-relevant categories).
    `HospitalAdminDashboard.tsx` rebuilt: greeting header + a real facility
    selector (`facilities.ts` genuinely seeds 3 facilities under one parent
    organization), 8 KPI cards, a same-day activity bar comparison (kept
    honest — every appointment/admission record in this mock dataset is
    dated "today," so a real 7-day trend line isn't computable without
    fabricating numbers), Live Hospital Status, Critical Alerts, Bed
    Occupancy, Today's Operations, Financial Overview, Appointment Overview,
    Staff Status, Recent Activity (the real Audit aggregation — "connects
    beautifully with your Audit module," per the spec's own words),
    and Quick Actions (real navigation to each owning module, not
    duplicate inline forms — the old fake `NewAdmissionDrawer` was deleted
    since Beds already owns the real admission flow).
    `ReceptionDashboard.tsx` rebuilt: 4 KPI cards, a live Patient Search
    widget (wired to the real `patients.getPatients({search})`), Quick
    Actions, a real Today's Appointments table with a working Check-In
    action (`appointments.checkInAppointment`), Patient Queue by
    Department, Doctor Status, Patients Requiring Attention, Front Desk
    Alerts. Two now-unused legacy components (`NewAdmissionDrawer.tsx`,
    `ReceptionStatCard.tsx`) deleted rather than left as dead code. Also
    fixed a barrel-ordering inconsistency this refactor caused:
    `dashboard.ts` used to sit second in `api/index.ts` (near-zero
    dependencies), but now depends on almost every other module — moved
    its `export *` line to the end and rewrote the ordering comment (this
    is documentation only, `export *` order has no runtime effect since
    every file imports directly from its dependency, never through the
    barrel — but worth fixing for anyone tracing the dependency graph).
    `tsc --noEmit` and production build both clean. The one Playwright
    failure was a test-timing issue, not a product bug: the KPI-card check
    ran before the mock API's 250ms latency resolved; fixed by waiting on
    a real rendered value first. Verified 14/14 — every widget's real data
    also confirmed via a full-page screenshot review, not just selector
    presence checks (KPIs, Live Hospital Status, real critical alerts by
    name, and real ward occupancy percentages all visually correct).
    Standard cleanup done.
37. ~~Facilities — Operations update (Maintenance/Equipment/Incidents/Overview)~~
    ✅ done 2026-08-17, right after #36. The user pasted a 62-section
    Facilities spec (saved verbatim as `FACILITIES_MODULE_SPEC.md`) with
    explicit scope framing — "add these things in the facilities like type
    of update... do ur best" — read as an UPDATE to the already-shipped
    4-tab Facilities module (Locations/Departments/Services/Wards & Beds),
    not a literal 62-section rebuild. Built the highest-value real subset
    in a new `api/facilityOps.ts` (positioned after `staff.ts` in the
    barrel so it can resolve real staff/department/facility names — a
    dependency `facilities.ts` itself can't have, since `facilities.ts`
    sits before `staff.ts`): a real Facilities Overview dashboard (spec
    §2-3 — KPIs computed from the real physical hierarchy + new operational
    data, plus a Facility Status widget reusing the real `Facility.status`
    field rather than a second parallel status system); a Maintenance tab
    with ONE real Work Order lifecycle (spec §18-23 shows Request→Work
    Order as two steps, deliberately collapsed into one entity here — a
    request becoming a work order is the same ticket progressing through
    status, not two records that could drift apart) through the spec's own
    9-state status list (New→Assigned→Scheduled→In Progress→On Hold→
    Completed→Verification→Closed→Cancelled); an Equipment tab explicitly
    scoped to FACILITY INFRASTRUCTURE only (generators/HVAC/elevators/fire
    alarms/medical gas/electrical panels, per spec §26's own examples) —
    clinical/biomedical equipment stays owned by Radiology's and OT's own
    real Equipment tabs and Laboratory's own analyzers, never duplicated;
    and an Incidents tab with a simplified 5-state workflow (spec §42-43's
    own 8-step diagram condensed to Reported→Investigating→Corrective
    Action→Resolved→Closed, capturing the same real lifecycle without
    over-modeling every micro-step). Deliberately did NOT build: a Building
    layer above the existing Facility→Floor→Ward→Room→Bed chain (no
    Building entity exists in the real model — adding one would be a
    structural rework, not an update), Wings/Zones, a Facility Map/digital
    floor-plan upload (would need file-upload infrastructure with no real
    backing data), Utilities/Power-Outage/Fire-Safety/Housekeeping/Waste/
    Security-Zones/Parking/Ambulance, Vendors/SLA/Documents/Renovation
    Projects, and the backend REST/Kafka/RBAC sections (§59-61) — the same
    "for later" treatment Configuration and Alerts gave their own
    backend-only sections. Proactively prefixed every new export
    (`FacilityWorkOrder`/`FacilityEquipment`/`FacilityIncident`, never
    bare `Equipment`/`WorkOrder`/`Incident`) — a dedicated `Grep` pass
    found zero collisions before registering in the barrel. `tsc --noEmit`
    and production build both clean on the first pass. Playwright-verified
    16/16 — all 7 tabs (new Overview tab is now the default landing tab),
    a full create-work-order→advance-status workflow, an equipment status
    change, and a full create-incident→advance-status workflow. One
    test-script-only issue surfaced and fixed along the way, not a product bug:
    the always-mounted (translated off-screen, not unmounted) `FacilityFormDrawer`
    has its own Active/Maintenance status-picker button sharing exact text
    with the new "Maintenance" tab — `.last()` picked the wrong one;
    fixed by using `.first()` since real tab buttons render before every
    drawer in DOM order, the same always-mounted-drawer lesson this
    session has hit repeatedly (Inventory/Emergency/Configuration/Alerts).
    Zero console errors. Standard cleanup done.
38. From there: Billing Phase 5 (Analytics), Staff & Workforce refinements
    (Roles/Credentials), the remaining Emergency spec sections (Treatment
    Areas/Bays/Medication Administration/Procedures/Consultations/Staff
    Assignment/Equipment/Search screens), the remaining Reports sections
    (Report Builder/Scheduled Reports/Export Center/Multi-Hospital/
    Drill-Down/the ICU-Nursing-Doctor-Referral-Insurance-Inventory-
    Integration-Consent report families), the next Organization Hierarchy
    phase (see #15's deferred list), the AppShell mobile-responsiveness
    gap noted in #17, or the backlog items documented in #37's own "not
    built" list (Facility Buildings/Zones/Map, Utilities, Vendors/SLA).
    Also noted: `doctor-portal` is a separate module the user wants to
    revisit and expand later, to the same depth as hospital-admin — not
    proactively, only when redirected there.

Everything else in the tree stays as backlog — pull the next item when ready,
don't build ahead of what's been reviewed.
