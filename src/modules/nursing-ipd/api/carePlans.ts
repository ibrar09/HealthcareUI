import { mockRequest } from "@shared/lib/api/client";
import { getMyPatients, syncActiveCarePlans } from "./patients";
import type { NursePatient } from "./patients";

// Care Plans — maps to FHIR CarePlan (HMS_DOMAIN_STANDARDS.md). Each plan
// has a coded category and an explicit goal, not just a free-text title.
// The patient card's `activeCarePlans` count is derived from here, same
// sync discipline as tasks.ts/notes.ts/assessments.ts.

export type CarePlanCategory = "Respiratory" | "Cardiac" | "Wound Care" | "Pain Management" | "Mobility" | "Discharge Planning" | "Post-operative";
export type CarePlanStatus = "Active" | "Resolved";

export interface CarePlan {
  id: string;
  patientId: string;
  title: string;
  category: CarePlanCategory;
  goal: string;
  status: CarePlanStatus;
  startedAt: string;
  resolvedAt?: string;
}

let plans: CarePlan[] = [
  { id: "cp-1", patientId: "np-1", title: "Pneumonia management", category: "Respiratory", goal: "SpO₂ ≥ 94% on room air within 5 days", status: "Active", startedAt: "2026-08-15" },
  { id: "cp-2", patientId: "np-1", title: "Fall prevention", category: "Mobility", goal: "Zero fall incidents during admission", status: "Active", startedAt: "2026-08-15" },

  { id: "cp-3", patientId: "np-2", title: "Post-operative recovery", category: "Post-operative", goal: "Independent ambulation by post-op day 3", status: "Active", startedAt: "2026-08-16" },
  { id: "cp-4", patientId: "np-2", title: "Pain management", category: "Pain Management", goal: "Pain score ≤ 3/10 on oral analgesia", status: "Active", startedAt: "2026-08-16" },

  { id: "cp-5", patientId: "np-3", title: "COPD exacerbation management", category: "Respiratory", goal: "Return to baseline respiratory function", status: "Active", startedAt: "2026-08-14" },

  { id: "cp-6", patientId: "np-4", title: "DKA resolution & discharge planning", category: "Discharge Planning", goal: "Stable glucose control, discharge-ready teaching complete", status: "Active", startedAt: "2026-08-13" },

  { id: "cp-7", patientId: "np-5", title: "CHF fluid management", category: "Cardiac", goal: "Euvolemic status, daily weight trending down", status: "Active", startedAt: "2026-08-12" },
  { id: "cp-8", patientId: "np-5", title: "Fall prevention", category: "Mobility", goal: "Zero fall incidents during admission", status: "Active", startedAt: "2026-08-12" },

  { id: "cp-9", patientId: "np-6", title: "Cellulitis wound care & infection control", category: "Wound Care", goal: "Wound margins stable, contact precautions cleared", status: "Active", startedAt: "2026-08-11" },
];

export function getCarePlansForPatient(patientId: string) {
  return mockRequest([...plans].filter((p) => p.patientId === patientId).sort((a, b) => (a.status === b.status ? 0 : a.status === "Active" ? -1 : 1)));
}

export interface CarePlansQueueItem {
  patient: NursePatient;
  activeCount: number;
}

export async function getCarePlansQueue(): Promise<CarePlansQueueItem[]> {
  const patients = await getMyPatients();
  return patients.map((patient) => ({ patient, activeCount: plans.filter((p) => p.patientId === patient.id && p.status === "Active").length }));
}

function recomputeActiveCarePlans(patientId: string) {
  syncActiveCarePlans(patientId, plans.filter((p) => p.patientId === patientId && p.status === "Active").length);
}

export function resolveCarePlan(id: string) {
  const plan = plans.find((p) => p.id === id);
  if (plan) {
    plan.status = "Resolved";
    plan.resolvedAt = "just now";
    recomputeActiveCarePlans(plan.patientId);
  }
  plans = [...plans];
  return mockRequest([...plans]);
}

export interface AddCarePlanInput {
  title: string;
  category: CarePlanCategory;
  goal: string;
}

export function addCarePlan(patientId: string, input: AddCarePlanInput) {
  const plan: CarePlan = { id: `cp-${Date.now()}`, patientId, status: "Active", startedAt: "just now", ...input };
  plans = [plan, ...plans];
  recomputeActiveCarePlans(patientId);
  return mockRequest(plan);
}
