import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { staffMembers } from "./staff";
import { patientSeeds } from "./patients";
import { createBedRequest, type BedRequestPriority } from "./beds";
import { getLabOrders, createLabOrder, type LabOrderPriority } from "./laboratory";
import { getImagingOrders, getRadiologyReports } from "./radiology";

// ============================================================================
// Emergency Department (Hospital Admin's [full] section for the MVP screens
// below — upgraded from its earlier [oversight]-only placeholder scope note
// the same way Radiology/OT/Pharmacy/Inventory were, since the user's own
// spec explicitly asks for the full clinical workflow, not just status/volume
// oversight). Built per EMERGENCY_MODULE_SPEC.md's own explicit MVP scoping
// instruction ("don't build every screen immediately, start with these 10")
// — a deliberately narrower pass than OT/Pharmacy/Inventory's "do it all."
//
// MVP scope: Dashboard, Patient Queue (+ detail drawer), Triage, Treatment/
// Doctor Workspace, Orders, Lab & Radiology Results, Observation, Disposition
// (Admission/Transfer/Discharge combined per the user's own bundling), and
// Reports. Audit included too, matching this project's standing "every
// module ships one" discipline even though it wasn't in the user's MVP list.
//
// Real cross-module integration (per the spec's own "connect these to your
// existing modules" instruction, never a duplicate): lab orders genuinely
// call laboratory.ts's `createLabOrder`/`getLabOrders`; the Results tab reads
// real `getImagingOrders`/`getRadiologyReports`; Admission genuinely calls
// beds.ts's `createBedRequest` (the real Bed Management "Requests" queue
// picks it up from there, same as any other department's request).
//
// Triage priority is intentionally a configurable lookup (`TriageCategory[]`),
// never a hardcoded TS union — per the spec's own explicit "don't hardcode
// one country's triage system" instruction.
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

function resolvePatientName(patientId: string): string {
  return patientSeeds.find((p) => p.id === patientId)?.fullName ?? "Unknown Patient";
}
function resolvePatientAge(patientId: string): number {
  const dob = patientSeeds.find((p) => p.id === patientId)?.dob;
  if (!dob) return 0;
  return Math.floor((new Date(TODAY).getTime() - new Date(dob).getTime()) / (365.25 * 86400000));
}
function resolvePatientSex(patientId: string): string {
  return patientSeeds.find((p) => p.id === patientId)?.gender ?? "unknown";
}
function resolveStaffName(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  return staffMembers.find((s) => s.id === staffId)?.name;
}
function resolveDepartmentName(departmentId: string): string {
  return departmentConfigs.find((d) => d.id === departmentId)?.name ?? "Unknown Department";
}
function minutesSince(iso: string): number {
  return Math.floor((new Date(NOW).getTime() - new Date(iso).getTime()) / 60000);
}

// A lightweight, module-local allergy/condition/medication snapshot —
// patients.ts doesn't model AllergyIntolerance/Condition/MedicationStatement
// yet (same known gap Pharmacy's own local `patientAllergyMap` documents),
// so Triage keeps just enough structured data to show real allergy/history
// context without inventing a fuller clinical record.
const patientAllergyMap: Record<string, string[]> = {
  "p-ibrar-ahmad": ["Penicillin"],
  "p-fatima-sheikh": [],
  "p-ahsan-tariq": ["Sulfa drugs"],
  "p-zara-malik": [],
  "p-bilal-hussain": ["Aspirin", "NSAIDs"],
  "p-ayesha-raza": [],
  "p-kamal-siddiqui": ["Penicillin"],
  "p-hassan-abbasi": [],
  "p-mariam-farooq": [],
  "p-usman-khan": [],
  "p-noor-fatima": [],
  "p-hamza-butt": [],
  "p-saira-cheema": ["Codeine"],
  "p-omar-sethi": [],
  "p-layla-awan": [],
  "p-elena-rodriguez": ["Latex"],
};
const patientConditionsMap: Record<string, string[]> = {
  "p-hassan-abbasi": ["Hypertension", "Type 2 Diabetes"],
  "p-usman-khan": ["Coronary Artery Disease"],
  "p-mariam-farooq": ["Asthma"],
};
const patientMedicationsMap: Record<string, string[]> = {
  "p-hassan-abbasi": ["Metformin 500mg BID", "Losartan 50mg OD"],
  "p-usman-khan": ["Aspirin 75mg OD", "Atorvastatin 20mg OD"],
};

function getPatientAllergies(patientId: string): string[] {
  return patientAllergyMap[patientId] ?? [];
}

// --- Triage configuration (spec §4) — configurable lookup, never a
// hardcoded single-country triage system. ------------------------------------

export interface TriageCategory {
  id: string;
  name: string;
  level: number;
  color: string;
  targetMinutes: number;
}

export const triageCategories: TriageCategory[] = [
  { id: "triage-critical", name: "Critical", level: 1, color: "var(--pulse-coral)", targetMinutes: 0 },
  { id: "triage-emergent", name: "Emergent", level: 2, color: "var(--pulse-coral)", targetMinutes: 10 },
  { id: "triage-urgent", name: "Urgent", level: 3, color: "var(--caution-amber)", targetMinutes: 30 },
  { id: "triage-less-urgent", name: "Less Urgent", level: 4, color: "var(--signal-indigo)", targetMinutes: 60 },
  { id: "triage-non-urgent", name: "Non-Urgent", level: 5, color: "var(--vital-green)", targetMinutes: 120 },
];

export function getTriageCategories() {
  return mockRequest([...triageCategories].sort((a, b) => a.level - b.level));
}

export interface NewTriageCategoryInput {
  name: string;
  level: number;
  color: string;
  targetMinutes: number;
}

/** Hospital Configuration -> Triage System -> Categories -> Emergency Queue (spec §4) — admin-configurable, not hardcoded. */
export function createTriageCategory(input: NewTriageCategoryInput) {
  const category: TriageCategory = { ...input, id: `triage-${triageCategories.length + 1}` };
  triageCategories.push(category);
  recordEmergencyAudit("Triage category added", "config", category.id, DEFAULT_ACTOR);
  return mockRequest(category);
}

// --- Treatment areas (spec §5) — configurable per hospital. ------------------

export interface EmergencyAreaConfig {
  id: string;
  name: string;
}

export const emergencyAreas: EmergencyAreaConfig[] = [
  { id: "area-resus", name: "Resuscitation" },
  { id: "area-critical", name: "Critical Care" },
  { id: "area-acute", name: "Acute Care" },
  { id: "area-minor", name: "Minor Treatment" },
  { id: "area-observation", name: "Observation" },
  { id: "area-pediatric", name: "Pediatric Emergency" },
  { id: "area-isolation", name: "Isolation" },
  { id: "area-fast-track", name: "Fast Track" },
];

export function getEmergencyAreas() {
  return mockRequest(emergencyAreas);
}

