import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { staffMembers } from "./staff";
import { patientSeeds } from "./patients";

// ============================================================================
// OT / Surgery (Hospital Admin's [oversight] section — HOSPITAL_ADMIN_MODULE_MAP.md,
// full detail per OT_MODULE_SPEC.md). Phase 1 (Core UI): OT Dashboard, Surgery
// Schedule, Surgical Cases, Surgery Case Details, Surgery Request, OT Rooms.
// Phase 2 (Clinical workflow) now added: Pre-Op (worklist/checklist/consent),
// Anesthesia (assessment capture), Intra-Op (safety checklist + time
// tracking + procedure documentation), Post-Op/Recovery (PACU + post-op
// note). [oversight]: every clinical field below is *structured, short-form
// administrative capture* (status flags, coded values, short summary text)
// — never a rich freeform clinical-narrative editor. See the spec file's
// scope note. Phase 3 (Surgical Team/Instruments/Consumables/Implants/
// Specimens/Equipment) and Phase 4 (Emergency OT/Cancellations/Delays/
// Reports/Settings/Audit UI) not started yet.
//
// FHIR alignment (spec §38): ServiceRequest→SurgeryRequest, Procedure→
// SurgicalCase (+ this phase's procedureDocumentation sub-object),
// Practitioner/PractitionerRole→surgical team, Consent→consentStatus/
// consentDetail, Device→Implant, Specimen→Specimen (Phase 3), AuditEvent→
// the audit log below.
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

// --- OT Rooms (spec §5, §28) ----------------------------------------------

export type OTRoomStatus =
  | "available"
  | "reserved"
  | "preparation"
  | "patient-inside"
  | "in-surgery"
  | "recovery"
  | "cleaning"
  | "maintenance"
  | "blocked"
  | "emergency-reserved";

export interface OTRoom {
  id: string;
  number: string;
  type: string;
  departmentId: string;
  location: string;
  status: OTRoomStatus;
  equipment: string[];
  maintenanceSchedule?: string;
}

export const otRooms: OTRoom[] = [
  { id: "ot-room-1", number: "OT-01", type: "General Surgery", departmentId: "dept-ot", location: "3rd Floor, East Wing", status: "in-surgery", equipment: ["Laparoscopy Tower", "Electrocautery", "Anesthesia Workstation"], maintenanceSchedule: "2026-09-15" },
  { id: "ot-room-2", number: "OT-02", type: "Orthopedic", departmentId: "dept-ot", location: "3rd Floor, East Wing", status: "available", equipment: ["C-Arm Fluoroscopy", "Orthopedic Drill Set", "Anesthesia Workstation"], maintenanceSchedule: "2026-09-20" },
  { id: "ot-room-3", number: "OT-03", type: "Cardiac", departmentId: "dept-ot", location: "3rd Floor, West Wing", status: "cleaning", equipment: ["Heart-Lung Machine", "Cardiac Monitor", "Anesthesia Workstation"], maintenanceSchedule: "2026-08-25" },
  { id: "ot-room-4", number: "OT-04", type: "Emergency", departmentId: "dept-ot", location: "3rd Floor, West Wing", status: "reserved", equipment: ["Rapid Infuser", "Portable X-Ray", "Anesthesia Workstation"], maintenanceSchedule: "2026-10-01" },
  { id: "ot-room-5", number: "OT-05", type: "General Surgery", departmentId: "dept-ot", location: "3rd Floor, East Wing", status: "maintenance", equipment: ["Laparoscopy Tower", "Electrocautery"], maintenanceSchedule: "2026-08-16" },
];

export function getOTRooms() {
  return mockRequest(otRooms);
}

export interface OTRoomRow extends OTRoom {
  departmentName: string;
  currentCase?: { id: string; caseNumber: string; patientName: string; procedureName: string; surgeonName?: string; scheduledDateTime?: string };
}

function toOTRoomRow(r: OTRoom): OTRoomRow {
  const department = departmentConfigs.find((d) => d.id === r.departmentId);
  const activeCase = surgicalCases.find((c) => c.roomId === r.id && ["patient-transferred", "anesthesia-started", "surgery-started"].includes(c.status));
  return {
    ...r,
    departmentName: department?.name ?? "Unassigned",
    currentCase: activeCase
      ? { id: activeCase.id, caseNumber: activeCase.caseNumber, patientName: resolvePatientName(activeCase.patientId), procedureName: resolveProcedureName(activeCase.procedureCode), surgeonName: resolveStaffName(activeCase.primarySurgeonId), scheduledDateTime: activeCase.scheduledDateTime }
      : undefined,
  };
}

export function getOTRoomsList() {
  return mockRequest(otRooms.map(toOTRoomRow));
}

export interface NewOTRoomInput {
  number: string;
  type: string;
  location: string;
  equipment: string[];
  maintenanceSchedule?: string;
}

/** OT Rooms are hospital-configurable, never hardcoded (spec §28) — same lookup-table CRUD pattern as Radiology Rooms/Modalities. */
export function createOTRoom(input: NewOTRoomInput) {
  const room: OTRoom = { ...input, id: `ot-room-${otRooms.length + 1}`, departmentId: "dept-ot", status: "available" };
  otRooms.push(room);
  recordOTAudit("Room created", "room", room.number, DEFAULT_ACTOR);
  return mockRequest(toOTRoomRow(room));
}

export function updateOTRoom(id: string, updates: Partial<NewOTRoomInput>) {
  const room = otRooms.find((r) => r.id === id);
  if (!room) throw new Error("Room not found");
  Object.assign(room, updates);
  recordOTAudit("Room updated", "room", room.number, DEFAULT_ACTOR);
  return mockRequest(toOTRoomRow(room));
}

export function setOTRoomStatus(id: string, status: OTRoomStatus) {
  const room = otRooms.find((r) => r.id === id);
  if (!room) throw new Error("Room not found");
  room.status = status;
  recordOTAudit(`Room status changed to ${status}`, "room", room.number, DEFAULT_ACTOR);
  return mockRequest(toOTRoomRow(room));
}

// --- Surgical Procedure catalog (spec §9) ----------------------------------

export interface SurgicalProcedure {
  code: string;
  name: string;
  category: string;
  estimatedDurationMinutes: number;
  active: boolean;
}

export const surgicalProcedures: SurgicalProcedure[] = [
  { code: "SX-APPEND", name: "Laparoscopic Appendectomy", category: "General Surgery", estimatedDurationMinutes: 60, active: true },
  { code: "SX-CSECTION", name: "Cesarean Section", category: "Obstetrics", estimatedDurationMinutes: 45, active: true },
  { code: "SX-HERNIA", name: "Hernia Repair", category: "General Surgery", estimatedDurationMinutes: 75, active: true },
  { code: "SX-CHOLE", name: "Laparoscopic Cholecystectomy", category: "General Surgery", estimatedDurationMinutes: 90, active: true },
  { code: "SX-TKR", name: "Total Knee Replacement", category: "Orthopedic", estimatedDurationMinutes: 150, active: true },
  { code: "SX-CATARACT", name: "Cataract Surgery", category: "Ophthalmic", estimatedDurationMinutes: 30, active: true },
  { code: "SX-TONSIL", name: "Tonsillectomy", category: "ENT", estimatedDurationMinutes: 45, active: true },
  { code: "SX-CABG", name: "Coronary Artery Bypass Graft", category: "Cardiac", estimatedDurationMinutes: 240, active: true },
  { code: "SX-THYROID", name: "Thyroidectomy", category: "General Surgery", estimatedDurationMinutes: 100, active: true },
];

function resolveProcedureName(code: string): string {
  return surgicalProcedures.find((p) => p.code === code)?.name ?? code;
}

export interface NewSurgicalProcedureInput {
  code: string;
  name: string;
  category: string;
  estimatedDurationMinutes: number;
}

export function createSurgicalProcedure(input: NewSurgicalProcedureInput) {
  const procedure: SurgicalProcedure = { ...input, active: true };
  surgicalProcedures.push(procedure);
  recordOTAudit("Procedure created", "procedure", procedure.code, DEFAULT_ACTOR);
  return mockRequest(procedure);
}

export function updateSurgicalProcedure(code: string, updates: Partial<NewSurgicalProcedureInput>) {
  const procedure = surgicalProcedures.find((p) => p.code === code);
  if (!procedure) throw new Error("Procedure not found");
  Object.assign(procedure, updates);
  recordOTAudit("Procedure updated", "procedure", procedure.code, DEFAULT_ACTOR);
  return mockRequest(procedure);
}

export function setSurgicalProcedureActive(code: string, active: boolean) {
  const procedure = surgicalProcedures.find((p) => p.code === code);
  if (!procedure) throw new Error("Procedure not found");
  procedure.active = active;
  recordOTAudit(active ? "Procedure activated" : "Procedure deactivated", "procedure", procedure.code, DEFAULT_ACTOR);
  return mockRequest(procedure);
}

export function getSurgicalProcedures(filters: { includeInactive?: boolean } = {}) {
  return mockRequest(filters.includeInactive ? surgicalProcedures : surgicalProcedures.filter((p) => p.active));
}

// --- Surgical Cases (spec §7-11) --------------------------------------------

export type SurgeryPriority = "emergency" | "urgent" | "semi-urgent" | "elective";

// Ordered lifecycle (spec §8) — used both to render a case's status and to
// compute which stages are "done" for a timeline view, without fabricating
// per-stage timestamps for stages Phase 2's clinical workflow screens haven't
// been built to actually capture yet.
export const surgicalCaseLifecycle = [
  "requested",
  "approved",
  "scheduled",
  "pre-op-pending",
  "pre-op-cleared",
  "ready-for-ot",
  "patient-transferred",
  "anesthesia-started",
  "surgery-started",
  "surgery-completed",
  "recovery",
  "transferred",
  "completed",
] as const;

