import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { facilities, departmentConfigs, floors, rooms, type Facility } from "./facilities";
import { staffMembers } from "./staff";

// ============================================================================
// Facilities — Operations (Maintenance/Work Orders, Equipment, Incidents,
// Overview dashboard). This is a genuine UPDATE to the existing Facilities
// module per the user's own explicit framing ("add these things in the
// facilities like type of update... do your best"), not a full rebuild of
// every one of the pasted spec's 62 sections — the physical-hierarchy
// sections that would require a structural rework (a new Building layer
// above the existing Facility→Floor→Ward→Room→Bed chain, a Facility Map/
// floor-plan upload, Utilities/Fire-Safety/Housekeeping/Waste/Security/
// Parking, Vendors/SLA/Documents/Projects, and the backend REST/Kafka/RBAC
// sections) are deliberately left as documented backlog — same "for later"
// treatment Configuration and Alerts gave their own backend/architecture
// sections. What's built here is the highest-value real subset: a genuine
// Overview dashboard, a real Work Order lifecycle (Maintenance Requests and
// Work Orders are modeled as ONE entity progressing through the spec's own
// status list, not two separate systems for what's really one ticket),
// Equipment tracking, and Incident tracking.
//
// Scope boundary worth remembering: this module's "Equipment" is FACILITY
// INFRASTRUCTURE only (generators/HVAC/elevators/fire alarms/medical gas/
// electrical panels) — clinical/biomedical equipment already has a real
// home in Radiology's own Equipment tab, OT's own Equipment tab, and
// Laboratory's own analyzers. Never duplicated here.
// ============================================================================

function resolveStaffName(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  return staffMembers.find((s) => s.id === staffId)?.name;
}
function resolveFacilityName(facilityId?: string): string {
  return facilities.find((f) => f.id === facilityId)?.name ?? "Unknown Facility";
}
function resolveDepartmentName(departmentId?: string): string | undefined {
  return departmentConfigs.find((d) => d.id === departmentId)?.name;
}

// --- Facility Status (spec §3) — reuses the real Facility.status field,
// never a second parallel status system. ------------------------------------

export function getFacilityStatusOverview() {
  return mockRequest(facilities.map((f) => ({ id: f.id, name: f.name, status: f.status as Facility["status"] })));
}

// --- Maintenance (spec §18-23) — Request and Work Order collapsed into one
// real ticket lifecycle (a maintenance request that becomes a work order is
// the same ticket progressing through status, not two separate records that
// could drift out of sync). --------------------------------------------------

export type FacilityMaintenanceCategory =
  | "electrical" | "plumbing" | "hvac" | "civil" | "structural" | "medical-gas"
  | "fire-safety" | "elevator" | "generator" | "it-infrastructure" | "biomedical-equipment" | "security-systems" | "other";

export type FacilityMaintenancePriority = "critical" | "high" | "medium" | "low";

export type FacilityWorkOrderStatus = "new" | "assigned" | "scheduled" | "in-progress" | "on-hold" | "completed" | "verification" | "closed" | "cancelled";

export interface FacilityWorkOrder {
  id: string;
  workOrderNumber: string;
  facilityId: string;
  departmentId?: string;
  location: string;
  category: FacilityMaintenanceCategory;
  priority: FacilityMaintenancePriority;
  problem: string;
  description?: string;
  status: FacilityWorkOrderStatus;
  reportedBy: string;
  assignedToId?: string;
  scheduledDate?: string;
  startedDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
}

let workOrderSeq = 0;
function nextWorkOrderNumber(): string {
  workOrderSeq += 1;
  return `WO-2026-${String(workOrderSeq).padStart(5, "0")}`;
}

function baseWorkOrder(partial: Omit<FacilityWorkOrder, "id" | "workOrderNumber">): FacilityWorkOrder {
  workOrderSeq += 1;
  return { id: `wo-${workOrderSeq}`, workOrderNumber: `WO-2026-${String(workOrderSeq).padStart(5, "0")}`, ...partial };
}