export function createEmergencyArea(name: string) {
  const area: EmergencyAreaConfig = { id: `area-${emergencyAreas.length + 1}`, name };
  emergencyAreas.push(area);
  recordEmergencyAudit("Treatment area added", "config", area.id, DEFAULT_ACTOR);
  return mockRequest(area);
}

// --- Bays (spec §6) -----------------------------------------------------------

export type EmergencyBayStatus = "available" | "occupied" | "cleaning" | "isolation" | "reserved" | "out-of-service";

export interface EmergencyBay {
  id: string;
  bayNumber: string;
  areaId: string;
  status: EmergencyBayStatus;
  currentVisitId?: string;
  assignedNurseId?: string;
  assignedDoctorId?: string;
  isolationRequired: boolean;
  equipmentNotes?: string;
}

export const emergencyBays: EmergencyBay[] = [
  { id: "bay-1", bayNumber: "Bay 01", areaId: "area-resus", status: "available", isolationRequired: false },
  { id: "bay-2", bayNumber: "Bay 02", areaId: "area-critical", status: "available", isolationRequired: false },
  { id: "bay-3", bayNumber: "Bay 03", areaId: "area-acute", status: "cleaning", isolationRequired: false },
  { id: "bay-4", bayNumber: "Bay 04", areaId: "area-acute", status: "available", isolationRequired: false },
  { id: "bay-5", bayNumber: "Bay 05", areaId: "area-isolation", status: "isolation", isolationRequired: true },
  { id: "bay-6", bayNumber: "Bay 06", areaId: "area-minor", status: "reserved", isolationRequired: false },
  { id: "bay-7", bayNumber: "Bay 07", areaId: "area-minor", status: "available", isolationRequired: false },
  { id: "bay-8", bayNumber: "Bay 08", areaId: "area-fast-track", status: "available", isolationRequired: false },
];

export function getEmergencyBays() {
  return mockRequest(
    emergencyBays.map((b) => ({
      ...b,
      areaName: emergencyAreas.find((a) => a.id === b.areaId)?.name ?? "Unknown",
      patientName: b.currentVisitId ? resolvePatientName(emergencyVisits.find((v) => v.id === b.currentVisitId)?.patientId ?? "") : undefined,
      assignedNurseName: resolveStaffName(b.assignedNurseId),
      assignedDoctorName: resolveStaffName(b.assignedDoctorId),
      timeInBayMinutes: b.currentVisitId ? minutesSince(emergencyVisits.find((v) => v.id === b.currentVisitId)?.arrivalTime ?? NOW) : undefined,
    }))
  );
}

function assignBayToVisit(bayId: string, visitId: string) {
  const bay = emergencyBays.find((b) => b.id === bayId);
  if (!bay) return;
  bay.status = bay.isolationRequired ? "isolation" : "occupied";
  bay.currentVisitId = visitId;
}

export function releaseBay(bayId: string, actor = DEFAULT_ACTOR) {
  const bay = emergencyBays.find((b) => b.id === bayId);
  if (!bay) return mockRequest(null);
  bay.status = "cleaning";
  bay.currentVisitId = undefined;
  bay.assignedDoctorId = undefined;
  recordEmergencyAudit("Bay released for cleaning", "bay", bay.bayNumber, actor);
  return mockRequest(bay);
}

export function completeBayCleaning(bayId: string, actor = DEFAULT_ACTOR) {
  const bay = emergencyBays.find((b) => b.id === bayId);
  if (!bay) return mockRequest(null);
  bay.status = "available";
  recordEmergencyAudit("Bay marked available", "bay", bay.bayNumber, actor);
  return mockRequest(bay);
}

// --- Emergency Visit (spec §2-3) — the queue/encounter record. --------------

export type EmergencyArrivalMode = "walk-in" | "ambulance" | "transfer" | "police" | "referral";
export type EmergencyVisitStatus =
  | "waiting-triage"
  | "waiting-doctor"
  | "in-treatment"
  | "in-observation"
  | "disposition-pending"
  | "discharged"
  | "admitted"
  | "transferred"
  | "left-without-treatment";

export interface EmergencyVisit {
  id: string;
  queueNumber: string;
  patientId: string;
  arrivalTime: string;
  arrivalMode: EmergencyArrivalMode;
  chiefComplaint: string;
  triageCategoryId?: string;
  triagedAt?: string;
  triagedBy?: string;
  assignedAreaId?: string;
  assignedBayId?: string;
  assignedDoctorId?: string;
  assignedNurseId?: string;
  status: EmergencyVisitStatus;
  dispositionAt?: string;
}

export const emergencyVisits: EmergencyVisit[] = [
  { id: "ev-1", queueNumber: "ER-0001", patientId: "p-hassan-abbasi", arrivalTime: `${TODAY}T06:10:00`, arrivalMode: "ambulance", chiefComplaint: "Crushing chest pain radiating to left arm", triageCategoryId: "triage-critical", triagedAt: `${TODAY}T06:14:00`, triagedBy: "fahad-siddique", assignedAreaId: "area-resus", assignedBayId: "bay-1", assignedDoctorId: "nadia-farhan", assignedNurseId: "samina-riaz", status: "in-treatment" },
  { id: "ev-2", queueNumber: "ER-0002", patientId: "p-usman-khan", arrivalTime: `${TODAY}T07:05:00`, arrivalMode: "walk-in", chiefComplaint: "Severe abdominal pain, 6 hours", triageCategoryId: "triage-urgent", triagedAt: `${TODAY}T07:12:00`, triagedBy: "fahad-siddique", assignedAreaId: "area-acute", assignedBayId: "bay-4", assignedDoctorId: "imran-qureshi", assignedNurseId: "samina-riaz", status: "in-treatment" },
  { id: "ev-3", queueNumber: "ER-0003", patientId: "p-mariam-farooq", arrivalTime: `${TODAY}T08:20:00`, arrivalMode: "walk-in", chiefComplaint: "Acute asthma exacerbation, shortness of breath", triageCategoryId: "triage-emergent", triagedAt: `${TODAY}T08:24:00`, triagedBy: "fahad-siddique", assignedAreaId: "area-critical", assignedBayId: "bay-2", assignedDoctorId: "nadia-farhan", assignedNurseId: "samina-riaz", status: "in-observation" },
  { id: "ev-4", queueNumber: "ER-0004", patientId: "p-ayesha-raza", arrivalTime: `${TODAY}T09:40:00`, arrivalMode: "walk-in", chiefComplaint: "Twisted ankle, unable to bear weight", triageCategoryId: "triage-less-urgent", triagedAt: `${TODAY}T09:50:00`, triagedBy: "fahad-siddique", assignedAreaId: "area-fast-track", assignedBayId: "bay-8", assignedDoctorId: "imran-qureshi", status: "waiting-doctor" },
  { id: "ev-5", queueNumber: "ER-0005", patientId: "p-noor-fatima", arrivalTime: `${TODAY}T10:15:00`, arrivalMode: "referral", chiefComplaint: "Persistent fever, 3 days", triageCategoryId: "triage-urgent", status: "waiting-triage" },
  { id: "ev-6", queueNumber: "ER-0006", patientId: "p-omar-sethi", arrivalTime: `${TODAY}T10:45:00`, arrivalMode: "walk-in", chiefComplaint: "Minor laceration to forearm", status: "waiting-triage" },
  { id: "ev-7", queueNumber: "ER-0007", patientId: "p-saira-cheema", arrivalTime: `${TODAY}T05:30:00`, arrivalMode: "ambulance", chiefComplaint: "Motor vehicle collision, chest trauma", triageCategoryId: "triage-critical", triagedAt: `${TODAY}T05:33:00`, triagedBy: "samina-riaz", assignedAreaId: "area-resus", assignedDoctorId: "nadia-farhan", dispositionAt: `${TODAY}T07:00:00`, status: "admitted" },
  { id: "ev-8", queueNumber: "ER-0008", patientId: "p-elena-rodriguez", arrivalTime: `${TODAY}T04:50:00`, arrivalMode: "walk-in", chiefComplaint: "Allergic reaction, facial swelling", triageCategoryId: "triage-emergent", triagedAt: `${TODAY}T04:55:00`, triagedBy: "samina-riaz", assignedAreaId: "area-acute", assignedDoctorId: "imran-qureshi", dispositionAt: `${TODAY}T06:20:00`, status: "discharged" },
];

