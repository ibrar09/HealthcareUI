import { mockRequest } from "@shared/lib/api/client";

// Organization / Facility — FHIR `Organization` (HMS_DOMAIN_STANDARDS.md §4).
// A Facility carries its own identifier and a reference to the parent
// organization — never just a display name standing in for identity.

export interface Facility {
  id: string;
  identifier: string;
  parentOrganization: string;
  name: string;
  type: "campus" | "clinic" | "diagnostic";
  address: string;
  city: string;
  district: string;
  beds: number;
  occupiedBeds: number;
  staff: number;
  departments: number;
  phone: string;
  email: string;
  status: "active" | "maintenance";
  accentColor: string;
}

export const facilities: Facility[] = [
  {
    id: "fac-main-campus",
    identifier: "FAC-001",
    parentOrganization: "City General Health Network",
    name: "Main Campus",
    type: "campus",
    address: "14 Aslam Road, Lahore",
    city: "Lahore",
    district: "District 1",
    beds: 342,
    occupiedBeds: 267,
    staff: 142,
    departments: 24,
    phone: "+92 42 111 000 001",
    email: "main.campus@citygeneral.org",
    status: "active",
    accentColor: "var(--signal-indigo)",
  },
  {
    id: "fac-north-clinic",
    identifier: "FAC-002",
    parentOrganization: "City General Health Network",
    name: "North Clinic",
    type: "clinic",
    address: "8 Canal View, Lahore",
    city: "Lahore",
    district: "District 3",
    beds: 40,
    occupiedBeds: 22,
    staff: 22,
    departments: 6,
    phone: "+92 42 111 000 002",
    email: "north.clinic@citygeneral.org",
    status: "active",
    accentColor: "var(--vital-green)",
  },
  {
    id: "fac-diagnostic-center",
    identifier: "FAC-003",
    parentOrganization: "City General Health Network",
    name: "Diagnostic Center",
    type: "diagnostic",
    address: "3 Mall Road, Lahore",
    city: "Lahore",
    district: "District 1",
    beds: 0,
    occupiedBeds: 0,
    staff: 18,
    departments: 3,
    phone: "+92 42 111 000 003",
    email: "diagnostics@citygeneral.org",
    status: "maintenance",
    accentColor: "var(--caution-amber)",
  },
];

const facilityActivity = [
  { text: "Scheduled maintenance started at Diagnostic Center", time: "2h ago", tone: "warning" as const },
  { text: "12 new staff onboarded at Main Campus", time: "1 day ago", tone: "success" as const },
  { text: "North Clinic bed capacity expanded to 40", time: "3 days ago", tone: "info" as const },
  { text: "Fire safety inspection completed — Main Campus", time: "5 days ago", tone: "success" as const },
];

// Department Types — ORGANIZATION_HIERARCHY_SPEC.md §5: a configurable
// classification lookup (Clinical/Diagnostic/Therapeutic/.../Critical Care),
// never a hardcoded assumption that every department is clinical. Mirrors
// the BedTypeConfig pattern (id/name/description/accentColor/active).

export interface DepartmentTypeConfig {
  id: string;
  name: string;
  description?: string;
  accentColor: string;
  active: boolean;
}

export const departmentTypes: DepartmentTypeConfig[] = [
  { id: "dt-clinical", name: "Clinical", description: "General clinical specialty care", accentColor: "var(--signal-indigo)", active: true },
  { id: "dt-diagnostic", name: "Diagnostic", description: "Lab, imaging, and other diagnostic services", accentColor: "var(--module-radiology)", active: true },
  { id: "dt-therapeutic", name: "Therapeutic", description: "Physiotherapy, rehabilitation, and therapy services", accentColor: "var(--vital-green)", active: true },
  { id: "dt-pharmacy", name: "Pharmacy", description: "Medication dispensing and management", accentColor: "var(--caution-amber)", active: true },
  { id: "dt-administrative", name: "Administrative", description: "Non-clinical administrative functions", accentColor: "var(--outline)", active: true },
  { id: "dt-support", name: "Support", description: "Support services (housekeeping, transport, etc.)", accentColor: "var(--outline)", active: true },
  { id: "dt-emergency", name: "Emergency", description: "Emergency and urgent care", accentColor: "var(--pulse-coral)", active: true },
  { id: "dt-inpatient", name: "Inpatient", description: "Inpatient/admitted care", accentColor: "var(--sunset-coral)", active: true },
  { id: "dt-outpatient", name: "Outpatient", description: "Outpatient/ambulatory care", accentColor: "var(--signal-indigo-light)", active: true },
  { id: "dt-surgical", name: "Surgical", description: "Surgical and operative care", accentColor: "var(--pulse-coral)", active: true },
  { id: "dt-critical-care", name: "Critical Care", description: "ICU/CCU and other critical care units", accentColor: "var(--sunset-coral)", active: true },
];

