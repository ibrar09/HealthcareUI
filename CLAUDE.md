# Healthcare Platform Frontend — Engineering Standards

This is a production-grade, enterprise healthcare frontend (React + TypeScript + Vite +
Tailwind, "Clinical Ink" design system). It serves patients, doctors, nurses,
receptionists, lab/radiology staff, pharmacists, hospital admins, and platform admins.
It may handle sensitive healthcare information, so **security and privacy are
first-class architectural requirements, not afterthoughts.**

Apply every rule below to all work in this repo, by default, without being re-asked.
See `README.md` for current folder structure, `TEAM_WORKFLOW.md` for the module
ownership model, **`HMS_DOMAIN_STANDARDS.md`** for the full international
domain-model spec (FHIR/HL7/DICOM/ICD-11 alignment), and
**`HOSPITAL_ADMIN_MODULE_MAP.md`** for the Hospital Admin module's full screen
list and build order, and **`BILLING_REVENUE_MODULE_SPEC.md`** for the Billing
& Revenue section's full domain spec — this file is the engineering bar those
structures must meet.

## Non-negotiable qualities

Secure · fast · highly responsive · scalable · maintainable · accessible ·
mobile-responsive · modular · fault-tolerant · easy to test · easy to monitor ·
ready for international deployment.

---

## 1. Domain model & international interoperability standards

Full reference: **`HMS_DOMAIN_STANDARDS.md`** — read the relevant section there
before designing any new clinical/administrative module's data model or forms
(e.g. read its Observation section before building a Vitals screen). This section
is the always-applied summary.

**The one rule:** three layers, always —

```
USER INTERFACE  →  OUR DOMAIN MODEL  →  INTEROPERABILITY MODEL (FHIR/HL7/DICOM)
```

Don't make UI/data field names blindly equal FHIR fields. Design the UI around the
clinical workflow; make sure the underlying data *can* map cleanly to the standard
underneath. A doctor should never see `Observation.effectiveDateTime` — they see
"Recorded: 15 Aug 2026 10:30." The mapping lives one layer down, not in the UI.

**Never:**
- A single `patient_id` field as the whole identity model — patients have multiple
  identifiers (MRN, national ID, passport, insurance ID, universal health ID),
  each with its own type/value/issuer/period/status.
- `gender = "Male/Female only"` when the required profile needs more.
- `diagnosis = free text` or `medication = text` as the *only* option — back them
  with coded/structured values (ICD-11, RxNorm/jurisdictional terminology) even if
  the visible UI is a simple field.
- `lab_result = one text box` — structure it (value, unit, date, performer,
  reference range, interpretation, status).
- One generic "order" form for lab/imaging/procedure/medication — these are
  different workflows (`ServiceRequest` vs. `MedicationRequest`) with different
  fields and lifecycles.
- One "Medication Status" field trying to represent prescribing, dispensing, and
  administration at once — that's three distinct stages
  (MedicationRequest → MedicationDispense → MedicationAdministration).
- Collapsing a practitioner's identity and their department/role assignment into
  one field — a doctor can hold different roles at different facilities
  (Practitioner vs. PractitionerRole).
- Inventing random appointment/order status strings instead of the standard
  lifecycle (e.g. appointments: Proposed → Pending → Booked → Arrived →
  Fulfilled/Cancelled/No-show).
- A single hardcoded triage methodology — it's jurisdiction/hospital-specific,
  keep it configurable.

**Core mapping (our concept → standard):** Patient→Patient · Hospital→Organization
· Department/Facility→Organization/Location · Doctor→Practitioner · Doctor's
role→PractitionerRole · Visit→Encounter · Vital sign→Observation ·
Diagnosis→Condition · Allergy→AllergyIntolerance · Lab/Imaging order→ServiceRequest
· Lab/Imaging report→DiagnosticReport · Prescription→MedicationRequest ·
Care plan→CarePlan · Clinical document→DocumentReference · Consent→Consent ·
Audit→AuditEvent · Data provenance→Provenance. Full table in
`HMS_DOMAIN_STANDARDS.md` §52.