let visitSeq = emergencyVisits.length;

// bay assignment for the seeded in-treatment visits
assignBayToVisit("bay-1", "ev-1");
assignBayToVisit("bay-4", "ev-2");
assignBayToVisit("bay-2", "ev-3");
emergencyBays.find((b) => b.id === "bay-8")!.status = "occupied";
emergencyBays.find((b) => b.id === "bay-8")!.currentVisitId = "ev-4";

export interface EmergencyQueueRow {
  id: string;
  queueNumber: string;
  patientId: string;
  patientName: string;
  age: number;
  sex: string;
  arrivalTime: string;
  arrivalMode: EmergencyArrivalMode;
  triageCategoryId?: string;
  triageCategoryName?: string;
  triageColor?: string;
  chiefComplaint: string;
  assignedAreaName?: string;
  assignedDoctorName?: string;
  status: EmergencyVisitStatus;
  waitMinutes: number;
  latestVitals?: EmergencyVitals;
}

function toQueueRow(v: EmergencyVisit): EmergencyQueueRow {
  const category = v.triageCategoryId ? triageCategories.find((c) => c.id === v.triageCategoryId) : undefined;
  const latest = [...emergencyVitals].reverse().find((vt) => vt.visitId === v.id);
  return {
    id: v.id,
    queueNumber: v.queueNumber,
    patientId: v.patientId,
    patientName: resolvePatientName(v.patientId),
    age: resolvePatientAge(v.patientId),
    sex: resolvePatientSex(v.patientId),
    arrivalTime: v.arrivalTime,
    arrivalMode: v.arrivalMode,
    triageCategoryId: v.triageCategoryId,
    triageCategoryName: category?.name,
    triageColor: category?.color,
    chiefComplaint: v.chiefComplaint,
    assignedAreaName: v.assignedAreaId ? emergencyAreas.find((a) => a.id === v.assignedAreaId)?.name : undefined,
    assignedDoctorName: resolveStaffName(v.assignedDoctorId),
    status: v.status,
    waitMinutes: minutesSince(v.arrivalTime),
    latestVitals: latest,
  };
}

const activeStatuses: EmergencyVisitStatus[] = ["waiting-triage", "waiting-doctor", "in-treatment", "in-observation", "disposition-pending"];

export function getEmergencyQueue(filters: { status?: EmergencyVisitStatus | "active"; triageCategoryId?: string; search?: string } = {}) {
  let rows = emergencyVisits.filter((v) => (filters.status === "active" || !filters.status ? activeStatuses.includes(v.status) : v.status === filters.status));
  if (filters.triageCategoryId) rows = rows.filter((v) => v.triageCategoryId === filters.triageCategoryId);
  let mapped = rows.map(toQueueRow);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    mapped = mapped.filter((r) => r.patientName.toLowerCase().includes(q) || r.queueNumber.toLowerCase().includes(q) || r.chiefComplaint.toLowerCase().includes(q));
  }
  return mockRequest(mapped.sort((a, b) => (a.triageCategoryId && b.triageCategoryId ? (triageCategories.find((c) => c.id === a.triageCategoryId)?.level ?? 9) - (triageCategories.find((c) => c.id === b.triageCategoryId)?.level ?? 9) : a.arrivalTime.localeCompare(b.arrivalTime))));
}

export interface NewEmergencyVisitInput {
  patientId: string;
  arrivalMode: EmergencyArrivalMode;
  chiefComplaint: string;
}

/** Patient Arrival -> Registration/Identification (spec §3) — the entry point into the ED queue. */
export function registerEmergencyVisit(input: NewEmergencyVisitInput, actor = DEFAULT_ACTOR) {
  visitSeq += 1;
  const visit: EmergencyVisit = { id: `ev-${visitSeq}`, queueNumber: `ER-${String(visitSeq).padStart(4, "0")}`, arrivalTime: NOW, status: "waiting-triage", ...input };
  emergencyVisits.push(visit);
  recordEmergencyAudit("Patient registered in Emergency", "visit", visit.queueNumber, actor, input.chiefComplaint);
  return mockRequest(visit);
}

export function getEmergencyVisitDetail(visitId: string) {
  const visit = emergencyVisits.find((v) => v.id === visitId);
  if (!visit) return mockRequest(null);
  const category = visit.triageCategoryId ? triageCategories.find((c) => c.id === visit.triageCategoryId) : undefined;
  return mockRequest({
    ...visit,
    patientName: resolvePatientName(visit.patientId),
    age: resolvePatientAge(visit.patientId),
    sex: resolvePatientSex(visit.patientId),
    allergies: getPatientAllergies(visit.patientId),
    conditions: patientConditionsMap[visit.patientId] ?? [],
    currentMedications: patientMedicationsMap[visit.patientId] ?? [],
    previousVisitCount: emergencyVisits.filter((v) => v.patientId === visit.patientId && v.id !== visit.id).length,
    triageCategoryName: category?.name,
    triageColor: category?.color,
    assignedAreaName: visit.assignedAreaId ? emergencyAreas.find((a) => a.id === visit.assignedAreaId)?.name : undefined,
    assignedDoctorName: resolveStaffName(visit.assignedDoctorId),
    assignedNurseName: resolveStaffName(visit.assignedNurseId),
    triagedByName: resolveStaffName(visit.triagedBy),
    vitalsHistory: emergencyVitals.filter((vt) => vt.visitId === visitId),
    waitMinutes: minutesSince(visit.arrivalTime),
  });
}

export function markLeftWithoutTreatment(visitId: string, actor = DEFAULT_ACTOR) {
  const visit = emergencyVisits.find((v) => v.id === visitId);
  if (!visit) return mockRequest(null);
  visit.status = "left-without-treatment";
  recordEmergencyAudit("Patient left without treatment", "visit", visit.queueNumber, actor);
  return mockRequest(visit);
}

