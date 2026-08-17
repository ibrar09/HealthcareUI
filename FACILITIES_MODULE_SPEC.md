# Facilities Module Spec

Saved verbatim from the user's paste (2026-08-17) — a persistent reference
doc, same treatment as the other `*_SPEC.md` files.

**Scope note:** the user's own framing was explicit: "go and add these
things in the facilities like type of update you can say but do ur best
there" — an UPDATE to the already-shipped Facilities module (Locations/
Departments/Services/Wards & Beds tabs, built earlier this session), not a
literal rebuild of all 62 sections. Built the highest-value real subset:
a genuine Overview dashboard (§2-3, KPIs + Facility Status reusing the real
`Facility.status` field), a Maintenance tab with one real Work Order
lifecycle collapsing Request+WorkOrder into a single ticket (§18-23, since
a request becoming a work order is the same ticket progressing through
status, not two systems that could drift out of sync), an Equipment tab
scoped to facility infrastructure only — generators/HVAC/elevators/fire
alarms/medical gas/electrical panels (§26-29; clinical/biomedical equipment
stays owned by Radiology/OT/Laboratory's own existing Equipment tabs, never
duplicated), and an Incidents tab with a simplified 5-state workflow
(§42-43: Reported → Investigating → Corrective Action → Resolved → Closed).
Real data throughout — every new interface lives in the new `facilityOps.ts`
file, positioned after `staff.ts` in the barrel so it can resolve real
staff/department/facility names.

