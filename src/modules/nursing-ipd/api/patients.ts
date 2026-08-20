import { mockRequest } from "@shared/lib/api/client";

// Nursing Portal's core patient/ward data — the base file other domain
// files (medications.ts, ...) import from, never the other way around, so
// there's never a circular import between them. The barrel (index.ts) just
// re-exports everything; pages always import from "@modules/nursing-ipd/api".
//
// Patients here are new identities on Medical Ward A rather than reusing
// Doctor Portal's Elena Rodriguez/Usman Khan, since those two are already
// placed on specific different wards (Ward 3B, Post-Op Ward) in Doctor
// Portal's own data — reusing them here would contradict their established
// room/bed assignment. Same city/MRN/phone conventions as the rest of this
// mock world (Lahore-based, MRN-2026-######), just a fresh ward roster.

export type AcuityLevel = "Critical" | "High Risk" | "Attention" | "Stable";

export interface PatientAllergy {
  substance: string;
  reaction: string;
}

export interface NextMedication {
  name: string;
  dose: string;
  route: string;
  time: string;
  overdue: boolean;
}

export interface NursePatientVitals {
  bp?: string;
  hr?: number;
  spo2?: number;
  temp?: number;
  rr?: number;
  painScore?: number;
  recordedAt?: string;
}

export interface NursePatient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: "Male" | "Female";
  mrn: string;
  room: string;
  bed: string;
  diagnosis: string;
  acuity: AcuityLevel;
  allergies: PatientAllergy[];
  isolation?: { type: string; ppe: string[] };
  fallRisk: "Low" | "Medium" | "High";
  vitals: NursePatientVitals;
  nextMedication?: NextMedication;
  pendingTasks: number;
  vitalsDue: boolean;
  assessmentDue: boolean;
  dischargePending?: boolean;
  activeCarePlans: number;
  noteStatus: "Pending" | "Documented";
}

export type AttentionSeverity = "critical" | "high" | "medium";

export interface AttentionItem {
  id: string;
  patientId: string;
  severity: AttentionSeverity;
  label: string;
}

export interface NurseShift {
  nurseName: string;
  ward: string;
  shiftType: "Morning" | "Evening" | "Night";
  startTime: string;
  endTime: string;
  chargeNurse: string;
}

const shift: NurseShift = {
  nurseName: "Nurse Fatima Khalid",
  ward: "Medical Ward A",
  shiftType: "Morning",
  startTime: "07:00",
  endTime: "15:00",
  chargeNurse: "Nurse Amina Riaz",
};

const patients: NursePatient[] = [
  {
    id: "np-1", name: "Ahmed Ali", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80", age: 45, gender: "Male", mrn: "MRN-2026-009101",
    room: "204", bed: "B", diagnosis: "Pneumonia", acuity: "Critical",
    allergies: [{ substance: "Penicillin", reaction: "Anaphylaxis reported 2021" }],
    fallRisk: "Medium",
    vitals: { bp: "118/76", hr: 98, spo2: 90, temp: 38.1, rr: 22, painScore: 4, recordedAt: "07:30" },
    nextMedication: { name: "Antibiotic (Ceftriaxone)", dose: "1g", route: "IV", time: "10:00", overdue: false },
    pendingTasks: 3, vitalsDue: true, assessmentDue: false, activeCarePlans: 2, noteStatus: "Pending",
  },
  {
    id: "np-2", name: "Sara Khan", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80", age: 34, gender: "Female", mrn: "MRN-2026-009102",
    room: "205", bed: "A", diagnosis: "Post-operative — appendectomy", acuity: "Attention",
    allergies: [],
    fallRisk: "Low",
    vitals: { bp: "126/82", hr: 88, spo2: 97, temp: 37.6, rr: 18, painScore: 3, recordedAt: "07:35" },
    nextMedication: { name: "Paracetamol", dose: "1g", route: "Oral", time: "09:00", overdue: true },
    pendingTasks: 2, vitalsDue: false, assessmentDue: false, activeCarePlans: 2, noteStatus: "Pending",
  },
  {
    id: "np-3", name: "Omar Ahmed", avatar: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=150&auto=format&fit=crop&q=80", age: 58, gender: "Male", mrn: "MRN-2026-009103",
    room: "202", bed: "A", diagnosis: "COPD exacerbation", acuity: "High Risk",
    allergies: [],
    fallRisk: "Medium",
    vitals: { bp: "142/90", hr: 92, spo2: 91, temp: 37.0, rr: 24, painScore: 1, recordedAt: "07:40" },
    pendingTasks: 1, vitalsDue: false, assessmentDue: true, activeCarePlans: 1, noteStatus: "Pending",
  },
  {
    id: "np-4", name: "Fatima Iqbal", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80", age: 29, gender: "Female", mrn: "MRN-2026-009104",
    room: "203", bed: "A", diagnosis: "Diabetic ketoacidosis — resolving", acuity: "Stable",
    allergies: [],
    fallRisk: "Low",
    vitals: { bp: "112/74", hr: 76, spo2: 99, temp: 36.8, rr: 16, painScore: 0, recordedAt: "07:45" },
    pendingTasks: 0, vitalsDue: false, assessmentDue: false, dischargePending: true, activeCarePlans: 1, noteStatus: "Documented",
  },
  {
    id: "np-5", name: "Bilal Nasir", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&auto=format&fit=crop&q=80", age: 62, gender: "Male", mrn: "MRN-2026-009105",
    room: "201", bed: "A", diagnosis: "CHF exacerbation", acuity: "Attention",
    allergies: [],
    fallRisk: "High",
    vitals: { bp: "134/86", hr: 96, spo2: 95, temp: 36.9, rr: 20, painScore: 2, recordedAt: "07:50" },
    nextMedication: { name: "Furosemide", dose: "40mg", route: "IV", time: "11:00", overdue: false },
    pendingTasks: 2, vitalsDue: false, assessmentDue: false, activeCarePlans: 2, noteStatus: "Pending",
  },
  {
    id: "np-6", name: "Mehwish Tariq", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&auto=format&fit=crop&q=80", age: 51, gender: "Female", mrn: "MRN-2026-009106",
    room: "201", bed: "B", diagnosis: "Cellulitis — IV antibiotics", acuity: "Stable",
    allergies: [{ substance: "Sulfa drugs", reaction: "Skin rash reported 2019" }],
    isolation: { type: "Contact Precautions", ppe: ["Gloves", "Gown"] },
    fallRisk: "Low",
    vitals: { bp: "118/78", hr: 80, spo2: 98, temp: 37.1, rr: 16, painScore: 1, recordedAt: "07:55" },
    pendingTasks: 1, vitalsDue: false, assessmentDue: false, activeCarePlans: 1, noteStatus: "Documented",
  },
];