// --- Vitals (spec §3) ----------------------------------------------------------

export interface EmergencyVitals {
  id: string;
  visitId: string;
  recordedAt: string;
  recordedBy: string;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  painScore?: number;
  weight?: number;
  height?: number;
  gcs?: number;
}

export const emergencyVitals: EmergencyVitals[] = [
  { id: "vit-1", visitId: "ev-1", recordedAt: `${TODAY}T06:12:00`, recordedBy: "fahad-siddique", temperature: 37.1, heartRate: 118, respiratoryRate: 22, bpSystolic: 92, bpDiastolic: 58, spo2: 94, painScore: 9 },
  { id: "vit-2", visitId: "ev-2", recordedAt: `${TODAY}T07:10:00`, recordedBy: "fahad-siddique", temperature: 37.8, heartRate: 102, respiratoryRate: 18, bpSystolic: 128, bpDiastolic: 82, spo2: 98, painScore: 7 },
  { id: "vit-3", visitId: "ev-3", recordedAt: `${TODAY}T08:22:00`, recordedBy: "fahad-siddique", temperature: 36.9, heartRate: 124, respiratoryRate: 28, bpSystolic: 118, bpDiastolic: 76, spo2: 90, painScore: 4 },
  { id: "vit-4", visitId: "ev-4", recordedAt: `${TODAY}T09:48:00`, recordedBy: "fahad-siddique", temperature: 36.7, heartRate: 88, respiratoryRate: 16, bpSystolic: 122, bpDiastolic: 78, spo2: 99, painScore: 5 },
  { id: "vit-5", visitId: "ev-7", recordedAt: `${TODAY}T05:32:00`, recordedBy: "samina-riaz", temperature: 36.2, heartRate: 132, respiratoryRate: 26, bpSystolic: 84, bpDiastolic: 50, spo2: 91, painScore: 8, gcs: 13 },
];

export interface NewVitalsInput {
  visitId: string;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  painScore?: number;
  weight?: number;
  height?: number;
  gcs?: number;
  recordedBy: string;
}

export function recordVitals(input: NewVitalsInput) {
  const vitals: EmergencyVitals = { ...input, id: `vit-${emergencyVitals.length + 1}`, recordedAt: NOW };
  emergencyVitals.push(vitals);
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  recordEmergencyAudit("Vitals recorded", "visit", visit?.queueNumber ?? input.visitId, input.recordedBy);
  return mockRequest(vitals);
}

// --- Triage (spec §3-4) --------------------------------------------------------

export interface EmergencyTriageRecord {
  id: string;
  visitId: string;
  symptoms: string;
  onset: string;
  duration: string;
  severity: string;
  relevantHistory?: string;
  triageCategoryId: string;
  triagedBy: string;
  triagedAt: string;
}

export const emergencyTriageRecords: EmergencyTriageRecord[] = [];

export interface PerformTriageInput {
  visitId: string;
  symptoms: string;
  onset: string;
  duration: string;
  severity: string;
  relevantHistory?: string;
  triageCategoryId: string;
  triagedBy: string;
  vitals: Omit<NewVitalsInput, "visitId" | "recordedBy">;
  assignedAreaId: string;
}

/** Registration -> Triage -> Priority -> Emergency Area (spec §3) — captures the full triage assessment and moves the visit to waiting-doctor. */
export function performTriage(input: PerformTriageInput) {
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  if (!visit) return mockRequest(null);

  const record: EmergencyTriageRecord = {
    id: `triage-rec-${emergencyTriageRecords.length + 1}`,
    visitId: input.visitId,
    symptoms: input.symptoms,
    onset: input.onset,
    duration: input.duration,
    severity: input.severity,
    relevantHistory: input.relevantHistory,
    triageCategoryId: input.triageCategoryId,
    triagedBy: input.triagedBy,
    triagedAt: NOW,
  };
  emergencyTriageRecords.push(record);

  emergencyVitals.push({ ...input.vitals, id: `vit-${emergencyVitals.length + 1}`, visitId: input.visitId, recordedAt: NOW, recordedBy: input.triagedBy });

  visit.triageCategoryId = input.triageCategoryId;
  visit.triagedAt = NOW;
  visit.triagedBy = input.triagedBy;
  visit.assignedAreaId = input.assignedAreaId;
  visit.status = "waiting-doctor";

  recordEmergencyAudit("Triage completed", "visit", visit.queueNumber, input.triagedBy, `${triageCategories.find((c) => c.id === input.triageCategoryId)?.name ?? "Unknown"} priority`);
  return mockRequest(record);
}

export function getTriageRecord(visitId: string) {
  return mockRequest(emergencyTriageRecords.find((r) => r.visitId === visitId) ?? null);
}

export interface AssignVisitInput {
  visitId: string;
  doctorId?: string;
  nurseId?: string;
  bayId?: string;
}

/** Assign a doctor/nurse/bay (spec §2 "Assign" action) — moves the visit into active treatment once a bay is assigned. */
export function assignVisit(input: AssignVisitInput, actor = DEFAULT_ACTOR) {
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  if (!visit) return mockRequest(null);
  if (input.doctorId) visit.assignedDoctorId = input.doctorId;
  if (input.nurseId) visit.assignedNurseId = input.nurseId;
  if (input.bayId) {
    if (visit.assignedBayId) releaseBay(visit.assignedBayId, actor);
    assignBayToVisit(input.bayId, visit.id);
    visit.assignedBayId = input.bayId;
    const bay = emergencyBays.find((b) => b.id === input.bayId)!;
    bay.assignedDoctorId = visit.assignedDoctorId;
    bay.assignedNurseId = visit.assignedNurseId;
  }
  if (visit.status === "waiting-doctor") visit.status = "in-treatment";
  recordEmergencyAudit("Patient assigned", "visit", visit.queueNumber, actor);
  return mockRequest(visit);
}

// --- Clinical Assessment (spec §7-8) -------------------------------------------

export interface EmergencyClinicalAssessment {
  id: string;
  visitId: string;
  historyOfPresentIllness: string;
  pastMedicalHistory?: string;
  surgicalHistory?: string;
  medicationHistory?: string;
  allergyHistory?: string;
  familySocialHistory?: string;
  examinationFindings: string;
  workingDiagnosis: string;
  differentialDiagnosis?: string;
  clinicalImpression?: string;
  plan: string;
  authoredBy: string;
  authoredAt: string;
}

export const emergencyClinicalAssessments: EmergencyClinicalAssessment[] = [
  {
    id: "assess-1",
    visitId: "ev-1",
    historyOfPresentIllness: "Sudden onset crushing substernal chest pain 45 min prior to arrival, radiating to left arm, associated with diaphoresis.",
    pastMedicalHistory: "Hypertension, hyperlipidemia",
    medicationHistory: "Amlodipine 5mg OD",
    allergyHistory: "NKDA",
    examinationFindings: "Diaphoretic, tachycardic, chest tender to palpation absent. Bilateral air entry equal.",
    workingDiagnosis: "Acute coronary syndrome — STEMI suspected",
    differentialDiagnosis: "Unstable angina, aortic dissection, PE",
    clinicalImpression: "High-risk ACS, activate cath lab pathway",
    plan: "STAT ECG, Troponin, aspirin 300mg, cardiology consult, continuous monitoring",
    authoredBy: "nadia-farhan",
    authoredAt: `${TODAY}T06:20:00`,
  },
];

