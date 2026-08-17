# Inventory Management Module Spec

Saved verbatim from the user's paste (2026-08-17), same treatment as
`PHARMACY_MODULE_SPEC.md` / `OT_MODULE_SPEC.md` — a persistent reference doc
for the whole build. User instruction: "now do all these there" — read as the
same whole-module, no-phasing override established for OT/Pharmacy in the
immediately preceding turns (see `feedback_per_page_checkpoint.md`).

**Scope note:** per `HOSPITAL_ADMIN_MODULE_MAP.md`'s existing `[full]` marker
for this section (Hospital Admin owns Inventory & Procurement end to end, no
separate portal) — already established before this spec arrived. The spec's
own closing architecture note is taken at face value: **"Inventory ≠
Pharmacy ≠ Procurement ≠ Asset Management ≠ Billing"** — these stay separate
domains that cross-reference each other. This module is the *general* hospital
item/supply system (surgical supplies, PPE, lab consumables, general assets,
implant *inventory* as stock-on-hand) — it does NOT re-model medications
(Pharmacy already owns that, `api/pharmacy.ts`) and does not re-model OT's own
per-case Consumables/Implants *usage* tracking (OT already owns that,
`api/ot.ts` — this module is the upstream stock source those could
theoretically draw from, not a replacement for either).

---

## 1. Inventory Dashboard

KPI cards: Total Items, Active Items, Total Stock Quantity, Total Inventory
Value, Low Stock Items, Out of Stock, Expiring Soon, Expired Items, Pending
Purchase Requests, Pending Purchase Orders, Pending Goods Receipts, Pending
Transfers, Pending Approvals, Items in Quarantine, Damaged Items, Reorder
Required. Plus Stock Consumption trend, Stock by Category, Low Stock list,
Expiring Soon list.

## 2. Inventory Sidebar

Dashboard, Items (All/Medicines/Medical Supplies/Surgical/Laboratory/PPE/
Implants/Consumables/Other), Stock (Current/Low/Out/Expiring/Expired/
Quarantine/Damaged), Batches, Stock Movements, Purchase Requests, Purchase
Orders, Goods Receiving, Suppliers, Stock Transfers, Stock Issues, Stock
Returns, Adjustments, Requisitions, Warehouses, Storage Locations, Asset/
Equipment, Inventory Counts, Approvals, Reports, Audit Log, Settings.

## 3. Item Master

Item ID, Item Code, Item Name, Description, Category, Subcategory, Item
Type, Brand, Manufacturer, Model, Status.

## 4. Item Types

Pharmaceutical (Medicines, Vaccines, IV medications), Medical supplies
(Syringes, Needles, IV sets, Catheters, Tubes), Surgical (Surgical gloves,
Sutures, Drapes, Blades, Implants), Laboratory (Reagents, Test kits, Tubes,
Slides, Consumables), PPE (Gloves, Masks, Gowns, Face shields), General
(Cleaning supplies, Office supplies, Other consumables).

## 5. Unit of Measure

Piece, Box, Pack, Carton, Bottle, Vial, Ampoule, Tube, Kit, Liter,
Milliliter, Kilogram, Gram — with conversion support (1 Carton → 10 Boxes →
100 Pieces), important for purchasing/dispensing.

## 6. Item Identification

Internal Item Code, Manufacturer Code, GTIN, Barcode, QR Code, Serial
Number, Lot/Batch Number. Barcode/QR scanning where the device supports it.

## 7. Inventory Categories

Configurable hierarchy (Medical: Medicines/Surgical/Laboratory/PPE/
Consumables/Implants/Devices; Non-Medical: Cleaning/Office/Maintenance/
Other) — never hard-coded, different hospitals differ.

## 8. Stock Overview

Table: Item / Category / Location / Available / Reserved / Reorder /
Status. Quantities: On Hand, Available, Reserved, Allocated, Damaged,
Quarantined, In Transit, On Order.

## 9. Stock Status

AVAILABLE, LOW_STOCK, OUT_OF_STOCK, RESERVED, QUARANTINED, DAMAGED,
EXPIRED, BLOCKED, IN_TRANSIT.

## 10. Warehouse Management

Central Warehouse, Pharmacy Store, Emergency Store, ICU Store, OT Store,
Laboratory Store, Ward Stores — each with Location ID/Name/Type/Building/
Floor/Room/Manager/Status.

## 11. Storage Location

Warehouse → Aisle → Rack → Shelf → Bin, so staff can find stock quickly.

## 12. Batch Management

Item → Batch → Expiry → Quantity → Location. Batch Number, Item,
Manufacturer, Manufacturing Date, Expiry Date, Quantity, Unit Cost,
Supplier, Location, Status.

## 13. Serial Number Management

Individually-tracked items (medical equipment, devices, high-value assets,
certain implants): Item, Serial, Location, Status.

## 14. Expiry Management

Filters: Expired, 7/30/60/90 days, Custom range. Actions: Quarantine,
Return, Dispose, Transfer, Review.

## 15. FEFO

First Expire, First Out — the frontend shows the recommended batch when the
workflow supports it.

## 16. Stock Movement

Every change creates a movement: Purchase/Receipt/Return/Transfer-In (+),
Issue/Dispense/Transfer-Out/Damage/Expiry/Adjustment (−). Table: Date /
Item / Movement / Qty / From / To / User.

## 17. Stock Issue

Department → Requisition → Approval → Inventory → Issue → Department.

## 18. Department Requisition

Departments: Emergency, ICU, OT, Laboratory, Radiology, Pharmacy, Nursing,
OPD, Wards. Fields: Request ID, Department, Requested By, Priority, Items,
Quantity, Reason, Date, Status.

