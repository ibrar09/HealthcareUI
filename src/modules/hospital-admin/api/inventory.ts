import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { staffMembers } from "./staff";
import { patientSeeds } from "./patients";

// ============================================================================
// Inventory Management (Hospital Admin's [full] section — Hospital Admin owns
// this end to end per HOSPITAL_ADMIN_MODULE_MAP.md, no separate portal. Built
// entirely in one pass per INVENTORY_MODULE_SPEC.md, continuing the same
// "not in phase just do all" instruction that shipped OT and Pharmacy.
//
// Domain separation (explicit in the spec itself): Inventory != Pharmacy !=
// Procurement != Asset Management != Billing. This file is the *general*
// hospital item/supply system — surgical supplies, PPE, lab consumables,
// general equipment/assets, and implant *stock* traceability. It deliberately
// does NOT re-model medications (api/pharmacy.ts already owns the Medication/
// Batch/Prescription domain end to end) and does NOT re-model OT's own
// per-case Consumables/Implants *usage* tabs (api/ot.ts already owns that).
// No seed item below uses category "medicine" for this reason, even though
// the type union allows it for schema completeness (a hospital's general
// item master can still reference pharmaceuticals conceptually).
//
// FHIR-adjacent alignment: Item Master ~ a hospital-local inventory catalog
// (no single FHIR resource covers "supply item master" the way MedicationRequest
// covers prescriptions); stock movements/adjustments ~ SupplyDelivery/
// SupplyRequest-flavored events; implant usage traceability intentionally
// carries Patient/Procedure/Practitioner references so it can map cleanly to
// a future Device/DeviceUseStatement record without the UI ever exposing
// those field names directly.
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

function resolveStaffName(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  return staffMembers.find((s) => s.id === staffId)?.name;
}

function resolveDepartmentName(departmentId: string): string {
  return departmentConfigs.find((d) => d.id === departmentId)?.name ?? "Unknown Department";
}

function resolvePatientName(patientId: string): string {
  return patientSeeds.find((p) => p.id === patientId)?.fullName ?? "Unknown Patient";
}

function daysUntil(dateStr?: string): number {
  if (!dateStr) return Infinity;
  return Math.ceil((new Date(dateStr).getTime() - new Date(TODAY).getTime()) / 86400000);
}

// --- Item Master (spec §3-8) -------------------------------------------------

export type ItemCategory = "medicine" | "medical-supply" | "surgical" | "laboratory" | "ppe" | "implant" | "consumable" | "equipment" | "general";
export type ItemGroup = "medical" | "non-medical";
export type UnitOfMeasure = "piece" | "box" | "pack" | "carton" | "bottle" | "vial" | "ampoule" | "tube" | "kit" | "liter" | "milliliter" | "kilogram" | "gram";
export type ItemStatus = "active" | "inactive" | "discontinued";

export interface InventoryCategoryConfig {
  id: string;
  name: string;
  group: ItemGroup;
  parentId?: string;
}

/** Configurable hierarchy (spec §7) — never hardcoded into dropdowns, hospitals differ. */
export const inventoryCategories: InventoryCategoryConfig[] = [
  { id: "cat-medicines", name: "Medicines", group: "medical" },
  { id: "cat-surgical", name: "Surgical", group: "medical" },
  { id: "cat-laboratory", name: "Laboratory", group: "medical" },
  { id: "cat-ppe", name: "PPE", group: "medical" },
  { id: "cat-consumables", name: "Consumables", group: "medical" },
  { id: "cat-implants", name: "Implants", group: "medical" },
  { id: "cat-devices", name: "Devices & Equipment", group: "medical" },
  { id: "cat-cleaning", name: "Cleaning", group: "non-medical" },
  { id: "cat-office", name: "Office Supplies", group: "non-medical" },
  { id: "cat-maintenance", name: "Maintenance", group: "non-medical" },
  { id: "cat-other", name: "Other", group: "non-medical" },
  { id: "cat-surgical-instruments", name: "Instruments & Sets", group: "medical", parentId: "cat-surgical" },
  { id: "cat-wound-care", name: "Wound Care", group: "medical", parentId: "cat-consumables" },
];

export function getInventoryCategories() {
  return mockRequest(inventoryCategories);
}

export interface NewCategoryInput {
  name: string;
  group: ItemGroup;
  parentId?: string;
}

export function createInventoryCategory(input: NewCategoryInput) {
  const category: InventoryCategoryConfig = { ...input, id: `cat-${inventoryCategories.length + 1}` };
  inventoryCategories.push(category);
  recordInventoryAudit("Category added", "item", category.id, DEFAULT_ACTOR);
  return mockRequest(category);
}

export interface UomConversion {
  fromUnit: UnitOfMeasure;
  toUnit: UnitOfMeasure;
  factor: number;
}

/** Spec §5 example: 1 Carton -> 10 Boxes -> 100 Pieces. */
export const uomConversions: UomConversion[] = [
  { fromUnit: "carton", toUnit: "box", factor: 10 },
  { fromUnit: "box", toUnit: "piece", factor: 10 },
  { fromUnit: "kit", toUnit: "piece", factor: 1 },
  { fromUnit: "pack", toUnit: "piece", factor: 20 },
];

export function getUomConversions() {
  return mockRequest(uomConversions);
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  category: ItemCategory;
  subcategory?: string;
  brand?: string;
  manufacturer?: string;
  model?: string;
  baseUnit: UnitOfMeasure;
  purchaseUnit?: UnitOfMeasure;
  manufacturerCode?: string;
  gtin?: string;
  barcode?: string;
  isSerialTracked: boolean;
  isBatchTracked: boolean;
  isImplant: boolean;
  reorderLevel: number;
  reorderQuantity: number;
  maxStockLevel: number;
  unitCost: number;
  status: ItemStatus;
  createdAt: string;
}

export const inventoryItems: InventoryItem[] = [
  { id: "item-1", itemCode: "INV-0001", name: "Surgical Gloves (Sterile)", description: "Latex-free sterile surgical gloves, size 7.5", category: "surgical", subcategory: "Instruments & Sets", manufacturer: "Ansell", baseUnit: "pack", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 40, reorderQuantity: 100, maxStockLevel: 400, unitCost: 6.5, status: "active", createdAt: "2025-01-10" },
  { id: "item-2", itemCode: "INV-0002", name: "Absorbable Sutures 3-0", description: "Polyglactin absorbable suture, 3-0, 70cm", category: "surgical", manufacturer: "Ethicon", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 20, reorderQuantity: 50, maxStockLevel: 200, unitCost: 45.0, status: "active", createdAt: "2025-01-10" },
  { id: "item-3", itemCode: "INV-0003", name: "Sterile Surgical Drapes", description: "Disposable fenestrated surgical drape, large", category: "surgical", manufacturer: "3M", baseUnit: "piece", purchaseUnit: "pack", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 30, reorderQuantity: 80, maxStockLevel: 300, unitCost: 3.2, status: "active", createdAt: "2025-01-10" },
  { id: "item-4", itemCode: "INV-0004", name: "Scalpel Blades #22", description: "Disposable stainless steel scalpel blade, size 22", category: "surgical", manufacturer: "Swann-Morton", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 15, reorderQuantity: 40, maxStockLevel: 150, unitCost: 12.0, status: "active", createdAt: "2025-01-10" },
  { id: "item-5", itemCode: "INV-0005", name: "IV Cannula 20G", description: "Peripheral IV cannula, 20 gauge", category: "medical-supply", manufacturer: "BD", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 50, reorderQuantity: 150, maxStockLevel: 500, unitCost: 8.4, status: "active", createdAt: "2025-01-10" },
  { id: "item-6", itemCode: "INV-0006", name: "Disposable Syringe 10mL", description: "Single-use syringe with needle, 10mL", category: "medical-supply", manufacturer: "BD", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 60, reorderQuantity: 200, maxStockLevel: 600, unitCost: 5.6, status: "active", createdAt: "2025-01-10" },
  { id: "item-7", itemCode: "INV-0007", name: "Hypodermic Needles 21G", description: "Single-use hypodermic needle, 21 gauge", category: "medical-supply", manufacturer: "BD", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 60, reorderQuantity: 200, maxStockLevel: 600, unitCost: 4.1, status: "active", createdAt: "2025-01-10" },
  { id: "item-8", itemCode: "INV-0008", name: "IV Infusion Set", description: "Gravity IV administration set, 20 drop", category: "medical-supply", manufacturer: "B. Braun", baseUnit: "piece", purchaseUnit: "box", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 40, reorderQuantity: 120, maxStockLevel: 400, unitCost: 2.1, status: "active", createdAt: "2025-01-10" },
  { id: "item-9", itemCode: "INV-0009", name: "Foley Catheter 16Fr", description: "2-way silicone Foley catheter, 16 French", category: "medical-supply", manufacturer: "Coloplast", baseUnit: "piece", purchaseUnit: "box", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 15, reorderQuantity: 40, maxStockLevel: 150, unitCost: 9.8, status: "active", createdAt: "2025-01-10" },
  { id: "item-10", itemCode: "INV-0010", name: "Nasogastric Tube 14Fr", description: "PVC nasogastric feeding tube, 14 French", category: "medical-supply", manufacturer: "Vygon", baseUnit: "piece", purchaseUnit: "box", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 10, reorderQuantity: 30, maxStockLevel: 120, unitCost: 4.5, status: "active", createdAt: "2025-01-10" },
  { id: "item-11", itemCode: "INV-0011", name: "N95 Respirator Mask", description: "NIOSH-approved N95 filtering facepiece respirator", category: "ppe", manufacturer: "3M", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 80, reorderQuantity: 250, maxStockLevel: 1000, unitCost: 0.85, status: "active", createdAt: "2025-01-10" },
  { id: "item-12", itemCode: "INV-0012", name: "Surgical Isolation Gown", description: "Disposable Level 3 fluid-resistant isolation gown", category: "ppe", manufacturer: "Kimberly-Clark", baseUnit: "piece", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 60, reorderQuantity: 200, maxStockLevel: 800, unitCost: 3.4, status: "active", createdAt: "2025-01-10" },
  { id: "item-13", itemCode: "INV-0013", name: "Face Shield", description: "Reusable full-face protective shield", category: "ppe", manufacturer: "Honeywell", baseUnit: "piece", purchaseUnit: "box", isSerialTracked: false, isBatchTracked: false, isImplant: false, reorderLevel: 20, reorderQuantity: 60, maxStockLevel: 200, unitCost: 2.5, status: "active", createdAt: "2025-01-10" },
  { id: "item-14", itemCode: "INV-0014", name: "Nitrile Examination Gloves", description: "Powder-free nitrile exam gloves, medium", category: "ppe", manufacturer: "Ansell", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 100, reorderQuantity: 300, maxStockLevel: 1200, unitCost: 4.9, status: "active", createdAt: "2025-01-10" },
  { id: "item-15", itemCode: "INV-0015", name: "Vacutainer Blood Collection Tubes", description: "EDTA vacutainer tube, 4mL, lavender top", category: "laboratory", manufacturer: "BD", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 30, reorderQuantity: 100, maxStockLevel: 400, unitCost: 11.0, status: "active", createdAt: "2025-01-10" },
  { id: "item-16", itemCode: "INV-0016", name: "Glucose Reagent Kit", description: "Enzymatic glucose oxidase reagent kit, 100 tests", category: "laboratory", manufacturer: "Roche Diagnostics", baseUnit: "kit", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 8, reorderQuantity: 20, maxStockLevel: 80, unitCost: 65.0, status: "active", createdAt: "2025-01-10" },
  { id: "item-17", itemCode: "INV-0017", name: "Microscope Slides", description: "Frosted-end glass microscope slides", category: "laboratory", manufacturer: "Corning", baseUnit: "box", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: false, isImplant: false, reorderLevel: 10, reorderQuantity: 30, maxStockLevel: 100, unitCost: 9.2, status: "active", createdAt: "2025-01-10" },
  { id: "item-18", itemCode: "INV-0018", name: "Orthopedic Hip Implant System", description: "Titanium total hip arthroplasty implant set", category: "implant", manufacturer: "Zimmer Biomet", baseUnit: "kit", isSerialTracked: true, isBatchTracked: false, isImplant: true, reorderLevel: 2, reorderQuantity: 4, maxStockLevel: 12, unitCost: 3200.0, status: "active", createdAt: "2025-02-01" },
  { id: "item-19", itemCode: "INV-0019", name: "Coronary Drug-Eluting Stent", description: "Cobalt-chromium drug-eluting coronary stent, 3.0x18mm", category: "implant", manufacturer: "Medtronic", baseUnit: "piece", isSerialTracked: true, isBatchTracked: true, isImplant: true, reorderLevel: 5, reorderQuantity: 10, maxStockLevel: 30, unitCost: 950.0, status: "active", createdAt: "2025-02-01" },
  { id: "item-20", itemCode: "INV-0020", name: "Infusion Pump", description: "Volumetric IV infusion pump with dose-error reduction", category: "equipment", manufacturer: "Baxter", baseUnit: "piece", isSerialTracked: true, isBatchTracked: false, isImplant: false, reorderLevel: 2, reorderQuantity: 4, maxStockLevel: 20, unitCost: 1850.0, status: "active", createdAt: "2025-01-15" },
  { id: "item-21", itemCode: "INV-0021", name: "Multi-Parameter Patient Monitor", description: "Bedside monitor: ECG, SpO2, NIBP, temperature", category: "equipment", manufacturer: "Philips", baseUnit: "piece", isSerialTracked: true, isBatchTracked: false, isImplant: false, reorderLevel: 1, reorderQuantity: 2, maxStockLevel: 15, unitCost: 4200.0, status: "active", createdAt: "2025-01-15" },
  { id: "item-22", itemCode: "INV-0022", name: "Wheelchair (Standard)", description: "Folding standard hospital wheelchair", category: "equipment", manufacturer: "Drive Medical", baseUnit: "piece", isSerialTracked: true, isBatchTracked: false, isImplant: false, reorderLevel: 2, reorderQuantity: 4, maxStockLevel: 25, unitCost: 210.0, status: "active", createdAt: "2025-01-15" },
  { id: "item-23", itemCode: "INV-0023", name: "Surface Disinfectant Solution", description: "Hospital-grade chlorine-based surface disinfectant, 5L", category: "general", subcategory: "Cleaning", manufacturer: "Ecolab", baseUnit: "bottle", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: true, isImplant: false, reorderLevel: 20, reorderQuantity: 60, maxStockLevel: 200, unitCost: 14.5, status: "active", createdAt: "2025-01-10" },
  { id: "item-24", itemCode: "INV-0024", name: "A4 Printer Paper", description: "80gsm A4 office printer paper, 500 sheets/ream", category: "general", subcategory: "Office Supplies", manufacturer: "Local Generics", baseUnit: "pack", purchaseUnit: "carton", isSerialTracked: false, isBatchTracked: false, isImplant: false, reorderLevel: 15, reorderQuantity: 40, maxStockLevel: 150, unitCost: 3.8, status: "active", createdAt: "2025-01-10" },
];