export function getDepartmentTypes(filters: { includeInactive?: boolean } = {}) {
  return mockRequest(filters.includeInactive ? departmentTypes : departmentTypes.filter((t) => t.active));
}

export interface NewDepartmentTypeInput {
  name: string;
  description?: string;
  accentColor: string;
}

export function createDepartmentType(input: NewDepartmentTypeInput) {
  const type: DepartmentTypeConfig = { id: `dt-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${departmentTypes.length}`, ...input, active: true };
  departmentTypes.push(type);
  return mockRequest(type);
}

export function updateDepartmentType(id: string, updates: Partial<NewDepartmentTypeInput>) {
  const type = departmentTypes.find((t) => t.id === id);
  if (type) Object.assign(type, updates);
  return mockRequest(type ?? null);
}

export function setDepartmentTypeActive(id: string, active: boolean) {
  const type = departmentTypes.find((t) => t.id === id);
  if (type) type.active = active;
  return mockRequest(type ?? null);
}

// Department — HMS_DOMAIN_STANDARDS.md §11: id, parent facility, and a
// department head *reference* (not a disconnected free-text name that can
// silently drift from the actual staff directory).
//
// `operationalStatus` (renamed from the old `status` field) is a live-load
// indicator (normal/critical/overload/optimal) — NOT the same thing as
// `active`, the real create/deactivate lifecycle state the spec asks for.
// `additionalStaffIds` is deliberately separate from each staff member's own
// (still single) `PractitionerRole.departmentId` — this phase adds a
// department-side "also works here" roster without rewriting Staff into a
// multi-department model, which is its own later phase (ORGANIZATION_HIERARCHY_SPEC.md
// §6). A department's *primary* staff are still derived from PractitionerRole,
// never duplicated here.

export interface DepartmentConfig {
  id: string;
  facilityId: string;
  name: string;
  code: string;
  category: "cardiology" | "emergency" | "radiology" | "laboratory" | "opd" | "pediatrics" | "orthopedics" | "surgery" | "pharmacy" | "other";
  typeId: string;
  headDoctorId: string;
  floorId?: string;
  active: boolean;
  operationalStatus: "normal" | "critical" | "overload" | "optimal";
  additionalStaffIds: string[];
  serviceCodes: string[];
  appointmentTypeIds: string[];
  workingHours?: { workingDays: string[]; startTime: string; endTime: string };
}

