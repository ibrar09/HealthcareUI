import { mockRequest } from "@shared/lib/api/client";

// Reagents + consumables + expiry combined — status field covers all
// views, same consolidation pattern used across the other portals'
// inventory screens.

export type InventoryType = "Reagent" | "Consumable" | "Control" | "Calibrator";
export type InventoryStatus = "Available" | "Low Stock" | "Expired" | "Quarantined";

export interface LabInventoryItem {
  id: string;
  name: string;
  type: InventoryType;
  lot: string;
  quantity: number;
  minStock: number;
  unit: string;
  expiryDate: string;
  location: string;
  status: InventoryStatus;
}

let items: LabInventoryItem[] = [
  { id: "inv-1", name: "Hematology Diluent", type: "Reagent", lot: "RGT-2601", quantity: 12, minStock: 5, unit: "boxes", expiryDate: "2027-01-15", location: "Hematology Storage", status: "Available" },
  { id: "inv-2", name: "Glucose Reagent Kit", type: "Reagent", lot: "RGT-2588", quantity: 3, minStock: 5, unit: "kits", expiryDate: "2026-09-10", location: "Chemistry Storage", status: "Low Stock" },
  { id: "inv-3", name: "PT/INR Reagent", type: "Reagent", lot: "RGT-2570", quantity: 8, minStock: 4, unit: "kits", expiryDate: "2026-08-25", location: "Coagulation Storage", status: "Available" },
  { id: "inv-4", name: "EDTA Tubes (Lavender)", type: "Consumable", lot: "CON-2610", quantity: 450, minStock: 100, unit: "tubes", expiryDate: "2027-06-01", location: "Central Supply", status: "Available" },
  { id: "inv-5", name: "SST Tubes (Gold)", type: "Consumable", lot: "CON-2599", quantity: 80, minStock: 100, unit: "tubes", expiryDate: "2027-05-01", location: "Central Supply", status: "Low Stock" },
  { id: "inv-6", name: "Blood Culture Bottles", type: "Consumable", lot: "CON-2544", quantity: 60, minStock: 20, unit: "bottles", expiryDate: "2026-08-30", location: "Microbiology Storage", status: "Available" },
  { id: "inv-7", name: "Hematology QC Level 1", type: "Control", lot: "QCM-2601", quantity: 5, minStock: 2, unit: "vials", expiryDate: "2026-11-01", location: "Hematology Storage", status: "Available" },
  { id: "inv-8", name: "Chemistry Calibrator Set", type: "Calibrator", lot: "CALK-2570", quantity: 0, minStock: 2, unit: "sets", expiryDate: "2026-08-18", location: "Chemistry Storage", status: "Expired" },
];

export const getInventory = () => mockRequest([...items]);

export function adjustStock(id: string, delta: number) {
  const item = items.find((x) => x.id === id);
  if (item) item.quantity = Math.max(0, item.quantity + delta);
  items = [...items];
  return mockRequest([...items]);
}

export function quarantineItem(id: string) {
  const item = items.find((x) => x.id === id);
  if (item) item.status = "Quarantined";
  items = [...items];
  return mockRequest([...items]);
}