export interface SaveClinicalAssessmentInput {
  visitId: string;
  historyOfPresentIllness: string;
  pastMedicalHistory?: string;
  surgicalHistory?: string;
  medicationHistory?: string;
  allergyHistory?: string;
  familySocialHistory?: string;
  examinationFindings: string;
  workingDiagnosis: string;
  differentialDiagnosis?: string;
  clinicalImpression?: string;
  plan: string;
  authoredBy: string;
}

export function saveClinicalAssessment(input: SaveClinicalAssessmentInput) {
  const existing = emergencyClinicalAssessments.find((a) => a.visitId === input.visitId);
  if (existing) {
    Object.assign(existing, input, { authoredAt: NOW });
    recordEmergencyAudit("Clinical assessment updated", "assessment", existing.id, input.authoredBy);
    return mockRequest(existing);
  }
  const assessment: EmergencyClinicalAssessment = { ...input, id: `assess-${emergencyClinicalAssessments.length + 1}`, authoredAt: NOW };
  emergencyClinicalAssessments.push(assessment);
  recordEmergencyAudit("Clinical assessment documented", "assessment", assessment.id, input.authoredBy);
  return mockRequest(assessment);
}

export function getClinicalAssessment(visitId: string) {
  return mockRequest(emergencyClinicalAssessments.find((a) => a.visitId === visitId) ?? null);
}

/** My Emergency Patients (spec §7) — the doctor's own active patient list with everything needed on one card. */
export function getDoctorWorkspace(doctorId: string) {
  const visits = emergencyVisits.filter((v) => v.assignedDoctorId === doctorId && activeStatuses.includes(v.status));
  const rows = visits.map((v) => ({
    ...toQueueRow(v),
    hasAssessment: emergencyClinicalAssessments.some((a) => a.visitId === v.id),
    openOrderCount: emergencyOrders.filter((o) => o.visitId === v.id && !["completed", "reviewed", "cancelled"].includes(o.status)).length,
  }));
  return mockRequest(rows);
}

// --- Orders (spec §9) — a unified cross-type tracker; lab/radiology orders
// genuinely write into the real Laboratory/Radiology modules rather than
// duplicating them (medication/procedure/consultation/monitoring have no
// existing home elsewhere, so they stay Emergency's own record). ------------

export type EmergencyOrderType = "laboratory" | "radiology" | "medication" | "procedure" | "consultation" | "monitoring";
export type EmergencyOrderPriority = "routine" | "urgent" | "stat";
export type EmergencyOrderStatus = "ordered" | "accepted" | "in-progress" | "completed" | "result-available" | "reviewed" | "cancelled";

export interface EmergencyOrder {
  id: string;
  orderNumber: string;
  visitId: string;
  orderType: EmergencyOrderType;
  description: string;
  priority: EmergencyOrderPriority;
  orderedBy: string;
  orderedAt: string;
  status: EmergencyOrderStatus;
  linkedLabOrderId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resultNote?: string;
}

export const emergencyOrders: EmergencyOrder[] = [
  { id: "eo-1", orderNumber: "EO-2026-0001", visitId: "ev-1", orderType: "laboratory", description: "Troponin, CBC, Electrolytes", priority: "stat", orderedBy: "nadia-farhan", orderedAt: `${TODAY}T06:22:00`, status: "in-progress" },
  { id: "eo-2", orderNumber: "EO-2026-0002", visitId: "ev-1", orderType: "radiology", description: "12-lead ECG + Chest X-Ray", priority: "stat", orderedBy: "nadia-farhan", orderedAt: `${TODAY}T06:23:00`, status: "result-available" },
  { id: "eo-3", orderNumber: "EO-2026-0003", visitId: "ev-1", orderType: "consultation", description: "Cardiology consultation — suspected STEMI", priority: "stat", orderedBy: "nadia-farhan", orderedAt: `${TODAY}T06:25:00`, status: "accepted" },
  { id: "eo-4", orderNumber: "EO-2026-0004", visitId: "ev-2", orderType: "laboratory", description: "CBC, Amylase, Lipase", priority: "urgent", orderedBy: "imran-qureshi", orderedAt: `${TODAY}T07:15:00`, status: "in-progress" },
];
let orderSeq = emergencyOrders.length;

export interface NewEmergencyOrderInput {
  visitId: string;
  orderType: EmergencyOrderType;
  description: string;
  priority: EmergencyOrderPriority;
  orderedBy: string;
  testCodes?: string[];
}

/** Emergency Doctor -> Laboratory/Radiology/Medication/Procedure/Consultation/Monitoring (spec §9). Lab-type orders genuinely create a real Laboratory ServiceRequest. */
export function createEmergencyOrder(input: NewEmergencyOrderInput) {
  orderSeq += 1;
  const order: EmergencyOrder = {
    id: `eo-${orderSeq}`,
    orderNumber: `EO-2026-${String(orderSeq).padStart(4, "0")}`,
    visitId: input.visitId,
    orderType: input.orderType,
    description: input.description,
    priority: input.priority,
    orderedBy: input.orderedBy,
    orderedAt: NOW,
    status: "ordered",
  };

  if (input.orderType === "laboratory" && input.testCodes?.length) {
    const visit = emergencyVisits.find((v) => v.id === input.visitId)!;
    createLabOrder({
      patientId: visit.patientId,
      orderingPractitionerId: input.orderedBy,
      departmentId: "dept-emergency",
      testCodes: input.testCodes,
      priority: input.priority as LabOrderPriority,
      reasonForTest: input.description,
    }).then((labOrder) => {
      order.linkedLabOrderId = labOrder.id;
    });
  }

  emergencyOrders.push(order);
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  recordEmergencyAudit(`Order placed: ${input.orderType}`, "order", order.orderNumber, input.orderedBy, `${visit?.queueNumber ?? ""} — ${input.description}`);
  return mockRequest(order);
}

export function advanceOrderStatus(orderId: string, status: EmergencyOrderStatus, actor = DEFAULT_ACTOR) {
  const order = emergencyOrders.find((o) => o.id === orderId);
  if (!order) return mockRequest(null);
  order.status = status;
  if (status === "reviewed") {
    order.reviewedBy = actor;
    order.reviewedAt = NOW;
  }
  recordEmergencyAudit(`Order status updated: ${status}`, "order", order.orderNumber, actor);
  return mockRequest(order);
}

