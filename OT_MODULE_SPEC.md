# OT / Surgery Module Spec

Saved verbatim from the user's paste (2026-08-16), same treatment as
`RADIOLOGY_MODULE_SPEC.md` / `BILLING_REVENUE_MODULE_SPEC.md` / `HMS_DOMAIN_STANDARDS.md`
— a persistent reference doc for the whole build, not a one-off prompt.

**Scope note (per `HOSPITAL_ADMIN_MODULE_MAP.md`'s established `[oversight]` rule
for this section):** Operation Theatre inside hospital-admin is administrative/
workflow oversight — case lifecycle status, room board, schedule, team roster
visibility, checklist/consent/anesthesia *completion status*. It is NOT the
surgical team's own intra-operative clinical documentation workspace: no
freeform procedure-technique authoring, no clinical judgment content. Where the
spec below asks for structured clinical capture (pre-anesthesia assessment,
procedure findings, etc.), the frontend renders these as pre-seeded/view-only or
as simple structured status fields, the same discipline already applied to
Radiology's Reports (view-only) and Order timeline (status, not clinical prose).

**Build order:** the spec's own §44 four-phase breakdown is used as-is:
Phase 1 (Core UI) → Phase 2 (Clinical workflow) → Phase 3 (Supporting operations)
→ Phase 4 (Management). Ship a phase, verify, report, then continue — this
module does not carry Radiology's page-by-page checkpoint instruction (that was
scoped to Radiology specifically), so the project's normal phase-level cadence
applies here (see `feedback_per_page_checkpoint.md`).

---

## 1. OT MODULE PURPOSE

The OT/Surgery module manages the complete surgical workflow:

```
Surgical Case
     ↓
Surgery Request
     ↓
Pre-Operative Assessment
     ↓
Consent
     ↓
Scheduling
     ↓
OT Allocation
     ↓
Pre-Op Preparation
     ↓
Patient Transfer
     ↓
Time-Out / Safety Checklist
     ↓
Anesthesia
     ↓
Surgery
     ↓
Specimen / Implant / Consumables
     ↓
Post-Operative Recovery
     ↓
PACU / ICU / Ward
     ↓
Post-Op Documentation
     ↓
Billing
     ↓
Discharge / Follow-up
```

Your frontend should allow OT staff to see where a case currently is in this
lifecycle.

## 2. OT SIDEBAR

```
OT / Surgery
│
├── Dashboard
├── Surgery Schedule
├── OT Rooms
├── Surgical Cases
├── Today's OT List
├── Pre-Op
├── Intra-Op
├── Post-Op / Recovery
├── Anesthesia
├── Surgical Team
├── Equipment
├── Instruments
├── Consumables
├── Implants
├── Specimens
├── Checklists
├── OT Notes
├── Recovery / PACU
├── OT Requests
├── Emergency Surgery
├── Cancellations
├── Reports
└── OT Settings
```

## 3. OT MAIN DASHBOARD

First page the OT manager/supervisor sees. Header with date/department/room/
patient-search filters and a [+ New Surgery Request] action.

## 4. KPI CARDS

Today's Surgeries, In Progress, Completed, Scheduled, Emergency, Cancelled.
Additional: OT utilization, average procedure duration, delayed surgeries,
pending pre-op assessments, pending consents, pending anesthesia clearance,
available/occupied OT rooms, PACU occupancy.

## 5. OT ROOM STATUS

Visual OT room board. States: Available, Reserved, Preparation, Patient
Inside, Surgery in Progress, Recovery, Cleaning, Maintenance, Blocked,
Emergency Reserved.

## 6. TODAY'S SURGERY SCHEDULE

Table: Time / Patient / Procedure / Surgeon / OT / Anesthesia / Status.
Actions: View, Open Case, Start, Delay, Reschedule, Cancel, Transfer.

## 7. SURGICAL CASES

Case-management table: Case ID / Patient / Procedure / Surgeon / Date / OT /
Priority / Status.

## 8. CASE STATUS

Standardized workflow state, not arbitrary colors:

```
Requested → Approved → Scheduled → Pre-Op Pending → Pre-Op Cleared →
Ready for OT → Patient Transferred → Anesthesia Started → Surgery Started →
Surgery Completed → Recovery → Transferred → Completed
```

Additional states: Cancelled, Postponed, No-show, Emergency, Aborted.

## 9. SURGERY REQUEST

Form: Patient (ID/Name/DOB/Sex/MRN/Encounter ID), Department, Procedure
(name/code/category), planned procedure, surgical site, laterality, clinical
indication, diagnosis, Priority (Emergency/Urgent/Semi-Urgent/Elective).

## 10. SURGEON INFORMATION

