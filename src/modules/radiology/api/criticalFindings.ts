import { mockRequest } from "@shared/lib/api/client";

export interface CriticalFinding {
  id: string;
  patientId: string;
  orderId: string;
  finding: string;
  severity: "critical" | "high";
  recipientDoctor: string;
  notifiedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  escalated: boolean;
}

let findings: CriticalFinding[] = [
  { id: "cf-1", patientId: "rp-5", orderId: "rord-5", finding: "Suspected acute cord compression on MRI spine — requires urgent surgical evaluation.", severity: "critical", recipientDoctor: "Dr. Sana Riaz", notifiedAt: "08:20", acknowledged: false, escalated: false },
];

export const getCriticalFindings = () => mockRequest([...findings]);

export function createCriticalFinding(input: Omit<CriticalFinding, "id" | "acknowledged" | "escalated" | "notifiedAt">) {
  const f: CriticalFinding = { ...input, id: `cf-${Date.now()}`, acknowledged: false, escalated: false, notifiedAt: "just now" };
  findings = [f, ...findings];
  return mockRequest(f);
}

export function acknowledgeCriticalFinding(id: string) {
  const f = findings.find((x) => x.id === id);
  if (f) { f.acknowledged = true; f.acknowledgedAt = "just now"; }
  findings = [...findings];
  return mockRequest([...findings]);
}

// No live clock in this mock world to auto-trigger escalation timers —
// same pattern as Nursing's hardcoded overdue-dose demo. A manager can
// escalate manually when the configured window has passed.
export function escalateCriticalFinding(id: string) {
  const f = findings.find((x) => x.id === id);
  if (f) f.escalated = true;
  findings = [...findings];
  return mockRequest([...findings]);
}