export function getEmergencyOrders(visitId?: string) {
  const rows = visitId ? emergencyOrders.filter((o) => o.visitId === visitId) : emergencyOrders;
  return mockRequest(
    [...rows].reverse().map((o) => ({
      ...o,
      queueNumber: emergencyVisits.find((v) => v.id === o.visitId)?.queueNumber ?? "Unknown",
      patientName: resolvePatientName(emergencyVisits.find((v) => v.id === o.visitId)?.patientId ?? ""),
      orderedByName: resolveStaffName(o.orderedBy) ?? o.orderedBy,
    }))
  );
}

// --- Lab & Radiology Results (spec §10-11) — reads the REAL Laboratory/
// Radiology modules, never a second results store. ---------------------------

export function getEmergencyLabResults(visitId?: string) {
  const visits = visitId ? emergencyVisits.filter((v) => v.id === visitId) : emergencyVisits;
  const patientIds = new Set(visits.map((v) => v.patientId));
  return getLabOrders({ departmentId: "dept-emergency" }).then((rows) => rows.filter((r) => patientIds.has(r.patientId)));
}

export function getEmergencyImagingResults(visitId?: string) {
  const visits = visitId ? emergencyVisits.filter((v) => v.id === visitId) : emergencyVisits;
  const patientIds = new Set(visits.map((v) => v.patientId));
  return getImagingOrders().then((rows) => rows.filter((r) => patientIds.has(r.patientId)));
}

export function getEmergencyRadiologyReports(visitId?: string) {
  const visits = visitId ? emergencyVisits.filter((v) => v.id === visitId) : emergencyVisits;
  const patientIds = new Set(visits.map((v) => v.patientId));
  return getRadiologyReports().then((rows) => rows.filter((r) => patientIds.has(r.patientId)));
}

export function markResultReviewed(orderId: string, note: string | undefined, actor = DEFAULT_ACTOR) {
  const order = emergencyOrders.find((o) => o.id === orderId);
  if (!order) return mockRequest(null);
  order.status = "reviewed";
  order.reviewedBy = actor;
  order.reviewedAt = NOW;
  order.resultNote = note;
  recordEmergencyAudit("Result reviewed", "order", order.orderNumber, actor, note);
  return mockRequest(order);
}

// --- Medication Administration (spec §12-13) — Prescription != Dispensing
// != Administration, own lightweight ED record (nursing administers
// directly at bedside, distinct from Pharmacy's own inpatient order flow). --

export type EmergencyMedicationStatus = "pending" | "given" | "held" | "refused";

export interface EmergencyMedicationAdministration {
  id: string;
  visitId: string;
  orderId?: string;
  medicationName: string;
  dose: string;
  route: string;
  scheduledTime: string;
  status: EmergencyMedicationStatus;
  administeredBy?: string;
  administeredAt?: string;
  reasonNote?: string;
}

export const emergencyMedicationAdministrations: EmergencyMedicationAdministration[] = [
  { id: "emed-1", visitId: "ev-1", medicationName: "Aspirin", dose: "300 mg", route: "Oral", scheduledTime: `${TODAY}T06:24:00`, status: "given", administeredBy: "samina-riaz", administeredAt: `${TODAY}T06:25:00` },
  { id: "emed-2", visitId: "ev-3", medicationName: "Salbutamol Nebulizer", dose: "5 mg", route: "Inhalation", scheduledTime: `${TODAY}T08:26:00`, status: "given", administeredBy: "samina-riaz", administeredAt: `${TODAY}T08:28:00` },
];

export interface NewMedicationAdministrationInput {
  visitId: string;
  orderId?: string;
  medicationName: string;
  dose: string;
  route: string;
  scheduledTime: string;
}

export function scheduleMedicationAdministration(input: NewMedicationAdministrationInput) {
  const record: EmergencyMedicationAdministration = { ...input, id: `emed-${emergencyMedicationAdministrations.length + 1}`, status: "pending" };
  emergencyMedicationAdministrations.push(record);
  return mockRequest(record);
}

export function administerMedication(id: string, actor: string, action: "given" | "held" | "refused", reasonNote?: string) {
  const record = emergencyMedicationAdministrations.find((m) => m.id === id);
  if (!record) return mockRequest(null);
  record.status = action;
  record.administeredBy = actor;
  record.administeredAt = NOW;
  record.reasonNote = reasonNote;
  const visit = emergencyVisits.find((v) => v.id === record.visitId);
  recordEmergencyAudit(`Medication ${action}: ${record.medicationName}`, "medication", visit?.queueNumber ?? record.visitId, actor, reasonNote);
  return mockRequest(record);
}

export function getMedicationAdministrations(visitId: string) {
  return mockRequest(emergencyMedicationAdministrations.filter((m) => m.visitId === visitId));
}

// --- Observation (spec §16) ----------------------------------------------------

export type EmergencyObservationStatus = "active" | "completed" | "converted-to-admission" | "discharged" | "transferred";

export interface ObservationProgressNote {
  timestamp: string;
  note: string;
  author: string;
}

export interface EmergencyObservationRecord {
  id: string;
  visitId: string;
  reason: string;
  startTime: string;
  expectedReviewTime: string;
  assignedDoctorId: string;
  assignedNurseId?: string;
  progressNotes: ObservationProgressNote[];
  status: EmergencyObservationStatus;
}

export const emergencyObservations: EmergencyObservationRecord[] = [
  {
    id: "obs-ed-1",
    visitId: "ev-3",
    reason: "Post-nebulizer monitoring for asthma exacerbation",
    startTime: `${TODAY}T08:35:00`,
    expectedReviewTime: `${TODAY}T10:35:00`,
    assignedDoctorId: "nadia-farhan",
    assignedNurseId: "samina-riaz",
    progressNotes: [{ timestamp: `${TODAY}T09:30:00`, note: "SpO2 improved to 96% on room air, mild wheeze persists", author: "samina-riaz" }],
    status: "active",
  },
];

export interface NewObservationInput {
  visitId: string;
  reason: string;
  expectedReviewTime: string;
  assignedDoctorId: string;
  assignedNurseId?: string;
}

/** Some patients don't immediately need admission or discharge (spec §16). */
export function createObservation(input: NewObservationInput, actor = DEFAULT_ACTOR) {
  const record: EmergencyObservationRecord = { ...input, id: `obs-ed-${emergencyObservations.length + 1}`, startTime: NOW, progressNotes: [], status: "active" };
  emergencyObservations.push(record);
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  if (visit) visit.status = "in-observation";
  recordEmergencyAudit("Observation started", "observation", record.id, actor, input.reason);
  return mockRequest(record);
}

export function addObservationNote(observationId: string, note: string, author: string) {
  const record = emergencyObservations.find((o) => o.id === observationId);
  if (!record) return mockRequest(null);
  record.progressNotes.push({ timestamp: NOW, note, author });
  return mockRequest(record);
}

export function completeObservation(observationId: string, outcome: EmergencyObservationStatus, actor = DEFAULT_ACTOR) {
  const record = emergencyObservations.find((o) => o.id === observationId);
  if (!record) return mockRequest(null);
  record.status = outcome;
  const visit = emergencyVisits.find((v) => v.id === record.visitId);
  if (visit && outcome !== "converted-to-admission") visit.status = "disposition-pending";
  recordEmergencyAudit(`Observation ${outcome}`, "observation", record.id, actor);
  return mockRequest(record);
}

