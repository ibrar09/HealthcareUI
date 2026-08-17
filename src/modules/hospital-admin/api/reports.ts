import { TODAY } from "./core";
import { departmentConfigs, beds, rooms, wards } from "./facilities";
import { patientSeeds } from "./patients";
import { appointments, appointmentTypes } from "./appointments";
import { getBedDashboard, getBedAuditLog } from "./beds";
import { emergencyVisits } from "./emergency";
import { getBillingDashboard, getCharges } from "./billing";
import { getLabAuditLog, getLabOrders } from "./laboratory";
import { getRadiologyAuditLog, imagingOrders } from "./radiology";
import { getPharmacyAuditLog, prescriptions } from "./pharmacy";
import { getOTAuditLog } from "./ot";
import { getInventoryAuditLog } from "./inventory";
import { getEmergencyAuditLog } from "./emergency";

function resolveWardForBed(bedId?: string): { wardName: string; wardType: string } | undefined {
  const bed = beds.find((b) => b.id === bedId);
  if (!bed) return undefined;
  const room = rooms.find((r) => r.id === bed.roomId);
  const ward = wards.find((w) => w.id === room?.wardId);
  return ward ? { wardName: ward.name, wardType: ward.type } : undefined;
}

// ============================================================================
// Reports & Analytics (Hospital Admin's [full] section — MVP scope per the
// user's own explicit instruction, a deliberately narrow pass covering the
// ~13 highest-value reports rather than the full 65-section spec). This
// module is intentionally a thin READ-ONLY aggregation layer, never a
// second domain model — per the spec's own architecture note ("Operational
// Systems -> Data -> Reporting Layer -> Reports"), everything here is
// computed live from the real records every other module already owns.
// Where a module already exposes its own dashboard/analytics function
// (Emergency, Beds, Laboratory, Radiology, Pharmacy, OT, Billing), the
// Reports UI calls that function directly rather than wrapping it — only
// genuinely new cross-module rollups (Overview, Census, Patient Volume,
// OPD, Admissions & Discharges, hospital-wide Audit) live in this file.
// ============================================================================

function isToday(iso: string): boolean {
  return iso.startsWith(TODAY);
}
function resolveDepartmentName(departmentId?: string): string {
  return departmentConfigs.find((d) => d.id === departmentId)?.name ?? "Unassigned";
}

// --- Reports Overview (spec §2) -----------------------------------------------

export interface ReportsOverviewData {
  patientsToday: number;
  opdVisitsToday: number;
  emergencyToday: number;
  admissionsToday: number;
  dischargesToday: number;
  bedOccupancyPercent: number;
  labTestsToday: number;
  radiologyToday: number;
  pharmacyOrdersToday: number;
  revenueToday: number;
}

export async function getReportsOverview(): Promise<ReportsOverviewData> {
  const [bedDashboard, billingDashboard, labOrderRows] = await Promise.all([getBedDashboard(), getBillingDashboard(), getLabOrders()]);
  const admissionEvents = await getBedAuditLog({ action: "Patient Admitted" });
  const dischargeEvents = await getBedAuditLog({ action: "Patient Discharged" });

  const data: ReportsOverviewData = {
    patientsToday: patientSeeds.filter((p) => p.registeredOn === TODAY).length + appointments.filter((a) => isToday(a.start)).length,
    opdVisitsToday: appointments.filter((a) => isToday(a.start)).length,
    emergencyToday: emergencyVisits.filter((v) => isToday(v.arrivalTime)).length,
    admissionsToday: admissionEvents.filter((e) => isToday(e.timestamp)).length,
    dischargesToday: dischargeEvents.filter((e) => isToday(e.timestamp)).length,
    bedOccupancyPercent: bedDashboard.occupancyRate,
    labTestsToday: labOrderRows.filter((r) => isToday(r.orderedDateTime)).length,
    radiologyToday: imagingOrders.filter((o) => isToday(o.orderedDateTime)).length,
    pharmacyOrdersToday: prescriptions.filter((p) => isToday(p.prescriptionDate)).length,
    revenueToday: billingDashboard.todaysRevenue,
  };
  return data;
}

// --- Hospital Census (spec §4) -------------------------------------------------

export interface HospitalCensusData {
  opd: number;
  emergency: number;
  ipd: number;
  icu: number;
  observation: number;
  dayCare: number;
  totalCurrentPatients: number;
  newPatientsToday: number;
  dischargedToday: number;
  transferredToday: number;
  currentAdmissions: number;
}

