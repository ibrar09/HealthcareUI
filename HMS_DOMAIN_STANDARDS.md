# International-Standard HMS Domain Model & Interoperability Spec

This is the frontend's domain-modeling blueprint, companion to `CLAUDE.md` (which
covers engineering practice — security, performance, a11y). This file covers *what
our data model represents* and *how it stays mappable to international healthcare
standards*, even though this frontend currently runs on mock data with no backend.

Every module built from here forward — field names, forms, list columns, detail
pages — should be designed against this document, not invented ad hoc. See
`CLAUDE.md` for the condensed, always-applied version of the rules below; this file
is the full reference to consult when actually building a module (e.g. read §18
before building a Vitals/Observations screen, §29–32 before Pharmacy).

## 1. Standards we build around

| Area | Standard / Framework |
|---|---|
| Healthcare interoperability | HL7 FHIR |
| Legacy healthcare messaging | HL7 v2 |
| Medical imaging | DICOM |
| Diagnoses/classification | WHO ICD-11 |
| Clinical terminology | SNOMED CT* |
| Laboratory terminology | LOINC* |
| Medication terminology | RxNorm / jurisdictional drug terminology* |
| Clinical documents | HL7 FHIR / DocumentReference |
| Consent | FHIR Consent |
| Audit | FHIR AuditEvent |
| Provenance | FHIR Provenance |
| Digital health guidance | WHO SMART Guidelines |
| Identity | FHIR Patient + Identifier concepts |
| Security | OAuth 2.0 / OpenID Connect / SMART on FHIR where applicable |

\* Availability/licensing varies by jurisdiction — use the appropriate licensed or
locally mandated terminology, not a hardcoded assumption.

WHO identifies ICD-11 as the current global classification for diseases and
health-related conditions, intended to improve interoperability and comparability
of health data.

## 2. The one rule that matters most

Three layers, always:

```
USER INTERFACE  (Patient / Doctor / Nurse / Admin screens)
        ↓
OUR DOMAIN MODEL  (Patient / Encounter / Appointment / Order / Medication / Lab / Billing)
        ↓
INTEROPERABILITY MODEL  (FHIR / HL7 / DICOM / Terminologies)
```

**Don't make UI/data field names blindly equal FHIR fields.** Design the UI around
the clinical workflow; make sure the underlying data can map cleanly to the
standard underneath. A doctor should never see `Observation.effectiveDateTime` —
they should see "Recorded: 15 Aug 2026 10:30." The mapping lives one layer down.

## 3. Hospital Dashboard

Not a FHIR resource — an operational dashboard built from standardized data.

**Cards:** total registered patients · today's appointments · checked-in patients ·
active encounters · emergency patients · current admissions · discharges · bed
occupancy · pending lab orders · pending lab results · pending imaging · pending
prescriptions · outstanding billing · insurance claims.

**Filters:** facility · department · date · provider · encounter type · status.

## 4. Hospital / Organization — FHIR `Organization`

**Organization:** name · type · identifier · legal name · phone · email · website ·
address · country · status.

**Facility:** name · identifier · type · address · contact · parent organization ·
status.

Hierarchy: `Healthcare Organization → Hospital → Facility → Department → Unit`.

## 5. Patient — FHIR `Patient`

One of the most important screens.

- **Identity:** patient ID, identifier type/value/issuer/period/status.
- **Name (FHIR-style):** given name, family name, prefix, suffix, preferred name.
- **Demographics:** date of birth, administrative sex/gender per the chosen
  jurisdiction/profile, marital status where required, multiple-birth info where
  applicable.
- **Contact:** phone, email, address, communication preference, emergency contact
  (name/relationship/phone/address).
- **Status:** active/inactive. **Managing organization.**

## 6. Patient Identifiers — never a single "Patient ID" field

```
Identifier
├── Hospital MRN
├── National Identifier
├── Passport
├── Insurance Identifier
├── External Organization ID
└── Universal Health Identifier
```

Each identifier carries: type, value, issuing organization, period, status,
verification status where applicable. Critical for a multi-hospital universal
platform — one patient, many identifiers from many issuers.

## 7. Patient Search

**Search by:** name, identifier, MRN, national identifier, phone, DOB, email,
external identifier.

**Results show:** patient, MRN, DOB, identifier, phone, status, organization.
Frontend search is UX only — the backend enforces authorization on what's
actually returned.

## 8. MPI (Master Patient Index)

**Pages:** patient matching · possible duplicates · duplicate review · merge ·
unmerge · identity history · external identifiers · universal identity.

**Matching screen pattern:**

