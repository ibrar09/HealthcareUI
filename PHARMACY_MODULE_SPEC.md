# Pharmacy Module Spec

Saved verbatim from the user's paste (2026-08-16), same treatment as
`OT_MODULE_SPEC.md` / `RADIOLOGY_MODULE_SPEC.md` / `HMS_DOMAIN_STANDARDS.md` —
a persistent reference doc for the whole build.

**Build discipline for this module (explicit, from the user):** "must
complete also this not in phase just do all" — build the ENTIRE spec in one
pass, not phase-by-phase like every other module in this project. This
overrides the project's normal phase-level cadence for Pharmacy specifically.

**Scope note (per this project's established `[oversight]` pattern for
sections that overlap a dedicated clinical portal — see
`HOSPITAL_ADMIN_MODULE_MAP.md`):** Pharmacy inside hospital-admin covers the
full workflow the spec below describes (prescription queue, verification,
dispensing, inventory, procurement, etc.) — this spec explicitly asks for
more than the earlier placeholder's "no dispensing screen" note, so that
boundary is superseded here, same as every other module spec in this project
sets its own scope. What stays *structured, short-form administrative
capture* rather than deep clinical authorship: allergy/interaction/duplicate-
thertherapy *warnings* are surfaced as flags from structured data (patient
allergy list, active medication list), never a real clinical decision-support
engine — "Clinical decision support should be treated carefully and should
not replace professional pharmacist/clinician judgment" (§4) is taken at face
value. MedicationRequest → MedicationDispense → MedicationAdministration
(§20) stay three distinct events; this module owns the first two, nursing
administration recording is a different module's concern.

---

## 1. Pharmacy Dashboard

KPI cards: Prescriptions Today, Pending Prescriptions, In Verification,
Ready for Dispensing, Dispensed Today, Partially Dispensed, Cancelled,
Returned, Low Stock, Out of Stock, Expiring Soon, Controlled/Restricted
Medication Alerts, Inventory Value, Pending Refill Requests.

Dashboard charts: Prescriptions by day, Dispensing volume, Top medicines
dispensed, Department-wise prescriptions, Stock consumption, Expiring
medicines, Low-stock medicines, Revenue, Prescription turnaround time.

## 2. Pharmacy Work Queue

```
Prescription → Received → Verification → Clinical/Safety Check →
Stock Check → Preparation → Dispensing → Completed
```

Tabs: New, Pending Verification, Verified, Preparing, Ready, Dispensing,
Partially Dispensed, Completed, Cancelled, Returned.

Each prescription shows: Prescription ID, Patient, Patient ID, Encounter,
Doctor, Department, Medication, Quantity, Priority, Status, Date/time,
Pharmacist, Actions.

## 3. Prescription Management

Full prescription: Prescription ID, Patient, Encounter, Prescriber,
Prescription date, Medication, Dose, Route, Frequency, Duration, Quantity,
Refills, Instructions, Start date, End date, Status.

Example: Amoxicillin 500mg Oral 3×/day 7 days, Quantity 21.

**Structured, not free text.**

## 4. Medication Verification

```
Prescription → Pharmacist Review → Patient Identity → Medication → Dose →
Route → Frequency → Allergies → Interactions → Duplicate Therapy → Stock →
Dispense
```

Warnings: Allergy, Drug interaction, Duplicate therapy, Dose concern,
Incorrect route, Missing information, Expired medication, Invalid
prescription, Stock unavailable.

**Clinical decision support should be treated carefully and should not
replace professional pharmacist/clinician judgment.**

## 5. Patient Pharmacy Profile

Patient: Name, Patient ID, DOB, Sex, Allergies, Alerts, Current medications,
Medication history.

```
Prescribed → Dispensed → Administered → Medication history
```

**A medication being prescribed does not mean it was dispensed, and being
dispensed does not mean it was administered.**

## 6. Medication Catalog

Fields: Medication ID, Generic name, Brand name, Strength, Dose form, Route,
Manufacturer, Medication code, Product code, Package size, Unit, Status,
Prescription requirement, Storage requirements.

**Don't invent your own clinical terminology where established terminology
is appropriate.**

## 7. Medication Forms

