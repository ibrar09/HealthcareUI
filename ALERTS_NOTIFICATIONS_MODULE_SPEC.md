# Alerts & Notifications Module Spec

Saved verbatim from the user's paste (2026-08-17), same treatment as the
other `*_MODULE_SPEC.md` files — a persistent reference doc.

**Scope note:** the spec came with no attached scope instruction either
way (same ambiguity as Reports/Audit/Configuration before it). Asked the
same two clarifying questions via `AskUserQuestion` — the user chose
**full build, all 39 sections**, with full verification rigor. See
`HOSPITAL_ADMIN_MODULE_MAP.md` build-order #35 for exactly what was built.
Replaces the old `AlertsCenter.tsx` placeholder. Tab structure follows the
spec's own §38 "most important frontend pages" list exactly (Dashboard,
Alert Center, Critical Alerts, My Alerts, Notification Center, Notification
History, Templates, Alert Rules, Notification Rules, Escalation Policies,
Channels, User Preferences, Delivery Logs, Failed Notifications, Reports).
Real cross-module integration, not a duplicate alerting system: two
curated alerts (Critical Lab Result, Critical Imaging Finding) route their
acknowledge action through to Laboratory's and Radiology's own real
critical-result acknowledgment functions; the Dashboard's "Live System
Signals" pulls real current counts straight from Inventory/Laboratory/
Radiology/Security's own alert functions; the Channels tab reads
Configuration's own `getCommunicationProviders()` directly rather than
duplicating a second provider registry. Per the spec's own explicit
framing (§31-35: Kafka event queue, dedicated notification-service
microservice, DB schema) — those are backend/architecture concepts "for
later," not built as frontend screens.

---

Alerts & Notifications Module
1. Alerts & Notifications Dashboard

When admin opens the module, show an operational overview.

KPI cards
Total Alerts Today
Critical Alerts
High-Priority Alerts
Unresolved Alerts
Acknowledged Alerts
Escalated Alerts
Failed Notifications
Notifications Sent
Delivery Rate
Average Response Time
Alert status
NEW
ACKNOWLEDGED
IN_PROGRESS
RESOLVED
ESCALATED
DISMISSED
EXPIRED
FAILED
2. Alert Center

This is the main screen where staff/admin can see alerts.

Table
Alert	Patient	Department	Severity	Source	Status	Created	Assigned To
Critical Lab Result	P-1023	Laboratory	Critical	Lab	New	10:32	Doctor
Low Stock	—	Pharmacy	High	Inventory	New	10:28	Pharmacist
Bed Capacity	—	Emergency	High	Bed Mgmt	Acknowledged	10:20	Nurse
Payment Failed	P-8832	Billing	Medium	Billing	Resolved	10:10	Finance
Filters
Severity
Department
Alert type
Status
Patient
Source
Assigned user
Date/time
Location
Alert channel
3. Severity Levels

Don't treat every notification equally.

Use:

Critical

Requires immediate action.

Examples:

Critical lab result
Cardiac monitor alert
Emergency escalation
Patient deterioration
Medication safety alert
System security incident
High

Requires quick attention.

Examples:

Low ICU capacity
Critical medication stock
Doctor emergency request
Failed blood sample
Important system integration failure
Medium

Requires attention but isn't immediately dangerous.

Examples:

Appointment cancellation
Pending approval
Inventory reorder
Insurance authorization pending
Low

Informational.

Examples:

Daily reports
Routine reminders
System announcements
4. Clinical Alerts

This is one of the most important categories.

Patient-related alerts
Critical vital signs
Abnormal lab result
Critical lab result
Drug interaction
Drug allergy
Duplicate medication
Abnormal imaging finding
Patient deterioration
Fall risk
Infection risk
Isolation requirement
Missed medication
Missed clinical assessment

Example:

CRITICAL ALERT


Patient: P-100245
Alert: Critical Potassium Level
Result: 2.4 mmol/L


Department: Laboratory
Priority: Critical


Assigned To:
Dr. Ahmed


Status:
NEW
5. Emergency Alerts

For the Emergency Department:

Code Blue
Code Red
Mass casualty
Ambulance arrival
Critical patient arrival
Trauma alert
Bed shortage
ICU shortage
Emergency department overcrowding
Waiting time exceeded

Example:

🚨 CRITICAL


TRAUMA ALERT


Incoming patient:
Unknown Male