export type SurgicalCaseLifecycleStatus = (typeof surgicalCaseLifecycle)[number];
export type SurgicalCaseStatus = SurgicalCaseLifecycleStatus | "cancelled" | "postponed" | "no-show" | "aborted";

export type Laterality = "left" | "right" | "bilateral" | "not-applicable";

// --- Pre-Op / Consent / Anesthesia / Safety Checklist types (spec §12-16) --

export type ConsentStatus = "required" | "obtained" | "verified" | "withdrawn";

export interface ConsentDetail {
  status: ConsentStatus;
  type?: string;
  obtainedAt?: string;
  obtainedBy?: string;
  witness?: string;
  providerId?: string;
  documentRef?: string;
  version?: string;
}

export type ASAClass = "I" | "II" | "III" | "IV" | "V" | "VI";

export interface AnesthesiaAssessment {
  airwayAssessment?: string;
  relevantHistory?: string;
  allergies?: string;
  asaClass?: ASAClass;
  plan?: string;
  intraopMonitoring?: string;
  postAnesthesiaAssessment?: string;
  completedAt?: string;
  completedBy?: string;
}

export type SafetyChecklistStage = "before-anesthesia" | "before-incision" | "before-patient-leaves-ot";

// --- Procedure Documentation / PACU / Post-Op Note types (spec §19, 24-26) -

export interface ProcedureDocumentation {
  performedProcedure?: string;
  findings?: string;
  technique?: string;
  complications?: string;
  estimatedBloodLoss?: string;
  specimensCollected?: boolean;
  specimenNote?: string;
  implantsUsed?: boolean;
  implantNote?: string;
  devices?: string;
  drains?: string;
  closure?: string;
  postOpDiagnosis?: string;
  postOpInstructions?: string;
  documentedAt?: string;
  documentedBy?: string;
}

export type PacuStatus = "waiting" | "arrived" | "recovery" | "ready-for-transfer" | "transferred";
export type PacuDestination = "ward" | "icu" | "hdu" | "emergency" | "other";

export interface PostOpNote {
  patientCondition?: string;
  painAssessment?: string;
  recoveryAssessment?: string;
  postOpOrders?: string;
  followUpPlan?: string;
  recordedAt?: string;
  recordedBy?: string;
}

export interface SurgicalCase {
  id: string;
  caseNumber: string;
  patientId: string;
  encounterId?: string;
  departmentId: string;
  procedureCode: string;
  plannedProcedure: string;
  surgicalSite?: string;
  laterality?: Laterality;
  clinicalIndication: string;
  diagnosis?: string;
  priority: SurgeryPriority;
  primarySurgeonId: string;
  assistantSurgeonId?: string;
  anesthesiologistId?: string;
  scrubNurseId?: string;
  circulatingNurseId?: string;
  technicianId?: string;
  estimatedDurationMinutes: number;
  requiredOtType?: string;
  requiredEquipment?: string;
  requiredAnesthesia?: string;
  bloodRequirement?: string;
  implantRequirement?: boolean;
  specialEquipment?: string;
  isolationRequirement?: boolean;
  icuBedRequirement?: boolean;
  pacuRequirement?: boolean;
  specialInstructions?: string;
  status: SurgicalCaseStatus;
  scheduledDateTime?: string;
  roomId?: string;
  requestedAt: string;
  approvedAt?: string;
  cancelledReason?: string;
  postponedReason?: string;
  delayReason?: string;
  delayMinutes?: number;
  // Intra-op timestamps (spec §18)
  roomEntryAt?: string;
  anesthesiaStartAt?: string;
  procedureStartAt?: string;
  procedureEndAt?: string;
  anesthesiaEndAt?: string;
  roomExitAt?: string;
  // Pre-Op / Consent / Anesthesia / Safety Checklist (spec §12-16)
  preOpChecklistCompleted?: string[];
  consent?: ConsentDetail;
  anesthesiaAssessment?: AnesthesiaAssessment;
  safetyChecklistCompleted?: Partial<Record<SafetyChecklistStage, string[]>>;
  // Procedure Documentation / PACU / Post-Op Note (spec §19, 24-26)
  procedureDocumentation?: ProcedureDocumentation;
  pacuStatus?: PacuStatus;
  pacuArrivalAt?: string;
  pacuDestination?: PacuDestination;
  postOpNote?: PostOpNote;
  lastActionBy?: string;
  lastActionAt?: string;
}

// --- Checklist templates (spec §13, §16) — hospital-configurable, never
// hardcoded into the checklist UI itself; the Pre-Op/Intra-Op screens only
// render+tick whatever's active here. Template *editing* UI is deferred to
// OT Settings (Phase 4), same as how Radiology's config catalogs got their
// CRUD before their own Settings overview screen existed. ---

export interface ChecklistItem {
  id: string;
  label: string;
  active: boolean;
}

export const preOpChecklistTemplate: ChecklistItem[] = [
  { id: "identity", label: "Patient identity verified", active: true },
  { id: "procedure-confirmed", label: "Procedure confirmed", active: true },
  { id: "site-confirmed", label: "Surgical site confirmed", active: true },
  { id: "consent-verified", label: "Consent verified", active: true },
  { id: "allergies-checked", label: "Allergies checked", active: true },
  { id: "medication-reviewed", label: "Medication reviewed", active: true },
  { id: "npo-verified", label: "NPO status verified", active: true },
  { id: "investigations-completed", label: "Required investigations completed", active: true },
  { id: "blood-confirmed", label: "Blood availability confirmed", active: true },
  { id: "anesthesia-assessment", label: "Anesthesia assessment completed", active: true },
  { id: "surgical-clearance", label: "Surgical clearance completed", active: true },
  { id: "equipment-available", label: "Required equipment available", active: true },
  { id: "implant-available", label: "Implant available", active: true },
  { id: "patient-prepared", label: "Patient prepared", active: true },
];

export function getPreOpChecklistTemplate() {
  return mockRequest(preOpChecklistTemplate.filter((i) => i.active));
}

export const safetyChecklistTemplate: Record<SafetyChecklistStage, ChecklistItem[]> = {
  "before-anesthesia": [
    { id: "ba-identity", label: "Patient identity", active: true },
    { id: "ba-procedure", label: "Procedure", active: true },
    { id: "ba-site", label: "Site", active: true },
    { id: "ba-consent", label: "Consent", active: true },
    { id: "ba-allergy", label: "Allergy", active: true },
    { id: "ba-equipment", label: "Equipment", active: true },
  ],
  "before-incision": [
    { id: "bi-team", label: "Team introduction", active: true },
    { id: "bi-identity", label: "Patient identity confirmed", active: true },
    { id: "bi-procedure", label: "Procedure confirmed", active: true },
    { id: "bi-site", label: "Site confirmed", active: true },
    { id: "bi-antibiotic", label: "Antibiotic check", active: true },
    { id: "bi-imaging", label: "Imaging available", active: true },
    { id: "bi-critical-events", label: "Anticipated critical events", active: true },
  ],
  "before-patient-leaves-ot": [
    { id: "bp-procedure-recorded", label: "Procedure recorded", active: true },
    { id: "bp-instrument-count", label: "Instrument count", active: true },
    { id: "bp-sponge-count", label: "Sponge count", active: true },
    { id: "bp-needle-count", label: "Needle count", active: true },
    { id: "bp-specimens-labeled", label: "Specimens labeled", active: true },
    { id: "bp-equipment-issues", label: "Equipment issues recorded", active: true },
    { id: "bp-recovery-plan", label: "Recovery plan", active: true },
  ],
};

export function getSafetyChecklistTemplate() {
  return mockRequest(safetyChecklistTemplate);
}

