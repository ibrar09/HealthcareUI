import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { staffMembers, resolveHeadName } from "./staff";
import { patientSeeds } from "./patients";

// ============================================================================
// Radiology (Hospital Admin's [oversight] section — HOSPITAL_ADMIN_MODULE_MAP.md,
// full detail per RADIOLOGY_MODULE_SPEC.md). Building phase-by-phase per the
// user's own instruction. Phase 1 (Dashboard) shipped first; this now also
// covers Phase 2 (Orders/Order Details/Scheduling/Worklist/Studies/Study
// Details/Reports/Report Details/Critical Findings).
//
// FHIR alignment (spec §40): ServiceRequest → ImagingOrder, ImagingStudy →
// ImagingStudy, DiagnosticReport → RadiologyReport. Per spec §19-20/§18/the
// module map's own [oversight] scope rule, this stays administrative, never
// clinical authorship: every mutation below is a workflow/logistics step
// (authorize, schedule, check a patient in, log that acquisition started/
// finished, cancel, acknowledge a critical result) — nothing here writes
// Findings/Impression text or finalizes a report. Report content and DICOM
// networking are pre-seeded, view-only, exactly like Laboratory's results
// are view-only for the same reason ("no reporting UI here").
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

export type ModalityType = "ct" | "mri" | "xr" | "us" | "mammography" | "fluoroscopy" | "pet" | "spect" | "dexa";
export type ModalityStatus = "operational" | "limited" | "offline" | "maintenance" | "retired";

export interface RadiologyModality {
  id: string;
  name: string;
  type: ModalityType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  roomId: string;
  departmentId: string;
  status: ModalityStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  aeTitle: string;
  ipAddress: string;
  pacsDestination: string;
  installationDate: string;
  warrantyExpiration: string;
}

export const radiologyModalities: RadiologyModality[] = [
  { id: "mod-ct-01", name: "CT-01", type: "ct", manufacturer: "Siemens", model: "SOMATOM go.Top", serialNumber: "SN-CT-88213", roomId: "room-r01", departmentId: "dept-radiology", status: "operational", lastMaintenance: "2026-07-20", nextMaintenance: "2026-08-16", aeTitle: "CT_ROOM_01", ipAddress: "10.20.4.11", pacsDestination: "MAIN_PACS", installationDate: "2022-03-10", warrantyExpiration: "2027-03-10" },
  { id: "mod-mri-01", name: "MRI-01", type: "mri", manufacturer: "GE Healthcare", model: "SIGNA Voyager", serialNumber: "SN-MRI-44210", roomId: "room-r02", departmentId: "dept-radiology", status: "operational", lastMaintenance: "2026-07-05", nextMaintenance: "2026-10-05", aeTitle: "MRI_ROOM_01", ipAddress: "10.20.4.12", pacsDestination: "MAIN_PACS", installationDate: "2021-11-02", warrantyExpiration: "2026-11-02" },
  { id: "mod-xr-01", name: "XR-01", type: "xr", manufacturer: "Philips", model: "DigitalDiagnost C90", serialNumber: "SN-XR-33012", roomId: "room-r03", departmentId: "dept-radiology", status: "limited", lastMaintenance: "2026-06-28", nextMaintenance: "2026-08-20", aeTitle: "XR_ROOM_01", ipAddress: "10.20.4.13", pacsDestination: "MAIN_PACS", installationDate: "2023-05-18", warrantyExpiration: "2028-05-18" },
  { id: "mod-us-01", name: "US-01", type: "us", manufacturer: "Philips", model: "EPIQ Elite", serialNumber: "SN-US-19042", roomId: "room-r04", departmentId: "dept-radiology", status: "maintenance", lastMaintenance: "2026-08-14", nextMaintenance: "2026-11-14", aeTitle: "US_ROOM_01", ipAddress: "10.20.4.14", pacsDestination: "MAIN_PACS", installationDate: "2020-09-24", warrantyExpiration: "2025-09-24" },
];

export interface RadiologyRoom {
  id: string;
  number: string;
  location: string;
  modalityId: string;
  capacity: number;
  status: "active" | "closed";
  operatingHours: string;
  assignedStaffIds: string[];
}

export const radiologyRooms: RadiologyRoom[] = [
  { id: "room-r01", number: "R-01", location: "Radiology — Basement B1", modalityId: "mod-ct-01", capacity: 1, status: "active", operatingHours: "07:00–19:00", assignedStaffIds: ["ali-rasheed"] },
  { id: "room-r02", number: "R-02", location: "Radiology — Basement B1", modalityId: "mod-mri-01", capacity: 1, status: "active", operatingHours: "07:00–19:00", assignedStaffIds: ["elena-rostova"] },
  { id: "room-r03", number: "R-03", location: "Radiology — Basement B1", modalityId: "mod-xr-01", capacity: 1, status: "active", operatingHours: "06:00–22:00", assignedStaffIds: ["ali-rasheed"] },
  { id: "room-r04", number: "R-04", location: "Radiology — Basement B1", modalityId: "mod-us-01", capacity: 1, status: "active", operatingHours: "07:00–19:00", assignedStaffIds: ["elena-rostova"] },
];

export function getRadiologyRooms() {
  return mockRequest(radiologyRooms);
}

// --- Rooms tab (spec §14) — joined view + CRUD, separate from getRadiologyRooms()
// above (which stays the raw list the Scheduling modal/Modality form use). ---

export interface RoomRow extends RadiologyRoom {
  modalityName?: string;
  modalityType?: ModalityType;
  modalityStatus?: ModalityStatus;
  assignedStaffNames: string[];
}

function toRoomRow(r: RadiologyRoom): RoomRow {
  const modality = radiologyModalities.find((m) => m.id === r.modalityId);
  return {
    ...r,
    modalityName: modality?.name,
    modalityType: modality?.type,
    modalityStatus: modality?.status,
    assignedStaffNames: r.assignedStaffIds.map((id) => staffMembers.find((s) => s.id === id)?.name ?? "Unknown"),
  };
}

export function getRoomsList() {
  return mockRequest(radiologyRooms.map(toRoomRow));
}

// --- Radiologists (spec §15) — a workload/credentials roster, read-only here.
// Onboarding/HR fields (license, schedule, credentials) are already owned by
// Staff & Workforce (staffMembers) — this view joins that with radiology-
// specific workload, it doesn't duplicate a second personnel record. ---

export interface RadiologistRow {
  id: string;
  name: string;
  specialty: string;
  title: string;
  licenseNumber: string;
  status: "active" | "on-leave" | "inactive";
  schedule: string[];
  studiesToday: number;
  pendingReports: number;
  assignedModalityTypes: ModalityType[];
  availableToday: boolean;
}

