import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { staffMembers } from "./staff";
import { patientSeeds } from "./patients";
import type { NotificationChannel } from "./configuration";
import { getInventoryAlerts } from "./inventory";
import { getLabCriticalAlerts, acknowledgeCriticalAlert as acknowledgeLabCriticalAlert } from "./laboratory";
import { getCriticalFindingsList, acknowledgeRadiologyCriticalFinding } from "./radiology";
import { getAuditAlerts } from "./audit";

// ============================================================================
// Alerts & Notifications (Hospital Admin's [full] section — full 39-section
// build per ALERTS_NOTIFICATIONS_MODULE_SPEC.md, per the user's own explicit
// choice, matching the same full-build treatment Audit and Configuration got).
// Replaces the old `AlertsCenter.tsx` placeholder.
//
// This module owns the operational Alert lifecycle (create/assign/acknowledge/
// escalate/resolve/dismiss) plus the notification engine that delivers them
// (templates/rules/escalation policies/channels/preferences/quiet hours/
// delivery tracking) — the spec's own §38 "most important frontend pages"
// list is the exact tab structure below, the clearest scope signal in an
// otherwise open-ended paste.
//
// Real cross-module integration, not a duplicate alerting system: Laboratory
// and Radiology already own genuine critical-result acknowledgment workflows
// (`acknowledgeCriticalAlert`, `acknowledgeRadiologyCriticalFinding`) — the
// two curated alerts sourced from those modules route `acknowledgeAlert()`
// through to the real underlying function so state never diverges. Inventory/
// Security alerts are live-computed (no discrete stored record to write back
// to upstream), so `getAlertDashboard()` pulls their real current counts
// straight from `getInventoryAlerts()`/`getAuditAlerts()` rather than
// snapshotting stale numbers. Communication provider status (§20) is NOT
// duplicated here — the Channels tab reads Configuration's own
// `getCommunicationProviders()` directly (see `NotificationChannel` import).
//
// Per the spec's own explicit framing (§31-35: Kafka event queue, dedicated
// notification-service microservice, DB schema) — those are backend/
// architecture concepts "for later." This file builds the FRONTEND surface
// only: delivery status/retry/escalation are modeled as real state machines
// over mock data, never a simulated message broker.
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

function resolveStaffName(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  return staffMembers.find((s) => s.id === staffId)?.name;
}
function resolveDepartmentName(departmentId?: string): string | undefined {
  return departmentConfigs.find((d) => d.id === departmentId)?.name;
}
function resolvePatientName(patientId?: string): string | undefined {
  if (!patientId) return undefined;
  return patientSeeds.find((p) => p.id === patientId)?.fullName;
}

// --- Core taxonomy (spec §1, §3) ------------------------------------------

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "new" | "acknowledged" | "in-progress" | "resolved" | "escalated" | "dismissed" | "expired" | "failed";
export type AlertCategory =
  | "clinical" | "emergency" | "laboratory" | "pharmacy" | "inventory" | "appointment"
  | "admission-discharge" | "nursing" | "surgery" | "radiology" | "billing" | "insurance"
  | "patient" | "system" | "security";

export const alertCategoryLabels: Record<AlertCategory, string> = {
  clinical: "Clinical", emergency: "Emergency", laboratory: "Laboratory", pharmacy: "Pharmacy",
  inventory: "Inventory", appointment: "Appointment", "admission-discharge": "Admission / Discharge",
  nursing: "Nursing", surgery: "Surgery / OT", radiology: "Radiology", billing: "Billing",
  insurance: "Insurance", patient: "Patient", system: "System", security: "Security",
};

export interface AlertEscalationEvent {
  level: number;
  role: string;
  escalatedAt: string;
  note?: string;
}

export interface Alert {
  id: string;
  alertNumber: string;
  category: AlertCategory;
  alertType: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  patientId?: string;
  patientName?: string;
  departmentId?: string;
  departmentName?: string;
  location?: string;
  source: string;
  sourceModule?: "laboratory" | "radiology";
  relatedRecordId?: string;
  createdAt: string;
  channelsNotified: NotificationChannel[];
  assignedToId?: string;
  assignedToName?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  dismissedBy?: string;
  dismissedAt?: string;
  dismissReason?: string;
  escalationLevel: number;
  escalationHistory: AlertEscalationEvent[];
}

let alertSeq = 0;
function nextAlertNumber(): string {
  alertSeq += 1;
  return `ALT-2026-${String(alertSeq).padStart(6, "0")}`;
}

function baseAlert(partial: Omit<Alert, "id" | "alertNumber" | "escalationLevel" | "escalationHistory" | "channelsNotified"> & Partial<Pick<Alert, "escalationLevel" | "escalationHistory" | "channelsNotified">>): Alert {
  alertSeq += 1;
  return {
    id: `alert-${alertSeq}`,
    alertNumber: `ALT-2026-${String(alertSeq).padStart(6, "0")}`,
    escalationLevel: 0,
    escalationHistory: [],
    channelsNotified: ["in-app"],
    ...partial,
  };
}

// --- Curated seed alerts (spec §4-18 — every clinical/operational category).
// Every patient/staff/department cross-references real seed data from
// earlier in this session, never invented names. -------------------------