```
Patient A                          Patient B
Ahmed Khan                    VS   Ahmad Khan
DOB: 1990-01-10                    DOB: 1990-01-10
Phone: XXXXX                       Phone: XXXXX

Match confidence: 96%

[Review]  [Merge]  [Not Duplicate]
```

## 9. Practitioner — FHIR `Practitioner`

ID · name (prefix/given/family) · gender where applicable · contact · address ·
qualification · license · identifier · specialty · status.

## 10. Practitioner Role — FHIR `PractitionerRole`

A doctor is **not** simply "Doctor = Cardiology." The same person can hold
different roles at different organizations/facilities:

```
Dr. Ahmed → Practitioner → PractitionerRole
                              ├── Organization A
                              ├── Cardiology
                              ├── Riyadh Branch
                              └── Consultant
```

**Always separate Person/Practitioner from Role/Organization/Location** — never
collapse a doctor's identity and their department assignment into one field.

## 11. Department

Name · identifier · type · parent department · facility · location · status ·
services. Examples: Cardiology, Emergency, Pediatrics, Laboratory, Radiology,
Pharmacy, ICU.

## 12. Location — FHIR `Location`

Don't model only "room." Model the full chain:

```
Hospital → Building → Floor → Ward → Room → Bed
```

Each location: name, identifier, type, address, physical location, managing
organization, status.

## 13. Appointment — FHIR `Appointment`

ID · status · appointment type · service type · specialty · reason · description ·
start/end/duration · priority · patient · practitioner · location · organization ·
notes.

**Use the standard appointment lifecycle, don't invent random states:**
Proposed → Pending → Booked → Arrived → Fulfilled | Cancelled | No-show |
Entered-in-error.

## 14. Schedule — FHIR `Schedule`

Practitioner · location · service · planning horizon · active/inactive.

## 15. Slot — FHIR `Slot`

Each slot: start, end, status, schedule, appointment reference.

```
09:00 ─ Available
09:30 ─ Booked
10:00 ─ Available
10:30 ─ Blocked
11:00 ─ Available
```

## 16. Encounter — FHIR `Encounter`

The central clinical interaction. ID · status · class · type · patient ·
practitioner · organization · location · period · reason · diagnosis · admission ·
discharge · service provider. Types: outpatient, emergency, inpatient,
observation, virtual/telehealth (implementation-dependent).

## 17. Encounter Timeline

```
Patient → Appointment → Arrival → Encounter → Vitals → Assessment
  → Orders → Results → Treatment → Discharge
```

## 18. Observation — FHIR `Observation`

Where measurements get standardized: blood pressure, heart rate, temperature,
respiratory rate, SpO₂, weight, height, BMI, pain, lab observations, device
measurements.

UI shows the human-readable value (e.g. "Blood Pressure — 120/80 mmHg"); the
record underneath retains: value, unit, date/time, performer, method where
relevant, reference range where applicable, interpretation, status.

## 19. Clinical Condition / Diagnosis — FHIR `Condition`

Diagnosis/problem · clinical status · verification status · onset · recorded date ·
severity · body site · clinical code. Terminology layer should support the
applicable ICD-11 implementation for the jurisdiction.

## 20. Allergy — FHIR `AllergyIntolerance`

Substance · clinical status · verification status · category · criticality ·
reaction · manifestation · severity · onset · recorded date · recorder. Display
prominently and unmissably (e.g. "⚠ PENICILLIN — Severe — Verified").

## 21. Clinical Notes

FHIR-compatible concepts: clinical documentation, Composition, DocumentReference,
encounter context. Fields: note type, author, date/time, encounter, subject,
content, status, signature, version.

## 22. Clinical Orders — never one generic "order" form

```
ServiceRequest
  ├── Laboratory
  ├── Imaging
  ├── Procedure
  └── Other services

MedicationRequest → Medication

Referral / Care workflow
```

## 23. Laboratory Order — FHIR `ServiceRequest`

Patient · encounter · ordering practitioner · requested service · priority ·
reason · clinical information · specimen where applicable · requested date ·
instructions · status.

## 24. Laboratory Result — FHIR `Observation` (+ often `DiagnosticReport`)

```
Diagnostic Report → Observations → CBC → Hemoglobin, WBC, Platelets, ...
```

**Result status lifecycle:** Registered → Preliminary → Final → Amended →
Corrected → Cancelled.

## 25. Diagnostic Report — FHIR `DiagnosticReport`

Report ID · status · category · code · subject · encounter · effective date ·
issued date · performer · results · conclusion · presented form · images/references.

## 26. Specimen — FHIR `Specimen`

ID · type · subject · collection date/time · collector · collection method · body
site · quantity · condition · received time · processing status.

## 27. Radiology

```
ServiceRequest → ImagingStudy → DiagnosticReport → DICOM/PACS
```