function isAvailableToday(schedule: string[]): boolean {
  const weekday = new Date(`${TODAY}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
  return schedule.includes(weekday);
}

export function getRadiologists() {
  const radiologists = staffMembers.filter((s) => s.role === "doctor" && s.department === "Radiology");
  const rows: RadiologistRow[] = radiologists.map((r) => {
    const studiesToday = imagingOrders.filter((o) => o.radiologistId === r.id && o.scheduledDateTime?.startsWith(TODAY)).length;
    const pendingReports = radiologyReports.filter((rep) => rep.radiologistId === r.id && (rep.status === "draft" || rep.status === "preliminary")).length;
    const readModalityTypes = new Set<ModalityType>();
    radiologyReports
      .filter((rep) => rep.radiologistId === r.id)
      .forEach((rep) => {
        const order = imagingOrders.find((o) => o.id === rep.orderId);
        const procedure = order ? imagingProcedures.find((p) => p.code === order.procedureCode) : undefined;
        if (procedure) readModalityTypes.add(procedure.modality);
      });
    return {
      id: r.id,
      name: r.name,
      specialty: r.specialty,
      title: r.title,
      licenseNumber: r.licenseNumber,
      status: r.status,
      schedule: r.schedule,
      studiesToday,
      pendingReports,
      assignedModalityTypes: Array.from(readModalityTypes),
      availableToday: isAvailableToday(r.schedule),
    };
  });
  return mockRequest(rows);
}

// --- Technologists (spec §16) — same read-only roster pattern as
// Radiologists: identity/license/schedule stay owned by Staff & Workforce,
// this joins in the radiology-specific "what are they doing right now" view.

export interface TechnologistRow {
  id: string;
  name: string;
  title: string;
  licenseNumber: string;
  status: "active" | "on-leave" | "inactive";
  schedule: string[];
  modalityCompetency: ModalityType[];
  currentRoomNumber?: string;
  currentStudy?: { orderNumber: string; patientName: string; studyName: string };
  availableToday: boolean;
}

export function getTechnologists() {
  const technologists = staffMembers.filter((s) => s.role === "technician" && s.department === "Radiology");
  const rows: TechnologistRow[] = technologists.map((t) => {
    const competency = new Set<ModalityType>();
    imagingStudies
      .filter((s) => s.technologistId === t.id)
      .forEach((s) => {
        const order = imagingOrders.find((o) => o.id === s.orderId);
        const procedure = order ? imagingProcedures.find((p) => p.code === order.procedureCode) : undefined;
        if (procedure) competency.add(procedure.modality);
      });
    const assignedRoom = radiologyRooms.find((r) => r.assignedStaffIds.includes(t.id));
    const activeOrder = imagingOrders.find((o) => o.technologistId === t.id && o.status === "in-progress");
    return {
      id: t.id,
      name: t.name,
      title: t.title,
      licenseNumber: t.licenseNumber,
      status: t.status,
      schedule: t.schedule,
      modalityCompetency: Array.from(competency),
      currentRoomNumber: assignedRoom?.number,
      currentStudy: activeOrder ? { orderNumber: activeOrder.orderNumber, patientName: resolvePatientName(activeOrder.patientId), studyName: resolveProcedureName(activeOrder.procedureCode) } : undefined,
      availableToday: isAvailableToday(t.schedule),
    };
  });
  return mockRequest(rows);
}

export interface NewRadiologyRoomInput {
  number: string;
  location: string;
  modalityId: string;
  capacity: number;
  operatingHours: string;
}

/** Rooms are hospital-configurable, never hardcoded (spec §14) — same lookup-table CRUD pattern as Modalities/Bed Types/Department Types. */
export function createRadiologyRoom(input: NewRadiologyRoomInput) {
  const room: RadiologyRoom = { ...input, id: `room-${input.number.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, status: "active", assignedStaffIds: [] };
  radiologyRooms.push(room);
  recordRadiologyAudit("Room created", "room", room.number, DEFAULT_ACTOR);
  return mockRequest(toRoomRow(room));
}

export function updateRadiologyRoom(id: string, updates: Partial<NewRadiologyRoomInput>) {
  const room = radiologyRooms.find((r) => r.id === id);
  if (!room) throw new Error("Room not found");
  Object.assign(room, updates);
  recordRadiologyAudit("Room updated", "room", room.number, DEFAULT_ACTOR);
  return mockRequest(toRoomRow(room));
}

export function setRoomStatus(id: string, status: "active" | "closed") {
  const room = radiologyRooms.find((r) => r.id === id);
  if (!room) throw new Error("Room not found");
  room.status = status;
  recordRadiologyAudit(`Room ${status === "active" ? "reopened" : "closed"}`, "room", room.number, DEFAULT_ACTOR);
  return mockRequest(toRoomRow(room));
}

export function assignRoomStaff(id: string, assignedStaffIds: string[]) {
  const room = radiologyRooms.find((r) => r.id === id);
  if (!room) throw new Error("Room not found");
  room.assignedStaffIds = assignedStaffIds;
  recordRadiologyAudit("Room staff assignment updated", "room", room.number, DEFAULT_ACTOR);
  return mockRequest(toRoomRow(room));
}

export interface ImagingProcedure {
  code: string;
  name: string;
  modality: ModalityType;
  bodySite: string;
  durationMinutes: number;
  preparation?: string;
  contrastRequired: boolean;
  price: number;
  active: boolean;
  billingCode?: string;
}

export const imagingProcedures: ImagingProcedure[] = [
  { code: "XR-CHEST", name: "XR Chest", modality: "xr", bodySite: "Chest", durationMinutes: 10, contrastRequired: false, price: 85, active: true, billingCode: "RAD-001" },
  { code: "CT-HEAD", name: "CT Head", modality: "ct", bodySite: "Head", durationMinutes: 15, contrastRequired: false, price: 450, active: true },
  { code: "CT-CHEST", name: "CT Chest", modality: "ct", bodySite: "Chest", durationMinutes: 15, preparation: "Contrast per clinical indication", contrastRequired: true, price: 550, active: true },
  { code: "CT-ABD", name: "CT Abdomen", modality: "ct", bodySite: "Abdomen", durationMinutes: 20, preparation: "Fasting 4 hours", contrastRequired: true, price: 600, active: true },
  { code: "MRI-BRAIN", name: "MRI Brain", modality: "mri", bodySite: "Brain", durationMinutes: 45, contrastRequired: false, price: 1800, active: true, billingCode: "RAD-002" },
  { code: "MRI-SPINE", name: "MRI Spine", modality: "mri", bodySite: "Spine", durationMinutes: 45, contrastRequired: false, price: 1800, active: true },
  { code: "US-ABD", name: "Ultrasound Abdomen", modality: "us", bodySite: "Abdomen", durationMinutes: 20, preparation: "Fasting 6 hours", contrastRequired: false, price: 180, active: true },
  { code: "MAMMO", name: "Mammography", modality: "mammography", bodySite: "Breast", durationMinutes: 15, contrastRequired: false, price: 220, active: true },
  { code: "DEXA", name: "DEXA", modality: "dexa", bodySite: "Whole Body", durationMinutes: 15, contrastRequired: false, price: 150, active: true },
];

function resolveProcedureName(code: string): string {
  return imagingProcedures.find((p) => p.code === code)?.name ?? code;
}

export interface NewImagingProcedureInput {
  code: string;
  name: string;
  modality: ModalityType;
  bodySite: string;
  durationMinutes: number;
  preparation?: string;
  contrastRequired: boolean;
  price: number;
  billingCode?: string;
}

/** Procedures are hospital-configurable, never hardcoded (spec §26) — same lookup-table CRUD pattern as Modalities/Rooms. Uses standardized coding via `code`, never inventing clinical terminology. */
export function createImagingProcedure(input: NewImagingProcedureInput) {
  const procedure: ImagingProcedure = { ...input, active: true };
  imagingProcedures.push(procedure);
  recordRadiologyAudit("Procedure created", "procedure", procedure.code, DEFAULT_ACTOR);
  return mockRequest(procedure);
}

export function updateImagingProcedure(code: string, updates: Partial<NewImagingProcedureInput>) {
  const procedure = imagingProcedures.find((p) => p.code === code);
  if (!procedure) throw new Error("Procedure not found");
  Object.assign(procedure, updates);
  recordRadiologyAudit("Procedure updated", "procedure", procedure.code, DEFAULT_ACTOR);
  return mockRequest(procedure);
}

export function setImagingProcedureActive(code: string, active: boolean) {
  const procedure = imagingProcedures.find((p) => p.code === code);
  if (!procedure) throw new Error("Procedure not found");
  procedure.active = active;
  recordRadiologyAudit(active ? "Procedure activated" : "Procedure deactivated", "procedure", procedure.code, DEFAULT_ACTOR);
  return mockRequest(procedure);
}

export function getImagingProcedures(filters: { includeInactive?: boolean } = {}) {
  return mockRequest(filters.includeInactive ? imagingProcedures : imagingProcedures.filter((p) => p.active));
}

// --- Protocols (spec §27) — clinical protocol content is authored by
// radiology personnel; the frontend just shows what protocol options exist
// per procedure, it doesn't gate them behind clinical logic. ---

export interface RadiologyProtocol {
  id: string;
  procedureCode: string;
  name: string;
  description?: string;
}

export const radiologyProtocols: RadiologyProtocol[] = [
  { id: "proto-ct-chest-nc", procedureCode: "CT-CHEST", name: "Without Contrast", description: "Standard non-contrast acquisition" },
  { id: "proto-ct-chest-c", procedureCode: "CT-CHEST", name: "With Contrast", description: "IV contrast-enhanced acquisition" },
  { id: "proto-ct-chest-hr", procedureCode: "CT-CHEST", name: "High Resolution", description: "Thin-slice HRCT for interstitial disease" },
  { id: "proto-mri-brain-std", procedureCode: "MRI-BRAIN", name: "Standard", description: "Routine multi-sequence brain protocol" },
  { id: "proto-mri-brain-c", procedureCode: "MRI-BRAIN", name: "Contrast", description: "Gadolinium-enhanced sequences added" },
  { id: "proto-mri-brain-sp", procedureCode: "MRI-BRAIN", name: "Specialized Protocol", description: "Seizure/epilepsy-focused sequence set" },
];

export interface RadiologyProtocolRow extends RadiologyProtocol {
  procedureName: string;
}

export function getProtocols() {
  return mockRequest(radiologyProtocols.map((p) => ({ ...p, procedureName: resolveProcedureName(p.procedureCode) })));
}

export interface NewProtocolInput {
  procedureCode: string;
  name: string;
  description?: string;
}

export function createProtocol(input: NewProtocolInput) {
  const protocol: RadiologyProtocol = { ...input, id: `proto-${input.procedureCode.toLowerCase()}-${radiologyProtocols.length}` };
  radiologyProtocols.push(protocol);
  recordRadiologyAudit("Protocol created", "protocol", protocol.id, DEFAULT_ACTOR);
  return mockRequest(protocol);
}

export function updateProtocol(id: string, updates: Partial<NewProtocolInput>) {
  const protocol = radiologyProtocols.find((p) => p.id === id);
  if (!protocol) throw new Error("Protocol not found");
  Object.assign(protocol, updates);
  recordRadiologyAudit("Protocol updated", "protocol", protocol.id, DEFAULT_ACTOR);
  return mockRequest(protocol);
}

export function deleteProtocol(id: string) {
  const index = radiologyProtocols.findIndex((p) => p.id === id);
  if (index !== -1) radiologyProtocols.splice(index, 1);
  recordRadiologyAudit("Protocol deleted", "protocol", id, DEFAULT_ACTOR);
  return mockRequest(true);
}

// --- Imaging Orders — FHIR ServiceRequest ------------------------------------

export type ImagingOrderStatus =
  | "ordered"
  | "pending-authorization"
  | "authorized"
  | "scheduled"
  | "checked-in"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show"
  | "on-hold";

export type ImagingOrderPriority = "stat" | "urgent" | "asap" | "routine";
export type ImagingAuthorizationStatus = "not-required" | "pending" | "approved" | "rejected";

export interface ImagingOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  orderingPractitionerId: string;
  departmentId: string;
  procedureCode: string;
  priority: ImagingOrderPriority;
  reasonForExam: string;
  clinicalHistory?: string;
  orderedDateTime: string;
  status: ImagingOrderStatus;
  authorizationStatus: ImagingAuthorizationStatus;
  authorizationNumber?: string;
  payerName?: string;
  scheduledDateTime?: string;
  roomId?: string;
  modalityId?: string;
  technologistId?: string;
  radiologistId?: string;
  cancelledReason?: string;
  onHoldReason?: string;
  // Workflow timeline (spec §8) — each set only once that stage is actually
  // reached, so Order Details can render a real timeline instead of a
  // generic status label.
  authorizedAt?: string;
  checkedInAt?: string;
  studyStartedAt?: string;
  studyCompletedAt?: string;
  // Scheduling preparation checklist (spec §10) — captured, never validated
  // against clinical rules here (that's explicitly backend/protocol territory).
  contrastRequired?: boolean;
  fastingRequired?: boolean;
  specialPreparation?: string;
  lastActionBy?: string;
  lastActionAt?: string;
}