export const surgicalCases: SurgicalCase[] = [
  { id: "ot-case-1", caseNumber: "OT-2026-000141", patientId: "p-ibrar-ahmad", departmentId: "dept-ot", procedureCode: "SX-APPEND", plannedProcedure: "Laparoscopic Appendectomy", surgicalSite: "Abdomen", laterality: "not-applicable", clinicalIndication: "Acute appendicitis", diagnosis: "K35.80", priority: "urgent", primarySurgeonId: "ahmed-hassan", assistantSurgeonId: "robert-vance", anesthesiologistId: "sara-malik", scrubNurseId: "hina-tariq", circulatingNurseId: "nadia-yousaf", technicianId: "bilal-nadeem", estimatedDurationMinutes: 60, requiredAnesthesia: "General", status: "surgery-started", scheduledDateTime: `${TODAY}T10:30:00`, roomId: "ot-room-1", requestedAt: `${TODAY}T07:00:00`, approvedAt: `${TODAY}T07:20:00`, roomEntryAt: `${TODAY}T10:05:00`, anesthesiaStartAt: `${TODAY}T10:15:00`, procedureStartAt: `${TODAY}T10:30:00`,
    preOpChecklistCompleted: preOpChecklistTemplate.map((i) => i.id),
    consent: { status: "verified", type: "Surgical consent — general anesthesia", obtainedAt: `${TODAY}T07:10:00`, obtainedBy: "Ibrar Ahmad", witness: "Nadia Yousaf", providerId: "ahmed-hassan", documentRef: "CONSENT-2026-0141", version: "1" },
    anesthesiaAssessment: { airwayAssessment: "Mallampati I, no difficult airway predicted", relevantHistory: "No prior anesthesia complications", allergies: "NKDA", asaClass: "II", plan: "General anesthesia, standard induction", completedAt: `${TODAY}T09:00:00`, completedBy: "sara-malik" },
    safetyChecklistCompleted: { "before-anesthesia": safetyChecklistTemplate["before-anesthesia"].map((i) => i.id), "before-incision": safetyChecklistTemplate["before-incision"].map((i) => i.id) },
  },
  { id: "ot-case-2", caseNumber: "OT-2026-000142", patientId: "p-fatima-sheikh", departmentId: "dept-ot", procedureCode: "SX-CSECTION", plannedProcedure: "Cesarean Section", surgicalSite: "Abdomen", laterality: "not-applicable", clinicalIndication: "Failure to progress", diagnosis: "O63.9", priority: "urgent", primarySurgeonId: "ahmed-hassan", anesthesiologistId: "sara-malik", scrubNurseId: "hina-tariq", estimatedDurationMinutes: 45, requiredAnesthesia: "Spinal", status: "completed", scheduledDateTime: `${TODAY}T08:00:00`, roomId: "ot-room-2", requestedAt: `${TODAY}T06:30:00`, approvedAt: `${TODAY}T06:40:00`, roomEntryAt: `${TODAY}T07:55:00`, anesthesiaStartAt: `${TODAY}T08:05:00`, procedureStartAt: `${TODAY}T08:15:00`, procedureEndAt: `${TODAY}T09:00:00`, anesthesiaEndAt: `${TODAY}T09:10:00`, roomExitAt: `${TODAY}T09:15:00`,
    preOpChecklistCompleted: preOpChecklistTemplate.map((i) => i.id),
    consent: { status: "verified", type: "Surgical consent — spinal anesthesia", obtainedAt: `${TODAY}T06:35:00`, obtainedBy: "Fatima Sheikh", witness: "Hina Tariq", providerId: "ahmed-hassan", documentRef: "CONSENT-2026-0142", version: "1" },
    anesthesiaAssessment: { airwayAssessment: "Not applicable — spinal", relevantHistory: "Gravida 2, no complications", allergies: "NKDA", asaClass: "II", plan: "Spinal anesthesia", postAnesthesiaAssessment: "Stable, no complications, sensation returning as expected", completedAt: `${TODAY}T07:00:00`, completedBy: "sara-malik" },
    safetyChecklistCompleted: {
      "before-anesthesia": safetyChecklistTemplate["before-anesthesia"].map((i) => i.id),
      "before-incision": safetyChecklistTemplate["before-incision"].map((i) => i.id),
      "before-patient-leaves-ot": safetyChecklistTemplate["before-patient-leaves-ot"].map((i) => i.id),
    },
    procedureDocumentation: {
      performedProcedure: "Cesarean Section (Pfannenstiel incision)",
      findings: "Live male infant delivered, Apgar 9/9",
      technique: "Low transverse uterine incision",
      complications: "None",
      estimatedBloodLoss: "400 mL",
      specimensCollected: false,
      implantsUsed: false,
      drains: "None",
      closure: "Layered closure, subcuticular skin closure",
      postOpDiagnosis: "Post-partum, status post Cesarean section",
      postOpInstructions: "Routine post-Cesarean recovery protocol",
      documentedAt: `${TODAY}T09:05:00`,
      documentedBy: "ahmed-hassan",
    },
    pacuStatus: "transferred",
    pacuArrivalAt: `${TODAY}T09:20:00`,
    pacuDestination: "ward",
    postOpNote: {
      patientCondition: "Stable, vitals within normal limits",
      painAssessment: "3/10, managed with scheduled analgesia",
      recoveryAssessment: "Alert, appropriate for transfer",
      postOpOrders: "Routine post-partum monitoring, ambulate day 1",
      followUpPlan: "OB follow-up in 6 weeks",
      recordedAt: `${TODAY}T10:00:00`,
      recordedBy: "hina-tariq",
    },
  },
  { id: "ot-case-3", caseNumber: "OT-2026-000143", patientId: "p-ahsan-tariq", departmentId: "dept-ot", procedureCode: "SX-HERNIA", plannedProcedure: "Hernia Repair", surgicalSite: "Groin", laterality: "right", clinicalIndication: "Symptomatic inguinal hernia", priority: "elective", primarySurgeonId: "ahmed-hassan", anesthesiologistId: "sara-malik", estimatedDurationMinutes: 75, requiredAnesthesia: "General", status: "scheduled", scheduledDateTime: `${TODAY}T12:30:00`, roomId: "ot-room-3", requestedAt: "2026-08-10T09:00:00", approvedAt: "2026-08-10T14:00:00" },
  { id: "ot-case-4", caseNumber: "OT-2026-000144", patientId: "p-zara-malik", departmentId: "dept-ot", procedureCode: "SX-CHOLE", plannedProcedure: "Laparoscopic Cholecystectomy", surgicalSite: "Abdomen", laterality: "not-applicable", clinicalIndication: "Symptomatic cholelithiasis", priority: "elective", primarySurgeonId: "robert-vance", anesthesiologistId: "sara-malik", estimatedDurationMinutes: 90, requiredAnesthesia: "General", status: "pre-op-pending", scheduledDateTime: `${TODAY}T15:00:00`, roomId: "ot-room-2", requestedAt: "2026-08-11T10:00:00", approvedAt: "2026-08-11T15:00:00",
    preOpChecklistCompleted: ["identity", "procedure-confirmed", "site-confirmed", "allergies-checked", "medication-reviewed"],
    consent: { status: "obtained", type: "Surgical consent — general anesthesia", obtainedAt: "2026-08-15T10:00:00", obtainedBy: "Zara Malik", witness: "Hina Tariq", providerId: "robert-vance", documentRef: "CONSENT-2026-0144", version: "1" },
  },
  { id: "ot-case-5", caseNumber: "OT-2026-000145", patientId: "p-bilal-hussain", departmentId: "dept-ot", procedureCode: "SX-TKR", plannedProcedure: "Total Knee Replacement", surgicalSite: "Knee", laterality: "left", clinicalIndication: "Severe osteoarthritis", priority: "elective", primarySurgeonId: "ahmed-hassan", estimatedDurationMinutes: 150, requiredAnesthesia: "Spinal", implantRequirement: true, status: "approved", requestedAt: "2026-08-12T09:00:00", approvedAt: "2026-08-12T16:00:00" },
  { id: "ot-case-6", caseNumber: "OT-2026-000146", patientId: "p-ayesha-raza", departmentId: "dept-ot", procedureCode: "SX-CATARACT", plannedProcedure: "Cataract Surgery", surgicalSite: "Eye", laterality: "left", clinicalIndication: "Age-related cataract", priority: "elective", primarySurgeonId: "robert-vance", estimatedDurationMinutes: 30, requiredAnesthesia: "Local", status: "requested", requestedAt: `${TODAY}T09:00:00` },
  { id: "ot-case-7", caseNumber: "OT-2026-000147", patientId: "p-kamal-siddiqui", departmentId: "dept-ot", procedureCode: "SX-TONSIL", plannedProcedure: "Tonsillectomy", surgicalSite: "Throat", laterality: "not-applicable", clinicalIndication: "Recurrent tonsillitis", priority: "elective", primarySurgeonId: "ahmed-hassan", anesthesiologistId: "sara-malik", estimatedDurationMinutes: 45, requiredAnesthesia: "General", status: "cancelled", requestedAt: "2026-08-09T09:00:00", approvedAt: "2026-08-09T14:00:00", scheduledDateTime: "2026-08-13T10:00:00", roomId: "ot-room-4", cancelledReason: "Patient unavailable" },
  { id: "ot-case-8", caseNumber: "OT-2026-000148", patientId: "p-hamza-butt", departmentId: "dept-ot", procedureCode: "SX-CABG", plannedProcedure: "Coronary Artery Bypass Graft", surgicalSite: "Chest", laterality: "not-applicable", clinicalIndication: "Triple-vessel coronary artery disease", priority: "urgent", primarySurgeonId: "robert-vance", anesthesiologistId: "sara-malik", estimatedDurationMinutes: 240, requiredAnesthesia: "General", icuBedRequirement: true, status: "postponed", requestedAt: "2026-08-11T08:00:00", approvedAt: "2026-08-11T12:00:00", scheduledDateTime: "2026-08-14T07:00:00", roomId: "ot-room-3", postponedReason: "Awaiting cardiology clearance" },
  { id: "ot-case-9", caseNumber: "OT-2026-000149", patientId: "p-saira-cheema", departmentId: "dept-ot", procedureCode: "SX-APPEND", plannedProcedure: "Laparoscopic Appendectomy", surgicalSite: "Abdomen", laterality: "not-applicable", clinicalIndication: "Suspected acute appendicitis", priority: "emergency", primarySurgeonId: "robert-vance", anesthesiologistId: "sara-malik", estimatedDurationMinutes: 60, requiredAnesthesia: "General", status: "ready-for-ot", scheduledDateTime: `${TODAY}T16:00:00`, roomId: "ot-room-4", requestedAt: `${TODAY}T13:00:00`, approvedAt: `${TODAY}T13:10:00`,
    preOpChecklistCompleted: preOpChecklistTemplate.map((i) => i.id),
    consent: { status: "verified", type: "Emergency surgical consent — general anesthesia", obtainedAt: `${TODAY}T13:20:00`, obtainedBy: "Saira Cheema", witness: "Nadia Yousaf", providerId: "robert-vance", documentRef: "CONSENT-2026-0149", version: "1" },
    anesthesiaAssessment: { airwayAssessment: "Mallampati II", relevantHistory: "No significant history", allergies: "Penicillin", asaClass: "II", plan: "General anesthesia, rapid sequence induction (emergency)", completedAt: `${TODAY}T13:40:00`, completedBy: "sara-malik" },
  },
];

function resolvePatientName(patientId: string): string {
  return patientSeeds.find((p) => p.id === patientId)?.fullName ?? "Unknown Patient";
}

function resolveStaffName(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  return staffMembers.find((s) => s.id === staffId)?.name;
}

export interface SurgicalCaseRow {
  id: string;
  caseNumber: string;
  patientId: string;
  patientName: string;
  procedureCode: string;
  procedureName: string;
  surgeonName: string;
  priority: SurgeryPriority;
  status: SurgicalCaseStatus;
  scheduledDateTime?: string;
  roomNumber?: string;
  anesthesiaType?: string;
  departmentId: string;
  preOpReady: boolean;
}

