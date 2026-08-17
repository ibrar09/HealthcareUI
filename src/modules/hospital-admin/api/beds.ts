import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR, getFullName } from "./core";
import { facilities, departmentConfigs, floors, wards, rooms, beds, bedTypes, resolveBedTypeName, type GenderRestriction, type BedStatus, type Bed, type Ward, type WardType, type Room, type RoomType, type BedTypeConfig } from "./facilities";
import { staffMembers } from "./staff";
import { patients, getPatientFullName, getIdentifier } from "./patients";


export interface WardView {
  id: string;
  facilityId: string;
  facilityName: string;
  floorId: string;
  floorName: string;
  departmentId?: string;
  departmentName?: string;
  name: string;
  code: string;
  type: WardType;
  nurseStation?: string;
  status: "active" | "closed";
  rooms: {
    id: string;
    name: string;
    type: RoomType;
    capacity: number;
    genderRestriction: GenderRestriction;
    isolationCapable: boolean;
    beds: { id: string; identifier: string; bedTypeName: string; status: BedStatus; isolationRequired?: boolean; patientName?: string }[];
  }[];
}

export function getWards() {
  const view: WardView[] = wards.map((w) => {
    const facility = facilities.find((f) => f.id === w.facilityId);
    const floor = floors.find((fl) => fl.id === w.floorId);
    const department = departmentConfigs.find((d) => d.id === w.departmentId);
    return {
      id: w.id,
      facilityId: w.facilityId,
      facilityName: facility?.name ?? "Unknown",
      floorId: w.floorId,
      floorName: floor?.name ?? "Unknown",
      departmentId: w.departmentId,
      departmentName: department?.name,
      name: w.name,
      code: w.code,
      type: w.type,
      nurseStation: w.nurseStation,
      status: w.status,
      rooms: rooms
        .filter((r) => r.wardId === w.id)
        .map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          capacity: r.capacity,
          genderRestriction: r.genderRestriction,
          isolationCapable: r.isolationCapable,
          beds: beds
            .filter((b) => b.roomId === r.id)
            .map((b) => ({
              id: b.id,
              identifier: b.identifier,
              bedTypeName: resolveBedTypeName(b.bedTypeId),
              status: b.status,
              isolationRequired: b.isolationRequired,
              patientName: b.patientId ? getPatientFullName(patients.find((p) => p.id === b.patientId)!.name) : undefined,
            })),
        })),
    };
  });
  return mockRequest(view);
}

export const getFloors = (facilityId?: string) => mockRequest(facilityId ? floors.filter((f) => f.facilityId === facilityId) : floors);

export const getBedStats = () =>
  mockRequest({
    total: beds.length,
    available: beds.filter((b) => b.status === "available").length,
    occupied: beds.filter((b) => b.status === "occupied").length,
    outOfService: beds.filter((b) => b.status === "maintenance" || b.status === "cleaning").length,
  });

// Occupancy Analytics (spec §21-22) — breakdowns beyond the headline dashboard
// numbers. Only derives metrics the mock data can actually support (bed-level
// status counts) — no fabricated timing metrics like "avg cleaning minutes",
// since beds only carry a date-level `lastUpdated`, not a real timestamp.

export interface WardOccupancy {
  wardId: string;
  wardName: string;
  wardCode: string;
  totalBeds: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  outOfService: number;
  occupancyRate: number;
}

export interface BedTypeOccupancy {
  bedTypeId: string;
  bedTypeName: string;
  totalBeds: number;
  available: number;
  occupied: number;
  occupancyRate: number;
}