const departmentConfigSeeds: DepartmentConfig[] = [
  {
    id: "dept-cardiology", facilityId: "fac-main-campus", name: "Cardiology", code: "CARD", category: "cardiology", typeId: "dt-clinical",
    headDoctorId: "sarah-jenkins", floorId: "floor-main-4", active: true, operationalStatus: "critical",
    additionalStaffIds: [], serviceCodes: ["CONS-002"], appointmentTypeIds: ["at-new-patient", "at-follow-up", "at-consultation"],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "08:00", endTime: "17:00" },
  },
  {
    id: "dept-opd", facilityId: "fac-main-campus", name: "OPD", code: "OPD", category: "opd", typeId: "dt-outpatient",
    headDoctorId: "michael-chen", floorId: "floor-main-1", active: true, operationalStatus: "normal",
    additionalStaffIds: [], serviceCodes: ["CONS-001"], appointmentTypeIds: ["at-new-patient", "at-follow-up", "at-annual-checkup"],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], startTime: "08:00", endTime: "20:00" },
  },
  {
    id: "dept-emergency", facilityId: "fac-main-campus", name: "Emergency", code: "ER", category: "emergency", typeId: "dt-emergency",
    headDoctorId: "nadia-farhan", floorId: "floor-main-ground", active: true, operationalStatus: "overload",
    additionalStaffIds: ["nadia-farhan", "imran-qureshi", "samina-riaz", "fahad-siddique"], serviceCodes: ["BED-ER"], appointmentTypeIds: [],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], startTime: "00:00", endTime: "23:59" },
  },
  {
    id: "dept-radiology", facilityId: "fac-main-campus", name: "Radiology", code: "RAD", category: "radiology", typeId: "dt-diagnostic",
    headDoctorId: "elena-rostova", floorId: "floor-main-b1", active: true, operationalStatus: "optimal",
    additionalStaffIds: [], serviceCodes: ["RAD-001", "RAD-002"], appointmentTypeIds: ["at-procedure"],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], startTime: "07:00", endTime: "19:00" },
  },
  {
    id: "dept-icu", facilityId: "fac-main-campus", name: "Intensive Care", code: "ICU", category: "other", typeId: "dt-critical-care",
    headDoctorId: "marcus-chen", floorId: "floor-main-3", active: true, operationalStatus: "optimal",
    additionalStaffIds: [], serviceCodes: ["BED-ICU"], appointmentTypeIds: [],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], startTime: "00:00", endTime: "23:59" },
  },
  {
    id: "dept-neurology", facilityId: "fac-main-campus", name: "Neurology", code: "NEURO", category: "other", typeId: "dt-clinical",
    headDoctorId: "robert-vance", floorId: "floor-main-5", active: true, operationalStatus: "normal",
    additionalStaffIds: [], serviceCodes: [], appointmentTypeIds: ["at-consultation", "at-follow-up"],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "09:00", endTime: "16:00" },
  },
  {
    id: "dept-laboratory", facilityId: "fac-main-campus", name: "Laboratory", code: "LAB", category: "laboratory", typeId: "dt-diagnostic",
    headDoctorId: "amina-farooqi", floorId: "floor-main-b1", active: true, operationalStatus: "normal",
    additionalStaffIds: [], serviceCodes: [], appointmentTypeIds: [],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], startTime: "06:00", endTime: "22:00" },
  },
  {
    id: "dept-ot", facilityId: "fac-main-campus", name: "Operation Theatre", code: "OT", category: "surgery", typeId: "dt-surgical",
    headDoctorId: "ahmed-hassan", floorId: "floor-main-3", active: true, operationalStatus: "normal",
    additionalStaffIds: [], serviceCodes: [], appointmentTypeIds: [],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], startTime: "00:00", endTime: "23:59" },
  },
  {
    id: "dept-pharmacy", facilityId: "fac-main-campus", name: "Pharmacy", code: "PHARM", category: "pharmacy", typeId: "dt-pharmacy",
    headDoctorId: "nadia-khokhar", floorId: "floor-main-1", active: true, operationalStatus: "normal",
    additionalStaffIds: [], serviceCodes: [], appointmentTypeIds: [],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], startTime: "07:00", endTime: "22:00" },
  },
  {
    id: "dept-inventory", facilityId: "fac-main-campus", name: "Inventory & Procurement", code: "INV", category: "other", typeId: "dt-support",
    headDoctorId: "waqas-anjum", floorId: "floor-main-b1", active: true, operationalStatus: "normal",
    additionalStaffIds: [], serviceCodes: [], appointmentTypeIds: [],
    workingHours: { workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], startTime: "07:00", endTime: "19:00" },
  },
];

/** The live, mutable Department array everything else joins against — seeded from `departmentConfigSeeds` above. */
export const departmentConfigs: DepartmentConfig[] = departmentConfigSeeds;

// Location hierarchy — FHIR `Location` (HMS_DOMAIN_STANDARDS.md §12):
// Hospital → Building → Floor → Ward → Room → Bed. `Facility` above already
// models the Building level; this models the physical structure underneath it.
// A Bed here is inventory/config (what beds exist, their type, current status) —
// the admission/transfer *workflow* on top of this belongs to Bed Management
// (IPD), which this data model is the prerequisite for, not a duplicate of.

export interface Floor {
  id: string;
  facilityId: string;
  name: string;
  level: number;
}

export type WardType = "general" | "icu" | "maternity" | "pediatric" | "isolation" | "surgical" | "emergency";

export interface Ward {
  id: string;
  floorId: string;
  facilityId: string;
  departmentId?: string;
  name: string;
  code: string;
  type: WardType;
  nurseStation?: string;
  status: "active" | "closed";
}

export type RoomType = "private" | "semi-private" | "general" | "isolation";
export type GenderRestriction = "male" | "female" | "any";

export interface Room {
  id: string;
  wardId: string;
  name: string;
  type: RoomType;
  capacity: number;
  genderRestriction: GenderRestriction;
  isolationCapable: boolean;
  status: "active" | "closed";
}

// Bed types are hospital-configurable, never hardcoded into the frontend
// (HMS Bed Management spec §5) — this is a lookup table, not a TS union.
export interface BedTypeConfig {
  id: string;
  name: string;
  description?: string;
  accentColor: string;
  active: boolean;
}

