# Configuration Module Spec

Saved verbatim from the user's paste (2026-08-17), same treatment as the
other `*_MODULE_SPEC.md` files — a persistent reference doc.

**Scope note:** the spec came with no attached scope instruction either
way (same ambiguity as Reports/Audit before it). Asked the same two
clarifying questions via `AskUserQuestion` — the user chose **full build,
all 47 sections**, with full verification rigor. See
`HOSPITAL_ADMIN_MODULE_MAP.md` build-order #34 for exactly what was built.
Per the spec's own closing §47 ("don't make Configuration just a
collection of CRUD screens... every important configuration should have:
Scope + Version + Validation + Approval + Audit + Rollback"), the build
includes a real most-specific-wins scope resolver (`resolveSetting()`),
a Draft→Submitted→Reviewed→Approved→Published change-approval workflow
for critical keys, a change-history log wired into every mutation, and
masked-reference-only secrets (never real values) throughout. Sections
that already have a real home in another module (Departments/Rooms/Beds
in Facilities, Doctor/Nursing/Lab/Radiology/Pharmacy/Emergency/OT settings
in their own modules, Insurance/Billing rules in Billing's own Contracts
tab) are link-outs from the Clinical Settings panel, not rebuilt.

---

now move to the configuration Configuration Module — Admin Dashboard
1. Configuration Dashboard

When the admin opens Configuration, first show an overview.

KPI cards
Total Configurations
Active Configurations
Pending Changes
Recently Modified
System Defaults
Hospital-Specific Settings
Branch-Specific Settings
Failed Configuration Changes
Quick actions
Add Configuration
Import Configuration
Export Configuration
Reset to Default
View Configuration History
Compare Configurations
2. Organization / Hospital Configuration

This controls the basic hospital organization.

Hospital information
Hospital name
Legal name
Hospital code
Registration number
Tax/VAT number
Address
Country
City
Region
Postal code
Phone
Email
Website
Logo
Time zone
Currency
Language
Date format
Time format
Hospital structure
Hospital
Branch
Building
Floor
Department
Unit
Ward
Room
Bed

Example:

Hospital
 ├── Riyadh Branch
 │    ├── Main Building
 │    │    ├── Emergency
 │    │    ├── Laboratory
 │    │    ├── Pharmacy
 │    │    └── Surgery
 │    │
 │    └── Outpatient Building
 │         ├── Cardiology
 │         ├── Neurology
 │         └── Pediatrics
3. General System Settings

Controls general application behavior.

Settings
Default language
Default timezone
Default currency
Date format
Time format
Number format
Decimal precision
First day of week
Default country
Default region
Session timeout
Automatic logout
Maximum login attempts
Password expiration
Account lock duration
Example
Default Currency: SAR
Timezone: Asia/Riyadh
Date Format: DD-MM-YYYY
Time Format: 24 Hour
Session Timeout: 30 minutes
4. Localization & Language

Your system is international, so this section is important.

Languages
English
Arabic
Urdu
French
etc.
Configuration
Default language
Supported languages
RTL support
Translation management
Date localization
Number localization
Currency localization

For Saudi Arabia specifically:

English → LTR
Arabic → RTL

The frontend should automatically switch layout direction.

5. User & Access Configuration

This controls how users interact with the system.

User settings
User registration
User activation
Account expiration
Password policy
Password history
Password expiration
MFA requirement
Login attempt limit
Session timeout
Role configuration

Roles could include:

Super Admin
Hospital Admin
Branch Admin
Doctor
Nurse
Pharmacist
Laboratory Technician
Radiologist
Receptionist
Billing Officer
Finance Officer
IT Administrator
Auditor
Permission configuration

Permissions should be granular:

PATIENT_VIEW
PATIENT_CREATE
PATIENT_UPDATE
PATIENT_DELETE


LAB_RESULT_VIEW
LAB_RESULT_CREATE
LAB_RESULT_UPDATE


PHARMACY_DISPENSE
PHARMACY_STOCK_VIEW


REPORT_VIEW
REPORT_EXPORT

Don't just make permissions like:

ADMIN = EVERYTHING

Use RBAC with fine-grained permissions.

6. Patient Configuration

Controls patient-related behavior.

