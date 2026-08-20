import { mockRequest } from "@shared/lib/api/client";

export type ControlledAction = "Received" | "Dispensed" | "Administered" | "Returned" | "Wasted";

export interface ControlledTransaction {
  id: string;
  medicationName: string;
  batchNo: string;
  action: ControlledAction;
  quantity: number;
  performedBy: string;
  witness?: string;
  reason?: string;
  at: string;
}

let transactions: ControlledTransaction[] = [
  { id: "ct-1", medicationName: "Morphine Sulfate 10mg/mL", batchNo: "MOR-2610", action: "Received", quantity: 30, performedBy: "Pharm. Zainab Hussain", witness: "Pharm. Manager Adeel Shah", at: "2026-08-15 09:00" },
  { id: "ct-2", medicationName: "Morphine Sulfate 10mg/mL", batchNo: "MOR-2610", action: "Dispensed", quantity: 2, performedBy: "Pharm. Zainab Hussain", at: "08:15" },
];

export const getControlledTransactions = () => mockRequest([...transactions]);

// Wastage requires a witness — every unit must be traceable, per policy.
export function recordControlledTransaction(input: Omit<ControlledTransaction, "id" | "at">) {
  if (input.action === "Wasted" && !input.witness?.trim()) throw new Error("Witness required for controlled medication wastage.");
  const rec: ControlledTransaction = { ...input, id: `ct-${Date.now()}`, at: "just now" };
  transactions = [rec, ...transactions];
  return mockRequest(rec);
}