export const bedTypes: BedTypeConfig[] = [
  { id: "bt-standard", name: "Standard", description: "General inpatient bed", accentColor: "var(--signal-indigo)", active: true },
  { id: "bt-icu", name: "ICU", description: "Intensive care, continuous monitoring", accentColor: "var(--pulse-coral)", active: true },
  { id: "bt-isolation", name: "Isolation", description: "Negative/positive pressure isolation bed", accentColor: "var(--sunset-coral)", active: true },
  { id: "bt-emergency", name: "Emergency", description: "ER bay bed", accentColor: "var(--caution-amber)", active: true },
  { id: "bt-post-op", name: "Post-operative", description: "Recovery bed after surgery", accentColor: "var(--module-radiology)", active: true },
  { id: "bt-observation", name: "Observation", description: "Short-stay observation bed", accentColor: "var(--outline)", active: true },
];

export function getBedTypes(filters: { includeInactive?: boolean } = {}) {
  return mockRequest(filters.includeInactive ? bedTypes : bedTypes.filter((t) => t.active));
}

export interface NewBedTypeInput {
  name: string;
  description?: string;
  accentColor: string;
}

/** Bed Types are hospital-configurable, never hardcoded (spec §5) — Phase 4 config screen. */
export function createBedType(input: NewBedTypeInput) {
  const newType: BedTypeConfig = { id: `bt-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${bedTypes.length}`, ...input, active: true };
  bedTypes.push(newType);
  return mockRequest(newType);
}

export function updateBedType(id: string, updates: Partial<NewBedTypeInput>) {
  const index = bedTypes.findIndex((t) => t.id === id);
  if (index !== -1) bedTypes[index] = { ...bedTypes[index], ...updates };
  return mockRequest(bedTypes[index] ?? null);
}

export function setBedTypeActive(id: string, active: boolean) {
  const type = bedTypes.find((t) => t.id === id);
  if (type) type.active = active;
  return mockRequest(type ?? null);
}

// Core statuses only (HMS Bed Management spec §4) — isolation is modeled as a
// bed *property* (`isolationRequired`/`isolationType`) rather than a status,
// since a bed can be simultaneously occupied AND isolation-precaution, which a
// mutually-exclusive status value can't express.
export type BedStatus = "available" | "reserved" | "occupied" | "cleaning" | "maintenance" | "blocked" | "out-of-service";

export interface Bed {
  id: string;
  identifier: string;
  roomId: string;
  bedTypeId: string;
  status: BedStatus;
  // Occupancy
  patientId?: string;
  assignedStaffId?: string;
  admissionDate?: string;
  expectedDischargeDate?: string;
  // Reservation (spec §11) — for a patient not yet admitted
  reservedForPatientId?: string;
  expectedAdmissionDate?: string;
  reservationReason?: string;
  reservedBy?: string;
  // Blocking (spec §22)
  blockedReason?: string;
  blockedFrom?: string;
  blockedUntil?: string;
  // Maintenance (spec §17)
  maintenanceIssue?: string;
  maintenanceReportedOn?: string;
  // Isolation (spec §15) — independent of status
  isolationRequired?: boolean;
  isolationType?: "contact" | "droplet" | "airborne" | "protective" | "other";
  // Decommissioning (spec §29) — permanent inventory removal, distinct from maintenance/block
  outOfServiceReason?: string;
  lastUpdated: string;
}

export const floors: Floor[] = [
  { id: "floor-main-1", facilityId: "fac-main-campus", name: "Floor 1 — Main Hall", level: 1 },
  { id: "floor-main-3", facilityId: "fac-main-campus", name: "Floor 3 — ICU Wing", level: 3 },
  { id: "floor-main-4", facilityId: "fac-main-campus", name: "Floor 4 — East Wing", level: 4 },
  { id: "floor-main-5", facilityId: "fac-main-campus", name: "Floor 5 — West Wing", level: 5 },
  { id: "floor-main-ground", facilityId: "fac-main-campus", name: "Ground Floor — South Wing", level: 0 },
  { id: "floor-main-b1", facilityId: "fac-main-campus", name: "Basement B1", level: -1 },
];