export function getOccupancyAnalytics() {
  const byWard: WardOccupancy[] = wards.map((w) => {
    const wardRoomIds = rooms.filter((r) => r.wardId === w.id).map((r) => r.id);
    const wardBeds = beds.filter((b) => wardRoomIds.includes(b.roomId));
    const total = wardBeds.length;
    const occupied = wardBeds.filter((b) => b.status === "occupied").length;
    return {
      wardId: w.id,
      wardName: w.name,
      wardCode: w.code,
      totalBeds: total,
      available: wardBeds.filter((b) => b.status === "available").length,
      occupied,
      reserved: wardBeds.filter((b) => b.status === "reserved").length,
      cleaning: wardBeds.filter((b) => b.status === "cleaning").length,
      outOfService: wardBeds.filter((b) => b.status === "maintenance" || b.status === "blocked" || b.status === "out-of-service").length,
      occupancyRate: total ? Math.round((occupied / total) * 100) : 0,
    };
  });

  const byBedType: BedTypeOccupancy[] = bedTypes.map((bt) => {
    const typeBeds = beds.filter((b) => b.bedTypeId === bt.id);
    const total = typeBeds.length;
    const occupied = typeBeds.filter((b) => b.status === "occupied").length;
    return {
      bedTypeId: bt.id,
      bedTypeName: bt.name,
      totalBeds: total,
      available: typeBeds.filter((b) => b.status === "available").length,
      occupied,
      occupancyRate: total ? Math.round((occupied / total) * 100) : 0,
    };
  });

  const availableBeds = beds.filter((b) => b.status === "available");
  const genderAvailability = {
    male: availableBeds.filter((b) => {
      const room = rooms.find((r) => r.id === b.roomId);
      return room?.genderRestriction === "male" || room?.genderRestriction === "any";
    }).length,
    female: availableBeds.filter((b) => {
      const room = rooms.find((r) => r.id === b.roomId);
      return room?.genderRestriction === "female" || room?.genderRestriction === "any";
    }).length,
  };

  const total = beds.length;
  const occupied = beds.filter((b) => b.status === "occupied").length;

  return mockRequest({
    overallOccupancyRate: total ? Math.round((occupied / total) * 100) : 0,
    byWard,
    byBedType,
    genderAvailability,
  });
}

export interface NewWardInput {
  facilityId: string;
  floorId: string;
  name: string;
  code: string;
  type: WardType;
  nurseStation?: string;
  departmentId?: string;
  status: "active" | "closed";
}

export function createWard(input: NewWardInput) {
  const newWard: Ward = { ...input, id: `ward-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${wards.length}` };
  wards.push(newWard);
  return mockRequest(newWard);
}

export function updateWard(id: string, updates: Partial<NewWardInput>) {
  const index = wards.findIndex((w) => w.id === id);
  if (index !== -1) wards[index] = { ...wards[index], ...updates };
  return mockRequest(wards[index] ?? null);
}

// Room List (Bed Management spec §6) — joined view with live occupancy.

export interface RoomView {
  id: string;
  wardId: string;
  wardName: string;
  wardCode: string;
  floorName: string;
  facilityName: string;
  departmentName?: string;
  name: string;
  type: RoomType;
  capacity: number;
  currentOccupancy: number;
  availableBeds: number;
  genderRestriction: GenderRestriction;
  isolationCapable: boolean;
  status: "active" | "closed";
}

export function getRooms() {
  const view: RoomView[] = rooms.map((r) => {
    const ward = wards.find((w) => w.id === r.wardId);
    const floor = floors.find((f) => f.id === ward?.floorId);
    const facility = facilities.find((f) => f.id === ward?.facilityId);
    const department = departmentConfigs.find((d) => d.id === ward?.departmentId);
    const roomBeds = beds.filter((b) => b.roomId === r.id);
    return {
      id: r.id,
      wardId: r.wardId,
      wardName: ward?.name ?? "Unknown",
      wardCode: ward?.code ?? "—",
      floorName: floor?.name ?? "Unknown",
      facilityName: facility?.name ?? "Unknown",
      departmentName: department?.name,
      name: r.name,
      type: r.type,
      capacity: r.capacity,
      currentOccupancy: roomBeds.filter((b) => b.status === "occupied").length,
      availableBeds: roomBeds.filter((b) => b.status === "available").length,
      genderRestriction: r.genderRestriction,
      isolationCapable: r.isolationCapable,
      status: r.status,
    };
  });
  return mockRequest(view);
}

export interface NewRoomInput {
  wardId: string;
  name: string;
  type: RoomType;
  capacity: number;
  genderRestriction: GenderRestriction;
  isolationCapable: boolean;
  status: "active" | "closed";
}

/** Phase 4 config screen (spec §26-27) — room configuration lives in Bed Management, not Facilities, since Facilities' "Wards & Beds" tab is read-only inventory. */
export function createRoom(input: NewRoomInput) {
  const newRoom: Room = { id: `room-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${rooms.length}`, ...input };
  rooms.push(newRoom);
  return mockRequest(newRoom);
}

export function updateRoom(id: string, updates: Partial<NewRoomInput>) {
  const index = rooms.findIndex((r) => r.id === id);
  if (index !== -1) rooms[index] = { ...rooms[index], ...updates };
  return mockRequest(rooms[index] ?? null);
}