## 19. Requisition Status

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → PICKING → ISSUED → RECEIVED
```

Alternative: REJECTED, CANCELLED, PARTIALLY_FULFILLED.

## 20. Purchase Request

Low Stock → Reorder Alert → Purchase Request → Approval. Fields: Request
ID, Department, Requester, Item, Quantity, Reason, Priority, Estimated
Cost, Status.

## 21. Purchase Order

Purchase Request → Approval → Purchase Order → Supplier → Delivery. PO
Number, Supplier, Items, Quantity, Unit Price, Total, Tax, Delivery Date,
Payment Terms, Status.

## 22. Supplier Management

Supplier ID, Name, Contact, Address, Products, Contract, Payment terms,
Status, Performance (on-time delivery, rejected deliveries, quality
issues, average delivery time).

## 23. Goods Receiving

PO → Goods Arrive → Receive → Verify (item/quantity/batch/expiry/
packaging/quality/serial/damaged quantity) → Accept/Reject → Inventory.

## 24. Partial Receiving

Don't assume full delivery — PARTIALLY_RECEIVED status, tracks
received vs. remaining.

## 25. Stock Transfer

Hospital A → Central Warehouse → Transfer Request → Hospital B. Statuses:
Requested, Approved, Picking, Shipped, In Transit, Received, Rejected,
Cancelled.

## 26. Stock Return

Department→Store, Pharmacy→Store, Ward→Store, Store→Supplier. Reasons:
Excess, Wrong item, Damaged, Recall, Expiry, Quality issue.

## 27. Inventory Adjustment

System vs. physical stock mismatch — requires Reason, Quantity, User,
Approval where required, Timestamp, Audit record. **Never silent editing.**

## 28. Physical Stock Count

Create Count → Select Location → Freeze/Control Movement → Count →
Compare → Variance → Approval → Adjustment.

## 29. Inventory Variance

Expected, Counted, Difference, Reason, Value Difference, Approved By.

## 30. Inventory Reservation

E.g. OT Surgery Tomorrow → Reserve → Surgical Supplies. On Hand = 1000,
Reserved = 200, Available = 800.

## 31-36. Inventory per consuming module

OT, ICU, Laboratory, Pharmacy, Radiology, Billing — each requests/issues
from central Inventory; consumption may generate charges (Charge Capture →
Billing) especially for surgery/procedures/implants/high-value supplies.

## 37. Inventory + Patient Traceability

Patient → Encounter → Procedure → Item → Batch/Serial → Supplier —
critical for recalls and clinical traceability.

## 38. Medical Implant Tracking

Implant name, Manufacturer, Model, Serial number, Lot number, Expiry,
Procedure, Patient, Surgeon, Hospital, Date used.

## 39. Inventory Recall

Manufacturer Recall → Affected Batch → Find Locations → Quarantine Stock →
Find Issued Items → Trace Usage → Required Notifications/Actions.

## 40. Inventory Quarantine

Reasons: Recall, Quality concern, Damaged packaging, Suspected
contamination, Inspection, Regulatory hold. AVAILABLE → QUARANTINED →
RELEASED/RETURNED/DISPOSED.

## 41. Inventory Disposal

Expired/Damaged → Disposal Request → Approval → Disposal → Record. Track:
Item, Batch, Quantity, Reason, Method, Date, Authorized personnel, Witness
where required.

## 42. Inventory Alerts

Stock alerts (low/out/reorder/expiring/expired/quarantine/recall),
Procurement alerts (PO overdue/delivery delayed/partial delivery/pending
approval), Operational alerts (variance/unusual consumption/transfer
pending/requisition pending).

## 43. Inventory Reports

Stock reports, Movement reports, Procurement reports, Consumption reports
(by department/month/item/Pharmacy/OT/ICU/Laboratory).

## 44. Inventory Analytics

Inventory Value → Consumption → Demand → Reorder → Purchasing. Monthly
consumption, inventory turnover, slow/fast-moving stock, dead stock,
expiry loss, department consumption, supplier performance, purchase
trends.

## 45. Inventory Search

Global search across item name/code/barcode/batch/serial/manufacturer/
category/location.

## 46. Inventory Permissions

Inventory Manager (full), Storekeeper (receive/issue/stock), Procurement
Officer (PR/PO), Department Manager (create/approve requisitions),
Pharmacist (pharmacy inventory), Auditor (read-only + audit), Hospital
Admin (config/reporting). Least-privilege RBAC.

## 47. Audit Trail

WHO, WHAT, ITEM, QUANTITY, FROM, TO, WHEN, WHY, REFERENCE for every
important action.

## 48. Frontend Screens — Final List

Dashboard, Items (All/Add/Details/Categories), Stock (Current/Low/Out/
Expiring/Expired/Quarantine/Damaged), Batches, Warehouses, Locations,
Requisitions, Stock Issues, Stock Returns, Transfers, Purchase Requests,
Purchase Orders, Goods Receiving, Suppliers, Inventory Counts,
Adjustments, Reservations, Recalls, Disposal, Asset/Serial Tracking,
Implant Tracking, Reports, Analytics, Alerts, Audit Log, Settings.

## 49. The Most Important Overall Flow

```
INVENTORY → (PURCHASE / TRANSFER / RETURN) → RECEIVING → BATCH →
WAREHOUSE → STOCK → (REQUISITION / RESERVATION / ISSUE) →
(DEPARTMENT / OT / WARD) → CONSUMPTION → CHARGE CAPTURE → BILLING
```

**One important architecture decision (explicit in the user's own spec):**
Keep these concepts separate — Inventory ≠ Pharmacy ≠ Procurement ≠ Asset
Management ≠ Billing. They communicate with each other but are different
business domains.