export const facilityWorkOrders: FacilityWorkOrder[] = [
  baseWorkOrder({
    facilityId: "fac-main-campus", departmentId: "dept-icu", location: "ICU — Room 303", category: "biomedical-equipment", priority: "critical",
    problem: "Ventilator port inspection overdue", status: "in-progress", reportedBy: resolveStaffName("marcus-chen") ?? "Marcus Chen",
    assignedToId: "waqas-anjum", scheduledDate: TODAY, startedDate: TODAY, createdAt: `${TODAY}T07:10:00`,
  }),
  baseWorkOrder({
    facilityId: "fac-main-campus", departmentId: "dept-icu", location: "ICU — HVAC Unit 3", category: "hvac", priority: "critical",
    problem: "ICU HVAC failure — temperature rising above safe threshold", status: "assigned", reportedBy: resolveStaffName("marcus-chen") ?? "Marcus Chen",
    assignedToId: "waqas-anjum", createdAt: `${TODAY}T06:15:00`,
  }),
  baseWorkOrder({
    facilityId: "fac-main-campus", departmentId: "dept-radiology", location: "Radiology — MRI Suite", category: "electrical", priority: "high",
    problem: "Intermittent power flicker on MRI suite circuit", status: "new", reportedBy: resolveStaffName("farah-chaudhry") ?? "Dr. Farah Chaudhry", createdAt: `${TODAY}T09:20:00`,
  }),
  baseWorkOrder({
    facilityId: "fac-main-campus", location: "Main Building — Elevator 2", category: "elevator", priority: "high",
    problem: "Elevator 2 out of service", status: "scheduled", reportedBy: DEFAULT_ACTOR, assignedToId: "waqas-anjum", scheduledDate: TODAY, createdAt: `${TODAY}T05:40:00`,
  }),
  baseWorkOrder({
    facilityId: "fac-main-campus", departmentId: "dept-pharmacy", location: "Pharmacy Store A", category: "hvac", priority: "medium",
    problem: "Room temperature slightly above cold-chain threshold", status: "completed", reportedBy: resolveStaffName("nadia-khokhar") ?? "Dr. Nadia Khokhar",
    assignedToId: "waqas-anjum", scheduledDate: "2026-08-13", startedDate: "2026-08-13", completedDate: "2026-08-13", actualCost: 180, createdAt: "2026-08-13T08:00:00",
  }),
  baseWorkOrder({
    facilityId: "fac-main-campus", location: "OPD — Waiting Area", category: "civil", priority: "low",
    problem: "Broken chair in waiting area", status: "closed", reportedBy: DEFAULT_ACTOR, assignedToId: "hira-shahid",
    scheduledDate: "2026-08-12", startedDate: "2026-08-12", completedDate: "2026-08-12", actualCost: 0, createdAt: "2026-08-12T10:00:00",
  }),
  baseWorkOrder({
    facilityId: "fac-north-clinic", location: "North Clinic — Generator", category: "generator", priority: "medium",
    problem: "Quarterly generator inspection due", status: "on-hold", reportedBy: DEFAULT_ACTOR, notes: "Awaiting vendor confirmation.", createdAt: `${TODAY}T11:00:00`,
  }),
];

export interface FacilityWorkOrderRow extends FacilityWorkOrder {
  facilityName: string;
  departmentName?: string;
  assignedToName?: string;
}

function toWorkOrderRow(w: FacilityWorkOrder): FacilityWorkOrderRow {
  return { ...w, facilityName: resolveFacilityName(w.facilityId), departmentName: resolveDepartmentName(w.departmentId), assignedToName: resolveStaffName(w.assignedToId) };
}

