# Audit Module Spec

Saved verbatim from the user's paste (2026-08-17), same treatment as the
other `*_MODULE_SPEC.md` files — a persistent reference doc.

**Scope note:** the spec came with no attached scope instruction either
way (the same ambiguity as the Reports paste before it). Asked the same
two clarifying questions via `AskUserQuestion` — this time the user chose
**full build, all 48 sections**, with full verification rigor. See
`HOSPITAL_ADMIN_MODULE_MAP.md` build-order #33 for exactly what was built.
Additive to every other module's own scoped audit log (Beds/Laboratory/
Radiology/Pharmacy/OT/Inventory/Emergency each keep `recordXAudit` + their
own Audit tab, untouched) — this module is the hospital-wide event trail,
aggregating those real logs alongside new curated event streams (§39-44's
Kafka/microservice/FHIR-AuditEvent concepts are explicitly backend/"for
later" per the spec's own framing — built as frontend-ready fields only,
e.g. `correlationId`/`requestId`, never simulated client-side).

---

## 1. Audit Dashboard

Main page: Audit Overview KPI cards — Total Events, Critical Events,
Failed Actions, Today's Events, Patient Access, Data Changes — plus a
category breakdown (Security/Clinical/Administrative/Financial/System).
Add: Total Audit Events, Today's Events, Critical Events, Failed Actions,
Patient Record Accesses, Data Modifications, Login Events, Permission
Changes, Security Events, System Events.

## 2. Audit Event List

Main audit table. Columns: Audit ID, Timestamp, Event Type, User, Role,
Organization, Department, Resource, Patient, Action, Result, Severity, IP
Address, Source.

## 3. Audit Search

Healthcare organizations have millions of audit records — search is
essential. Search: audit ID, user, patient, IP, resource. Filters: Date,
Time, User, Role, Department, Organization, Event Type, Action, Resource,
Patient, Severity, Result, Source, IP Address. Date presets: Today,
Yesterday, Last 7 Days, Last 30 Days, This Month, Custom Range.

## 4. Event Types

Standardized categories: Authentication (Login/Logout/Login Failed/
Password Changed/MFA Enabled/MFA Disabled/Token Refresh/Session Expired/
Account Locked/Account Unlocked), Patient (Created/Viewed/Updated/Merged/
Unmerged/Deactivated/Identifier Changed), Clinical (Encounter/Clinical
Note/Diagnosis/Order/Result events), Medication (Prescription/Dispensed/
Administration/Cancelled), Laboratory (Order/Specimen/Result events),
Radiology (Imaging Order/Study/Report/Image Accessed), Billing (Invoice/
Payment/Refund/Claim events), Administration (User/Role/Permission/
Department/Configuration events), Integration (FHIR/HL7/DICOM/External
System/Data Exchange).

## 5. Action Types

Keep actions separate from event types: CREATE, READ, UPDATE, DELETE,
LOGIN, LOGOUT, EXPORT, IMPORT, DOWNLOAD, UPLOAD, SHARE, PRINT, APPROVE,
REJECT, CANCEL, SIGN, VERIFY, DISPENSE, ADMINISTER, MERGE, UNMERGE.

## 6. Severity

INFO, LOW, MEDIUM, HIGH, CRITICAL. Examples: INFO = normal login, LOW =
profile viewed, MEDIUM = patient record accessed, HIGH = large data
export, CRITICAL = unauthorized access attempt or major security event.

## 7. Result

Every event shows its result: SUCCESS, FAILED, DENIED, BLOCKED, PARTIAL.

## 8. Audit Event Details

On click: Audit ID, Timestamp, Event, Action, Result, Severity, then
Actor (User/User ID/Role/Department/Organization).

## 9. Patient Context

If the event concerns a patient: Patient/Patient ID/Encounter/Department.
Important: never unnecessarily expose sensitive patient information; only
authorized users should see patient context.

## 10. Resource Information

Show exactly what was accessed: Resource Type, Resource ID, Action,
Endpoint.

## 11. Before / After Changes

Extremely important for UPDATE events: FIELD/BEFORE/AFTER table. The
backend must determine what information is appropriate to retain in audit
records and how long.