const attentionItems: AttentionItem[] = [
  { id: "att-1", patientId: "np-1", severity: "critical", label: "Abnormal SpO₂ — Ahmed Ali" },
  { id: "att-2", patientId: "np-2", severity: "high", label: "Medication overdue — Sara Khan" },
  { id: "att-3", patientId: "np-3", severity: "medium", label: "Assessment due — Omar Ahmed" },
];

export const getShift = () => mockRequest({ ...shift });
export const getMyPatients = () => mockRequest([...patients]);
export const getAttentionItems = () => mockRequest([...attentionItems]);

// The full set of physical bed slots on the ward — deliberately a separate,
// static list from `patients`, not derived from who's currently admitted.
// A bed exists whether or not anyone is in it; the ward layout is computed
// by joining this list against `patients` on room+bed, so it can never
// disagree with My Patients/Dashboard about who's where.
const wardBedSlots: { room: string; bed: string }[] = [
  { room: "201", bed: "A" }, { room: "201", bed: "B" },
  { room: "202", bed: "A" }, { room: "202", bed: "B" },
  { room: "203", bed: "A" }, { room: "203", bed: "B" },
  { room: "204", bed: "A" }, { room: "204", bed: "B" },
  { room: "205", bed: "A" }, { room: "205", bed: "B" },
];

export interface WardBedSlot {
  room: string;
  bed: string;
  patient: NursePatient | null;
}

export function getWardLayout() {
  const layout: WardBedSlot[] = wardBedSlots.map((slot) => ({
    ...slot,
    patient: patients.find((p) => p.room === slot.room && p.bed === slot.bed) ?? null,
  }));
  return mockRequest(layout);
}

export function getPatientById(id: string) {
  return mockRequest(patients.find((p) => p.id === id) ?? null);
}

// Synchronous, not mockRequest-wrapped — an internal cross-file sync point
// for medications.ts to call after an administration status change, not a
// page-facing API call. Keeps `patients` itself private to this file while
// still letting the medication schedule stay the source of truth for
// `nextMedication`, avoiding the two ever disagreeing.
export function syncNextMedication(patientId: string, med: NextMedication | undefined) {
  const patient = patients.find((p) => p.id === patientId);
  if (patient) patient.nextMedication = med;
}

// Same cross-file sync point as syncNextMedication, called by assessments.ts
// after a nursing assessment is completed, so My Patients/Dashboard/Bedside
// never disagree with the assessment worklist about who's still due.
export function syncAssessmentDue(patientId: string, due: boolean) {
  const patient = patients.find((p) => p.id === patientId);
  if (patient) patient.assessmentDue = due;
}

// Same pattern, called by tasks.ts after a task is completed so the
// patient-card task count never disagrees with the Tasks worklist.
export function syncPendingTasks(patientId: string, count: number) {
  const patient = patients.find((p) => p.id === patientId);
  if (patient) patient.pendingTasks = count;
}

// Same pattern, called by notes.ts once a note is filed for the shift.
export function syncNoteStatus(patientId: string, status: "Pending" | "Documented") {
  const patient = patients.find((p) => p.id === patientId);
  if (patient) patient.noteStatus = status;
}

// Same pattern, called by carePlans.ts after a plan is resolved/added.
export function syncActiveCarePlans(patientId: string, count: number) {
  const patient = patients.find((p) => p.id === patientId);
  if (patient) patient.activeCarePlans = count;
}

// Same pattern, called by discharge.ts once every checklist item is
// complete and the discharge is finalized.
export function syncDischargePending(patientId: string, pending: boolean) {
  const patient = patients.find((p) => p.id === patientId);
  if (patient) patient.dischargePending = pending;
}

export function recordVitals(id: string, vitals: NursePatientVitals) {
  const patient = patients.find((p) => p.id === id);
  if (patient) {
    patient.vitals = { ...vitals, recordedAt: "just now" };
    patient.vitalsDue = false;
  }
  return mockRequest(patient ? { ...patient } : null);
}

export function getDashboardStats() {
  const stats = {
    myPatients: patients.length,
    critical: patients.filter((p) => p.acuity === "Critical").length,
    medicationsDue: patients.filter((p) => p.nextMedication).length,
    tasksDue: patients.reduce((sum, p) => sum + p.pendingTasks, 0),
    vitalsDue: patients.filter((p) => p.vitalsDue).length,
    pending: patients.filter((p) => p.assessmentDue).length,
  };
  return mockRequest(stats);
}
