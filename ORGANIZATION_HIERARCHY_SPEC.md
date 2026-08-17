# HMS — Organization / Department Hierarchy — Architecture Spec

Pasted verbatim by the user on 2026-08-16. This is a cross-cutting
architectural proposal, not a single module spec — it touches Facilities,
Staff, Beds, Appointments, Billing, navigation, and permissions. Audited
against the current codebase the same day; see the "Current state vs. this
spec" section at the bottom for what's already built vs. genuinely missing.

---

In a large hospital, departments should not be hard-coded into the
frontend. The HMS should be a hierarchical, configurable system so the
same frontend works for a small clinic, a 500-bed hospital, or a large
hospital group.

## Example structure

```
Hospital Group
│
├── Hospital A
│   ├── Emergency Department
│   ├── Cardiology
│   ├── Neurology
│   ├── Pediatrics
│   ├── Orthopedics
│   ├── General Surgery
│   ├── Internal Medicine
│   ├── Radiology
│   ├── Laboratory
│   ├── Pharmacy
│   ├── ICU
│   └── Administration
│
├── Hospital B
│   ├── Emergency
│   ├── Cardiology
│   ├── Oncology
│   └── ...
│
└── Clinics
    ├── Clinic A
    └── Clinic B
```

The important point: these departments are configuration/data, not React code.

## 1. Hospital hierarchy

```
Organization
   ↓
Hospital / Facility
   ↓
Building
   ↓
Floor
   ↓
Department
   ↓
Unit
   ↓
Room
   ↓
Bed
```

Example:

```
King Hospital
 └── Main Building
      └── 3rd Floor
           └── Cardiology
                ├── Cardiology OPD
                ├── Cardiology Ward
                ├── CCU
                ├── Consultation Rooms
                └── Procedure Unit
```

This becomes extremely important for Beds, Appointments, Staff, Patients,
Billing and Reporting.

## 2. Department management

In the HMS Admin Portal, create: `Administration → Organization →
Departments`. The admin should be able to:

- Create department
- Edit department
- Activate/deactivate department
- Assign department head
- Assign location
- Assign services
- Assign doctors
- Assign nurses
- Assign staff
- Configure appointment types
- Configure working hours
- Configure billing/pricing
- Configure rooms
- Configure beds
- Configure department permissions

Example:

```
Department
--------------------------------
Name: Cardiology
Code: CARD
Type: Clinical
Status: Active
Location: Main Hospital
Floor: 3
Department Head: Dr. Ahmed
```

## 3. Don't put 50 departments in the sidebar

Instead of a flat list of every department, group navigation:

```
Dashboard

Operations
├── Appointments
├── Patients
├── Encounters
├── Beds
└── Admissions

Clinical
├── OPD
├── Emergency
├── IPD
├── Laboratory
├── Radiology
└── Pharmacy

Organization
├── Departments
├── Facilities
├── Staff
└── Locations
```

Then provide a Department/Facility selector at the top:

```
Hospital: King Hospital ▼
Department: Cardiology ▼
```

When the user selects Cardiology, the whole app (Dashboard, Patients,
Appointments, Encounters, Doctors, Beds, Orders, Billing, Reports) shows
data scoped to that department.

## 4. Department-specific dashboards

Hospital-wide dashboard:

```
HOSPITAL OVERVIEW
Patients Today       1,245
Appointments           642
Emergency               93
Admissions              71
Discharges              64
Bed Occupancy           82%
Pending Lab Results    127
Pending Payments       214
```

Cardiology's own view:

```
CARDIOLOGY
Today's Patients       86
Appointments           54
Waiting                12
In Consultation         4
Admissions              8
Available Beds          6
Pending Results         9
```

Radiology:

```
RADIOLOGY
Today's Studies       142
MRI                    24
CT                     38
X-Ray                  61
Ultrasound             19
Pending Reports         17
```

Emergency:

```
EMERGENCY
Waiting                18
Critical                3
Urgent                  7
Normal                  8
Available Beds         12
```

Same HMS frontend, adapts based on selected department.

## 5. Department types

Don't assume every department is clinical. Configurable categories:

`Clinical · Diagnostic · Therapeutic · Pharmacy · Administrative · Support
· Emergency · Inpatient · Outpatient · Surgical · Critical Care`

| Department | Type |
|---|---|
| Cardiology | Clinical |
| Emergency | Emergency |
| ICU | Critical Care |
| Laboratory | Diagnostic |
| Radiology | Diagnostic |
| Pharmacy | Pharmacy |
| Surgery | Surgical |
| Billing | Administrative |
| HR | Administrative |

## 6. Staff belongs to organization/location

Don't model a doctor as `doctor.department = "Cardiology"` (a doctor can
work in multiple places). Better model:

```
Doctor
 ├── Organization
 ├── Facility
 ├── Departments
 ├── Specialties
 ├── Locations
 ├── Services
 └── Schedules
```

Example:

```
Dr. Ahmed
Hospital: King Hospital
Departments: Cardiology, Emergency
Specialty: Cardiology
Locations: Cardiology OPD, Emergency Department
Services: Consultation, Follow-up, ECG
```

## 7. Appointments

```
Hospital
   ↓
Department
   ↓
Service
   ↓
Doctor
   ↓
Location
   ↓
Room
   ↓
Time Slot
```

Example:

```
Hospital: King Hospital
Department: Cardiology
Service: Cardiology Consultation
Doctor: Dr. Ahmed
Location: Cardiology OPD
Room: C-304
Date: 20 Aug
Time: 10:30 AM
```

Much better than simply `Doctor → Appointment`.

## 8. Beds

```
Hospital
 ↓
Building
 ↓
Floor
 ↓
Department / Unit
 ↓
Ward
 ↓
Room
 ↓
Bed
```

