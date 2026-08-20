import { mockRequest } from "@shared/lib/api/client";
import { getMyPatients } from "./patients";
import type { NursePatient } from "./patients";

export interface RoundEntry {
  patientId: string;
  roundedAt?: string;
  notes?: string;
}

let rounds: RoundEntry[] = [
  { patientId: "np-1", roundedAt: "08:00", notes: "Attending reviewed antibiotic course, continue current plan." },
  { patientId: "np-4", roundedAt: "08:10", notes: "Discharge plan confirmed with attending." },
];

export interface RoundsQueueItem {
  patient: NursePatient;
  roundedAt?: string;
  notes?: string;
}

export async function getRoundsQueue(): Promise<RoundsQueueItem[]> {
  const patients = await getMyPatients();
  return patients.map((patient) => {
    const r = rounds.find((x) => x.patientId === patient.id);
    return { patient, roundedAt: r?.roundedAt, notes: r?.notes };
  });
}

export function markRounded(patientId: string, notes: string) {
  const existing = rounds.find((r) => r.patientId === patientId);
  if (existing) {
    existing.roundedAt = "just now";
    existing.notes = notes;
  } else {
    rounds = [...rounds, { patientId, roundedAt: "just now", notes }];
  }
  return mockRequest(true);
}
