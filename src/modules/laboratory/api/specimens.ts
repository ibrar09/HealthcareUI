import { mockRequest } from "@shared/lib/api/client";
import { markCollected, accessionAndReceive } from "./orders";

// Specimen — the physical sample, distinct from the order. A rejected
// specimen is never deleted (§16) — status changes, history stays.

export type SpecimenStatus = "Expected" | "Collected" | "Received" | "Rejected";

export interface LabSpecimen {
  id: string;
  orderId: string;
  patientId: string;
  sampleType: string;
  container: string;
  barcodeId: string;
  collectedBy?: string;
  collectedAt?: string;
  status: SpecimenStatus;
  rejectionReason?: string;
}

let specimens: LabSpecimen[] = [
  { id: "spec-1", orderId: "lord-3", patientId: "lp-3", sampleType: "Serum", container: "SST (Gold)", barcodeId: "BC-100003", collectedBy: "Phleb. Sana Iqbal", collectedAt: "07:45", status: "Collected" },
  { id: "spec-2", orderId: "lord-4", patientId: "lp-4", sampleType: "Serum", container: "SST (Gold)", barcodeId: "BC-100004", collectedBy: "Nurse Amina Riaz", collectedAt: "08:05", status: "Received" },
  { id: "spec-3", orderId: "lord-5", patientId: "lp-5", sampleType: "Whole Blood", container: "EDTA (Lavender)", barcodeId: "BC-100005", collectedBy: "Phleb. Sana Iqbal", collectedAt: "07:30", status: "Received" },
  { id: "spec-4", orderId: "lord-6", patientId: "lp-6", sampleType: "Serum", container: "SST (Gold)", barcodeId: "BC-100006", collectedBy: "Phleb. Sana Iqbal", collectedAt: "07:15", status: "Received" },
  { id: "spec-5", orderId: "lord-7", patientId: "lp-7", sampleType: "Serum", container: "SST (Gold)", barcodeId: "BC-100007", collectedBy: "Phleb. Kamran Butt", collectedAt: "06:50", status: "Received" },
  { id: "spec-6", orderId: "lord-8", patientId: "lp-8", sampleType: "Plasma", container: "Sodium Citrate (Blue)", barcodeId: "BC-100008", collectedBy: "Nurse Amina Riaz", collectedAt: "08:10", status: "Received" },
  { id: "spec-7", orderId: "lord-10", patientId: "lp-2", sampleType: "Urine", container: "Sterile Urine Cup", barcodeId: "BC-100010", collectedBy: "Phleb. Kamran Butt", collectedAt: "2026-08-20 09:00", status: "Received" },
  { id: "spec-8", orderId: "lord-11", patientId: "lp-3", sampleType: "Whole Blood", container: "Blood Culture Bottle", barcodeId: "BC-100011", collectedBy: "Phleb. Sana Iqbal", collectedAt: "08:25", status: "Received" },
  { id: "spec-9", orderId: "lord-1", patientId: "lp-1", sampleType: "Whole Blood", container: "EDTA (Lavender)", barcodeId: "BC-100001", status: "Expected" },
  { id: "spec-10", orderId: "lord-2", patientId: "lp-2", sampleType: "Serum", container: "SST (Gold)", barcodeId: "BC-100002", status: "Expected" },
  { id: "spec-11", orderId: "lord-15", patientId: "lp-7", sampleType: "Whole Blood", container: "EDTA (Lavender)", barcodeId: "BC-100015", status: "Expected" },
  { id: "spec-12", orderId: "lord-16", patientId: "lp-8", sampleType: "Serum", container: "SST (Gold)", barcodeId: "BC-100016", status: "Expected" },
];

export const getSpecimens = () => mockRequest([...specimens]);
export const getSpecimenByOrderId = (orderId: string) => mockRequest(specimens.find((s) => s.orderId === orderId) ?? null);

export function collectSpecimen(orderId: string, collectedBy: string) {
  const s = specimens.find((x) => x.orderId === orderId);
  const collectedAt = "just now";
  if (s) { s.status = "Collected"; s.collectedBy = collectedBy; s.collectedAt = collectedAt; }
  specimens = [...specimens];
  markCollected(orderId, collectedAt);
  return mockRequest([...specimens]);
}

export function receiveSpecimen(orderId: string, accessionNo: string) {
  const s = specimens.find((x) => x.orderId === orderId);
  if (s) s.status = "Received";
  specimens = [...specimens];
  accessionAndReceive(orderId, accessionNo, "just now");
  return mockRequest([...specimens]);
}

export function rejectSpecimen(orderId: string, reason: string) {
  const s = specimens.find((x) => x.orderId === orderId);
  if (s) { s.status = "Rejected"; s.rejectionReason = reason; }
  specimens = [...specimens];
  return mockRequest([...specimens]);
}