ETA:
6 minutes


Required:
Trauma Team
Emergency Physician
Anesthesia
Blood Bank
6. Laboratory Alerts
Alerts
Critical result
Abnormal result
Specimen rejected
Specimen missing
Delayed result
Analyzer failure
QC failure
Critical result not acknowledged
Lab integration failure
Example workflow
Lab Result
   ↓
Critical Value Detected
   ↓
Create Alert
   ↓
Notify Doctor
   ↓
Doctor Acknowledges
   ↓
Record Acknowledgement

If not acknowledged:

5 min
 ↓
Nurse notified


10 min
 ↓
Doctor notified again


15 min
 ↓
Department supervisor


20 min
 ↓
Escalation
7. Pharmacy Alerts
Medication alerts
Drug interaction
Allergy conflict
Duplicate medication
Wrong dosage
High-risk medication
Controlled medication event
Prescription clarification
Medication unavailable
Medication expired
Medication recall
Stock below minimum
Stockout
8. Inventory Alerts
Stock alerts
Low stock
Critical stock
Out of stock
Expiring soon
Expired item
Batch recall
Overstock
Warehouse capacity
Temperature violation
Cold-chain failure

Example:

HIGH PRIORITY


Item:
Insulin XYZ


Current Stock:
12


Minimum Stock:
50


Location:
Pharmacy Store A


Action:
Reorder Required
9. Appointment Alerts
Appointment notifications
Appointment booked
Appointment confirmed
Appointment reminder
Appointment rescheduled
Appointment cancelled
Doctor running late
Patient no-show
Doctor no-show
Waiting time exceeded
Appointment slot available
Reminder schedule

Example:

Appointment
   ↓
24 hours before → Reminder
   ↓
2 hours before → Reminder
   ↓
15 minutes before → Reminder

These timings should be configurable.

10. Admission / Discharge Alerts
Admission
Admission created
Bed assigned
Bed unavailable
Admission pending
Insurance authorization pending
Discharge
Discharge ready
Discharge summary pending
Medication reconciliation pending
Follow-up appointment missing
Billing pending
Insurance claim pending
11. Nursing Alerts

Examples:

Vital signs overdue
Medication administration overdue
Nursing assessment overdue
Patient fall
Patient call request
Bedside task overdue
Patient transfer request
Nurse handover pending
12. Surgery / OT Alerts
Alerts
Surgery scheduled
Surgery delayed
Surgery cancelled
OR unavailable
Equipment unavailable
Consent missing
Pre-op checklist incomplete
Blood requirement pending
Anesthesia clearance pending
Surgeon delayed
Recovery bed unavailable

Example:

HIGH


Surgery:
Appendectomy


OR:
Operating Room 03


Status:
Pre-op checklist incomplete


Missing:
Patient Consent
13. Radiology Alerts
Imaging scheduled
Imaging delayed
Machine unavailable
Critical finding
Radiologist report pending
Report verification pending
PACS connection failure
DICOM transmission failure
14. Billing Alerts
Financial alerts
Payment failed
Invoice overdue
Refund requested
Refund pending approval
Insurance authorization pending
Claim rejected
Claim partially approved
Claim denied
Outstanding balance
Credit limit exceeded
15. Insurance Alerts
Eligibility failure
Authorization required
Authorization expired
Authorization rejected
Claim rejected
Claim pending
Claim denied
Coverage exceeded
16. Patient Alerts

Patient-facing notifications can include:

Appointment reminder
Lab report available
Prescription available
Medication reminder
Payment confirmation
Invoice generated
Appointment cancelled
Doctor message
Follow-up reminder
Vaccination reminder
Health reminder
Referral notification
17. System Alerts

These are for IT/admin users.

Infrastructure
Server unavailable
Database connection failure
High CPU
High memory
Disk space low
Backup failed
Backup completed
Service unavailable
API failure
Kafka failure
Redis failure
Integration
HL7 message failed
FHIR request failed
Mirth channel stopped
DICOM transfer failed
PACS unavailable
External API unavailable
18. Security Alerts

Very important for a healthcare system.

Security events
Multiple failed logins
Account locked
Suspicious login
Login from new device
Login from unusual location
Privilege escalation
Unauthorized patient-record access
Bulk record access
Bulk export
Sensitive record download
API abuse
Token reuse
Configuration change
Permission change

Example:

CRITICAL SECURITY ALERT