/** Pre-Op Worklist's READY FOR OT vs NOT READY (spec §12) — computed from the checklist/consent/anesthesia assessment actually captured, never a manual flag that can drift from the real data. */
function isPreOpReady(c: SurgicalCase): boolean {
  const requiredItems = preOpChecklistTemplate.filter((i) => i.active).map((i) => i.id);
  const completed = new Set(c.preOpChecklistCompleted ?? []);
  const checklistDone = requiredItems.every((id) => completed.has(id));
  return checklistDone && c.consent?.status === "verified" && Boolean(c.anesthesiaAssessment?.completedAt);
}

function toSurgicalCaseRow(c: SurgicalCase): SurgicalCaseRow {
  const room = c.roomId ? otRooms.find((r) => r.id === c.roomId) : undefined;
  return {
    id: c.id,
    caseNumber: c.caseNumber,
    patientId: c.patientId,
    patientName: resolvePatientName(c.patientId),
    procedureCode: c.procedureCode,
    procedureName: resolveProcedureName(c.procedureCode),
    surgeonName: resolveStaffName(c.primarySurgeonId) ?? "Unassigned",
    priority: c.priority,
    status: c.status,
    scheduledDateTime: c.scheduledDateTime,
    roomNumber: room?.number,
    anesthesiaType: c.requiredAnesthesia,
    departmentId: c.departmentId,
    preOpReady: isPreOpReady(c),
  };
}

export function getSurgicalCases(filters: { status?: SurgicalCaseStatus; priority?: SurgeryPriority; search?: string } = {}) {
  let rows = surgicalCases.map(toSurgicalCaseRow);
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.priority) rows = rows.filter((r) => r.priority === filters.priority);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.caseNumber.toLowerCase().includes(q) || r.patientName.toLowerCase().includes(q) || r.procedureName.toLowerCase().includes(q));
  }
  return mockRequest(rows.sort((a, b) => (a.scheduledDateTime ?? "9999").localeCompare(b.scheduledDateTime ?? "9999")));
}

export function getTodaysSurgerySchedule() {
  const rows = surgicalCases.filter((c) => c.scheduledDateTime?.startsWith(TODAY)).map(toSurgicalCaseRow).sort((a, b) => (a.scheduledDateTime! < b.scheduledDateTime! ? -1 : 1));
  return mockRequest(rows);
}

/** Pre-Op Worklist (spec §12) — every case actively in pre-op workup, plus its checklist/consent/anesthesia completion so the READY FOR OT / NOT READY split is immediately visible. */
export function getPreOpWorklist() {
  const rows = surgicalCases
    .filter((c) => ["scheduled", "pre-op-pending"].includes(c.status))
    .map((c) => ({
      ...toSurgicalCaseRow(c),
      checklistCompletedCount: (c.preOpChecklistCompleted ?? []).length,
      checklistTotalCount: preOpChecklistTemplate.filter((i) => i.active).length,
      consentStatus: c.consent?.status,
      anesthesiaAssessed: Boolean(c.anesthesiaAssessment?.completedAt),
    }))
    .sort((a, b) => (a.scheduledDateTime ?? "9999").localeCompare(b.scheduledDateTime ?? "9999"));
  return mockRequest(rows);
}

/** Anesthesia work queue (spec §15) — every case that needs (or has) a pre-anesthesia assessment on file. */
export function getAnesthesiaWorklist() {
  const rows = surgicalCases
    .filter((c) => !["requested", "cancelled", "postponed", "no-show", "aborted"].includes(c.status))
    .map((c) => ({ ...toSurgicalCaseRow(c), anesthesiaAssessment: c.anesthesiaAssessment }))
    .sort((a, b) => (a.scheduledDateTime ?? "9999").localeCompare(b.scheduledDateTime ?? "9999"));
  return mockRequest(rows);
}

/** Intra-Op live case list (spec §17) — cases at or past Ready for OT and not yet completed. */
export function getIntraOpCases() {
  const activeStatuses: SurgicalCaseStatus[] = ["ready-for-ot", "patient-transferred", "anesthesia-started", "surgery-started"];
  const rows = surgicalCases.filter((c) => activeStatuses.includes(c.status)).map(toSurgicalCaseRow).sort((a, b) => (a.scheduledDateTime ?? "9999").localeCompare(b.scheduledDateTime ?? "9999"));
  return mockRequest(rows);
}

/** Recovery/PACU list (spec §24-25) — cases whose surgery is done but haven't been transferred out of PACU yet. */
export function getRecoveryCases() {
  const rows = surgicalCases
    .filter((c) => c.status === "surgery-completed" || c.status === "recovery")
    .map((c) => ({ ...toSurgicalCaseRow(c), pacuStatus: c.pacuStatus, pacuArrivalAt: c.pacuArrivalAt, pacuDestination: c.pacuDestination }))
    .sort((a, b) => (a.pacuArrivalAt ?? a.scheduledDateTime ?? "9999").localeCompare(b.pacuArrivalAt ?? b.scheduledDateTime ?? "9999"));
  return mockRequest(rows);
}

export interface CaseLifecycleStage {
  stage: string;
  status: SurgicalCaseLifecycleStatus;
  done: boolean;
  current: boolean;
}

function buildCaseLifecycle(c: SurgicalCase): CaseLifecycleStage[] {
  const isTerminalOther = ["cancelled", "postponed", "no-show", "aborted"].includes(c.status);
  const currentIndex = isTerminalOther ? -1 : surgicalCaseLifecycle.indexOf(c.status as SurgicalCaseLifecycleStatus);
  const stageLabels: Record<SurgicalCaseLifecycleStatus, string> = {
    requested: "Requested",
    approved: "Approved",
    scheduled: "Scheduled",
    "pre-op-pending": "Pre-Op Pending",
    "pre-op-cleared": "Pre-Op Cleared",
    "ready-for-ot": "Ready for OT",
    "patient-transferred": "Patient Transferred",
    "anesthesia-started": "Anesthesia Started",
    "surgery-started": "Surgery Started",
    "surgery-completed": "Surgery Completed",
    recovery: "Recovery",
    transferred: "Transferred",
    completed: "Completed",
  };
  return surgicalCaseLifecycle.map((status, i) => ({
    stage: stageLabels[status],
    status,
    done: !isTerminalOther && i <= currentIndex,
    current: !isTerminalOther && i === currentIndex,
  }));
}

export interface SurgicalCaseDetail extends SurgicalCaseRow {
  encounterId?: string;
  clinicalIndication: string;
  diagnosis?: string;
  surgicalSite?: string;
  laterality?: Laterality;
  assistantSurgeonName?: string;
  anesthesiologistName?: string;
  scrubNurseName?: string;
  circulatingNurseName?: string;
  technicianName?: string;
  estimatedDurationMinutes: number;
  requiredOtType?: string;
  requiredEquipment?: string;
  bloodRequirement?: string;
  implantRequirement?: boolean;
  specialEquipment?: string;
  isolationRequirement?: boolean;
  icuBedRequirement?: boolean;
  pacuRequirement?: boolean;
  specialInstructions?: string;
  requestedAt: string;
  approvedAt?: string;
  cancelledReason?: string;
  postponedReason?: string;
  delayReason?: string;
  delayMinutes?: number;
  roomEntryAt?: string;
  anesthesiaStartAt?: string;
  procedureStartAt?: string;
  procedureEndAt?: string;
  anesthesiaEndAt?: string;
  roomExitAt?: string;
  preOpChecklistCompleted: string[];
  consent?: ConsentDetail;
  anesthesiaAssessment?: AnesthesiaAssessment;
  safetyChecklistCompleted: Partial<Record<SafetyChecklistStage, string[]>>;
  procedureDocumentation?: ProcedureDocumentation;
  pacuStatus?: PacuStatus;
  pacuArrivalAt?: string;
  pacuDestination?: PacuDestination;
  postOpNote?: PostOpNote;
  lifecycle: CaseLifecycleStage[];
}

export function getSurgicalCase(id: string) {
  const c = surgicalCases.find((x) => x.id === id);
  if (!c) return mockRequest(null as SurgicalCaseDetail | null);
  const row = toSurgicalCaseRow(c);
  const detail: SurgicalCaseDetail = {
    ...row,
    encounterId: c.encounterId,
    clinicalIndication: c.clinicalIndication,
    diagnosis: c.diagnosis,
    surgicalSite: c.surgicalSite,
    laterality: c.laterality,
    assistantSurgeonName: resolveStaffName(c.assistantSurgeonId),
    anesthesiologistName: resolveStaffName(c.anesthesiologistId),
    scrubNurseName: resolveStaffName(c.scrubNurseId),
    circulatingNurseName: resolveStaffName(c.circulatingNurseId),
    technicianName: resolveStaffName(c.technicianId),
    estimatedDurationMinutes: c.estimatedDurationMinutes,
    requiredOtType: c.requiredOtType,
    requiredEquipment: c.requiredEquipment,
    bloodRequirement: c.bloodRequirement,
    implantRequirement: c.implantRequirement,
    specialEquipment: c.specialEquipment,
    isolationRequirement: c.isolationRequirement,
    icuBedRequirement: c.icuBedRequirement,
    pacuRequirement: c.pacuRequirement,
    specialInstructions: c.specialInstructions,
    requestedAt: c.requestedAt,
    approvedAt: c.approvedAt,
    cancelledReason: c.cancelledReason,
    postponedReason: c.postponedReason,
    delayReason: c.delayReason,
    delayMinutes: c.delayMinutes,
    roomEntryAt: c.roomEntryAt,
    anesthesiaStartAt: c.anesthesiaStartAt,
    procedureStartAt: c.procedureStartAt,
    procedureEndAt: c.procedureEndAt,
    anesthesiaEndAt: c.anesthesiaEndAt,
    roomExitAt: c.roomExitAt,
    preOpChecklistCompleted: c.preOpChecklistCompleted ?? [],
    consent: c.consent,
    anesthesiaAssessment: c.anesthesiaAssessment,
    safetyChecklistCompleted: c.safetyChecklistCompleted ?? {},
    procedureDocumentation: c.procedureDocumentation,
    pacuStatus: c.pacuStatus,
    pacuArrivalAt: c.pacuArrivalAt,
    pacuDestination: c.pacuDestination,
    postOpNote: c.postOpNote,
    lifecycle: buildCaseLifecycle(c),
  };
  return mockRequest(detail);
}