export async function getHospitalCensus(): Promise<HospitalCensusData> {
  const occupiedBeds = beds.filter((b) => b.status === "occupied");
  const icuBeds = occupiedBeds.filter((b) => resolveWardForBed(b.id)?.wardType === "icu");
  const ipdBeds = occupiedBeds.filter((b) => resolveWardForBed(b.id)?.wardType !== "icu");
  const opd = appointments.filter((a) => isToday(a.start) && (a.status === "checked-in" || a.status === "waiting" || a.status === "in-progress")).length;
  const emergencyActive = emergencyVisits.filter((v) => ["waiting-triage", "waiting-doctor", "in-treatment", "in-observation", "disposition-pending"].includes(v.status)).length;
  const observationActive = emergencyVisits.filter((v) => v.status === "in-observation").length;

  const dischargeEvents = await getBedAuditLog({ action: "Patient Discharged" });
  const transferOutEvents = await getBedAuditLog({ action: "Transferred Out" });
  const admissionEvents = await getBedAuditLog({ action: "Patient Admitted" });

  const data: HospitalCensusData = {
    opd,
    emergency: emergencyActive,
    ipd: ipdBeds.length,
    icu: icuBeds.length,
    observation: observationActive,
    dayCare: 0,
    totalCurrentPatients: opd + emergencyActive + occupiedBeds.length,
    newPatientsToday: patientSeeds.filter((p) => p.registeredOn === TODAY).length,
    dischargedToday: dischargeEvents.filter((e) => isToday(e.timestamp)).length,
    transferredToday: transferOutEvents.filter((e) => isToday(e.timestamp)).length,
    currentAdmissions: admissionEvents.filter((e) => isToday(e.timestamp)).length,
  };
  return data;
}

// --- Patient Volume (spec §5) --------------------------------------------------

export interface PatientVolumePoint {
  date: string;
  newPatients: number;
  opdVisits: number;
  emergencyVisits: number;
}

/** Real 14-day trend built from actual registration/appointment/ED-arrival dates — never a fabricated series. */
export function getPatientVolumeTrend(): PatientVolumePoint[] {
  const map = new Map<string, PatientVolumePoint>();
  function bucket(date: string): PatientVolumePoint {
    if (!map.has(date)) map.set(date, { date, newPatients: 0, opdVisits: 0, emergencyVisits: 0 });
    return map.get(date)!;
  }
  patientSeeds.forEach((p) => {
    bucket(p.registeredOn).newPatients += 1;
  });
  appointments.forEach((a) => {
    bucket(a.start.slice(0, 10)).opdVisits += 1;
  });
  emergencyVisits.forEach((v) => {
    bucket(v.arrivalTime.slice(0, 10)).emergencyVisits += 1;
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
}

// --- OPD Reports (spec §7-8) ----------------------------------------------------

export interface OpdReportData {
  totalVisits: number;
  newPatientVisits: number;
  followUpVisits: number;
  walkIns: number;
  noShows: number;
  cancelled: number;
  byDepartment: { departmentName: string; count: number }[];
  bySource: { source: string; count: number }[];
}

export function getOpdReport(): OpdReportData {
  const newTypeId = appointmentTypes.find((t) => t.name === "New Patient")?.id;
  const followUpTypeId = appointmentTypes.find((t) => t.name === "Follow-up")?.id;

  const deptMap = new Map<string, number>();
  appointments.forEach((a) => {
    const name = resolveDepartmentName(a.departmentId);
    deptMap.set(name, (deptMap.get(name) ?? 0) + 1);
  });
  const sourceMap = new Map<string, number>();
  appointments.forEach((a) => {
    sourceMap.set(a.source, (sourceMap.get(a.source) ?? 0) + 1);
  });

  const data: OpdReportData = {
    totalVisits: appointments.length,
    newPatientVisits: appointments.filter((a) => a.appointmentTypeId === newTypeId).length,
    followUpVisits: appointments.filter((a) => a.appointmentTypeId === followUpTypeId).length,
    walkIns: appointments.filter((a) => a.source === "reception").length,
    noShows: appointments.filter((a) => a.status === "no-show").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    byDepartment: Array.from(deptMap.entries()).map(([departmentName, count]) => ({ departmentName, count })).sort((a, b) => b.count - a.count),
    bySource: Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })),
  };
  return data;
}

// --- Admissions & Discharges (spec §11-12) --------------------------------------

export interface AdmissionsDischargesData {
  totalAdmissions: number;
  totalDischarges: number;
  totalTransfers: number;
  byWard: { wardName: string; admissions: number }[];
  recentAdmissions: { patientName: string; wardName: string; bedIdentifier: string; timestamp: string }[];
  recentDischarges: { patientName: string; wardName: string; bedIdentifier: string; timestamp: string }[];
}