export const alerts: Alert[] = [
  // Clinical (§4)
  baseAlert({
    category: "clinical", alertType: "Critical Lab Result", severity: "critical", status: "new",
    title: "Critical Potassium Level", message: `Patient ${resolvePatientName("p-usman-khan")}: Potassium result requires immediate clinical attention.`,
    patientId: "p-usman-khan", patientName: resolvePatientName("p-usman-khan"), departmentId: "dept-laboratory", departmentName: resolveDepartmentName("dept-laboratory"),
    source: "Laboratory", sourceModule: "laboratory", relatedRecordId: "crit-1", createdAt: `${TODAY}T07:30:00`, channelsNotified: ["push", "sms", "in-app"],
    assignedToId: "sarah-jenkins", assignedToName: resolveStaffName("sarah-jenkins"),
  }),
  baseAlert({
    category: "clinical", alertType: "Drug Allergy Conflict", severity: "high", status: "acknowledged",
    title: "Prescribed Medication Conflicts With Known Allergy", message: `${resolvePatientName("p-fatima-sheikh")} has a documented Penicillin allergy; prescribed Amoxicillin flagged before dispensing.`,
    patientId: "p-fatima-sheikh", patientName: resolvePatientName("p-fatima-sheikh"), departmentId: "dept-pharmacy", departmentName: resolveDepartmentName("dept-pharmacy"),
    source: "Pharmacy", createdAt: `${TODAY}T09:10:00`, channelsNotified: ["push", "in-app"],
    assignedToId: "nadia-khokhar", assignedToName: resolveStaffName("nadia-khokhar"),
    acknowledgedBy: resolveStaffName("nadia-khokhar"), acknowledgedAt: `${TODAY}T09:14:00`,
  }),
  baseAlert({
    category: "clinical", alertType: "Patient Deterioration", severity: "critical", status: "in-progress",
    title: "Early Warning Score Trending Up", message: `${resolvePatientName("p-hassan-abbasi")} — repeat vitals show a rising early-warning score over the last two nursing rounds.`,
    patientId: "p-hassan-abbasi", patientName: resolvePatientName("p-hassan-abbasi"), departmentId: "dept-icu", departmentName: resolveDepartmentName("dept-icu"),
    source: "Nursing", createdAt: `${TODAY}T11:05:00`, channelsNotified: ["push", "sms", "in-app"],
    assignedToId: "marcus-chen", assignedToName: resolveStaffName("marcus-chen"),
  }),

  // Emergency (§5)
  baseAlert({
    category: "emergency", alertType: "Trauma Alert", severity: "critical", status: "resolved",
    title: "Incoming Trauma Patient", message: "Unknown male, ETA 6 minutes. Trauma Team, Emergency Physician, Anesthesia, and Blood Bank required.",
    departmentId: "dept-emergency", departmentName: resolveDepartmentName("dept-emergency"), location: "Emergency Bay 2",
    source: "Emergency", createdAt: `${TODAY}T06:40:00`, channelsNotified: ["push", "sms", "in-app"],
    assignedToId: "nadia-farhan", assignedToName: resolveStaffName("nadia-farhan"),
    resolvedBy: resolveStaffName("nadia-farhan"), resolvedAt: `${TODAY}T07:35:00`, resolutionNote: "Patient stabilized, admitted to ICU.",
  }),
  baseAlert({
    category: "emergency", alertType: "Emergency Department Overcrowding", severity: "high", status: "new",
    title: "ED Waiting Time Exceeded", message: "Emergency Department waiting room exceeds target wait time — 14 patients waiting, average wait 68 minutes.",
    departmentId: "dept-emergency", departmentName: resolveDepartmentName("dept-emergency"),
    source: "Emergency", createdAt: `${TODAY}T13:20:00`, channelsNotified: ["in-app"],
  }),

  // Laboratory (§6)
  baseAlert({
    category: "laboratory", alertType: "Specimen Rejected", severity: "medium", status: "new",
    title: "Specimen Rejected — Hemolyzed Sample", message: `Blood specimen for ${resolvePatientName("p-omar-sethi")} rejected due to hemolysis; recollection requested.`,
    patientId: "p-omar-sethi", patientName: resolvePatientName("p-omar-sethi"), departmentId: "dept-laboratory", departmentName: resolveDepartmentName("dept-laboratory"),
    source: "Laboratory", createdAt: `${TODAY}T08:50:00`, channelsNotified: ["in-app"],
  }),
  baseAlert({
    category: "laboratory", alertType: "Analyzer Failure", severity: "high", status: "escalated",
    title: "Chemistry Analyzer Offline", message: "Primary chemistry analyzer reporting a QC failure — all pending chemistry panels delayed.",
    departmentId: "dept-laboratory", departmentName: resolveDepartmentName("dept-laboratory"),
    source: "Laboratory", createdAt: `${TODAY}T10:15:00`, channelsNotified: ["push", "in-app"],
    assignedToId: "amina-farooqi", assignedToName: resolveStaffName("amina-farooqi"),
    escalationLevel: 1, escalationHistory: [{ level: 1, role: "Department Supervisor", escalatedAt: `${TODAY}T10:30:00`, note: "No acknowledgement within 15 minutes." }],
  }),

  // Pharmacy (§7)
  baseAlert({
    category: "pharmacy", alertType: "Medication Recall", severity: "critical", status: "acknowledged",
    title: "Active Medication Recall", message: "Batch-level recall issued for a Metformin lot currently in active dispensing stock.",
    departmentId: "dept-pharmacy", departmentName: resolveDepartmentName("dept-pharmacy"),
    source: "Pharmacy", createdAt: `${TODAY}T07:00:00`, channelsNotified: ["push", "email", "in-app"],
    assignedToId: "sadia-riaz", assignedToName: resolveStaffName("sadia-riaz"),
    acknowledgedBy: resolveStaffName("sadia-riaz"), acknowledgedAt: `${TODAY}T07:20:00`,
  }),
  baseAlert({
    category: "pharmacy", alertType: "Duplicate Medication", severity: "medium", status: "new",
    title: "Duplicate Therapy Flagged", message: `${resolvePatientName("p-ayesha-raza")} has two active prescriptions in the same therapeutic class pending verification.`,
    patientId: "p-ayesha-raza", patientName: resolvePatientName("p-ayesha-raza"), departmentId: "dept-pharmacy", departmentName: resolveDepartmentName("dept-pharmacy"),
    source: "Pharmacy", createdAt: `${TODAY}T12:05:00`, channelsNotified: ["in-app"],
  }),

  // Inventory (§8)
  baseAlert({
    category: "inventory", alertType: "Low Stock", severity: "high", status: "new",
    title: "Insulin Stock Below Minimum", message: "Insulin XYZ — 12 units on hand, minimum stock 50. Reorder required.",
    location: "Pharmacy Store A", departmentId: "dept-inventory", departmentName: resolveDepartmentName("dept-inventory"),
    source: "Inventory", createdAt: `${TODAY}T10:28:00`, channelsNotified: ["in-app"],
    assignedToId: "waqas-anjum", assignedToName: resolveStaffName("waqas-anjum"),
  }),
  baseAlert({
    category: "inventory", alertType: "Cold-Chain Failure", severity: "critical", status: "in-progress",
    title: "Cold Storage Temperature Violation", message: "Vaccine refrigeration unit in Storage Location B recorded a temperature excursion above the safe threshold.",
    location: "Storage Location B", departmentId: "dept-inventory", departmentName: resolveDepartmentName("dept-inventory"),
    source: "Inventory", createdAt: `${TODAY}T09:40:00`, channelsNotified: ["push", "sms", "in-app"],
    assignedToId: "hira-shahid", assignedToName: resolveStaffName("hira-shahid"),
  }),

  // Appointment (§9)
  baseAlert({
    category: "appointment", alertType: "Doctor Running Late", severity: "low", status: "new",
    title: "Doctor Running Behind Schedule", message: `Dr. ${resolveStaffName("michael-chen")}'s OPD clinic is running approximately 25 minutes behind.`,
    departmentId: "dept-opd", departmentName: resolveDepartmentName("dept-opd"),
    source: "Appointments", createdAt: `${TODAY}T11:45:00`, channelsNotified: ["in-app"],
  }),
  baseAlert({
    category: "appointment", alertType: "Patient No-Show", severity: "low", status: "dismissed",
    title: "Patient No-Show Recorded", message: `${resolvePatientName("p-bilal-hussain")} did not check in for a scheduled 09:00 appointment.`,
    patientId: "p-bilal-hussain", patientName: resolvePatientName("p-bilal-hussain"), departmentId: "dept-cardiology", departmentName: resolveDepartmentName("dept-cardiology"),
    source: "Appointments", createdAt: `${TODAY}T09:15:00`, channelsNotified: ["in-app"],
    dismissedBy: DEFAULT_ACTOR, dismissedAt: `${TODAY}T09:30:00`, dismissReason: "Patient rebooked for tomorrow.",
  }),

  // Admission / Discharge (§10)
  baseAlert({
    category: "admission-discharge", alertType: "Discharge Summary Pending", severity: "medium", status: "new",
    title: "Discharge Summary Not Yet Completed", message: `${resolvePatientName("p-hamza-butt")} is marked discharge-ready but the discharge summary is still pending.`,
    patientId: "p-hamza-butt", patientName: resolvePatientName("p-hamza-butt"), departmentId: "dept-icu", departmentName: resolveDepartmentName("dept-icu"),
    source: "Bed Management", createdAt: `${TODAY}T13:00:00`, channelsNotified: ["in-app"],
  }),
  baseAlert({
    category: "admission-discharge", alertType: "Bed Capacity", severity: "high", status: "acknowledged",
    title: "ICU Bed Capacity Critical", message: "Intensive Care occupancy at 92% — limited capacity remaining for new admissions.",
    departmentId: "dept-icu", departmentName: resolveDepartmentName("dept-icu"),
    source: "Bed Management", createdAt: `${TODAY}T10:20:00`, channelsNotified: ["push", "in-app"],
    assignedToId: "marcus-chen", assignedToName: resolveStaffName("marcus-chen"),
    acknowledgedBy: resolveStaffName("marcus-chen"), acknowledgedAt: `${TODAY}T10:25:00`,
  }),

  // Nursing (§11)
  baseAlert({
    category: "nursing", alertType: "Vital Signs Overdue", severity: "medium", status: "new",
    title: "Scheduled Vitals Check Overdue", message: `${resolvePatientName("p-mariam-farooq")}'s 4-hourly vital signs check is overdue by 45 minutes.`,
    patientId: "p-mariam-farooq", patientName: resolvePatientName("p-mariam-farooq"), departmentId: "dept-icu", departmentName: resolveDepartmentName("dept-icu"),
    source: "Nursing", createdAt: `${TODAY}T12:30:00`, channelsNotified: ["in-app"],
  }),
  baseAlert({
    category: "nursing", alertType: "Patient Call Request", severity: "medium", status: "resolved",
    title: "Patient Call Bell Active", message: `${resolvePatientName("p-noor-fatima")} activated the call bell.`,
    patientId: "p-noor-fatima", patientName: resolvePatientName("p-noor-fatima"), departmentId: "dept-icu", departmentName: resolveDepartmentName("dept-icu"),
    source: "Nursing", createdAt: `${TODAY}T08:05:00`, channelsNotified: ["in-app"],
    assignedToId: "hina-tariq", assignedToName: resolveStaffName("hina-tariq"),
    resolvedBy: resolveStaffName("hina-tariq"), resolvedAt: `${TODAY}T08:12:00`, resolutionNote: "Assisted patient, no further action required.",
  }),

  // Surgery / OT (§12)
  baseAlert({
    category: "surgery", alertType: "Pre-Op Checklist Incomplete", severity: "high", status: "new",
    title: "Pre-Op Checklist Incomplete", message: `Appendectomy for ${resolvePatientName("p-kamal-siddiqui")} in Operating Room 03 — patient consent is missing from the pre-op checklist.`,
    patientId: "p-kamal-siddiqui", patientName: resolvePatientName("p-kamal-siddiqui"), departmentId: "dept-ot", departmentName: resolveDepartmentName("dept-ot"), location: "Operating Room 03",
    source: "OT / Surgery", createdAt: `${TODAY}T07:50:00`, channelsNotified: ["push", "in-app"],
    assignedToId: "ahmed-hassan", assignedToName: resolveStaffName("ahmed-hassan"),
  }),
  baseAlert({
    category: "surgery", alertType: "Surgery Delayed", severity: "medium", status: "in-progress",
    title: "Scheduled Surgery Delayed", message: "Operating Room 02 case delayed — awaiting anesthesia clearance.",
    departmentId: "dept-ot", departmentName: resolveDepartmentName("dept-ot"), location: "Operating Room 02",
    source: "OT / Surgery", createdAt: `${TODAY}T09:00:00`, channelsNotified: ["in-app"],
    assignedToId: "sara-malik", assignedToName: resolveStaffName("sara-malik"),
  }),

  // Radiology (§13)
  baseAlert({
    category: "radiology", alertType: "Critical Finding", severity: "critical", status: "new",
    title: "Critical Imaging Finding", message: `Acute intracranial hemorrhage identified on CT for ${resolvePatientName("p-zara-malik")} — immediate clinician notification required.`,
    patientId: "p-zara-malik", patientName: resolvePatientName("p-zara-malik"), departmentId: "dept-radiology", departmentName: resolveDepartmentName("dept-radiology"),
    source: "Radiology", sourceModule: "radiology", relatedRecordId: "rad-crit-1", createdAt: `${TODAY}T08:00:00`, channelsNotified: ["push", "sms", "in-app"],
    assignedToId: "sarah-jenkins", assignedToName: resolveStaffName("sarah-jenkins"),
  }),
  baseAlert({
    category: "radiology", alertType: "Machine Unavailable", severity: "medium", status: "acknowledged",
    title: "MRI Machine Down for Maintenance", message: "MRI Room 1 unavailable — scheduled studies for today are being rebooked.",
    departmentId: "dept-radiology", departmentName: resolveDepartmentName("dept-radiology"),
    source: "Radiology", createdAt: `${TODAY}T06:30:00`, channelsNotified: ["in-app"],
    assignedToId: "farah-chaudhry", assignedToName: resolveStaffName("farah-chaudhry"),
    acknowledgedBy: resolveStaffName("farah-chaudhry"), acknowledgedAt: `${TODAY}T06:45:00`,
  }),

  // Billing (§14)
  baseAlert({
    category: "billing", alertType: "Payment Failed", severity: "medium", status: "resolved",
    title: "Card Payment Failed", message: `Payment attempt for ${resolvePatientName("p-saira-cheema")}'s invoice failed — card declined.`,
    patientId: "p-saira-cheema", patientName: resolvePatientName("p-saira-cheema"),
    source: "Billing", createdAt: `${TODAY}T10:10:00`, channelsNotified: ["in-app"],
    resolvedBy: DEFAULT_ACTOR, resolvedAt: `${TODAY}T10:40:00`, resolutionNote: "Patient re-attempted payment via bank transfer.",
  }),
  baseAlert({
    category: "billing", alertType: "Outstanding Balance", severity: "low", status: "new",
    title: "Outstanding Balance Exceeds Credit Limit", message: `${resolvePatientName("p-rashid-qureshi")}'s outstanding balance has exceeded the configured credit limit.`,
    patientId: "p-rashid-qureshi", patientName: resolvePatientName("p-rashid-qureshi"),
    source: "Billing", createdAt: `${TODAY}T14:00:00`, channelsNotified: ["in-app"],
  }),

  // Insurance (§15)
  baseAlert({
    category: "insurance", alertType: "Authorization Expired", severity: "medium", status: "new",
    title: "Pre-Authorization Expired", message: `${resolvePatientName("p-layla-awan")}'s insurance pre-authorization expired before the scheduled procedure.`,
    patientId: "p-layla-awan", patientName: resolvePatientName("p-layla-awan"),
    source: "Insurance", createdAt: `${TODAY}T11:30:00`, channelsNotified: ["in-app"],
  }),
  baseAlert({
    category: "insurance", alertType: "Claim Denied", severity: "medium", status: "escalated",
    title: "Insurance Claim Denied", message: `Claim for ${resolvePatientName("p-amina-siddiqui")} was denied — coding review requested.`,
    patientId: "p-amina-siddiqui", patientName: resolvePatientName("p-amina-siddiqui"),
    source: "Insurance", createdAt: `${TODAY}T09:20:00`, channelsNotified: ["in-app"],
    escalationLevel: 1, escalationHistory: [{ level: 1, role: "Finance Manager", escalatedAt: `${TODAY}T13:20:00`, note: "Unresolved after 4 hours." }],
  }),

  // Patient (§16)
  baseAlert({
    category: "patient", alertType: "Lab Report Available", severity: "low", status: "resolved",
    title: "Lab Report Ready for Patient", message: `A new lab report is available for ${resolvePatientName("p-elena-rodriguez")} in the patient portal.`,
    patientId: "p-elena-rodriguez", patientName: resolvePatientName("p-elena-rodriguez"),
    source: "Patient Portal", createdAt: `${TODAY}T08:30:00`, channelsNotified: ["push", "email"],
    resolvedBy: "System", resolvedAt: `${TODAY}T08:30:05`, resolutionNote: "Delivered automatically on report finalization.",
  }),

  // System (§17)
  baseAlert({
    category: "system", alertType: "Backup Failed", severity: "high", status: "new",
    title: "Scheduled Database Backup Failed", message: "The 03:00 incremental database backup did not complete successfully.",
    source: "System", createdAt: `${TODAY}T03:05:00`, channelsNotified: ["email", "in-app"],
    assignedToId: undefined, assignedToName: "IT Administrator",
  }),
  baseAlert({
    category: "system", alertType: "Integration Failure", severity: "high", status: "acknowledged",
    title: "HL7 Message Delivery Failed", message: "Outbound ADT message to the regional health information exchange failed after 3 retries.",
    source: "System", createdAt: `${TODAY}T05:20:00`, channelsNotified: ["email", "in-app"],
    acknowledgedBy: "IT Administrator", acknowledgedAt: `${TODAY}T05:45:00`,
  }),

  // Security (§18)
  baseAlert({
    category: "security", alertType: "Multiple Failed Logins", severity: "high", status: "new",
    title: "Multiple Failed Login Attempts", message: "5 consecutive failed login attempts detected for a single account within 2 minutes.",
    source: "Security", createdAt: `${TODAY}T14:50:00`, channelsNotified: ["email", "in-app"],
  }),
  baseAlert({
    category: "security", alertType: "Bulk Record Export", severity: "critical", status: "escalated",
    title: "Bulk Patient Record Export Detected", message: "A single user account exported 2,430 patient records in one session — flagged for security investigation.",
    source: "Security", createdAt: `${TODAY}T14:32:00`, channelsNotified: ["email", "sms", "in-app"],
    escalationLevel: 1, escalationHistory: [{ level: 1, role: "Security Officer", escalatedAt: `${TODAY}T14:33:00`, note: "Auto-escalated — critical severity bypasses the standard delay." }],
  }),
];