Primary Surgeon, Assistant Surgeon, Consultant, Department, Specialty.
Team: Surgeon, Assistant surgeon, Anesthesiologist, Anesthesia assistant,
Scrub nurse, Circulating nurse, Technician.

## 11. SURGERY REQUEST DETAILS

Estimated duration, required OT type, required equipment, required
anesthesia, blood requirement, implant requirement, special equipment,
isolation requirement, ICU bed requirement, PACU requirement, special
instructions.

## 12. PRE-OPERATIVE DASHBOARD

Pre-Op Worklist: Patient / Procedure / Surgeon / Consent / Labs / Imaging /
Anesthesia / Clearance / Status (Ready for OT vs. Not Ready).

## 13. PRE-OP CHECKLIST

Patient preparation checklist (identity, procedure, site, consent, allergies,
medication review, NPO status, investigations, blood availability, anesthesia
assessment, surgical clearance, equipment, implant, patient prepared).
**Don't hard-code clinical rules — the checklist should be configurable
according to hospital policy.**

## 14. CONSENT

Consent Required / Obtained / Verified / Withdrawn. Display: type,
date/time, patient/authorized representative, witness, provider, document,
version, status. **The actual consent workflow must comply with the
hospital's legal and regulatory requirements.**

## 15. ANESTHESIA DASHBOARD

Patient/MRN/Procedure/Surgeon/OT, anesthesia type, anesthesiologist,
pre-anesthesia assessment, airway assessment, relevant history, allergies,
ASA classification, anesthesia plan, intraoperative monitoring, post-
anesthesia assessment. **Clinical fields should be finalized with qualified
anesthesia professionals.**

## 16. OT SAFETY CHECKLIST

Before Anesthesia / Before Incision / Before Patient Leaves OT — three-stage
surgical safety checklist (WHO-style). **Configurable around the hospital's
approved surgical safety process.**

## 17. INTRA-OPERATIVE SCREEN

Live case screen once surgery starts: Patient, Procedure, Surgeon,
Anesthesiologist, OT, Status.

## 18. SURGERY TIME TRACKING

Patient In Room → Anesthesia Start → Procedure Start → Incision Time →
Procedure End → Anesthesia End → Patient Out of Room, with timestamps.

## 19. SURGICAL PROCEDURE DOCUMENTATION

Planned procedure, performed procedure, findings, technique, complications,
estimated blood loss, specimens, implants, devices, drains, closure,
post-operative diagnosis, post-operative instructions.

## 20. SPECIMEN MANAGEMENT

Specimen → Label → Collection → Pathology → Result. Fields: Specimen ID,
type, collection time/site, container, label status, destination, pathology
status, result.

## 21. IMPLANT MANAGEMENT

Type, Manufacturer, Model, Serial Number, Lot Number, UDI (where
applicable), Quantity, Expiry — important for traceability.

## 22. INSTRUMENT MANAGEMENT

Instrument Set: Set ID, Set Name, Sterilization Status, Expiry/Validity,
Location, Status (Available/In Use/Sterilization/Contaminated/Damaged/
Maintenance).

## 23. CONSUMABLES

Gloves, sutures, gauze, catheters, syringes, blades, drapes, other supplies
— each usage can feed inventory/billing.

## 24. POST-OPERATIVE / RECOVERY

Surgery Completed → Recovery/PACU → Assessment → Transfer. Dashboard:
Patient, Procedure, Arrival Time, Anesthesia, Recovery Status, Destination.

## 25. PACU STATUS

Waiting, Arrived, Recovery, Ready for Transfer, Transferred. Destination:
Ward, ICU, HDU, Emergency, Other approved destination.

## 26. POST-OP NOTES

Procedure performed, findings, patient condition, complications, post-op
diagnosis, pain assessment, recovery assessment, post-op orders,
destination, follow-up plan.

## 27. EMERGENCY SURGERY

Dedicated dashboard: Priority, Patient, Procedure, Surgeon, Anesthesia, OT,
Status. Visually obvious but still follows controlled authorization/audit.

## 28. OT ROOM MANAGEMENT

Room details: number, type, department, location, equipment, status,
availability, maintenance schedule.

## 29. SURGICAL TEAM MANAGEMENT

Members: Primary Surgeon, Assistant Surgeon, Anesthesiologist, Scrub Nurse,
Circulating Nurse, Technician, other authorized staff. Each with Employee
ID, Name, Role, Department, Specialty, License/credential status,
Availability.

## 30. SURGERY CALENDAR

Day and Week views; week view shows all OT rooms horizontally against days.

## 31. OT UTILIZATION

Per-room utilization %, available/scheduled/actual hours, turnaround time,
delays, cancellation rate.

## 32. CANCELLATION MANAGEMENT