Example:

```
King Hospital
 → Main Building
   → 4th Floor
     → Cardiology
       → Cardiology Ward
         → Room 401
           → Bed 401-A
           → Bed 401-B
```

Then the frontend can filter: Facility / Department / Ward / Status.

## 9. Billing also needs department structure

A charge should be traceable to:

```
Hospital
 ↓
Department
 ↓
Service
 ↓
Provider
 ↓
Encounter
 ↓
Charge
```

Examples:

```
Department: Cardiology · Service: Cardiology Consultation · Provider: Dr. Ahmed · Charge: SAR 300
Department: Radiology · Service: MRI Brain · Charge: SAR 1,200
Department: Laboratory · Service: CBC · Charge: SAR 80
```

## 10. Permissions

```
User
 ↓
Role
 ↓
Organization
 ↓
Facility
 ↓
Department
 ↓
Permissions
```

Example — Cardiology nurse CAN: view assigned patients, view encounters,
record vitals, view medication orders, record medication administration,
view clinical notes. Shouldn't automatically have: hospital financial
administration, HR, system configuration, other hospital branches.

## 11. One user can have multiple department roles

```
Dr. Ahmed
Hospital: King Hospital
Departments: Cardiology, Emergency
Roles: Doctor, Department Consultant
```

Access changes based on selected context:

```
Current Context
Hospital: King Hospital
Department: Cardiology
Role: Doctor
```

## 12. Department switching

A global context selector:

```
┌──────────────────────────────────────────────┐
│ King Hospital ▼   Cardiology ▼   Dr. Ahmed ▼ │
└──────────────────────────────────────────────┘
```

Switching Cardiology ▼ to Emergency ▼ changes the operational context.

## 13. Hospital groups

```
Healthcare Organization
├── Hospital Riyadh (Cardiology, Emergency, ...)
├── Hospital Jeddah (Cardiology, ...)
├── Hospital Dammam (...)
└── Clinics
```

Group Admin sees everything. Hospital Admin sees their hospital. Department
Admin sees their department. Doctor sees authorized clinical data. Nurse
sees authorized nursing data. Patient sees their own information.

## 14. Suggested frontend IA

```
HMS PORTAL
├── Dashboard
├── Patient Management (Patients, Registration, Search, Profile)
├── Appointments (Calendar, Schedule, Queue, Check-in)
├── Clinical (OPD, Emergency, IPD, Encounters, Notes, Diagnoses, Orders)
├── Departments (Department List, Units, Services, Department Dashboard)
├── Facilities (Buildings, Floors, Wards, Rooms, Beds)
├── Staff (Doctors, Nurses, Technicians, Other Staff)
├── Laboratory, Radiology, Pharmacy, Nursing, Surgery, ICU
├── Billing, Insurance, Inventory, Documents, Notifications
├── Reports, Integrations, Audit
└── Administration
```

---

## Current state vs. this spec (audited 2026-08-16)

**Already exists / matches:**
- `Facility.parentOrganization` (string label), `Floor → Ward(dept-tagged)
  → Room → Bed` chain fully built with real CRUD/lifecycle mutations.
- `Ward.departmentId` — Ward already functions as the spec's "Unit" level.
  **Don't add a separate Unit entity — it would duplicate Ward.**
- `DepartmentConfig.headDoctorId` is a real staff reference (not free text).
- A Department create/edit screen already exists: `DepartmentFormDrawer.tsx`
  + "Departments" tab on `FacilityList.tsx`.
- `Appointment.departmentId` + `facilityId`; `ScheduleRecord` carries
  per-doctor-per-department working hours already.
- `BillableService.department` (string) → `Charge` traceability exists,
  just not FK-based (see gaps).
- `HMS_DOMAIN_STANDARDS.md` §4/§11/§12 already documents this target
  hierarchy conceptually — the standards doc anticipated this.
- `HOSPITAL_ADMIN_MODULE_MAP.md` already flags Facilities-Departments vs.
  Administration-Departments as one dataset, not two screens — don't
  duplicate.

**Exists but thin / needs extension:**
- `DepartmentConfig` has only: `id, facilityId, name, category` (hardcoded
  union of specialty names, not a configurable type taxonomy),
  `headDoctorId`, `floor` (free-text, not an FK), `activeStaff` (a count,
  not a roster), `status` (operational load — normal/critical/overload/
  optimal — NOT active/inactive lifecycle).
- No department type taxonomy as a configurable lookup (cf. `BedTypeConfig`
  — that pattern already exists and should be mirrored).
- No department active/inactive lifecycle (the existing `status` field
  means something else entirely).
- No assigned services/doctors/nurses/staff roster/appointment types/
  working hours/billing config/rooms-beds/permissions on `DepartmentConfig`.
- `PractitionerRole` is single-department, single-specialty
  (`departmentId: string`, `specialty: string`) — not the proposed
  multi-department/multi-specialty/multi-location/multi-service model.
- `Appointment` has no `serviceId` or `locationId`/`roomId` — only
  department/facility/doctor/type.
- `Charge`/`BillableService` have no `departmentId` FK, only a free-text
  label — a department rename wouldn't propagate.

**Genuinely missing / net new:**
- No `Organization` entity at all (just a display string).
- No `Building` entity — `Facility` currently doubles as Building (an
  explicit, already-documented decision that this proposal would need to
  revisit).
- No global "Hospital ▼ Department ▼" context selector anywhere in the UI
  or app state.
- No department-specific dashboards.
- No RBAC/permissions model scoped by Organization/Facility/Department.
- No multi-hospital-group model (Group Admin / Hospital Admin / Department
  Admin scoping).
- Sidebar nav is flat (only Dashboard has sub-items today); the grouping
  mechanism (`AppShell`'s `children` array) already exists and is reusable.