// --- Alert lifecycle actions (spec §25-26) --------------------------------

export function getAlerts(filters: {
  severity?: AlertSeverity; category?: AlertCategory; status?: AlertStatus; departmentId?: string;
  patientId?: string; source?: string; assignedToId?: string; location?: string;
  channel?: NotificationChannel; search?: string;
} = {}) {
  let rows = [...alerts];
  if (filters.severity) rows = rows.filter((a) => a.severity === filters.severity);
  if (filters.category) rows = rows.filter((a) => a.category === filters.category);
  if (filters.status) rows = rows.filter((a) => a.status === filters.status);
  if (filters.departmentId) rows = rows.filter((a) => a.departmentId === filters.departmentId);
  if (filters.patientId) rows = rows.filter((a) => a.patientId === filters.patientId);
  if (filters.source) rows = rows.filter((a) => a.source === filters.source);
  if (filters.assignedToId) rows = rows.filter((a) => a.assignedToId === filters.assignedToId);
  if (filters.location) rows = rows.filter((a) => a.location === filters.location);
  if (filters.channel) rows = rows.filter((a) => a.channelsNotified.includes(filters.channel!));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((a) => a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q) || a.patientName?.toLowerCase().includes(q) || a.alertNumber.toLowerCase().includes(q));
  }
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return mockRequest(rows);
}