// Bed List (Bed Management spec §3) — every column the spec's table asks for, joined and flat.

export interface BedListRow {
  id: string;
  identifier: string;
  facilityId: string;
  facilityName: string;
  floorName: string;
  wardId: string;
  wardName: string;
  roomId: string;
  roomName: string;
  bedTypeId: string;
  bedTypeName: string;
  departmentName?: string;
  status: BedStatus;
  genderRestriction: GenderRestriction;
  isolationRequired?: boolean;
  isolationType?: Bed["isolationType"];
  patientId?: string;
  patientName?: string;
  patientMrn?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  admissionDate?: string;
  expectedDischargeDate?: string;
  reservedForPatientId?: string;
  reservedForName?: string;
  expectedAdmissionDate?: string;
  reservationReason?: string;
  blockedReason?: string;
  blockedFrom?: string;
  blockedUntil?: string;
  maintenanceIssue?: string;
  outOfServiceReason?: string;
  lastUpdated: string;
}

function toBedListRow(b: Bed): BedListRow {
  const room = rooms.find((r) => r.id === b.roomId);
  const ward = wards.find((w) => w.id === room?.wardId);
  const floor = floors.find((f) => f.id === ward?.floorId);
  const facility = facilities.find((f) => f.id === ward?.facilityId);
  const department = departmentConfigs.find((d) => d.id === ward?.departmentId);
  const patient = b.patientId ? patients.find((p) => p.id === b.patientId) : undefined;
  const staff = b.assignedStaffId ? staffMembers.find((s) => s.id === b.assignedStaffId) : undefined;
  const reservedForPatient = b.reservedForPatientId ? patients.find((p) => p.id === b.reservedForPatientId) : undefined;
  return {
    id: b.id,
    identifier: b.identifier,
    facilityId: ward?.facilityId ?? "",
    facilityName: facility?.name ?? "Unknown",
    floorName: floor?.name ?? "Unknown",
    wardId: ward?.id ?? "",
    wardName: ward?.name ?? "Unknown",
    roomId: room?.id ?? "",
    roomName: room?.name ?? "Unknown",
    bedTypeId: b.bedTypeId,
    bedTypeName: resolveBedTypeName(b.bedTypeId),
    departmentName: department?.name,
    status: b.status,
    genderRestriction: room?.genderRestriction ?? "any",
    isolationRequired: b.isolationRequired,
    isolationType: b.isolationType,
    patientId: b.patientId,
    patientName: patient ? getPatientFullName(patient.name) : undefined,
    patientMrn: patient ? getIdentifier(patient.identifiers, "mrn")?.value : undefined,
    assignedStaffId: b.assignedStaffId,
    assignedStaffName: staff?.name,
    admissionDate: b.admissionDate,
    expectedDischargeDate: b.expectedDischargeDate,
    reservedForPatientId: b.reservedForPatientId,
    reservedForName: reservedForPatient ? getPatientFullName(reservedForPatient.name) : undefined,
    expectedAdmissionDate: b.expectedAdmissionDate,
    reservationReason: b.reservationReason,
    blockedReason: b.blockedReason,
    blockedFrom: b.blockedFrom,
    blockedUntil: b.blockedUntil,
    maintenanceIssue: b.maintenanceIssue,
    outOfServiceReason: b.outOfServiceReason,
    lastUpdated: b.lastUpdated,
  };
}

export function getBedList(params: { search?: string; status?: BedStatus | "all"; wardId?: string | "all"; bedTypeId?: string | "all" } = {}) {
  const { search = "", status = "all", wardId = "all", bedTypeId = "all" } = params;
  const q = search.trim().toLowerCase();
  const rows = beds
    .map(toBedListRow)
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => wardId === "all" || r.wardId === wardId)
    .filter((r) => bedTypeId === "all" || r.bedTypeId === bedTypeId)
    .filter(
      (r) =>
        !q ||
        r.identifier.toLowerCase().includes(q) ||
        r.patientName?.toLowerCase().includes(q) ||
        r.patientMrn?.toLowerCase().includes(q) ||
        r.wardName.toLowerCase().includes(q) ||
        r.roomName.toLowerCase().includes(q)
    );
  return mockRequest(rows);
}

