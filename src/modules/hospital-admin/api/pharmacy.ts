import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { staffMembers } from "./staff";
import { patientSeeds } from "./patients";

// ============================================================================
// Pharmacy (Hospital Admin's [oversight] section — HOSPITAL_ADMIN_MODULE_MAP.md,
// full detail per PHARMACY_MODULE_SPEC.md). Built entirely in one pass per the
// user's own explicit instruction ("must complete also this not in phase just
// do all"), not phase-by-phase like every other module in this project.
//
// [oversight] scope: this supersedes the section's earlier "no dispensing
// screen" placeholder note, since the user's own spec explicitly asks for the
// full prescription→verification→dispensing→inventory workflow. What stays
// structured/administrative rather than deep clinical authorship: allergy/
// interaction/duplicate-therapy *warnings* are flags computed from structured
// data (patient allergy list, active medication list) — never a real clinical
// decision-support engine, per the spec's own "should not replace
// professional pharmacist/clinician judgment" instruction (§4).
//
// FHIR alignment (spec §20, §34): MedicationRequest→Prescription,
// MedicationDispense→DispenseRecord, Medication→Medication. Administration
// (MedicationAdministration) is deliberately NOT modeled here — that's
// nursing's own event, a different module's concern; this module owns
// ordering-visibility-through-dispensing only.
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

function resolvePatientName(patientId: string): string {
  return patientSeeds.find((p) => p.id === patientId)?.fullName ?? "Unknown Patient";
}

function resolveStaffName(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  return staffMembers.find((s) => s.id === staffId)?.name;
}

// A lightweight, module-local allergy list — patients.ts doesn't model
// AllergyIntolerance yet (a separate future phase per HMS_DOMAIN_STANDARDS.md
// §_), so Pharmacy keeps just enough structured data to power its own
// verification warnings honestly, without inventing a fuller clinical record.
const patientAllergyMap: Record<string, string[]> = {
  "p-ibrar-ahmad": ["Penicillin"],
  "p-fatima-sheikh": [],
  "p-ahsan-tariq": ["Sulfa drugs"],
  "p-zara-malik": [],
  "p-bilal-hussain": ["Aspirin", "NSAIDs"],
  "p-ayesha-raza": [],
  "p-kamal-siddiqui": ["Penicillin"],
  "p-hassan-abbasi": [],
  "p-mariam-farooq": [],
  "p-usman-khan": [],
  "p-noor-fatima": [],
  "p-hamza-butt": [],
  "p-saira-cheema": ["Codeine"],
  "p-omar-sethi": [],
  "p-layla-awan": [],
};

function getPatientAllergies(patientId: string): string[] {
  return patientAllergyMap[patientId] ?? [];
}

// --- Medication Catalog (spec §6-8) -----------------------------------------

export type MedicationForm = "tablet" | "capsule" | "syrup" | "solution" | "suspension" | "injection" | "cream" | "ointment" | "gel" | "drops" | "inhaler" | "suppository" | "patch" | "powder";
export type MedicationRoute = "oral" | "iv" | "im" | "subcutaneous" | "topical" | "inhalation" | "ophthalmic" | "otic" | "rectal" | "vaginal" | "sublingual";
export type MedicationStatus = "active" | "inactive" | "discontinued";

export interface Medication {
  id: string;
  genericName: string;
  brandName?: string;
  strength: string;
  form: MedicationForm;
  route: MedicationRoute;
  manufacturer: string;
  medicationCode: string;
  productCode?: string;
  packageSize: string;
  unit: string;
  status: MedicationStatus;
  prescriptionRequired: boolean;
  storageRequirements?: string;
  controlledSubstance: boolean;
  unitPrice: number;
}

export const medications: Medication[] = [
  { id: "med-1", genericName: "Paracetamol", brandName: "Panadol", strength: "500 mg", form: "tablet", route: "oral", manufacturer: "GSK", medicationCode: "MED-0001", productCode: "NDC-00001", packageSize: "10 tablets/strip", unit: "tablet", status: "active", prescriptionRequired: false, storageRequirements: "Store below 25°C", controlledSubstance: false, unitPrice: 0.15 },
  { id: "med-2", genericName: "Amoxicillin", brandName: "Amoxil", strength: "500 mg", form: "capsule", route: "oral", manufacturer: "Pfizer", medicationCode: "MED-0002", productCode: "NDC-00002", packageSize: "21 capsules/box", unit: "capsule", status: "active", prescriptionRequired: true, storageRequirements: "Store below 25°C", controlledSubstance: false, unitPrice: 0.45 },
  { id: "med-3", genericName: "Metformin", brandName: "Glucophage", strength: "500 mg", form: "tablet", route: "oral", manufacturer: "Merck", medicationCode: "MED-0003", packageSize: "30 tablets/bottle", unit: "tablet", status: "active", prescriptionRequired: true, controlledSubstance: false, unitPrice: 0.2 },
  { id: "med-4", genericName: "Atorvastatin", brandName: "Lipitor", strength: "20 mg", form: "tablet", route: "oral", manufacturer: "Pfizer", medicationCode: "MED-0004", packageSize: "30 tablets/bottle", unit: "tablet", status: "active", prescriptionRequired: true, controlledSubstance: false, unitPrice: 0.6 },
  { id: "med-5", genericName: "Omeprazole", brandName: "Losec", strength: "20 mg", form: "capsule", route: "oral", manufacturer: "AstraZeneca", medicationCode: "MED-0005", packageSize: "14 capsules/strip", unit: "capsule", status: "active", prescriptionRequired: true, controlledSubstance: false, unitPrice: 0.35 },
  { id: "med-6", genericName: "Insulin Glargine", brandName: "Lantus", strength: "100 units/mL", form: "injection", route: "subcutaneous", manufacturer: "Sanofi", medicationCode: "MED-0006", packageSize: "1 vial (10 mL)", unit: "vial", status: "active", prescriptionRequired: true, storageRequirements: "Refrigerate 2-8°C", controlledSubstance: false, unitPrice: 28.0 },
  { id: "med-7", genericName: "Morphine Sulfate", brandName: "MS Contin", strength: "10 mg", form: "tablet", route: "oral", manufacturer: "Purdue", medicationCode: "MED-0007", packageSize: "10 tablets/strip", unit: "tablet", status: "active", prescriptionRequired: true, storageRequirements: "Store in locked controlled-substance cabinet", controlledSubstance: true, unitPrice: 1.8 },
  { id: "med-8", genericName: "Diazepam", brandName: "Valium", strength: "5 mg", form: "tablet", route: "oral", manufacturer: "Roche", medicationCode: "MED-0008", packageSize: "10 tablets/strip", unit: "tablet", status: "active", prescriptionRequired: true, storageRequirements: "Store in locked controlled-substance cabinet", controlledSubstance: true, unitPrice: 0.9 },
  { id: "med-9", genericName: "Salbutamol", brandName: "Ventolin", strength: "100 mcg/dose", form: "inhaler", route: "inhalation", manufacturer: "GSK", medicationCode: "MED-0009", packageSize: "1 inhaler (200 doses)", unit: "inhaler", status: "active", prescriptionRequired: true, controlledSubstance: false, unitPrice: 6.5 },
  { id: "med-10", genericName: "Amlodipine", brandName: "Norvasc", strength: "5 mg", form: "tablet", route: "oral", manufacturer: "Pfizer", medicationCode: "MED-0010", packageSize: "30 tablets/bottle", unit: "tablet", status: "active", prescriptionRequired: true, controlledSubstance: false, unitPrice: 0.25 },
  { id: "med-11", genericName: "Ibuprofen", brandName: "Brufen", strength: "400 mg", form: "tablet", route: "oral", manufacturer: "Abbott", medicationCode: "MED-0011", packageSize: "10 tablets/strip", unit: "tablet", status: "active", prescriptionRequired: false, controlledSubstance: false, unitPrice: 0.18 },
  { id: "med-12", genericName: "Ceftriaxone", brandName: "Rocephin", strength: "1 g", form: "injection", route: "iv", manufacturer: "Roche", medicationCode: "MED-0012", packageSize: "1 vial", unit: "vial", status: "active", prescriptionRequired: true, storageRequirements: "Store below 25°C, protect from light", controlledSubstance: false, unitPrice: 4.2 },
  { id: "med-13", genericName: "Losartan", brandName: "Cozaar", strength: "50 mg", form: "tablet", route: "oral", manufacturer: "Merck", medicationCode: "MED-0013", packageSize: "30 tablets/bottle", unit: "tablet", status: "active", prescriptionRequired: true, controlledSubstance: false, unitPrice: 0.3 },
  { id: "med-14", genericName: "Warfarin", brandName: "Coumadin", strength: "5 mg", form: "tablet", route: "oral", manufacturer: "Bristol-Myers Squibb", medicationCode: "MED-0014", packageSize: "30 tablets/bottle", unit: "tablet", status: "active", prescriptionRequired: true, storageRequirements: "Requires regular INR monitoring", controlledSubstance: false, unitPrice: 0.4 },
  { id: "med-15", genericName: "Oral Rehydration Salts", brandName: "ORS", strength: "n/a", form: "powder", route: "oral", manufacturer: "Local Generics", medicationCode: "MED-0015", packageSize: "1 sachet", unit: "sachet", status: "active", prescriptionRequired: false, controlledSubstance: false, unitPrice: 0.1 },
];