Reasons: patient unavailable, medical reason, surgeon/OT/equipment/blood
unavailable, consent issue, insurance/authorization issue, emergency
priority, other configured reason. **Must be auditable.**

## 33. DELAY MANAGEMENT

Patient, Procedure, Scheduled Time, Current Time, Delay, Reason,
Responsible Area, Action.

## 34. OT REPORTS

Operational: surgeries per day/department/surgeon, OT utilization, average
procedure duration, turnaround time, delays, cancellations, emergency
surgeries. Clinical/quality: procedure counts, complication reporting,
unplanned events, post-operative outcomes (**exact quality metrics defined
with hospital clinical governance**).

## 35. OT SEARCH & FILTERS

Filters: date, hospital, branch, department, OT room, surgeon, procedure,
priority, status, anesthesia, patient. Search: patient name, MRN, case ID,
encounter ID, procedure.

## 36. PATIENT OT PROFILE

Full patient context on case click: demographics, allergies, blood group,
current surgery, encounter, surgeon, OT. Tabs: Overview, Clinical, Pre-Op,
Consent, Anesthesia, Procedure, Specimens, Implants, Medications, Recovery,
Documents, Audit.

## 37. INTEGRATION WITH OTHER HMS MODULES

OT must not be isolated: Patient/Encounter → OT case; Appointment →
Surgery Scheduling; Laboratory → Pre-op Lab Results; Radiology → Pre-op
Imaging; Pharmacy → Medication/Supplies; Inventory → Consumables/Equipment;
Billing → Charges from the Procedure; IPD/ICU → Ward/ICU transfer; Patient
App → Approved Clinical Record.

## 38. FHIR ALIGNMENT

Potential resources: Patient, Encounter, Practitioner, Organization,
Procedure, ServiceRequest, Observation, MedicationRequest,
MedicationAdministration, Device, Specimen, DiagnosticReport,
DocumentReference, Consent, Provenance, AuditEvent. **Do not design the
frontend by making every screen equal to one FHIR resource** — FHIR is the
interoperability layer; the UI follows real hospital workflows.

## 39. DICOM CONNECTION

For procedures involving imaging: OT/HMS → Imaging Order → RIS/PACS →
DICOM. The OT UI may display links/references to relevant imaging rather
than storing the imaging files itself.

## 40. AUDIT

Every important operation traceable — actor, action, timestamp.

## 41. ROLE-BASED ACCESS

OT Admin (full), Surgeon (cases/procedures), Anesthesiologist (anesthesia),
OT Nurse (checklist/care/tasks), Scrub Nurse (instruments/consumables),
Technician (OT/equipment), Billing (charges), Inventory (supplies),
Hospital Admin (reports/configuration). Minimum-necessary access.

## 42. FRONTEND PAGE STRUCTURE (reference layout, adapted to this project's
actual module-based structure under `hospital-admin`, not a separate `ot/`
top-level module — see the scope note at the top of this file)

## 43. MAIN OT DASHBOARD LAYOUT

Sidebar (Dashboard/Schedule/Cases/Pre-Op/Intra-Op/Recovery/Anesthesia/
Rooms/Team/Instruments/Implants/Specimens/Reports) + main content (KPI
strip, OT Room Status board, Today's Surgery Schedule table, Pre-Op/
Delays/Emergency strip).

## 44. MOST IMPORTANT FRONTEND SCREENS — build order

**Phase 1 — Core UI:** OT Dashboard, Surgery Schedule, Surgical Cases,
Surgery Case Details, Surgery Request, OT Rooms.

**Phase 2 — Clinical workflow:** Pre-Op, Consent, Anesthesia, Safety
Checklist, Intra-Op, Procedure Documentation, Post-Op, PACU.

**Phase 3 — Supporting operations:** Surgical Team, Instruments,
Consumables, Implants, Specimens, Equipment.

**Phase 4 — Management:** Emergency OT, Cancellations, Delays, Reports, OT
Settings, Audit.

## 45. THE COMPLETE OT FLOW

```
PATIENT → ENCOUNTER → SURGERY REQUEST → CLINICAL APPROVAL → SCHEDULING →
PRE-OP WORKUP (CONSENT / LABS / IMAGING) → ANESTHESIA CLEARANCE →
OT ASSIGNMENT → PATIENT TRANSFER → SAFETY CHECK → ANESTHESIA →
SURGERY START (PROCEDURE / IMPLANTS / SPECIMENS) → SURGERY END →
RECOVERY/PACU → (WARD / ICU / DISCHARGE) → BILLING → MEDICAL RECORD →
PATIENT APP
```

The OT dashboard is not just a calendar: it is the control center for the
entire surgical case lifecycle, while detailed clinical documentation
belongs in the appropriate workflow screens.