export const getBed = (id: string) => {
  const bed = beds.find((b) => b.id === id);
  return mockRequest(bed ? toBedListRow(bed) : null);
};

// Bed Management Phase 2 — Operations (spec §10-18). Every mutation below
// enforces the same lifecycle rule as the spec: a bed never jumps straight
// from occupied to available — it always passes through cleaning first
// (§12), and a reservation is a distinct state from an actual admission (§11).

function findBedOrThrow(bedId: string): Bed {
  const bed = beds.find((b) => b.id === bedId);
  if (!bed) throw new Error(`Bed ${bedId} not found`);
  return bed;
}

// Bed History (spec §24) & Audit (spec §25) — every status-changing mutation
// below records who/what/when/why. This is the single source both the
// Bed Details "History" section and the hospital-wide "Audit" tab read from.

export interface BedAuditEvent {
  id: string;
  bedId: string;
  bedIdentifier: string;
  timestamp: string;
  action: string;
  actor: string;
  patientName?: string;
  detail?: string;
}

const bedAuditLog: BedAuditEvent[] = [];

function recordBedAudit(bed: Bed, action: string, actor: string | undefined, patientName?: string, detail?: string) {
  bedAuditLog.unshift({
    id: `audit-${bedAuditLog.length + 1}-${Date.now()}`,
    bedId: bed.id,
    bedIdentifier: bed.identifier,
    timestamp: TODAY,
    action,
    actor: actor ?? DEFAULT_ACTOR,
    patientName,
    detail,
  });
}

export function getBedHistory(bedId: string) {
  return mockRequest(bedAuditLog.filter((e) => e.bedId === bedId));
}

export function getBedAuditLog(filters: { bedId?: string; action?: string } = {}) {
  const rows = bedAuditLog
    .filter((e) => !filters.bedId || e.bedId === filters.bedId)
    .filter((e) => !filters.action || e.action === filters.action);
  return mockRequest(rows);
}

export function getAvailableBeds(filters: { wardId?: string; bedTypeId?: string; genderRestriction?: GenderRestriction; isolationCapable?: boolean } = {}) {
  const matches = beds
    .filter((b) => b.status === "available")
    .filter((b) => {
      const room = rooms.find((r) => r.id === b.roomId);
      const ward = wards.find((w) => w.id === room?.wardId);
      if (filters.wardId && ward?.id !== filters.wardId) return false;
      if (filters.bedTypeId && b.bedTypeId !== filters.bedTypeId) return false;
      if (filters.genderRestriction && room && room.genderRestriction !== "any" && room.genderRestriction !== filters.genderRestriction) return false;
      if (filters.isolationCapable && !room?.isolationCapable) return false;
      return true;
    })
    .map(toBedListRow);
  return mockRequest(matches);
}

export interface AssignBedInput {
  bedId: string;
  patientId: string;
  assignedStaffId?: string;
  admissionDate: string;
  expectedDischargeDate?: string;
}

/** Admits a patient into an available (or reserved-for-them) bed. */
export function assignBed(input: AssignBedInput, performedBy?: string) {
  const bed = findBedOrThrow(input.bedId);
  const patientNameRecord = patients.find((p) => p.id === input.patientId)?.name;
  const patientName = patientNameRecord ? getFullName(patientNameRecord) : undefined;
  bed.status = "occupied";
  bed.patientId = input.patientId;
  bed.assignedStaffId = input.assignedStaffId;
  bed.admissionDate = input.admissionDate;
  bed.expectedDischargeDate = input.expectedDischargeDate;
  bed.reservedForPatientId = undefined;
  bed.expectedAdmissionDate = undefined;
  bed.reservationReason = undefined;
  bed.reservedBy = undefined;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Patient Admitted", performedBy, patientName, `Admission date ${input.admissionDate}`);
  return mockRequest(toBedListRow(bed));
}

/** Discharge — bed goes to cleaning, never straight to available (spec §12). */
export function releaseBed(bedId: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  const releasedPatientRecord = patients.find((p) => p.id === bed.patientId)?.name;
  const patientName = releasedPatientRecord ? getFullName(releasedPatientRecord) : undefined;
  bed.status = "cleaning";
  bed.patientId = undefined;
  bed.assignedStaffId = undefined;
  bed.admissionDate = undefined;
  bed.expectedDischargeDate = undefined;
  bed.isolationRequired = undefined;
  bed.isolationType = undefined;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Patient Discharged", performedBy, patientName, "Bed sent for cleaning");
  return mockRequest(toBedListRow(bed));
}

