import { mockRequest } from "@shared/lib/api/client";

// Illustrative only — real audit is backend-authoritative (CLAUDE.md §9).

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  at: string;
}

const entries: AuditEntry[] = [
  { id: "eaud-1", user: "Dr. Sana Riaz", action: "Assigned acuity level 1", target: "enc-7 — Unidentified Patient", at: "08:27" },
  { id: "eaud-2", user: "System", action: "Critical result notification sent", target: "calert-1 — ABG pCO2 62 (Waseem Anjum)", at: "08:16" },
  { id: "eaud-3", user: "Nurse Hamza Iqbal", action: "Assigned bed", target: "enc-2 — TRAUMA-1", at: "07:58" },
  { id: "eaud-4", user: "Dr. Ahsan Malik", action: "Ordered STAT troponin", target: "enc-1 — Junaid Aslam", at: "07:45" },
  { id: "eaud-5", user: "ED Receptionist Ayesha Baig", action: "Registered unidentified patient", target: "UNKNOWN-ED-2026-00021", at: "08:25" },
];

export const getAuditLog = () => mockRequest([...entries]);