**Don't over-standardize the UI.** International standard ≠ ugly technical
interface — never surface raw FHIR field names to a clinician or patient. Design
the human-readable label first ("Blood Pressure — 120/80 mmHg"), then make sure a
structured field backs it. This is adopted incrementally, module by module, as
we build — not a single rewrite of what's already shipped.

## 2. Architecture

- Feature/module-based. No giant global `components/` folder holding every component.
- Modules have clear boundaries; avoid unnecessary cross-module dependencies.
- Follow the `shared vs. module-local` rule already in `README.md`: keep UI in
  `modules/<name>/components/` until a *second* module genuinely needs it, then
  promote via a small PR. Never pre-build into `shared/` "just in case."

## 3. Security — highest priority

**Never trust the frontend.** The backend must always enforce authorization; frontend
checks are for UX and route-gating only. A hidden button is not security.

**Authentication**
- Don't store long-lived auth credentials in `localStorage`/`sessionStorage`/URL params.
- Avoid exposing tokens to JS unnecessarily; prefer secure cookies (`HttpOnly`,
  `Secure`, `SameSite`) where the backend supports it.
- Cover: login, logout, session expiration, refresh/session handling, account lock,
  MFA, password reset, email/phone verification, session invalidation.
- Never put tokens in URLs.

**Authorization**
- Role-based *and* permission-based (e.g. `PATIENT_VIEW`, `MEDICAL_RECORD_CREATE`,
  `LAB_RESULT_VIEW`, `PRESCRIPTION_CREATE`, `CONSENT_GRANT`, `CONSENT_REVOKE`,
  `AUDIT_LOG_VIEW`). Don't rely on roles alone.
- UI actions (view/edit/download/share/revoke) should be gated dynamically off
  permissions, via a reusable `<Can permission="...">` pattern.

**Data privacy** — never expose medical info in URLs, browser history, logs, console
output, analytics events, error messages, screenshots, or notifications. No
`console.log(patient)` / medical record / lab result, ever, and no such debug logging
shipped to production. No sensitive patient data to third-party analytics without
explicit approval and protection.

**XSS** — never inject untrusted HTML. Avoid `dangerouslySetInnerHTML`; if HTML must
render, sanitize → validate → render. Treat all user-generated content (names, notes,
messages, uploaded metadata) as untrusted.

**API security** — one centralized API client (already `shared/lib/api/client.ts`)
handling auth, headers, errors, timeouts, retries, cancellation, correlation/request
IDs. Never duplicate API config per module.

**Network** — HTTPS only, ever. Configure TLS, secure cookies, CORS, CSP, HSTS,
referrer-policy, permissions-policy at the server/CDN layer. Never
`Access-Control-Allow-Origin: *` on authenticated sensitive APIs.

**Env vars** — never hardcode secrets/keys/passwords/JWT secrets. Frontend env vars
are NOT secrets — anything shipped to the browser is public. Only non-secret config
(`API_BASE_URL`, `APP_ENV`, feature flags, public client IDs) belongs there.

## 4. Performance

- No loading the whole app upfront — route-based and component-level lazy loading /
  code splitting per major module (`/patient/*`, `/doctor/*`, `/laboratory/*`, ...).
- Keep bundles small. Before adding a dependency: do we need it, how large, does it
  duplicate something we have, is it maintained, what's the bundle impact? Remove
  unused deps, dead code, unused imports.
- React perf: `React.memo`/`useMemo`/`useCallback`/stable props where it actually
  matters — don't blindly memoize everything. Split large components (e.g. a
  `PatientDashboard` should compose `SummaryCards`, `Appointments`, `Medications`,
  etc., not be one 2000-line file).
- Server state (patient records, appointments, lab/imaging results, doctors,
  hospitals, notifications) belongs in a dedicated server-state layer (e.g. TanStack
  Query) for caching, dedup, background refetch, pagination, retry — not dumped into
  global Redux/Zustand state. `authStore.ts`-style client state is for actual client
  state (current user/role/token), not server data.