export interface ReserveBedInput {
  bedId: string;
  reservedForPatientId: string;
  expectedAdmissionDate: string;
  reservationReason?: string;
  reservedBy: string;
}

export function reserveBed(input: ReserveBedInput, performedBy?: string) {
  const bed = findBedOrThrow(input.bedId);
  const patientRecord = patients.find((p) => p.id === input.reservedForPatientId)?.name;
  const patientName = patientRecord ? getFullName(patientRecord) : undefined;
  bed.status = "reserved";
  bed.reservedForPatientId = input.reservedForPatientId;
  bed.expectedAdmissionDate = input.expectedAdmissionDate;
  bed.reservationReason = input.reservationReason;
  bed.reservedBy = input.reservedBy;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Bed Reserved", performedBy ?? input.reservedBy, patientName, input.reservationReason);
  return mockRequest(toBedListRow(bed));
}

export function cancelReservation(bedId: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  const patientRecord = patients.find((p) => p.id === bed.reservedForPatientId)?.name;
  const patientName = patientRecord ? getFullName(patientRecord) : undefined;
  bed.status = "available";
  bed.reservedForPatientId = undefined;
  bed.expectedAdmissionDate = undefined;
  bed.reservationReason = undefined;
  bed.reservedBy = undefined;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Reservation Cancelled", performedBy, patientName);
  return mockRequest(toBedListRow(bed));
}

/** Promotes a reservation into an actual admission. */
export function confirmAdmission(bedId: string, input: { assignedStaffId?: string; admissionDate: string; expectedDischargeDate?: string }, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  if (!bed.reservedForPatientId) throw new Error("Bed has no reservation to confirm");
  return assignBed(
    {
      bedId,
      patientId: bed.reservedForPatientId,
      assignedStaffId: input.assignedStaffId,
      admissionDate: input.admissionDate,
      expectedDischargeDate: input.expectedDischargeDate,
    },
    performedBy,
  );
}

export interface TransferInput {
  fromBedId: string;
  toBedId: string;
  reason?: string;
}

/** Moves a patient to a different bed — old bed goes to cleaning, new bed becomes occupied (spec §13). */
export function transferPatient(input: TransferInput, performedBy?: string) {
  const fromBed = findBedOrThrow(input.fromBedId);
  const toBed = findBedOrThrow(input.toBedId);
  if (!fromBed.patientId) throw new Error("Source bed has no patient to transfer");
  const patientRecord = patients.find((p) => p.id === fromBed.patientId)?.name;
  const patientName = patientRecord ? getFullName(patientRecord) : undefined;
  toBed.status = "occupied";
  toBed.patientId = fromBed.patientId;
  toBed.assignedStaffId = fromBed.assignedStaffId;
  toBed.admissionDate = fromBed.admissionDate;
  toBed.expectedDischargeDate = fromBed.expectedDischargeDate;
  toBed.isolationRequired = fromBed.isolationRequired;
  toBed.isolationType = fromBed.isolationType;
  toBed.lastUpdated = TODAY;

  fromBed.status = "cleaning";
  fromBed.patientId = undefined;
  fromBed.assignedStaffId = undefined;
  fromBed.admissionDate = undefined;
  fromBed.expectedDischargeDate = undefined;
  fromBed.isolationRequired = undefined;
  fromBed.isolationType = undefined;
  fromBed.lastUpdated = TODAY;

  recordBedAudit(fromBed, "Transferred Out", performedBy, patientName, `To ${toBed.identifier}${input.reason ? ` — ${input.reason}` : ""}`);
  recordBedAudit(toBed, "Transferred In", performedBy, patientName, `From ${fromBed.identifier}${input.reason ? ` — ${input.reason}` : ""}`);

  return mockRequest({ from: toBedListRow(fromBed), to: toBedListRow(toBed) });
}

export function completeCleaning(bedId: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  bed.status = "available";
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Cleaning Completed", performedBy);
  return mockRequest(toBedListRow(bed));
}

export function reportMaintenance(bedId: string, issue: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  bed.status = "maintenance";
  bed.maintenanceIssue = issue;
  bed.maintenanceReportedOn = TODAY;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Maintenance Reported", performedBy, undefined, issue);
  return mockRequest(toBedListRow(bed));
}

