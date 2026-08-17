import { mockRequest } from "@shared/lib/api/client";
import { TODAY } from "./core";
import { facilities, departmentConfigs } from "./facilities";
import { staffMembers } from "./staff";
import { patients, getPatientFullName, getIdentifier } from "./patients";
import { getAppointments, getAppointmentDashboard, getTodayQueue } from "./appointments";
import { getBedDashboard, getOccupancyAnalytics } from "./beds";
import { getEmergencyDashboard } from "./emergency";
import { getBillingDashboard, getInvoices } from "./billing";
import { getLabDashboard } from "./laboratory";
import { getRadiologyDashboard } from "./radiology";
import { getOTDashboard } from "./ot";
import { getPharmacyDashboard } from "./pharmacy";
import { getInventoryAlerts } from "./inventory";
import { getMirthChannels } from "./configuration";
import { getCriticalAlerts, getAlerts } from "./alerts";
import { getDuplicateQueue } from "./patients";

// ============================================================================
// Dashboard — real cross-module aggregation for the two top-level dashboard
// pages (HospitalAdminDashboard.tsx, ReceptionDashboard.tsx). Refactored
// 2026-08-17 from a self-contained fabricated-data file into a genuine
// aggregation layer, same discipline as `reports.ts`/`audit.ts`: every
// number here is computed from a real module's own real data (beds,
// appointments, emergency, billing, laboratory, radiology, OT, pharmacy,
// inventory, configuration's Mirth channels, alerts, and the aggregated
// audit log) — nothing is a standalone invented mock series anymore. The
// only genuinely NEW logic that belongs in this file is the cross-cutting
// combination no single module owns: which KPIs go on which dashboard,
// and the traffic-light thresholds behind "Live Hospital Status."
//
// A note on facility scoping: `facilities.ts` seeds 3 real facilities, but
// only Main Campus carries operational data (beds/appointments/emergency/
// labs/etc.) today — North Clinic has 0 beds and the Diagnostic Center is
// under maintenance in the seed data. The facility selector on both
// dashboards is real (backed by `facilities`) and filters what's genuinely
// filterable (patients, today's appointments); it doesn't fabricate a
// second set of per-facility bed/lab/OT numbers that don't exist yet.
// ============================================================================