## 12. Who Made the Change?

Changed By: Name, User ID, Role, Department, Organization.

## 13. When?

Date, Time, Timezone. Timestamps should be handled consistently and
displayed per the user's configured timezone.

## 14. Where From?

Technical context: IP Address, Device, Browser, Operating System,
Application, Session ID. Don't expose sensitive technical information to
users who don't need it.

## 15. Source

WEB, MOBILE, API, INTEGRATION, SYSTEM, BACKGROUND_JOB.

## 16. API Audit

Since the system has FHIR/HL7/DICOM integrations, API activity is
auditable too: Request/Client/Authentication/Result/Timestamp for API;
Message Type/Source/Destination/Status for HL7; Modality/Operation/
Source/Destination/Status for DICOM.

## 17. Patient Access Audit

Its own view: Patient/User/Resource/Action table, filterable by Patient,
Provider, Department, Date, Resource, Action — particularly important for
privacy monitoring.

## 18. Security Audit

Dedicated view: Failed Logins, Suspicious Access, Permission Changes,
Account Lockouts, MFA Events, Password Changes, Token Events,
Unauthorized Requests.

## 19. Permission Audit

Track authorization changes: User/Previous Role/New Role/Changed By/Time/
Reason. Also: role created/deleted, permission added/removed, user
assigned/removed from role.

## 20. Login Audit

Login History: User/Login Time/Logout Time/IP/Device/Location/Result/MFA.

## 21. Failed Login Analysis

Failed Login Attempts by user, with attempt counts. Potential actions:
View Details, Block User, Investigate — these actions must themselves
create audit records.

## 22. Data Export Audit

Very important in healthcare: Who exported, What data, How many records,
Why, When, Where, Destination, Result. For large exports, show whether
authorized and the relevant audit/reference ID.

## 23. Print Audit

Track sensitive printing: User/Document/Patient/Copies/Time/Result.

## 24. Download Audit

Track: lab report downloads, imaging report downloads, documents,
discharge summaries, medical records, prescriptions.

## 25. Consent Audit

Because the larger ecosystem includes patient-controlled sharing:
Patient/Action/Purpose/Organization/Data/Duration/Actor/Timestamp.
Actions: CONSENT_GRANTED, CONSENT_REVOKED, CONSENT_UPDATED,
CONSENT_EXPIRED, CONSENT_DENIED.

## 26. Emergency Access Audit

Very important — break-glass access: Provider/Patient/Reason/Access Time/
Resources/Authorization/Audit. The frontend should make this highly
visible.

## 27. System Audit

Not every event is human: Background Jobs, Scheduled Tasks, Database
Jobs, Integration Jobs, Notification Jobs, FHIR/HL7 Processing, Data
Synchronization. Example: Service/Event/Message/Result.

## 28. Audit Timeline

Chronological history per patient — very useful UI, e.g. Registered →
Appointment → Check-In → Vitals → Encounter → Lab Ordered → Result Added
→ Doctor Viewed → Prescription → Dispensed.

## 29. Audit Filter Builder

For large hospitals: AND/OR combinable filters (User = X AND Action = Y
AND Resource = Z AND Date = Today). Can become extremely powerful for
compliance teams.

## 30. Saved Audit Queries

Administrators save searches: My Saved Queries list (e.g. "Patient Record
Access - Today," "Failed Logins - Last 7 Days," "High Severity Events,"
"Data Exports - This Month," "Emergency Access," "Permission Changes").

## 31. Audit Reports

Generate Report: Daily audit report, Security report, Patient access
report, User activity report, Data export report, Permission change
report, Integration audit report, Emergency access report, Failed access
report. Formats: PDF/CSV/Excel. Access to export audit reports should
itself be audited.

## 32. Audit Retention

Frontend settings page: Clinical/Security/Integration Audit — each
"Configured by Policy." Do not hard-code a universal retention period —
requirements vary by jurisdiction, organization, and record type.

## 33. Audit Integrity

Show whether an audit record has been verified: ✓ Verified, ⚠
Verification Pending, ✕ Integrity Error. A production audit system should
protect audit records from unauthorized modification or deletion.

## 34. Audit Archive

