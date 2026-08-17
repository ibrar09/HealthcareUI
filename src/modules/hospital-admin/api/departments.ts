import { mockRequest } from "@shared/lib/api/client";
import { departmentConfigs, departmentTypes, facilities, floors, wards, rooms, beds, type DepartmentConfig } from "./facilities";
import { staffMembers, practitionerRoleSeeds, resolveHeadName, countDepartmentStaff } from "./staff";
import { billableServices, type BillableService } from "./billing";
import { appointmentTypes, type AppointmentTypeConfig } from "./appointments";

// ============================================================================
// Department Management — ORGANIZATION_HIERARCHY_SPEC.md §2
// Real create/edit/activate-deactivate, and assignment of head/location/
// services/staff/appointment types/working hours, plus a read-only rollup of
// this department's rooms/beds (already joined via Ward.departmentId — no
// new Unit entity, since Ward already plays that role, per the spec audit).
// This also fixes a pre-existing bug: the Facilities "Departments" tab's
// create/edit previously only mutated local React state in FacilityList.tsx
// and never touched this module, so changes vanished on navigation. These
// functions are now the real, persisted source of truth.
// ============================================================================


export interface DepartmentDirectoryRow {
  id: string;
  facilityId: string;
  facilityName: string;
  name: string;
  code: string;
  category: DepartmentConfig["category"];
  typeId: string;
  typeName: string;
  typeAccentColor: string;
  headDoctorId: string;
  headDoctorName: string;
  floorId?: string;
  floorName?: string;
  active: boolean;
  operationalStatus: DepartmentConfig["operationalStatus"];
  totalStaffCount: number;
}

function toDepartmentDirectoryRow(d: DepartmentConfig): DepartmentDirectoryRow {
  const facility = facilities.find((f) => f.id === d.facilityId);
  const type = departmentTypes.find((t) => t.id === d.typeId);
  const floor = d.floorId ? floors.find((f) => f.id === d.floorId) : undefined;
  return {
    id: d.id,
    facilityId: d.facilityId,
    facilityName: facility?.name ?? "Unknown",
    name: d.name,
    code: d.code,
    category: d.category,
    typeId: d.typeId,
    typeName: type?.name ?? "Unknown",
    typeAccentColor: type?.accentColor ?? "var(--outline)",
    headDoctorId: d.headDoctorId,
    headDoctorName: resolveHeadName(d.headDoctorId),
    floorId: d.floorId,
    floorName: floor?.name,
    active: d.active,
    operationalStatus: d.operationalStatus,
    totalStaffCount: countDepartmentStaff(d.id),
  };
}

export function getDepartmentDirectory() {
  return mockRequest(departmentConfigs.map(toDepartmentDirectoryRow));
}

export interface DepartmentStaffMemberRow {
  id: string;
  name: string;
  role: string;
  title: string;
}

export interface DepartmentServiceRow {
  code: string;
  name: string;
  department: string;
  standardPrice: number;
}

export interface DepartmentAppointmentTypeRow {
  id: string;
  name: string;
}

export interface DepartmentBedSummary {
  wards: number;
  rooms: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
}

export interface DepartmentDetail extends DepartmentDirectoryRow {
  primaryStaff: DepartmentStaffMemberRow[];
  additionalStaff: DepartmentStaffMemberRow[];
  assignedServices: DepartmentServiceRow[];
  assignedAppointmentTypes: DepartmentAppointmentTypeRow[];
  workingHours?: { workingDays: string[]; startTime: string; endTime: string };
  bedSummary: DepartmentBedSummary;
}

function toStaffRow(practitionerRoleId: string): DepartmentStaffMemberRow | null {
  const member = staffMembers.find((s) => s.id === practitionerRoleId);
  if (!member) return null;
  return { id: member.id, name: member.name, role: member.role, title: member.title };
}