function isOnDutyToday(schedule: string[]): boolean {
  const weekday = new Date(`${TODAY}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
  return schedule.includes(weekday);
}

// --- Admin Dashboard KPIs --------------------------------------------------

export interface AdminOverviewKpis {
  totalPatients: number;
  newPatientsToday: number;
  bedOccupancyPercent: number;
  bedsOccupied: number;
  bedsTotal: number;
  appointmentsToday: number;
  appointmentsWaiting: number;
  appointmentsCompleted: number;
  emergencyActive: number;
  emergencyCritical: number;
  emergencyWaiting: number;
  emergencyInTreatment: number;
  admissionsToday: number;
  dischargesPending: number;
  todaysRevenue: number;
  outstandingReceivables: number;
  criticalAlertsCount: number;
  unresolvedAlertsCount: number;
}

export async function getAdminOverviewKpis(facilityId?: string): Promise<AdminOverviewKpis> {
  const [bedDashboard, appointmentDashboard, emergencyDashboard, billingDashboard, criticalAlerts] = await Promise.all([
    getBedDashboard(),
    getAppointmentDashboard(),
    getEmergencyDashboard(),
    getBillingDashboard(),
    getCriticalAlerts(),
  ]);

  const scopedPatients = facilityId ? patients.filter((p) => p.managingOrganizationId === facilityId) : patients;
  const newPatientsToday = scopedPatients.filter((p) => p.registeredOn === TODAY).length;

  return {
    totalPatients: scopedPatients.length,
    newPatientsToday,
    bedOccupancyPercent: bedDashboard.occupancyRate,
    bedsOccupied: bedDashboard.byStatus.occupied,
    bedsTotal: bedDashboard.total,
    appointmentsToday: appointmentDashboard.todaysTotal,
    appointmentsWaiting: appointmentDashboard.waitingPatients,
    appointmentsCompleted: appointmentDashboard.byStatus.completed,
    emergencyActive: emergencyDashboard.totalPatients,
    emergencyCritical: emergencyDashboard.criticalPatients,
    emergencyWaiting: emergencyDashboard.waitingForDoctor,
    emergencyInTreatment: emergencyDashboard.inTreatment,
    admissionsToday: bedDashboard.admissionsToday,
    dischargesPending: bedDashboard.expectedDischargesToday.length,
    todaysRevenue: billingDashboard.todaysRevenue,
    outstandingReceivables: billingDashboard.outstandingReceivables,
    criticalAlertsCount: criticalAlerts.length,
    unresolvedAlertsCount: criticalAlerts.filter((a) => a.status === "new" || a.status === "escalated").length,
  };
}

// --- Today's Activity — a same-day category comparison, not a fabricated
// multi-day trend (every appointment/admission/emergency record in this
// mock dataset is genuinely dated "today" — there's no real historical
// spread to draw a 7-day line from without inventing numbers). ------------

export interface TodaysActivityBreakdown {
  admissions: number;
  discharges: number;
  appointments: number;
  emergencyVisits: number;
}

export async function getTodaysActivityBreakdown(): Promise<TodaysActivityBreakdown> {
  const [bedDashboard, appointmentDashboard, emergencyDashboard] = await Promise.all([
    getBedDashboard(),
    getAppointmentDashboard(),
    getEmergencyDashboard(),
  ]);
  return {
    admissions: bedDashboard.admissionsToday,
    discharges: bedDashboard.expectedDischargesToday.length,
    appointments: appointmentDashboard.todaysTotal,
    emergencyVisits: emergencyDashboard.totalPatients,
  };
}

// --- Patients by Department — today's real appointment volume grouped by
// department (replaces the old standalone fabricated donut series). ------

export async function getTodaysPatientsByDepartment() {
  const rows = await getAppointments({ date: TODAY });
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    const name = r.departmentName ?? "Unassigned";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return mockRequest(Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6));
}

// --- Live Hospital Status — a per-module traffic light computed from each
// module's own real dashboard thresholds, plus Configuration's real Mirth
// channel status for the Integration row (spec's own worked example). ----

export type LiveStatusLevel = "normal" | "busy" | "critical" | "offline";

export interface LiveStatusRow {
  module: string;
  level: LiveStatusLevel;
  detail: string;
}

export async function getLiveHospitalStatus(): Promise<LiveStatusRow[]> {
  const [emergencyDashboard, labDashboard, radiologyDashboard, pharmacyDashboard, otDashboard, billingDashboard, mirthChannels] = await Promise.all([
    getEmergencyDashboard(),
    getLabDashboard(),
    getRadiologyDashboard(),
    getPharmacyDashboard(),
    getOTDashboard(),
    getBillingDashboard(),
    getMirthChannels(),
  ]);

  const rows: LiveStatusRow[] = [];

  rows.push(
    emergencyDashboard.criticalPatients > 0
      ? { module: "Emergency", level: "critical", detail: `${emergencyDashboard.criticalPatients} critical patient${emergencyDashboard.criticalPatients > 1 ? "s" : ""}` }
      : emergencyDashboard.waitingForDoctor > 5
      ? { module: "Emergency", level: "busy", detail: `${emergencyDashboard.waitingForDoctor} waiting for a doctor` }
      : { module: "Emergency", level: "normal", detail: `${emergencyDashboard.totalPatients} active patients` }
  );

  const labBacklog = labDashboard.pendingCollection + labDashboard.awaitingReceipt + labDashboard.inProcess;
  rows.push(
    labDashboard.criticalOpen > 0
      ? { module: "Laboratory", level: "critical", detail: `${labDashboard.criticalOpen} critical result${labDashboard.criticalOpen > 1 ? "s" : ""} open` }
      : labBacklog > 15
      ? { module: "Laboratory", level: "busy", detail: `${labBacklog} orders in the pipeline` }
      : { module: "Laboratory", level: "normal", detail: `${labDashboard.ordersToday} orders today` }
  );

  rows.push(
    pharmacyDashboard.outOfStock > 0 || pharmacyDashboard.controlledAlerts > 0
      ? { module: "Pharmacy", level: "critical", detail: pharmacyDashboard.outOfStock > 0 ? `${pharmacyDashboard.outOfStock} item(s) out of stock` : `${pharmacyDashboard.controlledAlerts} controlled-medicine alert(s)` }
      : pharmacyDashboard.pendingPrescriptions > 10
      ? { module: "Pharmacy", level: "busy", detail: `${pharmacyDashboard.pendingPrescriptions} prescriptions pending` }
      : { module: "Pharmacy", level: "normal", detail: `${pharmacyDashboard.dispensedToday} dispensed today` }
  );

  rows.push(
    radiologyDashboard.criticalOpen > 0
      ? { module: "Radiology", level: "critical", detail: `${radiologyDashboard.criticalOpen} critical finding(s) open` }
      : radiologyDashboard.waiting > 5 || radiologyDashboard.equipmentAlerts > 0
      ? { module: "Radiology", level: "busy", detail: radiologyDashboard.equipmentAlerts > 0 ? `${radiologyDashboard.equipmentAlerts} equipment alert(s)` : `${radiologyDashboard.waiting} patients waiting` }
      : { module: "Radiology", level: "normal", detail: `${radiologyDashboard.ordersToday} orders today` }
  );

  rows.push(
    otDashboard.delayedSurgeries > 0
      ? { module: "Operation Theatre", level: "busy", detail: `${otDashboard.delayedSurgeries} surgery(ies) delayed` }
      : otDashboard.inProgress > 0
      ? { module: "Operation Theatre", level: "busy", detail: `${otDashboard.inProgress} in progress` }
      : { module: "Operation Theatre", level: "normal", detail: `${otDashboard.scheduled} scheduled today` }
  );

  rows.push(
    billingDashboard.overdueInvoices > 5
      ? { module: "Billing", level: "busy", detail: `${billingDashboard.overdueInvoices} overdue invoices` }
      : { module: "Billing", level: "normal", detail: `${billingDashboard.unpaidInvoices} unpaid invoices` }
  );

  const hasError = mirthChannels.some((c) => c.status === "error");
  const hasStopped = mirthChannels.some((c) => c.status === "stopped");
  rows.push(
    hasError
      ? { module: "Integration (Mirth)", level: "offline", detail: "One or more channels reporting an error" }
      : hasStopped
      ? { module: "Integration (Mirth)", level: "busy", detail: "One or more channels stopped" }
      : { module: "Integration (Mirth)", level: "normal", detail: `${mirthChannels.length} channel(s) running` }
  );

  return rows;
}

// --- Staff Status — real on-duty-today count (schedule includes today's
// weekday) vs. total, grouped by the real roleType taxonomy. --------------

export interface StaffStatusRow {
  role: string;
  onDuty: number;
  total: number;
}

export async function getStaffStatusSummary(): Promise<StaffStatusRow[]> {
  const roleLabels: Record<string, string> = { doctor: "Doctors", nurse: "Nurses", technician: "Lab & Technical Staff", admin: "Admin & Support" };
  const roles = ["doctor", "nurse", "technician", "admin"] as const;
  return roles.map((role) => {
    const members = staffMembers.filter((s) => s.role === role);
    return { role: roleLabels[role], onDuty: members.filter((m) => m.status === "active" && isOnDutyToday(m.schedule)).length, total: members.length };
  });
}

// --- Reception Dashboard KPIs ----------------------------------------------

export interface ReceptionOverviewKpis {
  waiting: number;
  waitingUrgent: number;
  appointmentsToday: number;
  appointmentsUpcoming: number;
  checkedIn: number;
  checkedInCompleted: number;
  walkIns: number;
  walkInsUrgent: number;
}

export async function getReceptionOverviewKpis(): Promise<ReceptionOverviewKpis> {
  const todays = await getAppointments({ date: TODAY });
  const waiting = todays.filter((a) => a.status === "waiting" || a.status === "checked-in");
  const checkedIn = todays.filter((a) => a.status === "checked-in" || a.status === "in-progress" || a.status === "completed");
  const walkIns = todays.filter((a) => a.source === "reception");
  return {
    waiting: waiting.length,
    waitingUrgent: waiting.filter((a) => a.priority === "urgent" || a.priority === "emergency").length,
    appointmentsToday: todays.length,
    appointmentsUpcoming: todays.filter((a) => a.status === "confirmed" || a.status === "pending-confirmation").length,
    checkedIn: checkedIn.length,
    checkedInCompleted: todays.filter((a) => a.status === "completed").length,
    walkIns: walkIns.length,
    walkInsUrgent: walkIns.filter((a) => a.priority === "urgent" || a.priority === "emergency").length,
  };
}

// --- Patient Queue by Department (spec §25) — real, from today's
// waiting/checked-in/in-progress appointments. ------------------------------

export interface DepartmentQueueRow {
  departmentName: string;
  waiting: number;
}

export async function getPatientQueueByDepartment(): Promise<DepartmentQueueRow[]> {
  const rows = await getTodayQueue();
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    const name = r.departmentName ?? "Unassigned";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return Array.from(counts, ([departmentName, waiting]) => ({ departmentName, waiting })).sort((a, b) => b.waiting - a.waiting);
}

// --- Doctor Status board (spec §26) — Available vs. currently With a
// Patient, computed from today's real in-progress appointments. Deliberately
// doesn't fabricate "On Break" / "Running Late" states — nothing in the
// data model tracks staff breaks or lateness, so showing that would be
// inventing a status with no real backing. --------------------------------

export interface DoctorStatusRow {
  id: string;
  name: string;
  specialty: string;
  status: "available" | "with-patient" | "off-duty";
}

export async function getDoctorStatusBoard(): Promise<DoctorStatusRow[]> {
  const todays = await getAppointments({ date: TODAY });
  const inProgressByDoctor = new Set(todays.filter((a) => a.status === "in-progress").map((a) => a.practitionerId));
  return staffMembers
    .filter((s) => s.role === "doctor")
    .map((s) => ({
      id: s.id,
      name: s.name,
      specialty: s.specialty,
      status: s.status !== "active" || !isOnDutyToday(s.schedule) ? "off-duty" : inProgressByDoctor.has(s.id) ? "with-patient" : "available",
    }));
}

// --- Patients Requiring Attention (spec §27) — every item here is a real
// computed exception, not a fabricated checklist: missing insurance info
// (Patient.insuranceProvider/insurancePolicyNumber empty), payment pending
// (a real overdue/unpaid invoice), and possible duplicates (reuses the MPI
// module's own real `getDuplicateQueue()` rather than a second detector). --

export interface AttentionItem {
  type: "missing-insurance" | "payment-pending" | "possible-duplicate" | "unconfirmed-appointment";
  label: string;
  count: number;
}

export async function getPatientsRequiringAttention(): Promise<AttentionItem[]> {
  const [overdueInvoices, duplicates, todays] = await Promise.all([getInvoices({ status: "overdue" }), getDuplicateQueue(), getAppointments({ date: TODAY })]);
  const missingInsurance = patients.filter((p) => !p.insuranceProvider.trim() || !p.insurancePolicyNumber.trim()).length;
  const unconfirmed = todays.filter((a) => a.status === "pending-confirmation" || a.status === "requested").length;

  const items: AttentionItem[] = [
    { type: "missing-insurance", label: "Missing insurance information", count: missingInsurance },
    { type: "payment-pending", label: "Payment overdue", count: overdueInvoices.length },
    { type: "possible-duplicate", label: "Possible duplicate patient", count: duplicates.length },
    { type: "unconfirmed-appointment", label: "Appointment awaiting confirmation", count: unconfirmed },
  ];
  return items.filter((item) => item.count > 0);
}

// --- Front Desk Alerts (spec §28) — reuses the real Alerts & Notifications
// module, filtered to categories reception actually needs to act on, rather
// than surfacing every hospital alert. -------------------------------------

export async function getFrontDeskAlerts() {
  const [emergencyAlerts, appointmentAlerts, admissionAlerts] = await Promise.all([
    getAlerts({ category: "emergency" }),
    getAlerts({ category: "appointment" }),
    getAlerts({ category: "admission-discharge" }),
  ]);
  return [...emergencyAlerts, ...appointmentAlerts, ...admissionAlerts]
    .filter((a) => a.status === "new" || a.status === "escalated" || a.status === "in-progress")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 8);
}

// --- Facility selector (spec §2) — real facilities from `facilities.ts`,
// not a fabricated multi-hospital list. ------------------------------------

export function getFacilityOptions() {
  return mockRequest(facilities.map((f) => ({ id: f.id, name: f.name, status: f.status })));
}

export { facilities, departmentConfigs };