export function completeMaintenance(bedId: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  bed.status = "available";
  bed.maintenanceIssue = undefined;
  bed.maintenanceReportedOn = undefined;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Maintenance Completed", performedBy);
  return mockRequest(toBedListRow(bed));
}

export interface BlockBedInput {
  bedId: string;
  reason: string;
  from?: string;
  until?: string;
}

export function blockBed(input: BlockBedInput, performedBy?: string) {
  const bed = findBedOrThrow(input.bedId);
  bed.status = "blocked";
  bed.blockedReason = input.reason;
  bed.blockedFrom = input.from ?? TODAY;
  bed.blockedUntil = input.until;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Bed Blocked", performedBy, undefined, input.reason);
  return mockRequest(toBedListRow(bed));
}

export function unblockBed(bedId: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  bed.status = "available";
  bed.blockedReason = undefined;
  bed.blockedFrom = undefined;
  bed.blockedUntil = undefined;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Bed Unblocked", performedBy);
  return mockRequest(toBedListRow(bed));
}

export function returnToService(bedId: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  bed.status = "available";
  bed.outOfServiceReason = undefined;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Returned To Service", performedBy);
  return mockRequest(toBedListRow(bed));
}

// Bed Inventory Configuration (spec §26-29, Phase 4) — adding/editing/retiring
// the physical beds themselves, as opposed to Phase 2's day-to-day operational
// status changes. Lives in Bed Management (not Facilities) since Facilities'
// own "Wards & Beds" tab is deliberately read-only inventory.

export interface NewBedInput {
  roomId: string;
  bedTypeId: string;
  identifier: string;
}

/** Adds a new physical bed to inventory — starts available immediately (spec §28). */
export function createBed(input: NewBedInput, performedBy?: string) {
  const newBed: Bed = {
    id: `bed-${input.identifier.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${beds.length}`,
    identifier: input.identifier,
    roomId: input.roomId,
    bedTypeId: input.bedTypeId,
    status: "available",
    lastUpdated: TODAY,
  };
  beds.push(newBed);
  recordBedAudit(newBed, "Bed Added to Inventory", performedBy);
  return mockRequest(toBedListRow(newBed));
}

export interface UpdateBedConfigInput {
  bedTypeId?: string;
  identifier?: string;
}

/** Edits a bed's identifier/type — configuration only, never touches operational status (spec §28). */
export function updateBedConfig(bedId: string, updates: UpdateBedConfigInput, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  Object.assign(bed, updates);
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Bed Configuration Updated", performedBy, undefined, Object.entries(updates).map(([k, v]) => `${k}: ${v}`).join(", "));
  return mockRequest(toBedListRow(bed));
}

/** Permanently retires a bed from active service — distinct from temporary maintenance/block (spec §29). Only an available bed can be decommissioned. */
export function decommissionBed(bedId: string, reason: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  if (bed.status !== "available") throw new Error("Only an available bed can be decommissioned");
  bed.status = "out-of-service";
  bed.outOfServiceReason = reason;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Bed Decommissioned", performedBy, undefined, reason);
  return mockRequest(toBedListRow(bed));
}

// Isolation Management (spec §19-20) — isolation is a property of an occupied
// bed, not a status of its own (a bed stays "occupied" while under precaution),
// so this is a targeted update rather than a status transition.

export type IsolationType = "contact" | "droplet" | "airborne" | "protective" | "other";

export interface SetIsolationInput {
  bedId: string;
  isolationType: IsolationType;
  reason?: string;
}

export function setIsolation(input: SetIsolationInput, performedBy?: string) {
  const bed = findBedOrThrow(input.bedId);
  if (bed.status !== "occupied") throw new Error("Isolation precaution can only be set on an occupied bed");
  const patientRecord = patients.find((p) => p.id === bed.patientId)?.name;
  const patientName = patientRecord ? getFullName(patientRecord) : undefined;
  bed.isolationRequired = true;
  bed.isolationType = input.isolationType;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Isolation Precaution Set", performedBy, patientName, `${input.isolationType}${input.reason ? ` — ${input.reason}` : ""}`);
  return mockRequest(toBedListRow(bed));
}

export function clearIsolation(bedId: string, performedBy?: string) {
  const bed = findBedOrThrow(bedId);
  const patientRecord = patients.find((p) => p.id === bed.patientId)?.name;
  const patientName = patientRecord ? getFullName(patientRecord) : undefined;
  const previousType = bed.isolationType;
  bed.isolationRequired = undefined;
  bed.isolationType = undefined;
  bed.lastUpdated = TODAY;
  recordBedAudit(bed, "Isolation Precaution Cleared", performedBy, patientName, previousType);
  return mockRequest(toBedListRow(bed));
}

