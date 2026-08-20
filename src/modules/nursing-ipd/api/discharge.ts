import { mockRequest } from "@shared/lib/api/client";
import { getMyPatients, syncDischargePending } from "./patients";
import type { NursePatient } from "./patients";

// Discharge readiness — a checklist tied to each patient flagged
// `dischargePending`. Completing a discharge requires every item checked
// first (a real safety gate, not just a button), then syncs the patient's
// flag back so Dashboard/My Patients stop showing them as pending.

export interface DischargeChecklistItem {
  id: string;
  patientId: string;
  label: string;
  completed: boolean;
}

let checklist: DischargeChecklistItem[] = [
  { id: "disc-1", patientId: "np-4", label: "Physician discharge order signed", completed: true },
  { id: "disc-2", patientId: "np-4", label: "Discharge medications reconciled", completed: true },
  { id: "disc-3", patientId: "np-4", label: "Patient education completed", completed: false },
  { id: "disc-4", patientId: "np-4", label: "Follow-up appointment scheduled", completed: false },
  { id: "disc-5", patientId: "np-4", label: "Transport arranged", completed: false },
  { id: "disc-6", patientId: "np-4", label: "Discharge summary documented", completed: false },
];

export interface DischargeQueueItem {
  patient: NursePatient;
  completed: number;
  total: number;
}

export async function getDischargeQueue(): Promise<DischargeQueueItem[]> {
  const patients = await getMyPatients();
  return patients
    .filter((p) => p.dischargePending)
    .map((patient) => {
      const items = checklist.filter((c) => c.patientId === patient.id);
      return { patient, completed: items.filter((c) => c.completed).length, total: items.length };
    });
}

export function getChecklistForPatient(patientId: string) {
  return mockRequest([...checklist].filter((c) => c.patientId === patientId));
}

export function toggleChecklistItem(id: string) {
  const item = checklist.find((c) => c.id === id);
  if (item) item.completed = !item.completed;
  checklist = [...checklist];
  return mockRequest([...checklist]);
}

export function completeDischarge(patientId: string) {
  const items = checklist.filter((c) => c.patientId === patientId);
  const allDone = items.length > 0 && items.every((c) => c.completed);
  if (allDone) syncDischargePending(patientId, false);
  return mockRequest(allDone);
}