export function getInventoryItems(filters: { category?: ItemCategory; includeInactive?: boolean; search?: string } = {}) {
  let rows = filters.includeInactive ? inventoryItems : inventoryItems.filter((i) => i.status === "active");
  if (filters.category) rows = rows.filter((i) => i.category === filters.category);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((i) => i.name.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q) || (i.barcode ?? "").toLowerCase().includes(q) || (i.manufacturer ?? "").toLowerCase().includes(q));
  }
  return mockRequest(rows);
}

export function getInventoryItem(itemId: string) {
  return mockRequest(inventoryItems.find((i) => i.id === itemId) ?? null);
}

export interface NewInventoryItemInput {
  name: string;
  description?: string;
  category: ItemCategory;
  subcategory?: string;
  brand?: string;
  manufacturer?: string;
  model?: string;
  baseUnit: UnitOfMeasure;
  purchaseUnit?: UnitOfMeasure;
  manufacturerCode?: string;
  gtin?: string;
  barcode?: string;
  isSerialTracked: boolean;
  isBatchTracked: boolean;
  isImplant: boolean;
  reorderLevel: number;
  reorderQuantity: number;
  maxStockLevel: number;
  unitCost: number;
}

export function createInventoryItem(input: NewInventoryItemInput) {
  const item: InventoryItem = { ...input, id: `item-${inventoryItems.length + 1}`, itemCode: `INV-${String(inventoryItems.length + 1).padStart(4, "0")}`, status: "active", createdAt: TODAY };
  inventoryItems.push(item);
  recordInventoryAudit("Item added to catalog", "item", item.itemCode, DEFAULT_ACTOR);
  return mockRequest(item);
}

export function updateInventoryItem(itemId: string, input: Partial<NewInventoryItemInput>) {
  const item = inventoryItems.find((i) => i.id === itemId);
  if (!item) return mockRequest(null);
  Object.assign(item, input);
  recordInventoryAudit("Item details updated", "item", item.itemCode, DEFAULT_ACTOR);
  return mockRequest(item);
}

export function setInventoryItemStatus(itemId: string, status: ItemStatus) {
  const item = inventoryItems.find((i) => i.id === itemId);
  if (!item) return mockRequest(null);
  item.status = status;
  recordInventoryAudit(`Item marked ${status}`, "item", item.itemCode, DEFAULT_ACTOR);
  return mockRequest(item);
}

// --- Warehouses & Storage Locations (spec §10-11) ----------------------------

export type WarehouseType = "central" | "pharmacy-store" | "emergency-store" | "icu-store" | "ot-store" | "laboratory-store" | "ward-store";

export interface Warehouse {
  id: string;
  name: string;
  type: WarehouseType;
  building?: string;
  floor?: string;
  room?: string;
  managerId?: string;
  status: "active" | "inactive";
}

export const warehouses: Warehouse[] = [
  { id: "wh-central", name: "Central Warehouse", type: "central", building: "Support Block", floor: "B1", room: "Main Store", managerId: "waqas-anjum", status: "active" },
  { id: "wh-emergency", name: "Emergency Store", type: "emergency-store", building: "Main Campus", floor: "Ground", room: "ER Supply Room", managerId: "hira-shahid", status: "active" },
  { id: "wh-icu", name: "ICU Store", type: "icu-store", building: "Main Campus", floor: "3", room: "ICU Supply Room", managerId: "hira-shahid", status: "active" },
  { id: "wh-ot", name: "OT Store", type: "ot-store", building: "Main Campus", floor: "4", room: "OT Sterile Store", managerId: "hira-shahid", status: "active" },
  { id: "wh-lab", name: "Laboratory Store", type: "laboratory-store", building: "Main Campus", floor: "1", room: "Lab Supply Room", managerId: "hira-shahid", status: "active" },
  { id: "wh-ward", name: "Ward Store", type: "ward-store", building: "Main Campus", floor: "2", room: "Ward Supply Room", managerId: "hira-shahid", status: "active" },
];

export function getWarehouses() {
  return mockRequest(warehouses.map((w) => ({ ...w, managerName: resolveStaffName(w.managerId) })));
}

export interface StorageLocation {
  id: string;
  warehouseId: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  label: string;
}

function makeLocation(id: string, warehouseId: string, aisle: string, rack: string, shelf: string, bin: string): StorageLocation {
  return { id, warehouseId, aisle, rack, shelf, bin, label: `${aisle}-${rack}-${shelf}-${bin}` };
}

export const storageLocations: StorageLocation[] = [
  makeLocation("loc-1", "wh-central", "A1", "R1", "S1", "B1"),
  makeLocation("loc-2", "wh-central", "A1", "R1", "S2", "B1"),
  makeLocation("loc-3", "wh-central", "A1", "R2", "S1", "B1"),
  makeLocation("loc-4", "wh-central", "A2", "R1", "S1", "B1"),
  makeLocation("loc-5", "wh-central", "A2", "R1", "S1", "B2"),
  makeLocation("loc-6", "wh-central", "A3", "R1", "S1", "B1"),
  makeLocation("loc-7", "wh-central", "A3", "R2", "S1", "B1"),
  makeLocation("loc-8", "wh-emergency", "E1", "R1", "S1", "B1"),
  makeLocation("loc-9", "wh-icu", "I1", "R1", "S1", "B1"),
  makeLocation("loc-10", "wh-ot", "O1", "R1", "S1", "B1"),
  makeLocation("loc-11", "wh-ot", "O1", "R1", "S2", "B1"),
  makeLocation("loc-12", "wh-lab", "L1", "R1", "S1", "B1"),
  makeLocation("loc-13", "wh-ward", "W1", "R1", "S1", "B1"),
];

export function getStorageLocations(warehouseId?: string) {
  const rows = warehouseId ? storageLocations.filter((l) => l.warehouseId === warehouseId) : storageLocations;
  return mockRequest(rows);
}

export interface NewWarehouseInput {
  name: string;
  type: WarehouseType;
  building?: string;
  floor?: string;
  room?: string;
  managerId?: string;
}

export function createWarehouse(input: NewWarehouseInput) {
  const warehouse: Warehouse = { ...input, id: `wh-${warehouses.length + 1}`, status: "active" };
  warehouses.push(warehouse);
  recordInventoryAudit("Warehouse added", "warehouse", warehouse.id, DEFAULT_ACTOR);
  return mockRequest(warehouse);
}

export interface NewStorageLocationInput {
  warehouseId: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
}

export function createStorageLocation(input: NewStorageLocationInput) {
  const label = [input.aisle, input.rack, input.shelf, input.bin].filter(Boolean).join("-") || `LOC-${storageLocations.length + 1}`;
  const location: StorageLocation = { ...input, id: `loc-${storageLocations.length + 1}`, label };
  storageLocations.push(location);
  recordInventoryAudit("Storage location added", "warehouse", location.id, DEFAULT_ACTOR, label);
  return mockRequest(location);
}

// --- Batch Management (spec §12, §14, §15 FEFO) ------------------------------

export type InventoryBatchStatus = "available" | "low" | "quarantined" | "expired" | "damaged" | "disposed" | "returned";

export interface InventoryBatch {
  id: string;
  batchNumber: string;
  itemId: string;
  manufacturingDate?: string;
  expiryDate?: string;
  quantity: number;
  unitCost: number;
  supplierId?: string;
  warehouseId: string;
  locationId?: string;
  status: InventoryBatchStatus;
  receivedAt: string;
  quarantineReason?: string;
}

function batchStatusFromQuantity(item: InventoryItem, quantity: number, expiryDate?: string): InventoryBatchStatus {
  if (expiryDate && daysUntil(expiryDate) < 0) return "expired";
  if (quantity <= item.reorderLevel * 0.3) return "low";
  return "available";
}

export const inventoryBatches: InventoryBatch[] = [
  { id: "batch-1", batchNumber: "BN-2026-0001", itemId: "item-1", manufacturingDate: "2025-06-01", expiryDate: "2028-06-01", quantity: 120, unitCost: 6.2, supplierId: "sup-1", warehouseId: "wh-central", locationId: "loc-1", status: "available", receivedAt: "2026-06-01" },
  { id: "batch-2", batchNumber: "BN-2026-0002", itemId: "item-2", manufacturingDate: "2025-03-01", expiryDate: "2027-03-01", quantity: 45, unitCost: 43.0, supplierId: "sup-1", warehouseId: "wh-central", locationId: "loc-1", status: "available", receivedAt: "2026-03-05" },
  { id: "batch-3", batchNumber: "BN-2026-0003", itemId: "item-3", manufacturingDate: "2025-05-01", expiryDate: "2028-05-01", quantity: 210, unitCost: 3.0, supplierId: "sup-2", warehouseId: "wh-ot", locationId: "loc-10", status: "available", receivedAt: "2026-05-01" },
  { id: "batch-4", batchNumber: "BN-2026-0004", itemId: "item-4", manufacturingDate: "2025-04-01", expiryDate: "2029-04-01", quantity: 38, unitCost: 11.5, supplierId: "sup-1", warehouseId: "wh-ot", locationId: "loc-10", status: "available", receivedAt: "2026-04-01" },
  { id: "batch-5", batchNumber: "BN-2026-0005", itemId: "item-5", manufacturingDate: "2025-06-01", expiryDate: "2028-06-01", quantity: 160, unitCost: 8.0, supplierId: "sup-2", warehouseId: "wh-central", locationId: "loc-2", status: "available", receivedAt: "2026-06-01" },
  { id: "batch-6", batchNumber: "BN-2026-0006", itemId: "item-6", manufacturingDate: "2025-06-15", expiryDate: "2028-06-15", quantity: 300, unitCost: 5.3, supplierId: "sup-2", warehouseId: "wh-central", locationId: "loc-2", status: "available", receivedAt: "2026-06-15" },
  { id: "batch-7", batchNumber: "BN-2026-0007", itemId: "item-7", manufacturingDate: "2025-06-15", expiryDate: "2028-06-15", quantity: 15, unitCost: 3.9, supplierId: "sup-2", warehouseId: "wh-central", locationId: "loc-2", status: "low", receivedAt: "2026-06-15" },
  { id: "batch-8", batchNumber: "BN-2026-0008", itemId: "item-8", manufacturingDate: "2025-01-01", expiryDate: "2026-08-25", quantity: 55, unitCost: 2.0, supplierId: "sup-2", warehouseId: "wh-icu", locationId: "loc-9", status: "available", receivedAt: "2026-01-05" },
  { id: "batch-9", batchNumber: "BN-2026-0009", itemId: "item-9", manufacturingDate: "2025-02-01", expiryDate: "2028-02-01", quantity: 25, unitCost: 9.4, supplierId: "sup-1", warehouseId: "wh-central", locationId: "loc-3", status: "available", receivedAt: "2026-02-01" },
  { id: "batch-10", batchNumber: "BN-2026-0010", itemId: "item-10", manufacturingDate: "2025-02-01", expiryDate: "2026-09-10", quantity: 18, unitCost: 4.3, supplierId: "sup-1", warehouseId: "wh-central", locationId: "loc-3", status: "available", receivedAt: "2026-02-01" },
  { id: "batch-11", batchNumber: "BN-2026-0011", itemId: "item-11", manufacturingDate: "2025-01-01", expiryDate: "2029-01-01", quantity: 420, unitCost: 0.78, supplierId: "sup-3", warehouseId: "wh-central", locationId: "loc-4", status: "available", receivedAt: "2026-01-10" },
  { id: "batch-12", batchNumber: "BN-2026-0012", itemId: "item-12", manufacturingDate: "2025-01-01", expiryDate: "2029-01-01", quantity: 190, unitCost: 3.1, supplierId: "sup-3", warehouseId: "wh-central", locationId: "loc-4", status: "available", receivedAt: "2026-01-10" },
  { id: "batch-13", batchNumber: "BN-2026-0013", itemId: "item-14", manufacturingDate: "2025-01-01", expiryDate: "2026-08-30", quantity: 260, unitCost: 4.5, supplierId: "sup-3", warehouseId: "wh-central", locationId: "loc-5", status: "available", receivedAt: "2026-01-10" },
  { id: "batch-14", batchNumber: "BN-2026-0014", itemId: "item-15", manufacturingDate: "2025-07-01", expiryDate: "2027-07-01", quantity: 90, unitCost: 10.5, supplierId: "sup-4", warehouseId: "wh-lab", locationId: "loc-12", status: "available", receivedAt: "2026-07-01" },
  { id: "batch-15", batchNumber: "BN-2026-0015", itemId: "item-16", manufacturingDate: "2025-05-01", expiryDate: "2026-09-01", quantity: 14, unitCost: 62.0, supplierId: "sup-4", warehouseId: "wh-lab", locationId: "loc-12", status: "available", receivedAt: "2026-05-01" },
  { id: "batch-16", batchNumber: "BN-2026-0016", itemId: "item-19", manufacturingDate: "2025-03-01", expiryDate: "2027-09-01", quantity: 12, unitCost: 900.0, supplierId: "sup-5", warehouseId: "wh-ot", locationId: "loc-11", status: "available", receivedAt: "2026-03-05" },
  { id: "batch-17", batchNumber: "BN-2026-0017", itemId: "item-23", manufacturingDate: "2025-06-01", expiryDate: "2027-06-01", quantity: 70, unitCost: 13.0, supplierId: "sup-2", warehouseId: "wh-central", locationId: "loc-6", status: "available", receivedAt: "2026-06-01" },
  { id: "batch-18", batchNumber: "BN-2026-0018", itemId: "item-24", quantity: 55, unitCost: 3.5, supplierId: "sup-6", warehouseId: "wh-central", locationId: "loc-7", status: "available", receivedAt: "2026-02-01" },
  { id: "batch-19", batchNumber: "BN-2025-0091", itemId: "item-9", manufacturingDate: "2024-06-01", expiryDate: "2026-07-15", quantity: 6, unitCost: 9.4, supplierId: "sup-1", warehouseId: "wh-central", locationId: "loc-3", status: "expired", receivedAt: "2025-06-01" },
  { id: "batch-20", batchNumber: "BN-2025-0092", itemId: "item-1", manufacturingDate: "2024-11-01", expiryDate: "2027-11-01", quantity: 30, unitCost: 6.2, supplierId: "sup-1", warehouseId: "wh-central", locationId: "loc-1", status: "quarantined", receivedAt: "2025-11-01", quarantineReason: "Damaged outer carton on inspection" },
  { id: "batch-21", batchNumber: "BN-2025-0093", itemId: "item-5", manufacturingDate: "2024-09-01", expiryDate: "2027-09-01", quantity: 10, unitCost: 8.0, supplierId: "sup-2", warehouseId: "wh-central", locationId: "loc-2", status: "damaged", receivedAt: "2025-09-01" },
];

