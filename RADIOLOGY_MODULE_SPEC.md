# HMS Admin — Radiology Module Spec

Saved verbatim from the user, 2026-08-16 — same treatment as `HMS_DOMAIN_STANDARDS.md` /
`BILLING_REVENUE_MODULE_SPEC.md` / `ORGANIZATION_HIERARCHY_SPEC.md`: a persistent
reference doc for this whole build, not a one-off prompt.

**Explicit build discipline from the user:** go step by step, one page at a time —
build a page, the user checks it, then they say what's next. Do not build ahead.

The user's own phase order (§42):
- Phase 1 — Main dashboard (sidebar, header, KPI cards, today's workflow, volume
  chart, modality utilization, pending reports, critical alerts, today's worklist)
- Phase 2 — Operational workflow (Orders, Order Details, Scheduling, Worklist,
  Study list, Study Details, Reports, Report Details, Critical Findings)
- Phase 3 — Administration (Modalities, Rooms, Radiologists, Technologists,
  Procedures, Protocols, Equipment, Maintenance)
- Phase 4 — Integration (PACS, DICOM status, FHIR/HL7 integration status)
- Phase 5 — Business (Billing, Insurance, Analytics, Audit, Settings)

Scope note (consistent with `HOSPITAL_ADMIN_MODULE_MAP.md`'s existing rule —
Radiology is `[oversight]`): the HMS/hospital-admin frontend manages workflow and
administrative visibility; it does not implement a diagnostic PACS viewer, does not
expose raw DICOM networking, and does not host the radiologist's actual reporting
workspace. Per the user's own §19/§20: "generally link to or launch the appropriate
viewer, rather than attempting to implement a full diagnostic PACS viewer," and
"Don't expose technical DICOM fields to ordinary users unnecessarily."

---

## 1. Purpose

The Radiology module in the HMS Admin Dashboard will allow hospital administrators and authorized radiology staff to manage:

Radiology department
Imaging services
Imaging orders
Scheduling
Patients
Radiologists
Technologists
Imaging modalities
Radiology rooms
Worklists
Studies
Reports
Critical findings
PACS/DICOM integration
Billing integration
Equipment
Radiology statistics
Audit
Configuration

The frontend should be designed so that later the backend can connect it to HMS + RIS + PACS + DICOM + FHIR/HL7 integrations.

## 2. Where Radiology sits in our HMS

The overall flow should look like:

```
Doctor
   ↓
Imaging Order
   ↓
Radiology Department
   ↓
Authorization / Eligibility
   ↓
Scheduling
   ↓
Patient Check-in
   ↓
Radiology Worklist
   ↓
Technologist
   ↓
Imaging Modality
   ↓
DICOM Study
   ↓
PACS
   ↓
Radiologist
   ↓
Interpretation
   ↓
Radiology Report
   ↓
Finalization
   ↓
Doctor
   ↓
Patient
   ↓
Billing / Insurance
```

This distinction is important: the HMS does not necessarily need to become the PACS itself. The HMS/RIS can manage workflow while PACS/DICOM infrastructure handles imaging storage and image retrieval.

FHIR's ImagingStudy represents the content of a DICOM imaging study, including its series and instances.

## 3. Radiology item in Admin Sidebar

```
Radiology
│
├── Dashboard
├── Orders
├── Worklist
├── Scheduling
├── Studies
├── Reports
├── Critical Findings
├── Patients
├── Radiologists
├── Technologists
├── Modalities
├── Rooms
├── Procedures
├── Protocols
├── PACS
├── DICOM
├── Equipment
├── Billing
├── Insurance
├── Quality & Safety
├── Reports & Analytics
├── Audit Log
└── Settings
```

## 4. Radiology Dashboard — Main Screen

At the top: Radiology / Hospital / Branch / Department / Date.
Filters: Hospital ▼ Branch ▼ Location ▼ Modality ▼ Date ▼ Radiologist ▼

## 5. KPI Cards

8 cards, each clickable to the corresponding filtered list: Orders Today (248, ↑8.4%),
Scheduled (186), Waiting (27), In Progress (14), Completed (159), Awaiting Report (31),
Critical Findings (4), Equipment Issues (2).

## 6. Today's Radiology Workflow

```
ORDERS → SCHEDULED → CHECKED-IN → IN PROGRESS → COMPLETED → REPORTING → FINAL
  248       186          142           14           159         31        128
```

## 7. Imaging Orders Table

Columns: Order ID, Patient, MRN, Study, Modality, Priority, Ordering Doctor,
Department, Order Date, Scheduled, Status, Authorization, Actions.

Statuses: Draft, Ordered, Pending Authorization, Authorized, Scheduled, Checked-In,
In Progress, Completed, Cancelled, No Show, On Hold.

FHIR ServiceRequest has concepts such as status, priority, requester, performer,
occurrence and supporting information that are useful when designing the order model.

## 8. Order Details Page

Sections: Patient, Order, Clinical Information, Scheduling, Authorization, Workflow
Timeline (Order Created → Authorization → Scheduled → Checked In → Study Started →
Study Completed → Report Drafted → Report Finalized).

## 9. Scheduling

Calendar view + List view. Filters: Date, Modality, Room, Radiologist, Technologist,
Status, Priority.

## 10. Scheduling Modal

Sections: Patient (search/MRN/DOB/Phone), Order (select existing order + study type),
Schedule (date/time/duration/modality/room), Staff (technologist/radiologist),
Preparation (contrast required?/fasting?/special preparation?/pregnancy screening/
other department-defined requirements), Confirmation (Cancel/Save Draft/Schedule).

Don't hard-code clinical preparation rules into frontend logic — configurable
hospital protocols/backend, eventually.

## 11. Radiology Worklist

Columns: Priority, Patient, Study, Modality, Room, Status, Technologist, Action.
Priority: STAT, Urgent, ASAP, Routine (FHIR ServiceRequest priority concepts).

## 12. Modality Management

Not a static dropdown — each modality has: Modality ID, Name, Modality Type,
Manufacturer, Model, Serial Number, Location, Room, Department, Status, Last
Maintenance, Next Maintenance, DICOM AE Title, IP/Network Configuration, PACS
Destination, Availability.

## 13. Modality Status

🟢 Operational · 🟡 Limited · 🔴 Offline · 🔵 Maintenance · ⚫ Retired.

## 14. Radiology Rooms

Room number, Location, Modality, Capacity, Status, Assigned staff, Operating hours.

## 15. Radiologists

Name, Professional ID, Specialty, License, Department, Schedule, Availability,
Assigned modalities, Reporting workload, Credentials.

## 16. Technologists

Name, Role, License/certification, Modality competency, Shift, Current room,
Current study, Availability.

## 17. Studies

Order = request for imaging. Study = imaging actually performed. FHIR ImagingStudy
is specifically about the imaging study and its DICOM series/instances.

Columns: Study ID, Patient, Modality, Study, Date, Series, Images, Status.

## 18. Study Details

Patient, Study (ID/description/date-time/modality/body site/referring doctor/
performing technologist), DICOM information (Study Instance UID, Series, SOP
Instance info, Modality, PACS reference) under an Advanced/Technical Details
section — don't expose technical DICOM fields to ordinary users unnecessarily.

## 19. PACS Integration

Status dashboard: Connected, Studies Sent/Received Today, Failed Transfers, Pending.
Actions: View PACS, Retry failed transfer, View transfer status, Technical details,
Connection status.

The HMS frontend should generally link to or launch the appropriate viewer, rather
than attempting to implement a full diagnostic PACS viewer as part of the admin
dashboard.

## 20. DICOM Information

AE Title, Modality, Study/Series Instance UID, PACS, Last Communication, Transfer
Status. For the frontend, you mainly need status and integration visibility — the
backend/integration team handles actual DICOM networking and PACS communication.

## 21. Radiology Reports

Dashboard cards: Draft, Pending, Final, Amended, Critical.
Table: Report, Patient, Study, Radiologist, Status, Date.

## 22. Report Details

Clinical Information, Technique, Findings, Impression, Recommendation, Report
Status (Draft/Preliminary/Final/Amended). FHIR DiagnosticReport connects the report
with the request, observations, images and imaging studies.

## 23. Critical Findings

Table: Priority, Patient, Study, Finding, Radiologist, Notification, Status.
Workflow: Finding Identified → Critical Finding → Responsible Clinician →
Notification → Acknowledgement → Audit. The exact critical-result policy should be
configurable per hospital clinical governance.

## 24. Patient Radiology History

From a patient profile → Radiology: chronological list of studies, each opening
Report / Study metadata / PACS viewer / Previous comparison / Related order.

## 25. Comparison / Previous Imaging

UI should support Current Study + Previous Study side reference. The actual
diagnostic comparison happens in the clinical imaging workflow/PACS viewer; HMS
just exposes the relevant historical studies.

## 26. Procedures / Imaging Catalog

Procedure code, Display name, Modality, Body site, Duration, Preparation, Contrast
requirement, Price, Insurance mapping, Active/inactive, Department, Scheduling
rules. Use standardized terminology/coding through the backend rather than
inventing clinical codes.

## 27. Protocol Management

E.g. CT Chest → Without Contrast / With Contrast / High Resolution. Frontend shows
protocol info; clinical protocol content is controlled by authorized radiology
personnel.

## 28. Equipment Management

Manufacturer, Model, Serial number, Installation date, Warranty, Maintenance,
Calibration (where applicable), Service history, Current status.

## 29. Maintenance

Dashboard: Due Today, Due This Week, Overdue, Completed.
Table: Equipment, Maintenance type, Due, Status.

## 30. Billing Integration

```
Imaging Order → Procedure Performed → Charge Generated → Insurance
  → Patient Responsibility → Invoice
```

Admin sees Study/Charge/Insurance/Authorization/Payment Status, but Radiology
should link to the central billing record — don't duplicate the entire Billing
module here.

## 31. Insurance / Authorization

Status, Insurance, Request, Authorization Number, Valid From/Until.
Actions: Submit, Approve, Reject, Request information, View authorization.

## 32. Reports & Analytics

Studies by modality, Studies by department, Daily volume (line chart), Report
turnaround time (average + bucketed: <2h / 2-6h / 6-12h / >12h), Modality
utilization.

## 33. Operational Alerts

Example severities: 🔴 Critical result pending acknowledgement · 🟠 Modality
unavailable / reports overdue · 🟡 maintenance due / PACS transfer failed ·
🔵 informational (e.g. patients waiting).

## 34. Audit Log

Track: User, Action, Resource, Patient, Timestamp, Organization, IP/device (where
appropriate), Previous value, New value, Reason/context (where required).

## 35. Radiology Settings

General (department name/locations/working hours), Scheduling (slot duration/
working days/holidays/booking rules), Modalities, Rooms, Reports (templates/
signing rules/amendment rules), Critical Findings (notification/escalation rules),
Integration (PACS/DICOM/FHIR/HL7/external RIS), Billing (procedure pricing/
insurance mappings), Permissions (per role).

## 36. Frontend Permissions

Not "Radiology = everyone." Distinct access per role: Hospital Admin (full
administrative visibility), Radiology Admin (management), Radiologist (studies +
reports), Technologist (worklist + acquisition workflow), Reception (scheduling/
check-in), Billing (charges/payment status), Doctor (orders + authorized results),
Nurse (relevant patient imaging/results), Patient (authorized reports/studies).
Frontend hides/disables by permission; backend authorization remains the real
security boundary.

## 37-39. Layout / Routes / Component Structure

Desktop two-pane admin layout (sidebar + content); mobile uses condensed
cards/worklists, not the full dashboard. Suggested routes under `/radiology/*`
mirror the sidebar tree above. Suggested React structure: `pages/`, `components/`,
`forms/`, `hooks/`, `services/`, `constants/`, `utils/` per module (this codebase's
actual convention is `pages/<section>/` + `components/<section>/` inside
`modules/hospital-admin/`, per `TEAM_WORKFLOW.md` — same idea, different folder
names already established).

## 40. Important data relationships for the UI

```
Patient → Encounter → ServiceRequest → Procedure
                            └── ImagingStudy → Series → Instances
                                     └── DiagnosticReport → Findings/Conclusion

ImagingStudy → Modality, Room, Technologist, Radiologist, PACS, Report
```

FHIR's diagnostics model explicitly relates ServiceRequest, Procedure,
Observation, DiagnosticReport, and ImagingStudy — the conceptual foundation here.

## 41. The status flow (not just Pending/Completed)

```
ORDERED → AUTHORIZATION_PENDING → AUTHORIZED → SCHEDULED → CHECKED_IN → READY
  → IN_PROGRESS → COMPLETED → IMAGE_AVAILABLE → REPORT_DRAFT
  → REPORT_PRELIMINARY → REPORT_FINAL → RESULT_DELIVERED
```

Alternate paths off ORDER: CANCELLED, ON_HOLD, NO_SHOW.
Reports may later go FINAL → AMENDED.

## 42. Build order (the user's own instruction — do not build ahead of this)

- **Phase 1 — Main dashboard**: sidebar, header, KPI cards, today's workflow,
  volume chart, modality utilization, pending reports, critical alerts, today's
  worklist.
- **Phase 2 — Operational workflow**: Orders, Order Details, Scheduling, Worklist,
  Study list, Study Details, Reports, Report Details, Critical Findings.
- **Phase 3 — Administration**: Modalities, Rooms, Radiologists, Technologists,
  Procedures, Protocols, Equipment, Maintenance.
- **Phase 4 — Integration**: PACS, DICOM status, FHIR integration status, HL7
  integration status.
- **Phase 5 — Business**: Billing, Insurance, Analytics, Audit, Settings.

**The conceptual model to design around** (not "a page that lists CT/MRI/X-Ray"):

```
                 RADIOLOGY
                     │
        ┌────────────┴────────────┐
        │                         │
     ORDERS                   OPERATIONS
        │                         │
   Authorization             Scheduling
        │                         │
        └────────────┬────────────┘
                     │
                 WORKLIST
                     │
                 MODALITY
                     │
                DICOM/PACS
                     │
                  STUDY
                     │
                 REPORT
                     │
              CRITICAL RESULT
                     │
             REFERRING DOCTOR
                     │
                 PATIENT
                     │
            BILLING / INSURANCE
```

That structure is what keeps this frontend compatible with a real HMS + RIS + PACS
+ FHIR/HL7 backend later, instead of forcing a redesign when the backend arrives.