export async function getAdmissionsDischargesReport(): Promise<AdmissionsDischargesData> {
  const admissionEvents = await getBedAuditLog({ action: "Patient Admitted" });
  const dischargeEvents = await getBedAuditLog({ action: "Patient Discharged" });
  const transferEvents = await getBedAuditLog({ action: "Transferred Out" });

  const wardMap = new Map<string, number>();
  admissionEvents.forEach((e) => {
    const wardName = resolveWardForBed(e.bedId)?.wardName ?? "Unknown Ward";
    wardMap.set(wardName, (wardMap.get(wardName) ?? 0) + 1);
  });

  const data: AdmissionsDischargesData = {
    totalAdmissions: admissionEvents.length,
    totalDischarges: dischargeEvents.length,
    totalTransfers: transferEvents.length,
    byWard: Array.from(wardMap.entries()).map(([wardName, admissions]) => ({ wardName, admissions })).sort((a, b) => b.admissions - a.admissions),
    recentAdmissions: admissionEvents.slice(0, 10).map((e) => ({ patientName: e.patientName ?? "Unknown", wardName: resolveWardForBed(e.bedId)?.wardName ?? "Unknown", bedIdentifier: e.bedIdentifier, timestamp: e.timestamp })),
    recentDischarges: dischargeEvents.slice(0, 10).map((e) => ({ patientName: e.patientName ?? "Unknown", wardName: resolveWardForBed(e.bedId)?.wardName ?? "Unknown", bedIdentifier: e.bedIdentifier, timestamp: e.timestamp })),
  };
  return data;
}

// --- Billing revenue-by-department (spec §32) — real captured-charge
// amounts grouped by the billing service catalog's own department field,
// never fabricated. -----------------------------------------------------------

export interface BillingRevenueByDepartment {
  departmentName: string;
  revenue: number;
}

export async function getRevenueByDepartment(): Promise<BillingRevenueByDepartment[]> {
  const charges = await getCharges();
  const deptMap = new Map<string, number>();
  charges.forEach((c) => {
    deptMap.set(c.department, (deptMap.get(c.department) ?? 0) + c.amount);
  });
  return Array.from(deptMap.entries()).map(([departmentName, revenue]) => ({ departmentName, revenue: Math.round(revenue) })).sort((a, b) => b.revenue - a.revenue);
}

// --- Hospital-wide Audit rollup (spec §47) — merges every module's own
// audit log into one timeline, tagged by source module. Never a second
// audit-writing system; strictly a read-side aggregation. --------------------

export interface HospitalAuditRow {
  id: string;
  module: string;
  timestamp: string;
  actor: string;
  action: string;
  entityId: string;
  detail?: string;
}

export async function getHospitalAuditLog(filters: { module?: string; search?: string } = {}): Promise<HospitalAuditRow[]> {
  const [bedLog, labLog, radiologyLog, pharmacyLog, otLog, inventoryLog, emergencyLog] = await Promise.all([
    getBedAuditLog(),
    getLabAuditLog(),
    getRadiologyAuditLog(),
    getPharmacyAuditLog(),
    getOTAuditLog(),
    getInventoryAuditLog(),
    getEmergencyAuditLog(),
  ]);

  const rows: HospitalAuditRow[] = [
    ...bedLog.map((e) => ({ id: e.id, module: "Beds", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.bedId, detail: e.detail })),
    ...labLog.map((e) => ({ id: e.id, module: "Laboratory", timestamp: e.timestamp, actor: e.actor ?? "System", action: e.action, entityId: e.orderNumber, detail: undefined })),
    ...radiologyLog.map((e) => ({ id: e.id, module: "Radiology", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail })),
    ...pharmacyLog.map((e) => ({ id: e.id, module: "Pharmacy", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail })),
    ...otLog.map((e) => ({ id: e.id, module: "OT/Surgery", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail })),
    ...inventoryLog.map((e) => ({ id: e.id, module: "Inventory", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail })),
    ...emergencyLog.map((e) => ({ id: e.id, module: "Emergency", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail })),
  ];

  let filtered = rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (filters.module) filtered = filtered.filter((r) => r.module === filters.module);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((r) => r.entityId.toLowerCase().includes(q) || r.actor.toLowerCase().includes(q) || r.action.toLowerCase().includes(q));
  }
  return filtered.slice(0, 200);
}

export function getReportModules(): string[] {
  return ["Beds", "Laboratory", "Radiology", "Pharmacy", "OT/Surgery", "Inventory", "Emergency"];
}