export function getInventoryBatches(filters: { itemId?: string; warehouseId?: string; status?: InventoryBatchStatus; search?: string } = {}) {
  let rows = [...inventoryBatches];
  if (filters.itemId) rows = rows.filter((b) => b.itemId === filters.itemId);
  if (filters.warehouseId) rows = rows.filter((b) => b.warehouseId === filters.warehouseId);
  if (filters.status) rows = rows.filter((b) => b.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((b) => b.batchNumber.toLowerCase().includes(q) || (inventoryItems.find((i) => i.id === b.itemId)?.name.toLowerCase() ?? "").includes(q));
  }
  return mockRequest(
    rows.map((b) => ({
      ...b,
      itemName: inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Unknown Item",
      itemCode: inventoryItems.find((i) => i.id === b.itemId)?.itemCode ?? "",
      warehouseName: warehouses.find((w) => w.id === b.warehouseId)?.name ?? "Unknown",
      daysToExpiry: b.expiryDate ? daysUntil(b.expiryDate) : undefined,
    }))
  );
}

export function getExpiringInventoryBatches(withinDays: number) {
  const rows = inventoryBatches.filter((b) => b.status !== "expired" && b.status !== "disposed" && b.expiryDate && daysUntil(b.expiryDate) <= withinDays && daysUntil(b.expiryDate) >= 0);
  return mockRequest(
    rows.map((b) => ({ ...b, itemName: inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Unknown Item", daysToExpiry: daysUntil(b.expiryDate) }))
  );
}

/** FEFO (spec §15): earliest expiry batch with available stock, for a given item + warehouse. */
export function pickFefoBatch(itemId: string, warehouseId?: string): InventoryBatch | undefined {
  return inventoryBatches
    .filter((b) => b.itemId === itemId && b.quantity > 0 && (b.status === "available" || b.status === "low") && (!warehouseId || b.warehouseId === warehouseId))
    .sort((a, b) => (a.expiryDate ?? "9999-12-31").localeCompare(b.expiryDate ?? "9999-12-31"))[0];
}

export function quarantineInventoryBatch(batchId: string, reason: string, actor = DEFAULT_ACTOR) {
  const batch = inventoryBatches.find((b) => b.id === batchId);
  if (!batch) return mockRequest(null);
  batch.status = "quarantined";
  batch.quarantineReason = reason;
  recordStockMovement(batch.itemId, batchId, "adjustment", 0, actor, "batch", batchId, batch.warehouseId, batch.warehouseId);
  recordInventoryAudit(`Batch quarantined: ${reason}`, "batch", batch.batchNumber, actor);
  return mockRequest(batch);
}

export function releaseBatchFromQuarantine(batchId: string, actor = DEFAULT_ACTOR) {
  const batch = inventoryBatches.find((b) => b.id === batchId);
  if (!batch) return mockRequest(null);
  const item = inventoryItems.find((i) => i.id === batch.itemId)!;
  batch.status = batchStatusFromQuantity(item, batch.quantity, batch.expiryDate);
  batch.quarantineReason = undefined;
  recordInventoryAudit("Batch released from quarantine", "batch", batch.batchNumber, actor);
  return mockRequest(batch);
}

export function markInventoryBatchExpired(batchId: string, actor = DEFAULT_ACTOR) {
  const batch = inventoryBatches.find((b) => b.id === batchId);
  if (!batch) return mockRequest(null);
  batch.status = "expired";
  recordStockMovement(batch.itemId, batchId, "expiry", 0, actor, "batch", batchId, batch.warehouseId, undefined);
  recordInventoryAudit("Batch marked expired", "batch", batch.batchNumber, actor);
  return mockRequest(batch);
}

// --- Serialized Asset / Implant Tracking (spec §13, §38) ---------------------

export type AssetStatus = "in-stock" | "issued" | "in-use" | "under-maintenance" | "retired" | "lost";

export interface SerializedAsset {
  id: string;
  itemId: string;
  serialNumber: string;
  lotNumber?: string;
  expiryDate?: string;
  warehouseId: string;
  locationId?: string;
  status: AssetStatus;
  assignedTo?: string;
  receivedAt: string;
}

export const serializedAssets: SerializedAsset[] = [
  { id: "asset-1", itemId: "item-18", serialNumber: "HIP-SN-88213", lotNumber: "LOT-HIP-0417", expiryDate: "2029-01-01", warehouseId: "wh-ot", locationId: "loc-11", status: "in-stock", receivedAt: "2026-02-05" },
  { id: "asset-2", itemId: "item-18", serialNumber: "HIP-SN-88214", lotNumber: "LOT-HIP-0417", expiryDate: "2029-01-01", warehouseId: "wh-ot", locationId: "loc-11", status: "in-stock", receivedAt: "2026-02-05" },
  { id: "asset-3", itemId: "item-18", serialNumber: "HIP-SN-88190", lotNumber: "LOT-HIP-0390", expiryDate: "2028-06-01", warehouseId: "wh-ot", locationId: "loc-11", status: "in-use", receivedAt: "2025-11-01" },
  { id: "asset-4", itemId: "item-19", serialNumber: "STENT-SN-30021", lotNumber: "BN-2026-0016", expiryDate: "2027-09-01", warehouseId: "wh-ot", locationId: "loc-11", status: "in-stock", receivedAt: "2026-03-05" },
  { id: "asset-5", itemId: "item-20", serialNumber: "PUMP-SN-5501", warehouseId: "wh-central", locationId: "loc-6", status: "in-stock", receivedAt: "2026-01-15" },
  { id: "asset-6", itemId: "item-20", serialNumber: "PUMP-SN-5502", warehouseId: "wh-icu", locationId: "loc-9", status: "in-use", assignedTo: "dept-icu", receivedAt: "2026-01-15" },
  { id: "asset-7", itemId: "item-20", serialNumber: "PUMP-SN-5503", warehouseId: "wh-icu", locationId: "loc-9", status: "under-maintenance", receivedAt: "2026-01-15" },
  { id: "asset-8", itemId: "item-21", serialNumber: "MON-SN-7701", warehouseId: "wh-icu", locationId: "loc-9", status: "in-use", assignedTo: "dept-icu", receivedAt: "2025-12-01" },
  { id: "asset-9", itemId: "item-21", serialNumber: "MON-SN-7702", warehouseId: "wh-central", locationId: "loc-6", status: "in-stock", receivedAt: "2025-12-01" },
  { id: "asset-10", itemId: "item-22", serialNumber: "WHC-SN-1201", warehouseId: "wh-central", locationId: "loc-6", status: "in-stock", receivedAt: "2026-01-20" },
  { id: "asset-11", itemId: "item-22", serialNumber: "WHC-SN-1202", warehouseId: "wh-ward", locationId: "loc-13", status: "in-use", assignedTo: "dept-icu", receivedAt: "2026-01-20" },
];

export function getSerializedAssets(filters: { itemId?: string; status?: AssetStatus; search?: string } = {}) {
  let rows = [...serializedAssets];
  if (filters.itemId) rows = rows.filter((a) => a.itemId === filters.itemId);
  if (filters.status) rows = rows.filter((a) => a.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((a) => a.serialNumber.toLowerCase().includes(q) || (a.lotNumber ?? "").toLowerCase().includes(q));
  }
  return mockRequest(
    rows.map((a) => ({
      ...a,
      itemName: inventoryItems.find((i) => i.id === a.itemId)?.name ?? "Unknown Item",
      warehouseName: warehouses.find((w) => w.id === a.warehouseId)?.name ?? "Unknown",
      assignedToName: a.assignedTo ? resolveDepartmentName(a.assignedTo) : undefined,
    }))
  );
}

export function updateAssetStatus(assetId: string, status: AssetStatus, actor = DEFAULT_ACTOR) {
  const asset = serializedAssets.find((a) => a.id === assetId);
  if (!asset) return mockRequest(null);
  asset.status = status;
  recordInventoryAudit(`Asset marked ${status}`, "asset", asset.serialNumber, actor);
  return mockRequest(asset);
}

export interface ImplantUsageRecord {
  id: string;
  itemId: string;
  assetId?: string;
  serialNumber?: string;
  lotNumber?: string;
  expiryDate?: string;
  patientId: string;
  procedureName: string;
  surgeonId?: string;
  dateUsed: string;
  recordedBy: string;
}

export const implantUsageRecords: ImplantUsageRecord[] = [
  { id: "implant-use-1", itemId: "item-18", assetId: "asset-3", serialNumber: "HIP-SN-88190", lotNumber: "LOT-HIP-0390", expiryDate: "2028-06-01", patientId: "p-hamza-butt", procedureName: "Total Hip Arthroplasty", surgeonId: "sarah-jenkins", dateUsed: "2026-08-10", recordedBy: "hira-shahid" },
];

/** Patient <- Encounter <- Procedure <- Item <- Batch/Serial <- Supplier traceability (spec §37-38). */
export function recordInventoryImplantUsage(input: { itemId: string; assetId?: string; patientId: string; procedureName: string; surgeonId?: string; actor?: string }) {
  const asset = input.assetId ? serializedAssets.find((a) => a.id === input.assetId) : undefined;
  const record: ImplantUsageRecord = {
    id: `implant-use-${implantUsageRecords.length + 1}`,
    itemId: input.itemId,
    assetId: input.assetId,
    serialNumber: asset?.serialNumber,
    lotNumber: asset?.lotNumber,
    expiryDate: asset?.expiryDate,
    patientId: input.patientId,
    procedureName: input.procedureName,
    surgeonId: input.surgeonId,
    dateUsed: NOW,
    recordedBy: input.actor ?? DEFAULT_ACTOR,
  };
  implantUsageRecords.push(record);
  if (asset) asset.status = "in-use";
  recordStockMovement(input.itemId, undefined, "requisition-issue", -1, record.recordedBy, "implant-usage", record.id, asset?.warehouseId, undefined);
  recordInventoryAudit("Implant usage recorded against patient", "implant-usage", record.id, record.recordedBy, `${input.procedureName} — ${resolvePatientName(input.patientId)}`);
  return mockRequest(record);
}

export function getImplantUsageRecords(filters: { itemId?: string; patientId?: string } = {}) {
  let rows = [...implantUsageRecords];
  if (filters.itemId) rows = rows.filter((r) => r.itemId === filters.itemId);
  if (filters.patientId) rows = rows.filter((r) => r.patientId === filters.patientId);
  return mockRequest(
    rows.map((r) => ({ ...r, itemName: inventoryItems.find((i) => i.id === r.itemId)?.name ?? "Unknown Item", patientName: resolvePatientName(r.patientId), surgeonName: resolveStaffName(r.surgeonId) }))
  );
}

// --- Stock Movement Ledger (spec §16) ----------------------------------------

export type StockMovementType = "purchase-receipt" | "transfer-in" | "transfer-out" | "return-in" | "return-out" | "requisition-issue" | "adjustment" | "disposal" | "expiry" | "damage" | "count-correction";

export interface StockMovement {
  id: string;
  timestamp: string;
  itemId: string;
  batchId?: string;
  movementType: StockMovementType;
  quantityChange: number;
  fromLocation?: string;
  toLocation?: string;
  actor: string;
  referenceType?: string;
  referenceId?: string;
}

export const stockMovements: StockMovement[] = [
  { id: "move-seed-1", timestamp: "2026-08-01T09:00:00", itemId: "item-1", batchId: "batch-1", movementType: "purchase-receipt", quantityChange: 120, toLocation: "wh-central", actor: DEFAULT_ACTOR, referenceType: "goods-receipt", referenceId: "GRN-2026-0001" },
  { id: "move-seed-2", timestamp: "2026-08-10T11:00:00", itemId: "item-18", movementType: "requisition-issue", quantityChange: -1, fromLocation: "wh-ot", actor: "hira-shahid", referenceType: "implant-usage", referenceId: "implant-use-1" },
];

function recordStockMovement(itemId: string, batchId: string | undefined, movementType: StockMovementType, quantityChange: number, actor: string, referenceType?: string, referenceId?: string, fromLocation?: string, toLocation?: string) {
  stockMovements.push({ id: `move-${stockMovements.length + 1}`, timestamp: NOW, itemId, batchId, movementType, quantityChange, fromLocation, toLocation, actor, referenceType, referenceId });
}

export function getStockMovements(filters: { itemId?: string; movementType?: StockMovementType; search?: string } = {}) {
  let rows = [...stockMovements].reverse();
  if (filters.itemId) rows = rows.filter((m) => m.itemId === filters.itemId);
  if (filters.movementType) rows = rows.filter((m) => m.movementType === filters.movementType);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((m) => (inventoryItems.find((i) => i.id === m.itemId)?.name.toLowerCase() ?? "").includes(q) || (m.referenceId ?? "").toLowerCase().includes(q));
  }
  return mockRequest(
    rows.map((m) => ({
      ...m,
      itemName: inventoryItems.find((i) => i.id === m.itemId)?.name ?? "Unknown Item",
      fromLocationName: m.fromLocation ? warehouses.find((w) => w.id === m.fromLocation)?.name ?? m.fromLocation : undefined,
      toLocationName: m.toLocation ? warehouses.find((w) => w.id === m.toLocation)?.name ?? m.toLocation : undefined,
    }))
  );
}

// --- Stock Overview (spec §8-9) — every quantity computed live, never a
// decorative stored number. ---------------------------------------------------

export type StockStatus = "available" | "low-stock" | "out-of-stock" | "reserved" | "quarantined" | "damaged" | "expired" | "blocked" | "in-transit";

export interface ItemStockRow {
  itemId: string;
  itemName: string;
  itemCode: string;
  category: ItemCategory;
  onHand: number;
  available: number;
  reserved: number;
  allocated: number;
  damaged: number;
  quarantined: number;
  inTransit: number;
  onOrder: number;
  reorderLevel: number;
  status: StockStatus;
  primaryWarehouse?: string;
}

function computeOnOrderQuantity(itemId: string): number {
  return inventoryPurchaseOrders
    .filter((po) => po.status !== "cancelled")
    .flatMap((po) => po.items)
    .filter((line) => line.itemId === itemId)
    .reduce((sum, line) => sum + Math.max(0, line.quantityOrdered - line.quantityReceived), 0);
}

function computeInTransitQuantity(itemId: string): number {
  return inventoryStockTransfers
    .filter((t) => t.status === "shipped" || t.status === "in-transit")
    .flatMap((t) => t.items)
    .filter((line) => line.itemId === itemId)
    .reduce((sum, line) => sum + line.quantity, 0);
}

function computeReservedQuantity(itemId: string): number {
  return stockReservations.filter((r) => r.itemId === itemId && r.status === "active").reduce((sum, r) => sum + r.quantity, 0);
}

export function getStockOverview(filters: { category?: ItemCategory; status?: StockStatus; search?: string } = {}) {
  let rows: ItemStockRow[] = inventoryItems
    .filter((item) => item.status === "active")
    .map((item) => {
      let onHand = 0;
      let damaged = 0;
      let quarantined = 0;
      let primaryWarehouse: string | undefined;

      if (item.isSerialTracked) {
        const assets = serializedAssets.filter((a) => a.itemId === item.id);
        onHand = assets.filter((a) => a.status === "in-stock" || a.status === "in-use" || a.status === "under-maintenance").length;
        primaryWarehouse = assets[0] ? warehouses.find((w) => w.id === assets[0].warehouseId)?.name : undefined;
      } else {
        const batches = inventoryBatches.filter((b) => b.itemId === item.id);
        onHand = batches.filter((b) => b.status === "available" || b.status === "low").reduce((sum, b) => sum + b.quantity, 0);
        damaged = batches.filter((b) => b.status === "damaged").reduce((sum, b) => sum + b.quantity, 0);
        quarantined = batches.filter((b) => b.status === "quarantined").reduce((sum, b) => sum + b.quantity, 0);
        primaryWarehouse = batches[0] ? warehouses.find((w) => w.id === batches[0].warehouseId)?.name : undefined;
      }

      const reserved = computeReservedQuantity(item.id);
      const allocated = item.isSerialTracked ? serializedAssets.filter((a) => a.itemId === item.id && (a.status === "issued" || a.status === "in-use")).length : 0;
      const available = Math.max(0, onHand - reserved - quarantined - damaged);
      const inTransit = computeInTransitQuantity(item.id);
      const onOrder = computeOnOrderQuantity(item.id);

      let status: StockStatus = "available";
      if (onHand === 0) status = "out-of-stock";
      else if (quarantined > 0 && available === 0) status = "quarantined";
      else if (damaged > 0 && available === 0) status = "damaged";
      else if (available <= item.reorderLevel) status = "low-stock";

      return { itemId: item.id, itemName: item.name, itemCode: item.itemCode, category: item.category, onHand, available, reserved, allocated, damaged, quarantined, inTransit, onOrder, reorderLevel: item.reorderLevel, status, primaryWarehouse };
    });

  if (filters.category) rows = rows.filter((r) => r.category === filters.category);
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.itemName.toLowerCase().includes(q) || r.itemCode.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}

// --- Reservations (spec §30) --------------------------------------------------

export type ReservationStatus = "active" | "fulfilled" | "cancelled" | "expired";
export type ReservationReferenceType = "ot-case" | "requisition" | "other";

export interface StockReservation {
  id: string;
  itemId: string;
  quantity: number;
  reservedFor: string;
  referenceType: ReservationReferenceType;
  referenceId?: string;
  departmentId?: string;
  reservedBy: string;
  reservedAt: string;
  neededBy?: string;
  status: ReservationStatus;
}

export const stockReservations: StockReservation[] = [
  { id: "resv-1", itemId: "item-19", quantity: 3, reservedFor: "OT Case — Coronary Angioplasty (tomorrow)", referenceType: "ot-case", departmentId: "dept-ot", reservedBy: "hira-shahid", reservedAt: "2026-08-16T09:00:00", neededBy: "2026-08-18", status: "active" },
  { id: "resv-2", itemId: "item-2", quantity: 10, reservedFor: "OT Case — General Surgery List", referenceType: "ot-case", departmentId: "dept-ot", reservedBy: "hira-shahid", reservedAt: "2026-08-15T09:00:00", neededBy: "2026-08-17", status: "active" },
];

export interface NewReservationInput {
  itemId: string;
  quantity: number;
  reservedFor: string;
  referenceType: ReservationReferenceType;
  referenceId?: string;
  departmentId?: string;
  neededBy?: string;
}

export function createInventoryReservation(input: NewReservationInput, actor = DEFAULT_ACTOR) {
  const reservation: StockReservation = { ...input, id: `resv-${stockReservations.length + 1}`, reservedBy: actor, reservedAt: NOW, status: "active" };
  stockReservations.push(reservation);
  recordInventoryAudit("Stock reserved", "reservation", reservation.id, actor, `${input.quantity} x ${inventoryItems.find((i) => i.id === input.itemId)?.name ?? input.itemId} for ${input.reservedFor}`);
  return mockRequest(reservation);
}

export function fulfillInventoryReservation(reservationId: string, actor = DEFAULT_ACTOR) {
  const reservation = stockReservations.find((r) => r.id === reservationId);
  if (!reservation) return mockRequest(null);
  reservation.status = "fulfilled";
  recordInventoryAudit("Reservation fulfilled", "reservation", reservation.id, actor);
  return mockRequest(reservation);
}

export function cancelInventoryReservation(reservationId: string, actor = DEFAULT_ACTOR) {
  const reservation = stockReservations.find((r) => r.id === reservationId);
  if (!reservation) return mockRequest(null);
  reservation.status = "cancelled";
  recordInventoryAudit("Reservation cancelled", "reservation", reservation.id, actor);
  return mockRequest(reservation);
}

export function getInventoryReservations(filters: { status?: ReservationStatus } = {}) {
  let rows = [...stockReservations].reverse();
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  return mockRequest(rows.map((r) => ({ ...r, itemName: inventoryItems.find((i) => i.id === r.itemId)?.name ?? "Unknown Item", departmentName: r.departmentId ? resolveDepartmentName(r.departmentId) : undefined })));
}

// --- Requisitions (spec §17-19) -----------------------------------------------

export type RequisitionStatus = "draft" | "submitted" | "under-review" | "approved" | "picking" | "issued" | "received" | "rejected" | "cancelled" | "partially-fulfilled";
export type RequisitionPriority = "routine" | "urgent" | "emergency";

export interface RequisitionItemLine {
  itemId: string;
  quantityRequested: number;
  quantityApproved?: number;
  quantityIssued?: number;
}

export interface Requisition {
  id: string;
  requisitionNumber: string;
  departmentId: string;
  requestedBy: string;
  priority: RequisitionPriority;
  items: RequisitionItemLine[];
  reason: string;
  status: RequisitionStatus;
  createdAt: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  issuedBy?: string;
  issuedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  rejectionReason?: string;
}

export const requisitions: Requisition[] = [
  { id: "req-1", requisitionNumber: "REQ-2026-000001", departmentId: "dept-icu", requestedBy: "sarah-jenkins", priority: "urgent", items: [{ itemId: "item-8", quantityRequested: 20 }, { itemId: "item-6", quantityRequested: 30 }], reason: "Weekly ICU consumables restock", status: "submitted", createdAt: "2026-08-16T08:00:00" },
  { id: "req-2", requisitionNumber: "REQ-2026-000002", departmentId: "dept-emergency", requestedBy: "nadia-khokhar", priority: "emergency", items: [{ itemId: "item-11", quantityRequested: 40, quantityApproved: 40, quantityIssued: 40 }], reason: "PPE stock depleted on night shift", status: "issued", createdAt: "2026-08-14T20:00:00", reviewedBy: "waqas-anjum", approvedBy: "waqas-anjum", approvedAt: "2026-08-14T20:20:00", issuedBy: "hira-shahid", issuedAt: "2026-08-14T20:40:00" },
  { id: "req-3", requisitionNumber: "REQ-2026-000003", departmentId: "dept-laboratory", requestedBy: "usman-farooq", priority: "routine", items: [{ itemId: "item-15", quantityRequested: 20 }], reason: "Monthly lab consumables", status: "approved", createdAt: "2026-08-13T09:00:00", reviewedBy: "waqas-anjum", approvedBy: "waqas-anjum", approvedAt: "2026-08-13T10:00:00" },
];

export interface NewRequisitionInput {
  departmentId: string;
  requestedBy: string;
  priority: RequisitionPriority;
  items: { itemId: string; quantityRequested: number }[];
  reason: string;
}

export function createRequisition(input: NewRequisitionInput) {
  const requisition: Requisition = { ...input, id: `req-${requisitions.length + 1}`, requisitionNumber: `REQ-2026-${String(requisitions.length + 1).padStart(6, "0")}`, status: "submitted", createdAt: NOW };
  requisitions.push(requisition);
  recordInventoryAudit("Requisition submitted", "requisition", requisition.requisitionNumber, resolveStaffName(input.requestedBy) ?? input.requestedBy, input.reason);
  return mockRequest(requisition);
}

export function startRequisitionReview(requisitionId: string, actor = DEFAULT_ACTOR) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  req.status = "under-review";
  req.reviewedBy = actor;
  recordInventoryAudit("Requisition under review", "requisition", req.requisitionNumber, actor);
  return mockRequest(req);
}

export function approveRequisition(requisitionId: string, approvedQuantities: Record<string, number>, actor = DEFAULT_ACTOR) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  req.items = req.items.map((line) => ({ ...line, quantityApproved: approvedQuantities[line.itemId] ?? line.quantityRequested }));
  req.status = "approved";
  req.approvedBy = actor;
  req.approvedAt = NOW;
  recordInventoryAudit("Requisition approved", "requisition", req.requisitionNumber, actor);
  return mockRequest(req);
}