**Deliberately NOT built** (documented backlog, not silently dropped): a
Building layer above the existing Facility→Floor→Ward→Room→Bed physical
hierarchy (would be a structural rework, not an update — no Building entity
exists in the current model); Wings/Zones; a Facility Map / digital floor
plan upload (needs file-upload infrastructure and would risk fabricating
a floor-plan renderer with no real backing data); Utilities/Power-Outage/
Fire-Safety/Housekeeping/Waste Management/Security Zones/Parking/Ambulance
Bays (operationally tangential to what's already real in this codebase);
Vendors/SLA Management/Facility Documents/Renovation Projects (generic CRUD
with no natural cross-module hook); and the backend REST API / Kafka event
/ RBAC-role sections (§59-61) — explicit backend/architecture concepts "for
later," the same treatment Configuration and Alerts gave their own
backend-only sections this session.

---

2. FACILITIES OVERVIEW

This is the main Facilities dashboard.

It should answer:

What is the physical condition and operational status of the hospital?

KPI cards
Total Buildings
8


Total Floors
42


Operational Rooms
286


Under Maintenance
12


Open Work Orders
27


Critical Issues
3


Equipment Under Maintenance
18


Facility Incidents
5
3. FACILITY STATUS

At the top:

Facility Status


🟢 Operational
🟠 Partial Disruption
🔴 Critical
⚫ Closed

Example:

Main Hospital          🟢 Operational
Emergency Building     🟢 Operational
Radiology Wing         🟠 Partial Disruption
Old Building           🔴 Maintenance

Admin can immediately see where problems exist.

4. HOSPITAL / BRANCH MANAGEMENT

Because your system is intended to be scalable, Facilities should support multiple facilities.

Example:

Organization
│
├── Riyadh Main Hospital
├── Riyadh Branch
├── Jeddah Hospital
└── Dammam Medical Center

Each facility should have:

Facility ID
Facility Code
Facility Name
Facility Type
Legal Name
Address
City
Region
Country
Phone
Email
Timezone
Operating Hours
Emergency Contact
Status
Opening Date
Closing Date
5. FACILITY TYPES

Allow configuration of facility types.

Examples:

Hospital
Clinic
Medical Center
Diagnostic Center
Laboratory
Pharmacy
Rehabilitation Center
Emergency Center
Specialty Center
Administrative Building
Warehouse
Parking Facility
6. FACILITY DETAILS PAGE

When admin clicks a hospital:

Riyadh Main Hospital

show:

Overview
├── General Information
├── Location
├── Contact
├── Operating Hours
├── Buildings
├── Departments
├── Rooms
├── Equipment
├── Maintenance
├── Incidents
├── Documents
└── History
7. BUILDING MANAGEMENT

This is one of the core Facilities components.

Example:

Riyadh Main Hospital
│
├── Main Hospital Building
├── Emergency Building
├── Outpatient Building
├── Diagnostic Building
├── Administration Building
└── Warehouse

Each building:

Building ID
Building Code
Building Name
Building Type
Facility
Address
Number of Floors
Year Built
Total Area
Capacity
Status
Building Manager
Emergency Contact
8. BUILDING TYPES

Examples:

Main Hospital
Outpatient
Emergency
Diagnostic
Surgical
Administration
Warehouse
Staff Accommodation
Parking
Utility Building
9. FLOOR MANAGEMENT

Inside each building:

Main Hospital
│
├── Basement
├── Ground Floor
├── First Floor
├── Second Floor
├── Third Floor
└── Fourth Floor

Floor information:

Floor ID
Floor Number
Floor Name
Building
Area
Description
Status
Map/Floor Plan

Example:

Floor:
2nd Floor


Building:
Main Hospital


Departments:
Cardiology
Neurology
Internal Medicine


Rooms:
42


Status:
Operational
10. WINGS / ZONES

Large hospitals should have zones.

Example:

2nd Floor
│
├── East Wing
├── West Wing
├── North Wing
└── South Wing

Configuration:

Zone ID
Zone Name
Zone Code
Floor
Building
Description
Access Level
Status
11. DEPARTMENT / UNIT LOCATION

Your Staff/Clinical modules will have departments, but Facilities should define where those departments physically exist.

Example:

Cardiology
Location:
Main Hospital
2nd Floor
East Wing
Rooms 201–215

Don't duplicate department master data.

Instead:

Department
      ↓
Facility Location
12. ROOMS

This is another major component.

Room types:

Consultation Room
Examination Room
Treatment Room
Procedure Room
Operating Room
Recovery Room
Patient Room
Isolation Room
ICU Room
Meeting Room
Laboratory Room
Imaging Room
Pharmacy Room
Storage Room
Utility Room
Staff Room
Waiting Room
Reception Room
13. ROOM INFORMATION

Each room should have:

Room ID
Room Number
Room Name
Room Type
Building
Floor
Wing
Department
Capacity
Area
Status
Accessibility
Gender Restriction
Isolation Capability
Equipment
Responsible Department

Example:

Room:
CARD-204


Type:
Consultation Room


Department:
Cardiology


Floor:
2


Capacity:
4


Status:
Available
14. ROOM STATUS

Use clear statuses:

AVAILABLE
OCCUPIED
RESERVED
MAINTENANCE
CLEANING
OUT_OF_SERVICE
BLOCKED
RENOVATION

This is important because other modules can consume the room availability.

15. FACILITY MAP

This would make your system feel much more advanced.

Create:

Facility Map

Example:

              2nd FLOOR


┌─────────────────────────────────────────────┐
│                                             │
│  CARDIOLOGY                                │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ 201  │ │ 202  │ │ 203  │               │
│  └──────┘ └──────┘ └──────┘               │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ 204  │ │ 205  │ │ 206  │               │
│  └──────┘ └──────┘ └──────┘               │
│                                             │
│──────────── Corridor ──────────────────────│
│                                             │
│  Waiting Area              Nurses Station  │
│                                             │
└─────────────────────────────────────────────┘

Clicking a room opens its details.

16. DIGITAL FLOOR PLAN

Allow administrators to upload:

Floor plans
Building plans
Emergency evacuation maps
Fire escape plans
Utility maps

Supported files:

PDF
PNG
JPG
SVG

For a future advanced version, you can make rooms clickable on an SVG floor map.

17. LOCATION HIERARCHY

This should be standardized in your database.

Organization
    ↓
Facility
    ↓
Building
    ↓
Floor
    ↓
Wing / Zone
    ↓
Department / Unit
    ↓
Room
    ↓
Bed

But because Beds is its own module, Facilities shouldn't own all bed operations.

Facilities defines the physical location:

Room → Physical Space

Beds manages:

Bed → Patient allocation
18. MAINTENANCE

This is one of the biggest parts of Facilities.

Create:

Facilities
 └── Maintenance

Maintenance categories:

Electrical
Plumbing
HVAC
Civil
Structural
Medical Gas
Fire Safety
Elevator
Generator
IT Infrastructure
Biomedical Equipment
Security Systems
Other
19. MAINTENANCE DASHBOARD

Show:

Open Requests        27
Critical             3
In Progress          12
Scheduled             8
Completed Today      21
Overdue               4
20. MAINTENANCE REQUEST

Staff should be able to report facility problems.

Example:

Maintenance Request


Location:
Building A
Floor 2
Room 204


Category:
HVAC


Problem:
Room temperature too high


Priority:
High


Description:
Air conditioning not working properly.


Attachment:
[Photo]


Submit
21. PRIORITY
CRITICAL
HIGH
MEDIUM
LOW

Example:

Critical
Medical gas failure
Fire system failure
Major power outage
ICU HVAC failure
Water leakage affecting critical area
Low
Broken chair
Wall paint
Minor door issue
22. WORK ORDERS

Once a request is approved:

Maintenance Request
        ↓
Work Order
        ↓
Assign Technician
        ↓
Schedule
        ↓
Work Started
        ↓
Work Completed
        ↓
Verification
        ↓
Closed

Work order data:

Work Order ID
Request ID
Facility
Building
Location
Category
Priority
Assigned Team
Assigned Technician
Scheduled Date
Started Date
Completed Date
Estimated Cost
Actual Cost
Parts Used
Notes
Attachments
Status
23. WORK ORDER STATUS
NEW
ASSIGNED
SCHEDULED
IN_PROGRESS
ON_HOLD
COMPLETED
VERIFICATION
CLOSED
CANCELLED
24. PREVENTIVE MAINTENANCE

Don't only fix things after they break.

Configure preventive maintenance.

Example:

Generator


Maintenance:
Every 3 months


Last:
01 Jun 2026


Next:
01 Sep 2026


Status:
Scheduled

Other examples:

HVAC
Elevators
Generators
Fire alarms
Fire extinguishers
Medical gas systems
Water systems
Electrical panels
Emergency lighting
25. PREVENTIVE MAINTENANCE SCHEDULE

Show:

Today
This Week
This Month
Upcoming
Overdue

Example:

Equipment        Maintenance       Due Date      Status


Generator 01     Inspection        Aug 18        🟡 Due Soon
Elevator 02      Service           Aug 20        🟢 Scheduled
HVAC-3           Filter Change     Aug 17        🔴 Overdue
Fire System      Inspection        Aug 25        🟢 Scheduled
26. EQUIPMENT

Facilities can maintain physical equipment/location information, while Inventory handles stock.

Examples:

Generator
HVAC
Elevator
Fire Alarm
Security Camera
Access Control
Medical Gas System
Water Pump
Boiler
Electrical Panel

For clinical/biomedical equipment:

MRI
CT
X-Ray
Ventilator
Patient Monitor
Anesthesia Machine
Ultrasound

You can integrate this with your asset/biomedical management later.

27. EQUIPMENT DETAILS
Equipment ID
Asset Number
Equipment Name
Category
Manufacturer
Model
Serial Number
Purchase Date
Warranty Expiry
Location
Department
Vendor
Status
Maintenance Schedule
Last Service
Next Service
28. EQUIPMENT STATUS
OPERATIONAL
IN_USE
AVAILABLE
MAINTENANCE
CALIBRATION
OUT_OF_SERVICE
DECOMMISSIONED
29. CALIBRATION

For medical equipment, calibration tracking is important.

Example:

Equipment:
Patient Monitor 203


Last Calibration:
01 July 2026


Next Calibration:
01 January 2027


Status:
Valid

Alerts:

Calibration Due Soon
Calibration Expired
Equipment Locked
30. UTILITIES MANAGEMENT

Hospital facilities depend heavily on utilities.

Create:

Utilities
Electricity

Track:

Main power
Backup generator
UPS
Power consumption
Outages
Electrical incidents
Water

Track:

Main water supply
Storage tanks
Pumps
Water interruptions
Water quality inspections
HVAC

Track:

HVAC units
Temperature
Critical areas
Maintenance
Failures
Medical gases

Track:

Oxygen
Medical Air
Nitrous Oxide
Vacuum

Medical gas failures should be treated as high/critical facility alerts.

31. POWER OUTAGE MANAGEMENT

Example:

Power Outage


Location:
Building A


Started:
14:22


Affected:
2nd Floor


Backup:
Generator Active


Affected Departments:
Cardiology
Laboratory


Status:
Under Investigation
32. FIRE & LIFE SAFETY

This should be a dedicated area.

Track:

Fire alarms
Fire extinguishers
Sprinklers
Emergency exits
Fire doors
Emergency lighting
Fire drills
Inspection dates
Compliance status

Example:

Fire Extinguisher


Location:
Floor 2
East Wing


Last Inspection:
01 Aug 2026


Next Inspection:
01 Sep 2026


Status:
Valid
33. SAFETY INSPECTIONS

Create inspection templates.

Example:

Fire Safety Inspection


☐ Fire exits accessible
☐ Fire extinguishers available
☐ Emergency lights working
☐ Fire doors functional
☐ Alarm operational
☐ Evacuation signage visible

Inspection result:

PASS
FAIL
PARTIAL
34. HOUSEKEEPING

Hospital cleanliness is critical.

Create:

Housekeeping

Track:

Cleaning requests
Cleaning schedules
Room cleaning
Deep cleaning
Isolation room cleaning
Spill cleanup
Waste collection
Cleaning staff
Cleaning status

Example:

Room 204


Patient discharged
      ↓
Cleaning Required
      ↓
Cleaning Assigned
      ↓
Cleaning In Progress
      ↓
Inspection
      ↓
Available
35. CLEANING STATUS
CLEAN
DIRTY
CLEANING
INSPECTION
OUT_OF_SERVICE
36. ISOLATION ROOM CLEANING

For isolation rooms, have specialized workflows.

Patient Discharged
       ↓
Isolation Cleaning Required
       ↓
Assigned Staff
       ↓
PPE Required
       ↓
Cleaning
       ↓
Supervisor Verification
       ↓
Room Released
37. WASTE MANAGEMENT

Hospital waste needs its own tracking.

Categories can include:

General Waste
Biomedical Waste
Sharps
Pharmaceutical Waste
Chemical Waste
Radioactive Waste

Track:

Waste Type
Collection Location
Container
Quantity
Collection Date
Collected By
Disposal Vendor
Disposal Date
Certificate
38. SECURITY

Facilities can also contain physical security operations.

Track:

Security zones
Access-controlled areas
Security incidents
CCTV locations
Access control devices
Emergency exits
Restricted areas

Example:

Restricted Area


MRI Zone
ICU
Pharmacy Controlled Storage
Medical Records
Server Room
Operating Theatre
39. ACCESS CONTROL

For physical locations:

Area
 ↓
Access Policy
 ↓
Allowed Roles
 ↓
Access Method

Example:

Pharmacy Controlled Storage


Allowed:
Pharmacist
Pharmacy Manager
Authorized Admin


Access:
Badge + PIN

Don't confuse this with application RBAC. This is physical access control.

40. PARKING MANAGEMENT

For a larger hospital:

Parking

Track:

Parking areas
Parking zones
Capacity
Occupancy
Reserved spaces
Disabled parking
Ambulance parking
Staff parking
Visitor parking

Example:

Visitor Parking
Capacity: 250
Occupied: 198
Available: 52
41. AMBULANCE FACILITY AREA

Emergency facility configuration can include:

Ambulance Bays
Emergency Entrance
Trauma Entrance
Ambulance Parking
Emergency Access Routes

This is useful for emergency operations.

42. FACILITY INCIDENTS

Separate from maintenance requests.

An incident means something actually happened.

Examples:

Water leakage
Power outage
Fire alarm
Elevator failure
HVAC failure
Security incident
Medical gas failure
Structural damage
Flooding
Equipment failure

Incident information:

Incident ID
Date/Time
Location
Category
Severity
Description
Reported By
Assigned Team
Impact
Actions Taken
Root Cause
Resolution
Attachments
43. INCIDENT WORKFLOW
Incident Detected
       ↓
Reported
       ↓
Classified
       ↓
Assigned
       ↓
Investigation
       ↓
Corrective Action
       ↓
Verification
       ↓
Closed
44. FACILITY REQUESTS

Staff should be able to request facility services.

Examples:

Move equipment
Room cleaning
Furniture request
Temperature issue
Electrical issue
Plumbing issue
Maintenance
Access request
Room setup
Event setup
45. FACILITY CALENDAR

Show:

Maintenance
Inspections
Cleaning
Equipment Service
Fire Drills
Facility Events
Renovation
Shutdowns

Example:

August 2026


17  HVAC maintenance
18  Generator inspection
19  Fire drill
20  Elevator service
22  Electrical inspection
46. RENOVATION / CONSTRUCTION

For enterprise facilities:

Projects

Track:

Project
Location
Contractor
Start Date
Expected Completion
Budget
Actual Cost
Status
Impact

Example:

Radiology Expansion


Budget:
SAR 2.4M


Start:
01 Aug


Expected Completion:
30 Nov


Status:
In Progress
47. VENDOR MANAGEMENT

Facilities will need external vendors.

Examples:

HVAC Contractor
Elevator Contractor
Cleaning Company
Security Company
Waste Disposal Company
Fire Safety Company
Electrical Contractor
Plumbing Contractor
Medical Gas Contractor

Vendor information:

Vendor ID
Company
Contact
Contract
Services
Contract Start
Contract End
SLA
Status
Documents
48. SLA MANAGEMENT

This is important for maintenance.

Example:

Critical
Response: 15 min
Resolution: 2 hours


High
Response: 30 min
Resolution: 4 hours


Medium
Response: 4 hours
Resolution: 24 hours


Low
Response: 1 day
Resolution: 3 days

If SLA is breached:

Work Order
    ↓
SLA Timer
    ↓
Threshold Reached
    ↓
Alert
    ↓
Escalation
49. FACILITY DOCUMENTS

Documents can include:

Building Plans
Floor Plans
Fire Certificates
Inspection Certificates
Maintenance Contracts
Equipment Manuals
Warranty Documents
Safety Certificates
Vendor Contracts
Compliance Documents

Each document:

Document ID
Type
Name
Version
Related Facility
Expiry Date
Uploaded By
Created Date
Status
50. DOCUMENT EXPIRY ALERTS

Example:

⚠ Fire Safety Certificate


Expires in:
15 days


[Renew]

This connects with your Alerts module.

51. FACILITY REPORTS

Reports should include:

Maintenance
Open Work Orders
Completed Work Orders
Overdue Work Orders
Maintenance Cost
Maintenance by Category
Maintenance by Building
Technician Performance
Equipment
Equipment Status
Equipment Failure Rate
Maintenance Cost
Calibration Due
Warranty Expiry
Utilities
Power Consumption
Water Consumption
Outages
Generator Usage
Facility
Room Utilization
Building Utilization
Facility Incidents
Downtime
SLA Performance
52. FACILITY AUDIT

Every important change should be tracked.

Example:

Admin changed Room 204 status


Before:
Available


After:
Maintenance


Changed By:
Admin


Time:
14:32


Reason:
HVAC repair

Audit events:

FACILITY_CREATED
FACILITY_UPDATED
BUILDING_CREATED
ROOM_CREATED
ROOM_STATUS_CHANGED
WORK_ORDER_CREATED
WORK_ORDER_ASSIGNED
WORK_ORDER_COMPLETED
EQUIPMENT_UPDATED
MAINTENANCE_SCHEDULED
INCIDENT_CREATED
INCIDENT_RESOLVED
VENDOR_UPDATED
DOCUMENT_UPLOADED
53. FACILITY ALERTS

Your Alerts module should receive events from Facilities.

Examples:

🔴 Medical Gas Failure
🔴 Fire System Failure
🔴 Critical Power Failure
🟠 HVAC Failure in ICU
🟠 Elevator Out of Service
🟠 Generator Maintenance Due
🟡 Fire Certificate Expiring
🟡 Equipment Calibration Due
54. FACILITIES FRONTEND STRUCTURE

I would create it like this:

Facilities
│
├── Overview
│
├── Locations
│   ├── Hospitals
│   ├── Buildings
│   ├── Floors
│   ├── Wings / Zones
│   ├── Departments
│   ├── Rooms
│   └── Facility Map
│
├── Operations
│   ├── Maintenance Requests
│   ├── Work Orders
│   ├── Preventive Maintenance
│   ├── Inspections
│   └── Facility Calendar
│
├── Assets
│   ├── Equipment
│   ├── Utilities
│   └── Safety Systems
│
├── Services
│   ├── Housekeeping
│   ├── Waste Management
│   ├── Security
│   └── Parking
│
├── Incidents
│
├── Projects
│   └── Renovation / Construction
│
├── Vendors
│
├── Documents
│
├── Requests
│
├── Reports
│
└── Audit
55. FACILITIES MAIN DASHBOARD

I'd make your actual Facilities dashboard look something like this:

┌───────────────────────────────────────────────────────────────────────┐
│ Facilities                              [Riyadh Main Hospital ▼]     │
│ Physical Infrastructure & Operations                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Buildings    Floors    Rooms     Open Work Orders    Critical Issues │
│    8           42       286            27                 3          │
│                                                                       │
├──────────────────────────────────────┬────────────────────────────────┤
│ FACILITY STATUS                      │ MAINTENANCE                    │
│                                      │                                │
│ 🟢 Main Hospital      Operational    │ Open              27           │
│ 🟢 Emergency          Operational    │ In Progress       12           │
│ 🟠 Radiology          Partial        │ Overdue            4           │
│ 🔴 Old Building       Maintenance    │ Completed Today   21           │
│                                      │                                │
├──────────────────────────────────────┼────────────────────────────────┤
│ BUILDINGS / FLOOR MAP                │ FACILITY ALERTS                │
│                                      │                                │
│ [Interactive Map]                    │ 🔴 ICU HVAC Failure            │
│                                      │ 🟠 Elevator Maintenance         │
│ Building A                           │ 🟡 Fire Certificate Expiring   │
│   Floor 1                            │ 🟡 Generator Service Due       │
│   Floor 2                            │                                │
│   Floor 3                            │ [View All]                     │
├──────────────────────────────────────┼────────────────────────────────┤
│ WORK ORDERS                          │ EQUIPMENT                      │
│                                      │                                │
│ Electrical       8                   │ Operational       342          │
│ HVAC             6                   │ Maintenance        18          │
│ Plumbing         4                   │ Calibration Due     7          │
│ Fire Safety      3                   │ Out of Service      4          │
├──────────────────────────────────────┼────────────────────────────────┤
│ UTILITIES                            │ INSPECTIONS                    │
│                                      │                                │
│ Electricity      🟢 Normal            │ Due Today         4            │
│ Water            🟢 Normal            │ Due This Week    12            │
│ HVAC             🟠 Warning          │ Overdue            2            │
│ Medical Gas      🟢 Normal            │                                │
└──────────────────────────────────────┴────────────────────────────────┘
56. FACILITIES + OTHER MODULES

This is where your system becomes integrated instead of being a bunch of independent CRUD modules.

Facilities ↔ Beds
Facilities
   ↓
Room
   ↓
Bed location
   ↓
Beds module
   ↓
Patient allocation
Facilities ↔ Emergency
Facilities
   ↓
Emergency Rooms
   ↓
Emergency Department
   ↓
Patient
Facilities ↔ Laboratory
Facilities
   ↓
Lab Rooms
   ↓
Lab Equipment
   ↓
Laboratory Module
Facilities ↔ Radiology
Facilities
   ↓
Imaging Rooms
   ↓
CT / MRI / X-Ray
   ↓
Radiology Module
Facilities ↔ OT
Facilities
   ↓
Operating Rooms
   ↓
OT Module
   ↓
Surgery
Facilities ↔ Inventory
Facilities
   ↓
Maintenance
   ↓
Parts Required
   ↓
Inventory
Facilities ↔ Staff
Facilities
   ↓
Maintenance Team
   ↓
Staff
Facilities ↔ Alerts
Facility Incident
      ↓
Alert
      ↓
Admin / Facility Manager
57. BACKEND DOMAIN MODEL

For your Spring Boot microservices architecture, I would model the domain approximately like:

Facility
 ├── Building
 │    └── Floor
 │         └── Zone
 │              └── Room
 │
 ├── Equipment
 │
 ├── Utility
 │
 ├── MaintenanceRequest
 │
 ├── WorkOrder
 │
 ├── PreventiveMaintenancePlan
 │
 ├── Inspection
 │
 ├── FacilityIncident
 │
 ├── Vendor
 │
 ├── FacilityDocument
 │
 └── FacilityProject
58. IMPORTANT DATABASE RELATIONSHIP

The physical hierarchy should be clean:

facility
   │
   ├── buildings
   │       │
   │       └── floors
   │               │
   │               └── zones
   │                       │
   │                       └── rooms
   │
   └── facility_assets

Don't duplicate:

building_name
floor_name
room_name

in every table unnecessarily.

Use IDs:

facility_id
building_id
floor_id
zone_id
room_id
59. APIs

A starting REST API structure:

/api/v1/facilities


GET    /facilities
POST   /facilities
GET    /facilities/{id}
PUT    /facilities/{id}
PATCH  /facilities/{id}
DELETE /facilities/{id}

Buildings:

/api/v1/facilities/{facilityId}/buildings

Floors:

/api/v1/buildings/{buildingId}/floors

Rooms:

/api/v1/floors/{floorId}/rooms

Maintenance:

/api/v1/maintenance/requests
/api/v1/maintenance/work-orders
/api/v1/maintenance/preventive-plans

Incidents:

/api/v1/facility-incidents

Equipment:

/api/v1/facility-equipment

Inspections:

/api/v1/facility-inspections
60. EVENTS

Since your platform uses Kafka, Facilities should publish domain events.

Examples:

FacilityCreatedEvent
BuildingCreatedEvent
RoomCreatedEvent
RoomStatusChangedEvent


MaintenanceRequestCreatedEvent
WorkOrderCreatedEvent
WorkOrderAssignedEvent
WorkOrderCompletedEvent


EquipmentMaintenanceDueEvent
EquipmentCalibrationDueEvent


FacilityIncidentCreatedEvent
FacilityIncidentResolvedEvent


UtilityFailureEvent
PowerOutageEvent
MedicalGasFailureEvent

Then:

Facilities Service
       ↓
Kafka
       ↓
Notification Service
       ↓
Alert
61. ROLE-BASED ACCESS

Not everybody should have access to everything.

Super Admin

Everything.

Facility Manager
Buildings
Floors
Rooms
Maintenance
Work Orders
Equipment
Utilities
Inspections
Vendors
Reports
Maintenance Manager
Maintenance
Work Orders
Preventive Maintenance
Equipment
Technician
Assigned Work Orders
Maintenance Tasks
Equipment
Housekeeping Supervisor
Cleaning
Rooms
Housekeeping Requests
Security Manager
Security
Incidents
Access Areas
Reception

Mostly:

View facility locations
View room availability
View directions/maps

They should not be able to modify facility infrastructure.

62. THE MOST IMPORTANT DESIGN RULE

Bro, don't turn Facilities into another generic CRUD module.

It should represent the physical world of the hospital:

                  HOSPITAL
                     │
              ┌──────┴──────┐
              │             │
          Buildings       Grounds
              │
            Floors
              │
          Wings/Zones
              │
            Rooms
              │
       ┌──────┼────────┐
       ↓      ↓        ↓
     Beds   Equipment Services
              │
       ┌──────┼───────────────┐
       ↓      ↓       ↓       ↓
      HVAC  Power   Water   Medical Gas
              │
              ↓
         Maintenance
              │
         Work Orders
              │
          Technicians
              │
          Resolution

And then connect it to the rest of your HMS:

Facilities
    │
    ├── Beds
    ├── Emergency
    ├── Laboratory
    ├── Radiology
    ├── Pharmacy
    ├── Operation Theatre
    ├── Inventory
    ├── Staff
    ├── Alerts
    ├── Reports
    └── Audit

This is the structure I would use for your project. The key is that Facilities owns physical locations and infrastructure, while the specialized modules own their operational workflows. That separation will keep your backend, frontend, permissions, and microservices much cleaner as the hospital platform grows.
