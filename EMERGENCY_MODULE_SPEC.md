# Emergency Department Module Spec

Saved verbatim from the user's paste (2026-08-17), same treatment as
`OT_MODULE_SPEC.md` / `PHARMACY_MODULE_SPEC.md` / `INVENTORY_MODULE_SPEC.md` —
a persistent reference doc for the whole build.

**Scope note — this is a different instruction shape than the last three
modules.** The user pasted the full 27-section spec below, then explicitly
closed with: *"Don't build every screen immediately. Start with these [10
items]... Then connect these visually to your existing Patient, Appointment,
Bed, Pharmacy, Inventory, Laboratory, Radiology and Billing modules."* Unlike
OT/Pharmacy/Inventory's "not in phase just do all," this is an explicit
**scope-down** instruction — build the 10-item MVP subset now, not all 27
sections. The MVP list (§ numbers refer to sections below):

1. Emergency Dashboard (§1)
2. Patient Queue (§2)
3. Triage (§3-4)
4. Emergency Patient Details (folded into Patient Queue as a detail drawer,
   matching this project's established pattern — every other module's
   "record details" screen is a drawer off its list, never a separate tab)
5. Treatment / Doctor Workspace (§7-8)
6. Orders (§9)
7. Lab & Radiology Results (§10-11 — explicitly must consume the existing
   Laboratory/Radiology modules' real data, never rebuild a second LIS/RIS)
8. Observation (§16)
9. Admission / Transfer / Discharge (§17-20, one consolidated Disposition
   tab per this project's established "merge a tightly-related pipeline"
   discipline — the user's own MVP list already bundles these three as one
   line item)
10. Emergency Reports (§24)

Explicitly deferred past this MVP pass (still documented below for later):
Treatment Areas config as its own screen (§5 — folded into Bays/config),
Bay/Bed management as a dedicated screen (§6 — folded into the Queue/
Disposition views for MVP), standalone Medication Administration UI (§12-13
— folded into Treatment workspace), Procedures as a dedicated screen (§14),
Consultations as a dedicated screen (§15 — folded into Orders as an order
type), a dedicated Staff Assignment screen (§22), Equipment (§23), a
dedicated Alerts tab (§21 — folded into Dashboard), and Search/Filters as a
cross-cutting screen (§25, each tab gets its own local filters instead).
**Audit (§26)** is kept even though not in the user's MVP list, since every
other module in this project ships one from day one as standing discipline
— it's plumbing, not a new screen.

This upgrades Emergency from its prior `[oversight]` placeholder scope note
("status/volume only... the clinical triage and treatment workspace lives in
the separate emergency portal, not here") to `[full]` for the MVP screens
above — the same explicit-spec-supersedes-placeholder precedent applied to
Radiology/OT/Pharmacy/Inventory earlier this session.

---

## 1. Emergency Dashboard — Main Overview

Total Emergency Patients, Waiting for Triage, Triage Completed, Waiting for
Doctor, Currently in Treatment, Critical Patients, Observation Patients,
Admissions Pending, Transfers Pending, Discharges Today, Average Waiting
Time, Average Length of Stay.

## 2. Emergency Patient Queue

Columns: Queue No., Patient ID, Patient Name, Age, Sex, Arrival Time,
Arrival Mode (Walk-in/Ambulance/Transfer), Triage Level, Vitals, Chief
Complaint, Assigned Area, Assigned Doctor, Status, Wait Time, Actions
(Open/Triage/Assign/Treat). Strong visual priority indicators, never color
alone.

## 3. Emergency Triage

```
Patient Arrival -> Registration/Identification -> Triage -> Priority ->
Emergency Area -> Doctor
```

Triage screen: patient info (ID/name/DOB/age/sex/allergies/conditions/
medications/previous ED visits), arrival info (date/time/mode/source),
presenting complaint (chief complaint/symptoms/onset/duration/severity/
relevant history), vital signs (temp/HR/RR/BP/SpO2/pain score/weight/
height/GCS where clinically applicable).

## 4. Triage Priority

The UI must support the hospital's configured triage methodology (e.g.
Critical/Emergent/Urgent/Less Urgent/Non-Urgent) — **never hardcode one
country's triage system.** `Hospital Configuration -> Triage System ->
Categories -> Emergency Queue`.

## 5. Emergency Treatment Areas

Configurable per hospital: Resuscitation, Critical Care, Acute Care, Minor
Treatment, Observation, Pediatric Emergency, Isolation, Fast Track.

## 6. Emergency Bed / Bay Management

Bay number, area, patient, status (Occupied/Available/Cleaning/Isolation/
Reserved), assigned nurse, assigned doctor, arrival time, time in bay,
isolation requirement, equipment availability.

## 7. Emergency Doctor Dashboard

Critical/Urgent/Waiting/Observation counts. Patient card: patient, triage
priority, chief complaint, latest vitals, allergies, current medications,
previous encounters, orders, results, clinical notes, diagnosis, treatment
plan.

## 8. Emergency Clinical Assessment

History (chief complaint, HPI, PMH, surgical history, medication history,
allergy history, family/social history), Examination (general assessment,
system exam, vitals, clinical findings), Assessment (working diagnosis,
differential diagnosis, clinical impression), Plan (medication, lab orders,
imaging orders, procedures, consultation, observation, admission,
discharge, transfer).

## 9. Emergency Orders

```
Emergency Doctor -> Laboratory / Radiology / Medication / Procedure /
Consultation / Monitoring
```

Status: `Ordered -> Accepted -> In Progress -> Completed -> Result
Available -> Reviewed`.

## 10. Emergency Laboratory Results

Don't recreate the laboratory system — Emergency consumes LIS/HMS results.
Actions: View result, View report, Mark reviewed, Add clinical note.

## 11. Emergency Radiology

Actions: View report, view images through authorized imaging/PACS
integration, Mark reviewed, Add note.

## 12. Medication / Emergency Pharmacy

`Prescription != Dispensing != Administration`:
`Doctor Orders -> Pharmacy Dispenses -> Nurse Administers -> Administration
Recorded`.

## 13. Emergency Medication Administration

Medication/Dose/Route/Time/Status table. Actions: Administer, Hold, Refuse,
Document reason, Record administration time. Actual clinical rules
configured/validated by qualified clinical staff, never invented here.

## 14. Emergency Procedures

Procedure name, indication, performing clinician, date/time, location,
consent where applicable, findings, outcome, complications, documentation.

## 15. Emergency Consultation

```
Emergency Doctor -> Consult Request -> Cardiology -> Cardiologist ->
Assessment -> Recommendation
```

Dashboard: consultations by specialty and status (Pending/Accepted/
Completed).

## 16. Emergency Observation

Patient, reason, start time, expected review, assigned doctor/nurse,
vitals, orders, progress notes, disposition. Status: Active/Completed/
Converted to Admission/Discharged/Transferred.

## 17. Emergency Disposition

```
ED -> Discharge | Admission | Transfer -> Home | IPD/ICU | Hospital
```

Hospital-configured outcomes: Discharge, Admission, Observation, Transfer,
Referral, Other approved disposition, Death.

## 18. Emergency Discharge

Final assessment, diagnosis, treatment provided, important results,
medications, discharge instructions, follow-up, referral, warning
signs/return instructions, responsible clinician. Then: Discharge Summary
-> Billing -> Patient Record -> Patient App.

## 19. Emergency Admission

```
Emergency -> Admission Decision -> Bed Request -> Bed Availability ->
Bed Assignment -> IPD/ICU
```

## 20. Emergency Transfer

Receiving organization/department/physician, reason, priority, clinical
summary, relevant results, medications, documents, transfer status.

## 21. Emergency Alerts

Critical Patient, Abnormal Result, Allergy Alert, Admission Delayed,
Transfer Pending, Long Waiting Time, Bed Unavailable, Critical Equipment
Issue. Clinical alerts carefully governed to avoid alert fatigue.

## 22. Emergency Staff Assignment

Doctors/Nurses/Technicians/Support staff, shift/area/role/start/end/
availability.

## 23. Emergency Equipment

Defibrillator, Ventilator, ECG, Patient Monitor, Oxygen, Infusion Pump,
Emergency Cart. Status: Available/In Use/Maintenance/Out of Service. Can
later connect to a broader Asset/Medical Device Management module.

## 24. Emergency Dashboard Reports

Operational (visits, patients/hour, waiting time, door-to-triage,
door-to-doctor, LOS, admission/discharge/transfer rate, left-before-
treatment rate), Capacity (occupancy, bay utilization, observation
occupancy, critical-care capacity), Clinical/quality (triage distribution,
diagnosis categories, procedure volumes, result turnaround, readmissions).

## 25. Emergency Search & Filters

Date, time, patient, patient ID, triage priority, doctor, nurse, area, bay,
status, disposition, arrival mode — always respecting the user's
authorization.

## 26. Emergency Audit

Every sensitive operation traceable — view/create-order/administer-
medication/complete-disposition, etc.

## 27. Emergency Frontend Pages (suggested)

```
Emergency/
├── Dashboard · Queue · Triage · Patients · Treatment Areas · Bays
├── Doctor Workspace · Nursing Workspace · Orders
├── Laboratory · Radiology · Medications · Procedures · Consultations
├── Observation · Admissions · Transfers · Discharges
└── Staff · Equipment · Alerts · Reports · Audit
```

**Most important for the MVP** (repeated from the top): Dashboard, Patient
Queue, Triage, Emergency Patient Details, Treatment/Doctor Workspace,
Orders, Lab & Radiology Results, Observation, Admission/Transfer/Discharge,
Emergency Reports — then connect these visually to the existing Patient,
Appointment, Bed, Pharmacy, Inventory, Laboratory, Radiology, and Billing
modules, "rather than a collection of unrelated dashboard pages."