export function rejectRequisition(requisitionId: string, reason: string, actor = DEFAULT_ACTOR) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  req.status = "rejected";
  req.rejectionReason = reason;
  recordInventoryAudit(`Requisition rejected: ${reason}`, "requisition", req.requisitionNumber, actor);
  return mockRequest(req);
}

export function startPickingRequisition(requisitionId: string, actor = DEFAULT_ACTOR) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  req.status = "picking";
  recordInventoryAudit("Requisition picking started", "requisition", req.requisitionNumber, actor);
  return mockRequest(req);
}

/** Issue (spec §17 fulfillment step) — draws FEFO batches, decrements stock, logs movement per line. Also the source record for the "Stock Issues" screen. */
export function issueRequisition(requisitionId: string, actor = DEFAULT_ACTOR) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  let allFulfilled = true;
  req.items = req.items.map((line) => {
    const item = inventoryItems.find((i) => i.id === line.itemId)!;
    const wanted = line.quantityApproved ?? line.quantityRequested;
    let remaining = wanted;
    if (item.isBatchTracked) {
      while (remaining > 0) {
        const batch = pickFefoBatch(line.itemId);
        if (!batch) break;
        const draw = Math.min(remaining, batch.quantity);
        batch.quantity -= draw;
        if (batch.quantity === 0) batch.status = "available";
        else batch.status = batchStatusFromQuantity(item, batch.quantity, batch.expiryDate);
        recordStockMovement(line.itemId, batch.id, "requisition-issue", -draw, actor, "requisition", req.requisitionNumber, batch.warehouseId, req.departmentId);
        remaining -= draw;
      }
    } else {
      recordStockMovement(line.itemId, undefined, "requisition-issue", -wanted, actor, "requisition", req.requisitionNumber, undefined, req.departmentId);
      remaining = 0;
    }
    const issued = wanted - remaining;
    if (issued < wanted) allFulfilled = false;
    return { ...line, quantityIssued: issued };
  });
  req.status = allFulfilled ? "issued" : "partially-fulfilled";
  req.issuedBy = actor;
  req.issuedAt = NOW;
  recordInventoryAudit(`Requisition issued${allFulfilled ? "" : " (partial)"}`, "requisition", req.requisitionNumber, actor);
  return mockRequest(req);
}

export function receiveRequisition(requisitionId: string, actor = DEFAULT_ACTOR) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  req.status = "received";
  req.receivedBy = actor;
  req.receivedAt = NOW;
  recordInventoryAudit("Requisition receipt confirmed by department", "requisition", req.requisitionNumber, actor);
  return mockRequest(req);
}

export function cancelRequisition(requisitionId: string, actor = DEFAULT_ACTOR) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  req.status = "cancelled";
  recordInventoryAudit("Requisition cancelled", "requisition", req.requisitionNumber, actor);
  return mockRequest(req);
}

export function getRequisitions(filters: { status?: RequisitionStatus; departmentId?: string; search?: string } = {}) {
  let rows = [...requisitions].reverse();
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.departmentId) rows = rows.filter((r) => r.departmentId === filters.departmentId);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.requisitionNumber.toLowerCase().includes(q) || resolveDepartmentName(r.departmentId).toLowerCase().includes(q));
  }
  return mockRequest(
    rows.map((r) => ({ ...r, departmentName: resolveDepartmentName(r.departmentId), requestedByName: resolveStaffName(r.requestedBy) ?? r.requestedBy, itemCount: r.items.length }))
  );
}

export function getRequisitionDetail(requisitionId: string) {
  const req = requisitions.find((r) => r.id === requisitionId);
  if (!req) return mockRequest(null);
  return mockRequest({
    ...req,
    departmentName: resolveDepartmentName(req.departmentId),
    requestedByName: resolveStaffName(req.requestedBy) ?? req.requestedBy,
    items: req.items.map((line) => ({ ...line, itemName: inventoryItems.find((i) => i.id === line.itemId)?.name ?? "Unknown Item", unit: inventoryItems.find((i) => i.id === line.itemId)?.baseUnit })),
  });
}

/** Filtered view of the requisition-issue movement log — the "Stock Issues" screen (spec §17), consolidated rather than a parallel workflow. */
export function getStockIssues() {
  const rows = stockMovements.filter((m) => m.movementType === "requisition-issue" && m.quantityChange < 0);
  return mockRequest(
    rows
      .map((m) => ({ ...m, itemName: inventoryItems.find((i) => i.id === m.itemId)?.name ?? "Unknown Item", departmentName: m.toLocation ? resolveDepartmentName(m.toLocation) : undefined }))
      .reverse()
  );
}

// --- Stock Returns (spec §26) --------------------------------------------------

export type ReturnStatus = "requested" | "approved" | "received" | "rejected";
export type ReturnReason = "excess" | "wrong-item" | "damaged" | "recall" | "expiry" | "quality-issue";
export type ReturnDirection = "department-to-store" | "store-to-supplier";

export interface StockReturnItemLine {
  itemId: string;
  quantity: number;
  batchId?: string;
}

export interface InventoryStockReturn {
  id: string;
  returnNumber: string;
  direction: ReturnDirection;
  fromDepartmentId?: string;
  toWarehouseId?: string;
  supplierId?: string;
  items: StockReturnItemLine[];
  reason: ReturnReason;
  status: ReturnStatus;
  requestedBy: string;
  requestedAt: string;
  processedAt?: string;
}

