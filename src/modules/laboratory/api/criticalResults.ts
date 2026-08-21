import { mockRequest } from "@shared/lib/api/client";

export interface CriticalResult {
  id: string;
  patientId: string;
  orderId: string;
  resultId: string;
  testName: string;
  value: string;
  recipientDoctor: string;
  notifiedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  escalated: boolean;
}

let criticalResults: CriticalResult[] = [
  { id: "crit-1", patientId: "lp-5", orderId: "lord-13", resultId: "res-7", testName: "Potassium", value: "6.9 mmol/L (Critical High)", recipientDoctor: "Dr. Sana Riaz", notifiedAt: "2026-08-20 06:32", acknowledged: false, escalated: false },
];

export const getCriticalResults = () => mockRequest([...criticalResults]);

export function createCriticalResult(input: Omit<CriticalResult, "id" | "acknowledged" | "escalated" | "notifiedAt">) {
  const c: CriticalResult = { ...input, id: `crit-${Date.now()}`, acknowledged: false, escalated: false, notifiedAt: "just now" };
  criticalResults = [c, ...criticalResults];
  return mockRequest(c);
}

export function acknowledgeCriticalResult(id: string) {
  const c = criticalResults.find((x) => x.id === id);
  if (c) { c.acknowledged = true; c.acknowledgedAt = "just now"; }
  criticalResults = [...criticalResults];
  return mockRequest([...criticalResults]);
}

export function escalateCriticalResult(id: string) {
  const c = criticalResults.find((x) => x.id === id);
  if (c) c.escalated = true;
  criticalResults = [...criticalResults];
  return mockRequest([...criticalResults]);
}