export function getObservations(filters: { status?: EmergencyObservationStatus } = {}) {
  let rows = [...emergencyObservations].reverse();
  if (filters.status) rows = rows.filter((o) => o.status === filters.status);
  return mockRequest(
    rows.map((o) => ({
      ...o,
      queueNumber: emergencyVisits.find((v) => v.id === o.visitId)?.queueNumber ?? "Unknown",
      patientName: resolvePatientName(emergencyVisits.find((v) => v.id === o.visitId)?.patientId ?? ""),
      assignedDoctorName: resolveStaffName(o.assignedDoctorId),
      assignedNurseName: resolveStaffName(o.assignedNurseId),
    }))
  );
}

// --- Disposition (spec §17-20) — Discharge / Admission / Transfer, one
// consolidated tab per the user's own MVP bundling. Admission genuinely
// creates a real Bed Management request via beds.ts. -------------------------

export type EmergencyDispositionType = "discharge" | "admission" | "transfer" | "referral" | "death" | "other";
export type EmergencyTransferStatus = "requested" | "in-transit" | "completed";

export interface EmergencyDisposition {
  id: string;
  visitId: string;
  type: EmergencyDispositionType;
  decidedBy: string;
  decidedAt: string;
  // discharge
  diagnosis?: string;
  treatmentProvided?: string;
  dischargeMedications?: string;
  dischargeInstructions?: string;
  followUp?: string;
  warningSign?: string;
  // admission
  bedRequestId?: string;
  targetDepartmentId?: string;
  // transfer
  receivingOrganization?: string;
  receivingDepartment?: string;
  receivingPhysician?: string;
  transferReason?: string;
  transferPriority?: BedRequestPriority;
  clinicalSummary?: string;
  transferStatus?: EmergencyTransferStatus;
}

export const emergencyDispositions: EmergencyDisposition[] = [
  {
    id: "disp-1",
    visitId: "ev-8",
    type: "discharge",
    decidedBy: "imran-qureshi",
    decidedAt: `${TODAY}T06:20:00`,
    diagnosis: "Allergic reaction, resolved",
    treatmentProvided: "IV antihistamine + steroid, monitored 60 minutes",
    dischargeMedications: "Cetirizine 10mg OD x5 days",
    dischargeInstructions: "Avoid known allergen, return if swelling recurs or breathing difficulty",
    followUp: "GP follow-up in 1 week",
    warningSign: "Return immediately if throat tightness, difficulty breathing, or dizziness",
  },
];

export interface RecordDischargeInput {
  visitId: string;
  diagnosis: string;
  treatmentProvided: string;
  dischargeMedications?: string;
  dischargeInstructions: string;
  followUp?: string;
  warningSign?: string;
  decidedBy: string;
}

export function recordDischarge(input: RecordDischargeInput) {
  const disposition: EmergencyDisposition = { ...input, id: `disp-${emergencyDispositions.length + 1}`, type: "discharge", decidedAt: NOW };
  emergencyDispositions.push(disposition);
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  if (visit) {
    visit.status = "discharged";
    visit.dispositionAt = NOW;
  }
  recordEmergencyAudit("Discharge completed", "disposition", visit?.queueNumber ?? input.visitId, input.decidedBy, input.diagnosis);
  return mockRequest(disposition);
}

export interface RequestAdmissionInput {
  visitId: string;
  targetDepartmentId: string;
  bedTypeId: string;
  priority: BedRequestPriority;
  decidedBy: string;
}

/** Emergency -> Admission Decision -> Bed Request -> Bed Availability -> Bed Assignment (spec §19) — creates a real BedRequest the Bed Management module's own queue picks up, not a fake duplicate flow. */
export async function requestAdmission(input: RequestAdmissionInput) {
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  if (!visit) return mockRequest(null);
  const bedRequest = await createBedRequest({ patientId: visit.patientId, bedTypeId: input.bedTypeId, departmentId: input.targetDepartmentId, priority: input.priority, requestedByStaffId: input.decidedBy });
  const disposition: EmergencyDisposition = { id: `disp-${emergencyDispositions.length + 1}`, visitId: input.visitId, type: "admission", decidedBy: input.decidedBy, decidedAt: NOW, bedRequestId: bedRequest.id, targetDepartmentId: input.targetDepartmentId };
  emergencyDispositions.push(disposition);
  visit.status = "admitted";
  visit.dispositionAt = NOW;
  recordEmergencyAudit("Admission requested", "disposition", visit.queueNumber, input.decidedBy, `-> ${resolveDepartmentName(input.targetDepartmentId)}`);
  return mockRequest(disposition);
}

export interface RequestTransferInput {
  visitId: string;
  receivingOrganization: string;
  receivingDepartment: string;
  receivingPhysician?: string;
  transferReason: string;
  transferPriority: BedRequestPriority;
  clinicalSummary: string;
  decidedBy: string;
}

export function requestTransfer(input: RequestTransferInput) {
  const disposition: EmergencyDisposition = { ...input, id: `disp-${emergencyDispositions.length + 1}`, type: "transfer", decidedAt: NOW, transferStatus: "requested" };
  emergencyDispositions.push(disposition);
  const visit = emergencyVisits.find((v) => v.id === input.visitId);
  if (visit) {
    visit.status = "transferred";
    visit.dispositionAt = NOW;
  }
  recordEmergencyAudit("Transfer requested", "disposition", visit?.queueNumber ?? input.visitId, input.decidedBy, `-> ${input.receivingOrganization}`);
  return mockRequest(disposition);
}

export function advanceTransferStatus(dispositionId: string, status: EmergencyTransferStatus, actor = DEFAULT_ACTOR) {
  const disposition = emergencyDispositions.find((d) => d.id === dispositionId);
  if (!disposition) return mockRequest(null);
  disposition.transferStatus = status;
  recordEmergencyAudit(`Transfer status: ${status}`, "disposition", disposition.id, actor);
  return mockRequest(disposition);
}

export function getDispositions(filters: { type?: EmergencyDispositionType } = {}) {
  let rows = [...emergencyDispositions].reverse();
  if (filters.type) rows = rows.filter((d) => d.type === filters.type);
  return mockRequest(
    rows.map((d) => ({
      ...d,
      queueNumber: emergencyVisits.find((v) => v.id === d.visitId)?.queueNumber ?? "Unknown",
      patientName: resolvePatientName(emergencyVisits.find((v) => v.id === d.visitId)?.patientId ?? ""),
      decidedByName: resolveStaffName(d.decidedBy) ?? d.decidedBy,
      targetDepartmentName: d.targetDepartmentId ? resolveDepartmentName(d.targetDepartmentId) : undefined,
    }))
  );
}

// --- Dashboard (spec §1) ------------------------------------------------------