export const inventoryStockReturns: InventoryStockReturn[] = [
  { id: "ret-1", returnNumber: "RET-2026-0001", direction: "department-to-store", fromDepartmentId: "dept-icu", toWarehouseId: "wh-icu", items: [{ itemId: "item-8", quantity: 5 }], reason: "excess", status: "requested", requestedBy: "sarah-jenkins", requestedAt: "2026-08-15T10:00:00" },
];

export interface NewStockReturnInput {
  direction: ReturnDirection;
  fromDepartmentId?: string;
  toWarehouseId?: string;
  supplierId?: string;
  items: StockReturnItemLine[];
  reason: ReturnReason;
  requestedBy: string;
}

export function createStockReturn(input: NewStockReturnInput) {
  const stockReturn: InventoryStockReturn = { ...input, id: `ret-${inventoryStockReturns.length + 1}`, returnNumber: `RET-2026-${String(inventoryStockReturns.length + 1).padStart(4, "0")}`, status: "requested", requestedAt: NOW };
  inventoryStockReturns.push(stockReturn);
  recordInventoryAudit("Stock return requested", "return", stockReturn.returnNumber, resolveStaffName(input.requestedBy) ?? input.requestedBy, input.reason);
  return mockRequest(stockReturn);
}

export function approveStockReturn(returnId: string, actor = DEFAULT_ACTOR) {
  const ret = inventoryStockReturns.find((r) => r.id === returnId);
  if (!ret) return mockRequest(null);
  ret.status = "approved";
  recordInventoryAudit("Stock return approved", "return", ret.returnNumber, actor);
  return mockRequest(ret);
}

export function receiveStockReturn(returnId: string, actor = DEFAULT_ACTOR) {
  const ret = inventoryStockReturns.find((r) => r.id === returnId);
  if (!ret) return mockRequest(null);
  ret.status = "received";
  ret.processedAt = NOW;
  ret.items.forEach((line) => {
    if (ret.direction === "department-to-store" && ret.toWarehouseId) {
      const batch = line.batchId ? inventoryBatches.find((b) => b.id === line.batchId) : pickFefoBatch(line.itemId, ret.toWarehouseId);
      if (batch) batch.quantity += line.quantity;
      recordStockMovement(line.itemId, batch?.id, "return-in", line.quantity, actor, "return", ret.returnNumber, ret.fromDepartmentId, ret.toWarehouseId);
    } else {
      recordStockMovement(line.itemId, line.batchId, "return-out", -line.quantity, actor, "return", ret.returnNumber, ret.toWarehouseId, undefined);
    }
  });
  recordInventoryAudit("Stock return received into inventory", "return", ret.returnNumber, actor);
  return mockRequest(ret);
}

export function rejectStockReturn(returnId: string, actor = DEFAULT_ACTOR) {
  const ret = inventoryStockReturns.find((r) => r.id === returnId);
  if (!ret) return mockRequest(null);
  ret.status = "rejected";
  recordInventoryAudit("Stock return rejected", "return", ret.returnNumber, actor);
  return mockRequest(ret);
}

export function getStockReturns(filters: { status?: ReturnStatus } = {}) {
  let rows = [...inventoryStockReturns].reverse();
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  return mockRequest(
    rows.map((r) => ({ ...r, fromDepartmentName: r.fromDepartmentId ? resolveDepartmentName(r.fromDepartmentId) : undefined, toWarehouseName: r.toWarehouseId ? warehouses.find((w) => w.id === r.toWarehouseId)?.name : undefined, supplierName: r.supplierId ? inventorySuppliers.find((s) => s.id === r.supplierId)?.name : undefined }))
  );
}

// --- Stock Transfers (spec §25) ----------------------------------------------

export type TransferStatus = "requested" | "approved" | "picking" | "shipped" | "in-transit" | "received" | "rejected" | "cancelled";

export interface StockTransferItemLine {
  itemId: string;
  quantity: number;
  batchId?: string;
}

export interface InventoryStockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  items: StockTransferItemLine[];
  status: TransferStatus;
  requestedBy: string;
  requestedAt: string;
  shippedAt?: string;
  receivedAt?: string;
}

export const inventoryStockTransfers: InventoryStockTransfer[] = [
  { id: "trf-1", transferNumber: "TRF-2026-0001", fromWarehouseId: "wh-central", toWarehouseId: "wh-ot", items: [{ itemId: "item-2", quantity: 15 }], status: "requested", requestedBy: "hira-shahid", requestedAt: "2026-08-15T09:00:00" },
];

export interface NewTransferInput {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: StockTransferItemLine[];
  requestedBy: string;
}

export function createInventoryStockTransfer(input: NewTransferInput) {
  const transfer: InventoryStockTransfer = { ...input, id: `trf-${inventoryStockTransfers.length + 1}`, transferNumber: `TRF-2026-${String(inventoryStockTransfers.length + 1).padStart(4, "0")}`, status: "requested", requestedAt: NOW };
  inventoryStockTransfers.push(transfer);
  recordInventoryAudit("Stock transfer requested", "transfer", transfer.transferNumber, resolveStaffName(input.requestedBy) ?? input.requestedBy);
  return mockRequest(transfer);
}

export function approveInventoryStockTransfer(transferId: string, actor = DEFAULT_ACTOR) {
  const transfer = inventoryStockTransfers.find((t) => t.id === transferId);
  if (!transfer) return mockRequest(null);
  transfer.status = "approved";
  recordInventoryAudit("Stock transfer approved", "transfer", transfer.transferNumber, actor);
  return mockRequest(transfer);
}

export function shipInventoryStockTransfer(transferId: string, actor = DEFAULT_ACTOR) {
  const transfer = inventoryStockTransfers.find((t) => t.id === transferId);
  if (!transfer) return mockRequest(null);
  transfer.items.forEach((line) => {
    const batch = line.batchId ? inventoryBatches.find((b) => b.id === line.batchId) : pickFefoBatch(line.itemId, transfer.fromWarehouseId);
    if (batch) {
      batch.quantity -= line.quantity;
      recordStockMovement(line.itemId, batch.id, "transfer-out", -line.quantity, actor, "transfer", transfer.transferNumber, transfer.fromWarehouseId, transfer.toWarehouseId);
    }
  });
  transfer.status = "shipped";
  transfer.shippedAt = NOW;
  recordInventoryAudit("Stock transfer shipped", "transfer", transfer.transferNumber, actor);
  return mockRequest(transfer);
}

export function receiveInventoryStockTransfer(transferId: string, actor = DEFAULT_ACTOR) {
  const transfer = inventoryStockTransfers.find((t) => t.id === transferId);
  if (!transfer) return mockRequest(null);
  transfer.items.forEach((line) => {
    const item = inventoryItems.find((i) => i.id === line.itemId)!;
    const existing = inventoryBatches.find((b) => b.itemId === line.itemId && b.warehouseId === transfer.toWarehouseId && (b.status === "available" || b.status === "low"));
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      inventoryBatches.push({ id: `batch-${inventoryBatches.length + 1}`, batchNumber: `TRF-${transfer.transferNumber}`, itemId: line.itemId, quantity: line.quantity, unitCost: item.unitCost, warehouseId: transfer.toWarehouseId, status: "available", receivedAt: NOW });
    }
    recordStockMovement(line.itemId, line.batchId, "transfer-in", line.quantity, actor, "transfer", transfer.transferNumber, transfer.fromWarehouseId, transfer.toWarehouseId);
  });
  transfer.status = "received";
  transfer.receivedAt = NOW;
  recordInventoryAudit("Stock transfer received", "transfer", transfer.transferNumber, actor);
  return mockRequest(transfer);
}

export function rejectInventoryStockTransfer(transferId: string, actor = DEFAULT_ACTOR) {
  const transfer = inventoryStockTransfers.find((t) => t.id === transferId);
  if (!transfer) return mockRequest(null);
  transfer.status = "rejected";
  recordInventoryAudit("Stock transfer rejected", "transfer", transfer.transferNumber, actor);
  return mockRequest(transfer);
}

export function getInventoryStockTransfers(filters: { status?: TransferStatus } = {}) {
  let rows = [...inventoryStockTransfers].reverse();
  if (filters.status) rows = rows.filter((t) => t.status === filters.status);
  return mockRequest(rows.map((t) => ({ ...t, fromWarehouseName: warehouses.find((w) => w.id === t.fromWarehouseId)?.name ?? "Unknown", toWarehouseName: warehouses.find((w) => w.id === t.toWarehouseId)?.name ?? "Unknown" })));
}

// --- Suppliers (spec §22) -----------------------------------------------------

export interface InventorySupplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: string[];
  contractStart?: string;
  contractEnd?: string;
  paymentTerms: string;
  status: "active" | "inactive";
  onTimeDeliveryRate: number;
  rejectedDeliveryCount: number;
  qualityIssueCount: number;
  averageDeliveryDays: number;
}

export const inventorySuppliers: InventorySupplier[] = [
  { id: "sup-1", name: "MedSurge Distributors", contactName: "Farhan Iqbal", email: "sales@medsurge.example", phone: "+1 (555) 340-1120", address: "12 Industrial Ave, Lahore", productsSupplied: ["Surgical", "Medical Supplies"], contractStart: "2025-01-01", contractEnd: "2027-01-01", paymentTerms: "Net 30", status: "active", onTimeDeliveryRate: 94, rejectedDeliveryCount: 1, qualityIssueCount: 0, averageDeliveryDays: 4 },
  { id: "sup-2", name: "CarePlus Medical Supplies", contactName: "Rabia Hameed", email: "orders@careplus.example", phone: "+1 (555) 340-1121", address: "88 Commerce Rd, Karachi", productsSupplied: ["Medical Supplies", "PPE", "General"], contractStart: "2025-03-01", paymentTerms: "Net 45", status: "active", onTimeDeliveryRate: 89, rejectedDeliveryCount: 2, qualityIssueCount: 1, averageDeliveryDays: 6 },
  { id: "sup-3", name: "SafeGuard PPE Ltd.", contactName: "Zeeshan Malik", email: "info@safeguardppe.example", phone: "+1 (555) 340-1122", address: "5 Export Zone, Faisalabad", productsSupplied: ["PPE"], contractStart: "2025-06-01", paymentTerms: "Net 30", status: "active", onTimeDeliveryRate: 97, rejectedDeliveryCount: 0, qualityIssueCount: 0, averageDeliveryDays: 3 },
  { id: "sup-4", name: "DiagnoLab Reagents", contactName: "Sana Yousaf", email: "sales@diagnolab.example", phone: "+1 (555) 340-1123", address: "22 Science Park, Islamabad", productsSupplied: ["Laboratory"], contractStart: "2025-01-01", paymentTerms: "Net 30", status: "active", onTimeDeliveryRate: 91, rejectedDeliveryCount: 1, qualityIssueCount: 0, averageDeliveryDays: 5 },
  { id: "sup-5", name: "CardioTech Implants", contactName: "Bilal Anwar", email: "orders@cardiotech.example", phone: "+1 (555) 340-1124", address: "3 MedTech Campus, Lahore", productsSupplied: ["Implants"], contractStart: "2024-09-01", contractEnd: "2027-09-01", paymentTerms: "Net 60", status: "active", onTimeDeliveryRate: 99, rejectedDeliveryCount: 0, qualityIssueCount: 0, averageDeliveryDays: 7 },
  { id: "sup-6", name: "OfficeWorks Supplies", contactName: "Imran Sheikh", email: "info@officeworks.example", phone: "+1 (555) 340-1125", address: "10 Business District, Lahore", productsSupplied: ["General"], paymentTerms: "Net 15", status: "active", onTimeDeliveryRate: 96, rejectedDeliveryCount: 0, qualityIssueCount: 0, averageDeliveryDays: 2 },
];

export function getInventorySuppliers(filters: { includeInactive?: boolean; search?: string } = {}) {
  let rows = filters.includeInactive ? inventorySuppliers : inventorySuppliers.filter((s) => s.status === "active");
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((s) => s.name.toLowerCase().includes(q) || s.productsSupplied.some((p) => p.toLowerCase().includes(q)));
  }
  return mockRequest(rows);
}

export interface NewInventorySupplierInput {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: string[];
  contractStart?: string;
  contractEnd?: string;
  paymentTerms: string;
}

export function createInventorySupplier(input: NewInventorySupplierInput) {
  const supplier: InventorySupplier = { ...input, id: `sup-${inventorySuppliers.length + 1}`, status: "active", onTimeDeliveryRate: 100, rejectedDeliveryCount: 0, qualityIssueCount: 0, averageDeliveryDays: 0 };
  inventorySuppliers.push(supplier);
  recordInventoryAudit("Supplier added", "supplier", supplier.name, DEFAULT_ACTOR);
  return mockRequest(supplier);
}

export function updateInventorySupplier(supplierId: string, input: Partial<NewInventorySupplierInput>) {
  const supplier = inventorySuppliers.find((s) => s.id === supplierId);
  if (!supplier) return mockRequest(null);
  Object.assign(supplier, input);
  recordInventoryAudit("Supplier details updated", "supplier", supplier.name, DEFAULT_ACTOR);
  return mockRequest(supplier);
}

export function setInventorySupplierStatus(supplierId: string, status: "active" | "inactive") {
  const supplier = inventorySuppliers.find((s) => s.id === supplierId);
  if (!supplier) return mockRequest(null);
  supplier.status = status;
  recordInventoryAudit(`Supplier marked ${status}`, "supplier", supplier.name, DEFAULT_ACTOR);
  return mockRequest(supplier);
}

// --- Purchase Requests -> Purchase Orders -> Goods Receiving (spec §20-24,
// consolidated into one "Procurement" tab per this project's established
// discipline of merging tightly-related sections). -----------------------------

export type PurchaseRequestStatus = "draft" | "submitted" | "approved" | "rejected" | "converted" | "cancelled";