export function getDepartment(id: string) {
  const dept = departmentConfigs.find((d) => d.id === id);
  if (!dept) return mockRequest(null as DepartmentDetail | null);
  const row = toDepartmentDirectoryRow(dept);
  const primaryStaff = practitionerRoleSeeds.filter((r) => r.departmentId === id).map((r) => toStaffRow(r.id)).filter((s): s is DepartmentStaffMemberRow => Boolean(s));
  const additionalStaff = dept.additionalStaffIds.map(toStaffRow).filter((s): s is DepartmentStaffMemberRow => Boolean(s));
  const assignedServices: DepartmentServiceRow[] = dept.serviceCodes
    .map((code) => billableServices.find((s) => s.code === code))
    .filter((s): s is BillableService => Boolean(s))
    .map((s) => ({ code: s.code, name: s.name, department: s.department, standardPrice: s.standardPrice }));
  const assignedAppointmentTypes: DepartmentAppointmentTypeRow[] = dept.appointmentTypeIds
    .map((id2) => appointmentTypes.find((t) => t.id === id2))
    .filter((t): t is AppointmentTypeConfig => Boolean(t))
    .map((t) => ({ id: t.id, name: t.name }));
  const deptWards = wards.filter((w) => w.departmentId === id);
  const deptRooms = rooms.filter((r) => deptWards.some((w) => w.id === r.wardId));
  const deptBeds = beds.filter((b) => deptRooms.some((r) => r.id === b.roomId));
  const bedSummary: DepartmentBedSummary = {
    wards: deptWards.length,
    rooms: deptRooms.length,
    totalBeds: deptBeds.length,
    availableBeds: deptBeds.filter((b) => b.status === "available").length,
    occupiedBeds: deptBeds.filter((b) => b.status === "occupied").length,
  };
  return mockRequest({ ...row, primaryStaff, additionalStaff, assignedServices, assignedAppointmentTypes, workingHours: dept.workingHours, bedSummary } satisfies DepartmentDetail);
}

export interface NewDepartmentInput {
  facilityId: string;
  name: string;
  code: string;
  category: DepartmentConfig["category"];
  typeId: string;
  headDoctorId: string;
  floorId?: string;
}

export function createDepartment(input: NewDepartmentInput) {
  const dept: DepartmentConfig = {
    ...input,
    id: `dept-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${departmentConfigs.length}`,
    active: true,
    operationalStatus: "normal",
    additionalStaffIds: [],
    serviceCodes: [],
    appointmentTypeIds: [],
  };
  departmentConfigs.push(dept);
  return mockRequest(toDepartmentDirectoryRow(dept));
}

export function updateDepartment(id: string, updates: Partial<NewDepartmentInput>) {
  const dept = departmentConfigs.find((d) => d.id === id);
  if (!dept) throw new Error("Department not found");
  Object.assign(dept, updates);
  return mockRequest(toDepartmentDirectoryRow(dept));
}

export function setDepartmentActive(id: string, active: boolean) {
  const dept = departmentConfigs.find((d) => d.id === id);
  if (!dept) throw new Error("Department not found");
  dept.active = active;
  return mockRequest(toDepartmentDirectoryRow(dept));
}

export function assignDepartmentStaff(id: string, additionalStaffIds: string[]) {
  const dept = departmentConfigs.find((d) => d.id === id);
  if (!dept) throw new Error("Department not found");
  dept.additionalStaffIds = additionalStaffIds;
  return mockRequest(toDepartmentDirectoryRow(dept));
}

export function assignDepartmentServices(id: string, serviceCodes: string[]) {
  const dept = departmentConfigs.find((d) => d.id === id);
  if (!dept) throw new Error("Department not found");
  dept.serviceCodes = serviceCodes;
  return mockRequest(toDepartmentDirectoryRow(dept));
}

export function assignDepartmentAppointmentTypes(id: string, appointmentTypeIds: string[]) {
  const dept = departmentConfigs.find((d) => d.id === id);
  if (!dept) throw new Error("Department not found");
  dept.appointmentTypeIds = appointmentTypeIds;
  return mockRequest(toDepartmentDirectoryRow(dept));
}

export function setDepartmentWorkingHours(id: string, workingHours: { workingDays: string[]; startTime: string; endTime: string }) {
  const dept = departmentConfigs.find((d) => d.id === id);
  if (!dept) throw new Error("Department not found");
  dept.workingHours = workingHours;
  return mockRequest(toDepartmentDirectoryRow(dept));
}

// Legacy simple join getter — still used directly by Appointments/Beds/Staff
// screens for id/name dropdowns, distinct from the richer getDepartmentDirectory() above.
export const getDepartmentConfigs = () =>
  mockRequest(departmentConfigs.map((d) => ({ ...d, headDoctorName: resolveHeadName(d.headDoctorId) })));