Tablet, Capsule, Syrup, Solution, Suspension, Injection, Cream, Ointment,
Gel, Drops, Inhaler, Suppository, Patch, Powder.

## 8. Routes of Administration

Oral, IV, IM, Subcutaneous, Topical, Inhalation, Ophthalmic, Otic, Rectal,
Vaginal, Sublingual. **Standardized, not arbitrary text.**

## 9. Pharmacy Inventory

Overview: Total products, Available, Low stock, Out of stock, Expiring,
Expired, Reserved, Quarantined, Damaged.

Table: Medication / Batch / Expiry / Quantity / Location / Status.

## 10. Batch Management

```
Medication → Product → Batch → Expiry → Stock → Dispensing
```

Batch info: Batch number, Medication, Manufacturer, Manufacturing date,
Expiry date, Quantity, Unit cost, Selling price, Supplier, Storage location,
Status.

## 11. Expiry Management

Buckets: Expiring Soon (30/60/90 days, custom range). Actions: Review,
Quarantine, Return to supplier, Mark expired, Disposal workflow. **Never
allow expired inventory to be silently dispensed.**

## 12. Stock Movement

```
Opening Stock + Purchase + Return − Dispensing − Expiry − Damage −
Adjustment = Current Stock
```

Transaction types: Purchase, Dispense, Return, Transfer, Adjustment,
Expiry, Damage, Disposal, Stock correction. **Auditable.**

## 13. Stock Transfer

```
Main Pharmacy → Transfer Request → Approval → Satellite Pharmacy
```

Support: Pharmacy-to-pharmacy, Store-to-pharmacy, Pharmacy-to-ward,
Pharmacy-to-OT, Pharmacy-to-ICU.

## 14. Purchase / Procurement

```
Low Stock → Reorder Level → Purchase Request → Approval → Purchase Order →
Supplier → Goods Received → Batch Entry → Inventory
```

## 15. Suppliers

Supplier ID, Name, License/registration info, Contact, Address, Contract,
Products, Payment terms, Status.

## 16. Goods Receiving

```
Purchase Order → Goods Received → Verify Quantity → Verify Batch →
Verify Expiry → Quality Check → Accept/Reject → Inventory
```

Receiving form: PO number, Supplier, Product, Batch, Quantity, Expiry, Unit
cost, Storage location, Receiving staff, Date/time.

## 17. Pharmacy Locations

Hospital → Main Pharmacy, Emergency Pharmacy, OPD Pharmacy, Inpatient
Pharmacy, ICU Pharmacy, Pediatric Pharmacy, Satellite Pharmacy. Each with its
own Inventory/Stock/Users/Work queue/Transfers.

## 18. Ward / Department Medication Supply

Pharmacy may supply ICU, Emergency, OT, Wards, Clinics, other departments —
different from patient-specific outpatient dispensing.

## 19. Inpatient Medication Workflow

```
Doctor → Medication Order → Pharmacy Verification → Medication Preparation →
Ward → Nurse → Administration → MAR
```

Pharmacy records the dispensing/supply side; nursing records administration.

## 20. Medication Administration Relationship

```
MedicationRequest → MedicationDispense → MedicationAdministration
```

Doctor orders, Pharmacy dispenses, Nurse/authorized clinician administers,
Patient may report taking medication. **Different events — never merged
into one database record.**

## 21. Refill Management

Refill requested, Refills remaining, Approved, Rejected, Ready, Dispensed.

## 22. Medication Returns

Patient return, Ward return, Pharmacy-to-pharmacy return, Supplier return.
Return info: Medication, Batch, Quantity, Reason, Condition, Original
dispensing, Staff member, Date/time.

## 23. Damaged / Quarantined Stock

Damaged, Suspected contamination, Quality hold, Recall, Quarantine —
separated from available stock.

## 24. Medication Recall

```
Manufacturer → Recall → Affected Medication → Affected Batch →
Find Inventory → Find Dispensing → Quarantine → Notification/Action
```

## 25. Controlled / Restricted Medicines

Restricted medication, Authorized users, Special prescription requirements,
Additional verification, Inventory reconciliation, Detailed audit trail,
Wastage documentation. **Exact requirements follow jurisdiction's laws and
hospital policy.**