export function getAlert(id: string) {
  return mockRequest(alerts.find((a) => a.id === id) ?? null);
}

export function getCriticalAlerts() {
  return mockRequest(alerts.filter((a) => a.severity === "critical" && a.status !== "resolved" && a.status !== "dismissed").sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export function getMyAlerts(assigneeId: string) {
  return mockRequest(alerts.filter((a) => a.assignedToId === assigneeId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export async function acknowledgeAlert(id: string, actor: string = DEFAULT_ACTOR, note?: string) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) throw new Error("Alert not found");
  alert.status = "acknowledged";
  alert.acknowledgedBy = actor;
  alert.acknowledgedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  if (alert.sourceModule === "laboratory" && alert.relatedRecordId) {
    await acknowledgeLabCriticalAlert(alert.relatedRecordId, actor, note);
  } else if (alert.sourceModule === "radiology" && alert.relatedRecordId) {
    await acknowledgeRadiologyCriticalFinding(alert.relatedRecordId, actor, note);
  }
  return mockRequest(alert);
}

export function assignAlert(id: string, assigneeId: string, actor: string = DEFAULT_ACTOR) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) throw new Error("Alert not found");
  alert.assignedToId = assigneeId;
  alert.assignedToName = resolveStaffName(assigneeId) ?? assigneeId;
  if (alert.status === "new") alert.status = "in-progress";
  void actor;
  return mockRequest(alert);
}

export function escalateAlert(id: string, actor: string = DEFAULT_ACTOR, note?: string) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) throw new Error("Alert not found");
  const policy = findEscalationPolicy(alert.category, alert.severity);
  const nextLevel = alert.escalationLevel + 1;
  const levelDef = policy?.levels.find((l) => l.level === nextLevel) ?? policy?.levels[policy.levels.length - 1];
  alert.escalationLevel = nextLevel;
  alert.status = "escalated";
  alert.escalationHistory.push({ level: nextLevel, role: levelDef?.role ?? "Supervisor", escalatedAt: `${TODAY}T${new Date().toTimeString().slice(0, 8)}`, note });
  void actor;
  return mockRequest(alert);
}

