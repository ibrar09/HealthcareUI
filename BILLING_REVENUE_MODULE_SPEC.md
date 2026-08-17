# HMS — Billing & Revenue Cycle Management — Module Spec

This is the canonical domain spec for the Hospital Admin **Billing & Revenue**
section, pasted verbatim by the user on 2026-08-15. Build order follows §61
below — one phase at a time, same discipline as Bed Management and
Appointments. Update `HOSPITAL_ADMIN_MODULE_MAP.md`'s status markers as each
phase ships; this file stays a static reference, not a progress tracker.

**Scope note (resolved 2026-08-15):** this is built inside
`hospital-admin` (`pages/billing/`, `components/billing/`), same as Bed
Management and Appointments — not the separate top-level `src/modules/billing/`
stub in `TEAM_WORKFLOW.md`, which predates the hospital-admin scope rule and
remains an unbuilt placeholder for a possible future standalone
billing-officer portal. Don't touch that folder for this work.

---

## 1. The correct overall architecture

Don't think:

```
Patient
   ↓
Invoice
   ↓
Payment
```

A real hospital system is more like:

```
PATIENT
   ↓
REGISTRATION
   ↓
INSURANCE / SELF PAY
   ↓
ELIGIBILITY
   ↓
AUTHORIZATION
   ↓
APPOINTMENT / ADMISSION
   ↓
CARE DELIVERY
   ↓
CHARGE CAPTURE
   ↓
CODING / VALIDATION
   ↓
BILL
   ↓
CLAIM
   ↓
PAYER ADJUDICATION
   ↓
CLAIM RESPONSE
   ↓
PAYMENT / REJECTION
   ↓
RECONCILIATION
   ↓
PATIENT BALANCE / REFUND
   ↓
REPORTING
```

This is the architecture recommended for this HMS.

## 2. Billing Dashboard

First Billing page should be an executive dashboard.

**Financial KPIs**
```
Today's Revenue             SAR 485,230
Outstanding Receivables     SAR 2.8M
Insurance Claims            SAR 1.4M
Patient Receivables         SAR 620K
Pending Claims              184
Rejected Claims              27
Denied Claims                18
Pending Payments             96
```

**Operational KPIs**
- Total invoices
- Paid invoices
- Unpaid invoices
- Partially paid
- Overdue
- Refunds
- Credit notes
- Discounts
- Write-offs
- Claims submitted
- Claims accepted
- Claims rejected
- Claims denied
- Claims pending
- Average days to payment
- Outstanding AR
- Aging buckets

## 3. Revenue Cycle Dashboard

A separate Revenue Cycle dashboard.

```
CONTRACT
   ↓
PRE-SERVICE
   ↓
POINT-OF-SERVICE
   ↓
POST-SERVICE
```

**Pre-service**
- Patient registration
- Insurance registration
- Eligibility
- Benefits
- Authorization
- Referral

**Point-of-service**
- Charge capture
- Patient responsibility
- Copayment
- Deductible
- Payment collection

**Post-service**
- Coding
- Claim creation
- Claim submission
- Claim tracking
- Rejection
- Denial
- Resubmission
- Payment
- Reconciliation
- AR follow-up

This aligns closely with how healthcare revenue-cycle processes are
structured, including the Saudi context.

## 4. Patient Financial Account

Every patient should have a financial account.

```
PATIENT FINANCIAL ACCOUNT

Patient:            Ahmed Khan
MRN:                MRN-102938
Account:            ACC-00018273
Coverage:           Insurance
Current Balance:    SAR 850
Insurance Pending:  SAR 4,250
Patient Responsibility: SAR 850
```

The financial account should aggregate financial activity across encounters
according to the accounting model. FHIR's `Account` concept is intended for
tracking value accrued for a particular purpose, including healthcare
patient/cost-center accounting.

## 5. Charges

One of the most important parts. Charges can come from: Consultation,
Appointment, Emergency, Admission, Bed, Room, Laboratory, Radiology,
Procedure, Surgery, Medication, Pharmacy, Medical supplies, Nursing, ICU,
Medical devices, Consumables, Professional services.

```
Encounter
   ↓
Services Performed
   ↓
Charge Capture
   ↓
Charges
```

## 6. Charge Capture

Don't allow billing staff to manually enter everything. Clinical/operational
systems should generate charges from documented services where appropriate.

```
Doctor documents consultation → Clinical Service → Charge generated → Billing
CBC performed → Lab service → Charge
Medication dispensed → Dispensing transaction → Charge
```