export function getFacilityWorkOrders(filters: { status?: FacilityWorkOrderStatus | "all"; priority?: FacilityMaintenancePriority | "all"; category?: FacilityMaintenanceCategory | "all"; facilityId?: string } = {}) {
  let rows = facilityWorkOrders.map(toWorkOrderRow);
  if (filters.status && filters.status !== "all") rows = rows.filter((r) => r.status === filters.status);
  if (filters.priority && filters.priority !== "all") rows = rows.filter((r) => r.priority === filters.priority);
  if (filters.category && filters.category !== "all") rows = rows.filter((r) => r.category === filters.category);
  if (filters.facilityId) rows = rows.filter((r) => r.facilityId === filters.facilityId);
  return mockRequest(rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export interface NewFacilityWorkOrderInput {
  facilityId: string;
  departmentId?: string;
  location: string;
  category: FacilityMaintenanceCategory;
  priority: FacilityMaintenancePriority;
  problem: string;
  description?: string;
  reportedBy?: string;
}

export function createFacilityWorkOrder(input: NewFacilityWorkOrderInput) {
  const workOrder = baseWorkOrder({ ...input, status: "new", reportedBy: input.reportedBy ?? DEFAULT_ACTOR, createdAt: `${TODAY}T${new Date().toTimeString().slice(0, 8)}` });
  facilityWorkOrders.push(workOrder);
  return mockRequest(toWorkOrderRow(workOrder));
}

export function assignFacilityWorkOrder(id: string, assignedToId: string) {
  const w = facilityWorkOrders.find((x) => x.id === id);
  if (!w) return mockRequest(null);
  w.assignedToId = assignedToId;
  w.status = "assigned";
  return mockRequest(toWorkOrderRow(w));
}

export function scheduleFacilityWorkOrder(id: string, scheduledDate: string) {
  const w = facilityWorkOrders.find((x) => x.id === id);
  if (!w) return mockRequest(null);
  w.scheduledDate = scheduledDate;
  w.status = "scheduled";
  return mockRequest(toWorkOrderRow(w));
}

export function updateFacilityWorkOrderStatus(id: string, status: FacilityWorkOrderStatus) {
  const w = facilityWorkOrders.find((x) => x.id === id);
  if (!w) return mockRequest(null);
  w.status = status;
  if (status === "in-progress" && !w.startedDate) w.startedDate = TODAY;
  if ((status === "completed" || status === "closed") && !w.completedDate) w.completedDate = TODAY;
  return mockRequest(toWorkOrderRow(w));
}

// --- Equipment (spec §26-29) — facility infrastructure only, never clinical
// equipment (that stays owned by Radiology/OT/Laboratory). ------------------

export type FacilityEquipmentCategory = "generator" | "hvac" | "elevator" | "fire-alarm" | "security-camera" | "access-control" | "medical-gas-system" | "water-pump" | "boiler" | "electrical-panel";
export type FacilityEquipmentStatus = "operational" | "maintenance" | "calibration" | "out-of-service" | "decommissioned";

export interface FacilityEquipmentItem {
  id: string;
  assetNumber: string;
  name: string;
  category: FacilityEquipmentCategory;
  facilityId: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  status: FacilityEquipmentStatus;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

export const facilityEquipment: FacilityEquipmentItem[] = [
  { id: "feq-1", assetNumber: "FE-0001", name: "Generator 01", category: "generator", facilityId: "fac-main-campus", location: "Main Building — Utility Room", manufacturer: "Caterpillar", model: "C15", serialNumber: "CAT-99213-A", purchaseDate: "2021-03-10", status: "operational", lastServiceDate: "2026-06-01", nextServiceDate: "2026-09-01" },
  { id: "feq-2", assetNumber: "FE-0002", name: "Elevator 02", category: "elevator", facilityId: "fac-main-campus", location: "Main Building — East Wing", manufacturer: "Otis", model: "Gen2", serialNumber: "OTIS-44213", purchaseDate: "2019-07-22", status: "out-of-service", lastServiceDate: "2026-05-15", nextServiceDate: `${TODAY}` },
  { id: "feq-3", assetNumber: "FE-0003", name: "HVAC Unit 3 — ICU", category: "hvac", facilityId: "fac-main-campus", location: "ICU Wing", manufacturer: "Carrier", model: "30XA", serialNumber: "CAR-88213", purchaseDate: "2020-01-15", status: "maintenance", lastServiceDate: "2026-07-01", nextServiceDate: "2026-08-17" },
  { id: "feq-4", assetNumber: "FE-0004", name: "Fire Alarm Panel — Main", category: "fire-alarm", facilityId: "fac-main-campus", location: "Main Building — Ground Floor", manufacturer: "Honeywell", model: "NFS2-3030", serialNumber: "HW-33210", purchaseDate: "2018-11-05", status: "operational", lastServiceDate: "2026-08-01", nextServiceDate: "2026-09-01" },
  { id: "feq-5", assetNumber: "FE-0005", name: "Medical Gas System — Central", category: "medical-gas-system", facilityId: "fac-main-campus", location: "Main Building — Basement B1", manufacturer: "Amico", model: "MG-500", serialNumber: "AM-77213", purchaseDate: "2019-04-20", status: "operational", lastServiceDate: "2026-07-15", nextServiceDate: "2026-10-15" },
  { id: "feq-6", assetNumber: "FE-0006", name: "Backup Generator — North Clinic", category: "generator", facilityId: "fac-north-clinic", location: "North Clinic — Utility Room", manufacturer: "Cummins", model: "C150", serialNumber: "CUM-22109", purchaseDate: "2022-02-01", status: "operational", lastServiceDate: "2026-06-20", nextServiceDate: "2026-09-20" },
  { id: "feq-7", assetNumber: "FE-0007", name: "Electrical Panel — Radiology", category: "electrical-panel", facilityId: "fac-main-campus", location: "Radiology Wing", manufacturer: "Schneider Electric", model: "PowerPact", serialNumber: "SE-11209", purchaseDate: "2020-09-12", status: "calibration", lastServiceDate: "2026-07-20", nextServiceDate: "2026-08-20" },
];

export interface FacilityEquipmentRow extends FacilityEquipmentItem {
  facilityName: string;
}

export function getFacilityEquipment(filters: { status?: FacilityEquipmentStatus | "all"; category?: FacilityEquipmentCategory | "all"; facilityId?: string } = {}) {
  let rows: FacilityEquipmentRow[] = facilityEquipment.map((e) => ({ ...e, facilityName: resolveFacilityName(e.facilityId) }));
  if (filters.status && filters.status !== "all") rows = rows.filter((r) => r.status === filters.status);
  if (filters.category && filters.category !== "all") rows = rows.filter((r) => r.category === filters.category);
  if (filters.facilityId) rows = rows.filter((r) => r.facilityId === filters.facilityId);
  return mockRequest(rows);
}

export function updateFacilityEquipmentStatus(id: string, status: FacilityEquipmentStatus) {
  const item = facilityEquipment.find((e) => e.id === id);
  if (!item) return mockRequest(null);
  item.status = status;
  if (status === "operational") item.lastServiceDate = TODAY;
  return mockRequest(item);
}

// --- Facility Incidents (spec §42-43) — something that actually happened,
// distinct from a routine maintenance request. A simplified 5-state
// workflow captures the same real lifecycle without over-modeling every
// micro-step the spec's own diagram shows. -----------------------------------

export type FacilityIncidentCategory = "water-leak" | "power-outage" | "fire-alarm" | "elevator-failure" | "hvac-failure" | "security" | "medical-gas-failure" | "structural" | "flooding" | "equipment-failure";
export type FacilityIncidentSeverity = "critical" | "high" | "medium" | "low";
export type FacilityIncidentStatus = "reported" | "investigating" | "corrective-action" | "resolved" | "closed";

export interface FacilityIncident {
  id: string;
  incidentNumber: string;
  facilityId: string;
  departmentId?: string;
  location: string;
  category: FacilityIncidentCategory;
  severity: FacilityIncidentSeverity;
  description: string;
  reportedBy: string;
  assignedToId?: string;
  status: FacilityIncidentStatus;
  actionsTaken?: string;
  rootCause?: string;
  resolution?: string;
  reportedAt: string;
  resolvedAt?: string;
}

let incidentSeq = 0;
function baseIncident(partial: Omit<FacilityIncident, "id" | "incidentNumber">): FacilityIncident {
  incidentSeq += 1;
  return { id: `inc-${incidentSeq}`, incidentNumber: `INC-2026-${String(incidentSeq).padStart(5, "0")}`, ...partial };
}

export const facilityIncidents: FacilityIncident[] = [
  baseIncident({
    facilityId: "fac-main-campus", departmentId: "dept-icu", location: "ICU Wing", category: "hvac-failure", severity: "critical",
    description: "ICU HVAC failure — temperature rising above safe threshold for patient care", reportedBy: resolveStaffName("marcus-chen") ?? "Marcus Chen",
    assignedToId: "waqas-anjum", status: "investigating", reportedAt: `${TODAY}T06:20:00`,
  }),
  baseIncident({
    facilityId: "fac-main-campus", location: "Main Building — East Wing", category: "elevator-failure", severity: "high",
    description: "Elevator 2 stopped between floors, passengers safely evacuated by maintenance staff", reportedBy: DEFAULT_ACTOR,
    assignedToId: "waqas-anjum", status: "corrective-action", actionsTaken: "Elevator taken out of service, technician dispatched.", reportedAt: `${TODAY}T05:45:00`,
  }),
  baseIncident({
    facilityId: "fac-main-campus", departmentId: "dept-pharmacy", location: "Pharmacy Store A", category: "hvac-failure", severity: "medium",
    description: "Cold-chain storage temperature briefly exceeded threshold overnight", reportedBy: resolveStaffName("nadia-khokhar") ?? "Dr. Nadia Khokhar",
    status: "resolved", rootCause: "HVAC filter partially clogged.", resolution: "Filter replaced, temperature restored to safe range — no stock loss confirmed.", reportedAt: "2026-08-13T22:00:00", resolvedAt: "2026-08-13T23:10:00",
  }),
  baseIncident({
    facilityId: "fac-main-campus", location: "Radiology Wing", category: "power-outage", severity: "low",
    description: "Brief power flicker on MRI suite circuit, no equipment interruption", reportedBy: resolveStaffName("farah-chaudhry") ?? "Dr. Farah Chaudhry",
    status: "closed", rootCause: "Grid fluctuation, confirmed by facilities electrician.", resolution: "No corrective action required — logged for monitoring.", reportedAt: "2026-08-12T14:00:00", resolvedAt: "2026-08-12T14:30:00",
  }),
];

export interface FacilityIncidentRow extends FacilityIncident {
  facilityName: string;
  departmentName?: string;
  assignedToName?: string;
}

function toIncidentRow(i: FacilityIncident): FacilityIncidentRow {
  return { ...i, facilityName: resolveFacilityName(i.facilityId), departmentName: resolveDepartmentName(i.departmentId), assignedToName: resolveStaffName(i.assignedToId) };
}

export function getFacilityIncidents(filters: { status?: FacilityIncidentStatus | "all"; severity?: FacilityIncidentSeverity | "all" } = {}) {
  let rows = facilityIncidents.map(toIncidentRow);
  if (filters.status && filters.status !== "all") rows = rows.filter((r) => r.status === filters.status);
  if (filters.severity && filters.severity !== "all") rows = rows.filter((r) => r.severity === filters.severity);
  return mockRequest(rows.sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : -1)));
}

export interface NewFacilityIncidentInput {
  facilityId: string;
  departmentId?: string;
  location: string;
  category: FacilityIncidentCategory;
  severity: FacilityIncidentSeverity;
  description: string;
  reportedBy?: string;
}

export function createFacilityIncident(input: NewFacilityIncidentInput) {
  const incident = baseIncident({ ...input, reportedBy: input.reportedBy ?? DEFAULT_ACTOR, status: "reported", reportedAt: `${TODAY}T${new Date().toTimeString().slice(0, 8)}` });
  facilityIncidents.push(incident);
  return mockRequest(toIncidentRow(incident));
}

export function updateFacilityIncidentStatus(id: string, status: FacilityIncidentStatus, updates: { actionsTaken?: string; rootCause?: string; resolution?: string } = {}) {
  const incident = facilityIncidents.find((i) => i.id === id);
  if (!incident) return mockRequest(null);
  incident.status = status;
  Object.assign(incident, updates);
  if ((status === "resolved" || status === "closed") && !incident.resolvedAt) incident.resolvedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  return mockRequest(toIncidentRow(incident));
}

// --- Facilities Overview Dashboard (spec §2) — every KPI computed from the
// real physical hierarchy + the real operational data above. ---------------

export interface FacilitiesOverviewData {
  totalFacilities: number;
  totalFloors: number;
  totalRooms: number;
  operationalRooms: number;
  openWorkOrders: number;
  criticalWorkOrders: number;
  equipmentUnderMaintenance: number;
  openIncidents: number;
}

export function getFacilitiesOverview(): FacilitiesOverviewData {
  const openStatuses: FacilityWorkOrderStatus[] = ["new", "assigned", "scheduled", "in-progress", "on-hold"];
  const openWorkOrders = facilityWorkOrders.filter((w) => openStatuses.includes(w.status));
  const openIncidentStatuses: FacilityIncidentStatus[] = ["reported", "investigating", "corrective-action"];
  return {
    totalFacilities: facilities.length,
    totalFloors: floors.length,
    totalRooms: rooms.length,
    operationalRooms: rooms.filter((r) => r.status === "active").length,
    openWorkOrders: openWorkOrders.length,
    criticalWorkOrders: openWorkOrders.filter((w) => w.priority === "critical").length,
    equipmentUnderMaintenance: facilityEquipment.filter((e) => e.status === "maintenance" || e.status === "calibration" || e.status === "out-of-service").length,
    openIncidents: facilityIncidents.filter((i) => openIncidentStatuses.includes(i.status)).length,
  };
}