export interface PurchaseRequestItemLine {
  itemId: string;
  quantity: number;
  estimatedCost?: number;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  departmentId: string;
  requestedBy: string;
  items: PurchaseRequestItemLine[];
  reason: string;
  priority: RequisitionPriority;
  status: PurchaseRequestStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const purchaseRequests: PurchaseRequest[] = [
  { id: "pr-1", requestNumber: "PR-2026-0001", departmentId: "dept-inventory", requestedBy: "junaid-malik", items: [{ itemId: "item-16", quantity: 20, estimatedCost: 1300 }], reason: "Reorder alert triggered — Glucose Reagent Kit below reorder level", priority: "routine", status: "submitted", createdAt: "2026-08-15T09:00:00" },
];

export interface NewPurchaseRequestInput {
  departmentId: string;
  requestedBy: string;
  items: PurchaseRequestItemLine[];
  reason: string;
  priority: RequisitionPriority;
}

export function createPurchaseRequest(input: NewPurchaseRequestInput) {
  const pr: PurchaseRequest = { ...input, id: `pr-${purchaseRequests.length + 1}`, requestNumber: `PR-2026-${String(purchaseRequests.length + 1).padStart(4, "0")}`, status: "submitted", createdAt: NOW };
  purchaseRequests.push(pr);
  recordInventoryAudit("Purchase request submitted", "purchase-request", pr.requestNumber, resolveStaffName(input.requestedBy) ?? input.requestedBy, input.reason);
  return mockRequest(pr);
}

export function approvePurchaseRequest(prId: string, actor = DEFAULT_ACTOR) {
  const pr = purchaseRequests.find((p) => p.id === prId);
  if (!pr) return mockRequest(null);
  pr.status = "approved";
  pr.approvedBy = actor;
  pr.approvedAt = NOW;
  recordInventoryAudit("Purchase request approved", "purchase-request", pr.requestNumber, actor);
  return mockRequest(pr);
}

export function rejectPurchaseRequest(prId: string, actor = DEFAULT_ACTOR) {
  const pr = purchaseRequests.find((p) => p.id === prId);
  if (!pr) return mockRequest(null);
  pr.status = "rejected";
  recordInventoryAudit("Purchase request rejected", "purchase-request", pr.requestNumber, actor);
  return mockRequest(pr);
}

export function getPurchaseRequests(filters: { status?: PurchaseRequestStatus } = {}) {
  let rows = [...purchaseRequests].reverse();
  if (filters.status) rows = rows.filter((p) => p.status === filters.status);
  return mockRequest(rows.map((p) => ({ ...p, departmentName: resolveDepartmentName(p.departmentId), requestedByName: resolveStaffName(p.requestedBy) ?? p.requestedBy })));
}

export type InventoryPurchaseOrderStatus = "draft" | "sent" | "acknowledged" | "partially-received" | "received" | "cancelled";

export interface PurchaseOrderItemLine {
  itemId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
}

export interface InventoryPurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  purchaseRequestId?: string;
  items: PurchaseOrderItemLine[];
  subtotal: number;
  tax: number;
  total: number;
  deliveryDate?: string;
  paymentTerms?: string;
  status: InventoryPurchaseOrderStatus;
  createdAt: string;
  createdBy: string;
}

function computePoTotals(items: PurchaseOrderItemLine[]) {
  const subtotal = Math.round(items.reduce((sum, l) => sum + l.quantityOrdered * l.unitPrice, 0) * 100) / 100;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  return { subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 };
}

export const inventoryPurchaseOrders: InventoryPurchaseOrder[] = (() => {
  const items: PurchaseOrderItemLine[] = [{ itemId: "item-19", quantityOrdered: 10, quantityReceived: 0, unitPrice: 900 }];
  const totals = computePoTotals(items);
  return [
    { id: "po-1", poNumber: "PO-2026-0001", supplierId: "sup-5", items, ...totals, deliveryDate: "2026-08-22", paymentTerms: "Net 60", status: "sent", createdAt: "2026-08-14T10:00:00", createdBy: "junaid-malik" },
  ];
})();

export interface NewInventoryPurchaseOrderInput {
  supplierId: string;
  purchaseRequestId?: string;
  items: PurchaseOrderItemLine[];
  deliveryDate?: string;
  paymentTerms?: string;
  createdBy: string;
}

export function createInventoryPurchaseOrder(input: NewInventoryPurchaseOrderInput) {
  const totals = computePoTotals(input.items);
  const po: InventoryPurchaseOrder = { ...input, id: `po-${inventoryPurchaseOrders.length + 1}`, poNumber: `PO-2026-${String(inventoryPurchaseOrders.length + 1).padStart(4, "0")}`, ...totals, status: "draft", createdAt: NOW };
  inventoryPurchaseOrders.push(po);
  if (input.purchaseRequestId) {
    const pr = purchaseRequests.find((p) => p.id === input.purchaseRequestId);
    if (pr) pr.status = "converted";
  }
  recordInventoryAudit("Purchase order created", "purchase-order", po.poNumber, resolveStaffName(input.createdBy) ?? input.createdBy);
  return mockRequest(po);
}

export function sendInventoryPurchaseOrder(poId: string, actor = DEFAULT_ACTOR) {
  const po = inventoryPurchaseOrders.find((p) => p.id === poId);
  if (!po) return mockRequest(null);
  po.status = "sent";
  recordInventoryAudit("Purchase order sent to supplier", "purchase-order", po.poNumber, actor);
  return mockRequest(po);
}

export function cancelInventoryPurchaseOrder(poId: string, actor = DEFAULT_ACTOR) {
  const po = inventoryPurchaseOrders.find((p) => p.id === poId);
  if (!po) return mockRequest(null);
  po.status = "cancelled";
  recordInventoryAudit("Purchase order cancelled", "purchase-order", po.poNumber, actor);
  return mockRequest(po);
}

export function getInventoryPurchaseOrders(filters: { status?: InventoryPurchaseOrderStatus } = {}) {
  let rows = [...inventoryPurchaseOrders].reverse();
  if (filters.status) rows = rows.filter((p) => p.status === filters.status);
  return mockRequest(rows.map((p) => ({ ...p, supplierName: inventorySuppliers.find((s) => s.id === p.supplierId)?.name ?? "Unknown" })));
}

export function getInventoryPurchaseOrderDetail(poId: string) {
  const po = inventoryPurchaseOrders.find((p) => p.id === poId);
  if (!po) return mockRequest(null);
  return mockRequest({
    ...po,
    supplierName: inventorySuppliers.find((s) => s.id === po.supplierId)?.name ?? "Unknown",
    items: po.items.map((line) => ({ ...line, itemName: inventoryItems.find((i) => i.id === line.itemId)?.name ?? "Unknown Item" })),
  });
}

export type GoodsReceiptStatus = "accepted" | "rejected" | "partial";

export interface GoodsReceiptLine {
  itemId: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityDamaged: number;
  batchNumber?: string;
  expiryDate?: string;
  accepted: boolean;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  purchaseOrderId: string;
  lines: GoodsReceiptLine[];
  receivedBy: string;
  receivedAt: string;
  status: GoodsReceiptStatus;
}

export const goodsReceipts: GoodsReceipt[] = [];

export interface ReceiveGoodsInput {
  purchaseOrderId: string;
  lines: GoodsReceiptLine[];
  receivedBy: string;
  warehouseId: string;
}

/** Verify (item/qty/batch/expiry/damaged) -> Accept/Reject -> Inventory (spec §23). Never assumes full delivery — tracks PARTIALLY_RECEIVED (spec §24) and creates real Batch rows on acceptance. */
export function receiveInventoryGoods(input: ReceiveGoodsInput) {
  const po = inventoryPurchaseOrders.find((p) => p.id === input.purchaseOrderId);
  if (!po) return mockRequest(null);

  const anyRejected = input.lines.some((l) => !l.accepted);
  const anyPartial = input.lines.some((l) => l.quantityReceived < l.quantityOrdered);
  const status: GoodsReceiptStatus = anyRejected && input.lines.every((l) => !l.accepted) ? "rejected" : anyPartial || anyRejected ? "partial" : "accepted";

  const grn: GoodsReceipt = { id: `grn-${goodsReceipts.length + 1}`, grnNumber: `GRN-2026-${String(goodsReceipts.length + 1).padStart(4, "0")}`, purchaseOrderId: po.id, lines: input.lines, receivedBy: input.receivedBy, receivedAt: NOW, status };
  goodsReceipts.push(grn);

  input.lines.forEach((line) => {
    const poLine = po.items.find((l) => l.itemId === line.itemId);
    if (poLine) poLine.quantityReceived += line.quantityReceived;
    if (!line.accepted || line.quantityReceived <= 0) return;
    const item = inventoryItems.find((i) => i.id === line.itemId)!;
    const batch: InventoryBatch = {
      id: `batch-${inventoryBatches.length + 1}`,
      batchNumber: line.batchNumber ?? `${grn.grnNumber}-${line.itemId}`,
      itemId: line.itemId,
      manufacturingDate: undefined,
      expiryDate: line.expiryDate,
      quantity: line.quantityReceived,
      unitCost: po.items.find((l) => l.itemId === line.itemId)?.unitPrice ?? item.unitCost,
      supplierId: po.supplierId,
      warehouseId: input.warehouseId,
      status: "available",
      receivedAt: NOW,
    };
    inventoryBatches.push(batch);
    recordStockMovement(line.itemId, batch.id, "purchase-receipt", line.quantityReceived, input.receivedBy, "goods-receipt", grn.grnNumber, po.supplierId, input.warehouseId);
    if (line.quantityDamaged > 0) {
      recordInventoryAudit(`Goods received with ${line.quantityDamaged} damaged units noted`, "goods-receipt", grn.grnNumber, input.receivedBy, item.name);
    }
  });

  const fullyReceived = po.items.every((l) => l.quantityReceived >= l.quantityOrdered);
  po.status = fullyReceived ? "received" : po.items.some((l) => l.quantityReceived > 0) ? "partially-received" : po.status;

  recordInventoryAudit(`Goods receipt recorded (${status})`, "goods-receipt", grn.grnNumber, input.receivedBy, po.poNumber);
  return mockRequest(grn);
}

export function getGoodsReceipts() {
  return mockRequest(
    [...goodsReceipts].reverse().map((g) => ({ ...g, poNumber: inventoryPurchaseOrders.find((p) => p.id === g.purchaseOrderId)?.poNumber ?? "Unknown" }))
  );
}

// --- Inventory Counts + Variance (spec §28-29) --------------------------------

export type CountStatus = "planned" | "in-progress" | "counted" | "variance-review" | "approved" | "cancelled";

export interface CountLine {
  itemId: string;
  expectedQuantity: number;
  countedQuantity?: number;
  varianceReason?: string;
}