export function resolveAlert(id: string, actor: string = DEFAULT_ACTOR, resolutionNote: string) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) throw new Error("Alert not found");
  alert.status = "resolved";
  alert.resolvedBy = actor;
  alert.resolvedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  alert.resolutionNote = resolutionNote;
  return mockRequest(alert);
}

export function dismissAlert(id: string, actor: string = DEFAULT_ACTOR, reason: string) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) throw new Error("Alert not found");
  alert.status = "dismissed";
  alert.dismissedBy = actor;
  alert.dismissedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  alert.dismissReason = reason;
  return mockRequest(alert);
}

// --- Escalation Policies (spec §24) ---------------------------------------

export interface EscalationLevelDef {
  level: number;
  role: string;
  afterMinutes: number;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  appliesToCategory: AlertCategory | "all";
  appliesToSeverity: AlertSeverity[];
  levels: EscalationLevelDef[];
}

export const escalationPolicies: EscalationPolicy[] = [
  {
    id: "esc-critical-clinical", name: "Critical Clinical Result Escalation", appliesToCategory: "laboratory", appliesToSeverity: ["critical"],
    levels: [
      { level: 1, role: "Ordering Doctor", afterMinutes: 0 },
      { level: 2, role: "Senior Doctor", afterMinutes: 5 },
      { level: 3, role: "Department Head", afterMinutes: 10 },
      { level: 4, role: "Hospital Supervisor", afterMinutes: 15 },
    ],
  },
  {
    id: "esc-emergency", name: "Emergency Alert Escalation", appliesToCategory: "emergency", appliesToSeverity: ["critical", "high"],
    levels: [
      { level: 1, role: "Emergency Physician", afterMinutes: 0 },
      { level: 2, role: "ED Charge Nurse", afterMinutes: 3 },
      { level: 3, role: "Hospital Supervisor", afterMinutes: 8 },
    ],
  },
  {
    id: "esc-security", name: "Security Incident Escalation", appliesToCategory: "security", appliesToSeverity: ["critical", "high"],
    levels: [
      { level: 1, role: "IT Administrator", afterMinutes: 0 },
      { level: 2, role: "Security Officer", afterMinutes: 1 },
      { level: 3, role: "Hospital Supervisor", afterMinutes: 10 },
    ],
  },
  {
    id: "esc-default", name: "Default Escalation", appliesToCategory: "all", appliesToSeverity: ["critical", "high", "medium", "low"],
    levels: [
      { level: 1, role: "Assigned Staff", afterMinutes: 0 },
      { level: 2, role: "Department Supervisor", afterMinutes: 15 },
      { level: 3, role: "Hospital Supervisor", afterMinutes: 30 },
    ],
  },
];

function findEscalationPolicy(category: AlertCategory, severity: AlertSeverity): EscalationPolicy | undefined {
  return escalationPolicies.find((p) => p.appliesToCategory === category && p.appliesToSeverity.includes(severity)) ?? escalationPolicies.find((p) => p.appliesToCategory === "all");
}

export function getEscalationPolicies() {
  return mockRequest(escalationPolicies);
}

// --- Notification Rules (spec §22 — the event/condition/channel/escalation
// routing table) ------------------------------------------------------------

export interface NotificationRule {
  id: string;
  event: string;
  condition: string;
  notifyRole: string;
  channels: NotificationChannel[];
  escalateAfterMinutes?: number;
  enabled: boolean;
}

export const notificationRules: NotificationRule[] = [
  { id: "nr-critical-lab", event: "Critical Lab Result", condition: "Severity = Critical", notifyRole: "Ordering Doctor", channels: ["push", "sms"], escalateAfterMinutes: 5, enabled: true },
  { id: "nr-critical-imaging", event: "Critical Imaging Finding", condition: "Severity = Critical", notifyRole: "Ordering Doctor", channels: ["push", "sms"], escalateAfterMinutes: 5, enabled: true },
  { id: "nr-low-stock", event: "Low Stock", condition: "Available <= Reorder Level", notifyRole: "Inventory Manager", channels: ["in-app"], enabled: true },
  { id: "nr-appt-reminder", event: "Appointment Reminder", condition: "24h / 2h / 15m before appointment", notifyRole: "Patient", channels: ["sms", "push"], enabled: true },
  { id: "nr-emergency-code", event: "Emergency Code", condition: "Any Code Blue / Code Red / Trauma Alert", notifyRole: "Emergency Team", channels: ["push", "sms", "in-app"], escalateAfterMinutes: 3, enabled: true },
  { id: "nr-security-bulk-export", event: "Bulk Patient Record Export", condition: "Records exported > 500", notifyRole: "Security Officer", channels: ["email", "sms"], escalateAfterMinutes: 1, enabled: true },
  { id: "nr-payment-failed", event: "Payment Failed", condition: "Payment status = Failed", notifyRole: "Finance Officer", channels: ["in-app"], enabled: true },
];

export function getNotificationRules() {
  return mockRequest(notificationRules);
}

// --- Alert Rules Builder (spec §23 — the no-code WHEN/AND/THEN builder) --

export interface AlertRuleCondition {
  field: string;
  operator: "equals" | "greater-than" | "less-than" | "contains";
  value: string;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerEvent: string;
  conditions: AlertRuleCondition[];
  priority: AlertSeverity;
  notifyRoles: string[];
  channels: NotificationChannel[];
  escalateAfterMinutes?: number;
}

export const alertRules: AlertRule[] = [
  {
    id: "rule-critical-lab", name: "Critical Lab Result → Notify Doctor", enabled: true, triggerEvent: "Lab Result Created",
    conditions: [{ field: "Result Severity", operator: "equals", value: "Critical" }],
    priority: "critical", notifyRoles: ["Ordering Doctor"], channels: ["push", "sms"], escalateAfterMinutes: 10,
  },
  {
    id: "rule-low-stock", name: "Stock Below Minimum → Notify Pharmacist", enabled: true, triggerEvent: "Stock Level Updated",
    conditions: [{ field: "Available Quantity", operator: "less-than", value: "Minimum Stock" }],
    priority: "high", notifyRoles: ["Inventory Manager", "Pharmacist"], channels: ["in-app"],
  },
  {
    id: "rule-icu-capacity", name: "ICU Occupancy Above 90% → Notify Bed Management", enabled: true, triggerEvent: "Bed Occupancy Updated",
    conditions: [{ field: "Ward Occupancy Rate", operator: "greater-than", value: "90" }],
    priority: "high", notifyRoles: ["Charge Nurse", "Hospital Supervisor"], channels: ["push", "in-app"],
  },
  {
    id: "rule-bulk-export", name: "Bulk Export → Security Investigation", enabled: true, triggerEvent: "Data Export Event",
    conditions: [{ field: "Records Exported", operator: "greater-than", value: "500" }],
    priority: "critical", notifyRoles: ["Security Officer"], channels: ["email", "sms"], escalateAfterMinutes: 1,
  },
];