export interface IsolationBedRow extends BedListRow {
  isolationCapableRoom: boolean;
}

/** Isolation dashboard: beds currently under precaution + isolation-capable inventory (spec §20). */
export function getIsolationOverview() {
  const activeIsolation: IsolationBedRow[] = beds
    .filter((b) => b.isolationRequired)
    .map((b) => {
      const room = rooms.find((r) => r.id === b.roomId);
      return { ...toBedListRow(b), isolationCapableRoom: !!room?.isolationCapable };
    });
  const capableRooms = rooms.filter((r) => r.isolationCapable);
  const capableBeds = beds.filter((b) => capableRooms.some((r) => r.id === b.roomId));
  const availableCapableBeds = capableBeds.filter((b) => b.status === "available").map(toBedListRow);
  return mockRequest({
    activeIsolation,
    totalIsolationCapableRooms: capableRooms.length,
    totalIsolationCapableBeds: capableBeds.length,
    availableIsolationCapableBeds: availableCapableBeds,
  });
}

// Bed Request Queue (spec §14) — a request for a bed of a given type/department,
// raised before a specific bed is picked. Assigning fulfils it via the same
// `assignBed` path above; rejecting just closes it out with a reason.

export type BedRequestPriority = "routine" | "urgent" | "emergency";
export type BedRequestStatus = "pending" | "assigned" | "rejected";

export interface BedRequest {
  id: string;
  patientId: string;
  bedTypeId: string;
  departmentId?: string;
  priority: BedRequestPriority;
  requestedByStaffId: string;
  status: BedRequestStatus;
  requestedOn: string;
  assignedBedId?: string;
  rejectionReason?: string;
}

const bedRequests: BedRequest[] = [
  { id: "req-1", patientId: "p-hassan-abbasi", bedTypeId: "bt-standard", departmentId: "dept-cardiology", priority: "urgent", requestedByStaffId: "sarah-jenkins", status: "pending", requestedOn: "2026-08-14" },
  { id: "req-2", patientId: "p-mariam-farooq", bedTypeId: "bt-icu", departmentId: "dept-icu", priority: "emergency", requestedByStaffId: "robert-vance", status: "pending", requestedOn: "2026-08-14" },
];

export interface BedRequestView {
  id: string;
  patientId: string;
  patientName: string;
  bedTypeId: string;
  bedTypeName: string;
  departmentName?: string;
  priority: BedRequestPriority;
  requestedByName: string;
  status: BedRequestStatus;
  requestedOn: string;
  assignedBedId?: string;
  assignedBedIdentifier?: string;
  rejectionReason?: string;
}

function toBedRequestView(r: BedRequest): BedRequestView {
  const patient = patients.find((p) => p.id === r.patientId);
  const department = departmentConfigs.find((d) => d.id === r.departmentId);
  const requester = staffMembers.find((s) => s.id === r.requestedByStaffId);
  const assignedBed = r.assignedBedId ? beds.find((b) => b.id === r.assignedBedId) : undefined;
  return {
    id: r.id,
    patientId: r.patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    bedTypeId: r.bedTypeId,
    bedTypeName: resolveBedTypeName(r.bedTypeId),
    departmentName: department?.name,
    priority: r.priority,
    requestedByName: requester?.name ?? "Unknown",
    status: r.status,
    requestedOn: r.requestedOn,
    assignedBedId: r.assignedBedId,
    assignedBedIdentifier: assignedBed?.identifier,
    rejectionReason: r.rejectionReason,
  };
}

export const getBedRequests = () => mockRequest(bedRequests.map(toBedRequestView).sort((a, b) => a.status.localeCompare(b.status)));

export interface NewBedRequestInput {
  patientId: string;
  bedTypeId: string;
  departmentId?: string;
  priority: BedRequestPriority;
  requestedByStaffId: string;
}

export function createBedRequest(input: NewBedRequestInput) {
  const newRequest: BedRequest = { ...input, id: `req-${bedRequests.length + 1}-${Date.now()}`, status: "pending", requestedOn: TODAY };
  bedRequests.push(newRequest);
  return mockRequest(toBedRequestView(newRequest));
}

