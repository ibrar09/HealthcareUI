import { mockRequest } from "@shared/lib/api/client";

// Illustrative only — real audit logging is backend-authoritative (see
// CLAUDE.md §9); this is a read-only view of what that trail would show,
// not a substitute for it.

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  at: string;
}

const entries: AuditEntry[] = [
  { id: "aud-1", user: "Pharm. Zainab Hussain", action: "Verified order", target: "ord-6 — Furosemide (Tariq Jameel)", at: "2026-08-20 07:00" },
  { id: "aud-2", user: "Pharm. Zainab Hussain", action: "Dispensed order", target: "ord-8 — Aspirin (Kashif Rana)", at: "2026-08-20 07:10" },
  { id: "aud-3", user: "Pharm. Manager Adeel Shah", action: "Received controlled stock", target: "MOR-2610 — Morphine Sulfate, qty 30", at: "2026-08-15 09:00" },
  { id: "aud-4", user: "System", action: "Batch quarantined", target: "VAN-2599 — Temperature excursion", at: "2026-08-17 22:14" },
];

export const getAuditLog = () => mockRequest([...entries]);