This reduces missed charges. Charge capture is recognized as a core
revenue-cycle step following care delivery.

## 7. Charge Review

Before billing:

```
Charges → Validation → Missing Information? → Coding Review → Billing Ready
```

Show:
```
Charge Validation
✓ Patient
✓ Encounter
✓ Service
✓ Provider
✓ Date
✓ Quantity
✓ Price
✓ Coverage
✓ Authorization
✓ Required documentation
```

## 8. Service Catalog

Admin needs a centralized service catalog.

| Code | Service | Department | Price |
|---|---|---|---|
| CONS-001 | General Consultation | Medicine | SAR 150 |
| LAB-001 | CBC | Laboratory | SAR 80 |
| RAD-001 | X-Ray | Radiology | SAR 250 |

Prices should not simply be globally hard-coded:

```
Service → Pricing Configuration → Payer Contract / Patient Price → Billable Amount
```

## 9. Pricing

Support: Standard price, Insurance price, Contract price, Corporate price,
Self-pay price, Discounted price, Package price, Promotional price where
applicable, Emergency price where configured.

## 10. Payer / Insurance Management

```
Insurance
├── Payers
├── Plans
├── Contracts
├── Benefits
├── Eligibility
├── Authorizations
├── Claims
├── Claim Responses
├── Denials
└── Payments
```

Payer types: Insurance company, Government payer, Employer/corporate payer,
Self-pay, Third-party administrator.

## 11. Insurance Coverage

Patient may have multiple coverage records (Primary / Secondary). Store:
Payer, Member ID, Policy number, Plan, Subscriber, Relationship to
subscriber, Effective date, Expiry date, Coverage status.

FHIR's `Coverage` represents the financial instrument used to
reimburse/pay for healthcare services, including insurance and self-payment.

## 12. Eligibility Verification

```
Patient → Coverage → Eligibility Request → Payer → Eligibility Response
```

Show: Status (ACTIVE), Coverage validity, Effective/Expiry dates, Copay,
Deductible, Authorization requirements (e.g. "Required for MRI").

FHIR provides `CoverageEligibilityRequest` and `CoverageEligibilityResponse`
for this purpose.

## 13. Authorization / Preauthorization

```
Doctor → MRI Requested → Authorization Required → Insurance → Approved → MRI
```

Dashboard: Pending / Approved / Rejected / Expired counts.

## 14. Patient Responsibility

```
Gross Charge → Contract Adjustment → Insurance Allowed Amount →
Insurance Paid/Expected → Patient Responsibility
```

May include: Copayment, Deductible, Coinsurance, Non-covered services,
Self-pay amount. Exact calculations depend on payer contracts and
jurisdiction.

## 15. Invoice

```
INVOICE
Invoice #: INV-2026-000123
Patient: Ahmed Khan          MRN: MRN-102938
Encounter: ENC-000921        Date: 15 Aug 2026
--------------------------------
Service             Qty     SAR
--------------------------------
Consultation          1     150
CBC                    1      80
Medication              2     120
--------------------------------
Gross Amount               350
Discount                    20
Insurance                  250
Patient Responsibility      80
--------------------------------
TOTAL                       80
```

## 16. Invoice Status

`DRAFT · PENDING_REVIEW · ISSUED · PARTIALLY_PAID · PAID · OVERDUE ·
CANCELLED · VOID · REFUNDED`

## 17. Payment

Support configured payment methods: Cash, Card, Bank transfer, Online
payment, Insurance payment, Corporate payment. For online payments,
integrate an actual payment gateway rather than storing card details in
the HMS.

## 18. Payment Details

```
PAYMENT
Payment ID: PAY-0009182   Invoice: INV-000123
Amount: SAR 500            Method: CARD
Status: SUCCESS
Transaction Reference: TXN-928372
Date: 15 Aug 2026
```

## 19. Partial Payment

```
Invoice: SAR 1,000   Paid: SAR 400   Remaining: SAR 600
```

UI should clearly show Paid vs. Outstanding.

## 20. Refunds

```
Payment → Refund Request → Approval → Refund Processing → Refund Completed
```

Track: Original payment, Refund amount, Reason, Requested by, Approved by,
Processed date, Payment reference.

## 21. Credit Notes / Adjustments

Don't modify historical invoices directly:

```
Original Invoice → Adjustment → Credit Note / Debit Adjustment
```