- Cache low-sensitivity reference data (hospital list, specialties, static config)
  more freely; be conservative caching medical records/lab results/prescriptions/
  consent — never let stale sensitive data drive a clinical decision.
- Avoid duplicate/redundant API requests; debounce search inputs (~300ms) for
  patient/doctor/hospital/medicine/lab search.
- Paginate — never fetch thousands of records at once. Server-side pagination/
  filtering/sorting for large tables; virtualize very large row counts.

## 5. Files & imaging

- Uploads: validate type and size client-side, but the backend must validate too
  (never trust the extension). Support progress, cancel, retry. Backend does
  malware/virus scanning.
- Medical imaging: no loading full-res files eagerly — thumbnails, progressive/
  streamed loading, signed/access-controlled URLs, full-res only on demand.
- Documents: no permanent public URLs — authenticated request → authorization check
  → short-lived signed URL / secure stream → download.

## 6. UX resilience

- Every async operation gets loading / success / empty / error / retry states —
  never a blank screen. Skeletons and progress indicators over spinners-only;
  optimistic UI only where safe to.
- Centralized handling for 400/401/403/404/409/422/429/500/502/503/504, network
  error, timeout — with human copy (401 → "session expired", 403 → "permission
  denied", etc.), never a raw backend stack trace.
- Handle flaky networks gracefully: show connection-lost / retry / last-updated,
  never fail silently.

## 7. Accessibility & responsiveness

- Target WCAG 2.2 AA where practical: keyboard nav, screen reader support, labels,
  ARIA where needed, focus management, contrast, accessible forms/dialogs.
- Never use color alone to convey status (pair with icon/text).
- Responsive across mobile/tablet/laptop/desktop/large monitors. Patient-facing UI
  prioritizes mobile; admin/hospital dashboards prioritize desktop but stay
  responsive.
- Prefer semantic HTML (`button`, `nav`, `main`, `header`, `form`, `label`, `table`)
  over div-soup.
- Mobile: minimize JS, lazy-load/compress/responsive-size images (WebP/AVIF),
  minimize unnecessary animation and network calls.

## 8. Forms & validation

- Consistent form architecture: validation, server-side error surfacing,
  field-level errors, required-field marking, accessible labels/keyboard nav,
  autosave/draft-recovery where it matters (don't lose a long form to an accidental
  nav).
- Frontend validation is UX only, never security — backend validation is mandatory.
  Use schemas per domain object (`PatientSchema`, `AppointmentSchema`,
  `PrescriptionSchema`, `LabOrderSchema`, `ConsentSchema`).

## 9. Auditability & consent

- Send correlation/request IDs and client version with requests so the backend can
  build an audit trail (record viewed/downloaded/shared, consent granted/revoked,
  prescription created, appointment cancelled). The backend is the authoritative
  audit source — don't implement audit logging only in the frontend.
- Consent UI must make explicit: who has access, to what, why, since when, until
  when, and whether/how the patient can revoke it. Confirm sensitive actions
  explicitly — never make consent ambiguous.

## 10. Notifications & storage

- Never put sensitive medical detail in a push notification body ("You have a new
  result available," not the result itself).
- Don't store sensitive medical data in `localStorage`/`sessionStorage`/IndexedDB
  unless there's a deliberate, reviewed encryption + lifecycle strategy behind it.

## 11. Logging & monitoring

- Production logs stay minimal and never include passwords, tokens, medical
  records, lab results, prescriptions, or patient identifiers.
- Monitor JS errors, API failures, page load performance, Core Web Vitals (LCP,
  INP, CLS), slow/failed requests, crash rate — using request/correlation IDs and
  anonymous technical metadata, not health data.

## 12. i18n

- Design for i18n from the start: no hardcoded UI strings — translation keys from
  day one. Support RTL alongside LTR (Arabic/Urdu are in scope), locale-aware date/
  time/number/currency formatting.
- Timestamps: never assume local timezone == server timezone. Store/exchange
  consistently with the backend; display in the user's/hospital's appropriate zone.
  This matters most for appointments, medication reminders, notifications,
  schedules, and audit events.

## 13. Dependencies & supply chain

- Before adding a package: check maintenance, known vulnerabilities, license, bundle
  size, popularity, transitive deps. Run `npm audit` regularly.
- CI/CD should run dependency scanning, secret scanning, SAST, lint, unit tests,
  build verification before anything ships.

## 14. Testing

- Unit, integration, component, E2E, accessibility, security, and performance tests
  as appropriate per module.
- Critical flows must have E2E coverage: login, patient registration, appointment
  booking, medical record viewing, consent grant/revoke, prescription creation, lab
  result viewing, document download, role/permission enforcement.

## 15. Error boundaries & feature flags

- Wrap major sections (per module) in React error boundaries — a failure in one
  non-critical section shouldn't take down the whole app.
- Gate large/risky releases behind feature flags (e.g. `TELEMEDICINE_ENABLED`,
  `NEW_LAB_UI`) instead of big-bang rewrites.

## 16. Don't over-engineer

Security and performance aren't served by piling on libraries or abstraction.
Prefer simple, predictable, well-tested, maintainable code. Every architectural
decision should have a stated reason.

---

## Definition of done (per module/feature)

Functional · responsive · accessible · secure · handles API errors · has loading/
empty/error states · enforces permissions · validates input · reviewed for
performance · has tests · has had a security pass · no sensitive console logs · no
exposed secrets · no unnecessary API calls · no obvious memory leaks · production
build succeeds.

## Before calling anything complete, ask

**Security** — Can an unauthorized user reach this? Can a user reach another
patient's data? Can sensitive data leak via the browser? Can tokens/secrets leak?
Can malicious input execute?

**Performance** — How much JS does this load? How many requests? Can they be
cached? Unnecessary re-renders? Does it work on a slow device? Is it fetching more
than it needs?

**Reliability** — What happens if the API fails / network drops / session expires /
data is empty / the request times out?

**UX** — Does the user know what's happening? Is loading obvious? Are errors
understandable and recoverable? Does it work on mobile? Is it accessible?

## Sequence for building a new module/feature

Business requirement → permissions → API contract → data model → routes → UI design
→ implementation → validation → loading/error/empty states → authorization checks →
API-call optimization → caching → tests → security review → performance review →
production verification.

## Absolute rules

**Never:** store secrets in the frontend · trust frontend-only authorization · put
tokens in URLs · log patient medical data, passwords, or tokens · expose public
medical-file URLs · load thousands of records unnecessarily · load the whole app at
startup · render huge tables without virtualization/pagination · fire duplicate API
requests · swallow API errors silently · ignore accessibility · hardcode sensitive
config · use unsafe HTML rendering · add a dependency without a reason.

**Always:** validate input · enforce backend authorization · use secure auth · use
HTTPS · lazy-load large modules · cache appropriate server data · paginate large
datasets · optimize images · handle loading/error/empty states · monitor
performance · test critical workflows · protect sensitive healthcare information ·
support RTL/i18n · keep modules isolated · keep the frontend maintainable.

## Target end-state architecture

```
                    Healthcare Frontend
                           │
             ┌─────────────┴─────────────┐
             │                           │
        Shared Platform              User Apps
             │                           │
     ┌───────┼────────┐          ┌───────┼────────┐
     │       │        │          │       │        │
   Auth   Security  Design     Patient  Doctor  Hospital
   API    System    System
     │
     └────────────────────────────────────────────┐
                                                    │
                    Feature Modules                │
                                                    │
     ┌──────────┬──────────┬──────────┬──────────┤
     │          │          │          │          │
  Records     Lab      Imaging    Medication  Appointment
     │          │          │          │          │
     └──────────┴──────────┴──────────┴──────────┘
                          │
                     Backend APIs
                          │
                API Gateway / Services
                          │
                  Healthcare Backend
```

The goal isn't just a working frontend — it's one that stays fast, secure, and
maintainable as the platform grows from 10 modules to 30 to 100+.