export interface InventoryCount {
  id: string;
  countNumber: string;
  warehouseId: string;
  status: CountStatus;
  lines: CountLine[];
  scheduledDate: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const inventoryCounts: InventoryCount[] = [
  {
    id: "count-1",
    countNumber: "CNT-2026-0001",
    warehouseId: "wh-central",
    status: "planned",
    scheduledDate: "2026-08-20",
    createdBy: "waqas-anjum",
    lines: [
      { itemId: "item-1", expectedQuantity: 120 },
      { itemId: "item-6", expectedQuantity: 300 },
    ],
  },
];

export interface NewCountInput {
  warehouseId: string;
  scheduledDate: string;
  itemIds: string[];
  createdBy: string;
}

export function createInventoryCount(input: NewCountInput) {
  const lines: CountLine[] = input.itemIds.map((itemId) => ({
    itemId,
    expectedQuantity: inventoryBatches.filter((b) => b.itemId === itemId && b.warehouseId === input.warehouseId && (b.status === "available" || b.status === "low")).reduce((sum, b) => sum + b.quantity, 0),
  }));
  const count: InventoryCount = { id: `count-${inventoryCounts.length + 1}`, countNumber: `CNT-2026-${String(inventoryCounts.length + 1).padStart(4, "0")}`, warehouseId: input.warehouseId, status: "planned", lines, scheduledDate: input.scheduledDate, createdBy: input.createdBy };
  inventoryCounts.push(count);
  recordInventoryAudit("Inventory count scheduled", "count", count.countNumber, resolveStaffName(input.createdBy) ?? input.createdBy);
  return mockRequest(count);
}

/** Freeze / control movement for the count window (spec §28). */
export function startInventoryCount(countId: string, actor = DEFAULT_ACTOR) {
  const count = inventoryCounts.find((c) => c.id === countId);
  if (!count) return mockRequest(null);
  count.status = "in-progress";
  recordInventoryAudit("Inventory count started (stock frozen for counted items)", "count", count.countNumber, actor);
  return mockRequest(count);
}

export function recordCountLine(countId: string, itemId: string, countedQuantity: number, varianceReason?: string) {
  const count = inventoryCounts.find((c) => c.id === countId);
  if (!count) return mockRequest(null);
  const line = count.lines.find((l) => l.itemId === itemId);
  if (line) {
    line.countedQuantity = countedQuantity;
    line.varianceReason = varianceReason;
  }
  return mockRequest(count);
}

export function submitCountForReview(countId: string, actor = DEFAULT_ACTOR) {
  const count = inventoryCounts.find((c) => c.id === countId);
  if (!count) return mockRequest(null);
  count.status = "variance-review";
  recordInventoryAudit("Inventory count submitted for variance review", "count", count.countNumber, actor);
  return mockRequest(count);
}

/** Approval -> Adjustment (spec §28): every variance line becomes a real, approved InventoryAdjustment — never a silent quantity overwrite. */
export function approveCountAndAdjust(countId: string, actor = DEFAULT_ACTOR) {
  const count = inventoryCounts.find((c) => c.id === countId);
  if (!count) return mockRequest(null);
  count.status = "approved";
  count.approvedBy = actor;
  count.approvedAt = NOW;
  count.lines.forEach((line) => {
    if (line.countedQuantity === undefined || line.countedQuantity === line.expectedQuantity) return;
    const change = line.countedQuantity - line.expectedQuantity;
    applyAdjustment(line.itemId, count.warehouseId, change, "count-variance", line.varianceReason ?? "Physical count variance", actor, count.countNumber);
  });
  recordInventoryAudit("Inventory count approved, variances adjusted", "count", count.countNumber, actor);
  return mockRequest(count);
}

export function getInventoryCounts(filters: { status?: CountStatus } = {}) {
  let rows = [...inventoryCounts].reverse();
  if (filters.status) rows = rows.filter((c) => c.status === filters.status);
  return mockRequest(rows.map((c) => ({ ...c, warehouseName: warehouses.find((w) => w.id === c.warehouseId)?.name ?? "Unknown" })));
}

export function getCountDetail(countId: string) {
  const count = inventoryCounts.find((c) => c.id === countId);
  if (!count) return mockRequest(null);
  return mockRequest({
    ...count,
    warehouseName: warehouses.find((w) => w.id === count.warehouseId)?.name ?? "Unknown",
    lines: count.lines.map((l) => ({ ...l, itemName: inventoryItems.find((i) => i.id === l.itemId)?.name ?? "Unknown Item", variance: l.countedQuantity !== undefined ? l.countedQuantity - l.expectedQuantity : undefined })),
  });
}

// --- Adjustments (spec §27) — never silent editing: reason, user, approval,
// timestamp, audit record every time. -----------------------------------------

export type AdjustmentReason = "count-variance" | "damage" | "expiry" | "theft-loss" | "correction" | "other";
export type AdjustmentApprovalStatus = "pending-approval" | "approved" | "rejected";

export interface InventoryAdjustment {
  id: string;
  itemId: string;
  warehouseId: string;
  quantityChange: number;
  reason: AdjustmentReason;
  note?: string;
  requestedBy: string;
  approvedBy?: string;
  status: AdjustmentApprovalStatus;
  createdAt: string;
  referenceId?: string;
}

export const inventoryAdjustments: InventoryAdjustment[] = [];

function applyAdjustment(itemId: string, warehouseId: string, quantityChange: number, reason: AdjustmentReason, note: string | undefined, actor: string, referenceId?: string) {
  const adjustment: InventoryAdjustment = { id: `adj-${inventoryAdjustments.length + 1}`, itemId, warehouseId, quantityChange, reason, note, requestedBy: actor, approvedBy: actor, status: "approved", createdAt: NOW, referenceId };
  inventoryAdjustments.push(adjustment);
  const batch = inventoryBatches.find((b) => b.itemId === itemId && b.warehouseId === warehouseId && (b.status === "available" || b.status === "low"));
  if (batch) {
    batch.quantity = Math.max(0, batch.quantity + quantityChange);
  } else if (quantityChange > 0) {
    const item = inventoryItems.find((i) => i.id === itemId)!;
    inventoryBatches.push({ id: `batch-${inventoryBatches.length + 1}`, batchNumber: `ADJ-${adjustment.id}`, itemId, quantity: quantityChange, unitCost: item.unitCost, warehouseId, status: "available", receivedAt: NOW });
  }
  recordStockMovement(itemId, batch?.id, "adjustment", quantityChange, actor, "adjustment", adjustment.id, undefined, undefined);
  recordInventoryAudit(`Stock adjusted (${quantityChange > 0 ? "+" : ""}${quantityChange}): ${reason}`, "adjustment", adjustment.id, actor, note);
  return adjustment;
}

export interface NewInventoryAdjustmentInput {
  itemId: string;
  warehouseId: string;
  quantityChange: number;
  reason: AdjustmentReason;
  note?: string;
  requestedBy: string;
}

/** Adjustments above a threshold require a second approver — system vs. physical mismatch is never silently edited. */
export function requestAdjustment(input: NewInventoryAdjustmentInput) {
  const requiresApproval = Math.abs(input.quantityChange) >= 20;
  if (!requiresApproval) {
    const adjustment = applyAdjustment(input.itemId, input.warehouseId, input.quantityChange, input.reason, input.note, input.requestedBy);
    return mockRequest(adjustment);
  }
  const adjustment: InventoryAdjustment = { id: `adj-${inventoryAdjustments.length + 1}`, itemId: input.itemId, warehouseId: input.warehouseId, quantityChange: input.quantityChange, reason: input.reason, note: input.note, requestedBy: input.requestedBy, status: "pending-approval", createdAt: NOW };
  inventoryAdjustments.push(adjustment);
  recordInventoryAudit("Stock adjustment requested, pending approval", "adjustment", adjustment.id, resolveStaffName(input.requestedBy) ?? input.requestedBy, input.note);
  return mockRequest(adjustment);
}

export function approveAdjustment(adjustmentId: string, actor = DEFAULT_ACTOR) {
  const adjustment = inventoryAdjustments.find((a) => a.id === adjustmentId);
  if (!adjustment || adjustment.status !== "pending-approval") return mockRequest(null);
  adjustment.status = "approved";
  adjustment.approvedBy = actor;
  const batch = inventoryBatches.find((b) => b.itemId === adjustment.itemId && b.warehouseId === adjustment.warehouseId && (b.status === "available" || b.status === "low"));
  if (batch) batch.quantity = Math.max(0, batch.quantity + adjustment.quantityChange);
  recordStockMovement(adjustment.itemId, batch?.id, "adjustment", adjustment.quantityChange, actor, "adjustment", adjustment.id);
  recordInventoryAudit("Stock adjustment approved and applied", "adjustment", adjustment.id, actor);
  return mockRequest(adjustment);
}

export function rejectAdjustment(adjustmentId: string, actor = DEFAULT_ACTOR) {
  const adjustment = inventoryAdjustments.find((a) => a.id === adjustmentId);
  if (!adjustment) return mockRequest(null);
  adjustment.status = "rejected";
  recordInventoryAudit("Stock adjustment rejected", "adjustment", adjustment.id, actor);
  return mockRequest(adjustment);
}

export function getInventoryAdjustments(filters: { status?: AdjustmentApprovalStatus } = {}) {
  let rows = [...inventoryAdjustments].reverse();
  if (filters.status) rows = rows.filter((a) => a.status === filters.status);
  return mockRequest(rows.map((a) => ({ ...a, itemName: inventoryItems.find((i) => i.id === a.itemId)?.name ?? "Unknown Item", warehouseName: warehouses.find((w) => w.id === a.warehouseId)?.name ?? "Unknown" })));
}

// --- Recalls & Quarantine trace (spec §39-40) ---------------------------------

export type InventoryRecallStatus = "open" | "investigating" | "closed";

export interface InventoryRecall {
  id: string;
  recallNumber: string;
  itemId: string;
  affectedBatchIds: string[];
  manufacturer: string;
  reason: string;
  initiatedAt: string;
  initiatedBy: string;
  status: InventoryRecallStatus;
  closedAt?: string;
  notes?: string;
}

export const inventoryRecalls: InventoryRecall[] = [];

/** Manufacturer Recall -> Affected Batch -> Find Locations -> Quarantine Stock -> Find Issued Items -> Trace Usage (spec §39). */
export function initiateInventoryRecall(input: { itemId: string; affectedBatchIds: string[]; manufacturer: string; reason: string; actor?: string }) {
  const actor = input.actor ?? DEFAULT_ACTOR;
  const recall: InventoryRecall = { id: `recall-${inventoryRecalls.length + 1}`, recallNumber: `RCL-2026-${String(inventoryRecalls.length + 1).padStart(4, "0")}`, itemId: input.itemId, affectedBatchIds: input.affectedBatchIds, manufacturer: input.manufacturer, reason: input.reason, initiatedAt: NOW, initiatedBy: actor, status: "open" };
  inventoryRecalls.push(recall);
  input.affectedBatchIds.forEach((batchId) => quarantineInventoryBatch(batchId, `Manufacturer recall ${recall.recallNumber}: ${input.reason}`, actor));
  recordInventoryAudit(`Recall initiated: ${input.reason}`, "recall", recall.recallNumber, actor, `${input.affectedBatchIds.length} batch(es) quarantined`);
  return mockRequest(recall);
}

export function getInventoryRecallTrace(recallId: string) {
  const recall = inventoryRecalls.find((r) => r.id === recallId);
  if (!recall) return mockRequest(null);
  const issuedMovements = stockMovements.filter((m) => recall.affectedBatchIds.includes(m.batchId ?? "") && m.quantityChange < 0);
  const implantUsages = implantUsageRecords.filter((r) => recall.affectedBatchIds.includes(r.lotNumber ?? ""));
  return mockRequest({
    recall,
    itemName: inventoryItems.find((i) => i.id === recall.itemId)?.name ?? "Unknown Item",
    affectedBatches: inventoryBatches.filter((b) => recall.affectedBatchIds.includes(b.id)),
    issuedMovements: issuedMovements.map((m) => ({ ...m, departmentName: m.toLocation ? resolveDepartmentName(m.toLocation) : undefined })),
    implantUsages: implantUsages.map((r) => ({ ...r, patientName: resolvePatientName(r.patientId) })),
  });
}

export function closeInventoryRecall(recallId: string, notes: string, actor = DEFAULT_ACTOR) {
  const recall = inventoryRecalls.find((r) => r.id === recallId);
  if (!recall) return mockRequest(null);
  recall.status = "closed";
  recall.closedAt = NOW;
  recall.notes = notes;
  recordInventoryAudit("Recall closed", "recall", recall.recallNumber, actor, notes);
  return mockRequest(recall);
}

export function getInventoryRecalls(filters: { status?: InventoryRecallStatus } = {}) {
  let rows = [...inventoryRecalls].reverse();
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  return mockRequest(rows.map((r) => ({ ...r, itemName: inventoryItems.find((i) => i.id === r.itemId)?.name ?? "Unknown Item" })));
}

export function getQuarantinedStock() {
  const batches = inventoryBatches.filter((b) => b.status === "quarantined");
  const assets = serializedAssets.filter((a) => a.status === "retired" || a.status === "lost");
  return mockRequest({
    batches: batches.map((b) => ({ ...b, itemName: inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Unknown Item" })),
    assets: assets.map((a) => ({ ...a, itemName: inventoryItems.find((i) => i.id === a.itemId)?.name ?? "Unknown Item" })),
  });
}

// --- Disposal (spec §41) ------------------------------------------------------

export type DisposalMethod = "incineration" | "return-to-supplier" | "landfill" | "recycling" | "other";

export interface DisposalRecord {
  id: string;
  disposalNumber: string;
  itemId: string;
  batchId?: string;
  quantity: number;
  reason: string;
  method: DisposalMethod;
  authorizedBy: string;
  witnessedBy?: string;
  disposedAt: string;
}

export const disposalRecords: DisposalRecord[] = [];

export function recordDisposal(input: { itemId: string; batchId?: string; quantity: number; reason: string; method: DisposalMethod; authorizedBy: string; witnessedBy?: string }) {
  const record: DisposalRecord = { ...input, id: `disp-${disposalRecords.length + 1}`, disposalNumber: `DSP-2026-${String(disposalRecords.length + 1).padStart(4, "0")}`, disposedAt: NOW };
  disposalRecords.push(record);
  if (input.batchId) {
    const batch = inventoryBatches.find((b) => b.id === input.batchId);
    if (batch) {
      batch.quantity = Math.max(0, batch.quantity - input.quantity);
      if (batch.quantity === 0) batch.status = "disposed";
    }
  }
  recordStockMovement(input.itemId, input.batchId, "disposal", -input.quantity, input.authorizedBy, "disposal", record.disposalNumber);
  recordInventoryAudit(`Disposal recorded: ${input.reason} (${input.method})`, "disposal", record.disposalNumber, resolveStaffName(input.authorizedBy) ?? input.authorizedBy);
  return mockRequest(record);
}

export function getDisposalRecords() {
  return mockRequest(
    [...disposalRecords].reverse().map((r) => ({ ...r, itemName: inventoryItems.find((i) => i.id === r.itemId)?.name ?? "Unknown Item", authorizedByName: resolveStaffName(r.authorizedBy) ?? r.authorizedBy }))
  );
}

// --- Alerts (spec §42) — computed live from current state, three categories. --

export interface InventoryAlert {
  id: string;
  category: "stock" | "procurement" | "operational";
  severity: "info" | "warning" | "critical";
  message: string;
  relatedId?: string;
  createdAt: string;
}

export function getInventoryAlerts() {
  const alerts: InventoryAlert[] = [];
  const stock = getStockOverviewSync();

  inventoryItems.forEach((item) => {
    const row = stock.find((r) => r.itemId === item.id);
    if (!row) return;
    if (row.status === "out-of-stock") alerts.push({ id: `alert-stock-out-${item.id}`, category: "stock", severity: "critical", message: `${item.name} is out of stock`, relatedId: item.id, createdAt: NOW });
    else if (row.status === "low-stock") alerts.push({ id: `alert-stock-low-${item.id}`, category: "stock", severity: "warning", message: `${item.name} is below reorder level (${row.available} available, reorder at ${row.reorderLevel})`, relatedId: item.id, createdAt: NOW });
  });

  getExpiringInventoryBatchesSync(30).forEach((b) => {
    alerts.push({ id: `alert-expiring-${b.id}`, category: "stock", severity: "warning", message: `${inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Item"} batch ${b.batchNumber} expires in ${daysUntil(b.expiryDate)} day(s)`, relatedId: b.id, createdAt: NOW });
  });

  inventoryBatches.filter((b) => b.status === "expired").forEach((b) => {
    alerts.push({ id: `alert-expired-${b.id}`, category: "stock", severity: "critical", message: `${inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Item"} batch ${b.batchNumber} has expired`, relatedId: b.id, createdAt: NOW });
  });

  inventoryBatches.filter((b) => b.status === "quarantined").forEach((b) => {
    alerts.push({ id: `alert-quarantine-${b.id}`, category: "stock", severity: "warning", message: `${inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Item"} batch ${b.batchNumber} is in quarantine`, relatedId: b.id, createdAt: NOW });
  });

  inventoryRecalls.filter((r) => r.status !== "closed").forEach((r) => {
    alerts.push({ id: `alert-recall-${r.id}`, category: "stock", severity: "critical", message: `Active recall ${r.recallNumber} for ${inventoryItems.find((i) => i.id === r.itemId)?.name ?? "Item"}`, relatedId: r.id, createdAt: NOW });
  });

  inventoryPurchaseOrders.filter((po) => (po.status === "sent" || po.status === "acknowledged") && po.deliveryDate && daysUntil(po.deliveryDate) < 0).forEach((po) => {
    alerts.push({ id: `alert-po-overdue-${po.id}`, category: "procurement", severity: "critical", message: `Purchase order ${po.poNumber} delivery is overdue`, relatedId: po.id, createdAt: NOW });
  });

  inventoryPurchaseOrders.filter((po) => po.status === "partially-received").forEach((po) => {
    alerts.push({ id: `alert-po-partial-${po.id}`, category: "procurement", severity: "warning", message: `Purchase order ${po.poNumber} was only partially delivered`, relatedId: po.id, createdAt: NOW });
  });

  purchaseRequests.filter((pr) => pr.status === "submitted").forEach((pr) => {
    alerts.push({ id: `alert-pr-pending-${pr.id}`, category: "procurement", severity: "info", message: `Purchase request ${pr.requestNumber} pending approval`, relatedId: pr.id, createdAt: NOW });
  });

  inventoryAdjustments.filter((a) => a.status === "pending-approval").forEach((a) => {
    alerts.push({ id: `alert-adj-pending-${a.id}`, category: "operational", severity: "warning", message: `Stock adjustment ${a.id} pending approval`, relatedId: a.id, createdAt: NOW });
  });

  inventoryStockTransfers.filter((t) => t.status === "requested" || t.status === "approved").forEach((t) => {
    alerts.push({ id: `alert-transfer-pending-${t.id}`, category: "operational", severity: "info", message: `Stock transfer ${t.transferNumber} awaiting action`, relatedId: t.id, createdAt: NOW });
  });

  requisitions.filter((r) => r.status === "submitted" || r.status === "under-review").forEach((r) => {
    alerts.push({ id: `alert-req-pending-${r.id}`, category: "operational", severity: "info", message: `Requisition ${r.requisitionNumber} awaiting review`, relatedId: r.id, createdAt: NOW });
  });

  return mockRequest(alerts);
}

/** Synchronous internal helper (mirrors getExpiringInventoryBatches, avoids resolving a promise inside alert computation). */
function getExpiringInventoryBatchesSync(withinDays: number) {
  return inventoryBatches.filter((b) => b.status !== "expired" && b.status !== "disposed" && b.expiryDate && daysUntil(b.expiryDate) <= withinDays && daysUntil(b.expiryDate) >= 0);
}

/** Synchronous internal helper mirroring getStockOverview's computation, so alert generation doesn't need to unwrap a mock promise. */
function getStockOverviewSync(): ItemStockRow[] {
  return inventoryItems
    .filter((item) => item.status === "active")
    .map((item) => {
      let onHand = 0;
      let damaged = 0;
      let quarantined = 0;
      if (item.isSerialTracked) {
        const assets = serializedAssets.filter((a) => a.itemId === item.id);
        onHand = assets.filter((a) => a.status === "in-stock" || a.status === "in-use" || a.status === "under-maintenance").length;
      } else {
        const batches = inventoryBatches.filter((b) => b.itemId === item.id);
        onHand = batches.filter((b) => b.status === "available" || b.status === "low").reduce((sum, b) => sum + b.quantity, 0);
        damaged = batches.filter((b) => b.status === "damaged").reduce((sum, b) => sum + b.quantity, 0);
        quarantined = batches.filter((b) => b.status === "quarantined").reduce((sum, b) => sum + b.quantity, 0);
      }
      const reserved = computeReservedQuantity(item.id);
      const available = Math.max(0, onHand - reserved - quarantined - damaged);
      let status: StockStatus = "available";
      if (onHand === 0) status = "out-of-stock";
      else if (available <= item.reorderLevel) status = "low-stock";
      return { itemId: item.id, itemName: item.name, itemCode: item.itemCode, category: item.category, onHand, available, reserved, allocated: 0, damaged, quarantined, inTransit: 0, onOrder: 0, reorderLevel: item.reorderLevel, status };
    });
}

// --- Dashboard (spec §1) ------------------------------------------------------

export interface InventoryDashboardData {
  totalItems: number;
  activeItems: number;
  totalStockQuantity: number;
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringSoon: number;
  expiredItems: number;
  pendingPurchaseRequests: number;
  pendingPurchaseOrders: number;
  pendingGoodsReceipts: number;
  pendingTransfers: number;
  pendingApprovals: number;
  itemsInQuarantine: number;
  damagedItems: number;
  reorderRequired: number;
  stockConsumptionTrend: { date: string; quantity: number }[];
  stockByCategory: { category: ItemCategory; quantity: number }[];
  lowStockList: { itemName: string; available: number; reorderLevel: number }[];
  expiringSoonList: { itemName: string; batchNumber: string; expiryDate: string; daysToExpiry: number }[];
}

export function getInventoryDashboard() {
  const stockRows = getStockOverviewSync();
  const totalStockQuantity = stockRows.reduce((sum, r) => sum + r.onHand, 0);
  const totalInventoryValue = Math.round(
    inventoryBatches.filter((b) => b.status === "available" || b.status === "low").reduce((sum, b) => sum + b.quantity * b.unitCost, 0) +
      serializedAssets.filter((a) => a.status !== "retired" && a.status !== "lost").reduce((sum, a) => sum + (inventoryItems.find((i) => i.id === a.itemId)?.unitCost ?? 0), 0)
  );

  const consumptionMap = new Map<string, number>();
  stockMovements.filter((m) => m.quantityChange < 0 && m.movementType === "requisition-issue").forEach((m) => {
    const day = m.timestamp.slice(0, 10);
    consumptionMap.set(day, (consumptionMap.get(day) ?? 0) + Math.abs(m.quantityChange));
  });
  const stockConsumptionTrend = Array.from(consumptionMap.entries()).map(([date, quantity]) => ({ date, quantity })).sort((a, b) => a.date.localeCompare(b.date));

  const categoryMap = new Map<ItemCategory, number>();
  stockRows.forEach((r) => categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + r.onHand));
  const stockByCategory = Array.from(categoryMap.entries()).map(([category, quantity]) => ({ category, quantity }));

  const lowStockList = stockRows.filter((r) => r.status === "low-stock").map((r) => ({ itemName: r.itemName, available: r.available, reorderLevel: r.reorderLevel }));
  const expiringSoonList = getExpiringInventoryBatchesSync(30).map((b) => ({ itemName: inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Unknown Item", batchNumber: b.batchNumber, expiryDate: b.expiryDate!, daysToExpiry: daysUntil(b.expiryDate) }));

  const data: InventoryDashboardData = {
    totalItems: inventoryItems.length,
    activeItems: inventoryItems.filter((i) => i.status === "active").length,
    totalStockQuantity,
    totalInventoryValue,
    lowStockItems: stockRows.filter((r) => r.status === "low-stock").length,
    outOfStockItems: stockRows.filter((r) => r.status === "out-of-stock").length,
    expiringSoon: expiringSoonList.length,
    expiredItems: inventoryBatches.filter((b) => b.status === "expired").length,
    pendingPurchaseRequests: purchaseRequests.filter((p) => p.status === "submitted").length,
    pendingPurchaseOrders: inventoryPurchaseOrders.filter((p) => p.status === "sent" || p.status === "acknowledged").length,
    pendingGoodsReceipts: inventoryPurchaseOrders.filter((p) => p.status === "sent" || p.status === "partially-received").length,
    pendingTransfers: inventoryStockTransfers.filter((t) => t.status === "requested" || t.status === "approved" || t.status === "shipped" || t.status === "in-transit").length,
    pendingApprovals: requisitions.filter((r) => r.status === "submitted" || r.status === "under-review").length + inventoryAdjustments.filter((a) => a.status === "pending-approval").length + purchaseRequests.filter((p) => p.status === "submitted").length,
    itemsInQuarantine: inventoryBatches.filter((b) => b.status === "quarantined").length,
    damagedItems: inventoryBatches.filter((b) => b.status === "damaged").length,
    reorderRequired: stockRows.filter((r) => r.status === "low-stock" || r.status === "out-of-stock").length,
    stockConsumptionTrend,
    stockByCategory,
    lowStockList,
    expiringSoonList,
  };
  return mockRequest(data);
}

// --- Reports & Analytics (spec §43-44) ----------------------------------------

export interface InventoryReportsData {
  stockReport: { category: ItemCategory; itemCount: number; totalQuantity: number; totalValue: number }[];
  movementReport: { movementType: StockMovementType; count: number; totalQuantity: number }[];
  procurementReport: { supplierName: string; poCount: number; totalValue: number; onTimeDeliveryRate: number }[];
  consumptionByDepartment: { department: string; quantity: number }[];
}

export function getInventoryReports() {
  const stockRows = getStockOverviewSync();
  const categoryGroups = new Map<ItemCategory, { itemCount: number; totalQuantity: number; totalValue: number }>();
  stockRows.forEach((r) => {
    const item = inventoryItems.find((i) => i.id === r.itemId)!;
    const entry = categoryGroups.get(r.category) ?? { itemCount: 0, totalQuantity: 0, totalValue: 0 };
    entry.itemCount += 1;
    entry.totalQuantity += r.onHand;
    entry.totalValue += r.onHand * item.unitCost;
    categoryGroups.set(r.category, entry);
  });
  const stockReport = Array.from(categoryGroups.entries()).map(([category, v]) => ({ category, itemCount: v.itemCount, totalQuantity: v.totalQuantity, totalValue: Math.round(v.totalValue) }));

  const movementGroups = new Map<StockMovementType, { count: number; totalQuantity: number }>();
  stockMovements.forEach((m) => {
    const entry = movementGroups.get(m.movementType) ?? { count: 0, totalQuantity: 0 };
    entry.count += 1;
    entry.totalQuantity += Math.abs(m.quantityChange);
    movementGroups.set(m.movementType, entry);
  });
  const movementReport = Array.from(movementGroups.entries()).map(([movementType, v]) => ({ movementType, ...v }));

  const procurementReport = inventorySuppliers.map((s) => ({
    supplierName: s.name,
    poCount: inventoryPurchaseOrders.filter((po) => po.supplierId === s.id).length,
    totalValue: Math.round(inventoryPurchaseOrders.filter((po) => po.supplierId === s.id).reduce((sum, po) => sum + po.total, 0)),
    onTimeDeliveryRate: s.onTimeDeliveryRate,
  }));

  const deptMap = new Map<string, number>();
  stockMovements.filter((m) => m.movementType === "requisition-issue" && m.toLocation).forEach((m) => {
    const name = resolveDepartmentName(m.toLocation!);
    deptMap.set(name, (deptMap.get(name) ?? 0) + Math.abs(m.quantityChange));
  });
  const consumptionByDepartment = Array.from(deptMap.entries()).map(([department, quantity]) => ({ department, quantity }));

  const data: InventoryReportsData = { stockReport, movementReport, procurementReport, consumptionByDepartment };
  return mockRequest(data);
}

export interface InventoryAnalyticsData {
  inventoryTurnover: number;
  slowMovingItems: { itemName: string; daysSinceLastMovement: number }[];
  deadStockItems: { itemName: string; onHand: number }[];
  expiryLossValue: number;
  supplierPerformance: { supplierName: string; onTimeDeliveryRate: number; qualityIssueCount: number }[];
}

export function getInventoryAnalytics() {
  const stockRows = getStockOverviewSync();
  const totalValue = inventoryBatches.filter((b) => b.status === "available" || b.status === "low").reduce((sum, b) => sum + b.quantity * b.unitCost, 0);
  const totalConsumed = stockMovements.filter((m) => m.movementType === "requisition-issue").reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);
  const inventoryTurnover = totalValue > 0 ? Math.round((totalConsumed / (totalStockUnits() || 1)) * 100) / 100 : 0;

  const lastMovementByItem = new Map<string, string>();
  stockMovements.forEach((m) => {
    const existing = lastMovementByItem.get(m.itemId);
    if (!existing || m.timestamp > existing) lastMovementByItem.set(m.itemId, m.timestamp);
  });
  const slowMovingItems = inventoryItems
    .filter((i) => i.status === "active")
    .map((i) => ({ itemName: i.name, daysSinceLastMovement: lastMovementByItem.has(i.id) ? Math.floor((new Date(NOW).getTime() - new Date(lastMovementByItem.get(i.id)!).getTime()) / 86400000) : 999 }))
    .filter((r) => r.daysSinceLastMovement > 14)
    .sort((a, b) => b.daysSinceLastMovement - a.daysSinceLastMovement);

  const deadStockItems = stockRows.filter((r) => !lastMovementByItem.has(r.itemId) && r.onHand > 0).map((r) => ({ itemName: r.itemName, onHand: r.onHand }));

  const expiryLossValue = Math.round(inventoryBatches.filter((b) => b.status === "expired").reduce((sum, b) => sum + b.quantity * b.unitCost, 0));

  const supplierPerformance = inventorySuppliers.map((s) => ({ supplierName: s.name, onTimeDeliveryRate: s.onTimeDeliveryRate, qualityIssueCount: s.qualityIssueCount }));

  const data: InventoryAnalyticsData = { inventoryTurnover, slowMovingItems, deadStockItems, expiryLossValue, supplierPerformance };
  return mockRequest(data);
}

function totalStockUnits(): number {
  return getStockOverviewSync().reduce((sum, r) => sum + r.onHand, 0);
}

// --- Global Search (spec §45) -------------------------------------------------

export interface InventorySearchResult {
  type: "item" | "batch" | "asset";
  id: string;
  label: string;
  detail: string;
}

export function searchInventory(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return mockRequest([]);
  const results: InventorySearchResult[] = [];
  inventoryItems.forEach((i) => {
    if (i.name.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q) || (i.barcode ?? "").toLowerCase().includes(q) || (i.manufacturer ?? "").toLowerCase().includes(q)) {
      results.push({ type: "item", id: i.id, label: i.name, detail: `${i.itemCode} · ${i.category}` });
    }
  });
  inventoryBatches.forEach((b) => {
    if (b.batchNumber.toLowerCase().includes(q)) {
      results.push({ type: "batch", id: b.id, label: b.batchNumber, detail: inventoryItems.find((i) => i.id === b.itemId)?.name ?? "Unknown Item" });
    }
  });
  serializedAssets.forEach((a) => {
    if (a.serialNumber.toLowerCase().includes(q)) {
      results.push({ type: "asset", id: a.id, label: a.serialNumber, detail: inventoryItems.find((i) => i.id === a.itemId)?.name ?? "Unknown Item" });
    }
  });
  return mockRequest(results.slice(0, 25));
}

// --- Settings (spec §46) — overview linking to the screens that own each
// value, never a duplicate config surface. ------------------------------------

export interface InventorySettingsData {
  departmentName: string;
  activeItemCount: number;
  activeSupplierCount: number;
  warehouseCount: number;
  categoryCount: number;
  defaultAdjustmentApprovalThreshold: number;
}

export function getInventorySettings() {
  const data: InventorySettingsData = {
    departmentName: departmentConfigs.find((d) => d.id === "dept-inventory")?.name ?? "Inventory & Procurement",
    activeItemCount: inventoryItems.filter((i) => i.status === "active").length,
    activeSupplierCount: inventorySuppliers.filter((s) => s.status === "active").length,
    warehouseCount: warehouses.length,
    categoryCount: inventoryCategories.length,
    defaultAdjustmentApprovalThreshold: 20,
  };
  return mockRequest(data);
}

// --- Audit (spec §47) — logged from day one; every mutation above already
// calls this. -------------------------------------------------------------

export type InventoryAuditEntityType = "item" | "warehouse" | "batch" | "asset" | "implant-usage" | "reservation" | "requisition" | "return" | "transfer" | "supplier" | "purchase-request" | "purchase-order" | "goods-receipt" | "count" | "adjustment" | "recall" | "disposal";

export interface InventoryAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: InventoryAuditEntityType;
  entityId: string;
  detail?: string;
}

export const inventoryAuditLog: InventoryAuditEntry[] = [
  { id: "inv-audit-seed-1", timestamp: "2026-08-14T10:00:00", actor: "waqas-anjum", action: "Purchase order created", entityType: "purchase-order", entityId: "PO-2026-0001" },
];

function recordInventoryAudit(action: string, entityType: InventoryAuditEntityType, entityId: string, actor: string, detail?: string) {
  inventoryAuditLog.push({ id: `inv-audit-${inventoryAuditLog.length + 1}`, timestamp: NOW, actor, action, entityType, entityId, detail });
}

export function getInventoryAuditLog(filters: { entityType?: InventoryAuditEntityType; search?: string } = {}) {
  let rows = [...inventoryAuditLog].reverse();
  if (filters.entityType) rows = rows.filter((r) => r.entityType === filters.entityType);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.entityId.toLowerCase().includes(q) || r.actor.toLowerCase().includes(q) || r.action.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}