This preserves financial history.

## 22. Discounts

Support: Percentage, Fixed amount, Contractual discount, Staff discount if
permitted, Corporate discount, Promotional discount.

```
Discount → Authorization Rule → Approval → Audit
```

A receptionist should not be able to arbitrarily change a patient's bill.

## 23. Claims

```
Services → Charge Capture → Coding → Claim Validation → Claim Creation →
Claim Submission → Payer → Claim Response
```

FHIR `Claim` represents a request for adjudication/authorization of
healthcare goods and services against coverage.

## 24. Claims Dashboard

Draft / Ready / Submitted / Accepted / Rejected / Denied / Pending / Paid
counts.

## 25. Claim Details

```
CLAIM
Claim ID: CLM-2026-001827   Patient: Ahmed Khan
Payer: Insurance A           Encounter: ENC-00182
Amount: SAR 4,820            Submitted: 15 Aug 2026
Status: SUBMITTED
```

## 26. Claim Validation

```
Claim → Patient validation → Coverage validation → Provider validation →
Service validation → Coding validation → Authorization validation →
Documentation validation → Claim Ready
```

One of the most important screens for billing staff.

## 27. Rejected vs Denied

Keep these concepts separate.

**Rejected** — claim couldn't be accepted/processed as submitted (invalid/
missing data): `Claim → Payer → REJECTED → Fix → Resubmit`

**Denied** — payer adjudicated the claim but didn't pay some/all of it:
`Claim → Adjudication → DENIED → Analyze → Appeal / Correct / Write-off`

Exact definitions/workflows vary by payer.

## 28. Denial Management

```
Denials
├── New
├── Assigned
├── Investigating
├── Corrected
├── Resubmitted
├── Appealed
├── Approved
├── Denied Again
└── Closed
```

Track: Claim, Patient, Payer, Denial reason, Amount, Department,
Responsible team, Root cause, Action, Appeal deadline, Status.

## 29. Rejection Management

Track: Claim, Reason, Amount, Detected Date, Assigned To, Correction,
Resubmission, Status.

## 30. Accounts Receivable — AR

```
Accounts Receivable
├── Insurance AR
├── Patient AR
├── Corporate AR
└── Government AR
```

Dashboard: Total AR + aging buckets (0–30, 31–60, 61–90, 91–120, 120+ days).

## 31. AR Aging

Columns: Payer, Patient, Invoice, Claim, Original Amount, Paid, Outstanding,
Days Outstanding, Aging Bucket, Assigned Collector, Status.

## 32. Payment Reconciliation

```
Payer Payment → Payment File / Reference → Match Claims → Allocate Amounts
→ Reconcile → Remaining Exceptions
```

FHIR provides `PaymentReconciliation` for payment allocation/reconciliation
information.

## 33. Explanation of Benefits

```
SERVICE                    SAR
Hospital Charge            500
Allowed Amount             400
Insurance Paid             350
Patient Responsibility      50
Not Covered                  0
```

FHIR `ExplanationOfBenefit` combines claim and adjudication information,
intended for patient/subscriber reporting as well as exchange.

## 34. Self-Pay

```
Patient → Self Pay → Service → Charge → Invoice → Payment
```

Dashboard: Cash patients, Self-pay invoices, Outstanding self-pay, Payment
collections.

## 35. Corporate Billing

```
Company → Contract → Employee → Healthcare Service → Corporate Invoice
```

## 36. Package Billing

Example: Maternity Package (Consultations, Laboratory, Room, Delivery,
Medication, Nursing). Frontend should show package utilization.

## 37. Inpatient Billing

IPD billing is more complex than OPD:

```
Admission → Bed → Room → Daily Charges → Doctor Visits → Nursing →
Laboratory → Radiology → Medication → Procedures → Supplies → Discharge →
Final Bill
```

## 38. Interim / Running Bill

For long admissions: `Patient admitted → Running Account → Daily charges →
Current balance`. Billing staff should see current financial position
before discharge.

## 39. Emergency Billing

```
Emergency → Registration → Eligibility → Treatment → Charges → Billing
```

Must support urgent care even when some administrative information is
incomplete, with controlled reconciliation later.

## 40. Pharmacy Billing

```
Prescription → Pharmacy → Dispensing → Charge → Insurance / Patient
```

Billing system should receive the financial event from Pharmacy rather
than duplicating pharmacy inventory logic.

## 41. Laboratory Billing

