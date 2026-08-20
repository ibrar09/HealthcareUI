import { mockRequest } from "@shared/lib/api/client";
import { getMyPatients, syncAssessmentDue } from "./patients";
import type { NursePatient } from "./patients";

// Nursing (systems) assessment — the structured head-to-toe charting that
// sits alongside Vitals and Medications as the third core piece of shift
// documentation. Each body system gets a coded Normal/Abnormal finding
// (never a single free-text box) with notes required only when Abnormal.
// Fall/skin risk are recorded as controlled risk levels rather than a raw
// numeric score, matching this app's "structured, not free text" rule
// without building a full Morse/Braden point calculator that no other
// screen in this mock world needs.

export const BODY_SYSTEMS = [
  "Neurological",
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "Genitourinary",
  "Skin / Integumentary",
  "Musculoskeletal",
  "Psychosocial",
] as const;

export type BodySystem = (typeof BODY_SYSTEMS)[number];
export type SystemFindingValue = "Normal" | "Abnormal";
export type RiskLevel = "Low" | "Moderate" | "High" | "Severe";

export interface SystemFinding {
  system: BodySystem;
  finding: SystemFindingValue;
  notes?: string;
}

export interface NursingAssessment {
  id: string;
  patientId: string;
  performedBy: string;
  performedAt: string;
  systems: SystemFinding[];
  fallRiskLevel: RiskLevel;
  skinRiskLevel: RiskLevel;
  generalNotes?: string;
}

function normalSystems(): SystemFinding[] {
  return BODY_SYSTEMS.map((system) => ({ system, finding: "Normal" as const }));
}

let assessments: NursingAssessment[] = [
  {
    id: "assess-1", patientId: "np-1", performedBy: "Nurse Fatima Khalid", performedAt: "08:05",
    systems: normalSystems().map((s) => (s.system === "Respiratory" ? { ...s, finding: "Abnormal", notes: "Crackles noted lower left lobe, consistent with pneumonia diagnosis." } : s)),
    fallRiskLevel: "Moderate", skinRiskLevel: "Low",
  },
  {
    id: "assess-2", patientId: "np-2", performedBy: "Nurse Fatima Khalid", performedAt: "08:15",
    systems: normalSystems().map((s) => (s.system === "Gastrointestinal" ? { ...s, finding: "Abnormal", notes: "Mild post-op tenderness at incision site, no signs of infection." } : s)),
    fallRiskLevel: "Low", skinRiskLevel: "Low",
  },
  {
    id: "assess-4", patientId: "np-4", performedBy: "Nurse Fatima Khalid", performedAt: "08:20",
    systems: normalSystems(), fallRiskLevel: "Low", skinRiskLevel: "Low", generalNotes: "Discharge readiness screen clear.",
  },
  {
    id: "assess-6", patientId: "np-6", performedBy: "Nurse Fatima Khalid", performedAt: "08:25",
    systems: normalSystems().map((s) => (s.system === "Skin / Integumentary" ? { ...s, finding: "Abnormal", notes: "Cellulitis site — redness reducing, wound margins stable." } : s)),
    fallRiskLevel: "Low", skinRiskLevel: "Moderate",
  },
];

export type AssessmentQueueStatus = "Due" | "Scheduled" | "Completed";

export interface AssessmentQueueItem {
  patient: NursePatient;
  status: AssessmentQueueStatus;
  lastAssessedAt?: string;
  nextDueEstimate?: string;
}

// Patients not yet assessed this shift and not currently flagged Due are
// shown as "Scheduled" against a plain per-shift estimate rather than a
// invented recurring-cadence engine — there's no live clock in this mock
// world for a real cadence calculation to run against.
const NEXT_DUE_ESTIMATE: Record<string, string> = { "np-5": "12:00" };

export async function getAssessmentQueue(): Promise<AssessmentQueueItem[]> {
  const patients = await getMyPatients();
  const queue: AssessmentQueueItem[] = patients.map((patient) => {
    const latest = [...assessments].filter((a) => a.patientId === patient.id).sort((a, b) => b.performedAt.localeCompare(a.performedAt))[0];
    if (patient.assessmentDue) {
      return { patient, status: "Due", lastAssessedAt: latest?.performedAt };
    }
    if (latest) {
      return { patient, status: "Completed", lastAssessedAt: latest.performedAt };
    }
    return { patient, status: "Scheduled", nextDueEstimate: NEXT_DUE_ESTIMATE[patient.id] };
  });
  // getMyPatients() above already simulated network latency once — wrapping
  // the derived result in another mockRequest would double it for no reason.
  return queue;
}

export function getLatestAssessment(patientId: string) {
  const latest = [...assessments].filter((a) => a.patientId === patientId).sort((a, b) => b.performedAt.localeCompare(a.performedAt))[0];
  return mockRequest(latest ?? null);
}

export interface SubmitAssessmentInput {
  systems: SystemFinding[];
  fallRiskLevel: RiskLevel;
  skinRiskLevel: RiskLevel;
  generalNotes?: string;
}

export function submitAssessment(patientId: string, input: SubmitAssessmentInput) {
  const record: NursingAssessment = {
    id: `assess-${Date.now()}`,
    patientId,
    performedBy: "Nurse Fatima Khalid",
    performedAt: "just now",
    ...input,
  };
  assessments = [record, ...assessments];
  syncAssessmentDue(patientId, false);
  return mockRequest(record);
}