User:
user123


Event:
Bulk Patient Record Export


Records:
2,430


Time:
14:32


IP:
Internal Network


Action:
Security Investigation Required
19. Notification Channels

Your system should support multiple channels.

In-app
🔔 Notification Center
Email

For:

Reports
Appointment confirmations
Administrative notifications
System alerts
SMS

For:

Appointment reminders
Critical patient communication
OTP
Important notifications
Push

For:

Mobile application
Doctor alerts
Nurse alerts
Patient notifications
WhatsApp

Potentially for:

Appointment reminders
Patient communication
Notifications

Subject to the hospital's policies and applicable regulations.

20. Notification Templates

Create a template management section.

Example:

Notification Template


Name:
Appointment Reminder


Event:
APPOINTMENT_REMINDER


Channel:
SMS


Language:
English


Message:
Dear {{patientName}},
your appointment with Dr. {{doctorName}}
is scheduled for {{appointmentDate}} at {{appointmentTime}}.

Support:

{{patientName}}
{{doctorName}}
{{appointmentDate}}
{{appointmentTime}}
{{hospitalName}}
{{department}}
{{appointmentId}}
21. Multi-language Templates

Since your system is international:

Template
 ├── English
 ├── Arabic
 ├── Urdu
 └── French

The system selects the patient's preferred language.

22. Notification Rules

This is the core engine.

Example:

EVENT:
Critical Lab Result


IF:
Severity = Critical


THEN:
Notify Ordering Doctor


CHANNEL:
Push + SMS


IF NOT ACKNOWLEDGED:
5 minutes


THEN:
Notify Department Supervisor
23. Alert Rules Builder

Admin should be able to create rules without coding.

Example UI:

WHEN


Lab Result Created


AND


Result Severity = Critical


THEN


Create Alert


Priority = Critical


Notify:
Ordering Doctor


Via:
Push + SMS


Escalate After:
10 minutes

This becomes a configurable rules engine.

24. Escalation Management

This is essential for clinical alerts.

Example:

Level 1
Doctor
   ↓
5 minutes
   ↓
Level 2
Senior Doctor
   ↓
5 minutes
   ↓
Level 3
Department Head
   ↓
5 minutes
   ↓
Level 4
Hospital Supervisor

Each alert can have its own escalation policy.

25. Acknowledgement

Critical alerts should require acknowledgement.

Buttons:

Acknowledge
Take Action
Assign
Escalate
Resolve
Dismiss

For example:

Critical Lab Result


[ Acknowledge ]


Acknowledgement:
Dr. Ahmed


Time:
14:42


Action:
Patient contacted
26. Alert Assignment

Alerts can be assigned to:

Doctor
Nurse
Pharmacist
Lab technician
Radiologist
Finance officer
IT administrator
Department
Team
27. Notification Preferences

Every user can configure:

Critical Alerts
✓ Push
✓ SMS
✓ Email


Medium Alerts
✓ Push
✗ SMS
✓ Email


Low Alerts
✓ In-app
✗ SMS
✗ Email

But users must not be allowed to disable mandatory safety-critical notifications if hospital policy requires them.

28. Quiet Hours

For non-critical notifications:

Quiet Hours


22:00 → 07:00

But:

Critical
    ↓
Ignore Quiet Hours
    ↓
Send Immediately
29. Notification Delivery Tracking

You need to know whether the notification actually reached the user.

Track:

CREATED
QUEUED
SENT
DELIVERED
READ
ACKNOWLEDGED
FAILED
RETRYING

Example:

Notification ID: NTF-10023


Push:
✓ Sent
✓ Delivered
✓ Read


SMS:
✓ Sent
✓ Delivered


Email:
✓ Sent
✓ Delivered
30. Retry Mechanism

If SMS/email/push fails:

Send
 ↓
Failed
 ↓
Retry 1
 ↓
Failed
 ↓
Retry 2
 ↓
Failed
 ↓
Escalate / Alternate Channel

Example:

Push Failed
   ↓
SMS
   ↓
Email
31. Notification Queue

Don't send everything directly from the main application request.

Use asynchronous processing.

Hospital Service
      ↓
Notification Event
      ↓
Kafka
      ↓
Notification Service
      ↓
Notification Queue
      ↓
 ┌────┼────┐
 ↓    ↓    ↓
Push SMS Email

