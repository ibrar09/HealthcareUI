# Reports Module Spec

Saved verbatim from the user's paste (2026-08-17), same treatment as the
other `*_MODULE_SPEC.md` files — a persistent reference doc.

**Scope note:** the user chose, via an explicit clarifying question, to
build an **MVP subset** (~13 reports) rather than all 65 sections, with
full `tsc`/Playwright/doc-update rigor — see `HOSPITAL_ADMIN_MODULE_MAP.md`
build-order #32 for exactly what was built vs. deferred. Architecture
principle (spec's own words, honored throughout): *"The frontend you're
building now should not calculate or permanently store these reports
itself... Operational Systems -> Data -> Reporting Layer -> Reports."*
`api/reports.ts` is accordingly a thin aggregation layer — genuinely new
cross-module rollups only where no existing module already computes the
number; everywhere a module already has its own real dashboard/analytics
(Emergency, Beds, Laboratory, Radiology, Pharmacy, OT), this module's UI
calls that function and reuses that module's own component directly.

---

## 1. Purpose

The Reports module is the hospital's central reporting and analytics area.
It should allow authorized users to understand: Patient activity, Clinical
activity, Emergency activity, OPD activity, IPD activity, Bed utilization,
Laboratory activity, Radiology activity, Pharmacy activity, OT/Surgery
activity, Billing, Insurance, Inventory, Staff workload, Hospital
performance, Operational bottlenecks, Audit activity.

The important principle: `Operational Systems -> Data -> Reporting Layer ->
Reports / Dashboards / Analytics`.

## 2. Reports Main Dashboard

Admin Dashboard -> Reports shows the overall hospital picture. KPI cards:
Today's Patients, OPD Visits, Emergency, Admissions, Discharges, Bed
Occupancy, Lab Tests, Radiology, Pharmacy Orders, Revenue. The actual
numbers come from backend services later.

## 3. Date & Organization Filters

Every major report should have common filters. Date: Today, Yesterday,
Last 7 Days, Last 30 Days, This Month, Last Month, This Quarter, This
Year, Custom Range. Organization: Hospital, Branch, Department, Ward,
Clinic, Service. Other filters depending on the report: Doctor, Nurse,
Patient type, Gender, Age group, Status, Insurance, Payment type,
Diagnosis, Procedure, Service.

## 4. Hospital Census Report

Shows how many patients are currently in the hospital: OPD, Emergency,
IPD, ICU, Observation, Day Care. Also: Total current patients, New
patients, Discharged patients, Transferred patients, Current admissions.

## 5. Patient Volume Report

Patient activity over time (Mon-Sun bar chart). Breakdown: New patients,
Returning patients, OPD, Emergency, IPD, Follow-up, Referral.

## 6. Patient Demographics Report

Aggregated demographics. Age groups: 0-5, 6-12, 13-18, 19-30, 31-45,
46-60, 61-75, 76+. Other dimensions: Sex, Nationality where legally
appropriate, Residence/location where appropriate, Patient type, Age
group. Be careful with privacy when displaying small groups.

## 7. OPD Reports

Metrics: OPD visits, New OPD patients, Follow-up visits, Department
visits, Doctor visits, Appointment visits, Walk-ins, No-shows, Cancelled
appointments. Department-level breakdown example given (Cardiology,
Internal Medicine, Pediatrics, Orthopedics, Dermatology).

## 8. OPD Waiting-Time Report

Registration->Check-in, Check-in->Doctor, Doctor->Completion, Total Visit
Time. Metrics: Average, Median, Maximum, Minimum. Department/doctor
filtering.

## 9. Appointment Reports

Scheduled, Confirmed, Checked-In, Completed, Cancelled, No-Show. Plus:
Appointment volume, by doctor, by department, by specialty, Cancellation
rate, No-show rate, Booking source, Patient booking trends, Slot
utilization.

## 10. Emergency Reports

Connects to the Emergency module. Emergency visits, Triage distribution,
Waiting time, Door-to-doctor time, Emergency length of stay, Critical
patients, Admissions, Discharges, Transfers, Observation, Patient flow,
Bay utilization, Emergency staff workload.

## 11. Admission Report

By ward (Medical/Surgical/ICU/Pediatrics/Other). Metrics: Total
admissions, Admission source, Admission type, Department, Doctor, Ward,
Age group, Insurance type, Average admission duration.

## 12. Discharge Report

Total discharges, by department, Discharge type, Average LOS, Follow-up
created, Discharge delays, Readmission metrics where appropriately
defined. Status breakdown: Completed, Pending, Delayed, Transferred.

## 13. Bed Occupancy Report

Total Beds, Occupied, Available, Reserved, Cleaning, Maintenance,
Occupancy Rate. Break down by Hospital, Branch, Building, Floor, Ward,
Room, Bed type.

## 14. Bed Utilization Report

Bed occupancy, Bed turnover, Average occupancy, Average stay, Available
capacity, Blocked beds, Isolation beds, ICU utilization. Chart by ward.

## 15. Length-of-Stay Report

Average/Median/Minimum/Maximum LOS. Filter by Department, Ward, Diagnosis,
Doctor, Admission type, Patient category.

## 16. Laboratory Reports

Connects to the Laboratory module/LIS. Main metrics: Lab Orders,
Collected, Processing, Final, Pending, Cancelled. Reports: Test volume, by
department, by physician, Specimen volume, Pending tests, Critical
results, Turnaround time, Rejected specimens, Corrected results, Analyzer
utilization.

## 17. Laboratory Turnaround Report

Order -> Collection -> Receipt -> Processing -> Validation -> Final
Result. Measure each stage (example: CBC broken into
Order->Collection/Collection->Receipt/Receipt->Result/Total TAT).

## 18. Radiology Reports

Imaging Orders, Completed, Pending, Cancelled, Reports Finalized. Break
down by X-Ray, CT, MRI, Ultrasound, Mammography, Other configured
modalities.

## 19. Radiology Turnaround Report

Order -> Scheduling -> Procedure -> Image Available -> Radiologist Report
-> Final Report. Show order-to-scan, scan-to-report, report turnaround,
pending reports, critical findings.

## 20. Pharmacy Reports

Prescriptions, Medication Orders, Dispensed, Pending, Cancelled, Returned.
Reports: Medication usage, dispensing, Prescription volume, Department
usage, Doctor prescribing activity, Drug utilization, Expired medication,
Returned medication.

## 21. Pharmacy Inventory Reports

Total Items, Low Stock, Out of Stock, Expiring Soon, Expired.

## 22. OT / Surgery Reports

Procedures Today, Scheduled, Completed, Cancelled, Emergency Surgery.
Reports: Surgery volume, by specialty, Surgeon workload, OR utilization,
Procedure duration, Cancellation rate, Emergency vs elective, Post-
operative outcomes where approved, OR turnaround time.

## 23. OR Utilization

Per-OR utilization %. Show: Available time, Scheduled time, Actual usage,
Turnaround time, Idle time, Maintenance downtime.

## 24. ICU Reports

If ICU is implemented: ICU census, occupancy, Admissions, Discharges,
Transfers, LOS, Ventilator usage, Device data, Nursing workload,
Medication activity, Laboratory activity. Sensitive clinical analytics
should be governed appropriately.

## 25. Nursing Reports

Patients assigned, Nurse-to-patient workload, Vitals recorded, Medication
administrations, Care tasks, Pending tasks, Nursing documentation, Shift
workload.

## 26. Doctor Reports

Patients seen, Encounters, Appointments, Completed/Pending consultations,
Orders, Referrals, Workload. Avoid using simplistic metrics as a
substitute for proper clinical quality evaluation.

## 27. Referral Reports

Internal/External/Incoming/Outgoing Referrals, Pending, Accepted,
Completed, Cancelled. Break down by Specialty, Department, Doctor,
Organization, Referral reason, Status.

## 28. Consultation Reports

Consultation requests, Accepted, Pending, Completed, Average response
time, Specialty, Requesting department, Consulting department.

## 29. Procedure Reports

All procedures: volume, Department, Doctor, Specialty, Status, Duration,
Complications where appropriately documented.

## 30. Clinical Diagnosis Reports

Top diagnoses, using standardized terminology/coding where applicable.
Filters: Department, Specialty, Date, Age group, Encounter type.

## 31. Medication Administration Report

Different from pharmacy dispensing: Ordered, Dispensed, Administered,
Held, Refused, Discontinued — distinguishes the clinical medication
lifecycle.

## 32. Billing Reports

Revenue, Gross Charges, Discounts, Adjustments, Net Charges, Collected,
Outstanding, Revenue by department (Emergency/OPD/Laboratory/Radiology/
Pharmacy/Surgery).

## 33. Payment Reports

Cash, Card, Bank transfer, Online payment, Insurance, Other configured
methods. Metrics: Paid, Pending, Refunded, Failed, Partially paid.

## 34. Outstanding / Receivables Report

Per-patient outstanding balance. Filters: Age of balance, Department,
Insurance, Patient, Invoice status.

## 35. Insurance Reports

Eligibility, Authorizations, Claims (Approved/Rejected/Pending/Paid/
Denied/Appealed). Claims by insurer, Claim value, Approval rate,
Rejection rate, Outstanding claims.

## 36. Inventory Reports

Stock on hand, Stock movement, Purchases, Consumption, Transfers,
Returns, Expired, Damaged, Low stock, Out of stock — hospital-wide.

## 37. Procurement Reports

Purchase Requests, Purchase Orders, Goods Received, Pending Orders,
Supplier Activity. Metrics: Procurement value, Supplier spending, Order
turnaround, Pending approvals.

## 38. Supplier Reports

Purchase volume, Orders, Delivery time, Outstanding orders, Returns,
Contract status, per supplier.

## 39. Asset / Equipment Reports

Total assets, Active, Maintenance, Calibration, Out of service, Warranty
expiring. Example categories: Patient Monitors, Ventilators, X-Ray
Machines, MRI, CT.

## 40. Staff Reports

Total staff, Doctors, Nurses, Technicians, Pharmacists, Administrative
staff, Active/inactive, Department assignment, Shift coverage, Workload.

## 41. Staff Credential Report

Credential Status: Valid, Expiring <90 days, Expired, Missing. Records:
Professional license, Certification, Training, Credential, Expiry date.

## 42. Department Performance Report

Per-department Patients / Revenue / Avg Wait table.

## 43. Hospital Capacity Report

Beds, Rooms, Emergency bays, ICU capacity, Operating rooms, Clinics,
Imaging capacity, Laboratory capacity — complete capacity picture.

## 44. Patient Flow Report

Registration -> Appointment -> Check-In -> Encounter -> Orders -> Results
-> Treatment -> Admission/Discharge -> Follow-up. Show where patients
spend the most time.

## 45. Operational Bottleneck Report

Automatically highlight areas requiring attention (e.g. Emergency Doctor
Waiting 41 min, Lab Result TAT 67 min, Bed Assignment 52 min, Radiology
Reporting 74 min, Pharmacy Waiting 28 min). Especially useful for the
Hospital Admin dashboard.

## 46. Quality & KPI Dashboard

Configurable KPI framework. Possible KPIs: Patient waiting time,
Appointment no-show rate, Emergency waiting time, Average LOS, Bed
occupancy, Lab/Radiology/Pharmacy turnaround, OR utilization, Discharge
delay, Readmission metrics where appropriately defined. Hospital should be
able to configure which KPIs it uses.

## 47. Audit Reports

Connects directly to the Audit Service. Show: User, Action, Resource,
Patient/Record, Timestamp, Organization, IP/Session info where
appropriate, Result.

## 48. Integration Reports

Because the HMS is part of the Universal Healthcare Data Exchange: FHIR,
HL7, DICOM, REST, External Systems. Metrics: Messages sent/received,
Successful, Failed, Pending, Retried, Rejected.

## 49. Integration Error Report

Message ID, Interface, Source, Destination, Message Type, Timestamp,
Status, Error, Retry Count.

## 50. Notification Reports

SMS, Email, Push, In-app. Metrics: Sent, Delivered, Failed, Pending.
Examples: appointment reminders, lab results, prescription notifications,
discharge notifications, follow-up reminders.

## 51. Patient Communication Report

Appointment reminders, Patient notifications, Portal activity, Mobile app
activity, Consent requests, Record-sharing notifications.

## 52. Patient Portal / Mobile App Reports

Active patients, Portal users, Mobile users, Appointment bookings, Record
views, Documents accessed, Consent requests, Record sharing,
Notifications.

## 53. Consent Reports

Active Consents, Expired, Revoked, Pending, Denied. Break down by
Patient, Organization, Purpose, Data category, Expiration.

## 54. Data Exchange Reports

HMS -> Integration Gateway -> FHIR/HL7/DICOM -> Universal Platform ->
External Organization. Show: Records exchanged, Organizations connected,
Data types exchanged, Successful/Failed exchanges, Consent-approved
exchanges, Rejected exchanges.

## 55. Report Builder

Authorized administrators build reports themselves: Select Data Source ->
Select Fields -> Filters -> Group By -> Sort By -> Generate Report.
Strongly recommended for the long-term product.

## 56. Saved Reports

Users save commonly used reports (My Reports list). Actions: Open, Edit,
Duplicate, Schedule, Export, Delete.

## 57. Scheduled Reports

E.g. Daily Hospital Summary -> Every Day -> 06:00 -> Hospital
Administrator -> PDF. Or Monthly Revenue Report -> 1st Day of Month ->
Finance Manager -> Excel.

## 58. Export Center

Central location listing Report / Format / Requested By / Status.
Statuses: Queued, Processing, Ready, Failed, Expired.

## 59. Report Access Control

User -> Authentication -> Role -> Permission -> Organization -> Department
-> Report Access -> Data Filtering. Role examples: Super Admin (hospital-
wide authorized reports), Hospital Admin (operational reports), Department
Manager (their department), Doctor (only authorized clinical info),
Finance (billing/insurance), Pharmacy Manager, Laboratory Manager.

## 60. Multi-Hospital Reporting

Organization -> Hospital A/B/Clinic C, each with their own departments.
Reports should support Organization -> Hospital -> Branch -> Department ->
Service level scoping; a user must only see data they're authorized for.

## 61. Report Drill-Down

E.g. Emergency Patients (1,248) -> click -> Emergency Patient List ->
click -> Patient -> Encounter -> Clinical Record. Similarly for Lab Tests
-> Lab Orders -> Patient -> Specimen -> Result.

## 62. Report Page Design

Suggested layout: header filters (Date/Hospital/Department), KPI row,
Patient Volume + Department Activity charts, Bed Occupancy + Revenue
charts, Operational Alerts panel, [Detailed Reports] [Report Builder]
[Export Center] action row.

## 63. Frontend Route Structure

```
src/modules/reports/
├── pages/ (ReportsDashboard, PatientReports, OPDReports, EmergencyReports,
│   AdmissionReports, BedReports, LaboratoryReports, RadiologyReports,
│   PharmacyReports, SurgeryReports, NursingReports, DoctorReports,
│   BillingReports, InsuranceReports, InventoryReports,
│   ProcurementReports, StaffReports, ReferralReports,
│   IntegrationReports, AuditReports, ConsentReports,
│   NotificationReports, QualityReports, ReportBuilder)
├── components/ (ReportCard, KPIWidget, DateRangeFilter,
│   DepartmentFilter, HospitalFilter, ReportTable, ReportChart,
│   ExportButton, ReportFilters, DrillDown, ScheduleReport)
└── services/ (reportApi)
```

## 64. Reports Sidebar

Grouped, not 50 flat report names: Overview; Clinical (Patients, OPD,
Emergency, Admissions, Discharges, Diagnoses, Procedures, Referrals);
Departments (Laboratory, Radiology, Pharmacy, Surgery, ICU, Nursing);
Operations (Appointments, Beds, Patient Flow, Waiting Time, Capacity);
Financial (Revenue, Billing, Payments, Insurance); Resources (Staff,
Equipment, Inventory, Procurement); Interoperability (FHIR, HL7, DICOM,
Integration, Exchange); Security (Audit, Access, Consent); Advanced
(Quality, Analytics, Report Builder, Scheduled Reports, Export Center).

## 65. The important architecture

The frontend built now should not calculate or permanently store these
reports itself. Later architecture: `HMS -> Patient/Clinical/Billing
Services -> Events/Data -> Reporting Layer -> Analytics/BI -> Reports API
-> HMS Frontend`. For the Universal Healthcare platform: `HMS -> FHIR/HL7/
DICOM -> Integration Platform -> Universal Healthcare Platform ->
Analytics/Exchange/Patient App`. Reports should be treated as its own
major HMS module, with role-based access, tenant isolation, drill-down,
exports, scheduling, auditability, and eventually a dedicated reporting/
analytics backend. For the frontend, build the entire Reports UI with
realistic mock data now; later replace the mock data with APIs without
redesigning the screens.