Active Audit → Archive → Long-Term Storage. Frontend: Current Events /
Archived Events.

## 35. Audit Alerts

Generate alerts for suspicious activity — e.g. "12 patient records
accessed by USR-2291 in 2 minutes, Under Investigation" or "Large Patient
Data Export, 25,000 records, HIGH severity."

## 36. Admin Actions

Depending on permissions: View, Investigate, Export Report, Mark for
Review, Add Investigation Note, View Related Events. Avoid allowing
administrators to casually edit or delete audit records.

## 37. Investigation View

For security/compliance staff: Case/Subject/Events/Users/Patients/Status/
Assigned To, then Timeline/Evidence/Related Events/Notes/Actions/
Resolution.

## 38. Related Events

When opening one audit event, show Previous/Current/Next in a chain
(e.g. Login → Patient Search → Patient Record View → Lab Result View →
Prescription View → Logout) — much better than treating every event as
isolated.

## 39. Audit Database Concept

Later backend structure: `AUDIT_EVENT` (id, event_type, action, actor_id,
actor_type, organization_id, department_id, patient_id, resource_type,
resource_id, timestamp, result, severity, source, ip_address, user_agent,
session_id, correlation_id, request_id, metadata) and `AUDIT_CHANGE` (id,
audit_event_id, field_name, old_value, new_value). Exact schema finalized
during backend design.

## 40. Correlation ID

Particularly important for the microservices architecture — all related
operations across services (Patient/Appointment/Notification/Audit
Service) carry a Correlation ID, searchable to see the complete
transaction chain.

## 41. Request ID

Also shown — useful for troubleshooting API failures.

## 42. Microservice Audit Flow

`USER → API Gateway → Patient/Appointment/Lab Service → Audit Event →
Kafka/Event Bus → Audit Service → Audit DB → Admin Audit UI`.

## 43. Audit + Kafka

`Patient Service → PatientViewed → Kafka → Audit Service / Analytics /
Security Monitoring`. The audit event should contain enough metadata to
establish who/what/when/where/why/result, without unnecessarily
duplicating sensitive clinical data.

## 44. Audit + FHIR

Relevant FHIR concepts: `AuditEvent` (security/privacy-relevant activity)
and `Provenance` (origin/agents of a healthcare resource) — different
purposes. Later expose FHIR Audit Event / FHIR Provenance where
applicable.

## 45. Frontend Sidebar

```
AUDIT & SECURITY
├── Audit Dashboard · All Audit Events · Patient Access · User Activity
├── Login Activity · Security Events · Permission Changes
├── Data Exports · Emergency Access · Consent Activity
├── Integration Audit · System Events · Investigations
├── Alerts · Reports · Archive
```

## 46. Audit Event Colors / Status

Consistent visual indicators — SUCCESS/INFO/MEDIUM/HIGH/CRITICAL/FAILED/
DENIED each get a distinct indicator. Never rely only on color —
always include text/icons for accessibility.

## 47. What The Admin Should See

Main screen: KPI row (Total/Critical/Failed/Patient Access), search +
filters + export, the main event table, then Recent Security Events /
Recent Patient Access / Recent Critical Events sections.

## 48. Frontend Pages To Build

```
audit/
├── AuditDashboard · AuditEvents · AuditEventDetails
├── PatientAccess · UserActivity · LoginActivity
├── SecurityEvents · PermissionChanges · DataExports
├── EmergencyAccess · ConsentActivity · IntegrationAudit
├── SystemEvents · Investigations · InvestigationDetails
├── AuditAlerts · AuditReports · AuditArchive
```

Reusable components: AuditStatsCards, AuditFilters, AuditTable,
AuditTimeline, AuditEventBadge, SeverityBadge, ResultBadge, ActorCard,
PatientContextCard, ResourceCard, ChangeDiffViewer, EventDetailsPanel,
RelatedEvents, SecurityAlertCard, InvestigationCard, AuditExportDialog.

**The important design principle:** Audit is not just an admin activity
log. It should eventually answer: who did what, to which healthcare
resource, for which patient/context, when, from where, through which
system, what changed, whether it succeeded, and what related events
occurred. Design the frontend for that level now, keeping the backend
implementation for later.