```
Lab Order → Test Performed → Charge → Claim / Patient Bill
```

## 42. Radiology Billing

```
Imaging Order → Procedure Performed → Charge → Claim
```

## 43. Bed / Room Billing

Connects with the Bed Management module:

```
Bed Assignment → Admission → Daily Room/Bedding Charge → Running Account →
Discharge → Final Calculation
```

## 44. Coding

A serious billing platform needs a coding layer. Depending on jurisdiction
and contract, organizations may use standardized coding systems for
diagnoses, procedures, services, drugs, supplies and other billable
concepts.

```
Clinical Documentation → Coding → Billable Service → Claim
```

Don't hard-code one country's coding system into the platform — make
terminology/coding configurable by jurisdiction.

## 45. Contract Management

Especially important for an international system. Admin should manage:

```
Payer → Contract → Services → Rates → Discounts → Coverage Rules →
Authorization Rules → Effective Dates
```

The Saudi RCM study specifically identifies contract management, including
service/price mappings and contract terms, as an important revenue-cycle
area.

## 46. Contract Screen

```
INSURANCE CONTRACT
Payer: Insurance A            Contract: CON-2026-001
Effective: 01 Jan 2026        Expiry: 31 Dec 2026
Payment Terms: 30 Days
Services: Cardiology, Laboratory, Radiology, Pharmacy
Status: ACTIVE
```

## 47. Billing Work Queue

```
BILLING WORK QUEUE
Missing Authorization       12
Missing Coding              18
Charge Review                24
Claim Validation             31
Rejected Claims               14
Denied Claims                  8
Pending Payments              52
AR Follow-up                  37
```

Much more useful than just displaying tables.

## 48. Billing Notifications

Examples: Claim Rejected, Payment Received, Invoice Overdue, Authorization
Expiring, Claim Pending, Denial Assigned, Refund Approved.

## 49. Billing Reports

Revenue (daily/monthly/by department/provider/service/payer), Claims
(submitted/accepted/rejected/denied/paid/pending), AR (outstanding/aging/
payer AR/patient AR), Payments (cash/card/bank/insurance/refunds),
Operational (charge capture rate, clean claim rate, denial rate, rejection
rate, days in AR, collection rate).

## 50. Billing Audit

```
Who → Did What → To Which Financial Record → When → Old Value → New Value
→ Reason
```

Examples: Invoice created/modified, Charge added/reversed, Discount
applied, Payment recorded, Refund issued, Claim submitted/corrected/
resubmitted, Write-off approved.

## 51. Write-Off Management

Don't simply set `Outstanding = 0`. Instead:

```
Outstanding → Write-Off Request → Approval → Write-Off Transaction → Audit
```

## 52. Financial Permissions

- **Billing Officer** — Create invoices, Review charges, Record permitted payments
- **Billing Manager** — Approve adjustments, Manage claims, Manage denials
- **Finance Admin** — Reconciliation, Financial reports, Settlement
- **Cashier** — Collect payments, Issue receipts
- **Hospital Admin** — Configuration

A doctor should generally not have unrestricted financial modification
privileges.

## 53. Frontend Pages

```
Billing
├── Dashboard
├── Revenue Cycle
├── Patient Accounts
├── Charges
├── Charge Review
├── Invoices
├── Payments
├── Refunds
├── Credit Notes
├── Discounts
├── Insurance
│   ├── Payers
│   ├── Plans
│   ├── Coverage
│   ├── Eligibility
│   └── Authorizations
├── Claims
│   ├── All Claims
│   ├── Draft
│   ├── Ready
│   ├── Submitted
│   ├── Accepted
│   ├── Rejected
│   ├── Denied
│   └── Paid
├── Denials
├── Rejections
├── Accounts Receivable
├── Aging
├── Reconciliation
├── Contracts
├── Services & Pricing
├── Packages
├── Work Queue
├── Reports
├── Configuration
└── Audit
```

## 54. Billing → Other HMS Modules

```
                         PATIENT
                            │
                            ↓
                       PATIENT SERVICE
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
        APPOINTMENT      ADMISSION      EMERGENCY
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                         ENCOUNTER
                            │
        ┌───────────┬───────┼────────┬──────────┐
        ↓           ↓       ↓        ↓          ↓
      LAB       RADIOLOGY  PHARMACY  BED       PROCEDURE
        │           │       │        │          │
        └───────────┴───────┼────────┴──────────┘
                            ↓
                      CHARGE CAPTURE
                            ↓
                         BILLING
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
         SELF-PAY       INSURANCE       CORPORATE
             │              │
             ↓              ↓
          PAYMENT        CLAIM
                            ↓
                       ADJUDICATION
                            ↓
                  PAYMENT / DENIAL
                            ↓
                     RECONCILIATION
                            ↓
                         REPORTING
```