export const imagingOrders: ImagingOrder[] = [
  { id: "rad-order-1", orderNumber: "RAD-2026-0001", patientId: "p-ibrar-ahmad", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", procedureCode: "CT-CHEST", priority: "routine", reasonForExam: "Pre-procedure cardiac workup", clinicalHistory: "Atypical chest pain, rule out structural abnormality", orderedDateTime: "2026-08-12T08:00:00", status: "completed", authorizationStatus: "approved", authorizationNumber: "AUTH-78210", payerName: "State Life Health", scheduledDateTime: "2026-08-12T09:00:00", roomId: "room-r01", modalityId: "mod-ct-01", technologistId: "ali-rasheed", radiologistId: "farah-chaudhry", authorizedAt: "2026-08-12T08:15:00", checkedInAt: "2026-08-12T08:50:00", studyStartedAt: "2026-08-12T09:00:00", studyCompletedAt: "2026-08-12T09:20:00", contrastRequired: true },
  { id: "rad-order-2", orderNumber: "RAD-2026-0002", patientId: "p-fatima-sheikh", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", procedureCode: "MRI-BRAIN", priority: "routine", reasonForExam: "Recurrent headaches", orderedDateTime: "2026-08-13T10:00:00", status: "completed", authorizationStatus: "approved", authorizationNumber: "AUTH-78233", payerName: "Jubilee Health", scheduledDateTime: "2026-08-13T11:00:00", roomId: "room-r02", modalityId: "mod-mri-01", technologistId: "elena-rostova", radiologistId: "farah-chaudhry", authorizedAt: "2026-08-13T10:20:00", checkedInAt: "2026-08-13T10:50:00", studyStartedAt: "2026-08-13T11:00:00", studyCompletedAt: "2026-08-13T11:30:00" },
  { id: "rad-order-3", orderNumber: "RAD-2026-0003", patientId: "p-zara-malik", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", procedureCode: "CT-HEAD", priority: "stat", reasonForExam: "Acute neurological deficit", clinicalHistory: "Sudden onset right-sided weakness", orderedDateTime: "2026-08-14T07:00:00", status: "completed", authorizationStatus: "not-required", scheduledDateTime: "2026-08-14T07:30:00", roomId: "room-r01", modalityId: "mod-ct-01", technologistId: "ali-rasheed", radiologistId: "farah-chaudhry", checkedInAt: "2026-08-14T07:20:00", studyStartedAt: "2026-08-14T07:30:00", studyCompletedAt: "2026-08-14T07:45:00" },
  { id: "rad-order-4", orderNumber: "RAD-2026-0004", patientId: "p-ayesha-raza", orderingPractitionerId: "robert-vance", departmentId: "dept-neurology", procedureCode: "MRI-SPINE", priority: "urgent", reasonForExam: "Lower back pain with radiculopathy", orderedDateTime: "2026-08-14T08:30:00", status: "in-progress", authorizationStatus: "approved", authorizationNumber: "AUTH-78261", payerName: "EFU Health", scheduledDateTime: "2026-08-14T09:00:00", roomId: "room-r02", modalityId: "mod-mri-01", technologistId: "elena-rostova", authorizedAt: "2026-08-14T08:35:00", checkedInAt: "2026-08-14T08:50:00", studyStartedAt: "2026-08-14T09:05:00" },
  { id: "rad-order-5", orderNumber: "RAD-2026-0005", patientId: "p-kamal-siddiqui", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", procedureCode: "XR-CHEST", priority: "routine", reasonForExam: "Annual occupational health screening", orderedDateTime: "2026-08-14T09:00:00", status: "checked-in", authorizationStatus: "not-required", scheduledDateTime: "2026-08-14T09:30:00", roomId: "room-r03", modalityId: "mod-xr-01", technologistId: "ali-rasheed", checkedInAt: "2026-08-14T09:25:00" },
  { id: "rad-order-6", orderNumber: "RAD-2026-0006", patientId: "p-usman-khan", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", procedureCode: "US-ABD", priority: "routine", reasonForExam: "Abdominal discomfort", orderedDateTime: "2026-08-14T09:15:00", status: "scheduled", authorizationStatus: "approved", authorizationNumber: "AUTH-78277", payerName: "State Life Health", scheduledDateTime: "2026-08-14T14:00:00", roomId: "room-r04", modalityId: "mod-us-01", technologistId: "elena-rostova", authorizedAt: "2026-08-14T09:30:00", fastingRequired: true },
  { id: "rad-order-7", orderNumber: "RAD-2026-0007", patientId: "p-noor-fatima", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", procedureCode: "XR-CHEST", priority: "routine", reasonForExam: "Persistent cough", orderedDateTime: "2026-08-13T14:00:00", status: "scheduled", authorizationStatus: "not-required", scheduledDateTime: "2026-08-14T10:30:00", roomId: "room-r03", modalityId: "mod-xr-01", technologistId: "ali-rasheed" },
  { id: "rad-order-8", orderNumber: "RAD-2026-0008", patientId: "p-hamza-butt", orderingPractitionerId: "robert-vance", departmentId: "dept-neurology", procedureCode: "CT-ABD", priority: "routine", reasonForExam: "Follow-up post-surgical evaluation", orderedDateTime: "2026-08-14T10:00:00", status: "authorized", authorizationStatus: "approved", authorizationNumber: "AUTH-78291", payerName: "EFU Health", authorizedAt: "2026-08-14T10:15:00" },
  { id: "rad-order-9", orderNumber: "RAD-2026-0009", patientId: "p-saira-cheema", orderingPractitionerId: "robert-vance", departmentId: "dept-neurology", procedureCode: "CT-HEAD", priority: "stat", reasonForExam: "Head trauma", orderedDateTime: "2026-08-14T10:30:00", status: "pending-authorization", authorizationStatus: "pending", payerName: "State Life Health" },
  { id: "rad-order-10", orderNumber: "RAD-2026-0010", patientId: "p-omar-sethi", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", procedureCode: "MAMMO", priority: "routine", reasonForExam: "Routine screening", orderedDateTime: "2026-08-14T11:00:00", status: "ordered", authorizationStatus: "not-required" },
  { id: "rad-order-11", orderNumber: "RAD-2026-0011", patientId: "p-layla-awan", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", procedureCode: "DEXA", priority: "routine", reasonForExam: "Osteoporosis screening", orderedDateTime: "2026-08-14T11:15:00", status: "ordered", authorizationStatus: "not-required" },
  { id: "rad-order-12", orderNumber: "RAD-2026-0012", patientId: "p-rashid-qureshi", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", procedureCode: "CT-CHEST", priority: "routine", reasonForExam: "Pre-operative assessment", orderedDateTime: "2026-08-13T09:00:00", status: "cancelled", authorizationStatus: "approved", authorizationNumber: "AUTH-78201", scheduledDateTime: "2026-08-13T13:00:00", roomId: "room-r01", modalityId: "mod-ct-01", cancelledReason: "Patient declined", authorizedAt: "2026-08-13T09:20:00" },
  { id: "rad-order-13", orderNumber: "RAD-2026-0013", patientId: "p-bilal-hussain", orderingPractitionerId: "robert-vance", departmentId: "dept-icu", procedureCode: "XR-CHEST", priority: "urgent", reasonForExam: "Line placement confirmation", orderedDateTime: "2026-08-13T15:00:00", status: "no-show", authorizationStatus: "not-required", scheduledDateTime: "2026-08-13T16:00:00", roomId: "room-r03", modalityId: "mod-xr-01", technologistId: "ali-rasheed" },
  { id: "rad-order-14", orderNumber: "RAD-2026-0014", patientId: "p-elena-rodriguez", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", procedureCode: "MRI-BRAIN", priority: "routine", reasonForExam: "Syncope workup", orderedDateTime: "2026-08-12T16:00:00", status: "on-hold", authorizationStatus: "pending", onHoldReason: "Pending pacemaker MRI-safety clearance" },
];

// --- Studies — FHIR ImagingStudy ----------------------------------------------

export interface ImagingStudy {
  id: string;
  orderId: string;
  performedDateTime: string;
  technologistId: string;
  seriesCount: number;
  imageCount: number;
  status: "available" | "pending";
  // DICOM/technical (spec §18/§20) — kept under an Advanced/Technical section
  // in the UI, never surfaced to ordinary users by default.
  studyInstanceUID: string;
  seriesInstanceUID: string;
  pacsTransferStatus: "success" | "pending" | "failed";
}

export const imagingStudies: ImagingStudy[] = [
  { id: "rad-study-1", orderId: "rad-order-1", performedDateTime: "2026-08-12T09:20:00", technologistId: "ali-rasheed", seriesCount: 4, imageCount: 220, status: "available", studyInstanceUID: "1.2.826.0.1.3680043.8.498.10001", seriesInstanceUID: "1.2.826.0.1.3680043.8.498.20001", pacsTransferStatus: "success" },
  { id: "rad-study-2", orderId: "rad-order-2", performedDateTime: "2026-08-13T11:30:00", technologistId: "elena-rostova", seriesCount: 6, imageCount: 450, status: "available", studyInstanceUID: "1.2.826.0.1.3680043.8.498.10002", seriesInstanceUID: "1.2.826.0.1.3680043.8.498.20002", pacsTransferStatus: "success" },
  { id: "rad-study-3", orderId: "rad-order-3", performedDateTime: "2026-08-14T07:45:00", technologistId: "ali-rasheed", seriesCount: 3, imageCount: 180, status: "available", studyInstanceUID: "1.2.826.0.1.3680043.8.498.10003", seriesInstanceUID: "1.2.826.0.1.3680043.8.498.20003", pacsTransferStatus: "success" },
];

// --- Reports — FHIR DiagnosticReport -------------------------------------------

export type RadiologyReportStatus = "draft" | "preliminary" | "final" | "amended";

export interface RadiologyReport {
  id: string;
  studyId: string;
  orderId: string;
  patientId: string;
  radiologistId: string;
  status: RadiologyReportStatus;
  technique?: string;
  findings?: string;
  impression?: string;
  recommendation?: string;
  effectiveDateTime: string;
  issuedDateTime?: string;
}

export const radiologyReports: RadiologyReport[] = [
  { id: "rad-report-1", studyId: "rad-study-1", orderId: "rad-order-1", patientId: "p-ibrar-ahmad", radiologistId: "farah-chaudhry", status: "final", technique: "Contrast-enhanced CT chest, axial acquisition.", findings: "No acute cardiopulmonary process. No pulmonary embolism. Heart size normal.", impression: "Normal contrast-enhanced chest CT.", effectiveDateTime: "2026-08-12T09:20:00", issuedDateTime: "2026-08-12T11:30:00" },
  { id: "rad-report-2", studyId: "rad-study-2", orderId: "rad-order-2", patientId: "p-fatima-sheikh", radiologistId: "farah-chaudhry", status: "preliminary", findings: "Preliminary review in progress — pending final radiologist sign-off.", effectiveDateTime: "2026-08-13T11:30:00" },
  { id: "rad-report-3", studyId: "rad-study-3", orderId: "rad-order-3", patientId: "p-zara-malik", radiologistId: "farah-chaudhry", status: "draft", findings: "Acute intracranial hemorrhage identified, right parietal region, approximately 2.1 cm.", impression: "CRITICAL — acute intracranial hemorrhage. Recommend immediate clinical correlation and neurosurgical consult.", effectiveDateTime: "2026-08-14T07:45:00" },
];

// --- Critical Findings ---------------------------------------------------------

export type CriticalFindingNotificationStatus = "pending" | "sent" | "acknowledged";

export interface CriticalFinding {
  id: string;
  reportId: string;
  orderId: string;
  patientId: string;
  finding: string;
  radiologistId: string;
  notifiedClinicianId?: string;
  notificationStatus: CriticalFindingNotificationStatus;
  flaggedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  escalationNote?: string;
}

export const criticalFindings: CriticalFinding[] = [
  { id: "rad-crit-1", reportId: "rad-report-3", orderId: "rad-order-3", patientId: "p-zara-malik", finding: "Acute intracranial hemorrhage, right parietal region", radiologistId: "farah-chaudhry", notifiedClinicianId: "sarah-jenkins", notificationStatus: "sent", flaggedAt: "2026-08-14T08:00:00" },
];

// --- Read views ----------------------------------------------------------------

function resolvePatientName(patientId: string): string {
  return patientSeeds.find((p) => p.id === patientId)?.fullName ?? "Unknown Patient";
}

export interface ImagingOrderRow {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  studyName: string;
  modality?: ModalityType;
  priority: ImagingOrderPriority;
  orderingPractitionerName: string;
  departmentName: string;
  orderedDateTime: string;
  scheduledDateTime?: string;
  roomNumber?: string;
  technologistName?: string;
  status: ImagingOrderStatus;
  authorizationStatus: ImagingAuthorizationStatus;
  lastActionBy?: string;
  lastActionAt?: string;
}

function toImagingOrderRow(o: ImagingOrder): ImagingOrderRow {
  const procedure = imagingProcedures.find((p) => p.code === o.procedureCode);
  const department = departmentConfigs.find((d) => d.id === o.departmentId);
  const room = o.roomId ? radiologyRooms.find((r) => r.id === o.roomId) : undefined;
  const technologist = o.technologistId ? staffMembers.find((s) => s.id === o.technologistId) : undefined;
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    patientId: o.patientId,
    patientName: resolvePatientName(o.patientId),
    studyName: resolveProcedureName(o.procedureCode),
    modality: procedure?.modality,
    priority: o.priority,
    orderingPractitionerName: resolveHeadName(o.orderingPractitionerId),
    departmentName: department?.name ?? "Unknown",
    orderedDateTime: o.orderedDateTime,
    scheduledDateTime: o.scheduledDateTime,
    roomNumber: room?.number,
    technologistName: technologist?.name,
    status: o.status,
    authorizationStatus: o.authorizationStatus,
    lastActionBy: o.lastActionBy,
    lastActionAt: o.lastActionAt,
  };
}

export function getImagingOrders(filters: { status?: ImagingOrderStatus; priority?: ImagingOrderPriority; search?: string } = {}) {
  const search = filters.search?.trim().toLowerCase();
  const rows = imagingOrders
    .filter((o) => !filters.status || o.status === filters.status)
    .filter((o) => !filters.priority || o.priority === filters.priority)
    .map(toImagingOrderRow)
    .filter((r) => !search || r.patientName.toLowerCase().includes(search) || r.orderNumber.toLowerCase().includes(search))
    .sort((a, b) => (a.orderedDateTime < b.orderedDateTime ? 1 : -1));
  return mockRequest(rows);
}

/** Parses a room's "HH:MM–HH:MM" operating window into total minutes — the real denominator behind Utilization, never a fabricated percent. */
function operatingMinutes(operatingHours: string): number {
  const [start, end] = operatingHours.split("–");
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export interface ModalityRow extends RadiologyModality {
  roomNumber?: string;
  studiesToday: number;
  utilizationPercent: number;
}

function toModalityRow(m: RadiologyModality): ModalityRow {
  const room = radiologyRooms.find((r) => r.id === m.roomId);
  const todaysOrders = imagingOrders.filter((o) => o.modalityId === m.id && o.scheduledDateTime?.startsWith(TODAY) && o.status !== "cancelled");
  const scheduledMinutes = todaysOrders.reduce((sum, o) => sum + (imagingProcedures.find((p) => p.code === o.procedureCode)?.durationMinutes ?? 0), 0);
  const capacityMinutes = room ? operatingMinutes(room.operatingHours) : 0;
  return {
    ...m,
    roomNumber: room?.number,
    studiesToday: todaysOrders.length,
    utilizationPercent: capacityMinutes > 0 ? Math.round((scheduledMinutes / capacityMinutes) * 100) : 0,
  };
}

export function getModalities() {
  return mockRequest(radiologyModalities.map(toModalityRow));
}

export interface NewModalityInput {
  name: string;
  type: ModalityType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  roomId: string;
  aeTitle: string;
  ipAddress: string;
  pacsDestination: string;
  nextMaintenance: string;
  installationDate?: string;
  warrantyExpiration?: string;
}

/** Modalities are hospital-configurable, never hardcoded (spec §12) — same lookup-table CRUD pattern as Bed Types/Department Types. */
export function createModality(input: NewModalityInput) {
  const modality: RadiologyModality = {
    ...input,
    id: `mod-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    departmentId: "dept-radiology",
    status: "operational",
    lastMaintenance: TODAY,
    installationDate: input.installationDate ?? TODAY,
    warrantyExpiration: input.warrantyExpiration ?? `${Number(TODAY.slice(0, 4)) + 5}${TODAY.slice(4)}`,
  };
  radiologyModalities.push(modality);
  recordRadiologyAudit("Modality created", "modality", modality.name, DEFAULT_ACTOR);
  return mockRequest(toModalityRow(modality));
}

export function updateModality(id: string, updates: Partial<NewModalityInput>) {
  const modality = radiologyModalities.find((m) => m.id === id);
  if (!modality) throw new Error("Modality not found");
  Object.assign(modality, updates);
  recordRadiologyAudit("Modality updated", "modality", modality.name, DEFAULT_ACTOR);
  return mockRequest(toModalityRow(modality));
}

export function setModalityStatus(id: string, status: ModalityStatus) {
  const modality = radiologyModalities.find((m) => m.id === id);
  if (!modality) throw new Error("Modality not found");
  modality.status = status;
  if (status === "operational") modality.lastMaintenance = TODAY;
  recordRadiologyAudit(`Status changed to ${status}`, "modality", modality.name, DEFAULT_ACTOR);
  return mockRequest(toModalityRow(modality));
}

// --- Order Details (spec §8) — full detail + workflow timeline --------------

export interface TimelineStage {
  stage: string;
  at?: string;
  done: boolean;
}

function buildTimeline(o: ImagingOrder, report?: RadiologyReport): TimelineStage[] {
  const stages: { stage: string; at?: string }[] = [{ stage: "Order Created", at: o.orderedDateTime }];
  if (o.authorizationStatus !== "not-required") stages.push({ stage: "Authorization", at: o.authorizedAt });
  stages.push({ stage: "Scheduled", at: o.scheduledDateTime });
  stages.push({ stage: "Checked In", at: o.checkedInAt });
  stages.push({ stage: "Study Started", at: o.studyStartedAt });
  stages.push({ stage: "Study Completed", at: o.studyCompletedAt });
  stages.push({ stage: "Report Drafted", at: report?.effectiveDateTime });
  stages.push({ stage: "Report Finalized", at: report && (report.status === "final" || report.status === "amended") ? report.issuedDateTime : undefined });
  return stages.map((s) => ({ ...s, done: Boolean(s.at) }));
}

export interface ImagingOrderDetail extends ImagingOrderRow {
  reasonForExam: string;
  clinicalHistory?: string;
  authorizationNumber?: string;
  payerName?: string;
  cancelledReason?: string;
  onHoldReason?: string;
  contrastRequired?: boolean;
  fastingRequired?: boolean;
  specialPreparation?: string;
  radiologistName?: string;
  timeline: TimelineStage[];
  studyId?: string;
  reportId?: string;
  reportStatus?: RadiologyReportStatus;
  hasCriticalFinding: boolean;
}

export function getImagingOrder(id: string) {
  const order = imagingOrders.find((o) => o.id === id);
  if (!order) return mockRequest(null as ImagingOrderDetail | null);
  const row = toImagingOrderRow(order);
  const study = imagingStudies.find((s) => s.orderId === id);
  const report = radiologyReports.find((r) => r.orderId === id);
  const radiologist = order.radiologistId ? staffMembers.find((s) => s.id === order.radiologistId) : undefined;
  const detail: ImagingOrderDetail = {
    ...row,
    reasonForExam: order.reasonForExam,
    clinicalHistory: order.clinicalHistory,
    authorizationNumber: order.authorizationNumber,
    payerName: order.payerName,
    cancelledReason: order.cancelledReason,
    onHoldReason: order.onHoldReason,
    contrastRequired: order.contrastRequired,
    fastingRequired: order.fastingRequired,
    specialPreparation: order.specialPreparation,
    radiologistName: radiologist?.name,
    timeline: buildTimeline(order, report),
    studyId: study?.id,
    reportId: report?.id,
    reportStatus: report?.status,
    hasCriticalFinding: criticalFindings.some((c) => c.orderId === id && c.notificationStatus !== "acknowledged"),
  };
  return mockRequest(detail);
}

// --- Administrative actions (spec §8-11) — workflow/logistics only, never
// clinical authorship. Every function below moves an order through the
// status flow from spec §41; none of them write Findings/Impression text.

function findImagingOrderOrThrow(id: string): ImagingOrder {
  const order = imagingOrders.find((o) => o.id === id);
  if (!order) throw new Error(`Imaging order ${id} not found`);
  return order;
}

export function authorizeImagingOrder(id: string, decision: "approved" | "rejected", authorizationNumber?: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  order.authorizationStatus = decision;
  if (decision === "approved") {
    order.authorizationNumber = authorizationNumber;
    order.authorizedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
    order.status = "authorized";
  }
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit(`Authorization ${decision}`, "order", order.orderNumber, actor);
  return mockRequest(toImagingOrderRow(order));
}

export function cancelImagingOrder(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  if (order.status === "completed") throw new Error("A completed order cannot be cancelled");
  order.status = "cancelled";
  order.cancelledReason = reason;
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Order cancelled", "order", order.orderNumber, actor, reason);
  return mockRequest(toImagingOrderRow(order));
}

export function putImagingOrderOnHold(id: string, reason: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  order.status = "on-hold";
  order.onHoldReason = reason;
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Order put on hold", "order", order.orderNumber, actor, reason);
  return mockRequest(toImagingOrderRow(order));
}

export function releaseImagingOrderHold(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  order.onHoldReason = undefined;
  order.status = order.scheduledDateTime ? "scheduled" : order.authorizationStatus === "approved" || order.authorizationStatus === "not-required" ? "authorized" : "pending-authorization";
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Hold released", "order", order.orderNumber, actor);
  return mockRequest(toImagingOrderRow(order));
}

export interface ScheduleImagingOrderInput {
  scheduledDateTime: string;
  roomId: string;
  modalityId: string;
  technologistId?: string;
  radiologistId?: string;
  contrastRequired?: boolean;
  fastingRequired?: boolean;
  specialPreparation?: string;
}

/** Scheduling modal (spec §10) — preparation fields are captured as-entered, never validated against clinical rules here. */
export function scheduleImagingOrder(id: string, input: ScheduleImagingOrderInput, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  Object.assign(order, input);
  order.status = "scheduled";
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Order scheduled", "order", order.orderNumber, actor);
  return mockRequest(toImagingOrderRow(order));
}

export function checkInImagingOrder(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  order.status = "checked-in";
  order.checkedInAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Patient checked in", "order", order.orderNumber, actor);
  return mockRequest(toImagingOrderRow(order));
}

export function markImagingNoShow(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  order.status = "no-show";
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Marked no-show", "order", order.orderNumber, actor);
  return mockRequest(toImagingOrderRow(order));
}

/** Logs that acquisition began — administrative/technologist logistics, not clinical content. */
export function startImagingStudy(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  order.status = "in-progress";
  order.studyStartedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Study started", "order", order.orderNumber, actor);
  return mockRequest(toImagingOrderRow(order));
}

/** Logs that acquisition finished and creates the ImagingStudy record (series/image counts, DICOM identifiers) — still no clinical interpretation; the report stays separate and, if any, pre-existing. */
export function completeImagingStudy(id: string, actor: string = DEFAULT_ACTOR) {
  const order = findImagingOrderOrThrow(id);
  order.status = "completed";
  order.studyCompletedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  if (!imagingStudies.some((s) => s.orderId === id)) {
    const seq = imagingStudies.length + 1;
    imagingStudies.push({
      id: `rad-study-${seq}`,
      orderId: id,
      performedDateTime: order.studyCompletedAt,
      technologistId: order.technologistId ?? "ali-rasheed",
      seriesCount: Math.floor(Math.random() * 4) + 2,
      imageCount: Math.floor(Math.random() * 300) + 80,
      status: "available",
      studyInstanceUID: `1.2.826.0.1.3680043.8.498.1000${seq}`,
      seriesInstanceUID: `1.2.826.0.1.3680043.8.498.2000${seq}`,
      pacsTransferStatus: "success",
    });
  }
  order.lastActionBy = actor;
  order.lastActionAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  recordRadiologyAudit("Study completed", "order", order.orderNumber, actor);
  return mockRequest(toImagingOrderRow(order));
}

// --- Studies (spec §17-18) -----------------------------------------------------

export interface ImagingStudyRow {
  id: string;
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  modality?: ModalityType;
  studyName: string;
  performedDateTime: string;
  technologistName: string;
  seriesCount: number;
  imageCount: number;
  status: "available" | "pending";
}

function toImagingStudyRow(s: ImagingStudy): ImagingStudyRow {
  const order = imagingOrders.find((o) => o.id === s.orderId);
  const procedure = order ? imagingProcedures.find((p) => p.code === order.procedureCode) : undefined;
  const technologist = staffMembers.find((m) => m.id === s.technologistId);
  return {
    id: s.id,
    orderId: s.orderId,
    orderNumber: order?.orderNumber ?? "—",
    patientId: order?.patientId ?? "",
    patientName: order ? resolvePatientName(order.patientId) : "Unknown",
    modality: procedure?.modality,
    studyName: order ? resolveProcedureName(order.procedureCode) : "Unknown",
    performedDateTime: s.performedDateTime,
    technologistName: technologist?.name ?? "Unknown",
    seriesCount: s.seriesCount,
    imageCount: s.imageCount,
    status: s.status,
  };
}

export function getImagingStudies(filters: { search?: string } = {}) {
  const search = filters.search?.trim().toLowerCase();
  const rows = imagingStudies
    .map(toImagingStudyRow)
    .filter((r) => !search || r.patientName.toLowerCase().includes(search) || r.orderNumber.toLowerCase().includes(search))
    .sort((a, b) => (a.performedDateTime < b.performedDateTime ? 1 : -1));
  return mockRequest(rows);
}

export interface ImagingStudyDetail extends ImagingStudyRow {
  bodySite: string;
  referringPractitionerName: string;
  patientDob: string;
  patientSex: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  pacsTransferStatus: string;
}

export function getImagingStudy(id: string) {
  const study = imagingStudies.find((s) => s.id === id);
  if (!study) return mockRequest(null as ImagingStudyDetail | null);
  const row = toImagingStudyRow(study);
  const order = imagingOrders.find((o) => o.id === study.orderId);
  const procedure = order ? imagingProcedures.find((p) => p.code === order.procedureCode) : undefined;
  const patient = patientSeeds.find((p) => p.id === order?.patientId);
  const detail: ImagingStudyDetail = {
    ...row,
    bodySite: procedure?.bodySite ?? "—",
    referringPractitionerName: order ? resolveHeadName(order.orderingPractitionerId) : "Unknown",
    patientDob: patient?.dob ?? "—",
    patientSex: patient?.gender ?? "unknown",
    studyInstanceUID: study.studyInstanceUID,
    seriesInstanceUID: study.seriesInstanceUID,
    pacsTransferStatus: study.pacsTransferStatus,
  };
  return mockRequest(detail);
}

// --- Reports (spec §21-22) — view-only, never authored/finalized from here ----

export interface RadiologyReportRow {
  id: string;
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  studyName: string;
  radiologistName: string;
  status: RadiologyReportStatus;
  effectiveDateTime: string;
  issuedDateTime?: string;
}

function toRadiologyReportRow(r: RadiologyReport): RadiologyReportRow {
  const order = imagingOrders.find((o) => o.id === r.orderId);
  const radiologist = staffMembers.find((s) => s.id === r.radiologistId);
  return {
    id: r.id,
    orderId: r.orderId,
    orderNumber: order?.orderNumber ?? "—",
    patientId: r.patientId,
    patientName: resolvePatientName(r.patientId),
    studyName: order ? resolveProcedureName(order.procedureCode) : "Unknown",
    radiologistName: radiologist?.name ?? "Unknown",
    status: r.status,
    effectiveDateTime: r.effectiveDateTime,
    issuedDateTime: r.issuedDateTime,
  };
}

export function getRadiologyReports(filters: { status?: RadiologyReportStatus; search?: string } = {}) {
  const search = filters.search?.trim().toLowerCase();
  const rows = radiologyReports
    .filter((r) => !filters.status || r.status === filters.status)
    .map(toRadiologyReportRow)
    .filter((r) => !search || r.patientName.toLowerCase().includes(search) || r.orderNumber.toLowerCase().includes(search))
    .sort((a, b) => (a.effectiveDateTime < b.effectiveDateTime ? 1 : -1));
  return mockRequest(rows);
}

export interface RadiologyReportDetail extends RadiologyReportRow {
  technique?: string;
  findings?: string;
  impression?: string;
  recommendation?: string;
  hasCriticalFinding: boolean;
}

export function getRadiologyReport(id: string) {
  const report = radiologyReports.find((r) => r.id === id);
  if (!report) return mockRequest(null as RadiologyReportDetail | null);
  const row = toRadiologyReportRow(report);
  const detail: RadiologyReportDetail = {
    ...row,
    technique: report.technique,
    findings: report.findings,
    impression: report.impression,
    recommendation: report.recommendation,
    hasCriticalFinding: criticalFindings.some((c) => c.reportId === id),
  };
  return mockRequest(detail);
}

// --- Critical Findings (spec §23) — acknowledgment is the one workflow action
// this section owns end to end, same reasoning as Laboratory's Critical Results. ---

export interface CriticalFindingRow extends CriticalFinding {
  patientName: string;
  orderNumber: string;
  radiologistName: string;
  notifiedClinicianName?: string;
}

function toCriticalFindingRow(c: CriticalFinding): CriticalFindingRow {
  const order = imagingOrders.find((o) => o.id === c.orderId);
  const radiologist = staffMembers.find((s) => s.id === c.radiologistId);
  const clinician = c.notifiedClinicianId ? staffMembers.find((s) => s.id === c.notifiedClinicianId) : undefined;
  return {
    ...c,
    patientName: resolvePatientName(c.patientId),
    orderNumber: order?.orderNumber ?? "—",
    radiologistName: radiologist?.name ?? "Unknown",
    notifiedClinicianName: clinician?.name,
  };
}

export function getCriticalFindingsList(filters: { openOnly?: boolean } = {}) {
  const rows = criticalFindings
    .filter((c) => !filters.openOnly || c.notificationStatus !== "acknowledged")
    .map(toCriticalFindingRow)
    .sort((a, b) => (a.flaggedAt < b.flaggedAt ? 1 : -1));
  return mockRequest(rows);
}

export function acknowledgeRadiologyCriticalFinding(id: string, actor: string = DEFAULT_ACTOR, note?: string) {
  const finding = criticalFindings.find((c) => c.id === id);
  if (!finding) throw new Error("Critical finding not found");
  finding.notificationStatus = "acknowledged";
  finding.acknowledgedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  finding.acknowledgedBy = actor;
  finding.escalationNote = note;
  recordRadiologyAudit("Critical finding acknowledged", "critical-finding", finding.id, actor, note);
  return mockRequest(finding);
}

// --- Dashboard (Phase 1) --------------------------------------------------------

function hoursBetween(startIso: string, endIso: string): number {
  return (new Date(endIso).getTime() - new Date(startIso).getTime()) / (1000 * 60 * 60);
}

export interface RadiologyDashboardData {
  ordersToday: number;
  scheduled: number;
  waiting: number;
  inProgress: number;
  completed: number;
  awaitingReport: number;
  criticalOpen: number;
  equipmentAlerts: number;
  workflow: { orders: number; scheduled: number; checkedIn: number; inProgress: number; completed: number; reporting: number; final: number };
  byModality: { modality: string; count: number }[];
  modalityUtilization: { name: string; status: ModalityStatus; studiesToday: number }[];
  pendingReportsByBucket: { bucket: string; count: number }[];
  alerts: { severity: "critical" | "warning" | "caution" | "info"; text: string }[];
}

export function getRadiologyDashboard() {
  const ordersToday = imagingOrders.filter((o) => o.orderedDateTime.startsWith(TODAY)).length;
  const scheduled = imagingOrders.filter((o) => o.status === "scheduled").length;
  const waiting = imagingOrders.filter((o) => o.status === "checked-in").length;
  const inProgress = imagingOrders.filter((o) => o.status === "in-progress").length;
  const completed = imagingOrders.filter((o) => o.status === "completed").length;

  const pendingReports = radiologyReports.filter((r) => r.status === "draft" || r.status === "preliminary");
  // Completed orders with no report at all yet (e.g. just completed via the
  // Worklist) count as awaiting too, not just orders with an existing draft/
  // preliminary report record.
  const completedWithoutReport = imagingOrders.filter((o) => o.status === "completed" && !radiologyReports.some((r) => r.orderId === o.id)).length;
  const awaitingReport = pendingReports.length + completedWithoutReport;
  const criticalOpen = criticalFindings.filter((c) => c.notificationStatus !== "acknowledged").length;
  const equipmentAlerts = radiologyModalities.filter((m) => m.status !== "operational").length;

  const finalReports = radiologyReports.filter((r) => r.status === "final" || r.status === "amended").length;

  const byModalityMap = new Map<ModalityType, number>();
  imagingOrders
    .filter((o) => o.status !== "cancelled")
    .forEach((o) => {
      const procedure = imagingProcedures.find((p) => p.code === o.procedureCode);
      if (procedure) byModalityMap.set(procedure.modality, (byModalityMap.get(procedure.modality) ?? 0) + 1);
    });

  const pendingReportsByBucket = [
    { bucket: "< 2 hours", count: 0 },
    { bucket: "2–6 hours", count: 0 },
    { bucket: "6–12 hours", count: 0 },
    { bucket: "> 12 hours", count: 0 },
  ];
  pendingReports.forEach((r) => {
    const hours = hoursBetween(r.effectiveDateTime, NOW);
    if (hours < 2) pendingReportsByBucket[0].count += 1;
    else if (hours < 6) pendingReportsByBucket[1].count += 1;
    else if (hours < 12) pendingReportsByBucket[2].count += 1;
    else pendingReportsByBucket[3].count += 1;
  });

  const alerts: RadiologyDashboardData["alerts"] = [];
  if (criticalOpen > 0) alerts.push({ severity: "critical", text: `${criticalOpen} critical result${criticalOpen > 1 ? "s" : ""} pending acknowledgement` });
  radiologyModalities
    .filter((m) => m.status === "offline" || m.status === "maintenance")
    .forEach((m) => alerts.push({ severity: "warning", text: `${m.name} unavailable — ${m.status}` }));
  radiologyModalities
    .filter((m) => m.status === "limited")
    .forEach((m) => alerts.push({ severity: "caution", text: `${m.name} running in limited capacity` }));
  if (pendingReportsByBucket[3].count > 0) alerts.push({ severity: "warning", text: `${pendingReportsByBucket[3].count} report${pendingReportsByBucket[3].count > 1 ? "s" : ""} overdue (> 12 hours)` });
  if (waiting > 0) alerts.push({ severity: "info", text: `${waiting} patient${waiting > 1 ? "s" : ""} checked in and waiting` });

  const data: RadiologyDashboardData = {
    ordersToday,
    scheduled,
    waiting,
    inProgress,
    completed,
    awaitingReport,
    criticalOpen,
    equipmentAlerts,
    workflow: { orders: ordersToday, scheduled, checkedIn: waiting, inProgress, completed, reporting: awaitingReport, final: finalReports },
    byModality: Array.from(byModalityMap.entries()).map(([modality, count]) => ({ modality, count })),
    modalityUtilization: radiologyModalities.map((m) => ({ name: m.name, status: m.status, studiesToday: imagingOrders.filter((o) => o.modalityId === m.id && o.scheduledDateTime?.startsWith(TODAY)).length })),
    pendingReportsByBucket,
    alerts,
  };
  return mockRequest(data);
}

// --- Equipment & Maintenance (spec §28-29) — Equipment extends Modalities with
// service history/warranty; Maintenance is a scheduling dashboard computed from
// modalities' own nextMaintenance dates, not a duplicated data source. ---

export interface MaintenanceEvent {
  id: string;
  modalityId: string;
  type: "preventive" | "corrective" | "calibration";
  date: string;
  note?: string;
}

export const maintenanceEvents: MaintenanceEvent[] = [
  { id: "maint-1", modalityId: "mod-ct-01", type: "preventive", date: "2026-07-20", note: "Routine preventive maintenance" },
  { id: "maint-2", modalityId: "mod-mri-01", type: "preventive", date: "2026-07-05", note: "Routine preventive maintenance" },
  { id: "maint-3", modalityId: "mod-xr-01", type: "preventive", date: "2026-06-28", note: "Detector calibration check" },
  { id: "maint-4", modalityId: "mod-us-01", type: "calibration", date: "2026-08-10", note: "Probe calibration" },
];

export interface EquipmentRow extends RadiologyModality {
  roomNumber?: string;
  serviceHistory: MaintenanceEvent[];
}

export function getEquipmentList() {
  const rows: EquipmentRow[] = radiologyModalities.map((m) => ({
    ...m,
    roomNumber: radiologyRooms.find((r) => r.id === m.roomId)?.number,
    serviceHistory: maintenanceEvents.filter((e) => e.modalityId === m.id).sort((a, b) => (a.date < b.date ? 1 : -1)),
  }));
  return mockRequest(rows);
}

export function logMaintenanceEvent(modalityId: string, type: MaintenanceEvent["type"], note?: string) {
  const modality = radiologyModalities.find((m) => m.id === modalityId);
  if (!modality) throw new Error("Modality not found");
  const event: MaintenanceEvent = { id: `maint-${maintenanceEvents.length + 1}`, modalityId, type, date: TODAY, note };
  maintenanceEvents.push(event);
  modality.lastMaintenance = TODAY;
  recordRadiologyAudit(`Maintenance logged (${type})`, "modality", modality.name, DEFAULT_ACTOR, note);
  return mockRequest(event);
}

export type MaintenanceBucket = "overdue" | "due-today" | "due-this-week" | "upcoming";

export interface MaintenanceDashboardData {
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
  completed: number;
  upcoming: { modalityId: string; modalityName: string; nextMaintenance: string; bucket: MaintenanceBucket }[];
}

function daysUntil(dateStr: string): number {
  return Math.round((new Date(`${dateStr}T00:00:00`).getTime() - new Date(`${TODAY}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24));
}

export function getMaintenanceDashboard() {
  let dueToday = 0;
  let dueThisWeek = 0;
  let overdue = 0;
  const upcoming = radiologyModalities.map((m) => {
    const days = daysUntil(m.nextMaintenance);
    let bucket: MaintenanceBucket;
    if (days < 0) {
      bucket = "overdue";
      overdue += 1;
    } else if (days === 0) {
      bucket = "due-today";
      dueToday += 1;
    } else if (days <= 7) {
      bucket = "due-this-week";
      dueThisWeek += 1;
    } else {
      bucket = "upcoming";
    }
    return { modalityId: m.id, modalityName: m.name, nextMaintenance: m.nextMaintenance, bucket };
  });
  const data: MaintenanceDashboardData = { dueToday, dueThisWeek, overdue, completed: maintenanceEvents.length, upcoming };
  return mockRequest(data);
}

// --- PACS / DICOM integration status (spec §19-20) — surfaces the
// pacsTransferStatus/DICOM identifiers already recorded on each ImagingStudy;
// [oversight]: retry here is a mock connectivity workflow action, never a real
// DICOM C-STORE/network implementation. ---

export interface PacsStatusRow {
  studyId: string;
  orderNumber: string;
  patientName: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  aeTitle: string;
  pacsDestination: string;
  transferStatus: "success" | "pending" | "failed";
  performedDateTime: string;
}

export function getPacsStatusList() {
  const rows: PacsStatusRow[] = imagingStudies.map((s) => {
    const order = imagingOrders.find((o) => o.id === s.orderId);
    const modality = order?.modalityId ? radiologyModalities.find((m) => m.id === order.modalityId) : undefined;
    return {
      studyId: s.id,
      orderNumber: order?.orderNumber ?? "—",
      patientName: order ? resolvePatientName(order.patientId) : "—",
      studyInstanceUID: s.studyInstanceUID,
      seriesInstanceUID: s.seriesInstanceUID,
      aeTitle: modality?.aeTitle ?? "—",
      pacsDestination: modality?.pacsDestination ?? "—",
      transferStatus: s.pacsTransferStatus,
      performedDateTime: s.performedDateTime,
    };
  });
  return mockRequest(rows);
}

export interface PacsSummary {
  connected: boolean;
  totalStudies: number;
  success: number;
  pending: number;
  failed: number;
}

export function getPacsSummary() {
  const summary: PacsSummary = {
    connected: !radiologyModalities.some((m) => m.status === "offline"),
    totalStudies: imagingStudies.length,
    success: imagingStudies.filter((s) => s.pacsTransferStatus === "success").length,
    pending: imagingStudies.filter((s) => s.pacsTransferStatus === "pending").length,
    failed: imagingStudies.filter((s) => s.pacsTransferStatus === "failed").length,
  };
  return mockRequest(summary);
}

export function retryPacsTransfer(studyId: string) {
  const study = imagingStudies.find((s) => s.id === studyId);
  if (!study) throw new Error("Study not found");
  study.pacsTransferStatus = "success";
  recordRadiologyAudit("PACS transfer retried", "study", studyId, DEFAULT_ACTOR);
  return mockRequest(study);
}

// --- FHIR / HL7 integration status — lightweight read-only status cards
// (spec mentions these only in passing; the actual resource mapping lives in
// HMS_DOMAIN_STANDARDS.md, this is just a health-check surface for admins). ---

export interface IntegrationStatus {
  name: string;
  standard: string;
  status: "connected" | "degraded" | "disconnected";
  lastSyncAt: string;
  detail: string;
}

export function getIntegrationStatuses() {
  const statuses: IntegrationStatus[] = [
    { name: "PACS", standard: "DICOM", status: radiologyModalities.some((m) => m.status === "offline") ? "degraded" : "connected", lastSyncAt: NOW, detail: "Image storage & retrieval for all modalities" },
    { name: "RIS ↔ EHR", standard: "HL7 v2 (ORM / ORU)", status: "connected", lastSyncAt: NOW, detail: "Order (ORM) and result (ORU) messaging with the hospital EHR" },
    { name: "Interoperability API", standard: "FHIR R4", status: "connected", lastSyncAt: NOW, detail: "ServiceRequest / ImagingStudy / DiagnosticReport resource exchange" },
  ];
  return mockRequest(statuses);
}

// --- Billing & Insurance (spec §30-31) — cross-reference view only; pricing
// and billing codes already live on ImagingProcedure and authorization data
// already lives on ImagingOrder, this never duplicates the central Billing
// module's own ledger. ---

export interface RadiologyBillingRow {
  orderId: string;
  orderNumber: string;
  patientName: string;
  procedureName: string;
  billingCode?: string;
  price: number;
  payerName?: string;
  authorizationStatus: ImagingAuthorizationStatus;
  authorizationNumber?: string;
  orderStatus: ImagingOrderStatus;
}

export function getRadiologyBilling(filters: { search?: string } = {}) {
  let rows: RadiologyBillingRow[] = imagingOrders.map((o) => {
    const procedure = imagingProcedures.find((p) => p.code === o.procedureCode);
    return {
      orderId: o.id,
      orderNumber: o.orderNumber,
      patientName: resolvePatientName(o.patientId),
      procedureName: procedure?.name ?? o.procedureCode,
      billingCode: procedure?.billingCode,
      price: procedure?.price ?? 0,
      payerName: o.payerName,
      authorizationStatus: o.authorizationStatus,
      authorizationNumber: o.authorizationNumber,
      orderStatus: o.status,
    };
  });
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.orderNumber.toLowerCase().includes(q) || r.patientName.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}

export interface RadiologyInsuranceRow {
  orderId: string;
  orderNumber: string;
  patientName: string;
  procedureName: string;
  payerName?: string;
  authorizationStatus: ImagingAuthorizationStatus;
  priority: ImagingOrderPriority;
  orderedDateTime: string;
}

export function getRadiologyInsuranceQueue() {
  const rows: RadiologyInsuranceRow[] = imagingOrders
    .filter((o) => o.authorizationStatus === "pending" || o.authorizationStatus === "rejected")
    .map((o) => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      patientName: resolvePatientName(o.patientId),
      procedureName: resolveProcedureName(o.procedureCode),
      payerName: o.payerName,
      authorizationStatus: o.authorizationStatus,
      priority: o.priority,
      orderedDateTime: o.orderedDateTime,
    }));
  return mockRequest(rows);
}

// --- Analytics (spec §32) — deeper aggregate view than the Dashboard's own
// snapshot; every figure below is computed from real order/study/report
// records, never a fabricated/decorative number. ---

export interface RadiologyAnalyticsData {
  totalOrders: number;
  completedStudies: number;
  cancelledOrders: number;
  noShowOrders: number;
  volumeByModality: { modality: ModalityType; count: number }[];
  volumeByDepartment: { department: string; count: number }[];
  averageTurnaroundHours: number;
  averageWaitMinutes: number;
  modalityUtilization: { name: string; utilizationPercent: number }[];
  reportStatusBreakdown: { status: RadiologyReportStatus; count: number }[];
}

export function getRadiologyAnalytics() {
  const totalOrders = imagingOrders.length;
  const completedStudies = imagingOrders.filter((o) => o.status === "completed").length;
  const cancelledOrders = imagingOrders.filter((o) => o.status === "cancelled").length;
  const noShowOrders = imagingOrders.filter((o) => o.status === "no-show").length;

  const volumeByModalityMap = new Map<ModalityType, number>();
  imagingOrders.forEach((o) => {
    const procedure = imagingProcedures.find((p) => p.code === o.procedureCode);
    if (procedure) volumeByModalityMap.set(procedure.modality, (volumeByModalityMap.get(procedure.modality) ?? 0) + 1);
  });

  const volumeByDepartmentMap = new Map<string, number>();
  imagingOrders.forEach((o) => {
    const name = departmentConfigs.find((d) => d.id === o.departmentId)?.name ?? o.departmentId;
    volumeByDepartmentMap.set(name, (volumeByDepartmentMap.get(name) ?? 0) + 1);
  });

  const completedWithTimes = imagingOrders.filter((o) => o.orderedDateTime && o.studyCompletedAt);
  const averageTurnaroundHours = completedWithTimes.length
    ? completedWithTimes.reduce((sum, o) => sum + hoursBetween(o.orderedDateTime, o.studyCompletedAt!), 0) / completedWithTimes.length
    : 0;

  const waitTimes = imagingOrders.filter((o) => o.checkedInAt && o.studyStartedAt);
  const averageWaitMinutes = waitTimes.length
    ? waitTimes.reduce((sum, o) => sum + hoursBetween(o.checkedInAt!, o.studyStartedAt!) * 60, 0) / waitTimes.length
    : 0;

  const modalityUtilization = radiologyModalities.map((m) => {
    const room = radiologyRooms.find((r) => r.id === m.roomId);
    const procedureMinutes = imagingOrders
      .filter((o) => o.modalityId === m.id && o.scheduledDateTime?.startsWith(TODAY))
      .reduce((sum, o) => sum + (imagingProcedures.find((p) => p.code === o.procedureCode)?.durationMinutes ?? 0), 0);
    const capacityMinutes = room ? operatingMinutes(room.operatingHours) : 0;
    return { name: m.name, utilizationPercent: capacityMinutes > 0 ? Math.min(100, Math.round((procedureMinutes / capacityMinutes) * 100)) : 0 };
  });

  const reportStatusMap = new Map<RadiologyReportStatus, number>();
  radiologyReports.forEach((r) => reportStatusMap.set(r.status, (reportStatusMap.get(r.status) ?? 0) + 1));

  const data: RadiologyAnalyticsData = {
    totalOrders,
    completedStudies,
    cancelledOrders,
    noShowOrders,
    volumeByModality: Array.from(volumeByModalityMap.entries()).map(([modality, count]) => ({ modality, count })),
    volumeByDepartment: Array.from(volumeByDepartmentMap.entries()).map(([department, count]) => ({ department, count })),
    averageTurnaroundHours: Math.round(averageTurnaroundHours * 10) / 10,
    averageWaitMinutes: Math.round(averageWaitMinutes),
    modalityUtilization,
    reportStatusBreakdown: Array.from(reportStatusMap.entries()).map(([status, count]) => ({ status, count })),
  };
  return mockRequest(data);
}

// --- Audit Log (spec §34) — logistics-level trail of every workflow mutation
// this section owns (order actions, room/modality/procedure/protocol config
// changes, critical finding acknowledgement, PACS retries). Never logs
// clinical content (Findings/Impression text never appear here), matching the
// [oversight] boundary. ---

export type RadiologyAuditEntityType = "order" | "study" | "report" | "critical-finding" | "modality" | "room" | "procedure" | "protocol";

export interface RadiologyAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: RadiologyAuditEntityType;
  entityId: string;
  detail?: string;
}

export const radiologyAuditLog: RadiologyAuditEntry[] = [
  { id: "audit-1", timestamp: "2026-08-12T08:15:00", actor: DEFAULT_ACTOR, action: "Authorization approved", entityType: "order", entityId: "RAD-2026-0001" },
  { id: "audit-2", timestamp: "2026-08-14T08:00:00", actor: "farah-chaudhry", action: "Critical finding flagged", entityType: "critical-finding", entityId: "rad-crit-1" },
  { id: "audit-3", timestamp: "2026-08-14T08:05:00", actor: DEFAULT_ACTOR, action: "Critical finding notification sent", entityType: "critical-finding", entityId: "rad-crit-1" },
];

function recordRadiologyAudit(action: string, entityType: RadiologyAuditEntityType, entityId: string, actor: string, detail?: string) {
  radiologyAuditLog.push({ id: `audit-${radiologyAuditLog.length + 1}`, timestamp: NOW, actor, action, entityType, entityId, detail });
}

export function getRadiologyAuditLog(filters: { entityType?: RadiologyAuditEntityType; search?: string } = {}) {
  let rows = [...radiologyAuditLog].reverse();
  if (filters.entityType) rows = rows.filter((r) => r.entityType === filters.entityType);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.entityId.toLowerCase().includes(q) || r.actor.toLowerCase().includes(q) || r.action.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}

// --- Settings (spec §35) — configuration overview; a lighter status/summary
// hub that links to Modalities/Rooms/Procedures rather than duplicating those
// screens' own CRUD. ---

export interface RadiologySettingsData {
  departmentName: string;
  activeModalityCount: number;
  activeRoomCount: number;
  activeProcedureCount: number;
  protocolCount: number;
  defaultSlotMinutes: number;
  criticalFindingEscalationMinutes: number;
}

export function getRadiologySettings() {
  const data: RadiologySettingsData = {
    departmentName: departmentConfigs.find((d) => d.id === "dept-radiology")?.name ?? "Radiology",
    activeModalityCount: radiologyModalities.filter((m) => m.status !== "retired").length,
    activeRoomCount: radiologyRooms.filter((r) => r.status === "active").length,
    activeProcedureCount: imagingProcedures.filter((p) => p.active).length,
    protocolCount: radiologyProtocols.length,
    defaultSlotMinutes: 15,
    criticalFindingEscalationMinutes: 30,
  };
  return mockRequest(data);
}