export const wards: Ward[] = [
  { id: "ward-icu", floorId: "floor-main-3", facilityId: "fac-main-campus", departmentId: "dept-icu", name: "ICU", code: "ICU", type: "icu", nurseStation: "ICU Nurse Station 1", status: "active" },
  { id: "ward-cardiology-a", floorId: "floor-main-4", facilityId: "fac-main-campus", departmentId: "dept-cardiology", name: "Cardiology Ward A", code: "CARD-A", type: "general", nurseStation: "4E Nurse Station", status: "active" },
  { id: "ward-emergency-bay", floorId: "floor-main-ground", facilityId: "fac-main-campus", departmentId: "dept-emergency", name: "Emergency Bay", code: "ER", type: "emergency", nurseStation: "ER Triage Desk", status: "active" },
  { id: "ward-post-op", floorId: "floor-main-4", facilityId: "fac-main-campus", name: "Post-Operative Ward", code: "POST-OP", type: "surgical", nurseStation: "4W Nurse Station", status: "active" },
];

export const rooms: Room[] = [
  { id: "room-301", wardId: "ward-icu", name: "Room 301", type: "isolation", capacity: 2, genderRestriction: "any", isolationCapable: true, status: "active" },
  { id: "room-302", wardId: "ward-icu", name: "Room 302", type: "private", capacity: 2, genderRestriction: "any", isolationCapable: false, status: "active" },
  { id: "room-303", wardId: "ward-icu", name: "Room 303", type: "private", capacity: 2, genderRestriction: "any", isolationCapable: false, status: "active" },
  { id: "room-401", wardId: "ward-cardiology-a", name: "Room 401", type: "semi-private", capacity: 2, genderRestriction: "male", isolationCapable: false, status: "active" },
  { id: "room-402", wardId: "ward-cardiology-a", name: "Room 402", type: "semi-private", capacity: 2, genderRestriction: "female", isolationCapable: false, status: "active" },
  { id: "room-403", wardId: "ward-cardiology-a", name: "Room 403", type: "general", capacity: 2, genderRestriction: "any", isolationCapable: false, status: "active" },
  { id: "room-bay-1", wardId: "ward-emergency-bay", name: "Bay 1", type: "general", capacity: 2, genderRestriction: "any", isolationCapable: false, status: "active" },
  { id: "room-bay-2", wardId: "ward-emergency-bay", name: "Bay 2", type: "general", capacity: 2, genderRestriction: "any", isolationCapable: false, status: "active" },
  { id: "room-501", wardId: "ward-post-op", name: "Room 501", type: "semi-private", capacity: 2, genderRestriction: "any", isolationCapable: false, status: "active" },
  { id: "room-502", wardId: "ward-post-op", name: "Room 502", type: "private", capacity: 1, genderRestriction: "any", isolationCapable: false, status: "active" },
];

