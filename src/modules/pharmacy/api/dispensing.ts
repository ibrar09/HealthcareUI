import { mockRequest } from "@shared/lib/api/client";
import { decrementBatch } from "./inventory";
import { markDispensed } from "./orders";

export interface DispensingRecord {
  id: string;
  orderId: string;
  patientId: string;
  medicationName: string;
  quantity: number;
  batchNo: string;
  pharmacist: string;
  at: string;
}

let records: DispensingRecord[] = [
  { id: "disp-1", orderId: "ord-8", patientId: "pp-4", medicationName: "Aspirin 75mg", quantity: 30, batchNo: "ASP-2512", pharmacist: "Pharm. Zainab Hussain", at: "07:10" },
];

export const getDispensingRecords = () => mockRequest([...records]);

// Idempotent on orderId — retrying dispense on an already-dispensed order
// is a no-op rather than a duplicate stock deduction.
export function dispenseOrder(orderId: string, patientId: string, medicationName: string, quantity: number, batchId: string, batchNo: string, pharmacist: string) {
  if (records.some((r) => r.orderId === orderId)) return mockRequest([...records]);
  const record: DispensingRecord = { id: `disp-${Date.now()}`, orderId, patientId, medicationName, quantity, batchNo, pharmacist, at: "just now" };
  records = [record, ...records];
  decrementBatch(batchId, quantity);
  markDispensed(orderId);
  return mockRequest([...records]);
}