## 26. Controlled Medication Register

Date, Medication, Batch, Quantity Received, Quantity Dispensed, Balance,
Prescriber, Patient, Pharmacist, Witness. **Strong audit controls.**

## 27. Pharmacy Pricing

Medication price, Insurance price, Patient price, Discount, Tax, Unit price,
Total price. Billing stays connected to the hospital's financial domain.

## 28. Insurance / Pharmacy Coverage

Insurance eligibility, Medication coverage, Prior authorization, Copay,
Rejection, Approval, Claim information. **Don't hard-code one country's
insurance workflow — the platform is international.**

## 29. Prescription Status

```
NEW → RECEIVED → UNDER_REVIEW → VERIFIED → PREPARING → READY →
DISPENSING → DISPENSED
```

Alternative outcomes: CANCELLED, REJECTED, PARTIALLY_DISPENSED, RETURNED,
EXPIRED.

## 30. Pharmacy Queue

Sortable by: Priority, Patient, Doctor, Department, Time, Prescription
status, Medication, Location. Priority: Routine, Urgent, STAT/emergency
where supported.

## 31. Pharmacy Staff Management

Pharmacist, Pharmacy Technician, Pharmacy Manager, Inventory Officer,
Storekeeper — each with appropriate permissions. (This project's existing
Staff & Workforce / role-permission system already covers this — no
duplicate pharmacy-specific staff screen.)

## 32-33. Dashboard Layout & Sidebar

Reference mockups for KPI-strip + queue + low-stock/expiring panels layout,
and a ~20-item sidebar grouping (Dashboard, Prescriptions, Dispensing,
Patients, Medication Catalog, Inventory, Procurement, Transfers, Returns,
Recalls, Controlled Medicines, Inpatient Medication, Refills, Insurance,
Reports, Notifications, Audit Log, Settings).

## 34-35. Pharmacy → HMS → Patient App / Universal Healthcare Platform

Full ecosystem: Doctor → Medication Order → HMS Prescription → Pharmacy
(Verify/Stock Check/Clinical Review → Dispense) → Medication Record →
Patient Record + Patient App. FHIR resources: MedicationRequest,
MedicationDispense, MedicationAdministration, MedicationStatement,
Medication, Patient, Practitioner, Encounter.

## 36. Pharmacy Events

Event-driven publishing (future backend concern, noted for later):
MedicationOrdered, PrescriptionVerified, MedicationPrepared,
MedicationDispensed, MedicationPartiallyDispensed, MedicationReturned,
MedicationCancelled, MedicationAdministrationRecorded, StockReceived,
StockAdjusted, StockTransferred, StockExpired, MedicationRecalled.

## 37. Pharmacy + Laboratory/Radiology/Doctor

Not isolated — Doctor → Lab Order/Imaging Order/Medication, all connected
through patient + encounter + clinical record.

## 38. Database Concepts (backend, later)

Medication, MedicationProduct, MedicationForm, MedicationRoute,
MedicationBatch, MedicationStock, Pharmacy, PharmacyLocation,
Prescription/MedicationRequest, PrescriptionItem, Dispense, DispenseItem,
StockTransaction, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, Supplier,
StockTransfer, StockTransferItem, MedicationReturn, MedicationRecall,
Refill, PharmacyUser. Domain boundaries first, microservice split later.

## 39. Most Important Frontend Screens (priority order the user gave)

**Phase 1:** Pharmacy Dashboard, Prescription Queue, Prescription Details,
Medication Verification, Dispensing Screen, Patient Medication Profile,
Medication Catalog, Inventory Dashboard, Stock List, Batch Details, Low
Stock, Expiry Management.

**Phase 2:** Purchase Orders, Goods Receiving, Suppliers, Stock Transfers,
Returns, Recalls, Controlled Medicines, Refills, Inpatient Medication,
Insurance.

**Phase 3:** Pharmacy Reports, Analytics, Audit, Integration Monitoring,
Configuration.

**But per this build's own instruction, all three phases above are built
together in one pass, not sequentially.**

The real workflow: prescription → verification → inventory/batch selection
→ dispensing → financial/insurance connection → medication history →
patient record → audit, with inpatient administration handled as a related
but distinct clinical workflow.
