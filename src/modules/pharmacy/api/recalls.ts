import { mockRequest } from "@shared/lib/api/client";
import { quarantineBatch } from "./inventory";

export interface Recall {
  id: string;
  medicationName: string;
  batchNo: string;
  reason: string;
  severity: "critical" | "high" | "medium";
  affectedQuantity: number;
  status: "Open" | "Closed";
  createdAt: string;
}

let recalls: Recall[] = [
  { id: "MR-1002", medicationName: "Insulin Glargine", batchNo: "INS-2570", reason: "Manufacturer recall — potential potency deviation", severity: "critical", affectedQuantity: 40, status: "Open", createdAt: "2026-08-18" },
];

export const getRecalls = () => mockRequest([...recalls]);

export function closeRecall(id: string) {
  const r = recalls.find((x) => x.id === id);
  if (r) r.status = "Closed";
  recalls = [...recalls];
  return mockRequest([...recalls]);
}

export function createRecall(input: Omit<Recall, "id" | "status" | "createdAt">, matchingBatchId?: string) {
  const rec: Recall = { ...input, id: `MR-${Date.now()}`, status: "Open", createdAt: "just now" };
  recalls = [rec, ...recalls];
  if (matchingBatchId) quarantineBatch(matchingBatchId, `Recall ${rec.id}: ${input.reason}`);
  return mockRequest(rec);
}
