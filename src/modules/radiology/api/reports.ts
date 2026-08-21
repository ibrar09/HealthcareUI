import { mockRequest } from "@shared/lib/api/client";
import { setOrderStatus } from "./orders";

export type ReportStatus = "Draft" | "Final" | "Amended";

export interface Addendum {
  text: string;
  author: string;
  at: string;
}

export interface RadiologyReport {
  id: string;
  orderId: string;
  patientId: string;
  radiologist: string;
  clinicalIndication: string;
  technique: string;
  comparison: string;
  findings: string;
  impression: string;
  status: ReportStatus;
  version: number;
  createdAt: string;
  finalizedAt?: string;
  addenda: Addendum[];
}

let reports: RadiologyReport[] = [
  {
    id: "rrep-1", orderId: "rord-7", patientId: "rp-3", radiologist: "Dr. Radiologist Iqra Sheikh",
    clinicalIndication: "Lung nodule follow-up", technique: "Non-contrast CT chest, axial 2mm slices",
    comparison: "Prior CT chest 2026-05-10", findings: "Stable 6mm nodule in right upper lobe, unchanged from prior. No new nodules. No lymphadenopathy.",
    impression: "Stable pulmonary nodule, likely benign. Recommend routine follow-up in 12 months.",
    status: "Final", version: 1, createdAt: "2026-08-19 10:00", finalizedAt: "2026-08-19 10:30", addenda: [],
  },
];

export const getReports = () => mockRequest([...reports]);
export const getReportByOrderId = (orderId: string) => mockRequest(reports.find((r) => r.orderId === orderId) ?? null);

export function saveDraft(orderId: string, patientId: string, radiologist: string, fields: Pick<RadiologyReport, "clinicalIndication" | "technique" | "comparison" | "findings" | "impression">) {
  let r = reports.find((x) => x.orderId === orderId);
  if (r) {
    Object.assign(r, fields);
  } else {
    r = { id: `rrep-${Date.now()}`, orderId, patientId, radiologist, ...fields, status: "Draft", version: 1, createdAt: "just now", addenda: [] };
    reports = [r, ...reports];
  }
  setOrderStatus(orderId, "Report Draft");
  reports = [...reports];
  return mockRequest(r);
}

// Idempotent — finalizing an already-Final report is a no-op, never a
// silent overwrite of a signed report.
export function finalizeReport(orderId: string) {
  const r = reports.find((x) => x.orderId === orderId);
  if (r && r.status === "Draft") {
    r.status = "Final";
    r.finalizedAt = "just now";
    setOrderStatus(orderId, "Finalized");
  }
  reports = [...reports];
  return mockRequest(r ?? null);
}

export function addAddendum(orderId: string, text: string, author: string) {
  const r = reports.find((x) => x.orderId === orderId);
  if (r) {
    r.addenda = [...r.addenda, { text, author, at: "just now" }];
    r.status = "Amended";
    r.version += 1;
  }
  reports = [...reports];
  return mockRequest(r ?? null);
}