// --- Surgery Request (spec §9-11) — administrative capture of the request
// itself (who/what/when/priority/requirements), not clinical authorship of
// the surgery's outcome. ---

export interface NewSurgeryRequestInput {
  patientId: string;
  procedureCode: string;
  plannedProcedure: string;
  surgicalSite?: string;
  laterality?: Laterality;
  clinicalIndication: string;
  diagnosis?: string;
  priority: SurgeryPriority;
  primarySurgeonId: string;
  assistantSurgeonId?: string;
  anesthesiologistId?: string;
  scrubNurseId?: string;
  circulatingNurseId?: string;
  technicianId?: string;
  estimatedDurationMinutes: number;
  requiredOtType?: string;
  requiredEquipment?: string;
  requiredAnesthesia?: string;
  bloodRequirement?: string;
  implantRequirement?: boolean;
  specialEquipment?: string;
  isolationRequirement?: boolean;
  icuBedRequirement?: boolean;
  pacuRequirement?: boolean;
  specialInstructions?: string;
}

function findCaseOrThrow(id: string): SurgicalCase {
  const c = surgicalCases.find((x) => x.id === id);
  if (!c) throw new Error(`Surgical case ${id} not found`);
  return c;
}

export function createSurgeryRequest(input: NewSurgeryRequestInput, actor: string = DEFAULT_ACTOR) {
  const seq = 141 + surgicalCases.length;
  const surgicalCase: SurgicalCase = {
    ...input,
    id: `ot-case-${surgicalCases.length + 1}`,
    caseNumber: `OT-2026-${String(seq).padStart(6, "0")}`,
    departmentId: "dept-ot",
    status: "requested",
    requestedAt: NOW,
    lastActionBy: actor,
    lastActionAt: NOW,
  };
  surgicalCases.push(surgicalCase);
  recordOTAudit("Surgery request created", "case", surgicalCase.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(surgicalCase));
}

export function approveSurgicalCase(id: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.status = "approved";
  c.approvedAt = NOW;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Case approved", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export interface ScheduleSurgicalCaseInput {
  scheduledDateTime: string;
  roomId: string;
}

export function scheduleSurgicalCase(id: string, input: ScheduleSurgicalCaseInput, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.scheduledDateTime = input.scheduledDateTime;
  c.roomId = input.roomId;
  c.status = "scheduled";
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Case scheduled", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export function rescheduleSurgicalCase(id: string, input: ScheduleSurgicalCaseInput, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.scheduledDateTime = input.scheduledDateTime;
  c.roomId = input.roomId;
  c.delayReason = undefined;
  c.delayMinutes = undefined;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Case rescheduled", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export function cancelSurgicalCase(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  if (surgicalCaseLifecycle.indexOf(c.status as SurgicalCaseLifecycleStatus) >= surgicalCaseLifecycle.indexOf("surgery-started")) {
    throw new Error("A case already in surgery cannot be cancelled");
  }
  c.status = "cancelled";
  c.cancelledReason = reason;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Case cancelled", "case", c.caseNumber, actor, reason);
  return mockRequest(toSurgicalCaseRow(c));
}

export function postponeSurgicalCase(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.status = "postponed";
  c.postponedReason = reason;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Case postponed", "case", c.caseNumber, actor, reason);
  return mockRequest(toSurgicalCaseRow(c));
}

export function delaySurgicalCase(id: string, minutes: number, reason: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.delayMinutes = minutes;
  c.delayReason = reason;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit(`Case delayed ${minutes} min`, "case", c.caseNumber, actor, reason);
  return mockRequest(toSurgicalCaseRow(c));
}