export function getAlertRules() {
  return mockRequest(alertRules);
}

export function toggleAlertRule(id: string, enabled: boolean) {
  const rule = alertRules.find((r) => r.id === id);
  if (!rule) return mockRequest(null);
  rule.enabled = enabled;
  return mockRequest(rule);
}

export interface NewAlertRuleInput {
  name: string;
  triggerEvent: string;
  conditions: AlertRuleCondition[];
  priority: AlertSeverity;
  notifyRoles: string[];
  channels: NotificationChannel[];
  escalateAfterMinutes?: number;
}

export function createAlertRule(input: NewAlertRuleInput) {
  const rule: AlertRule = { id: `rule-${alertRules.length + 1}`, enabled: true, ...input };
  alertRules.push(rule);
  return mockRequest(rule);
}

// --- Notification Templates (spec §20-21 — multi-language) ----------------

export type TemplateLanguage = "en" | "ar" | "ur" | "fr";

export interface NotificationTemplate {
  id: string;
  name: string;
  event: string;
  channel: NotificationChannel;
  language: TemplateLanguage;
  subject?: string;
  message: string;
  variables: string[];
  status: "active" | "draft";
}

export const notificationTemplates: NotificationTemplate[] = [
  { id: "tmpl-appt-reminder-en", name: "Appointment Reminder", event: "APPOINTMENT_REMINDER", channel: "sms", language: "en", message: "Dear {{patientName}}, your appointment with Dr. {{doctorName}} is scheduled for {{appointmentDate}} at {{appointmentTime}}.", variables: ["patientName", "doctorName", "appointmentDate", "appointmentTime", "hospitalName", "department", "appointmentId"], status: "active" },
  { id: "tmpl-appt-reminder-ar", name: "Appointment Reminder (Arabic)", event: "APPOINTMENT_REMINDER", channel: "sms", language: "ar", message: "عزيزي {{patientName}}، موعدك مع الدكتور {{doctorName}} مقرر في {{appointmentDate}} الساعة {{appointmentTime}}.", variables: ["patientName", "doctorName", "appointmentDate", "appointmentTime"], status: "active" },
  { id: "tmpl-appt-reminder-ur", name: "Appointment Reminder (Urdu)", event: "APPOINTMENT_REMINDER", channel: "sms", language: "ur", message: "عزیز {{patientName}}، ڈاکٹر {{doctorName}} کے ساتھ آپ کی اپائنٹمنٹ {{appointmentDate}} کو {{appointmentTime}} پر ہے۔", variables: ["patientName", "doctorName", "appointmentDate", "appointmentTime"], status: "active" },
  { id: "tmpl-critical-lab-push", name: "Critical Lab Result", event: "CRITICAL_LAB_RESULT", channel: "push", language: "en", message: "CRITICAL: {{testName}} for {{patientName}} — {{value}}. Immediate review required.", variables: ["testName", "patientName", "value"], status: "active" },
  { id: "tmpl-lab-result-email", name: "Lab Result Available", event: "LAB_RESULT_AVAILABLE", channel: "email", language: "en", subject: "Your lab report is ready", message: "Dear {{patientName}}, your lab report from {{appointmentDate}} is now available in your patient portal.", variables: ["patientName", "appointmentDate"], status: "active" },
  { id: "tmpl-invoice-email", name: "Invoice Generated", event: "INVOICE_GENERATED", channel: "email", language: "en", subject: "New invoice from {{hospitalName}}", message: "Dear {{patientName}}, invoice {{appointmentId}} has been generated for your recent visit.", variables: ["patientName", "hospitalName", "appointmentId"], status: "active" },
  { id: "tmpl-low-stock-inapp", name: "Low Stock Alert", event: "LOW_STOCK", channel: "in-app", language: "en", message: "{{itemName}} is below the reorder level at {{department}}.", variables: ["itemName", "department"], status: "draft" },
];

export function getNotificationTemplates(filters: { event?: string; language?: TemplateLanguage } = {}) {
  let rows = [...notificationTemplates];
  if (filters.event) rows = rows.filter((t) => t.event === filters.event);
  if (filters.language) rows = rows.filter((t) => t.language === filters.language);
  return mockRequest(rows);
}

export function previewNotificationTemplate(template: NotificationTemplate, sampleData: Record<string, string>): string {
  return template.variables.reduce((msg, v) => msg.split(`{{${v}}}`).join(sampleData[v] ?? `{{${v}}}`), template.message);
}

export interface NewNotificationTemplateInput {
  name: string;
  event: string;
  channel: NotificationChannel;
  language: TemplateLanguage;
  subject?: string;
  message: string;
  variables: string[];
}

export function createNotificationTemplate(input: NewNotificationTemplateInput) {
  const template: NotificationTemplate = { id: `tmpl-${notificationTemplates.length + 1}`, status: "draft", ...input };
  notificationTemplates.push(template);
  return mockRequest(template);
}

export function updateNotificationTemplate(id: string, updates: Partial<Pick<NotificationTemplate, "message" | "subject" | "status">>) {
  const template = notificationTemplates.find((t) => t.id === id);
  if (!template) return mockRequest(null);
  Object.assign(template, updates);
  return mockRequest(template);
}

// --- Notification delivery tracking (spec §29-30) — named `NotificationRecord`
// (not the bare `Notification` DOM global) to avoid shadowing the browser
// Notifications API type anywhere this barrel is imported. ------------------

export type NotificationDeliveryStatus = "created" | "queued" | "sent" | "delivered" | "read" | "acknowledged" | "failed" | "retrying";

export interface NotificationRecord {
  id: string;
  notificationNumber: string;
  alertId?: string;
  event: string;
  recipientId?: string;
  recipientName: string;
  channel: NotificationChannel;
  priority: AlertSeverity;
  status: NotificationDeliveryStatus;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;
  retryCount: number;
}

const channelFallbackOrder: NotificationChannel[] = ["push", "sms", "email"];