export function getMedications(filters: { includeInactive?: boolean; search?: string } = {}) {
  let rows = filters.includeInactive ? medications : medications.filter((m) => m.status === "active");
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((m) => m.genericName.toLowerCase().includes(q) || (m.brandName ?? "").toLowerCase().includes(q) || m.medicationCode.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}

export interface NewMedicationInput {
  genericName: string;
  brandName?: string;
  strength: string;
  form: MedicationForm;
  route: MedicationRoute;
  manufacturer: string;
  packageSize: string;
  unit: string;
  prescriptionRequired: boolean;
  storageRequirements?: string;
  controlledSubstance: boolean;
  unitPrice: number;
}

/** Medications are hospital-configurable, never hardcoded — same lookup-table CRUD pattern as every other module's catalog. */
export function createMedication(input: NewMedicationInput) {
  const medication: Medication = { ...input, id: `med-${medications.length + 1}`, medicationCode: `MED-${String(medications.length + 1).padStart(4, "0")}`, status: "active" };
  medications.push(medication);
  recordPharmacyAudit("Medication added to catalog", "medication", medication.medicationCode, DEFAULT_ACTOR);
  return mockRequest(medication);
}

export function updateMedication(id: string, updates: Partial<NewMedicationInput>) {
  const medication = medications.find((m) => m.id === id);
  if (!medication) throw new Error("Medication not found");
  Object.assign(medication, updates);
  recordPharmacyAudit("Medication updated", "medication", medication.medicationCode, DEFAULT_ACTOR);
  return mockRequest(medication);
}

export function setMedicationStatus(id: string, status: MedicationStatus) {
  const medication = medications.find((m) => m.id === id);
  if (!medication) throw new Error("Medication not found");
  medication.status = status;
  recordPharmacyAudit(`Medication status set to ${status}`, "medication", medication.medicationCode, DEFAULT_ACTOR);
  return mockRequest(medication);
}

// --- Suppliers (spec §15) ----------------------------------------------------

export type SupplierStatus = "active" | "inactive" | "suspended";

export interface Supplier {
  id: string;
  name: string;
  licenseNumber?: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  status: SupplierStatus;
}

export const suppliers: Supplier[] = [
  { id: "sup-1", name: "MedSource Distributors", licenseNumber: "SUP-LIC-2201", contactName: "Farhan Iqbal", phone: "+1 (555) 300-1001", email: "orders@medsource.example", address: "12 Industrial Rd, Lahore", paymentTerms: "Net 30", status: "active" },
  { id: "sup-2", name: "Global Pharma Supply Co.", licenseNumber: "SUP-LIC-2202", contactName: "Ayesha Malik", phone: "+1 (555) 300-1002", email: "sales@globalpharma.example", address: "8 Commerce Ave, Karachi", paymentTerms: "Net 45", status: "active" },
  { id: "sup-3", name: "City Medical Wholesalers", licenseNumber: "SUP-LIC-2203", contactName: "Bilal Sheikh", phone: "+1 (555) 300-1003", email: "info@citymedwholesale.example", address: "5 Market St, Lahore", paymentTerms: "Net 15", status: "active" },
];

export function getSuppliers() {
  return mockRequest(suppliers);
}

export interface NewSupplierInput {
  name: string;
  licenseNumber?: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
}

export function createSupplier(input: NewSupplierInput) {
  const supplier: Supplier = { ...input, id: `sup-${suppliers.length + 1}`, status: "active" };
  suppliers.push(supplier);
  recordPharmacyAudit("Supplier added", "supplier", supplier.name, DEFAULT_ACTOR);
  return mockRequest(supplier);
}

export function updateSupplier(id: string, updates: Partial<NewSupplierInput>) {
  const supplier = suppliers.find((s) => s.id === id);
  if (!supplier) throw new Error("Supplier not found");
  Object.assign(supplier, updates);
  recordPharmacyAudit("Supplier updated", "supplier", supplier.name, DEFAULT_ACTOR);
  return mockRequest(supplier);
}

export function setSupplierStatus(id: string, status: SupplierStatus) {
  const supplier = suppliers.find((s) => s.id === id);
  if (!supplier) throw new Error("Supplier not found");
  supplier.status = status;
  recordPharmacyAudit(`Supplier status set to ${status}`, "supplier", supplier.name, DEFAULT_ACTOR);
  return mockRequest(supplier);
}

// --- Pharmacy Locations (spec §17) ------------------------------------------

export type PharmacyLocationType = "main" | "emergency" | "opd" | "inpatient" | "icu" | "pediatric" | "satellite";

export interface PharmacyLocation {
  id: string;
  name: string;
  type: PharmacyLocationType;
}

export const pharmacyLocations: PharmacyLocation[] = [
  { id: "loc-main", name: "Main Pharmacy", type: "main" },
  { id: "loc-er", name: "Emergency Pharmacy", type: "emergency" },
  { id: "loc-opd", name: "OPD Pharmacy", type: "opd" },
  { id: "loc-ipd", name: "Inpatient Pharmacy", type: "inpatient" },
  { id: "loc-icu", name: "ICU Pharmacy", type: "icu" },
];

export function getPharmacyLocations() {
  return mockRequest(pharmacyLocations);
}

// --- Batch Management (spec §10) — never just a quantity count; every unit
// of stock traces back to a specific batch. -----------------------------------

export type BatchStatus = "available" | "low" | "expired" | "quarantined" | "damaged" | "reserved";

export interface Batch {
  id: string;
  batchNumber: string;
  medicationId: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  supplierId: string;
  storageLocationId: string;
  status: BatchStatus;
}

export const batches: Batch[] = [
  { id: "batch-1", batchNumber: "B-2026-001", medicationId: "med-1", manufacturingDate: "2025-06-01", expiryDate: "2027-06-01", quantity: 4800, unitCost: 0.08, sellingPrice: 0.15, supplierId: "sup-1", storageLocationId: "loc-main", status: "available" },
  { id: "batch-2", batchNumber: "B-2026-002", medicationId: "med-2", manufacturingDate: "2025-09-01", expiryDate: "2026-09-15", quantity: 1260, unitCost: 0.25, sellingPrice: 0.45, supplierId: "sup-1", storageLocationId: "loc-main", status: "available" },
  { id: "batch-3", batchNumber: "B-2026-003", medicationId: "med-3", manufacturingDate: "2025-04-01", expiryDate: "2027-04-01", quantity: 900, unitCost: 0.1, sellingPrice: 0.2, supplierId: "sup-2", storageLocationId: "loc-main", status: "available" },
  { id: "batch-4", batchNumber: "B-2026-004", medicationId: "med-4", manufacturingDate: "2025-03-01", expiryDate: "2026-09-05", quantity: 25, unitCost: 0.3, sellingPrice: 0.6, supplierId: "sup-2", storageLocationId: "loc-main", status: "low" },
  { id: "batch-5", batchNumber: "B-2026-005", medicationId: "med-5", manufacturingDate: "2025-05-01", expiryDate: "2026-08-28", quantity: 560, unitCost: 0.18, sellingPrice: 0.35, supplierId: "sup-1", storageLocationId: "loc-main", status: "available" },
  { id: "batch-6", batchNumber: "B-2026-006", medicationId: "med-6", manufacturingDate: "2025-07-01", expiryDate: "2027-01-01", quantity: 40, unitCost: 22.0, sellingPrice: 28.0, supplierId: "sup-3", storageLocationId: "loc-main", status: "available" },
  { id: "batch-7", batchNumber: "B-2026-007", medicationId: "med-7", manufacturingDate: "2025-02-01", expiryDate: "2027-02-01", quantity: 300, unitCost: 1.2, sellingPrice: 1.8, supplierId: "sup-3", storageLocationId: "loc-main", status: "available" },
  { id: "batch-8", batchNumber: "B-2026-008", medicationId: "med-8", manufacturingDate: "2025-02-01", expiryDate: "2027-02-01", quantity: 250, unitCost: 0.6, sellingPrice: 0.9, supplierId: "sup-3", storageLocationId: "loc-main", status: "available" },
  { id: "batch-9", batchNumber: "B-2026-009", medicationId: "med-9", manufacturingDate: "2025-06-01", expiryDate: "2026-08-25", quantity: 8, unitCost: 5.0, sellingPrice: 6.5, supplierId: "sup-1", storageLocationId: "loc-main", status: "low" },
  { id: "batch-10", batchNumber: "B-2026-010", medicationId: "med-10", manufacturingDate: "2025-05-01", expiryDate: "2027-05-01", quantity: 720, unitCost: 0.15, sellingPrice: 0.25, supplierId: "sup-2", storageLocationId: "loc-main", status: "available" },
  { id: "batch-11", batchNumber: "B-2025-311", medicationId: "med-11", manufacturingDate: "2024-08-01", expiryDate: "2026-08-10", quantity: 0, unitCost: 0.1, sellingPrice: 0.18, supplierId: "sup-1", storageLocationId: "loc-main", status: "expired" },
  { id: "batch-12", batchNumber: "B-2026-012", medicationId: "med-12", manufacturingDate: "2025-08-01", expiryDate: "2026-09-01", quantity: 150, unitCost: 3.0, sellingPrice: 4.2, supplierId: "sup-2", storageLocationId: "loc-main", status: "available" },
  { id: "batch-13", batchNumber: "B-2026-013", medicationId: "med-13", manufacturingDate: "2025-04-01", expiryDate: "2027-04-01", quantity: 640, unitCost: 0.2, sellingPrice: 0.3, supplierId: "sup-3", storageLocationId: "loc-main", status: "available" },
  { id: "batch-14", batchNumber: "B-2026-014", medicationId: "med-14", manufacturingDate: "2025-03-01", expiryDate: "2027-03-01", quantity: 300, unitCost: 0.25, sellingPrice: 0.4, supplierId: "sup-2", storageLocationId: "loc-main", status: "available" },
  { id: "batch-15", batchNumber: "B-2026-015", medicationId: "med-15", manufacturingDate: "2025-06-01", expiryDate: "2028-06-01", quantity: 3000, unitCost: 0.05, sellingPrice: 0.1, supplierId: "sup-1", storageLocationId: "loc-main", status: "available" },
  { id: "batch-16", batchNumber: "B-2026-016", medicationId: "med-2", manufacturingDate: "2026-01-01", expiryDate: "2026-09-30", quantity: 400, unitCost: 0.25, sellingPrice: 0.45, supplierId: "sup-1", storageLocationId: "loc-main", status: "quarantined" },
  // Ibuprofen's only other batch (batch-11) is deliberately expired as the
  // demonstration example for Expiry Management — this one gives med-11 real
  // dispensable stock, so an active prescription for it (e.g. RX-2026-0011)
  // isn't stuck against zero available inventory.
  { id: "batch-17", batchNumber: "B-2026-017", medicationId: "med-11", manufacturingDate: "2025-09-01", expiryDate: "2027-03-01", quantity: 640, unitCost: 0.1, sellingPrice: 0.18, supplierId: "sup-1", storageLocationId: "loc-main", status: "available" },
];

export interface BatchRow extends Batch {
  medicationName: string;
  supplierName: string;
  locationName: string;
  daysUntilExpiry: number;
}

function daysUntil(dateStr: string): number {
  return Math.round((new Date(`${dateStr}T00:00:00`).getTime() - new Date(`${TODAY}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24));
}

function toBatchRow(b: Batch): BatchRow {
  const medication = medications.find((m) => m.id === b.medicationId);
  return {
    ...b,
    medicationName: medication ? `${medication.genericName} ${medication.strength}` : b.medicationId,
    supplierName: suppliers.find((s) => s.id === b.supplierId)?.name ?? "—",
    locationName: pharmacyLocations.find((l) => l.id === b.storageLocationId)?.name ?? "—",
    daysUntilExpiry: daysUntil(b.expiryDate),
  };
}

export function getBatches(filters: { status?: BatchStatus; medicationId?: string } = {}) {
  let rows = batches.map(toBatchRow);
  if (filters.status) rows = rows.filter((b) => b.status === filters.status);
  if (filters.medicationId) rows = rows.filter((b) => b.medicationId === filters.medicationId);
  return mockRequest(rows.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)));
}

export function getExpiringBatches(withinDays: number) {
  const rows = batches.filter((b) => b.status !== "expired" && daysUntil(b.expiryDate) <= withinDays && daysUntil(b.expiryDate) >= 0).map(toBatchRow);
  return mockRequest(rows.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry));
}

export function quarantineBatch(id: string, actor: string = DEFAULT_ACTOR) {
  const batch = batches.find((b) => b.id === id);
  if (!batch) throw new Error("Batch not found");
  batch.status = "quarantined";
  recordStockTransaction(batch.medicationId, batch.id, "adjustment", 0, "Quarantined", actor);
  recordPharmacyAudit("Batch quarantined", "batch", batch.batchNumber, actor);
  return mockRequest(batch);
}

export function markBatchExpired(id: string, actor: string = DEFAULT_ACTOR) {
  const batch = batches.find((b) => b.id === id);
  if (!batch) throw new Error("Batch not found");
  batch.status = "expired";
  recordStockTransaction(batch.medicationId, batch.id, "expiry", -batch.quantity, "Marked expired", actor);
  batch.quantity = 0;
  recordPharmacyAudit("Batch marked expired", "batch", batch.batchNumber, actor);
  return mockRequest(batch);
}

export function returnBatchToSupplier(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const batch = batches.find((b) => b.id === id);
  if (!batch) throw new Error("Batch not found");
  recordStockTransaction(batch.medicationId, batch.id, "return", -batch.quantity, `Returned to supplier: ${reason}`, actor);
  batch.quantity = 0;
  batch.status = "quarantined";
  recordPharmacyAudit("Batch returned to supplier", "batch", batch.batchNumber, actor, reason);
  return mockRequest(batch);
}

// --- Stock Movement (spec §12) — every inventory change produces a
// transaction; auditable by construction, not bolted on afterward. ---------

export type StockTransactionType = "purchase" | "dispense" | "return" | "transfer" | "adjustment" | "expiry" | "damage" | "disposal" | "correction";

export interface StockTransaction {
  id: string;
  medicationId: string;
  batchId?: string;
  type: StockTransactionType;
  quantityChange: number;
  note?: string;
  actor: string;
  timestamp: string;
}

export const stockTransactions: StockTransaction[] = [];

function recordStockTransaction(medicationId: string, batchId: string | undefined, type: StockTransactionType, quantityChange: number, note: string | undefined, actor: string) {
  stockTransactions.push({ id: `stx-${stockTransactions.length + 1}`, medicationId, batchId, type, quantityChange, note, actor, timestamp: NOW });
}

export interface StockTransactionRow extends StockTransaction {
  medicationName: string;
  batchNumber?: string;
}

export function getStockTransactions(filters: { medicationId?: string; type?: StockTransactionType } = {}) {
  let rows: StockTransactionRow[] = stockTransactions.map((t) => ({
    ...t,
    medicationName: medications.find((m) => m.id === t.medicationId)?.genericName ?? t.medicationId,
    batchNumber: t.batchId ? batches.find((b) => b.id === t.batchId)?.batchNumber : undefined,
  }));
  if (filters.medicationId) rows = rows.filter((r) => r.medicationId === filters.medicationId);
  if (filters.type) rows = rows.filter((r) => r.type === filters.type);
  return mockRequest(rows.slice().reverse());
}

export function recordStockAdjustment(medicationId: string, batchId: string, quantityChange: number, note: string, actor: string = DEFAULT_ACTOR) {
  const batch = batches.find((b) => b.id === batchId);
  if (!batch) throw new Error("Batch not found");
  batch.quantity += quantityChange;
  recordStockTransaction(medicationId, batchId, "adjustment", quantityChange, note, actor);
  recordPharmacyAudit("Stock adjustment recorded", "batch", batch.batchNumber, actor, note);
  return mockRequest(batch);
}

// --- Inventory overview (spec §9) --------------------------------------------

export interface InventoryOverview {
  totalProducts: number;
  available: number;
  lowStock: number;
  outOfStock: number;
  expiring: number;
  expired: number;
  quarantined: number;
  damaged: number;
  inventoryValue: number;
}

export function getInventoryOverview() {
  const totalProducts = medications.filter((m) => m.status === "active").length;
  const stockByMed = new Map<string, number>();
  batches.forEach((b) => {
    if (b.status === "available" || b.status === "low") stockByMed.set(b.medicationId, (stockByMed.get(b.medicationId) ?? 0) + b.quantity);
  });
  const available = Array.from(stockByMed.values()).filter((q) => q > 20).length;
  const lowStock = batches.filter((b) => b.status === "low").length;
  const outOfStock = medications.filter((m) => m.status === "active" && !stockByMed.has(m.id)).length;
  const expiring = batches.filter((b) => b.status !== "expired" && daysUntil(b.expiryDate) <= 90 && daysUntil(b.expiryDate) >= 0).length;
  const expired = batches.filter((b) => b.status === "expired").length;
  const quarantined = batches.filter((b) => b.status === "quarantined").length;
  const damaged = batches.filter((b) => b.status === "damaged").length;
  const inventoryValue = batches.filter((b) => b.status === "available" || b.status === "low").reduce((sum, b) => sum + b.quantity * b.unitCost, 0);

  const data: InventoryOverview = { totalProducts, available, lowStock, outOfStock, expiring, expired, quarantined, damaged, inventoryValue: Math.round(inventoryValue) };
  return mockRequest(data);
}

// --- Prescriptions / Pharmacy Work Queue (spec §2-4, §29) ------------------

export type PrescriptionStatus =
  | "new"
  | "received"
  | "under-review"
  | "verified"
  | "preparing"
  | "ready"
  | "dispensing"
  | "dispensed"
  | "cancelled"
  | "rejected"
  | "partially-dispensed"
  | "returned"
  | "expired";

export type PrescriptionPriority = "routine" | "urgent" | "stat";

export interface PrescriptionItem {
  id: string;
  medicationId: string;
  dose: string;
  route: MedicationRoute;
  frequency: string;
  duration: string;
  quantity: number;
  refillsAllowed: number;
  refillsUsed: number;
  instructions?: string;
  startDate: string;
  endDate?: string;
  quantityDispensed: number;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  encounterId?: string;
  prescriberId: string;
  departmentId: string;
  prescriptionDate: string;
  priority: PrescriptionPriority;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  pharmacistId?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  cancelledReason?: string;
  rejectedReason?: string;
  returnedReason?: string;
  lastActionBy?: string;
  lastActionAt?: string;
}

export const prescriptions: Prescription[] = [
  {
    id: "rx-1", prescriptionNumber: "RX-2026-000001", patientId: "p-ibrar-ahmad", prescriberId: "sarah-jenkins", departmentId: "dept-cardiology", prescriptionDate: `${TODAY}T08:00:00`, priority: "routine", status: "dispensed",
    items: [{ id: "rxi-1", medicationId: "med-3", dose: "500 mg", route: "oral", frequency: "2 times/day", duration: "30 days", quantity: 60, refillsAllowed: 3, refillsUsed: 0, startDate: TODAY, quantityDispensed: 60, instructions: "Take with food" }],
    pharmacistId: "nadia-khokhar", verifiedAt: `${TODAY}T08:20:00`, verifiedBy: "nadia-khokhar", dispensedAt: `${TODAY}T08:40:00`, dispensedBy: "usman-farooq",
  },
  {
    id: "rx-2", prescriptionNumber: "RX-2026-000002", patientId: "p-fatima-sheikh", prescriberId: "michael-chen", departmentId: "dept-opd", prescriptionDate: `${TODAY}T09:00:00`, priority: "routine", status: "ready",
    items: [{ id: "rxi-2", medicationId: "med-2", dose: "500 mg", route: "oral", frequency: "3 times/day", duration: "7 days", quantity: 21, refillsAllowed: 0, refillsUsed: 0, startDate: TODAY, quantityDispensed: 0, instructions: "Complete full course" }],
    pharmacistId: "nadia-khokhar", verifiedAt: `${TODAY}T09:25:00`, verifiedBy: "nadia-khokhar",
  },
  {
    id: "rx-3", prescriptionNumber: "RX-2026-000003", patientId: "p-usman-khan", prescriberId: "sarah-jenkins", departmentId: "dept-cardiology", prescriptionDate: `${TODAY}T09:30:00`, priority: "urgent", status: "under-review",
    items: [{ id: "rxi-3", medicationId: "med-14", dose: "5 mg", route: "oral", frequency: "1 time/day", duration: "30 days", quantity: 30, refillsAllowed: 1, refillsUsed: 0, startDate: TODAY, quantityDispensed: 0, instructions: "Regular INR monitoring required" }],
  },
  {
    id: "rx-4", prescriptionNumber: "RX-2026-000004", patientId: "p-noor-fatima", prescriberId: "michael-chen", departmentId: "dept-opd", prescriptionDate: `${TODAY}T10:00:00`, priority: "routine", status: "new",
    items: [{ id: "rxi-4", medicationId: "med-9", dose: "100 mcg/dose", route: "inhalation", frequency: "As needed", duration: "30 days", quantity: 1, refillsAllowed: 2, refillsUsed: 0, startDate: TODAY, quantityDispensed: 0 }],
  },
  {
    id: "rx-5", prescriptionNumber: "RX-2026-000005", patientId: "p-kamal-siddiqui", prescriberId: "elena-rostova", departmentId: "dept-radiology", prescriptionDate: `${TODAY}T10:15:00`, priority: "routine", status: "new",
    items: [{ id: "rxi-5", medicationId: "med-2", dose: "500 mg", route: "oral", frequency: "3 times/day", duration: "5 days", quantity: 15, refillsAllowed: 0, refillsUsed: 0, startDate: TODAY, quantityDispensed: 0 }],
  },
  {
    id: "rx-6", prescriptionNumber: "RX-2026-000006", patientId: "p-hassan-abbasi", prescriberId: "robert-vance", departmentId: "dept-neurology", prescriptionDate: `${TODAY}T10:45:00`, priority: "stat", status: "preparing",
    items: [{ id: "rxi-6", medicationId: "med-7", dose: "10 mg", route: "oral", frequency: "Every 6 hours", duration: "3 days", quantity: 12, refillsAllowed: 0, refillsUsed: 0, startDate: TODAY, quantityDispensed: 0, instructions: "Controlled substance — verify identity before dispensing" }],
    pharmacistId: "nadia-khokhar", verifiedAt: `${TODAY}T11:00:00`, verifiedBy: "nadia-khokhar",
  },
  {
    id: "rx-7", prescriptionNumber: "RX-2026-000007", patientId: "p-mariam-farooq", prescriberId: "michael-chen", departmentId: "dept-opd", prescriptionDate: `${TODAY}T11:00:00`, priority: "routine", status: "dispensing",
    items: [{ id: "rxi-7", medicationId: "med-4", dose: "20 mg", route: "oral", frequency: "1 time/day", duration: "30 days", quantity: 30, refillsAllowed: 3, refillsUsed: 0, startDate: TODAY, quantityDispensed: 0, instructions: "Take at bedtime" }],
    pharmacistId: "nadia-khokhar", verifiedAt: `${TODAY}T11:20:00`, verifiedBy: "nadia-khokhar",
  },
  {
    id: "rx-8", prescriptionNumber: "RX-2026-000008", patientId: "p-hamza-butt", prescriberId: "sarah-jenkins", departmentId: "dept-cardiology", prescriptionDate: "2026-08-13T10:00:00", priority: "routine", status: "partially-dispensed",
    items: [{ id: "rxi-8", medicationId: "med-9", dose: "100 mcg/dose", route: "inhalation", frequency: "As needed", duration: "30 days", quantity: 2, refillsAllowed: 1, refillsUsed: 0, startDate: "2026-08-13", quantityDispensed: 1 }],
    pharmacistId: "nadia-khokhar", verifiedAt: "2026-08-13T10:30:00", verifiedBy: "nadia-khokhar", dispensedAt: "2026-08-13T11:00:00", dispensedBy: "usman-farooq",
  },
  {
    id: "rx-9", prescriptionNumber: "RX-2026-000009", patientId: "p-omar-sethi", prescriberId: "robert-vance", departmentId: "dept-neurology", prescriptionDate: "2026-08-12T09:00:00", priority: "routine", status: "cancelled",
    items: [{ id: "rxi-9", medicationId: "med-8", dose: "5 mg", route: "oral", frequency: "2 times/day", duration: "14 days", quantity: 28, refillsAllowed: 0, refillsUsed: 0, startDate: "2026-08-12", quantityDispensed: 0 }],
    cancelledReason: "Patient no longer requires medication",
  },
  {
    id: "rx-10", prescriptionNumber: "RX-2026-000010", patientId: "p-layla-awan", prescriberId: "michael-chen", departmentId: "dept-opd", prescriptionDate: "2026-08-11T09:00:00", priority: "routine", status: "returned",
    items: [{ id: "rxi-10", medicationId: "med-11", dose: "400 mg", route: "oral", frequency: "3 times/day", duration: "5 days", quantity: 15, refillsAllowed: 0, refillsUsed: 0, startDate: "2026-08-11", quantityDispensed: 15 }],
    pharmacistId: "nadia-khokhar", verifiedAt: "2026-08-11T09:20:00", verifiedBy: "nadia-khokhar", dispensedAt: "2026-08-11T09:40:00", dispensedBy: "usman-farooq", returnedReason: "Patient reported adverse reaction",
  },
  {
    id: "rx-11", prescriptionNumber: "RX-2026-000011", patientId: "p-bilal-hussain", prescriberId: "robert-vance", departmentId: "dept-neurology", prescriptionDate: `${TODAY}T11:30:00`, priority: "urgent", status: "new",
    items: [{ id: "rxi-11", medicationId: "med-11", dose: "400 mg", route: "oral", frequency: "3 times/day", duration: "5 days", quantity: 15, refillsAllowed: 0, refillsUsed: 0, startDate: TODAY, quantityDispensed: 0 }],
  },
];

function findPrescriptionOrThrow(id: string): Prescription {
  const rx = prescriptions.find((p) => p.id === id);
  if (!rx) throw new Error(`Prescription ${id} not found`);
  return rx;
}

export interface PrescriptionRow {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  encounterId?: string;
  prescriberName: string;
  departmentName: string;
  medicationSummary: string;
  totalQuantity: number;
  priority: PrescriptionPriority;
  status: PrescriptionStatus;
  prescriptionDate: string;
  pharmacistName?: string;
  controlledSubstance: boolean;
}

function toPrescriptionRow(rx: Prescription): PrescriptionRow {
  const firstMed = medications.find((m) => m.id === rx.items[0]?.medicationId);
  const department = departmentConfigs.find((d) => d.id === rx.departmentId);
  return {
    id: rx.id,
    prescriptionNumber: rx.prescriptionNumber,
    patientId: rx.patientId,
    patientName: resolvePatientName(rx.patientId),
    encounterId: rx.encounterId,
    prescriberName: resolveStaffName(rx.prescriberId) ?? "Unknown",
    departmentName: department?.name ?? "Unassigned",
    medicationSummary: rx.items.length > 1 ? `${firstMed?.genericName ?? "—"} +${rx.items.length - 1} more` : firstMed ? `${firstMed.genericName} ${firstMed.strength}` : "—",
    totalQuantity: rx.items.reduce((sum, i) => sum + i.quantity, 0),
    priority: rx.priority,
    status: rx.status,
    prescriptionDate: rx.prescriptionDate,
    pharmacistName: resolveStaffName(rx.pharmacistId),
    controlledSubstance: rx.items.some((i) => medications.find((m) => m.id === i.medicationId)?.controlledSubstance),
  };
}

export function getPrescriptions(filters: { status?: PrescriptionStatus; priority?: PrescriptionPriority; search?: string } = {}) {
  let rows = prescriptions.map(toPrescriptionRow);
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.priority) rows = rows.filter((r) => r.priority === filters.priority);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.prescriptionNumber.toLowerCase().includes(q) || r.patientName.toLowerCase().includes(q) || r.medicationSummary.toLowerCase().includes(q));
  }
  return mockRequest(rows.sort((a, b) => (a.prescriptionDate < b.prescriptionDate ? 1 : -1)));
}

export interface PrescriptionItemRow extends PrescriptionItem {
  medicationName: string;
  medicationStrength: string;
  form: MedicationForm;
}

export interface PrescriptionDetail extends PrescriptionRow {
  itemRows: PrescriptionItemRow[];
  cancelledReason?: string;
  rejectedReason?: string;
  returnedReason?: string;
  verifiedAt?: string;
  verifiedByName?: string;
  dispensedAt?: string;
  dispensedByName?: string;
}

export function getPrescription(id: string) {
  const rx = prescriptions.find((p) => p.id === id);
  if (!rx) return mockRequest(null as PrescriptionDetail | null);
  const row = toPrescriptionRow(rx);
  const detail: PrescriptionDetail = {
    ...row,
    itemRows: rx.items.map((i) => {
      const med = medications.find((m) => m.id === i.medicationId);
      return { ...i, medicationName: med?.genericName ?? "Unknown", medicationStrength: med?.strength ?? "", form: med?.form ?? "tablet" };
    }),
    cancelledReason: rx.cancelledReason,
    rejectedReason: rx.rejectedReason,
    returnedReason: rx.returnedReason,
    verifiedAt: rx.verifiedAt,
    verifiedByName: resolveStaffName(rx.verifiedBy),
    dispensedAt: rx.dispensedAt,
    dispensedByName: resolveStaffName(rx.dispensedBy),
  };
  return mockRequest(detail);
}

// --- Medication Verification (spec §4) — warnings are flags computed from
// real structured data (allergy list, active prescriptions, batch stock),
// never a clinical-decision-support engine that replaces pharmacist
// judgment. ------------------------------------------------------------------

export interface VerificationWarning {
  type: "allergy" | "duplicate-therapy" | "expired-medication" | "stock-unavailable" | "missing-information";
  message: string;
}

// A documented allergy term (e.g. "Penicillin", "NSAIDs") rarely matches a
// medication's generic name as a literal substring — real pharmacist
// cross-checks work at the drug-class level. This is a small, explicit
// lookup of well-established class relationships (Penicillin-class →
// Amoxicillin, NSAIDs → Ibuprofen/Aspirin), not a clinical-reasoning engine —
// still just structured data driving a flag, per the spec's own "should not
// replace professional pharmacist/clinician judgment" instruction (§4).
const allergyClassMap: Record<string, string[]> = {
  penicillin: ["amoxicillin", "ampicillin"],
  nsaids: ["ibuprofen", "aspirin", "naproxen", "diclofenac"],
  aspirin: ["aspirin"],
  "sulfa drugs": ["sulfamethoxazole", "sulfasalazine"],
  codeine: ["codeine"],
};

export function getVerificationWarnings(prescriptionId: string): VerificationWarning[] {
  const rx = findPrescriptionOrThrow(prescriptionId);
  const warnings: VerificationWarning[] = [];
  const allergies = getPatientAllergies(rx.patientId).map((a) => a.toLowerCase());

  rx.items.forEach((item) => {
    const med = medications.find((m) => m.id === item.medicationId);
    if (!med) {
      warnings.push({ type: "missing-information", message: "Medication reference is missing from the catalog." });
      return;
    }
    const genericLower = med.genericName.toLowerCase();
    const matchedAllergy = allergies.find((a) => genericLower.includes(a) || a.includes(genericLower) || (allergyClassMap[a] ?? []).some((related) => genericLower.includes(related)));
    if (matchedAllergy) {
      warnings.push({ type: "allergy", message: `Patient has a documented allergy (${matchedAllergy}) that relates to ${med.genericName}.` });
    }
    const activeSameMed = prescriptions.filter(
      (p) => p.id !== rx.id && p.patientId === rx.patientId && !["cancelled", "rejected", "expired", "returned"].includes(p.status) && p.items.some((i) => i.medicationId === item.medicationId)
    );
    if (activeSameMed.length > 0) {
      warnings.push({ type: "duplicate-therapy", message: `Patient already has an active prescription for ${med.genericName}.` });
    }
    const availableBatches = batches.filter((b) => b.medicationId === item.medicationId && (b.status === "available" || b.status === "low"));
    const totalAvailable = availableBatches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalAvailable < item.quantity) {
      warnings.push({ type: "stock-unavailable", message: `Only ${totalAvailable} ${med.unit}(s) of ${med.genericName} in stock — ${item.quantity} required.` });
    }
    const hasExpired = availableBatches.every((b) => daysUntil(b.expiryDate) < 0);
    if (availableBatches.length > 0 && hasExpired) {
      warnings.push({ type: "expired-medication", message: `All available batches of ${med.genericName} have expired.` });
    }
  });

  return warnings;
}

// --- Prescription workflow mutations (spec §2, §29) -------------------------

export function receivePrescription(id: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "received";
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Prescription received", "prescription", rx.prescriptionNumber, actor);
  return mockRequest(toPrescriptionRow(rx));
}

export function startPrescriptionReview(id: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "under-review";
  rx.pharmacistId = actor;
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Verification started", "prescription", rx.prescriptionNumber, actor);
  return mockRequest(toPrescriptionRow(rx));
}

export function verifyPrescription(id: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "verified";
  rx.verifiedAt = NOW;
  rx.verifiedBy = actor;
  rx.pharmacistId = actor;
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Prescription verified", "prescription", rx.prescriptionNumber, actor);
  return mockRequest(toPrescriptionRow(rx));
}

export function rejectPrescription(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "rejected";
  rx.rejectedReason = reason;
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Prescription rejected", "prescription", rx.prescriptionNumber, actor, reason);
  return mockRequest(toPrescriptionRow(rx));
}

export function startPreparing(id: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "preparing";
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Preparation started", "prescription", rx.prescriptionNumber, actor);
  return mockRequest(toPrescriptionRow(rx));
}

export function markReadyForDispensing(id: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "ready";
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Marked ready for dispensing", "prescription", rx.prescriptionNumber, actor);
  return mockRequest(toPrescriptionRow(rx));
}

export function cancelPrescription(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  if (rx.status === "dispensed") throw new Error("A fully dispensed prescription cannot be cancelled");
  rx.status = "cancelled";
  rx.cancelledReason = reason;
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Prescription cancelled", "prescription", rx.prescriptionNumber, actor, reason);
  return mockRequest(toPrescriptionRow(rx));
}

/** Dispensing (spec §2-3): decrements real batch stock (never a silent quantity edit), auto-selecting the earliest-expiry available batch (FEFO), logs a stock transaction, and — for controlled substances — a Controlled Medication Register entry. */
export function dispensePrescription(id: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "dispensing";
  let allFullyDispensed = true;

  rx.items.forEach((item) => {
    const remaining = item.quantity - item.quantityDispensed;
    if (remaining <= 0) return;
    const availableBatches = batches.filter((b) => b.medicationId === item.medicationId && (b.status === "available" || b.status === "low") && daysUntil(b.expiryDate) >= 0).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
    let toDispense = remaining;
    for (const batch of availableBatches) {
      if (toDispense <= 0) break;
      const fromThisBatch = Math.min(batch.quantity, toDispense);
      if (fromThisBatch <= 0) continue;
      batch.quantity -= fromThisBatch;
      if (batch.quantity <= 20 && batch.status === "available") batch.status = "low";
      recordStockTransaction(item.medicationId, batch.id, "dispense", -fromThisBatch, `Dispensed for ${rx.prescriptionNumber}`, actor);
      const med = medications.find((m) => m.id === item.medicationId);
      if (med?.controlledSubstance) recordControlledRegisterEntry(med.id, batch.id, fromThisBatch, rx, actor);
      toDispense -= fromThisBatch;
      item.quantityDispensed += fromThisBatch;
    }
    if (item.quantityDispensed < item.quantity) allFullyDispensed = false;
  });

  rx.status = allFullyDispensed ? "dispensed" : "partially-dispensed";
  rx.dispensedAt = NOW;
  rx.dispensedBy = actor;
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit(allFullyDispensed ? "Prescription fully dispensed" : "Prescription partially dispensed", "prescription", rx.prescriptionNumber, actor);
  return mockRequest(toPrescriptionRow(rx));
}

export function recordPrescriptionReturn(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const rx = findPrescriptionOrThrow(id);
  rx.status = "returned";
  rx.returnedReason = reason;
  rx.lastActionBy = actor;
  rx.lastActionAt = NOW;
  recordPharmacyAudit("Prescription returned", "prescription", rx.prescriptionNumber, actor, reason);
  return mockRequest(toPrescriptionRow(rx));
}

// --- Patient Pharmacy Profile (spec §5) — Prescribed → Dispensed →
// Administered are three distinct events; this module only ever shows
// Prescribed and Dispensed, since Administered is nursing's own record. ----

export interface PatientMedicationHistoryEntry {
  prescriptionNumber: string;
  medicationName: string;
  dose: string;
  status: PrescriptionStatus;
  prescribedAt: string;
  prescriberName: string;
  quantityDispensed: number;
  quantityPrescribed: number;
}

export interface PharmacyPatientProfile {
  patientId: string;
  patientName: string;
  dob: string;
  sex: string;
  allergies: string[];
  currentMedications: PatientMedicationHistoryEntry[];
  medicationHistory: PatientMedicationHistoryEntry[];
}

export function getPharmacyPatientProfile(patientId: string) {
  const patient = patientSeeds.find((p) => p.id === patientId);
  if (!patient) return mockRequest(null as PharmacyPatientProfile | null);
  const patientRx = prescriptions.filter((p) => p.patientId === patientId);
  const toEntry = (rx: Prescription): PatientMedicationHistoryEntry => {
    const item = rx.items[0];
    const med = medications.find((m) => m.id === item?.medicationId);
    return {
      prescriptionNumber: rx.prescriptionNumber,
      medicationName: med ? `${med.genericName} ${med.strength}` : "—",
      dose: item?.dose ?? "—",
      status: rx.status,
      prescribedAt: rx.prescriptionDate,
      prescriberName: resolveStaffName(rx.prescriberId) ?? "Unknown",
      quantityDispensed: item?.quantityDispensed ?? 0,
      quantityPrescribed: item?.quantity ?? 0,
    };
  };
  const activeStatuses: PrescriptionStatus[] = ["new", "received", "under-review", "verified", "preparing", "ready", "dispensing", "dispensed", "partially-dispensed"];
  const profile: PharmacyPatientProfile = {
    patientId,
    patientName: patient.fullName,
    dob: patient.dob,
    sex: patient.gender,
    allergies: getPatientAllergies(patientId),
    currentMedications: patientRx.filter((rx) => activeStatuses.includes(rx.status)).map(toEntry),
    medicationHistory: patientRx.map(toEntry).sort((a, b) => (a.prescribedAt < b.prescribedAt ? 1 : -1)),
  };
  return mockRequest(profile);
}

export function getPharmacyPatientOptions() {
  return mockRequest(patientSeeds.map((p) => ({ id: p.id, fullName: p.fullName })));
}

// --- Refill Management (spec §21) --------------------------------------------

export type RefillStatus = "requested" | "approved" | "rejected" | "ready" | "dispensed";

export interface RefillRequest {
  id: string;
  prescriptionId: string;
  itemId: string;
  requestedAt: string;
  status: RefillStatus;
  approvedBy?: string;
  rejectedReason?: string;
}

export const refillRequests: RefillRequest[] = [
  { id: "refill-1", prescriptionId: "rx-1", itemId: "rxi-1", requestedAt: `${TODAY}T12:00:00`, status: "requested" },
];

export interface RefillRequestRow extends RefillRequest {
  prescriptionNumber: string;
  patientName: string;
  medicationName: string;
  refillsAllowed: number;
  refillsUsed: number;
}

export function getRefillRequests() {
  const rows: RefillRequestRow[] = refillRequests.map((r) => {
    const rx = prescriptions.find((p) => p.id === r.prescriptionId);
    const item = rx?.items.find((i) => i.id === r.itemId);
    const med = medications.find((m) => m.id === item?.medicationId);
    return {
      ...r,
      prescriptionNumber: rx?.prescriptionNumber ?? "—",
      patientName: rx ? resolvePatientName(rx.patientId) : "—",
      medicationName: med ? `${med.genericName} ${med.strength}` : "—",
      refillsAllowed: item?.refillsAllowed ?? 0,
      refillsUsed: item?.refillsUsed ?? 0,
    };
  });
  return mockRequest(rows.sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1)));
}

export function approveRefill(id: string, actor: string = DEFAULT_ACTOR) {
  const refill = refillRequests.find((r) => r.id === id);
  if (!refill) throw new Error("Refill request not found");
  const rx = prescriptions.find((p) => p.id === refill.prescriptionId);
  const item = rx?.items.find((i) => i.id === refill.itemId);
  if (item) item.refillsUsed += 1;
  refill.status = "approved";
  refill.approvedBy = actor;
  recordPharmacyAudit("Refill approved", "refill", refill.id, actor);
  return mockRequest(refill);
}

export function rejectRefill(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const refill = refillRequests.find((r) => r.id === id);
  if (!refill) throw new Error("Refill request not found");
  refill.status = "rejected";
  refill.rejectedReason = reason;
  recordPharmacyAudit("Refill rejected", "refill", refill.id, actor, reason);
  return mockRequest(refill);
}

// --- Medication Returns (spec §22) -------------------------------------------

export type ReturnSource = "patient" | "ward" | "pharmacy" | "supplier";
export type ReturnCondition = "sealed-unused" | "opened-unused" | "damaged" | "suspected-contaminated";

export interface MedicationReturn {
  id: string;
  medicationId: string;
  batchId?: string;
  quantity: number;
  source: ReturnSource;
  reason: string;
  condition: ReturnCondition;
  originalPrescriptionId?: string;
  recordedBy: string;
  recordedAt: string;
  restocked: boolean;
}

export const medicationReturns: MedicationReturn[] = [
  { id: "ret-1", medicationId: "med-11", batchId: undefined, quantity: 15, source: "patient", reason: "Adverse reaction", condition: "sealed-unused", originalPrescriptionId: "rx-10", recordedBy: "usman-farooq", recordedAt: "2026-08-11T14:00:00", restocked: false },
];

export interface MedicationReturnRow extends MedicationReturn {
  medicationName: string;
  prescriptionNumber?: string;
}

export function getMedicationReturns() {
  const rows: MedicationReturnRow[] = medicationReturns.map((r) => ({
    ...r,
    medicationName: medications.find((m) => m.id === r.medicationId)?.genericName ?? "—",
    prescriptionNumber: r.originalPrescriptionId ? prescriptions.find((p) => p.id === r.originalPrescriptionId)?.prescriptionNumber : undefined,
  }));
  return mockRequest(rows.sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1)));
}

export interface NewMedicationReturnInput {
  medicationId: string;
  quantity: number;
  source: ReturnSource;
  reason: string;
  condition: ReturnCondition;
  originalPrescriptionId?: string;
}

export function recordMedicationReturn(input: NewMedicationReturnInput, actor: string = DEFAULT_ACTOR) {
  const ret: MedicationReturn = { ...input, id: `ret-${medicationReturns.length + 1}`, recordedBy: actor, recordedAt: NOW, restocked: false };
  medicationReturns.push(ret);
  recordPharmacyAudit("Medication return recorded", "return", ret.id, actor, input.reason);
  return mockRequest(ret);
}

/** Restocking a return is a deliberate, separate action — sealed/unused-condition returns only, never automatic. */
export function restockReturn(id: string, batchId: string, actor: string = DEFAULT_ACTOR) {
  const ret = medicationReturns.find((r) => r.id === id);
  if (!ret) throw new Error("Return not found");
  if (ret.condition !== "sealed-unused") throw new Error("Only sealed, unused returns can be restocked");
  const batch = batches.find((b) => b.id === batchId);
  if (!batch) throw new Error("Batch not found");
  batch.quantity += ret.quantity;
  ret.restocked = true;
  ret.batchId = batchId;
  recordStockTransaction(ret.medicationId, batchId, "return", ret.quantity, `Restocked from return ${ret.id}`, actor);
  recordPharmacyAudit("Return restocked", "return", ret.id, actor);
  return mockRequest(ret);
}

// --- Medication Recall (spec §24) --------------------------------------------

export type RecallStatus = "open" | "in-progress" | "closed";

export interface MedicationRecall {
  id: string;
  medicationId: string;
  batchIds: string[];
  manufacturer: string;
  reason: string;
  status: RecallStatus;
  initiatedAt: string;
  initiatedBy: string;
  closedAt?: string;
}

export const medicationRecalls: MedicationRecall[] = [];

export interface NewRecallInput {
  medicationId: string;
  batchIds: string[];
  manufacturer: string;
  reason: string;
}

/** Initiating a recall immediately quarantines every affected batch — no window where recalled stock could still be dispensed. */
export function initiateRecall(input: NewRecallInput, actor: string = DEFAULT_ACTOR) {
  const recall: MedicationRecall = { ...input, id: `recall-${medicationRecalls.length + 1}`, status: "open", initiatedAt: NOW, initiatedBy: actor };
  medicationRecalls.push(recall);
  input.batchIds.forEach((batchId) => {
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      batch.status = "quarantined";
      recordStockTransaction(input.medicationId, batchId, "adjustment", 0, `Quarantined due to recall ${recall.id}`, actor);
    }
  });
  const affectedDispensed = prescriptions.filter((p) => p.items.some((i) => i.medicationId === input.medicationId && i.quantityDispensed > 0));
  recordPharmacyAudit(`Recall initiated — ${affectedDispensed.length} prior dispensing record(s) flagged for review`, "recall", recall.id, actor, input.reason);
  return mockRequest(recall);
}

export interface MedicationRecallRow extends MedicationRecall {
  medicationName: string;
  affectedDispensedCount: number;
}

export function getRecalls() {
  const rows: MedicationRecallRow[] = medicationRecalls.map((r) => ({
    ...r,
    medicationName: medications.find((m) => m.id === r.medicationId)?.genericName ?? "—",
    affectedDispensedCount: prescriptions.filter((p) => p.items.some((i) => i.medicationId === r.medicationId && i.quantityDispensed > 0)).length,
  }));
  return mockRequest(rows.sort((a, b) => (a.initiatedAt < b.initiatedAt ? 1 : -1)));
}

export function closeRecall(id: string, actor: string = DEFAULT_ACTOR) {
  const recall = medicationRecalls.find((r) => r.id === id);
  if (!recall) throw new Error("Recall not found");
  recall.status = "closed";
  recall.closedAt = NOW;
  recordPharmacyAudit("Recall closed", "recall", recall.id, actor);
  return mockRequest(recall);
}

// --- Stock Transfer (spec §13) -----------------------------------------------

export type StockTransferStatus = "requested" | "approved" | "in-transit" | "completed" | "rejected";

export interface StockTransfer {
  id: string;
  medicationId: string;
  batchId: string;
  quantity: number;
  fromLocationId: string;
  toLocationId: string;
  status: StockTransferStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
}

export const stockTransfers: StockTransfer[] = [];

export interface NewStockTransferInput {
  medicationId: string;
  batchId: string;
  quantity: number;
  fromLocationId: string;
  toLocationId: string;
}

export function requestStockTransfer(input: NewStockTransferInput, actor: string = DEFAULT_ACTOR) {
  const transfer: StockTransfer = { ...input, id: `xfer-${stockTransfers.length + 1}`, status: "requested", requestedBy: actor, requestedAt: NOW };
  stockTransfers.push(transfer);
  recordPharmacyAudit("Stock transfer requested", "transfer", transfer.id, actor);
  return mockRequest(transfer);
}

export function approveStockTransfer(id: string, actor: string = DEFAULT_ACTOR) {
  const transfer = stockTransfers.find((t) => t.id === id);
  if (!transfer) throw new Error("Transfer not found");
  transfer.status = "approved";
  transfer.approvedBy = actor;
  recordPharmacyAudit("Stock transfer approved", "transfer", transfer.id, actor);
  return mockRequest(transfer);
}

export function completeStockTransfer(id: string, actor: string = DEFAULT_ACTOR) {
  const transfer = stockTransfers.find((t) => t.id === id);
  if (!transfer) throw new Error("Transfer not found");
  const batch = batches.find((b) => b.id === transfer.batchId);
  if (batch) {
    batch.quantity -= transfer.quantity;
    recordStockTransaction(transfer.medicationId, transfer.id, "transfer", -transfer.quantity, `Transferred to ${transfer.toLocationId}`, actor);
  }
  transfer.status = "completed";
  recordPharmacyAudit("Stock transfer completed", "transfer", transfer.id, actor);
  return mockRequest(transfer);
}

export interface StockTransferRow extends StockTransfer {
  medicationName: string;
  batchNumber: string;
  fromLocationName: string;
  toLocationName: string;
}

export function getStockTransfers() {
  const rows: StockTransferRow[] = stockTransfers.map((t) => ({
    ...t,
    medicationName: medications.find((m) => m.id === t.medicationId)?.genericName ?? "—",
    batchNumber: batches.find((b) => b.id === t.batchId)?.batchNumber ?? "—",
    fromLocationName: pharmacyLocations.find((l) => l.id === t.fromLocationId)?.name ?? t.fromLocationId,
    toLocationName: pharmacyLocations.find((l) => l.id === t.toLocationId)?.name ?? t.toLocationId,
  }));
  return mockRequest(rows.sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1)));
}

// --- Procurement: Purchase Requests → Purchase Orders → Goods Receiving
// (spec §14, §16) --------------------------------------------------------------

export type PurchaseOrderStatus = "requested" | "approved" | "ordered" | "partially-received" | "received" | "cancelled";

export interface PurchaseOrderItem {
  id: string;
  medicationId: string;
  quantity: number;
  unitCost: number;
  quantityReceived: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1", poNumber: "PO-2026-001", supplierId: "sup-2", status: "approved",
    items: [{ id: "poi-1", medicationId: "med-4", quantity: 500, unitCost: 0.3, quantityReceived: 0 }],
    requestedBy: "usman-farooq", requestedAt: "2026-08-15T09:00:00", approvedBy: "sadia-riaz", approvedAt: "2026-08-15T14:00:00",
  },
  {
    id: "po-2", poNumber: "PO-2026-002", supplierId: "sup-1", status: "requested",
    items: [{ id: "poi-2", medicationId: "med-9", quantity: 100, unitCost: 5.0, quantityReceived: 0 }],
    requestedBy: "usman-farooq", requestedAt: `${TODAY}T08:00:00`,
  },
];

export interface PurchaseOrderRow extends PurchaseOrder {
  supplierName: string;
  totalValue: number;
}

function toPurchaseOrderRow(po: PurchaseOrder): PurchaseOrderRow {
  return { ...po, supplierName: suppliers.find((s) => s.id === po.supplierId)?.name ?? "—", totalValue: po.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0) };
}

export function getPurchaseOrders() {
  return mockRequest(purchaseOrders.map(toPurchaseOrderRow).sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1)));
}

export interface NewPurchaseOrderInput {
  supplierId: string;
  medicationId: string;
  quantity: number;
  unitCost: number;
}

export function createPurchaseOrder(input: NewPurchaseOrderInput, actor: string = DEFAULT_ACTOR) {
  const po: PurchaseOrder = {
    id: `po-${purchaseOrders.length + 1}`,
    poNumber: `PO-2026-${String(purchaseOrders.length + 1).padStart(3, "0")}`,
    supplierId: input.supplierId,
    status: "requested",
    items: [{ id: `poi-${purchaseOrders.length + 1}`, medicationId: input.medicationId, quantity: input.quantity, unitCost: input.unitCost, quantityReceived: 0 }],
    requestedBy: actor,
    requestedAt: NOW,
  };
  purchaseOrders.push(po);
  recordPharmacyAudit("Purchase order created", "purchase-order", po.poNumber, actor);
  return mockRequest(toPurchaseOrderRow(po));
}

export function approvePurchaseOrder(id: string, actor: string = DEFAULT_ACTOR) {
  const po = purchaseOrders.find((p) => p.id === id);
  if (!po) throw new Error("Purchase order not found");
  po.status = "approved";
  po.approvedBy = actor;
  po.approvedAt = NOW;
  recordPharmacyAudit("Purchase order approved", "purchase-order", po.poNumber, actor);
  return mockRequest(toPurchaseOrderRow(po));
}

export interface GoodsReceiptInput {
  purchaseOrderId: string;
  itemId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  manufacturingDate: string;
  storageLocationId: string;
}

/** Goods Receiving (spec §16): creates the real Batch record — inventory only ever grows through a receipt like this, never a direct quantity edit. */
export function receiveGoods(input: GoodsReceiptInput, actor: string = DEFAULT_ACTOR) {
  const po = purchaseOrders.find((p) => p.id === input.purchaseOrderId);
  if (!po) throw new Error("Purchase order not found");
  const item = po.items.find((i) => i.id === input.itemId);
  if (!item) throw new Error("Purchase order item not found");

  const batch: Batch = {
    id: `batch-${batches.length + 1}`,
    batchNumber: input.batchNumber,
    medicationId: item.medicationId,
    manufacturingDate: input.manufacturingDate,
    expiryDate: input.expiryDate,
    quantity: input.quantity,
    unitCost: item.unitCost,
    sellingPrice: medications.find((m) => m.id === item.medicationId)?.unitPrice ?? item.unitCost,
    supplierId: po.supplierId,
    storageLocationId: input.storageLocationId,
    status: "available",
  };
  batches.push(batch);
  recordStockTransaction(item.medicationId, batch.id, "purchase", input.quantity, `Received against ${po.poNumber}`, actor);

  item.quantityReceived += input.quantity;
  const fullyReceived = po.items.every((i) => i.quantityReceived >= i.quantity);
  po.status = fullyReceived ? "received" : "partially-received";
  recordPharmacyAudit("Goods received", "purchase-order", po.poNumber, actor, `Batch ${batch.batchNumber}`);
  return mockRequest(batch);
}

// --- Controlled / Restricted Medicines (spec §25-26) — strong audit
// controls: every dispense of a controlled substance gets a permanent
// register entry with a running balance, auto-created from
// dispensePrescription above, never manually editable after the fact. -----

export interface ControlledRegisterEntry {
  id: string;
  date: string;
  medicationId: string;
  batchId: string;
  quantityDispensed: number;
  balanceAfter: number;
  prescriberName: string;
  patientName: string;
  pharmacistName: string;
  witness?: string;
}

export const controlledRegister: ControlledRegisterEntry[] = [];

function recordControlledRegisterEntry(medicationId: string, batchId: string, quantity: number, rx: Prescription, actor: string) {
  const batch = batches.find((b) => b.id === batchId);
  const entry: ControlledRegisterEntry = {
    id: `creg-${controlledRegister.length + 1}`,
    date: NOW,
    medicationId,
    batchId,
    quantityDispensed: quantity,
    balanceAfter: batch?.quantity ?? 0,
    prescriberName: resolveStaffName(rx.prescriberId) ?? "Unknown",
    patientName: resolvePatientName(rx.patientId),
    pharmacistName: resolveStaffName(actor) ?? actor,
  };
  controlledRegister.push(entry);
}

export interface ControlledRegisterRow extends ControlledRegisterEntry {
  medicationName: string;
  batchNumber: string;
}

export function getControlledRegister() {
  const rows: ControlledRegisterRow[] = controlledRegister.map((e) => ({
    ...e,
    medicationName: medications.find((m) => m.id === e.medicationId)?.genericName ?? "—",
    batchNumber: batches.find((b) => b.id === e.batchId)?.batchNumber ?? "—",
  }));
  return mockRequest(rows.slice().reverse());
}

export function getControlledMedications() {
  return mockRequest(medications.filter((m) => m.controlledSubstance));
}

// --- Inpatient Medication Workflow (spec §19-20) — distinct from outpatient
// dispensing: Doctor → Medication Order → Pharmacy Verification →
// Preparation → Ward → Nurse → Administration → MAR. This module owns the
// ordering-visibility-through-preparation/supply side only; nursing owns
// Administration — never merged into one record, per the spec's own
// MedicationRequest → MedicationDispense → MedicationAdministration split. --

export type InpatientOrderStatus = "ordered" | "pharmacy-verified" | "preparing" | "supplied-to-ward" | "cancelled";

export interface InpatientMedicationOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  wardName: string;
  medicationId: string;
  dose: string;
  route: MedicationRoute;
  frequency: string;
  prescriberId: string;
  status: InpatientOrderStatus;
  orderedAt: string;
  verifiedAt?: string;
  suppliedAt?: string;
  suppliedBy?: string;
}

export const inpatientOrders: InpatientMedicationOrder[] = [
  {
    id: "ipo-1", orderNumber: "IPO-2026-001", patientId: "p-ahsan-tariq", wardName: "4W General Ward", medicationId: "med-12", dose: "1 g", route: "iv", frequency: "Every 12 hours",
    prescriberId: "robert-vance", status: "ordered", orderedAt: `${TODAY}T07:00:00`,
  },
  {
    id: "ipo-2", orderNumber: "IPO-2026-002", patientId: "p-zara-malik", wardName: "ICU", medicationId: "med-6", dose: "20 units", route: "subcutaneous", frequency: "Once daily, morning",
    prescriberId: "marcus-chen", status: "pharmacy-verified", orderedAt: "2026-08-15T20:00:00", verifiedAt: `${TODAY}T06:00:00`,
  },
];

function findInpatientOrderOrThrow(id: string): InpatientMedicationOrder {
  const order = inpatientOrders.find((o) => o.id === id);
  if (!order) throw new Error("Inpatient medication order not found");
  return order;
}

export interface InpatientOrderRow extends InpatientMedicationOrder {
  patientName: string;
  medicationName: string;
  prescriberName: string;
}

function toInpatientOrderRow(o: InpatientMedicationOrder): InpatientOrderRow {
  return {
    ...o,
    patientName: resolvePatientName(o.patientId),
    medicationName: medications.find((m) => m.id === o.medicationId)?.genericName ?? "—",
    prescriberName: resolveStaffName(o.prescriberId) ?? "Unknown",
  };
}

export function getInpatientOrders() {
  return mockRequest(inpatientOrders.map(toInpatientOrderRow).sort((a, b) => (a.orderedAt < b.orderedAt ? 1 : -1)));
}

export function verifyInpatientOrder(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findInpatientOrderOrThrow(id);
  order.status = "pharmacy-verified";
  order.verifiedAt = NOW;
  recordPharmacyAudit("Inpatient order verified", "inpatient-order", order.orderNumber, actor);
  return mockRequest(toInpatientOrderRow(order));
}

export function prepareInpatientOrder(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findInpatientOrderOrThrow(id);
  order.status = "preparing";
  recordPharmacyAudit("Inpatient order in preparation", "inpatient-order", order.orderNumber, actor);
  return mockRequest(toInpatientOrderRow(order));
}

/** Supplies medication to the ward — the pharmacy side ends here. Administration (giving it to the patient) is recorded by nursing in their own MAR, never here. */
export function supplyInpatientOrderToWard(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findInpatientOrderOrThrow(id);
  const batch = batches.find((b) => b.medicationId === order.medicationId && (b.status === "available" || b.status === "low"));
  if (batch) {
    batch.quantity -= 1;
    recordStockTransaction(order.medicationId, batch.id, "dispense", -1, `Supplied to ${order.wardName} for ${order.orderNumber}`, actor);
  }
  order.status = "supplied-to-ward";
  order.suppliedAt = NOW;
  order.suppliedBy = actor;
  recordPharmacyAudit("Supplied to ward", "inpatient-order", order.orderNumber, actor, order.wardName);
  return mockRequest(toInpatientOrderRow(order));
}

export function cancelInpatientOrder(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findInpatientOrderOrThrow(id);
  order.status = "cancelled";
  recordPharmacyAudit("Inpatient order cancelled", "inpatient-order", order.orderNumber, actor);
  return mockRequest(toInpatientOrderRow(order));
}

// --- Insurance / Pharmacy Coverage (spec §27-28) — cross-reference view
// only, never a duplicate of the central Billing & Revenue module; and never
// one hard-coded country's insurance workflow. -----------------------------

export type CoverageStatus = "not-applicable" | "pending-authorization" | "approved" | "rejected";

export interface PrescriptionInsuranceRow {
  prescriptionId: string;
  prescriptionNumber: string;
  patientName: string;
  medicationSummary: string;
  totalPrice: number;
  payerName?: string;
  coverageStatus: CoverageStatus;
  copay?: number;
}

const insuranceCoverage: Record<string, { payerName: string; coverageStatus: CoverageStatus; copay: number }> = {
  "rx-1": { payerName: "State Life Health", coverageStatus: "approved", copay: 5 },
  "rx-3": { payerName: "EFU Health", coverageStatus: "pending-authorization", copay: 10 },
  "rx-6": { payerName: "State Life Health", coverageStatus: "approved", copay: 0 },
};

export function getPrescriptionInsurance() {
  const rows: PrescriptionInsuranceRow[] = prescriptions.map((rx) => {
    const coverage = insuranceCoverage[rx.id];
    const totalPrice = rx.items.reduce((sum, i) => sum + i.quantity * (medications.find((m) => m.id === i.medicationId)?.unitPrice ?? 0), 0);
    return {
      prescriptionId: rx.id,
      prescriptionNumber: rx.prescriptionNumber,
      patientName: resolvePatientName(rx.patientId),
      medicationSummary: toPrescriptionRow(rx).medicationSummary,
      totalPrice: Math.round(totalPrice * 100) / 100,
      payerName: coverage?.payerName,
      coverageStatus: coverage?.coverageStatus ?? "not-applicable",
      copay: coverage?.copay,
    };
  });
  return mockRequest(rows);
}

// --- Dashboard (spec §1) — every KPI is computed from the real records
// above, never a decorative number. ------------------------------------------

export interface PharmacyDashboardData {
  prescriptionsToday: number;
  pendingPrescriptions: number;
  inVerification: number;
  readyForDispensing: number;
  dispensedToday: number;
  partiallyDispensed: number;
  cancelled: number;
  returned: number;
  lowStock: number;
  outOfStock: number;
  expiringSoon: number;
  controlledAlerts: number;
  inventoryValue: number;
  pendingRefillRequests: number;
  prescriptionsByDay: { date: string; count: number }[];
  topMedicationsDispensed: { medicationName: string; count: number }[];
  departmentWisePrescriptions: { department: string; count: number }[];
  averageTurnaroundHours: number;
}

export function getPharmacyDashboard() {
  const prescriptionsToday = prescriptions.filter((p) => p.prescriptionDate.startsWith(TODAY)).length;
  const pendingPrescriptions = prescriptions.filter((p) => ["new", "received"].includes(p.status)).length;
  const inVerification = prescriptions.filter((p) => p.status === "under-review").length;
  const readyForDispensing = prescriptions.filter((p) => p.status === "ready").length;
  const dispensedToday = prescriptions.filter((p) => p.status === "dispensed" && p.dispensedAt?.startsWith(TODAY)).length;
  const partiallyDispensed = prescriptions.filter((p) => p.status === "partially-dispensed").length;
  const cancelled = prescriptions.filter((p) => p.status === "cancelled").length;
  const returned = prescriptions.filter((p) => p.status === "returned").length;

  const lowStock = batches.filter((b) => b.status === "low").length;
  const outOfStock = medications.filter((m) => m.status === "active" && !batches.some((b) => b.medicationId === m.id && (b.status === "available" || b.status === "low") && b.quantity > 0)).length;
  const expiringSoon = batches.filter((b) => b.status !== "expired" && daysUntil(b.expiryDate) <= 90 && daysUntil(b.expiryDate) >= 0).length;
  const controlledAlerts = medications.filter((m) => m.controlledSubstance && batches.some((b) => b.medicationId === m.id && (b.status === "available" || b.status === "low") && b.quantity < 50)).length;
  const inventoryValue = Math.round(batches.filter((b) => b.status === "available" || b.status === "low").reduce((sum, b) => sum + b.quantity * b.unitCost, 0));
  const pendingRefillRequests = refillRequests.filter((r) => r.status === "requested").length;

  const dayMap = new Map<string, number>();
  prescriptions.forEach((p) => {
    const day = p.prescriptionDate.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  });
  const prescriptionsByDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  const medCountMap = new Map<string, number>();
  prescriptions.forEach((p) => p.items.forEach((i) => {
    if (i.quantityDispensed <= 0) return;
    const name = medications.find((m) => m.id === i.medicationId)?.genericName ?? "Unknown";
    medCountMap.set(name, (medCountMap.get(name) ?? 0) + i.quantityDispensed);
  }));
  const topMedicationsDispensed = Array.from(medCountMap.entries()).map(([medicationName, count]) => ({ medicationName, count })).sort((a, b) => b.count - a.count).slice(0, 5);

  const deptMap = new Map<string, number>();
  prescriptions.forEach((p) => {
    const name = departmentConfigs.find((d) => d.id === p.departmentId)?.name ?? "Unknown";
    deptMap.set(name, (deptMap.get(name) ?? 0) + 1);
  });
  const departmentWisePrescriptions = Array.from(deptMap.entries()).map(([department, count]) => ({ department, count }));

  const dispensedWithTimes = prescriptions.filter((p) => p.dispensedAt && p.verifiedAt);
  const averageTurnaroundHours = dispensedWithTimes.length
    ? Math.round((dispensedWithTimes.reduce((sum, p) => sum + (new Date(p.dispensedAt!).getTime() - new Date(p.prescriptionDate).getTime()) / 3600000, 0) / dispensedWithTimes.length) * 10) / 10
    : 0;

  const data: PharmacyDashboardData = {
    prescriptionsToday,
    pendingPrescriptions,
    inVerification,
    readyForDispensing,
    dispensedToday,
    partiallyDispensed,
    cancelled,
    returned,
    lowStock,
    outOfStock,
    expiringSoon,
    controlledAlerts,
    inventoryValue,
    pendingRefillRequests,
    prescriptionsByDay,
    topMedicationsDispensed,
    departmentWisePrescriptions,
    averageTurnaroundHours,
  };
  return mockRequest(data);
}

// --- Reports (spec §39 Phase 3) ----------------------------------------------

export interface PharmacyReportsData {
  totalPrescriptions: number;
  dispensingRate: number;
  cancellationRate: number;
  averageTurnaroundHours: number;
  revenueThisMonth: number;
  stockConsumption: { medicationName: string; quantity: number }[];
}

export function getPharmacyReports() {
  const totalPrescriptions = prescriptions.length;
  const dispensingRate = totalPrescriptions ? Math.round((prescriptions.filter((p) => p.status === "dispensed").length / totalPrescriptions) * 100) : 0;
  const cancellationRate = totalPrescriptions ? Math.round((prescriptions.filter((p) => p.status === "cancelled").length / totalPrescriptions) * 100) : 0;
  const dispensedWithTimes = prescriptions.filter((p) => p.dispensedAt);
  const averageTurnaroundHours = dispensedWithTimes.length
    ? Math.round((dispensedWithTimes.reduce((sum, p) => sum + (new Date(p.dispensedAt!).getTime() - new Date(p.prescriptionDate).getTime()) / 3600000, 0) / dispensedWithTimes.length) * 10) / 10
    : 0;
  const revenueThisMonth = Math.round(
    prescriptions.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.quantityDispensed * (medications.find((m) => m.id === i.medicationId)?.unitPrice ?? 0), 0), 0) * 100
  ) / 100;
  const consumptionMap = new Map<string, number>();
  stockTransactions.filter((t) => t.type === "dispense").forEach((t) => {
    const name = medications.find((m) => m.id === t.medicationId)?.genericName ?? "Unknown";
    consumptionMap.set(name, (consumptionMap.get(name) ?? 0) + Math.abs(t.quantityChange));
  });
  const stockConsumption = Array.from(consumptionMap.entries()).map(([medicationName, quantity]) => ({ medicationName, quantity })).sort((a, b) => b.quantity - a.quantity);

  const data: PharmacyReportsData = { totalPrescriptions, dispensingRate, cancellationRate, averageTurnaroundHours, revenueThisMonth, stockConsumption };
  return mockRequest(data);
}

// --- Settings (spec §39 Phase 3) — overview linking to the screens that own
// each value, never a duplicate config surface. ------------------------------

export interface PharmacySettingsData {
  departmentName: string;
  activeMedicationCount: number;
  activeSupplierCount: number;
  controlledMedicationCount: number;
  locationCount: number;
}

export function getPharmacySettings() {
  const data: PharmacySettingsData = {
    departmentName: departmentConfigs.find((d) => d.id === "dept-pharmacy")?.name ?? "Pharmacy",
    activeMedicationCount: medications.filter((m) => m.status === "active").length,
    activeSupplierCount: suppliers.filter((s) => s.status === "active").length,
    controlledMedicationCount: medications.filter((m) => m.controlledSubstance).length,
    locationCount: pharmacyLocations.length,
  };
  return mockRequest(data);
}

// --- Audit (spec §_, matches every other module's discipline) — logged from
// day one; every mutation above already calls this. --------------------------

export type PharmacyAuditEntityType = "medication" | "prescription" | "batch" | "supplier" | "transfer" | "purchase-order" | "return" | "recall" | "refill" | "inpatient-order";

export interface PharmacyAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: PharmacyAuditEntityType;
  entityId: string;
  detail?: string;
}

export const pharmacyAuditLog: PharmacyAuditEntry[] = [
  { id: "pharm-audit-seed-1", timestamp: "2026-08-16T08:20:00", actor: "sarah-jenkins", action: "Prescription created", entityType: "prescription", entityId: "RX-2026-000001" },
  { id: "pharm-audit-seed-2", timestamp: "2026-08-16T08:20:00", actor: "nadia-khokhar", action: "Prescription verified", entityType: "prescription", entityId: "RX-2026-000001" },
  { id: "pharm-audit-seed-3", timestamp: "2026-08-16T08:40:00", actor: "usman-farooq", action: "Prescription fully dispensed", entityType: "prescription", entityId: "RX-2026-000001" },
];

function recordPharmacyAudit(action: string, entityType: PharmacyAuditEntityType, entityId: string, actor: string, detail?: string) {
  pharmacyAuditLog.push({ id: `pharm-audit-${pharmacyAuditLog.length + 1}`, timestamp: NOW, actor, action, entityType, entityId, detail });
}

export function getPharmacyAuditLog(filters: { entityType?: PharmacyAuditEntityType; search?: string } = {}) {
  let rows = [...pharmacyAuditLog].reverse();
  if (filters.entityType) rows = rows.filter((r) => r.entityType === filters.entityType);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.entityId.toLowerCase().includes(q) || r.actor.toLowerCase().includes(q) || r.action.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}