export function markSurgicalCaseNoShow(id: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.status = "no-show";
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Case marked no-show", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

// --- Pre-Op (spec §12-13) — checklist ticking, consent, anesthesia
// assessment. The first interaction on a merely-"scheduled" case bumps it to
// "pre-op-pending" automatically, matching how a real pre-op workup begins
// the moment anyone starts working the case, not a separate manual step. ---

function ensurePreOpPending(c: SurgicalCase) {
  if (c.status === "scheduled") c.status = "pre-op-pending";
}

export function togglePreOpChecklistItem(id: string, itemId: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  ensurePreOpPending(c);
  const completed = new Set(c.preOpChecklistCompleted ?? []);
  if (completed.has(itemId)) completed.delete(itemId);
  else completed.add(itemId);
  c.preOpChecklistCompleted = Array.from(completed);
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit(`Pre-op checklist item toggled (${itemId})`, "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export interface ConsentInput {
  status: ConsentStatus;
  type?: string;
  obtainedBy?: string;
  witness?: string;
  documentRef?: string;
}

/** Consent capture (spec §14) — records what the hospital's own consent workflow produced; this frontend doesn't implement or validate that legal/regulatory process itself. */
export function recordConsent(id: string, input: ConsentInput, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  ensurePreOpPending(c);
  c.consent = {
    ...input,
    obtainedAt: c.consent?.obtainedAt ?? NOW,
    providerId: actor,
    version: c.consent?.version ?? "1",
  };
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit(`Consent status set to ${input.status}`, "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export interface AnesthesiaAssessmentInput {
  airwayAssessment?: string;
  relevantHistory?: string;
  allergies?: string;
  asaClass?: ASAClass;
  plan?: string;
}

/** Pre-anesthesia assessment (spec §15) — structured short-form capture, finalized in practice by qualified anesthesia professionals; this just records the outcome. */
export function recordAnesthesiaAssessment(id: string, input: AnesthesiaAssessmentInput, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  ensurePreOpPending(c);
  c.anesthesiaAssessment = { ...c.anesthesiaAssessment, ...input, completedAt: NOW, completedBy: actor };
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Anesthesia assessment recorded", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

/** Marks a case Ready for OT (spec §12) once the checklist/consent/anesthesia assessment are all actually complete — never a manual override past that gate. */
export function markReadyForOT(id: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  if (!isPreOpReady(c)) throw new Error("Case is not yet ready for OT — checklist, consent, and anesthesia assessment must be complete");
  c.status = "ready-for-ot";
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Marked ready for OT", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

// --- Intra-Op (spec §16-19) — safety checklist + time tracking + procedure
// documentation. Every field captured here is structured/short-form; no
// clinical-narrative authoring lives in this frontend. ---

export function toggleSafetyChecklistItem(id: string, stage: SafetyChecklistStage, itemId: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  const current = c.safetyChecklistCompleted ?? {};
  const stageItems = new Set(current[stage] ?? []);
  if (stageItems.has(itemId)) stageItems.delete(itemId);
  else stageItems.add(itemId);
  c.safetyChecklistCompleted = { ...current, [stage]: Array.from(stageItems) };
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit(`Safety checklist item toggled (${stage}/${itemId})`, "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export function transferPatientToOT(id: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  if (c.status !== "ready-for-ot") throw new Error("Only a case marked Ready for OT can be transferred");
  c.status = "patient-transferred";
  c.roomEntryAt = NOW;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Patient transferred to OT", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export function startCaseAnesthesia(id: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.status = "anesthesia-started";
  c.anesthesiaStartAt = NOW;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Anesthesia started", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export function startCaseSurgery(id: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.status = "surgery-started";
  c.procedureStartAt = NOW;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Surgery started", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export interface ProcedureDocumentationInput {
  performedProcedure?: string;
  findings?: string;
  technique?: string;
  complications?: string;
  estimatedBloodLoss?: string;
  specimensCollected?: boolean;
  specimenNote?: string;
  implantsUsed?: boolean;
  implantNote?: string;
  devices?: string;
  drains?: string;
  closure?: string;
  postOpDiagnosis?: string;
  postOpInstructions?: string;
}

/** Completes the surgical phase — logs acquisition end time, sets the OT room free for cleaning, and records the structured procedure documentation (spec §19). */
export function completeCaseSurgery(id: string, input: ProcedureDocumentationInput, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.status = "surgery-completed";
  c.procedureEndAt = NOW;
  c.anesthesiaEndAt = NOW;
  c.procedureDocumentation = { ...input, documentedAt: NOW, documentedBy: actor };
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  const room = c.roomId ? otRooms.find((r) => r.id === c.roomId) : undefined;
  if (room) room.status = "cleaning";
  if (input.specimensCollected) createSpecimenForCase(id, input.specimenNote || c.plannedProcedure, actor);
  recordOTAudit("Surgery completed, procedure documented", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

// --- Post-Op / Recovery / PACU (spec §24-26) --------------------------------

export function moveCaseToRecovery(id: string, destination: PacuDestination, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.status = "recovery";
  c.roomExitAt = NOW;
  c.pacuStatus = "arrived";
  c.pacuArrivalAt = NOW;
  c.pacuDestination = destination;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Moved to recovery/PACU", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export function setPacuStatus(id: string, status: PacuStatus, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.pacuStatus = status;
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit(`PACU status set to ${status}`, "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export interface PostOpNoteInput {
  patientCondition?: string;
  painAssessment?: string;
  recoveryAssessment?: string;
  postOpOrders?: string;
  followUpPlan?: string;
}

/** Records the recovery-stage note (spec §26) and transfers the case out of PACU to its destination ward/ICU — the final admin-owned step; discharge/follow-up itself lives in the destination unit's own workflow. */
export function recordPostOpNoteAndTransfer(id: string, input: PostOpNoteInput, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  c.postOpNote = { ...input, recordedAt: NOW, recordedBy: actor };
  c.status = "transferred";
  c.pacuStatus = "transferred";
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Post-op note recorded, case transferred", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

export function completeSurgicalCase(id: string, actor: string = DEFAULT_ACTOR) {
  const c = findCaseOrThrow(id);
  if (c.status !== "transferred") throw new Error("Only a transferred case can be marked complete");
  c.status = "completed";
  c.lastActionBy = actor;
  c.lastActionAt = NOW;
  recordOTAudit("Case marked complete", "case", c.caseNumber, actor);
  return mockRequest(toSurgicalCaseRow(c));
}

// --- Surgical Team (spec §10, §29) — read-only visibility joined off Staff
// & Workforce, same pattern as Radiology's Radiologists/Technologists tabs. ---

export interface SurgicalTeamOption {
  id: string;
  name: string;
  role: string;
  specialty: string;
}

function otStaffByRole(roleType: "doctor" | "nurse" | "technician", specialtyIncludes?: string) {
  return staffMembers
    .filter((s) => s.department === "Operation Theatre" && s.role === roleType && (!specialtyIncludes || s.specialty.includes(specialtyIncludes)))
    .map((s) => ({ id: s.id, name: s.name, role: s.title, specialty: s.specialty }));
}

export interface OTPatientOption {
  id: string;
  fullName: string;
}

export function getOTPatientOptions() {
  return mockRequest(patientSeeds.map((p) => ({ id: p.id, fullName: p.fullName })));
}

export function getOTTeamOptions() {
  return mockRequest({
    surgeons: otStaffByRole("doctor", "Surgery"),
    anesthesiologists: otStaffByRole("doctor", "Anesthes"),
    nurses: otStaffByRole("nurse"),
    technicians: otStaffByRole("technician"),
  });
}

// --- Dashboard (spec §3-6) --------------------------------------------------

export interface OTDashboardData {
  todaysSurgeries: number;
  inProgress: number;
  completed: number;
  scheduled: number;
  emergency: number;
  cancelled: number;
  utilizationPercent: number;
  averageProcedureDurationMinutes: number;
  delayedSurgeries: number;
  pendingPreOpAssessments: number;
  pendingConsents: number;
  pendingAnesthesiaClearance: number;
  availableRooms: number;
  occupiedRooms: number;
  pacuOccupancy: number;
  rooms: OTRoomRow[];
  todaysSchedule: SurgicalCaseRow[];
}

export function getOTDashboard() {
  const todaysCases = surgicalCases.filter((c) => c.scheduledDateTime?.startsWith(TODAY) || c.requestedAt.startsWith(TODAY));
  const todaysSurgeries = todaysCases.length;
  const inProgress = surgicalCases.filter((c) => ["patient-transferred", "anesthesia-started", "surgery-started"].includes(c.status)).length;
  const completed = todaysCases.filter((c) => c.status === "completed" || c.status === "surgery-completed" || c.status === "transferred").length;
  const scheduled = surgicalCases.filter((c) => c.status === "scheduled").length;
  const emergency = surgicalCases.filter((c) => c.priority === "emergency" && !["completed", "cancelled"].includes(c.status)).length;
  const cancelled = todaysCases.filter((c) => c.status === "cancelled").length;

  const completedWithDuration = surgicalCases.filter((c) => c.procedureStartAt && c.procedureEndAt);
  const averageProcedureDurationMinutes = completedWithDuration.length
    ? Math.round(completedWithDuration.reduce((sum, c) => sum + (new Date(c.procedureEndAt!).getTime() - new Date(c.procedureStartAt!).getTime()) / 60000, 0) / completedWithDuration.length)
    : 0;

  const delayedSurgeries = surgicalCases.filter((c) => Boolean(c.delayMinutes)).length;
  const preOpWorkingCases = surgicalCases.filter((c) => ["scheduled", "pre-op-pending"].includes(c.status));
  const pendingPreOpAssessments = preOpWorkingCases.filter((c) => !isPreOpReady(c)).length;
  const pendingConsents = preOpWorkingCases.filter((c) => c.consent?.status !== "verified").length;
  const pendingAnesthesiaClearance = preOpWorkingCases.filter((c) => !c.anesthesiaAssessment?.completedAt).length;

  const availableRooms = otRooms.filter((r) => r.status === "available").length;
  const occupiedRooms = otRooms.filter((r) => ["in-surgery", "patient-inside", "preparation"].includes(r.status)).length;
  const pacuOccupancy = surgicalCases.filter((c) => c.status === "recovery").length;

  const totalScheduledMinutes = surgicalCases.filter((c) => c.scheduledDateTime?.startsWith(TODAY)).reduce((sum, c) => sum + c.estimatedDurationMinutes, 0);
  const totalCapacityMinutes = otRooms.length * 10 * 60;
  const utilizationPercent = totalCapacityMinutes > 0 ? Math.min(100, Math.round((totalScheduledMinutes / totalCapacityMinutes) * 100)) : 0;

  const data: OTDashboardData = {
    todaysSurgeries,
    inProgress,
    completed,
    scheduled,
    emergency,
    cancelled,
    utilizationPercent,
    averageProcedureDurationMinutes,
    delayedSurgeries,
    pendingPreOpAssessments,
    pendingConsents,
    pendingAnesthesiaClearance,
    availableRooms,
    occupiedRooms,
    pacuOccupancy,
    rooms: otRooms.map(toOTRoomRow),
    todaysSchedule: surgicalCases.filter((c) => c.scheduledDateTime?.startsWith(TODAY)).map(toSurgicalCaseRow).sort((a, b) => (a.scheduledDateTime! < b.scheduledDateTime! ? -1 : 1)),
  };
  return mockRequest(data);
}

// ============================================================================
// Phase 3 — Supporting Operations (spec §10, 21-23, 28-29): Surgical Team
// (read-only roster), Instruments, Consumables, Implants, Specimens,
// Equipment. [oversight]: registries + traceability/usage logs, never a
// second inventory/procurement system — Pharmacy/Inventory own the deeper
// stock domain; this stays scoped to what OT itself tracks for a case.
// ============================================================================

// --- Instruments (spec §22) --------------------------------------------------

export type InstrumentStatus = "available" | "in-use" | "sterilization" | "contaminated" | "damaged" | "maintenance";
export type SterilizationStatus = "sterile" | "non-sterile" | "in-process";

export interface InstrumentSet {
  id: string;
  setId: string;
  name: string;
  sterilizationStatus: SterilizationStatus;
  sterilizationExpiry: string;
  location: string;
  status: InstrumentStatus;
}

export const instrumentSets: InstrumentSet[] = [
  { id: "inst-1", setId: "SET-001", name: "General Surgery Set", sterilizationStatus: "sterile", sterilizationExpiry: "2026-09-10", location: "OT-01 Sterile Store", status: "available" },
  { id: "inst-2", setId: "SET-002", name: "Laparoscopic Set", sterilizationStatus: "sterile", sterilizationExpiry: "2026-09-05", location: "OT-01 Sterile Store", status: "in-use" },
  { id: "inst-3", setId: "SET-003", name: "Orthopedic Set", sterilizationStatus: "sterile", sterilizationExpiry: "2026-08-28", location: "OT-02 Sterile Store", status: "available" },
  { id: "inst-4", setId: "SET-004", name: "Cardiac Set", sterilizationStatus: "in-process", sterilizationExpiry: "2026-08-17", location: "CSSD", status: "sterilization" },
  { id: "inst-5", setId: "SET-005", name: "ENT Set", sterilizationStatus: "sterile", sterilizationExpiry: "2026-09-01", location: "OT-04 Sterile Store", status: "available" },
  { id: "inst-6", setId: "SET-006", name: "Emergency General Set", sterilizationStatus: "non-sterile", sterilizationExpiry: "2026-08-10", location: "CSSD", status: "damaged" },
];

export function getInstrumentSets() {
  return mockRequest(instrumentSets);
}

export interface NewInstrumentSetInput {
  setId: string;
  name: string;
  sterilizationStatus: SterilizationStatus;
  sterilizationExpiry: string;
  location: string;
}

export function createInstrumentSet(input: NewInstrumentSetInput) {
  const set: InstrumentSet = { ...input, id: `inst-${instrumentSets.length + 1}`, status: "available" };
  instrumentSets.push(set);
  recordOTAudit("Instrument set created", "instrument", set.setId, DEFAULT_ACTOR);
  return mockRequest(set);
}

export function updateInstrumentSet(id: string, updates: Partial<NewInstrumentSetInput>) {
  const set = instrumentSets.find((s) => s.id === id);
  if (!set) throw new Error("Instrument set not found");
  Object.assign(set, updates);
  recordOTAudit("Instrument set updated", "instrument", set.setId, DEFAULT_ACTOR);
  return mockRequest(set);
}

export function setInstrumentStatus(id: string, status: InstrumentStatus) {
  const set = instrumentSets.find((s) => s.id === id);
  if (!set) throw new Error("Instrument set not found");
  set.status = status;
  recordOTAudit(`Instrument status changed to ${status}`, "instrument", set.setId, DEFAULT_ACTOR);
  return mockRequest(set);
}

// --- Consumables (spec §23) ---------------------------------------------------

export interface ConsumableItem {
  code: string;
  name: string;
  unit: string;
  unitCost: number;
  stockQuantity: number;
}

export const consumableItems: ConsumableItem[] = [
  { code: "CONS-GLOVES", name: "Surgical Gloves", unit: "pair", unitCost: 0.8, stockQuantity: 4200 },
  { code: "CONS-SUTURES", name: "Sutures", unit: "unit", unitCost: 6.5, stockQuantity: 850 },
  { code: "CONS-GAUZE", name: "Gauze", unit: "pack", unitCost: 2.1, stockQuantity: 1200 },
  { code: "CONS-CATHETER", name: "Catheters", unit: "unit", unitCost: 4.2, stockQuantity: 340 },
  { code: "CONS-SYRINGE", name: "Syringes", unit: "unit", unitCost: 0.5, stockQuantity: 3100 },
  { code: "CONS-BLADE", name: "Surgical Blades", unit: "unit", unitCost: 1.2, stockQuantity: 920 },
  { code: "CONS-DRAPE", name: "Surgical Drapes", unit: "unit", unitCost: 3.8, stockQuantity: 610 },
];

export function getConsumablesCatalog() {
  return mockRequest(consumableItems);
}

export interface ConsumableUsage {
  id: string;
  caseId: string;
  consumableCode: string;
  quantity: number;
  recordedAt: string;
  recordedBy: string;
}

export const consumableUsageLog: ConsumableUsage[] = [
  { id: "cu-1", caseId: "ot-case-2", consumableCode: "CONS-GLOVES", quantity: 6, recordedAt: `${TODAY}T09:10:00`, recordedBy: "hina-tariq" },
  { id: "cu-2", caseId: "ot-case-2", consumableCode: "CONS-SUTURES", quantity: 4, recordedAt: `${TODAY}T09:10:00`, recordedBy: "hina-tariq" },
  { id: "cu-3", caseId: "ot-case-2", consumableCode: "CONS-GAUZE", quantity: 10, recordedAt: `${TODAY}T09:10:00`, recordedBy: "hina-tariq" },
];

/** Every usage decrements catalog stock — feeds inventory/billing per spec §23, not a second inventory system of its own. */
export function recordConsumableUsage(caseId: string, consumableCode: string, quantity: number, actor: string = DEFAULT_ACTOR) {
  const item = consumableItems.find((c) => c.code === consumableCode);
  if (!item) throw new Error("Consumable not found");
  if (quantity > item.stockQuantity) throw new Error("Insufficient stock");
  item.stockQuantity -= quantity;
  const usage: ConsumableUsage = { id: `cu-${consumableUsageLog.length + 1}`, caseId, consumableCode, quantity, recordedAt: NOW, recordedBy: actor };
  consumableUsageLog.push(usage);
  const c = findCaseOrThrow(caseId);
  recordOTAudit(`Consumable used: ${item.name} x${quantity}`, "consumable", c.caseNumber, actor);
  return mockRequest(usage);
}

export interface ConsumableUsageRow extends ConsumableUsage {
  consumableName: string;
  caseNumber: string;
}

export function getConsumableUsage(filters: { caseId?: string } = {}) {
  let rows = consumableUsageLog.map((u) => ({
    ...u,
    consumableName: consumableItems.find((c) => c.code === u.consumableCode)?.name ?? u.consumableCode,
    caseNumber: surgicalCases.find((c) => c.id === u.caseId)?.caseNumber ?? u.caseId,
  }));
  if (filters.caseId) rows = rows.filter((r) => r.caseId === filters.caseId);
  return mockRequest(rows.sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1)));
}

// --- Implants (spec §21) — traceability is the whole point, per the spec's
// own emphasis, so every usage is a permanent log entry, never overwritten. -

export interface ImplantItem {
  id: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  lotNumber: string;
  udi?: string;
  quantityAvailable: number;
  expiryDate: string;
}

export const implantItems: ImplantItem[] = [
  { id: "impl-1", type: "Titanium Mesh", manufacturer: "MedTech Orthopedics", model: "TM-200", serialNumber: "SN-88213", lotNumber: "LOT-4821", udi: "(01)00812345678903", quantityAvailable: 8, expiryDate: "2028-03-01" },
  { id: "impl-2", type: "Total Knee Implant", manufacturer: "OrthoGlobal", model: "KneeFlex Pro", serialNumber: "SN-44210", lotNumber: "LOT-9012", udi: "(01)00812345678910", quantityAvailable: 4, expiryDate: "2029-01-15" },
  { id: "impl-3", type: "Cardiac Stent", manufacturer: "CardioDevices Inc", model: "FlexiStent 3.0", serialNumber: "SN-33012", lotNumber: "LOT-1123", udi: "(01)00812345678927", quantityAvailable: 12, expiryDate: "2027-06-20" },
  { id: "impl-4", type: "Surgical Mesh (Hernia)", manufacturer: "MedTech Orthopedics", model: "HerniaFix", serialNumber: "SN-19042", lotNumber: "LOT-6634", quantityAvailable: 15, expiryDate: "2027-11-30" },
];

export function getImplantCatalog() {
  return mockRequest(implantItems);
}

export interface ImplantUsage {
  id: string;
  caseId: string;
  implantId: string;
  quantityUsed: number;
  recordedAt: string;
  recordedBy: string;
}

export const implantUsageLog: ImplantUsage[] = [];

export function recordImplantUsage(caseId: string, implantId: string, quantityUsed: number, actor: string = DEFAULT_ACTOR) {
  const item = implantItems.find((i) => i.id === implantId);
  if (!item) throw new Error("Implant not found");
  if (quantityUsed > item.quantityAvailable) throw new Error("Insufficient implant stock");
  item.quantityAvailable -= quantityUsed;
  const usage: ImplantUsage = { id: `iu-${implantUsageLog.length + 1}`, caseId, implantId, quantityUsed, recordedAt: NOW, recordedBy: actor };
  implantUsageLog.push(usage);
  const c = findCaseOrThrow(caseId);
  recordOTAudit(`Implant used: ${item.type} (lot ${item.lotNumber})`, "implant", c.caseNumber, actor);
  return mockRequest(usage);
}

export interface ImplantUsageRow extends ImplantUsage {
  implantType: string;
  lotNumber: string;
  serialNumber: string;
  caseNumber: string;
  patientName: string;
}

export function getImplantUsageLog() {
  const rows: ImplantUsageRow[] = implantUsageLog.map((u) => {
    const item = implantItems.find((i) => i.id === u.implantId);
    const c = surgicalCases.find((x) => x.id === u.caseId);
    return {
      ...u,
      implantType: item?.type ?? "Unknown",
      lotNumber: item?.lotNumber ?? "—",
      serialNumber: item?.serialNumber ?? "—",
      caseNumber: c?.caseNumber ?? u.caseId,
      patientName: c ? resolvePatientName(c.patientId) : "—",
    };
  });
  return mockRequest(rows.sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1)));
}

// --- Specimens (spec §20) -----------------------------------------------------

export type SpecimenLabelStatus = "pending" | "labeled";
export type SpecimenPathologyStatus = "pending" | "sent" | "in-progress" | "resulted";

export interface Specimen {
  id: string;
  specimenId: string;
  caseId: string;
  type: string;
  collectionTime: string;
  collectionSite?: string;
  container?: string;
  labelStatus: SpecimenLabelStatus;
  destination?: string;
  pathologyStatus: SpecimenPathologyStatus;
  result?: string;
}

export const specimens: Specimen[] = [];

function createSpecimenForCase(caseId: string, type: string, actor: string) {
  const specimen: Specimen = {
    id: `spec-${specimens.length + 1}`,
    specimenId: `SPEC-2026-${String(specimens.length + 1).padStart(3, "0")}`,
    caseId,
    type,
    collectionTime: NOW,
    labelStatus: "pending",
    pathologyStatus: "pending",
  };
  specimens.push(specimen);
  const c = findCaseOrThrow(caseId);
  recordOTAudit("Specimen collected", "specimen", c.caseNumber, actor, type);
  return specimen;
}

export interface SpecimenRow extends Specimen {
  caseNumber: string;
  patientName: string;
}

export function getSpecimens(filters: { caseId?: string } = {}) {
  let rows: SpecimenRow[] = specimens.map((s) => {
    const c = surgicalCases.find((x) => x.id === s.caseId);
    return { ...s, caseNumber: c?.caseNumber ?? s.caseId, patientName: c ? resolvePatientName(c.patientId) : "—" };
  });
  if (filters.caseId) rows = rows.filter((r) => r.caseId === filters.caseId);
  return mockRequest(rows.sort((a, b) => (a.collectionTime < b.collectionTime ? 1 : -1)));
}

export function updateSpecimen(id: string, updates: { container?: string; collectionSite?: string; destination?: string; labelStatus?: SpecimenLabelStatus; pathologyStatus?: SpecimenPathologyStatus }, actor: string = DEFAULT_ACTOR) {
  const specimen = specimens.find((s) => s.id === id);
  if (!specimen) throw new Error("Specimen not found");
  Object.assign(specimen, updates);
  recordOTAudit("Specimen updated", "specimen", specimen.specimenId, actor);
  return mockRequest(specimen);
}

// --- Equipment (spec §28) — the deeper technical/service view of OT room
// equipment; RoomRow's own `equipment: string[]` field stays a simple
// display list, this is where individual items get real tracked status. ---

export type OTEquipmentStatus = "operational" | "in-use" | "maintenance" | "out-of-service";

export interface OTEquipmentItem {
  id: string;
  name: string;
  roomId?: string;
  status: OTEquipmentStatus;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

export const otEquipmentItems: OTEquipmentItem[] = [
  { id: "eq-1", name: "Laparoscopy Tower", roomId: "ot-room-1", status: "in-use", lastServiceDate: "2026-06-15", nextServiceDate: "2026-12-15" },
  { id: "eq-2", name: "Electrocautery Unit", roomId: "ot-room-1", status: "in-use", lastServiceDate: "2026-07-01", nextServiceDate: "2027-01-01" },
  { id: "eq-3", name: "Anesthesia Workstation", roomId: "ot-room-1", status: "in-use", lastServiceDate: "2026-05-20", nextServiceDate: "2026-11-20" },
  { id: "eq-4", name: "C-Arm Fluoroscopy", roomId: "ot-room-2", status: "operational", lastServiceDate: "2026-07-10", nextServiceDate: "2027-01-10" },
  { id: "eq-5", name: "Orthopedic Drill Set", roomId: "ot-room-2", status: "operational", lastServiceDate: "2026-06-01", nextServiceDate: "2026-12-01" },
  { id: "eq-6", name: "Heart-Lung Machine", roomId: "ot-room-3", status: "maintenance", lastServiceDate: "2026-08-16", nextServiceDate: "2026-09-16" },
  { id: "eq-7", name: "Cardiac Monitor", roomId: "ot-room-3", status: "operational", lastServiceDate: "2026-06-20", nextServiceDate: "2026-12-20" },
  { id: "eq-8", name: "Rapid Infuser", roomId: "ot-room-4", status: "operational", lastServiceDate: "2026-07-05", nextServiceDate: "2027-01-05" },
  { id: "eq-9", name: "Portable X-Ray", roomId: "ot-room-4", status: "operational", lastServiceDate: "2026-07-15", nextServiceDate: "2027-01-15" },
];

export interface OTEquipmentRow extends OTEquipmentItem {
  roomNumber?: string;
}

export function getOTEquipment() {
  const rows: OTEquipmentRow[] = otEquipmentItems.map((e) => ({ ...e, roomNumber: e.roomId ? otRooms.find((r) => r.id === e.roomId)?.number : undefined }));
  return mockRequest(rows);
}

export interface NewOTEquipmentInput {
  name: string;
  roomId?: string;
  nextServiceDate?: string;
}

export function createOTEquipment(input: NewOTEquipmentInput) {
  const item: OTEquipmentItem = { ...input, id: `eq-${otEquipmentItems.length + 1}`, status: "operational" };
  otEquipmentItems.push(item);
  recordOTAudit("Equipment added", "equipment", item.name, DEFAULT_ACTOR);
  return mockRequest(item);
}

export function setOTEquipmentStatus(id: string, status: OTEquipmentStatus) {
  const item = otEquipmentItems.find((e) => e.id === id);
  if (!item) throw new Error("Equipment not found");
  item.status = status;
  if (status === "operational") item.lastServiceDate = TODAY;
  recordOTAudit(`Equipment status changed to ${status}`, "equipment", item.name, DEFAULT_ACTOR);
  return mockRequest(item);
}

// --- Surgical Team read-only roster (spec §29) — joined off Staff &
// Workforce, same pattern as Radiology's Radiologists/Technologists tabs. --

export interface SurgicalTeamMemberRow {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: "active" | "on-leave" | "inactive";
  schedule: string[];
  casesToday: number;
  availableToday: boolean;
}

function isAvailableTodayOT(schedule: string[]): boolean {
  const weekday = new Date(`${TODAY}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
  return schedule.includes(weekday);
}

export function getSurgicalTeamRoster() {
  const rows: SurgicalTeamMemberRow[] = staffMembers
    .filter((s) => s.department === "Operation Theatre")
    .map((s) => {
      const casesToday = surgicalCases.filter(
        (c) =>
          [c.primarySurgeonId, c.assistantSurgeonId, c.anesthesiologistId, c.scrubNurseId, c.circulatingNurseId, c.technicianId].includes(s.id) &&
          (c.scheduledDateTime?.startsWith(TODAY) || c.requestedAt.startsWith(TODAY))
      ).length;
      return { id: s.id, name: s.name, role: s.title, specialty: s.specialty, status: s.status, schedule: s.schedule, casesToday, availableToday: isAvailableTodayOT(s.schedule) };
    });
  return mockRequest(rows);
}

// ============================================================================
// Phase 4 — Management (spec §27, 32-35): Emergency OT, Cancellations,
// Delays, Reports, OT Settings, Audit.
// ============================================================================

export function getEmergencyCases() {
  const rows = surgicalCases
    .filter((c) => c.priority === "emergency" && !["completed", "cancelled", "no-show", "aborted"].includes(c.status))
    .map(toSurgicalCaseRow)
    .sort((a, b) => (a.scheduledDateTime ?? "0").localeCompare(b.scheduledDateTime ?? "0"));
  return mockRequest(rows);
}

export interface CancelledCaseRow extends SurgicalCaseRow {
  cancelledReason?: string;
}

export function getCancelledCases() {
  const rows: CancelledCaseRow[] = surgicalCases
    .filter((c) => c.status === "cancelled")
    .map((c) => ({ ...toSurgicalCaseRow(c), cancelledReason: c.cancelledReason }));
  return mockRequest(rows);
}

export interface PostponedCaseRow extends SurgicalCaseRow {
  postponedReason?: string;
}

export function getPostponedCases() {
  const rows: PostponedCaseRow[] = surgicalCases
    .filter((c) => c.status === "postponed")
    .map((c) => ({ ...toSurgicalCaseRow(c), postponedReason: c.postponedReason }));
  return mockRequest(rows);
}

export interface DelayedCaseRow extends SurgicalCaseRow {
  delayMinutes: number;
  delayReason?: string;
}

export function getDelayedCases() {
  const rows: DelayedCaseRow[] = surgicalCases
    .filter((c) => Boolean(c.delayMinutes))
    .map((c) => ({ ...toSurgicalCaseRow(c), delayMinutes: c.delayMinutes ?? 0, delayReason: c.delayReason }));
  return mockRequest(rows.sort((a, b) => b.delayMinutes - a.delayMinutes));
}

// --- Reports (spec §34) ------------------------------------------------------

export interface OTReportsData {
  surgeriesPerDepartment: { department: string; count: number }[];
  surgeriesPerSurgeon: { surgeon: string; count: number }[];
  surgeriesPerRoom: { room: string; count: number }[];
  averageTurnaroundHours: number;
  cancellationRate: number;
  emergencyRate: number;
  complicationCount: number;
  totalCases: number;
}

export function getOTReports() {
  const totalCases = surgicalCases.length;
  const deptMap = new Map<string, number>();
  surgicalCases.forEach((c) => {
    const dept = departmentConfigs.find((d) => d.id === c.departmentId)?.name ?? "Unknown";
    deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
  });
  const surgeonMap = new Map<string, number>();
  surgicalCases.forEach((c) => {
    const name = resolveStaffName(c.primarySurgeonId) ?? "Unassigned";
    surgeonMap.set(name, (surgeonMap.get(name) ?? 0) + 1);
  });
  const roomMap = new Map<string, number>();
  surgicalCases.forEach((c) => {
    if (!c.roomId) return;
    const room = otRooms.find((r) => r.id === c.roomId)?.number ?? c.roomId;
    roomMap.set(room, (roomMap.get(room) ?? 0) + 1);
  });
  const completedWithTimes = surgicalCases.filter((c) => c.requestedAt && c.procedureEndAt);
  const averageTurnaroundHours = completedWithTimes.length
    ? Math.round((completedWithTimes.reduce((sum, c) => sum + (new Date(c.procedureEndAt!).getTime() - new Date(c.requestedAt).getTime()) / 3600000, 0) / completedWithTimes.length) * 10) / 10
    : 0;
  const cancellationRate = totalCases ? Math.round((surgicalCases.filter((c) => c.status === "cancelled").length / totalCases) * 100) : 0;
  const emergencyRate = totalCases ? Math.round((surgicalCases.filter((c) => c.priority === "emergency").length / totalCases) * 100) : 0;
  const complicationCount = surgicalCases.filter((c) => c.procedureDocumentation?.complications && c.procedureDocumentation.complications.toLowerCase() !== "none").length;

  const data: OTReportsData = {
    surgeriesPerDepartment: Array.from(deptMap.entries()).map(([department, count]) => ({ department, count })),
    surgeriesPerSurgeon: Array.from(surgeonMap.entries()).map(([surgeon, count]) => ({ surgeon, count })),
    surgeriesPerRoom: Array.from(roomMap.entries()).map(([room, count]) => ({ room, count })),
    averageTurnaroundHours,
    cancellationRate,
    emergencyRate,
    complicationCount,
    totalCases,
  };
  return mockRequest(data);
}

// --- OT Settings (spec §35) — overview linking to the screens that own each
// value, not a duplicate config surface. ---

export interface OTSettingsData {
  departmentName: string;
  activeRoomCount: number;
  availableInstrumentSets: number;
  activeTeamMembers: number;
  implantTypesTracked: number;
  defaultCaseBufferMinutes: number;
}

export function getOTSettings() {
  const data: OTSettingsData = {
    departmentName: departmentConfigs.find((d) => d.id === "dept-ot")?.name ?? "Operation Theatre",
    activeRoomCount: otRooms.filter((r) => r.status !== "blocked" && r.status !== "maintenance").length,
    availableInstrumentSets: instrumentSets.filter((i) => i.status === "available").length,
    activeTeamMembers: staffMembers.filter((s) => s.department === "Operation Theatre" && s.status === "active").length,
    implantTypesTracked: implantItems.length,
    defaultCaseBufferMinutes: 30,
  };
  return mockRequest(data);
}

// --- Audit (spec §40) — logged from day one, unlike Radiology where it was
// retrofitted in a later phase; every mutation above already calls this. ---

export type OTAuditEntityType = "case" | "room" | "procedure" | "instrument" | "consumable" | "implant" | "specimen" | "equipment";

export interface OTAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: OTAuditEntityType;
  entityId: string;
  detail?: string;
}

export const otAuditLog: OTAuditEntry[] = [
  { id: "ot-audit-seed-1", timestamp: "2026-08-16T09:20:00", actor: "ahmed-hassan", action: "Created surgical case", entityType: "case", entityId: "OT-2026-000141" },
  { id: "ot-audit-seed-2", timestamp: "2026-08-16T09:45:00", actor: "hina-tariq", action: "Completed pre-op checklist", entityType: "case", entityId: "OT-2026-000141" },
  { id: "ot-audit-seed-3", timestamp: "2026-08-16T10:30:00", actor: "ahmed-hassan", action: "Started procedure", entityType: "case", entityId: "OT-2026-000141" },
];

function recordOTAudit(action: string, entityType: OTAuditEntityType, entityId: string, actor: string, detail?: string) {
  otAuditLog.push({ id: `ot-audit-${otAuditLog.length + 1}`, timestamp: NOW, actor, action, entityType, entityId, detail });
}

export function getOTAuditLog(filters: { entityType?: OTAuditEntityType; search?: string } = {}) {
  let rows = [...otAuditLog].reverse();
  if (filters.entityType) rows = rows.filter((r) => r.entityType === filters.entityType);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.entityId.toLowerCase().includes(q) || r.actor.toLowerCase().includes(q) || r.action.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}