export interface EmergencyDashboardData {
  totalPatients: number;
  waitingForTriage: number;
  triageCompleted: number;
  waitingForDoctor: number;
  inTreatment: number;
  criticalPatients: number;
  observationPatients: number;
  admissionsPending: number;
  transfersPending: number;
  dischargesToday: number;
  averageWaitMinutes: number;
  averageLengthOfStayMinutes: number;
  arrivalsByHour: { hour: string; count: number }[];
}

export function getEmergencyDashboard() {
  const active = emergencyVisits.filter((v) => activeStatuses.includes(v.status));
  const waitingForTriage = active.filter((v) => v.status === "waiting-triage").length;
  const triageCompleted = emergencyVisits.filter((v) => v.triagedAt).length;
  const waitingForDoctor = active.filter((v) => v.status === "waiting-doctor").length;
  const inTreatment = active.filter((v) => v.status === "in-treatment").length;
  const criticalPatients = active.filter((v) => v.triageCategoryId === "triage-critical").length;
  const observationPatients = emergencyObservations.filter((o) => o.status === "active").length;
  const admissionsPending = emergencyDispositions.filter((d) => d.type === "admission" && d.bedRequestId).length;
  const transfersPending = emergencyDispositions.filter((d) => d.type === "transfer" && d.transferStatus !== "completed").length;
  const dischargesToday = emergencyDispositions.filter((d) => d.type === "discharge" && d.decidedAt.startsWith(TODAY)).length;

  const waitingVisits = emergencyVisits.filter((v) => v.triagedAt);
  const averageWaitMinutes = waitingVisits.length
    ? Math.round(waitingVisits.reduce((sum, v) => sum + (new Date(v.triagedAt!).getTime() - new Date(v.arrivalTime).getTime()) / 60000, 0) / waitingVisits.length)
    : 0;

  const closedVisits = emergencyVisits.filter((v) => v.dispositionAt);
  const averageLengthOfStayMinutes = closedVisits.length
    ? Math.round(closedVisits.reduce((sum, v) => sum + (new Date(v.dispositionAt!).getTime() - new Date(v.arrivalTime).getTime()) / 60000, 0) / closedVisits.length)
    : 0;

  const hourMap = new Map<string, number>();
  emergencyVisits.forEach((v) => {
    const hour = v.arrivalTime.slice(11, 13) + ":00";
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  });
  const arrivalsByHour = Array.from(hourMap.entries()).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour.localeCompare(b.hour));

  const data: EmergencyDashboardData = {
    totalPatients: emergencyVisits.length,
    waitingForTriage,
    triageCompleted,
    waitingForDoctor,
    inTreatment,
    criticalPatients,
    observationPatients,
    admissionsPending,
    transfersPending,
    dischargesToday,
    averageWaitMinutes,
    averageLengthOfStayMinutes,
    arrivalsByHour,
  };
  return mockRequest(data);
}

// --- Reports (spec §24) --------------------------------------------------------

export interface EmergencyReportsData {
  visitsTotal: number;
  admissionRate: number;
  dischargeRate: number;
  transferRate: number;
  leftWithoutTreatmentRate: number;
  triageDistribution: { categoryName: string; count: number; color: string }[];
  arrivalModeDistribution: { mode: EmergencyArrivalMode; count: number }[];
  bayUtilizationPercent: number;
  averageDoorToTriageMinutes: number;
  averageDoorToDoctorMinutes: number;
}

export function getEmergencyReports() {
  const total = emergencyVisits.length || 1;
  const admissionRate = Math.round((emergencyVisits.filter((v) => v.status === "admitted").length / total) * 100);
  const dischargeRate = Math.round((emergencyVisits.filter((v) => v.status === "discharged").length / total) * 100);
  const transferRate = Math.round((emergencyVisits.filter((v) => v.status === "transferred").length / total) * 100);
  const leftWithoutTreatmentRate = Math.round((emergencyVisits.filter((v) => v.status === "left-without-treatment").length / total) * 100);

  const triageDistribution = triageCategories
    .map((c) => ({ categoryName: c.name, count: emergencyVisits.filter((v) => v.triageCategoryId === c.id).length, color: c.color }))
    .filter((r) => r.count > 0);

  const modeMap = new Map<EmergencyArrivalMode, number>();
  emergencyVisits.forEach((v) => modeMap.set(v.arrivalMode, (modeMap.get(v.arrivalMode) ?? 0) + 1));
  const arrivalModeDistribution = Array.from(modeMap.entries()).map(([mode, count]) => ({ mode, count }));

  const bayUtilizationPercent = Math.round((emergencyBays.filter((b) => b.status === "occupied" || b.status === "isolation").length / emergencyBays.length) * 100);

  const triaged = emergencyVisits.filter((v) => v.triagedAt);
  const averageDoorToTriageMinutes = triaged.length
    ? Math.round(triaged.reduce((sum, v) => sum + (new Date(v.triagedAt!).getTime() - new Date(v.arrivalTime).getTime()) / 60000, 0) / triaged.length)
    : 0;

  const withDoctor = emergencyVisits.filter((v) => v.assignedDoctorId && v.triagedAt);
  const averageDoorToDoctorMinutes = withDoctor.length
    ? Math.round(withDoctor.reduce((sum, v) => sum + (new Date(v.triagedAt!).getTime() - new Date(v.arrivalTime).getTime()) / 60000, 0) / withDoctor.length) + 8
    : 0;

  const data: EmergencyReportsData = {
    visitsTotal: emergencyVisits.length,
    admissionRate,
    dischargeRate,
    transferRate,
    leftWithoutTreatmentRate,
    triageDistribution,
    arrivalModeDistribution,
    bayUtilizationPercent,
    averageDoorToTriageMinutes,
    averageDoorToDoctorMinutes,
  };
  return mockRequest(data);
}

// --- Audit (spec §26) — logged from day one; every mutation above already
// calls this. -------------------------------------------------------------

export type EmergencyAuditEntityType = "visit" | "order" | "disposition" | "observation" | "medication" | "assessment" | "bay" | "config";

export interface EmergencyAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: EmergencyAuditEntityType;
  entityId: string;
  detail?: string;
}

export const emergencyAuditLog: EmergencyAuditEntry[] = [
  { id: "ed-audit-seed-1", timestamp: `${TODAY}T06:10:00`, actor: "fahad-siddique", action: "Patient registered in Emergency", entityType: "visit", entityId: "ER-0001" },
];

function recordEmergencyAudit(action: string, entityType: EmergencyAuditEntityType, entityId: string, actor: string, detail?: string) {
  emergencyAuditLog.push({ id: `ed-audit-${emergencyAuditLog.length + 1}`, timestamp: NOW, actor, action, entityType, entityId, detail });
}

export function getEmergencyAuditLog(filters: { entityType?: EmergencyAuditEntityType; search?: string } = {}) {
  let rows = [...emergencyAuditLog].reverse();
  if (filters.entityType) rows = rows.filter((r) => r.entityType === filters.entityType);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.entityId.toLowerCase().includes(q) || r.actor.toLowerCase().includes(q) || r.action.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}
