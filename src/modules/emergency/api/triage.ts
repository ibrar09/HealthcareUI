import { mockRequest } from "@shared/lib/api/client";
import { setAcuity } from "./encounters";
import type { AcuityLevel } from "./encounters";

// Triage vitals + configurable red flags. The system highlights configured
// warning signs but never independently diagnoses — acuity is always a
// nurse decision, this just records it.

export const RED_FLAGS = ["Severe respiratory distress", "Altered consciousness", "Severe bleeding", "Chest pain", "Stroke symptoms", "Major trauma", "Sepsis concern", "Severe allergic reaction", "Pediatric deterioration"] as const;

export interface TriageVitals {
  bp?: string;
  hr?: number;
  rr?: number;
  temp?: number;
  spo2?: number;
  painScore?: number;
}

export interface TriageAssessment {
  encounterId: string;
  vitals: TriageVitals;
  redFlags: string[];
  acuityLevel: AcuityLevel;
  triageNurse: string;
  triagedAt: string;
}

let assessments: TriageAssessment[] = [
  { encounterId: "enc-1", vitals: { bp: "148/92", hr: 102, rr: 20, temp: 37.1, spo2: 96, painScore: 7 }, redFlags: ["Chest pain"], acuityLevel: 2, triageNurse: "Nurse Amina Riaz", triagedAt: "07:43" },
  { encounterId: "enc-2", vitals: { bp: "100/68", hr: 118, rr: 24, temp: 36.8, spo2: 94, painScore: 8 }, redFlags: ["Major trauma"], acuityLevel: 1, triageNurse: "Nurse Hamza Iqbal", triagedAt: "07:57" },
  { encounterId: "enc-3", vitals: { bp: "138/85", hr: 96, rr: 26, temp: 37.4, spo2: 89, painScore: 3 }, redFlags: ["Severe respiratory distress"], acuityLevel: 2, triageNurse: "Nurse Amina Riaz", triagedAt: "08:08" },
  { encounterId: "enc-5", vitals: { bp: "122/78", hr: 84, rr: 16, temp: 36.9, spo2: 99, painScore: 5 }, redFlags: [], acuityLevel: 4, triageNurse: "Nurse Hamza Iqbal", triagedAt: "08:18" },
  { encounterId: "enc-7", vitals: { bp: "88/54", hr: 128, rr: 28, temp: 35.2, spo2: 85, painScore: 0 }, redFlags: ["Altered consciousness", "Severe bleeding"], acuityLevel: 1, triageNurse: "Nurse Hamza Iqbal", triagedAt: "08:27" },
  { encounterId: "enc-8", vitals: { bp: "128/80", hr: 88, rr: 18, temp: 37.6, spo2: 98, painScore: 6 }, redFlags: [], acuityLevel: 3, triageNurse: "Nurse Amina Riaz", triagedAt: "08:03" },
];

export const getTriageAssessments = () => mockRequest([...assessments]);
export const getTriageForEncounter = (encounterId: string) => mockRequest(assessments.find((a) => a.encounterId === encounterId) ?? null);

export function submitTriage(encounterId: string, vitals: TriageVitals, redFlags: string[], acuityLevel: AcuityLevel, triageNurse: string) {
  assessments = [...assessments.filter((a) => a.encounterId !== encounterId), { encounterId, vitals, redFlags, acuityLevel, triageNurse, triagedAt: "just now" }];
  setAcuity(encounterId, acuityLevel);
  return mockRequest(assessments.find((a) => a.encounterId === encounterId)!);
}

export interface Reassessment {
  id: string;
  encounterId: string;
  vitals: TriageVitals;
  notes: string;
  performedBy: string;
  at: string;
}

let reassessments: Reassessment[] = [
  { id: "reas-1", encounterId: "enc-3", vitals: { spo2: 92, hr: 90 }, notes: "SpO2 improved slightly with oxygen therapy.", performedBy: "Nurse Amina Riaz", at: "08:40" },
];

export const getReassessments = (encounterId: string) => mockRequest(reassessments.filter((r) => r.encounterId === encounterId));

export function addReassessment(encounterId: string, vitals: TriageVitals, notes: string, performedBy: string) {
  const rec: Reassessment = { id: `reas-${Date.now()}`, encounterId, vitals, notes, performedBy, at: "just now" };
  reassessments = [rec, ...reassessments];
  return mockRequest(rec);
}