DICOM handles the imaging ecosystem itself; FHIR wraps the order and report.

## 28. Imaging Study — FHIR `ImagingStudy`

Study ID · patient · modality · study date · body site · procedure · series ·
instance count · PACS reference · viewer link. E.g. "CT Chest — 12 Aug 2026 — CT —
3 Series — 342 Images — [Open Viewer]".

## 29. Medication — three distinct workflow stages, never one field

FHIR explicitly separates these; our UI must too:

```
Prescription (MedicationRequest) → Dispensing (MedicationDispense)
  → Administration (MedicationAdministration)
```

Not one giant "Medication Status" field trying to represent all three.

## 30. MedicationRequest

Medication · patient · encounter · prescriber · status · intent · dosage · route ·
frequency · duration · quantity · refills · reason · instructions.

## 31. MedicationDispense

Prescription · medication · quantity · dispensed quantity · performer · location ·
when prepared · when handed over · status.

## 32. MedicationAdministration

Patient · medication · encounter · performer · administration time · dose · route ·
site · status · reason · notes.

## 33. Procedure — FHIR `Procedure`

Status · patient · encounter · performer · location · date/time · reason · body
site · outcome · complication · report · notes.

## 34. Referral

Reason · patient · requesting practitioner · receiving practitioner ·
organization · priority · date · status · clinical information · supporting
documents · outcome. (Map to the appropriate FHIR workflow/Task pattern.)

## 35. Care Plan — FHIR `CarePlan`

Patient · status · intent · category · period · author · goal · activities ·
conditions · related encounters.

## 36. Goal — FHIR `Goal`

E.g. "Goal: Reduce blood pressure — Target: < 130/80 — Status: Active."

## 37. Admission

Admission date/time · admission type · source · reason · attending practitioner ·
destination · location · pre-admission identifier. (Maps to Encounter
hospitalization/admission concepts.)

## 38. Bed Management

```
Bed
├── Identifier
├── Location
├── Status
├── Type
├── Patient
├── Admission
└── Availability
```

Bed management is an HMS *operational* concept — FHIR mapping uses `Location` and
Encounter-related structures rather than treating "Bed" as its own universal FHIR
resource.

## 39. Nursing

Patient assignment · care plan · observations · medication administration ·
nursing notes · tasks · intake/output · handover. FHIR concepts involved: Patient,
Encounter, Observation, CarePlan, MedicationAdministration, Task, DocumentReference.

## 40. Emergency / Triage

Triage · arrival · chief complaint · symptoms · vital observations ·
acuity/priority · assigned location · practitioner · notes.

**Don't hard-code a single triage methodology globally** — different
jurisdictions/hospitals use different approved triage systems (e.g. ESI, CTAS,
Manchester). Make the acuity scale configurable.

## 41. Discharge

Discharge date/time · disposition · diagnosis · procedures · medications ·
follow-up · instructions · summary · documents.

## 42. Documents — FHIR `DocumentReference`

Document type · patient · encounter · author · organization · date · status ·
security classification · file type · size · version · document content · related
document.

## 43. Consent — FHIR `Consent`

```
Consent
├── Patient
├── Status
├── Scope
├── Category
├── Purpose
├── Period
├── Performer
├── Organization
├── Provision
└── Verification
```

UI must make this understandable to a human patient — never surface raw FHIR
terminology to them directly.

## 44. Audit — FHIR `AuditEvent`

Timestamp · actor · action · entity · patient · organization · location · outcome
· source · purpose/context. E.g. "10:32 AM — Dr. Ahmed — VIEWED — Patient Record —
Patient: Ahmed Khan — Context: OPD Encounter."

## 45. Provenance — FHIR `Provenance`

Different from audit: **audit** = who accessed/did something; **provenance** =
where clinical data came from, who created it, what activity produced it. Expose
provenance in the UI when clinically relevant (e.g. "imported from Lab X" vs.
"entered by Dr. Y").

## 46. Billing

Not simply a Patient/Encounter screen — its own financial domain model, with
healthcare relationships kept standardized underneath. Charge · service · price ·
invoice · payment · refund · insurance responsibility · patient responsibility ·
adjustment.

## 47. Insurance

Coverage · policy · subscriber · member ID · insurer · eligibility ·
authorization · claim · claim status · denial · appeal. FHIR `Coverage` and
financial/claim resources map here later.

## 48. Patient Portal Connection

```
HMS → FHIR/API → Universal Platform → Patient App
```

Patient sees: patient, appointments, encounters, conditions, observations,
diagnostic reports, medications, documents, consent, care plans — same
standardized concepts as the HMS side, not a parallel ad hoc model.