export const beds: Bed[] = [
  { id: "bed-301-a", identifier: "ICU-301-A", roomId: "room-301", bedTypeId: "bt-isolation", status: "cleaning", lastUpdated: "2026-08-14" },
  { id: "bed-301-b", identifier: "ICU-301-B", roomId: "room-301", bedTypeId: "bt-isolation", status: "available", lastUpdated: "2026-08-10" },
  { id: "bed-302-a", identifier: "ICU-302-A", roomId: "room-302", bedTypeId: "bt-icu", status: "occupied", patientId: "p-bilal-hussain", assignedStaffId: "sarah-jenkins", admissionDate: "2026-08-12", expectedDischargeDate: "2026-08-18", isolationRequired: true, isolationType: "contact", lastUpdated: "2026-08-12" },
  { id: "bed-302-b", identifier: "ICU-302-B", roomId: "room-302", bedTypeId: "bt-icu", status: "available", lastUpdated: "2026-08-09" },
  { id: "bed-303-a", identifier: "ICU-303-A", roomId: "room-303", bedTypeId: "bt-icu", status: "maintenance", maintenanceIssue: "Ventilator port inspection", maintenanceReportedOn: "2026-08-13", lastUpdated: "2026-08-13" },
  { id: "bed-303-b", identifier: "ICU-303-B", roomId: "room-303", bedTypeId: "bt-icu", status: "available", lastUpdated: "2026-08-08" },
  { id: "bed-401-a", identifier: "CARD-401-A", roomId: "room-401", bedTypeId: "bt-standard", status: "occupied", patientId: "p-ibrar-ahmad", assignedStaffId: "robert-vance", admissionDate: "2026-08-14", expectedDischargeDate: "2026-08-19", lastUpdated: "2026-08-14" },
  { id: "bed-401-b", identifier: "CARD-401-B", roomId: "room-401", bedTypeId: "bt-standard", status: "available", lastUpdated: "2026-08-07" },
  { id: "bed-402-a", identifier: "CARD-402-A", roomId: "room-402", bedTypeId: "bt-standard", status: "occupied", patientId: "p-elena-rodriguez", assignedStaffId: "sarah-jenkins", admissionDate: "2026-08-11", expectedDischargeDate: "2026-08-14", lastUpdated: "2026-08-11" },
  { id: "bed-402-b", identifier: "CARD-402-B", roomId: "room-402", bedTypeId: "bt-standard", status: "reserved", reservedForPatientId: "p-ayesha-raza", expectedAdmissionDate: "2026-08-16", reservationReason: "Scheduled cardiac catheterization", reservedBy: "Zainab Qureshi", lastUpdated: "2026-08-14" },
  { id: "bed-403-a", identifier: "CARD-403-A", roomId: "room-403", bedTypeId: "bt-standard", status: "available", lastUpdated: "2026-08-06" },
  { id: "bed-403-b", identifier: "CARD-403-B", roomId: "room-403", bedTypeId: "bt-standard", status: "blocked", blockedReason: "Infection control — deep clean after outbreak precaution", blockedFrom: "2026-08-13", blockedUntil: "2026-08-16", lastUpdated: "2026-08-13" },
  { id: "bed-bay1-a", identifier: "ER-BAY1-A", roomId: "room-bay-1", bedTypeId: "bt-emergency", status: "occupied", patientId: "p-saira-cheema", assignedStaffId: "robert-vance", admissionDate: "2026-08-14", lastUpdated: "2026-08-14" },
  { id: "bed-bay1-b", identifier: "ER-BAY1-B", roomId: "room-bay-1", bedTypeId: "bt-emergency", status: "available", lastUpdated: "2026-08-14" },
  { id: "bed-bay2-a", identifier: "ER-BAY2-A", roomId: "room-bay-2", bedTypeId: "bt-emergency", status: "available", lastUpdated: "2026-08-14" },
  { id: "bed-bay2-b", identifier: "ER-BAY2-B", roomId: "room-bay-2", bedTypeId: "bt-emergency", status: "out-of-service", lastUpdated: "2026-08-05" },
  { id: "bed-501-a", identifier: "POST-501-A", roomId: "room-501", bedTypeId: "bt-post-op", status: "occupied", patientId: "p-usman-khan", assignedStaffId: "elena-rostova", admissionDate: "2026-08-13", expectedDischargeDate: "2026-08-15", lastUpdated: "2026-08-13" },
  { id: "bed-501-b", identifier: "POST-501-B", roomId: "room-501", bedTypeId: "bt-post-op", status: "cleaning", lastUpdated: "2026-08-14" },
  { id: "bed-502-a", identifier: "POST-502-A", roomId: "room-502", bedTypeId: "bt-post-op", status: "available", lastUpdated: "2026-08-11" },
];

export function resolveBedTypeName(bedTypeId: string): string {
  return bedTypes.find((t) => t.id === bedTypeId)?.name ?? "Unknown";
}

export interface CatalogService {
  name: string;
  category: "consultations" | "laboratory" | "imaging" | "procedures";
  tag: string;
  code: string;
  meta: string;
  coverage: number;
  price: number;
}

const catalogServices: CatalogService[] = [
  { name: "Initial General Consultation", category: "consultations", tag: "Outpatient", code: "99203", meta: "Duration: 30m • Standard intake", coverage: 80, price: 125 },
  { name: "Specialist Follow-up (Cardiology)", category: "consultations", tag: "Inpatient/Outpatient", code: "99214", meta: "Duration: 45m • Detailed review", coverage: 65, price: 250 },
  { name: "Comprehensive Metabolic Panel", category: "laboratory", tag: "Lab", code: "80053", meta: "TAT: 4hrs • Blood draw required", coverage: 100, price: 45 },
  { name: "Complete Blood Count", category: "laboratory", tag: "Lab", code: "85025", meta: "TAT: 2hrs • Blood draw required", coverage: 95, price: 30 },
  { name: "MRI — Brain (without contrast)", category: "imaging", tag: "Radiology", code: "70551", meta: "Duration: 45m • Pre-auth often req.", coverage: 45, price: 1200 },
  { name: "Chest X-Ray", category: "imaging", tag: "Radiology", code: "71046", meta: "Duration: 15m • Walk-in available", coverage: 90, price: 85 },
];

export const getFacilities = () => mockRequest(facilities);
export const getFacilityActivity = () => mockRequest(facilityActivity);
export const getCatalogServices = () => mockRequest(catalogServices);
