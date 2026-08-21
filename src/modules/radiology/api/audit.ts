import { mockRequest } from "@shared/lib/api/client";

// Illustrative only — real audit is backend-authoritative (CLAUDE.md §9).
// Image access must be auditable in a real system (who viewed what study,
// when, from where) — this read-only view is what that trail would show.

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  at: string;
}

const entries: AuditEntry[] = [
  { id: "raud-1", user: "Dr. Radiologist Iqra Sheikh", action: "Finalized report", target: "rord-7 — CT Chest (Omar Ahmed)", at: "2026-08-19 10:30" },
  { id: "raud-2", user: "Tech. Hamza Iqbal", action: "Completed acquisition", target: "rord-6 — CT Abdomen (Ahmed Ali)", at: "07:20" },
  { id: "raud-3", user: "Dr. Radiologist Iqra Sheikh", action: "Viewed study images", target: "rord-6 — CT Abdomen (Ahmed Ali)", at: "07:35" },
  { id: "raud-4", user: "System", action: "Critical finding notification sent", target: "cf-1 — MRI Spine (Bilal Nasir)", at: "08:20" },
];

export const getAuditLog = () => mockRequest([...entries]);