## 49. What the frontend must never do

- Never `gender = "Male/Female only"` when the required profile needs a different
  representation.
- Never `diagnosis = free text` as the *only* option.
- Never `medication = text` as the *only* option.
- Never `patient_id = one random number` as the entire identity model.
- Never `lab_result = one text box`.

Always use standardized concepts with terminology/code support underneath, even
if the visible UI is a simple field.

## 50. Standardized clinical field strategy

```
Human-readable UI            Blood Pressure [120]/[80] mmHg
        ↓
Structured clinical data     Observation { code, value, unit, date, performer }
        ↓
Interoperability             FHIR Observation
```

This pattern is how the system stays internationally interoperable while staying
pleasant to use.

## 51. Master frontend module list

01 Authentication · 02 Dashboard · 03 Organization · 04 Facilities ·
05 Departments · 06 Locations · 07 Patients · 08 Patient Identity/MPI ·
09 Practitioners · 10 Practitioner Roles · 11 Appointments · 12 Schedules ·
13 Slots · 14 Queue · 15 Encounters · 16 Clinical Records ·
17 Observations/Vitals · 18 Conditions/Diagnosis · 19 Allergies ·
20 Clinical Notes · 21 Orders · 22 Laboratory · 23 Specimens ·
24 Diagnostic Reports · 25 Radiology · 26 Imaging/PACS · 27 Medications ·
28 Pharmacy · 29 Medication Administration · 30 Procedures · 31 Emergency ·
32 Triage · 33 Inpatient · 34 Beds · 35 Nursing · 36 Care Plans ·
37 Consultations · 38 Referrals · 39 Operation Theatre · 40 ICU · 41 Discharge ·
42 Documents · 43 Consent · 44 Billing · 45 Insurance · 46 Inventory ·
47 Procurement · 48 Staff · 49 Reports · 50 Analytics · 51 Notifications ·
52 Integrations · 53 FHIR · 54 HL7 · 55 DICOM · 56 Audit · 57 Provenance ·
58 Security · 59 Administration · 60 System Health

## 52. The mapping table — keep this pinned

| Our HMS concept | Standard concept |
|---|---|
| Patient | FHIR Patient |
| Hospital | FHIR Organization |
| Department | Organization / Location |
| Facility | Organization / Location |
| Doctor | Practitioner |
| Doctor's role | PractitionerRole |
| Appointment | Appointment |
| Schedule | Schedule |
| Appointment slot | Slot |
| Visit | Encounter |
| Vital sign | Observation |
| Diagnosis/problem | Condition |
| Allergy | AllergyIntolerance |
| Lab order | ServiceRequest |
| Lab observation | Observation |
| Lab report | DiagnosticReport |
| Specimen | Specimen |
| Imaging order | ServiceRequest |
| Imaging study | ImagingStudy |
| Imaging report | DiagnosticReport |
| Prescription | MedicationRequest |
| Dispensing | MedicationDispense |
| Administration | MedicationAdministration |
| Procedure | Procedure |
| Care plan | CarePlan |
| Goal | Goal |
| Clinical document | DocumentReference / Composition |
| Consent | Consent |
| Audit | AuditEvent |
| Data origin/history | Provenance |

## 53. Don't over-standardize the UI

International standard ≠ ugly technical UI. A doctor should never see:

```
Observation.status
Observation.category
Observation.code
Observation.subject
Observation.effectiveDateTime
```

They should see:

```
Blood Pressure
Systolic     120 mmHg
Diastolic     80 mmHg
Recorded:     15 Aug 2026 10:30
Recorded by:  Nurse Ahmed
```

The data model maps to FHIR one layer down. The frontend itself stays clean and
human-friendly — always design the human-facing label first, then make sure it's
backed by a field that can map to the standard concept.

## 54. Final architecture

```
                    HMS FRONTEND
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Admin Portal     Clinical Portal    Operations
        │                │                │
        │          Doctor / Nurse       Lab/Pharmacy
        │                │                │
        └────────────────┼────────────────┘
                         │
                  DOMAIN DATA MODEL
                         │
             ┌───────────┼───────────┐
             │           │           │
           FHIR        HL7         DICOM
             │           │           │
             └───────────┼───────────┘
                         │
                INTEGRATION PLATFORM
                         │
                UNIVERSAL PLATFORM
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Hospital A     Hospital B       Lab
          │              │              │
          └──────────────┼──────────────┘
                         │
                    PATIENT APP
```

WHO's current digital-health guidance similarly emphasizes interoperable,
standards-based systems, privacy/security, scalability, and adaptation to
national contexts rather than isolated applications. This is the direction the
platform is built toward — adopted incrementally, module by module, not as a
single rewrite.
