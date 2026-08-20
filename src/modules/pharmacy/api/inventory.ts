import { mockRequest } from "@shared/lib/api/client";

// Inventory — Stock/Batches/Expiry/Quarantine all live on one MedicationBatch
// record (status field covers all of it) rather than four separate models,
// since they're the same underlying entity viewed different ways. FEFO
// (First-Expire-First-Out) is enforced in getFefoBatch — dispensing always
// gets the earliest-expiring eligible batch, never a free pick.

export type BatchStatus = "Available" | "Reserved" | "Quarantined" | "Expired" | "Recalled";

export interface MedicationBatch {
  id: string;
  medicationName: string;
  batchNo: string;
  location: string;
  quantity: number;
  minStock: number;
  expiryDate: string;
  status: BatchStatus;
  quarantineReason?: string;
}

let batches: MedicationBatch[] = [
  { id: "batch-1", medicationName: "Amoxicillin 500mg", batchNo: "AMX-2601", location: "Main Pharmacy — Shelf A2", quantity: 340, minStock: 100, expiryDate: "2027-03-15", status: "Available" },
  { id: "batch-2", medicationName: "Metformin 500mg", batchNo: "MET-2588", location: "Main Pharmacy — Shelf B1", quantity: 45, minStock: 100, expiryDate: "2026-09-05", status: "Available" },
  { id: "batch-3", medicationName: "Morphine Sulfate 10mg/mL", batchNo: "MOR-2610", location: "Controlled Safe — CS1", quantity: 28, minStock: 10, expiryDate: "2027-01-20", status: "Available" },
  { id: "batch-4", medicationName: "Ibuprofen 400mg", batchNo: "IBU-2543", location: "Main Pharmacy — Shelf A5", quantity: 0, minStock: 50, expiryDate: "2026-11-01", status: "Available" },
  { id: "batch-5", medicationName: "Furosemide 40mg", batchNo: "FUR-2570", location: "Main Pharmacy — Shelf B3", quantity: 210, minStock: 80, expiryDate: "2026-08-30", status: "Available" },
  { id: "batch-6", medicationName: "Lisinopril 10mg", batchNo: "LIS-2599", location: "Main Pharmacy — Shelf A1", quantity: 180, minStock: 80, expiryDate: "2027-06-10", status: "Available" },
  { id: "batch-7", medicationName: "Aspirin 75mg", batchNo: "ASP-2512", location: "Main Pharmacy — Shelf A4", quantity: 400, minStock: 100, expiryDate: "2027-02-28", status: "Available" },
  { id: "batch-8", medicationName: "Amoxicillin 500mg", batchNo: "AMX-2544", location: "Main Pharmacy — Shelf A2", quantity: 60, minStock: 100, expiryDate: "2026-09-01", status: "Available" },
  { id: "batch-9", medicationName: "Vancomycin 1g", batchNo: "VAN-2599", location: "Cold Storage — CC1", quantity: 25, minStock: 15, expiryDate: "2027-01-01", status: "Quarantined", quarantineReason: "Temperature excursion during transfer" },
  { id: "batch-10", medicationName: "Insulin Glargine", batchNo: "INS-2570", location: "Cold Storage — CC2", quantity: 40, minStock: 20, expiryDate: "2026-08-25", status: "Recalled", quarantineReason: "Manufacturer recall — see Recall MR-1002" },
];

export interface StockMovement {
  id: string;
  batchId: string;
  type: "Transfer" | "Return" | "Adjustment";
  quantity: number;
  from: string;
  to: string;
  reason: string;
  at: string;
}

let movements: StockMovement[] = [];

export const getBatches = () => mockRequest([...batches]);

export function getFefoBatch(medicationName: string): MedicationBatch | undefined {
  return [...batches]
    .filter((b) => b.medicationName.toLowerCase().includes(medicationName.toLowerCase()) && b.status === "Available" && b.quantity > 0)
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0];
}

export function decrementBatch(batchId: string, quantity: number) {
  const b = batches.find((x) => x.id === batchId);
  if (b) b.quantity = Math.max(0, b.quantity - quantity);
  batches = [...batches];
  return mockRequest([...batches]);
}

export const getMovements = () => mockRequest([...movements]);

export function transferStock(batchId: string, to: string, quantity: number) {
  const b = batches.find((x) => x.id === batchId);
  if (!b) return mockRequest([...movements]);
  movements = [{ id: `mv-${Date.now()}`, batchId, type: "Transfer", quantity, from: b.location, to, reason: "Ward request", at: "just now" }, ...movements];
  return mockRequest([...movements]);
}

export function returnStock(batchId: string, quantity: number, reason: string) {
  const b = batches.find((x) => x.id === batchId);
  if (!b) return mockRequest([...movements]);
  b.quantity += quantity;
  batches = [...batches];
  movements = [{ id: `mv-${Date.now()}`, batchId, type: "Return", quantity, from: "Ward", to: b.location, reason, at: "just now" }, ...movements];
  return mockRequest([...movements]);
}

export function quarantineBatch(batchId: string, reason: string) {
  const b = batches.find((x) => x.id === batchId);
  if (b) { b.status = "Quarantined"; b.quarantineReason = reason; }
  batches = [...batches];
  return mockRequest([...batches]);
}

export function releaseFromQuarantine(batchId: string) {
  const b = batches.find((x) => x.id === batchId);
  if (b) { b.status = "Available"; b.quarantineReason = undefined; }
  batches = [...batches];
  return mockRequest([...batches]);
}

export function receiveBatch(batch: Omit<MedicationBatch, "id" | "status">) {
  const b: MedicationBatch = { ...batch, id: `batch-${Date.now()}`, status: "Available" };
  batches = [b, ...batches];
  return mockRequest(b);
}