export const notifications: NotificationRecord[] = [
  { id: "ntf-1", notificationNumber: "NTF-10001", alertId: "alert-1", event: "CRITICAL_LAB_RESULT", recipientId: "sarah-jenkins", recipientName: resolveStaffName("sarah-jenkins") ?? "Dr. Sarah Jenkins", channel: "push", priority: "critical", status: "read", createdAt: `${TODAY}T07:30:05`, sentAt: `${TODAY}T07:30:06`, deliveredAt: `${TODAY}T07:30:10`, readAt: `${TODAY}T07:31:00`, retryCount: 0 },
  { id: "ntf-2", notificationNumber: "NTF-10002", alertId: "alert-1", event: "CRITICAL_LAB_RESULT", recipientId: "sarah-jenkins", recipientName: resolveStaffName("sarah-jenkins") ?? "Dr. Sarah Jenkins", channel: "sms", priority: "critical", status: "delivered", createdAt: `${TODAY}T07:30:05`, sentAt: `${TODAY}T07:30:07`, deliveredAt: `${TODAY}T07:30:20`, retryCount: 0 },
  { id: "ntf-3", notificationNumber: "NTF-10003", alertId: "alert-19", event: "CRITICAL_IMAGING_FINDING", recipientId: "sarah-jenkins", recipientName: resolveStaffName("sarah-jenkins") ?? "Dr. Sarah Jenkins", channel: "push", priority: "critical", status: "delivered", createdAt: `${TODAY}T08:00:05`, sentAt: `${TODAY}T08:00:06`, deliveredAt: `${TODAY}T08:00:12`, retryCount: 0 },
  { id: "ntf-4", notificationNumber: "NTF-10004", event: "APPOINTMENT_REMINDER", recipientId: "p-hamza-butt", recipientName: resolvePatientName("p-hamza-butt") ?? "Hamza Butt", channel: "sms", priority: "low", status: "delivered", createdAt: `${TODAY}T06:00:00`, sentAt: `${TODAY}T06:00:02`, deliveredAt: `${TODAY}T06:00:15`, retryCount: 0 },
  { id: "ntf-5", notificationNumber: "NTF-10005", event: "APPOINTMENT_REMINDER", recipientId: "p-bilal-hussain", recipientName: resolvePatientName("p-bilal-hussain") ?? "Bilal Hussain", channel: "push", priority: "low", status: "failed", createdAt: `${TODAY}T07:00:00`, failureReason: "Device token expired", retryCount: 2 },
  { id: "ntf-6", notificationNumber: "NTF-10006", alertId: "alert-25", event: "SECURITY_BULK_EXPORT", recipientName: "Security Officer", channel: "email", priority: "critical", status: "sent", createdAt: `${TODAY}T14:32:05`, sentAt: `${TODAY}T14:32:06`, retryCount: 0 },
  { id: "ntf-7", notificationNumber: "NTF-10007", event: "LOW_STOCK", recipientId: "waqas-anjum", recipientName: resolveStaffName("waqas-anjum") ?? "Waqas Anjum", channel: "in-app", priority: "high", status: "read", createdAt: `${TODAY}T10:28:05`, sentAt: `${TODAY}T10:28:06`, deliveredAt: `${TODAY}T10:28:06`, readAt: `${TODAY}T10:35:00`, retryCount: 0 },
  { id: "ntf-8", notificationNumber: "NTF-10008", event: "PAYMENT_RECEIVED", recipientId: "p-saira-cheema", recipientName: resolvePatientName("p-saira-cheema") ?? "Saira Cheema", channel: "email", priority: "low", status: "failed", createdAt: `${TODAY}T10:41:00`, failureReason: "Mailbox unavailable", retryCount: 3 },
  { id: "ntf-9", notificationNumber: "NTF-10009", event: "INVOICE_GENERATED", recipientId: "p-rashid-qureshi", recipientName: resolvePatientName("p-rashid-qureshi") ?? "Rashid Qureshi", channel: "email", priority: "low", status: "delivered", createdAt: `${TODAY}T14:00:05`, sentAt: `${TODAY}T14:00:06`, deliveredAt: `${TODAY}T14:00:30`, retryCount: 0 },
  { id: "ntf-10", notificationNumber: "NTF-10010", event: "EMERGENCY_ALERT", recipientId: "nadia-farhan", recipientName: resolveStaffName("nadia-farhan") ?? "Dr. Nadia Farhan", channel: "push", priority: "critical", status: "retrying", createdAt: `${TODAY}T06:40:01`, failureReason: "Push gateway timeout", retryCount: 1 },
];

export function getNotificationCenter(recipientId?: string) {
  let rows = [...notifications];
  if (recipientId) rows = rows.filter((n) => n.recipientId === recipientId);
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return mockRequest(rows);
}

export function getNotificationHistory(filters: { channel?: NotificationChannel; status?: NotificationDeliveryStatus; event?: string } = {}) {
  let rows = [...notifications];
  if (filters.channel) rows = rows.filter((n) => n.channel === filters.channel);
  if (filters.status) rows = rows.filter((n) => n.status === filters.status);
  if (filters.event) rows = rows.filter((n) => n.event === filters.event);
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return mockRequest(rows);
}

