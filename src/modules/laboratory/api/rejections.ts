import { mockRequest } from "@shared/lib/api/client";

// Rejected specimens — never deleted, full history kept (§16-17).
// Self-contained record (testName as plain text) rather than requiring a
// live order lookup, since a rejected specimen may reference an order
// that's otherwise out of the active worklist.

export type RejectionReason = "Hemolyzed" | "Clotted" | "Insufficient Quantity" | "Wrong Container" | "Unlabeled" | "Delayed Transport" | "Leaking";
export type RecollectionStatus = "Required" | "Completed";

export interface RejectedSpecimen {
  id: string;
  patientId: string;
  testName: string;
  reason: RejectionReason;
  rejectedBy: string;
  rejectedAt: string;
  recollectionStatus: RecollectionStatus;
}

let rejections: RejectedSpecimen[] = [
  { id: "rej-1", patientId: "lp-4", testName: "Potassium", reason: "Hemolyzed", rejectedBy: "MLS Sana Iqbal", rejectedAt: "07:55", recollectionStatus: "Required" },
  { id: "rej-2", patientId: "lp-2", testName: "PT/INR", reason: "Clotted", rejectedBy: "MLS Kamran Butt", rejectedAt: "2026-08-20 08:30", recollectionStatus: "Completed" },
  { id: "rej-3", patientId: "lp-6", testName: "Urinalysis, Complete", reason: "Insufficient Quantity", rejectedBy: "MLS Sana Iqbal", rejectedAt: "2026-08-20 09:10", recollectionStatus: "Required" },
];

export const getRejections = () => mockRequest([...rejections]);

export function markRecollected(id: string) {
  const r = rejections.find((x) => x.id === id);
  if (r) r.recollectionStatus = "Completed";
  rejections = [...rejections];
  return mockRequest([...rejections]);
}

export function addRejection(patientId: string, testName: string, reason: RejectionReason, rejectedBy: string) {
  const rec: RejectedSpecimen = { id: `rej-${Date.now()}`, patientId, testName, reason, rejectedBy, rejectedAt: "just now", recollectionStatus: "Required" };
  rejections = [rec, ...rejections];
  return mockRequest(rec);
}