Patient identification
Patient ID format
MRN format
National ID type
Passport support
Temporary patient ID
Duplicate patient detection
Example
MRN Prefix: MRN
Starting Number: 100000
Format: MRN-{YYYY}-{######}

Result:

MRN-2026-000123
Other settings
Patient registration requirements
Required fields
Emergency registration
Minor patient rules
Guardian requirements
Duplicate detection rules
Patient merge rules
Patient archival rules
7. Appointment Configuration
Appointment settings
Appointment duration
Default consultation duration
Slot interval
Cancellation period
Rescheduling rules
No-show rules
Maximum appointments per day
Online booking
Walk-in appointments
Appointment statuses
BOOKED
CONFIRMED
CHECKED_IN
IN_PROGRESS
COMPLETED
CANCELLED
NO_SHOW
RESCHEDULED
Doctor schedules
Working days
Working hours
Break times
Leave periods
Holiday schedules
Maximum patients per session
8. Department Configuration

Admin should be able to create and manage departments.

Example:

Department
 ├── Cardiology
 ├── Neurology
 ├── Pediatrics
 ├── Orthopedics
 ├── Dermatology
 ├── Emergency
 ├── Laboratory
 ├── Radiology
 ├── Pharmacy
 └── Surgery

Each department can have:

Department code
Name
Description
Head
Location
Contact number
Operating hours
Status
9. Doctor Configuration
Doctor profile configuration
Doctor ID format
Specialization
Sub-specialization
License number
Registration authority
Consultation duration
Consultation fee
Department
Branch
Working schedule
Medical specialties

Admin can configure:

Cardiology
Neurology
Orthopedics
Pediatrics
Dermatology
ENT
Ophthalmology
General Medicine
General Surgery
10. Nursing Configuration
Settings
Nursing stations
Nurse-to-patient ratio
Shift types
Nursing documentation
Vital-sign frequency
Nursing task categories
Escalation rules
Shift example
Morning: 07:00 – 15:00
Evening: 15:00 – 23:00
Night:   23:00 – 07:00
11. Laboratory Configuration

This connects directly with your Laboratory module.

Configure
Lab departments
Test categories
Test types
Specimen types
Collection containers
Reference ranges
Units
Critical values
Result statuses
Lab machines
Lab locations
Example
Test:
CBC


Specimen:
Blood


Unit:
cells/µL


Reference Range:
Male: ...
Female: ...
Result statuses
ORDERED
COLLECTED
RECEIVED
PROCESSING
COMPLETED
VERIFIED
REJECTED
CANCELLED
12. Radiology / Imaging Configuration
Configure
Imaging modalities
Imaging departments
Procedures
Machines
Rooms
Radiologists
Report templates
Modalities
X-Ray
CT
MRI
Ultrasound
Mammography
PET
Fluoroscopy
Integration

This is where you later connect:

HMS
 ↓
Radiology
 ↓
RIS
 ↓
PACS
 ↓
DICOM
13. Pharmacy Configuration
Configure
Medication categories
Dosage forms
Routes
Units
Frequency
Prescription rules
Dispensing rules
Controlled medications
Refill rules
Dosage forms
Tablet
Capsule
Injection
Syrup
Cream
Ointment
Drops
Inhaler
Routes
Oral
IV
IM
Subcutaneous
Topical
Inhalation
Ophthalmic
14. Inventory Configuration

Controls hospital inventory.

Configure
Warehouses
Stores
Stock locations
Units of measurement
Reorder levels
Maximum stock
Minimum stock
Safety stock
Suppliers
Purchase categories
Expiry rules
Stock statuses
AVAILABLE
RESERVED
DAMAGED
EXPIRED
QUARANTINED
BLOCKED
15. Emergency Configuration

Very important for hospital systems.

Configure
Triage levels
Emergency priorities
Emergency rooms
Emergency beds
Ambulance configuration
Emergency workflows
Escalation rules
Triage

For example:

Level 1 → Immediate
Level 2 → Emergency
Level 3 → Urgent
Level 4 → Less Urgent
Level 5 → Non-Urgent
16. OT / Surgery Configuration
Configure
Operating rooms
Surgery types
Procedure categories
Surgeons
Anesthetists
Surgical equipment
Surgery duration
Pre-op workflow
Post-op workflow
Cancellation rules
Surgery workflow
Scheduled
 ↓
Pre-Op
 ↓
Ready
 ↓
In Surgery
 ↓
Recovery
 ↓
Completed
17. Billing & Financial Configuration
Configure
Billing rules
Invoice numbering
Payment methods
Tax/VAT
Discounts
Insurance
Copay
Refund rules
Credit limits
Payment terms
Payment methods
Cash
Card
Bank Transfer
Insurance
Online Payment
Invoice example
INV-2026-000001
18. Insurance Configuration
Insurance settings
Insurance companies
Insurance plans
Policy types
Coverage rules
Deductibles
Copay
Authorization requirements
Claim rules
Claim statuses

Example:

Insurance
 ↓
Eligibility Check
 ↓
Pre-Authorization
 ↓
Service
 ↓
Claim
 ↓
Adjudication
 ↓
Payment
19. Notification Configuration

Centralized notification management.

Channels
Email
SMS
Push notification
WhatsApp
In-app notification
Notification events
Appointment booked
Appointment reminder
Appointment cancelled
Lab result available
Prescription created
Medication reminder
Payment received
Invoice generated
Emergency alert
Critical lab result

Admin should configure:

Template
Language
Channel
Trigger
Recipient
Priority
Retry policy
20. Communication Configuration

This is especially important for your universal healthcare platform.

Configure
Email server
SMS gateway
Push notification provider
WhatsApp provider
SMTP
API credentials
Webhooks

Example:

Hospital HMS
     ↓
Integration Service
     ↓
Message Queue
     ↓
External System
21. HL7 / FHIR Configuration

Because your project is intended to integrate with different healthcare systems, put a dedicated Healthcare Interoperability Configuration section here.

HL7

Configure:

HL7 version
Message types
Sending application
Receiving application
Sending facility
Receiving facility
Message control ID
ACK behavior
Retry rules
MLLP endpoint

Examples:

ADT
ORM
ORU
SIU
FHIR

Configure:

FHIR version
FHIR server
Base URL
Authentication
OAuth2
Client ID
Scopes
Supported resources

Resources:

Patient
Practitioner
Organization
Encounter
Observation
DiagnosticReport
Medication
MedicationRequest
AllergyIntolerance
Condition
Procedure
ImagingStudy
DocumentReference
22. Mirth / Interface Engine Configuration

For your architecture, don't make Mirth configuration mixed into normal application settings.

Create:

Configuration
 └── Interoperability
      ├── HL7
      ├── FHIR
      ├── DICOM
      ├── Mirth
      ├── API
      └── Webhooks

Configure:

Mirth channels
Source systems
Destination systems
Message transformations
Routing
ACK handling
Retry
Error handling
Dead-letter messages
Monitoring

Example:

Hospital A HMS
      ↓
    HL7 ADT
      ↓
    Mirth
      ↓
Transformation
      ↓
FHIR Patient
      ↓
Universal Health Exchange
23. API Configuration
Configure
API base URLs
External APIs
API keys
OAuth clients
Rate limits
Timeout
Retry
Circuit breaker
Webhook endpoints
Environments
Development
Testing
Staging
Production

Never put production credentials directly into frontend configuration.

24. Security Configuration

This should be a major section.

Authentication
JWT expiration
Refresh token expiration
MFA
Login policy
Password policy
Session management
Authorization
Roles
Permissions
Resource permissions
Department permissions
Branch permissions
Security policies
IP restrictions
Device restrictions
Concurrent sessions
Account lockout
Suspicious login detection
API access policies
25. Audit Configuration

The administrator should control what gets audited.

Audit events
LOGIN
LOGOUT
PATIENT_VIEW
PATIENT_CREATE
PATIENT_UPDATE
PATIENT_DELETE
LAB_RESULT_VIEW
LAB_RESULT_UPDATE
PRESCRIPTION_CREATE
PRESCRIPTION_UPDATE
RECORD_EXPORT
RECORD_SHARE
CONFIGURATION_CHANGE
Audit settings
Audit enabled/disabled
Retention period
Log level
Export policy
Immutable logs
Alert rules

For healthcare, do not allow normal admins to silently delete audit history.

26. Data Retention Configuration

Configure:

Patient record retention
Audit retention
Document retention
Lab result retention
Imaging retention
Billing retention
Backup retention

Example:

Audit Logs → 7 years
Medical Records → configurable by policy
Temporary Files → 30 days

Actual retention should be configurable according to the applicable jurisdiction and hospital policy rather than hard-coded.

27. Backup Configuration
Configure
Backup frequency
Full backup
Incremental backup
Database backup
File backup
Encryption
Backup location
Retention
Backup verification

Example:

Database
   ↓
Encrypted Backup
   ↓
Primary Storage
   ↓
Secondary Storage
28. Document Configuration
Configure
Document types
Templates
File size limits
Allowed file types
Document numbering
Digital signatures
Document retention

Examples:

Lab Report
Discharge Summary
Prescription
Medical Certificate
Referral Letter
Consent Form
Radiology Report
29. Consent Configuration

This is very important for your universal healthcare platform.

Configure:

Consent types
Consent templates
Consent expiration
Revocation rules
Sharing permissions
Emergency access
Data-sharing scope
Third-party access

Example:

Patient
   ↓
Grant Consent
   ↓
Hospital B
   ↓
Can View:
   ✓ Lab Reports
   ✓ Imaging
   ✓ Medications


Cannot View:
   ✗ Restricted Records
30. Master Data Configuration

This is one of the most important parts.

Create centralized master-data management for:

Countries
States/regions
Cities
Languages
Currencies
Departments
Specialties
Diagnoses
Procedures
Medications
Units
Specimens
Lab tests
Imaging procedures
Insurance companies
Payment methods
Appointment types

For international healthcare, also consider standardized terminology such as:

ICD
SNOMED CT
LOINC
RxNorm
DICOM
UCUM

These should be treated as terminology/reference data, not just arbitrary dropdown values.

31. Workflow Configuration

Don't hard-code every hospital workflow.

Allow admins to configure workflows.

Example:

Patient Registration
        ↓
Appointment
        ↓
Check-In
        ↓
Consultation
        ↓
Investigation
        ↓
Diagnosis
        ↓
Prescription
        ↓
Billing
        ↓
Discharge

Admin could configure:

Steps
Required fields
Approvals
Conditions
Notifications
Escalation
Responsible role
32. Approval Configuration

Configure approval workflows.

Examples:

Medication Approval
Refund Approval
Purchase Approval
Insurance Approval
Record Release Approval
Data Sharing Approval
Configuration Approval

Example:

Refund > 5,000 SAR
        ↓
Finance Officer
        ↓
Finance Manager
        ↓
Approved
33. Queue Configuration

For hospital operations:

Registration queue
Doctor queue
Pharmacy queue
Laboratory queue
Radiology queue
Emergency queue
Billing queue

Configure:

Queue name
Priority
Maximum wait time
Escalation
Counter
Department
Staff assignment
34. Room & Bed Configuration

Configure:

Buildings
Floors
Rooms
Beds
Bed types
ICU beds
Isolation beds
Emergency beds
Operating rooms

Bed statuses:

AVAILABLE
OCCUPIED
RESERVED
CLEANING
MAINTENANCE
BLOCKED
35. System Code / Numbering Configuration

Centralized numbering is useful.

Examples:

Patient ID
MRN
Appointment ID
Prescription ID
Lab Order ID
Lab Result ID
Invoice ID
Claim ID
Surgery ID
Admission ID
Discharge ID

Example:

PAT-{YYYY}-{######}
LAB-{YYYY}-{######}
INV-{YYYY}-{######}
RX-{YYYY}-{######}
36. Feature Flags

Very useful for production systems.

Example:

Online Appointment        ON
Patient Self Registration ON
WhatsApp Notification     OFF
FHIR Sharing              ON
AI Assistant              OFF
Telemedicine              ON

This lets you enable/disable functionality without redeploying the entire application.

37. Environment Configuration

Separate:

Development
Testing
Staging
Production

But never allow ordinary admins to edit secrets from the frontend.

Sensitive values should be managed through:

Azure Key Vault
Kubernetes Secrets
AWS Secrets Manager
HashiCorp Vault
environment-specific secret management

The Configuration UI should expose safe metadata, not raw passwords/API secrets.

38. System Maintenance

Admin can configure:

Maintenance mode
Scheduled maintenance
System announcements
Read-only mode
Service status
Database maintenance windows

Example:

Maintenance:
Sunday
02:00 – 03:00
39. Configuration History

This is extremely important.

Every configuration change should record:

Who
What
When
Old Value
New Value
Reason
IP
Device
Approval

Example:

Changed By:
Admin User


Configuration:
Appointment Duration


Old:
30 minutes


New:
20 minutes


Reason:
Cardiology scheduling policy


Date:
2026-08-17
40. Configuration Versioning

Don't simply overwrite configuration.

Use versions:

Configuration v1
Configuration v2
Configuration v3

Admin should be able to:

View version
Compare versions
Restore version
Publish version
Roll back
41. Import / Export

Admin should be able to export configuration.

Example:

Hospital A
   ↓
Export Configuration
   ↓
JSON
   ↓
Hospital B
   ↓
Import

But sensitive secrets must never be exported in plain text.

42. Configuration Approval

For critical settings:

Draft
 ↓
Submitted
 ↓
Reviewed
 ↓
Approved
 ↓
Published

For example:

Changing:

Authentication policy
Patient ID format
Billing rules
Consent rules
HL7 mappings
FHIR configuration

should potentially require approval.

43. Configuration UI Structure

I would structure your frontend like this:

Admin Dashboard
│
└── Configuration
    │
    ├── Overview
    │
    ├── Organization
    │   ├── Hospital
    │   ├── Branches
    │   ├── Buildings
    │   ├── Floors
    │   └── Departments
    │
    ├── General
    │   ├── System Settings
    │   ├── Localization
    │   └── Language
    │
    ├── Users & Access
    │   ├── Roles
    │   ├── Permissions
    │   └── Security
    │
    ├── Clinical
    │   ├── Patients
    │   ├── Doctors
    │   ├── Nursing
    │   ├── Laboratory
    │   ├── Radiology
    │   ├── Pharmacy
    │   ├── Emergency
    │   └── Surgery
    │
    ├── Operations
    │   ├── Appointments
    │   ├── Queues
    │   ├── Rooms
    │   └── Beds
    │
    ├── Finance
    │   ├── Billing
    │   ├── Insurance
    │   └── Payments
    │
    ├── Integration
    │   ├── HL7
    │   ├── FHIR
    │   ├── Mirth
    │   ├── DICOM
    │   ├── APIs
    │   └── Webhooks
    │
    ├── Notifications
    │   ├── Email
    │   ├── SMS
    │   ├── Push
    │   └── Templates
    │
    ├── Master Data
    │   ├── Terminology
    │   ├── Countries
    │   ├── Currencies
    │   ├── Specialties
    │   └── Units
    │
    ├── Workflow
    │   ├── Workflows
    │   ├── Approvals
    │   └── Escalations
    │
    ├── Consent
    │
    ├── Audit
    │
    ├── Backup & Retention
    │
    ├── Feature Flags
    │
    ├── Maintenance
    │
    └── Configuration History
44. Most important backend design

Since you're building this as a serious healthcare system, don't create one giant table like:

configuration
----------------
key
value

for everything.

Instead, use a combination of:

Structured configuration

For strongly typed settings:

HospitalConfiguration
SecurityConfiguration
AppointmentConfiguration
PharmacyConfiguration
LaboratoryConfiguration
BillingConfiguration
Dynamic configuration

For flexible settings:

system_settings

with something like:

id
tenant_id
scope
category
key
value
value_type
description
is_active
version
created_by
updated_by
created_at
updated_at

For example:

tenant_id = HOSPITAL001
category = APPOINTMENT
key = DEFAULT_DURATION
value = 30
value_type = INTEGER
45. Multi-tenant configuration

Because your healthcare platform is intended to support multiple hospitals, configuration should have scopes.

GLOBAL
   ↓
COUNTRY
   ↓
ORGANIZATION
   ↓
HOSPITAL
   ↓
BRANCH
   ↓
DEPARTMENT

Example:

Global:
Currency = SAR


Hospital:
Appointment Duration = 30


Cardiology:
Appointment Duration = 45

The system resolves the most specific configuration:

Department
   ↓
Branch
   ↓
Hospital
   ↓
Organization
   ↓
Global

This will make your system much more powerful.

46. Configuration API

Your backend can expose APIs such as:

GET    /api/v1/configurations
GET    /api/v1/configurations/{id}


POST   /api/v1/configurations
PUT    /api/v1/configurations/{id}
PATCH  /api/v1/configurations/{id}


DELETE /api/v1/configurations/{id}


GET    /api/v1/configurations/history
GET    /api/v1/configurations/versions


POST   /api/v1/configurations/{id}/publish
POST   /api/v1/configurations/{id}/rollback


POST   /api/v1/configurations/import
GET    /api/v1/configurations/export

For critical configuration, use:

POST /configurations/{id}/submit
POST /configurations/{id}/approve
POST /configurations/{id}/reject
POST /configurations/{id}/publish
47. The most important rule

Bro, don't make Configuration just a collection of CRUD screens.

Think of it as:

                 CONFIGURATION
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    Hospital       Clinical       Operations
        │              │              │
        ↓              ↓              ↓
     Security       Pharmacy       Appointment
     Users           Lab            Queue
     Roles           Radiology      Billing
     Language        Emergency      Insurance
        │
        └──────────────┬──────────────┘
                       ↓
                INTEGRATIONS
                       │
              ┌────────┼────────┐
              ↓        ↓        ↓
             HL7      FHIR    DICOM
              ↓        ↓        ↓
            Mirth    APIs     PACS

And every important configuration should have:

Scope + Version + Validation + Approval + Audit + Rollback.
