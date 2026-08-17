# Admin & Reception Dashboard Spec

Saved verbatim from the user's paste (2026-08-17) — a persistent reference
doc, same treatment as the other `*_SPEC.md` files.

**Scope note:** unlike the earlier module-spec pastes this session, this one
came with explicit framing attached ("we have to add some things in the
admin dashboard and also the reception dashboard so also add this like type
of refactoring but think and do the best") — a direct instruction to refactor
the two existing dashboard pages using this document as design guidance, not
a fresh "how much should I build" ambiguity to ask about. Executed as a
genuine data-layer refactor: `api/dashboard.ts` was rewritten from
self-contained fabricated placeholder arrays into a real cross-module
aggregation layer (KPIs/Live Status/Staff Status/Patient Queue/Doctor Status/
Attention items/Front Desk Alerts all computed from the real Beds/
Appointments/Emergency/Billing/Laboratory/Radiology/OT/Pharmacy/Inventory/
Configuration/Alerts/Audit modules built earlier this session), and both
`HospitalAdminDashboard.tsx`/`ReceptionDashboard.tsx` were rebuilt against
it. See `HOSPITAL_ADMIN_MODULE_MAP.md` for exactly what shipped vs. what was
deliberately left out (a genuine multi-hospital switcher beyond the 3 real
seeded facilities, a real multi-day activity trend — every appointment/
admission record in this mock dataset is dated "today," so a 7-day line
chart would have to be fabricated).

---

1. ADMIN DASHBOARD — WORLD-CLASS HOSPITAL COMMAND CENTER

Your sidebar already has:

Dashboard
 ├── Admin Dashboard
 └── Reception Dashboard


Facilities
Staff
Patients
Beds
Appointments
Emergency
Laboratory
Radiology
Pharmacy
Operation Theatre
Billing
Inventory
Reports
...

That's good.

When the user selects:

Dashboard → Admin Dashboard

I would make the page look roughly like this:

┌─────────────────────────────────────────────────────────────────────────────┐
│ Good Morning, Admin                           🔔  ⚙️   🔍   Admin Profile │
│ Monday, 17 August 2026                                                     │
│ Hospital Overview • All Branches                     [Today ▼]             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  👥 PATIENTS       🛏 BEDS          📅 APPOINTMENTS      🚨 EMERGENCY       │
│  1,248              428 / 520        186                 23                │
│  +8.4% ↑            82.3% occupied   14 waiting          4 critical        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATIENT FLOW / HOSPITAL ACTIVITY              │  LIVE HOSPITAL STATUS      │
│                                               │                             │
│  Admissions       ████████████  124           │  🟢 Emergency   Normal     │
│  Discharges       █████████     98            │  🟠 Laboratory  Busy       │
│  Appointments     █████████████ 186           │  🟢 Pharmacy    Normal     │
│  Emergency        █████         42            │  🟠 Radiology   Busy       │
│                                               │  🟢 OT          Normal     │
│  [Activity Chart]                             │  🟢 Billing     Normal     │
│                                               │                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🚨 CRITICAL ALERTS                            │  🛏 BED OCCUPANCY           │
│                                                │                             │
│  Critical Lab Result     2 min ago             │ ICU       92% ██████████    │
│  ICU Bed Shortage        5 min ago             │ Emergency 87% █████████     │
│  Mirth Channel Failure   8 min ago             │ Ward      76% ████████      │
│  Low Pharmacy Stock      12 min ago            │ Private   68% ███████       │
│                                                │                             │
│  [View All Alerts]                             │ [View Beds]                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TODAY'S OPERATIONS                         │  FINANCIAL OVERVIEW            │
│                                             │                               │
│  Admissions              124                │ Revenue          SAR 428K     │
│  Discharges               98                │ Paid             SAR 382K     │
│  Pending Discharge        17                │ Outstanding       SAR 46K     │
│  Surgeries                 12                │ Insurance Claims    84       │
│  Lab Orders               312                │                               │
│  Radiology Orders         148                │ [Revenue Chart]              │
│                                             │                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STAFF STATUS                                │  APPOINTMENT OVERVIEW         │
│                                             │                               │
│  Doctors       42 / 48 Available             │ Today              186        │
│  Nurses        126 / 140 Available           │ Completed           82        │
│  Lab Staff      24 / 28 Available            │ Waiting             31        │
│  Pharmacy       18 / 20 Available            │ Cancelled           11        │
│                                             │ No-show              7        │
│                                             │                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ RECENT ACTIVITY                                                             │
│                                                                             │
│ Admin changed appointment configuration                         2 min ago  │
│ Critical lab result acknowledged                                 4 min ago  │
│ New staff member created                                        12 min ago  │
│ Pharmacy inventory updated                                      15 min ago  │
│ Configuration published                                          21 min ago  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

That is the direction I recommend.

2. ADMIN HEADER

Don't waste the header.

Left
Good Morning, Admin
Hospital Command Center

Below it:

Monday, 17 August 2026
Right
🔍 Search
🔔 Notifications
⚙ Settings
Admin Profile

But most importantly, add:

Hospital / Branch selector
[ All Hospitals ▼ ]

or:

[ Riyadh Main Hospital ▼ ]

This is extremely important if your system becomes multi-hospital/multi-branch.

Admin should be able to switch:

All Hospitals
Riyadh Main Hospital
Riyadh Branch 2
Jeddah Hospital
...
3. GLOBAL FILTER

At the top:

[ All Facilities ▼ ] [ All Departments ▼ ] [ Today ▼ ]

Date options:

Today
Yesterday
Last 7 Days
Last 30 Days
This Month
Custom Range

This makes every dashboard widget useful.

4. ADMIN KPI CARDS

I would not put 15–20 cards at the top.

Keep the most important 6–8.

Card 1 — Total Patients
TOTAL PATIENTS


1,248


↑ 8.4%


vs yesterday

Click → Patients.

Card 2 — Bed Occupancy
BED OCCUPANCY


82.3%


428 / 520 beds


↑ 2.1%

Use a small circular/progress indicator.

Click → Beds.

Card 3 — Appointments
APPOINTMENTS


186


142 completed
31 waiting

Click → Appointments.

Card 4 — Emergency
EMERGENCY


23


4 Critical
12 Waiting
7 In Treatment

This card should visually become more prominent if critical cases increase.

Card 5 — Admissions
ADMISSIONS


124


+12 today
Card 6 — Discharges
DISCHARGES


98


17 pending
Card 7 — Revenue
TODAY'S REVENUE


SAR 428K


↑ 6.8%
Card 8 — Critical Alerts
CRITICAL ALERTS


7


3 Unresolved
5. HOSPITAL ACTIVITY

This should be one of the largest widgets.

Patient flow chart

Show:

Admissions
Discharges
Appointments
Emergency visits
Outpatient visits

Over:

Today
7 Days
30 Days

Example:

        Patient Activity


300 ┤                 ╭──╮
250 ┤       ╭──╮     ╭╯  ╰╮
200 ┤   ╭──╯  ╰─────╯
150 ┤──╯
100 ┤
    └────────────────────────
     Mon Tue Wed Thu Fri Sat Sun

Admin can immediately understand hospital traffic.

6. LIVE HOSPITAL STATUS

This is something I strongly recommend.

A small widget:

LIVE HOSPITAL STATUS


🟢 Emergency       Normal
🟠 Laboratory      High Load
🟢 Radiology       Normal
🟢 Pharmacy        Normal
🟠 Operation       Busy
🟢 Billing         Normal
🔴 Mirth           Offline

This is much better than making the admin open every module.

The dashboard tells them:

Where is the problem?

7. CRITICAL ALERT CENTER

This should be highly visible.

CRITICAL ALERTS


🔴 Critical Lab Result
   Patient P-10239
   Laboratory
   2 minutes ago


🔴 ICU Bed Capacity
   92% occupied
   5 minutes ago


🟠 Pharmacy Stock
   Insulin stock below minimum
   12 minutes ago


🔴 Integration Failure
   HL7/Mirth channel stopped
   15 minutes ago

Buttons:

View Alert
Acknowledge
Assign

And:

View All Alerts →
8. BED OCCUPANCY

This is extremely important for hospital administration.

Show:

BED OCCUPANCY


ICU          92%  ████████████████
Emergency    87%  ██████████████
Medical      76%  ████████████
Surgical     81%  █████████████
Pediatrics   68%  ███████████
Private      62%  ██████████

Also show:

Total Beds      520
Occupied        428
Available        72
Reserved         12
Maintenance       8
9. TODAY'S OPERATIONS

This is the operational snapshot.

TODAY'S OPERATIONS


Admissions                  124
Discharges                   98
Pending Discharges           17
Emergency Visits             42
Surgeries                    12
Lab Orders                  312
Radiology Orders            148
Prescriptions               426

Each should be clickable.

10. APPOINTMENT OVERVIEW

Show:

TODAY'S APPOINTMENTS


Total              186
Completed           82
Waiting             31
In Consultation     24
Upcoming            42
Cancelled           11
No Show              7

Then a small chart.

11. STAFF STATUS

Admin needs to know whether the hospital has enough staff.

STAFF STATUS


Doctors
42 / 48 Available


Nurses
126 / 140 Available


Laboratory
24 / 28 Available


Pharmacy
18 / 20 Available


Reception
12 / 15 Available

Click → Staff.

12. FINANCIAL OVERVIEW

Admin should get a high-level financial snapshot.

FINANCIAL OVERVIEW


Today's Revenue
SAR 428,000


Paid
SAR 382,000


Outstanding
SAR 46,000


Insurance Claims
84


Pending Claims
17

Chart:

Revenue
│
│             ╭──╮
│      ╭──────╯  ╰──╮
│  ╭───╯
└────────────────────
 Mon Tue Wed Thu Fri

Don't overload this with accounting details. Those belong in Billing.

13. PHARMACY / INVENTORY ALERT

Admin needs only exceptions.

INVENTORY ALERTS


🔴 4 Critical Stock Items
🟠 12 Low Stock Items
🟠 8 Expiring Soon
🔴 2 Expired Items

Click:

View Inventory →
14. LABORATORY STATUS

Don't duplicate the entire laboratory dashboard.

Show only operational indicators:

LABORATORY


Orders Today       312
Completed          248
Processing          42
Pending             22
Critical Results     7
Rejected Samples     4
15. RADIOLOGY STATUS
RADIOLOGY


Orders Today       148
Completed          102
In Progress         28
Pending Report      18


Critical Findings   3
16. OPERATION THEATRE STATUS
OPERATION THEATRE


Today's Surgeries       12


Completed                4
In Progress              2
Scheduled                5
Delayed                  1
Cancelled                0


OR Availability


OR-01   🟢 Available
OR-02   🔴 In Surgery
OR-03   🟠 Cleaning
OR-04   🟢 Available
17. RECENT ACTIVITY

This is very important for admin.

RECENT ACTIVITY


● Admin updated Pharmacy configuration
  2 min ago


● Doctor acknowledged critical lab result
  4 min ago


● New staff account created
  8 min ago


● Inventory purchase approved
  12 min ago


● HL7 integration restored
  16 min ago


● Configuration published
  21 min ago

This connects beautifully with your Audit module.

18. QUICK ACTIONS

Don't make admins navigate through 5 pages for common operations.

Put:

QUICK ACTIONS


+ Register Patient
+ Add Staff
+ Create Appointment
+ Admit Patient
+ Add Bed
+ Create Purchase Order
+ View Critical Alerts
+ Generate Report

However, only show actions allowed by the admin's permissions.

19. ADMIN DASHBOARD — WHAT NOT TO DO

This is equally important.

Don't make:

❌ 25 KPI cards
❌ giant tables
❌ every database record
❌ full patient list
❌ full pharmacy inventory
❌ full laboratory orders
❌ full billing transactions
❌ every notification

The dashboard should answer 5 questions immediately:

1. How is the hospital doing?


2. Is there anything critical?


3. Where is the hospital overloaded?


4. What needs my attention?


5. What changed recently?
20. NOW THE RECEPTION DASHBOARD

This should be completely different.

Reception doesn't care about:

Hospital revenue
Mirth channels
Overall inventory
Staff utilization
ICU statistics
Audit logs

They care about:

Patients arriving → registration → appointment → queue → doctor → payment → next action.

So the Reception Dashboard should be a Patient Flow Command Center.

RECEPTION DASHBOARD

I'd design it like:

┌─────────────────────────────────────────────────────────────────────────────┐
│ Good Morning, Sarah                              🔔   🔍   Receptionist    │
│ Front Desk • Riyadh Main Hospital                       [Today ▼]          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WAITING           APPOINTMENTS        CHECK-IN          WALK-IN            │
│    18                  86                 42                11              │
│  6 urgent          12 upcoming        34 completed       3 urgent          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔎 SEARCH PATIENT                         │  QUICK ACTIONS                 │
│                                             │                               │
│  Search by:                                │  + Register Patient            │
│  [ Name / MRN / ID / Phone ] 🔍            │  + Book Appointment            │
│                                             │  + Walk-in Patient             │
│  Recent Patients                            │  + Check-in                    │
│                                             │  + Find Patient                │
│                                             │  + Print Queue Ticket          │
│                                             │  + Collect Payment              │
│                                             │                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TODAY'S APPOINTMENTS                                                       │
│                                                                             │
│  Time    Patient       Doctor       Dept       Status       Action          │
│  09:00   Ahmed Ali     Dr. Khan     Cardio     Waiting      Check-in        │
│  09:15   Sara Ahmed    Dr. Omar     ENT        Checked-in   View            │
│  09:30   John Smith    Dr. Ali      Ortho      In Queue     View            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATIENT QUEUE                               │  DOCTOR STATUS               │
│                                             │                               │
│  Cardiology       6 waiting                  │ Dr. Khan       🟢 Available   │
│  Orthopedics      4 waiting                  │ Dr. Omar       🔴 Busy        │
│  ENT              3 waiting                  │ Dr. Ali        🟡 Break       │
│  Pediatrics       5 waiting                  │ Dr. Sara       🟢 Available   │
│                                             │                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PATIENTS REQUIRING ATTENTION                  │  FRONT DESK ALERTS         │
│                                                 │                            │
│  Missing insurance information                   │ 🔴 Emergency arrival      │
│  Registration incomplete                         │ 🟠 Doctor delayed         │
│  Payment pending                                 │ 🟠 Queue waiting >30 min  │
│  Appointment authorization pending               │ 🔴 Bed unavailable        │
│                                                 │                            │
└─────────────────────────────────────────────────────────────────────────────┘
21. RECEPTION KPI CARDS

Only show things reception actually needs.

Waiting Patients
WAITING


18


6 urgent
Today's Appointments
APPOINTMENTS


86


12 upcoming
Checked In
CHECKED-IN


42


34 completed
Walk-ins
WALK-INS


11


3 urgent
22. THE MOST IMPORTANT RECEPTION FEATURE
Patient Search

This should be almost impossible to miss.

┌──────────────────────────────────────────────────────┐
│ 🔍 Search Patient                                    │
│                                                      │
│ Name, MRN, National ID, Passport or Phone           │
│                                                      │
│ [ Search........................................ ]   │
└──────────────────────────────────────────────────────┘

Results:

Ahmed Ali
MRN: MRN-2026-001245
DOB: 12 Jan 1985
Phone: XXXXXXXX
Last Visit: 12 Aug 2026


[Open Patient] [Book Appointment] [Check-In]

Reception will use this hundreds of times per day.

23. QUICK ACTIONS

Make these huge and easy to access:

+ Register Patient


📅 Book Appointment


🚶 Walk-in Patient


✓ Check-In


🔎 Find Patient


💳 Payment


🎫 Queue Ticket
24. TODAY'S APPOINTMENTS

Reception needs a live operational table.

Columns:

Time
Patient
MRN
Doctor
Department
Appointment Type
Status
Payment
Action

Statuses:

Upcoming
Arrived
Checked-In
Waiting
In Consultation
Completed
Cancelled
No Show

Actions:

Check-In
View
Reschedule
Cancel
Print
Collect Payment
25. PATIENT QUEUE

This is probably the second most important reception widget after search.

PATIENT QUEUE


Cardiology
06 waiting
Average wait: 18 min


Orthopedics
04 waiting
Average wait: 12 min


Pediatrics
05 waiting
Average wait: 24 min

Reception immediately knows:

Where is the queue problem?

26. DOCTOR STATUS

Very useful.

DOCTOR STATUS


Dr. Ahmed
🟢 Available


Dr. Khan
🔴 With Patient


Dr. Sara
🟡 Break


Dr. Omar
🟠 Running 25 min late

When doctor is late:

⚠ Dr. Omar is running 25 minutes late.


[Notify Patients]

That's a very good reception feature.

27. PATIENTS REQUIRING ATTENTION

This should be an exception list.

Examples:

⚠ Registration incomplete


⚠ Insurance information missing


⚠ Payment pending


⚠ Authorization required


⚠ Patient has arrived but appointment not confirmed


⚠ Duplicate patient possible
28. RECEPTION ALERTS

Reception doesn't need every hospital alert.

Only alerts relevant to front desk:

Emergency patient arriving


Doctor delayed


Department unavailable


Queue > 30 minutes


Appointment cancelled


Insurance system unavailable


Payment system unavailable


Registration system unavailable
29. WALK-IN FLOW

Reception should have a very fast workflow:

Walk-in
   ↓
Search Patient
   ↓
Existing Patient?
   ├── YES
   │    ↓
   │  Create Visit
   │
   └── NO
        ↓
     Register Patient
        ↓
     Select Department
        ↓
     Select Doctor
        ↓
     Queue
        ↓
     Payment
        ↓
     Ticket
30. NEW PATIENT FLOW

Keep registration simple.

New Patient


Step 1
Basic Information


Step 2
Identification


Step 3
Contact


Step 4
Insurance


Step 5
Emergency Contact


Step 6
Consent


[Register Patient]

Don't make reception fill 50 fields before they can create a patient.

Use:

Required fields + progressive completion.

31. CHECK-IN FLOW

This should take seconds.

Search Patient
     ↓
Appointment Found
     ↓
Verify Information
     ↓
Insurance Check
     ↓
Check-In
     ↓
Queue Ticket

Then:

Ticket #C-102
Cardiology
Dr. Ahmed
Position: 4
32. RECEPTION DASHBOARD SHOULD BE FAST

Reception staff work under pressure.

So:

Do
Large buttons
Keyboard shortcuts
Fast patient search
Minimal popups
Minimal page transitions
Auto-refresh queue
Clear statuses
Clear colors
Fast check-in
Fast appointment booking
Avoid
Large charts
Complex analytics
Too many cards
Long forms
unnecessary animations
unnecessary confirmation dialogs
33. ADMIN VS RECEPTION

This is the most important design distinction.

Feature	Admin	Reception
Hospital overview	⭐⭐⭐⭐⭐	⭐
Patient search	⭐⭐⭐	⭐⭐⭐⭐⭐
Appointments	⭐⭐⭐⭐	⭐⭐⭐⭐⭐
Emergency	⭐⭐⭐⭐⭐	⭐⭐⭐⭐
Beds	⭐⭐⭐⭐⭐	⭐⭐
Laboratory	⭐⭐⭐⭐	⭐⭐
Pharmacy	⭐⭐⭐⭐	⭐
Inventory	⭐⭐⭐⭐	❌
Billing	⭐⭐⭐⭐⭐	⭐⭐⭐
Staff	⭐⭐⭐⭐⭐	⭐⭐
Reports	⭐⭐⭐⭐⭐	⭐
Alerts	⭐⭐⭐⭐⭐	⭐⭐⭐
Patient Queue	⭐⭐⭐	⭐⭐⭐⭐⭐
Doctor Status	⭐⭐⭐	⭐⭐⭐⭐⭐
Patient Registration	⭐⭐⭐	⭐⭐⭐⭐⭐
Configuration	⭐⭐⭐⭐⭐	❌
Audit	⭐⭐⭐⭐⭐	❌
HL7/FHIR	⭐⭐⭐⭐⭐	❌
34. YOUR SIDEBAR SHOULD ALSO CHANGE BY ROLE

This is important.

For Admin:

Dashboard
 ├── Admin Dashboard
 └── Reception Dashboard


Facilities
Staff
Patients
Beds
Appointments
Emergency
Laboratory
Radiology
Pharmacy
Operation Theatre
Billing
Inventory
Reports
Audit
Configuration
Alerts & Notifications

For Reception:

Dashboard
 └── Reception Dashboard


Patients
Appointments
Queue
Emergency
Billing
Notifications

You don't need to show:

Configuration
Audit
Inventory
HL7
FHIR
Mirth
System Administration

to reception.

This is RBAC at the UI level, while the backend must enforce authorization independently.

35. FINAL ARCHITECTURE I RECOMMEND

Your dashboard layer should ultimately be:

                    DASHBOARD
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
       ADMIN DASHBOARD       RECEPTION DASHBOARD
             │                     │
             │                     │
       Hospital View           Front Desk View
             │                     │
       ┌─────┼─────┐         ┌────┼─────┐
       ↓     ↓     ↓         ↓    ↓     ↓
     Beds   ER    Labs     Patients Queue Doctors
       ↓     ↓     ↓         ↓    ↓     ↓
    Staff  OT   Pharmacy   Appointments Billing
       ↓     ↓     ↓
   Finance Inventory Reports
       │
       ▼
     Alerts
       │
       ▼
     Audit
My strongest recommendation

Don't try to make one universal dashboard.

Your system should have role-specific command centers:

Admin

"What is happening across my hospital, and what needs my attention?"

Reception

"Who has arrived, who is waiting, what appointment is next, and what do I need to do?"

Later you can add:
