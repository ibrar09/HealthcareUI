import { mockRequest } from "@shared/lib/api/client";
import { getMyPatients } from "./patients";
import type { NursePatient } from "./patients";

export interface SafetyCheck {
  patientId: string;
  bedRailsUp: boolean;
  callBellInReach: boolean;
  fallPrecautionsInPlace: boolean;
  checkedAt?: string;
}

let checks: SafetyCheck[] = [
  { patientId: "np-1", bedRailsUp: true, callBellInReach: true, fallPrecautionsInPlace: true, checkedAt: "07:30" },
  { patientId: "np-5", bedRailsUp: true, callBellInReach: true, fallPrecautionsInPlace: true, checkedAt: "07:50" },
];

export interface SafetyQueueItem {
  patient: NursePatient;
  check?: SafetyCheck;
}

export async function getSafetyQueue(): Promise<SafetyQueueItem[]> {
  const patients = await getMyPatients();
  return patients.map((patient) => ({ patient, check: checks.find((c) => c.patientId === patient.id) }));
}

export function saveSafetyCheck(patientId: string, fields: Omit<SafetyCheck, "patientId" | "checkedAt">) {
  const existing = checks.find((c) => c.patientId === patientId);
  if (existing) {
    Object.assign(existing, fields, { checkedAt: "just now" });
  } else {
    checks = [...checks, { patientId, ...fields, checkedAt: "just now" }];
  }
  return mockRequest(true);
}