## 55. Billing → Patient App

```
Patient App
├── Bills
├── Payments
├── Outstanding Balance
├── Insurance
├── Claims
├── EOB
├── Receipts
└── Payment History
```

Patient-facing data must be carefully authorized.

## 56. Billing → FHIR

```
HMS Billing → Internal Billing Domain → FHIR Financial Mapping →
Integration Gateway → External Payer / Healthcare System
```

Important FHIR financial concepts: `Account`, `Coverage`,
`CoverageEligibilityRequest`, `CoverageEligibilityResponse`, `Claim`,
`ClaimResponse`, `PaymentNotice`, `PaymentReconciliation`,
`ExplanationOfBenefit`. FHIR's financial module explicitly covers provider
costing/billing as well as eligibility, authorization, claims, payments and
reporting.

## 57. Complete OPD Billing Example

```
Patient → Appointment → Check-In → Encounter → Doctor Consultation →
Charge Capture → Insurance Eligibility → Authorization if required →
Claim / Patient Bill → Insurance Adjudication → Patient Responsibility →
Payment → Receipt
```

## 58. Complete IPD Billing Example

```
Admission → Bed Assignment → Daily Room Charges → Doctor Visits → Nursing
→ Laboratory → Radiology → Medication → Procedures → Supplies →
Running Account → Discharge → Final Charge Review → Final Bill →
Insurance Claim → Adjudication → Payment → Reconciliation
```

## 59. Complete Insurance Example

```
Patient → Coverage → Eligibility → Service Requested → Authorization →
Care Delivered → Charge Capture → Coding → Claim Validation →
Claim Submission → Payer → Claim Response → Accepted / Rejected / Denied →
Payment → Reconciliation → EOB
```

## 60. What we should NOT do in the frontend

Don't build Billing as a basic accounting CRUD system:

```
Billing
├── Add Invoice
├── Edit Invoice
├── Delete Invoice
└── Pay
```

We're building the full revenue cycle:

```
                    REVENUE CYCLE
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    PRE-SERVICE      CARE DELIVERY    POST-SERVICE
        │                │                │
    Eligibility       Charges          Claims
    Coverage          Coding           Rejection
    Authorization     Billing          Denial
    Contracts                          Payment
                                       AR
                                       Reconciliation
```

## 61. Frontend Development Order

Don't build all 50+ screens at once. Build in this order:

**Phase 1 — Core Billing**
- Billing Dashboard
- Patient Financial Account
- Charges
- Charge Review
- Invoices
- Invoice Details
- Payments
- Payment Details
- Receipts

**Phase 2 — Insurance**
- Payers
- Insurance Plans
- Patient Coverage
- Eligibility
- Authorization
- Contracts
- Service Pricing

**Phase 3 — Claims**
- Claims Dashboard
- Claim List
- Claim Details
- Claim Validation
- Rejections
- Denials
- Resubmission
- Claim History

**Phase 4 — Finance**
- Accounts Receivable
- Aging
- Payment Reconciliation
- Refunds
- Credit Notes
- Adjustments
- Write-Offs

**Phase 5 — Analytics**
- Revenue Analytics
- Claims Analytics
- Denial Analytics
- AR Analytics
- Payer Analytics
- Department Revenue
- Financial Reports

**Phase 6 — Administration**
- Billing Configuration
- Services
- Pricing
- Contracts
- Payment Methods
- Approval Rules
- Billing Roles
- Audit

## The most important point

The Billing module should eventually be its own bounded domain/service, not
mixed into Patient, Appointment or Encounter:

```
Patient Service
       │
Appointment Service
       │
Encounter Service
       │
       ↓
Billing / Revenue Cycle Service
       │
 ┌─────┼──────────────┐
 ↓     ↓              ↓
Claims Payments       AR
 │     │              │
 ↓     ↓              ↓
Payers Reconciliation Collections
```

The frontend should reflect these boundaries — it'll make the eventual
Spring Boot/microservices backend split easier, and let the Universal
Platform connect billing/insurance information through standardized
interoperability APIs rather than coupling the whole HMS together.