/** Fulfils a pending request by admitting its patient into the chosen bed. */
export function assignRequestToBed(requestId: string, bedId: string, assignedStaffId?: string, performedBy?: string) {
  const request = bedRequests.find((r) => r.id === requestId);
  if (!request) return mockRequest(null);
  assignBed({ bedId, patientId: request.patientId, assignedStaffId, admissionDate: TODAY }, performedBy);
  request.status = "assigned";
  request.assignedBedId = bedId;
  return mockRequest(toBedRequestView(request));
}

export function rejectBedRequest(requestId: string, reason: string) {
  const request = bedRequests.find((r) => r.id === requestId);
  if (!request) return mockRequest(null);
  request.status = "rejected";
  request.rejectionReason = reason;
  return mockRequest(toBedRequestView(request));
}

// Bed Management Dashboard (spec §1).

export interface BedDashboardData {
  total: number;
  byStatus: Record<BedStatus, number>;
  occupancyRate: number;
  byDepartment: { name: string; available: number; total: number }[];
  byWard: { name: string; occupied: number; total: number; occupancyRate: number }[];
  admissionsToday: number;
  expectedDischargesToday: { patientName: string; wardName: string; bedIdentifier: string }[];
  bedsUnderMaintenance: number;
  isolationBeds: number;
  genderAvailability: { male: number; female: number; any: number };
  occupancyTrend: number[];
}


export function getBedDashboard() {
  const byStatus = beds.reduce(
    (acc, b) => {
      acc[b.status] += 1;
      return acc;
    },
    { available: 0, reserved: 0, occupied: 0, cleaning: 0, maintenance: 0, blocked: 0, "out-of-service": 0 } as Record<BedStatus, number>
  );

  const departmentGroups = new Map<string, { available: number; total: number }>();
  const wardGroups = new Map<string, { name: string; occupied: number; total: number }>();

  for (const b of beds) {
    const room = rooms.find((r) => r.id === b.roomId);
    const ward = wards.find((w) => w.id === room?.wardId);
    const department = departmentConfigs.find((d) => d.id === ward?.departmentId);
    const deptName = department?.name ?? "Unassigned";
    const deptEntry = departmentGroups.get(deptName) ?? { available: 0, total: 0 };
    deptEntry.total += 1;
    if (b.status === "available") deptEntry.available += 1;
    departmentGroups.set(deptName, deptEntry);

    if (ward) {
      const wardEntry = wardGroups.get(ward.id) ?? { name: ward.name, occupied: 0, total: 0 };
      wardEntry.total += 1;
      if (b.status === "occupied") wardEntry.occupied += 1;
      wardGroups.set(ward.id, wardEntry);
    }
  }

  const data: BedDashboardData = {
    total: beds.length,
    byStatus,
    occupancyRate: beds.length > 0 ? Math.round((byStatus.occupied / beds.length) * 1000) / 10 : 0,
    byDepartment: Array.from(departmentGroups.entries()).map(([name, v]) => ({ name, ...v })),
    byWard: Array.from(wardGroups.values()).map((v) => ({ ...v, occupancyRate: v.total > 0 ? Math.round((v.occupied / v.total) * 100) : 0 })),
    admissionsToday: beds.filter((b) => b.admissionDate === TODAY).length,
    expectedDischargesToday: beds
      .filter((b) => b.expectedDischargeDate === TODAY && b.patientId)
      .map((b) => {
        const room = rooms.find((r) => r.id === b.roomId);
        const ward = wards.find((w) => w.id === room?.wardId);
        const patient = patients.find((p) => p.id === b.patientId);
        return {
          patientName: patient ? getPatientFullName(patient.name) : "Unknown",
          wardName: ward?.name ?? "Unknown",
          bedIdentifier: b.identifier,
        };
      }),
    bedsUnderMaintenance: byStatus.maintenance,
    isolationBeds: beds.filter((b) => b.isolationRequired).length,
    genderAvailability: beds
      .filter((b) => b.status === "available")
      .reduce(
        (acc, b) => {
          const room = rooms.find((r) => r.id === b.roomId);
          const g = room?.genderRestriction ?? "any";
          acc[g] += 1;
          return acc;
        },
        { male: 0, female: 0, any: 0 }
      ),
    occupancyTrend: [58, 61, 64, 60, 66, 69, 65, 70, 68, 63],
  };
  return mockRequest(data);
}