export function getDeliveryLogs() {
  return mockRequest([...notifications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export function getFailedNotifications() {
  return mockRequest(notifications.filter((n) => n.status === "failed" || n.status === "retrying").sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
}

export function retryNotification(id: string) {
  const notification = notifications.find((n) => n.id === id);
  if (!notification) return mockRequest(null);
  const currentIndex = channelFallbackOrder.indexOf(notification.channel);
  const nextChannel = currentIndex >= 0 ? channelFallbackOrder[currentIndex + 1] : undefined;
  if (nextChannel) {
    const fallback: NotificationRecord = {
      ...notification, id: `${notification.id}-retry`, notificationNumber: `${notification.notificationNumber}-R`,
      channel: nextChannel, status: "sent", createdAt: `${TODAY}T${new Date().toTimeString().slice(0, 8)}`,
      sentAt: `${TODAY}T${new Date().toTimeString().slice(0, 8)}`, failureReason: undefined, retryCount: 0,
    };
    notifications.push(fallback);
    notification.status = "failed";
    return mockRequest(fallback);
  }
  notification.status = "retrying";
  notification.retryCount += 1;
  return mockRequest(notification);
}

// --- Notification Preferences (spec §27) — critical safety-critical
// channels can never be disabled by the user, per the spec's own explicit
// instruction. --------------------------------------------------------------

export interface ChannelPreferenceSet {
  push: boolean;
  sms: boolean;
  email: boolean;
  inApp: boolean;
}

export interface UserNotificationPreference {
  userId: string;
  userName: string;
  critical: ChannelPreferenceSet;
  high: ChannelPreferenceSet;
  medium: ChannelPreferenceSet;
  low: ChannelPreferenceSet;
}

const mandatoryCriticalChannels: (keyof ChannelPreferenceSet)[] = ["push", "sms"];

export const userNotificationPreferences: UserNotificationPreference[] = [
  {
    userId: "sarah-jenkins", userName: resolveStaffName("sarah-jenkins") ?? "Dr. Sarah Jenkins",
    critical: { push: true, sms: true, email: true, inApp: true },
    high: { push: true, sms: false, email: true, inApp: true },
    medium: { push: true, sms: false, email: false, inApp: true },
    low: { push: false, sms: false, email: false, inApp: true },
  },
  {
    userId: DEFAULT_ACTOR, userName: DEFAULT_ACTOR,
    critical: { push: true, sms: true, email: true, inApp: true },
    high: { push: true, sms: true, email: true, inApp: true },
    medium: { push: true, sms: false, email: true, inApp: true },
    low: { push: false, sms: false, email: false, inApp: true },
  },
];

export function getUserNotificationPreferences(userId: string) {
  const found = userNotificationPreferences.find((p) => p.userId === userId);
  return mockRequest(found ?? userNotificationPreferences.find((p) => p.userId === DEFAULT_ACTOR)!);
}

export function updateUserNotificationPreferences(userId: string, updates: Partial<Pick<UserNotificationPreference, "high" | "medium" | "low">> & { critical?: Partial<ChannelPreferenceSet> }) {
  const pref = userNotificationPreferences.find((p) => p.userId === userId);
  if (!pref) return mockRequest(null);
  if (updates.high) pref.high = updates.high;
  if (updates.medium) pref.medium = updates.medium;
  if (updates.low) pref.low = updates.low;
  if (updates.critical) {
    const merged = { ...pref.critical, ...updates.critical };
    mandatoryCriticalChannels.forEach((ch) => { merged[ch] = true; });
    pref.critical = merged;
  }
  return mockRequest(pref);
}

// --- Quiet Hours (spec §28) — critical alerts always bypass, never
// configurable off. ----------------------------------------------------------

export interface QuietHoursConfig {
  userId: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  bypassForCritical: true;
}

export const quietHoursConfigs: QuietHoursConfig[] = [
  { userId: "sarah-jenkins", enabled: true, startTime: "22:00", endTime: "07:00", bypassForCritical: true },
  { userId: DEFAULT_ACTOR, enabled: false, startTime: "22:00", endTime: "07:00", bypassForCritical: true },
];

export function getQuietHoursConfig(userId: string) {
  const found = quietHoursConfigs.find((q) => q.userId === userId);
  return mockRequest(found ?? { userId, enabled: false, startTime: "22:00", endTime: "07:00", bypassForCritical: true as const });
}

export function updateQuietHoursConfig(userId: string, updates: { enabled: boolean; startTime: string; endTime: string }) {
  let config = quietHoursConfigs.find((q) => q.userId === userId);
  if (!config) {
    config = { userId, enabled: false, startTime: "22:00", endTime: "07:00", bypassForCritical: true };
    quietHoursConfigs.push(config);
  }
  config.enabled = updates.enabled;
  config.startTime = updates.startTime;
  config.endTime = updates.endTime;
  return mockRequest(config);
}

// --- Dashboard (spec §1) — KPIs from the curated Alert store, plus live
// counts pulled straight from Inventory/Laboratory/Radiology/Security's own
// real alert-computation functions rather than a stale snapshot. ------------

export interface AlertsDashboardData {
  totalAlertsToday: number;
  criticalAlerts: number;
  highPriorityAlerts: number;
  unresolvedAlerts: number;
  acknowledgedAlerts: number;
  escalatedAlerts: number;
  failedNotifications: number;
  notificationsSent: number;
  deliveryRatePercent: number;
  averageResponseMinutes: number;
  statusBreakdown: Record<AlertStatus, number>;
  liveSignals: { source: string; count: number }[];
}

export async function getAlertsDashboard(): Promise<AlertsDashboardData> {
  const [inventoryAlerts, labCritical, radCritical] = await Promise.all([
    getInventoryAlerts(),
    getLabCriticalAlerts({ openOnly: true }),
    getCriticalFindingsList({ openOnly: true }),
  ]);
  const securityAlerts = getAuditAlerts();

  const statusBreakdown = alerts.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<AlertStatus, number>);

  const sent = notifications.filter((n) => n.status !== "created" && n.status !== "queued").length;
  const delivered = notifications.filter((n) => n.status === "delivered" || n.status === "read" || n.status === "acknowledged").length;
  const failed = notifications.filter((n) => n.status === "failed").length;

  const ackTimes = alerts.filter((a) => a.acknowledgedAt).map((a) => (new Date(a.acknowledgedAt!).getTime() - new Date(a.createdAt).getTime()) / 60000);
  const averageResponseMinutes = ackTimes.length ? Math.round(ackTimes.reduce((sum, m) => sum + m, 0) / ackTimes.length) : 0;

  return {
    totalAlertsToday: alerts.length,
    criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
    highPriorityAlerts: alerts.filter((a) => a.severity === "high").length,
    unresolvedAlerts: alerts.filter((a) => !["resolved", "dismissed", "expired"].includes(a.status)).length,
    acknowledgedAlerts: alerts.filter((a) => a.status === "acknowledged").length,
    escalatedAlerts: alerts.filter((a) => a.escalationLevel > 0).length,
    failedNotifications: failed,
    notificationsSent: sent,
    deliveryRatePercent: sent ? Math.round((delivered / sent) * 100) : 0,
    averageResponseMinutes,
    statusBreakdown,
    liveSignals: [
      { source: "Inventory", count: inventoryAlerts.length },
      { source: "Laboratory (open critical)", count: labCritical.length },
      { source: "Radiology (open critical)", count: radCritical.length },
      { source: "Security", count: securityAlerts.length },
    ],
  };
}

// --- Reports (spec §37) ------------------------------------------------------

export interface AlertsReportData {
  totalAlerts: number;
  acknowledged: number;
  escalated: number;
  unresolved: number;
  averageAcknowledgementMinutes: number;
  byDepartment: { name: string; count: number }[];
  bySeverity: { severity: AlertSeverity; count: number }[];
  bySource: { source: string; count: number }[];
  byChannel: { channel: NotificationChannel; count: number }[];
}

export async function getAlertsReport(): Promise<AlertsReportData> {
  const dashboard = await getAlertsDashboard();

  const byDepartmentMap = new Map<string, number>();
  alerts.forEach((a) => { if (a.departmentName) byDepartmentMap.set(a.departmentName, (byDepartmentMap.get(a.departmentName) ?? 0) + 1); });

  const bySeverityMap = new Map<AlertSeverity, number>();
  alerts.forEach((a) => bySeverityMap.set(a.severity, (bySeverityMap.get(a.severity) ?? 0) + 1));

  const bySourceMap = new Map<string, number>();
  alerts.forEach((a) => bySourceMap.set(a.source, (bySourceMap.get(a.source) ?? 0) + 1));

  const byChannelMap = new Map<NotificationChannel, number>();
  notifications.forEach((n) => byChannelMap.set(n.channel, (byChannelMap.get(n.channel) ?? 0) + 1));

  return {
    totalAlerts: alerts.length,
    acknowledged: alerts.filter((a) => a.acknowledgedAt).length,
    escalated: dashboard.escalatedAlerts,
    unresolved: dashboard.unresolvedAlerts,
    averageAcknowledgementMinutes: dashboard.averageResponseMinutes,
    byDepartment: Array.from(byDepartmentMap, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    bySeverity: Array.from(bySeverityMap, ([severity, count]) => ({ severity, count })),
    bySource: Array.from(bySourceMap, ([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
    byChannel: Array.from(byChannelMap, ([channel, count]) => ({ channel, count })),
  };
}
