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
  { id: "laud-1", user: "Sr. MLS Fatima Zahra", action: "Released result", target: "res-6/res-7 — Sodium/Potassium (Farhan Sheikh)", at: "2026-08-20 06:30" },
  { id: "laud-2", user: "System", action: "Critical result notification sent", target: "crit-1 — Potassium 6.9 (Farhan Sheikh)", at: "2026-08-20 06:32" },
  { id: "laud-3", user: "MLS Sana Iqbal", action: "Rejected specimen", target: "rej-1 — Potassium, Hemolyzed (Nadia Aslam)", at: "07:55" },
  { id: "laud-4", user: "MLS Kamran Butt", action: "Entered result", target: "res-1/res-2 — TSH/HbA1c (Adeel Rana)", at: "07:10" },
  { id: "laud-5", user: "BioMed Tech. Waqas Ali", action: "Logged corrective maintenance", target: "an-6 — Microbiology Incubator 1", at: "2026-08-20 07:30" },
];

export const getAuditLog = () => mockRequest([...entries]);