This fits very well with the microservices + Kafka architecture you're already building.

32. Notification Service

I recommend making this a dedicated microservice:

notification-service

Responsibilities:

Notification creation
Template management
Channel selection
Queue management
Delivery
Retry
Escalation
Preferences
Delivery tracking
Notification history
33. Suggested Backend Structure
notification-service
│
├── controller
│   ├── NotificationController
│   ├── TemplateController
│   ├── PreferenceController
│   ├── AlertController
│   └── RuleController
│
├── service
│   ├── NotificationService
│   ├── AlertService
│   ├── TemplateService
│   ├── DeliveryService
│   ├── EscalationService
│   └── PreferenceService
│
├── channel
│   ├── EmailChannel
│   ├── SmsChannel
│   ├── PushChannel
│   └── WhatsAppChannel
│
├── event
│   ├── AppointmentEvent
│   ├── LabResultEvent
│   ├── PharmacyEvent
│   └── EmergencyEvent
│
├── repository
│
├── entity
│
├── dto
│
├── kafka
│
└── config
34. Database Design

Important tables/entities:

alerts
alert_rules
alert_escalations
alert_acknowledgements


notifications
notification_templates
notification_preferences


notification_deliveries
notification_channels


notification_events
notification_failures


notification_audit_logs
Alert
id
tenant_id
alert_type
severity
source
patient_id
department_id
status
title
message
assigned_to
created_at
acknowledged_at
resolved_at
Notification
id
tenant_id
recipient_id
alert_id
template_id
channel
priority
status
created_at
sent_at
delivered_at
read_at
35. Event-driven architecture

For your system, this is the important part.

Example:

Laboratory Service
        │
        │ CriticalResultCreated
        ↓
      Kafka
        ↓
Notification Service
        │
        ├── Create Alert
        ├── Find Doctor
        ├── Load Template
        ├── Push Notification
        ├── Send SMS
        └── Start Escalation Timer

Another example:

Pharmacy Service
      ↓
StockBelowMinimum
      ↓
Kafka
      ↓
Notification Service
      ↓
Pharmacist
      ↓
"In-stock level is below minimum"
36. Admin Configuration

Inside your Configuration → Notifications, admin should configure:

Notification Providers
Notification Templates
Notification Rules
Alert Rules
Escalation Policies
Notification Channels
User Preferences
Quiet Hours
Retry Policies
SMS Settings
Email Settings
Push Settings
Webhook Settings
37. Notification Reports

Your Reports module should be able to show:

Notifications sent
Notifications delivered
Failed notifications
SMS usage
Email usage
Push usage
Critical alerts
Average acknowledgement time
Escalation rate
Unresolved alerts
Alerts by department
Alerts by severity
Alerts by source

Example:

Critical Alerts
       1,240


Acknowledged
       1,180


Escalated
          42


Unresolved
          18
38. Most important frontend pages

I would create:

Alerts & Notifications
│
├── Overview
├── Alert Center
├── Critical Alerts
├── My Alerts
├── Notification Center
├── Notification History
├── Templates
├── Alert Rules
├── Notification Rules
├── Escalation Policies
├── Channels
├── User Preferences
├── Delivery Logs
├── Failed Notifications
└── Reports
39. The complete flow

Your final architecture should look like this:

             HOSPITAL SYSTEM
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     Lab       Pharmacy    Emergency
        │          │          │
        └──────────┼──────────┘
                   ↓
              DOMAIN EVENT
                   ↓
                 Kafka
                   ↓
          Notification Service
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
      Rules     Templates   Preferences
        │          │          │
        └──────────┼──────────┘
                   ↓
             Create Alert
                   ↓
             Determine Severity
                   ↓
          Determine Recipient
                   ↓
          Select Notification
                   ↓
       ┌───────────┼───────────┐
       ↓           ↓           ↓
     Push         SMS        Email
       │           │           │
       └───────────┼───────────┘
                   ↓
              Delivery Log
                   ↓
             Acknowledgement
                   ↓
          ┌────────┴────────┐
          ↓                 ↓
       Resolved          Escalated
                              ↓
                         Next Level
The most important distinction

Bro, keep these two concepts separate:

Notification = "Something happened and you should know."

Alert = "Something important happened and someone may need to take action."

For example:

Notification: Your appointment is tomorrow at 10:00 AM.

Alert: Patient's potassium level is critically low and requires immediate clinical attention.
