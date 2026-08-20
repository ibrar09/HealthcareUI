import { mockRequest } from "@shared/lib/api/client";

export type ProcedureStatus = "Scheduled" | "Completed";

export interface NurseProcedure {
  id: string;
  patientId: string;
  name: string;
  scheduledAt: string;
  status: ProcedureStatus;
  performedAt?: string;
}

let procedures: NurseProcedure[] = [
  { id: "proc-1", patientId: "np-1", name: "IV line dressing change", scheduledAt: "11:00", status: "Scheduled" },
  { id: "proc-2", patientId: "np-2", name: "Surgical wound dressing change", scheduledAt: "13:00", status: "Scheduled" },
  { id: "proc-3", patientId: "np-6", name: "Wound debridement assist", scheduledAt: "10:30", status: "Scheduled" },
  { id: "proc-4", patientId: "np-5", name: "Urinary catheter care", scheduledAt: "08:00", status: "Completed", performedAt: "08:05" },
];

export const getProcedures = () => mockRequest([...procedures]);

export function completeProcedure(id: string) {
  const p = procedures.find((x) => x.id === id);
  if (p) {
    p.status = "Completed";
    p.performedAt = "just now";
  }
  procedures = [...procedures];
  return mockRequest([...procedures]);
}
