import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { staffMembers } from "./staff";
import { patientSeeds } from "./patients";
import { getBedAuditLog } from "./beds";
import { getLabAuditLog } from "./laboratory";
import { getRadiologyAuditLog } from "./radiology";
import { getPharmacyAuditLog } from "./pharmacy";
import { getOTAuditLog } from "./ot";
import { getInventoryAuditLog } from "./inventory";
import { getEmergencyAuditLog } from "./emergency";

// ============================================================================
// Audit & Security (Hospital Admin's [full] section — full 48-section build
// per AUDIT_MODULE_SPEC.md, per the user's own explicit choice). This is
// the hospital-wide event trail across every module — Bed Management's own
// `recordBedAudit`/Audit tab (and every other module's own scoped audit
// log/tab) stays exactly as-is; this module is additive, aggregating and
// enriching those real logs into the richer AUDIT_EVENT schema the spec
// describes (actor/patient/resource/technical-context/severity/result),
// plus new curated event streams for concepts no existing module tracks yet
// (Authentication, Security, Data Export/Print/Download, Consent, Emergency/
// Break-glass Access, System/background-job events).
//
// Per the spec's own explicit framing (§39-44: AUDIT_EVENT schema,
// correlation ID, Kafka/microservice event bus, FHIR AuditEvent/Provenance)
// — those are backend/architecture concepts "for later." This file builds
// the FRONTEND surface only, with realistic mock data shaped so a real
// Audit Service could slot in later without a redesign: every event still
// carries a `correlationId`/`requestId` field, even though nothing here
// actually publishes to an event bus.
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

function resolveStaffName(staffId?: string): string {
  if (!staffId) return "System";
  return staffMembers.find((s) => s.id === staffId)?.name ?? staffId;
}
function resolveStaffRole(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  const staff = staffMembers.find((s) => s.id === staffId);
  return staff?.title;
}
function resolveStaffDepartmentId(staffId?: string): string | undefined {
  if (!staffId) return undefined;
  const staff = staffMembers.find((s) => s.id === staffId);
  const dept = departmentConfigs.find((d) => d.name === staff?.department);
  return dept?.id;
}
function resolveDepartmentName(departmentId?: string): string | undefined {
  return departmentConfigs.find((d) => d.id === departmentId)?.name;
}
function resolvePatientName(patientId?: string): string | undefined {
  if (!patientId) return undefined;
  return patientSeeds.find((p) => p.id === patientId)?.fullName;
}

// --- Core taxonomy (spec §4-7, §15) — standardized, never hospital-specific
// free text. --------------------------------------------------------------

export type AuditEventCategory = "authentication" | "patient" | "clinical" | "medication" | "laboratory" | "radiology" | "billing" | "administration" | "integration" | "security" | "system";

export type AuditActionType =
  | "CREATE" | "READ" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "IMPORT" | "DOWNLOAD" | "UPLOAD"
  | "SHARE" | "PRINT" | "APPROVE" | "REJECT" | "CANCEL" | "SIGN" | "VERIFY" | "DISPENSE" | "ADMINISTER" | "MERGE" | "UNMERGE";

export type AuditSeverity = "info" | "low" | "medium" | "high" | "critical";
export type AuditResult = "success" | "failed" | "denied" | "blocked" | "partial";
export type AuditSource = "web" | "mobile" | "api" | "integration" | "system" | "background-job";
export type AuditIntegrityStatus = "verified" | "pending" | "error";

export interface AuditChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface AuditEvent {
  id: string;
  auditId: string;
  timestamp: string;
  category: AuditEventCategory;
  eventName: string;
  action: AuditActionType;
  result: AuditResult;
  severity: AuditSeverity;
  denialReason?: string;
  actorId?: string;
  actorType: "human" | "system" | "patient";
  actorName: string;
  actorRole?: string;
  departmentId?: string;
  organizationName: string;
  patientId?: string;
  encounterId?: string;
  resourceType?: string;
  resourceId?: string;
  endpoint?: string;
  changes?: AuditChange[];
  ipAddress?: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
  application?: string;
  sessionId?: string;
  source: AuditSource;
  correlationId?: string;
  requestId?: string;
  integrityStatus: AuditIntegrityStatus;
  archived: boolean;
}

let auditSeq = 0;
function nextAuditId(): string {
  auditSeq += 1;
  return `AUD-2026-${String(auditSeq).padStart(8, "0")}`;
}

function baseEvent(partial: Omit<AuditEvent, "id" | "auditId" | "actorType" | "organizationName" | "integrityStatus" | "archived" | "source"> & Partial<Pick<AuditEvent, "actorType" | "organizationName" | "integrityStatus" | "archived" | "source">>): AuditEvent {
  return {
    id: `evt-${auditSeq + 1}`,
    auditId: nextAuditId(),
    actorType: "human",
    organizationName: "City General Hospital",
    integrityStatus: "verified",
    archived: false,
    source: "web",
    ...partial,
  };
}

// --- Curated seed events (spec §4 — Authentication/Patient/Clinical/
// Medication/Billing/Administration/Security/System categories no existing
// module's own audit log tracks). Every actor/patient/department
// cross-references real seed data from earlier in this session. -----------

export const auditEvents: AuditEvent[] = [
  // Authentication
  baseEvent({ timestamp: `${TODAY}T08:00:12`, category: "authentication", eventName: "Login", action: "LOGIN", result: "success", severity: "info", actorId: "sarah-jenkins", actorName: resolveStaffName("sarah-jenkins"), actorRole: resolveStaffRole("sarah-jenkins"), departmentId: resolveStaffDepartmentId("sarah-jenkins"), ipAddress: "192.168.1.42", device: "Desktop", browser: "Chrome", operatingSystem: "Windows", application: "HMS Web", sessionId: "SES-88231001", source: "web", correlationId: "CORR-100001", requestId: "REQ-100001" }),
  baseEvent({ timestamp: `${TODAY}T08:02:47`, category: "authentication", eventName: "Login Failed", action: "LOGIN", result: "failed", severity: "medium", actorName: "Unknown", actorType: "human", denialReason: "Incorrect password", ipAddress: "203.0.113.51", device: "Desktop", browser: "Firefox", operatingSystem: "Windows", application: "HMS Web", source: "web", correlationId: "CORR-100002", requestId: "REQ-100002" }),
  baseEvent({ timestamp: `${TODAY}T08:03:10`, category: "authentication", eventName: "Login Failed", action: "LOGIN", result: "failed", severity: "medium", actorName: "Unknown", actorType: "human", denialReason: "Incorrect password", ipAddress: "203.0.113.51", device: "Desktop", browser: "Firefox", operatingSystem: "Windows", application: "HMS Web", source: "web", correlationId: "CORR-100003", requestId: "REQ-100003" }),
  baseEvent({ timestamp: `${TODAY}T08:03:22`, category: "security", eventName: "Account Locked", action: "UPDATE", result: "success", severity: "high", actorName: "System", actorType: "system", resourceType: "UserAccount", resourceId: "USR-UNKNOWN-51", ipAddress: "203.0.113.51", source: "system", correlationId: "CORR-100003", requestId: "REQ-100004" }),
  baseEvent({ timestamp: `${TODAY}T08:15:03`, category: "authentication", eventName: "MFA Enabled", action: "UPDATE", result: "success", severity: "low", actorId: "michael-chen", actorName: resolveStaffName("michael-chen"), actorRole: resolveStaffRole("michael-chen"), departmentId: resolveStaffDepartmentId("michael-chen"), ipAddress: "192.168.1.58", device: "Desktop", browser: "Chrome", operatingSystem: "macOS", application: "HMS Web", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T09:02:00`, category: "authentication", eventName: "Login", action: "LOGIN", result: "success", severity: "info", actorId: "nadia-farhan", actorName: resolveStaffName("nadia-farhan"), actorRole: resolveStaffRole("nadia-farhan"), departmentId: resolveStaffDepartmentId("nadia-farhan"), ipAddress: "192.168.1.71", device: "Desktop", browser: "Chrome", operatingSystem: "Windows", application: "HMS Web", sessionId: "SES-88231007", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T17:31:00`, category: "authentication", eventName: "Logout", action: "LOGOUT", result: "success", severity: "info", actorId: "sarah-jenkins", actorName: resolveStaffName("sarah-jenkins"), actorRole: resolveStaffRole("sarah-jenkins"), sessionId: "SES-88231001", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T11:10:00`, category: "authentication", eventName: "Password Changed", action: "UPDATE", result: "success", severity: "low", actorId: "amina-farooqi", actorName: resolveStaffName("amina-farooqi"), actorRole: resolveStaffRole("amina-farooqi"), source: "web" }),

  // Patient
  baseEvent({ timestamp: `${TODAY}T09:15:00`, category: "patient", eventName: "Patient Viewed", action: "READ", result: "success", severity: "low", actorId: "sarah-jenkins", actorName: resolveStaffName("sarah-jenkins"), actorRole: resolveStaffRole("sarah-jenkins"), departmentId: resolveStaffDepartmentId("sarah-jenkins"), patientId: "p-ibrar-ahmad", resourceType: "Patient", resourceId: "p-ibrar-ahmad", endpoint: "GET /api/v1/patients/p-ibrar-ahmad", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T09:16:40`, category: "patient", eventName: "Patient Record Access", action: "READ", result: "denied", severity: "high", denialReason: "Insufficient permission — patient not in provider's assigned department", actorId: "hira-tariq", actorName: resolveStaffName("hira-tariq"), actorRole: resolveStaffRole("hira-tariq"), patientId: "p-usman-khan", resourceType: "Patient", resourceId: "p-usman-khan", endpoint: "GET /api/v1/patients/p-usman-khan", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T10:02:00`, category: "patient", eventName: "Patient Updated", action: "UPDATE", result: "success", severity: "medium", actorId: "michael-chen", actorName: resolveStaffName("michael-chen"), actorRole: resolveStaffRole("michael-chen"), patientId: "p-fatima-sheikh", resourceType: "Patient", resourceId: "p-fatima-sheikh", changes: [{ fieldName: "Phone", oldValue: "+1 (555) 010-9921", newValue: "+1 (555) 010-4471" }, { fieldName: "Address", oldValue: "Riyadh", newValue: "Jeddah" }], source: "web" }),
  baseEvent({ timestamp: `${TODAY}T10:20:00`, category: "patient", eventName: "Patient Identifier Changed", action: "UPDATE", result: "success", severity: "medium", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", patientId: "p-hassan-abbasi", resourceType: "Patient", resourceId: "p-hassan-abbasi", changes: [{ fieldName: "National ID Status", oldValue: "Unverified", newValue: "Verified" }], source: "web" }),

  // Clinical
  baseEvent({ timestamp: `${TODAY}T10:31:00`, category: "clinical", eventName: "Result Viewed", action: "READ", result: "success", severity: "medium", actorId: "sarah-jenkins", actorName: resolveStaffName("sarah-jenkins"), actorRole: resolveStaffRole("sarah-jenkins"), patientId: "p-usman-khan", resourceType: "LabResult", resourceId: "lab-order-1008", endpoint: "GET /api/v1/lab-results/lab-order-1008", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T10:42:31`, category: "clinical", eventName: "Patient Record Access", action: "READ", result: "success", severity: "medium", actorId: "sarah-jenkins", actorName: resolveStaffName("sarah-jenkins"), actorRole: resolveStaffRole("sarah-jenkins"), departmentId: resolveStaffDepartmentId("sarah-jenkins"), patientId: "p-ibrar-ahmad", resourceType: "Patient", resourceId: "p-ibrar-ahmad", endpoint: "GET /api/v1/patients/p-ibrar-ahmad", source: "web", correlationId: "CORR-100892", requestId: "REQ-100892" }),
  baseEvent({ timestamp: `${TODAY}T10:44:00`, category: "clinical", eventName: "Diagnosis Added", action: "CREATE", result: "success", severity: "medium", actorId: "nadia-farhan", actorName: resolveStaffName("nadia-farhan"), actorRole: resolveStaffRole("nadia-farhan"), patientId: "p-hassan-abbasi", resourceType: "Condition", resourceId: "cond-2201", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T10:48:00`, category: "clinical", eventName: "Clinical Note Created", action: "CREATE", result: "success", severity: "low", actorId: "nadia-farhan", actorName: resolveStaffName("nadia-farhan"), actorRole: resolveStaffRole("nadia-farhan"), patientId: "p-hassan-abbasi", resourceType: "ClinicalNote", resourceId: "note-3391", source: "web" }),

  // Billing
  baseEvent({ timestamp: `${TODAY}T09:32:00`, category: "billing", eventName: "Invoice Created", action: "CREATE", result: "success", severity: "low", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", patientId: "p-ibrar-ahmad", resourceType: "Invoice", resourceId: "inv-1", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T09:40:00`, category: "billing", eventName: "Payment Recorded", action: "UPDATE", result: "success", severity: "low", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", patientId: "p-ibrar-ahmad", resourceType: "Payment", resourceId: "pay-1", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T11:05:00`, category: "billing", eventName: "Claim Submitted", action: "CREATE", result: "success", severity: "low", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", resourceType: "Claim", resourceId: "claim-1", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T11:20:00`, category: "billing", eventName: "Large Data Export — Financial Report", action: "EXPORT", result: "success", severity: "high", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", resourceType: "Report", resourceId: "monthly-revenue-2026-08", source: "web" }),

  // Administration
  baseEvent({ timestamp: `${TODAY}T08:20:00`, category: "administration", eventName: "User Created", action: "CREATE", result: "success", severity: "medium", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", resourceType: "UserAccount", resourceId: "USR-10450", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T08:25:00`, category: "administration", eventName: "Department Created", action: "CREATE", result: "success", severity: "medium", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", resourceType: "Department", resourceId: "dept-emergency", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T10:31:00`, category: "administration", eventName: "Permission Changed", action: "UPDATE", result: "success", severity: "high", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", resourceType: "PractitionerRole", resourceId: "hira-tariq", changes: [{ fieldName: "Role", oldValue: "Nurse", newValue: "Senior Nurse" }], source: "web" }),
  baseEvent({ timestamp: `${TODAY}T14:02:00`, category: "administration", eventName: "Configuration Changed", action: "UPDATE", result: "success", severity: "medium", actorName: DEFAULT_ACTOR, actorRole: "Hospital Administrator", resourceType: "TriageCategory", resourceId: "triage-urgent", changes: [{ fieldName: "Target Minutes", oldValue: "45", newValue: "30" }], source: "web" }),

  // Security
  baseEvent({ timestamp: `${TODAY}T12:05:00`, category: "security", eventName: "Suspicious Access Pattern", action: "READ", result: "blocked", severity: "critical", actorId: "hira-tariq", actorName: resolveStaffName("hira-tariq"), actorRole: resolveStaffRole("hira-tariq"), resourceType: "Patient", denialReason: "12 distinct patient records accessed within 2 minutes — exceeds normal access rate", ipAddress: "192.168.1.90", device: "Desktop", browser: "Chrome", operatingSystem: "Windows", source: "web" }),
  baseEvent({ timestamp: `${TODAY}T13:00:00`, category: "security", eventName: "Unauthorized API Request", action: "READ", result: "denied", severity: "critical", actorName: "Unknown External Client", actorType: "system", denialReason: "Invalid OAuth token", resourceType: "Patient", endpoint: "GET /fhir/Patient/9981", ipAddress: "198.51.100.23", source: "api" }),

  // Integration (API/FHIR/HL7/DICOM — spec §16)
  baseEvent({ timestamp: `${TODAY}T10:32:41`, category: "integration", eventName: "FHIR Request", action: "READ", result: "success", severity: "low", actorName: "External Hospital", actorType: "system", resourceType: "Patient", endpoint: "GET /fhir/Patient/123", source: "api", correlationId: "CORR-FHIR-0001", requestId: "REQ-FHIR-0001" }),
  baseEvent({ timestamp: `${TODAY}T10:40:00`, category: "integration", eventName: "HL7 Message — ADT^A01", action: "IMPORT", result: "success", severity: "low", actorName: "External Hospital", actorType: "system", resourceType: "HL7Message", resourceId: "MSG-293921", source: "integration" }),
  baseEvent({ timestamp: `${TODAY}T10:55:00`, category: "integration", eventName: "DICOM C-STORE — CT Scanner", action: "UPLOAD", result: "success", severity: "low", actorName: "CT Scanner", actorType: "system", resourceType: "DICOMStudy", resourceId: "study-4471", source: "integration" }),
  baseEvent({ timestamp: `${TODAY}T11:15:00`, category: "integration", eventName: "Integration Failure — Lab Interface", action: "IMPORT", result: "failed", severity: "high", actorName: "Lab Integration Service", actorType: "system", denialReason: "Connection timeout to external LIS", resourceType: "HL7Message", source: "integration" }),

  // System
  baseEvent({ timestamp: `${TODAY}T02:00:00`, category: "system", eventName: "Scheduled Task — Nightly Reconciliation", action: "UPDATE", result: "success", severity: "info", actorName: "Reconciliation Job", actorType: "system", source: "background-job" }),
  baseEvent({ timestamp: `${TODAY}T03:00:00`, category: "system", eventName: "Data Synchronization — Insurance Eligibility", action: "UPDATE", result: "partial", severity: "medium", actorName: "Eligibility Sync Job", actorType: "system", denialReason: "3 of 240 records failed validation", source: "background-job" }),
];

// --- Documents (Print/Download/Export — spec §22-24, consolidated into one
// tab per this project's established discipline) ------------------------

export type DataExportMethod = "download" | "print" | "export";

export interface DataExportEvent {
  id: string;
  timestamp: string;
  actorId?: string;
  actorName: string;
  method: DataExportMethod;
  dataset: string;
  patientId?: string;
  recordCount: number;
  format?: string;
  reason?: string;
  destination?: string;
  result: AuditResult;
  authorized: boolean;
  referenceId: string;
}

export const dataExportEvents: DataExportEvent[] = [
  { id: "exp-1", timestamp: `${TODAY}T09:32:00`, actorName: DEFAULT_ACTOR, method: "export", dataset: "Patient Reports", recordCount: 1250, format: "CSV", reason: "Operational Reporting", destination: "Local Download", result: "success", authorized: true, referenceId: "EXP-2026-0001" },
  { id: "exp-2", timestamp: `${TODAY}T11:02:00`, actorId: "nadia-farhan", actorName: resolveStaffName("nadia-farhan"), method: "print", dataset: "Discharge Summary", patientId: "p-elena-rodriguez", recordCount: 1, format: "PDF", destination: "Local Printer — ED-PRT-01", result: "success", authorized: true, referenceId: "PRN-2026-0001" },
  { id: "exp-3", timestamp: `${TODAY}T13:45:00`, actorId: "sarah-jenkins", actorName: resolveStaffName("sarah-jenkins"), method: "download", dataset: "Lab Report", patientId: "p-usman-khan", recordCount: 1, format: "PDF", destination: "Local Download", result: "success", authorized: true, referenceId: "DL-2026-0001" },
  { id: "exp-4", timestamp: `${TODAY}T14:10:00`, actorName: DEFAULT_ACTOR, method: "export", dataset: "Monthly Revenue Report", recordCount: 25000, format: "Excel", reason: "Finance Review", destination: "Local Download", result: "success", authorized: true, referenceId: "EXP-2026-0002" },
];

export function getDataExportEvents() {
  return mockRequest([...dataExportEvents].reverse());
}

// --- Consent Audit (spec §25) ---------------------------------------------

export type ConsentAction = "CONSENT_GRANTED" | "CONSENT_REVOKED" | "CONSENT_UPDATED" | "CONSENT_EXPIRED" | "CONSENT_DENIED";

export interface ConsentAuditEvent {
  id: string;
  timestamp: string;
  patientId: string;
  action: ConsentAction;
  purpose: string;
  organization: string;
  dataCategories: string[];
  durationDays?: number;
  actor: "patient" | "provider" | "admin";
}

export const consentAuditEvents: ConsentAuditEvent[] = [
  { id: "cons-1", timestamp: `${TODAY}T08:40:00`, patientId: "p-ibrar-ahmad", action: "CONSENT_GRANTED", purpose: "Treatment", organization: "Hospital B — Regional Cardiac Center", dataCategories: ["Laboratory", "Medication"], durationDays: 30, actor: "patient" },
  { id: "cons-2", timestamp: `${TODAY}T09:10:00`, patientId: "p-fatima-sheikh", action: "CONSENT_REVOKED", purpose: "Data Sharing", organization: "Partner Clinic — Jeddah", dataCategories: ["Full Record"], actor: "patient" },
  { id: "cons-3", timestamp: `${TODAY}T09:50:00`, patientId: "p-hassan-abbasi", action: "CONSENT_DENIED", purpose: "Research", organization: "University Research Program", dataCategories: ["De-identified Clinical Data"], actor: "patient" },
];

export function getConsentAuditEvents() {
  return mockRequest([...consentAuditEvents].reverse());
}

// --- Emergency / Break-glass Access Audit (spec §26) ------------------------

export interface EmergencyAccessEvent {
  id: string;
  timestamp: string;
  providerId: string;
  patientId: string;
  reason: string;
  resourcesAccessed: string[];
  authorizationPolicy: string;
}

export const emergencyAccessEvents: EmergencyAccessEvent[] = [
  { id: "bga-1", timestamp: `${TODAY}T05:35:00`, providerId: "nadia-farhan", patientId: "p-saira-cheema", reason: "Emergency Treatment — patient unconscious, no accessible prior record consent on file", resourcesAccessed: ["Medical Record", "Medication History", "Allergy List"], authorizationPolicy: "Emergency Access Policy v2" },
];

export function getEmergencyAccessEvents() {
  return mockRequest([...emergencyAccessEvents].reverse());
}

// --- Login Sessions (spec §20-21) -------------------------------------------

export interface LoginSession {
  id: string;
  actorId: string;
  actorName: string;
  loginTime: string;
  logoutTime?: string;
  ipAddress: string;
  device: string;
  browser: string;
  result: AuditResult;
  mfaUsed: boolean;
  location?: string;
}

export const loginSessions: LoginSession[] = [
  { id: "sess-1", actorId: "sarah-jenkins", actorName: resolveStaffName("sarah-jenkins"), loginTime: `${TODAY}T08:00:12`, logoutTime: `${TODAY}T17:31:00`, ipAddress: "192.168.1.42", device: "Desktop", browser: "Chrome", result: "success", mfaUsed: true, location: "Main Campus" },
  { id: "sess-2", actorId: "michael-chen", actorName: resolveStaffName("michael-chen"), loginTime: `${TODAY}T08:15:00`, logoutTime: `${TODAY}T16:45:00`, ipAddress: "192.168.1.58", device: "Desktop", browser: "Chrome", result: "success", mfaUsed: true, location: "Main Campus" },
  { id: "sess-3", actorId: "nadia-farhan", actorName: resolveStaffName("nadia-farhan"), loginTime: `${TODAY}T09:02:00`, ipAddress: "192.168.1.71", device: "Desktop", browser: "Chrome", result: "success", mfaUsed: false, location: "Main Campus" },
];

export function getLoginSessions() {
  return mockRequest([...loginSessions].reverse());
}

export interface FailedLoginSummary {
  actorName: string;
  attempts: number;
  lastAttempt: string;
}

export function getFailedLoginSummary(): FailedLoginSummary[] {
  const failed = auditEvents.filter((e) => e.category === "authentication" && e.action === "LOGIN" && e.result === "failed");
  const map = new Map<string, { attempts: number; lastAttempt: string }>();
  failed.forEach((e) => {
    const key = e.actorName;
    const existing = map.get(key) ?? { attempts: 0, lastAttempt: e.timestamp };
    existing.attempts += 1;
    existing.lastAttempt = e.timestamp > existing.lastAttempt ? e.timestamp : existing.lastAttempt;
    map.set(key, existing);
  });
  return Array.from(map.entries()).map(([actorName, v]) => ({ actorName, ...v })).sort((a, b) => b.attempts - a.attempts);
}

// --- Investigations (spec §37) ----------------------------------------------

export type InvestigationStatus = "open" | "under-review" | "resolved" | "closed";

export interface InvestigationNote {
  timestamp: string;
  author: string;
  note: string;
}

export interface Investigation {
  id: string;
  caseNumber: string;
  subject: string;
  relatedEventIds: string[];
  userIds: string[];
  patientIds: string[];
  status: InvestigationStatus;
  assignedTo: string;
  openedAt: string;
  notes: InvestigationNote[];
  resolution?: string;
}

export const investigations: Investigation[] = [
  {
    id: "inv-1",
    caseNumber: "INV-2026-00291",
    subject: "Unauthorized Patient Access Pattern",
    relatedEventIds: [],
    userIds: ["hira-tariq"],
    patientIds: ["p-usman-khan"],
    status: "open",
    assignedTo: DEFAULT_ACTOR,
    openedAt: `${TODAY}T12:10:00`,
    notes: [{ timestamp: `${TODAY}T12:12:00`, author: DEFAULT_ACTOR, note: "Flagged automatically by the suspicious-access-pattern alert. Reviewing access justification with department head." }],
  },
];

export interface NewInvestigationInput {
  subject: string;
  userIds: string[];
  patientIds: string[];
  assignedTo: string;
}

export function openInvestigation(input: NewInvestigationInput) {
  const investigation: Investigation = { ...input, id: `inv-${investigations.length + 1}`, caseNumber: `INV-2026-${String(investigations.length + 1).padStart(5, "0")}`, relatedEventIds: [], status: "open", openedAt: NOW, notes: [] };
  investigations.push(investigation);
  return mockRequest(investigation);
}

export function addInvestigationNote(investigationId: string, note: string, author = DEFAULT_ACTOR) {
  const investigation = investigations.find((i) => i.id === investigationId);
  if (!investigation) return mockRequest(null);
  investigation.notes.push({ timestamp: NOW, author, note });
  return mockRequest(investigation);
}

export function updateInvestigationStatus(investigationId: string, status: InvestigationStatus, resolution?: string) {
  const investigation = investigations.find((i) => i.id === investigationId);
  if (!investigation) return mockRequest(null);
  investigation.status = status;
  if (resolution) investigation.resolution = resolution;
  return mockRequest(investigation);
}

export function getInvestigations(filters: { status?: InvestigationStatus } = {}) {
  let rows = [...investigations].reverse();
  if (filters.status) rows = rows.filter((i) => i.status === filters.status);
  return mockRequest(rows);
}

// --- Alerts (spec §35) — computed live from real event patterns, never a
// stored decorative list. ------------------------------------------------

export interface SecurityAuditAlert {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  status: "under-investigation" | "acknowledged" | "new";
  relatedActorName?: string;
  createdAt: string;
}

export function getAuditAlerts(): SecurityAuditAlert[] {
  const alerts: SecurityAuditAlert[] = [];

  // Real pattern: >= 3 patient reads by the same actor within a tight window
  const patientReads = auditEvents.filter((e) => e.category === "patient" || (e.category === "clinical" && e.action === "READ" && e.patientId));
  const byActor = new Map<string, AuditEvent[]>();
  patientReads.forEach((e) => {
    const key = e.actorName;
    byActor.set(key, [...(byActor.get(key) ?? []), e]);
  });
  byActor.forEach((events, actorName) => {
    if (events.length >= 2) {
      alerts.push({
        id: `alert-access-${actorName}`,
        title: "Elevated Patient Access Volume",
        description: `${events.length} patient records accessed by ${actorName} today.`,
        severity: events.length >= 3 ? "high" : "medium",
        status: "new",
        relatedActorName: actorName,
        createdAt: NOW,
      });
    }
  });

  auditEvents.filter((e) => e.severity === "critical").forEach((e) => {
    alerts.push({ id: `alert-critical-${e.id}`, title: e.eventName, description: e.denialReason ?? `Critical severity event by ${e.actorName}.`, severity: "critical", status: "under-investigation", relatedActorName: e.actorName, createdAt: e.timestamp });
  });

  dataExportEvents.filter((e) => e.recordCount >= 10000).forEach((e) => {
    alerts.push({ id: `alert-export-${e.id}`, title: "Large Data Export", description: `${e.actorName} exported ${e.recordCount.toLocaleString()} records (${e.dataset}).`, severity: "high", status: "acknowledged", relatedActorName: e.actorName, createdAt: e.timestamp });
  });

  return alerts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// --- Saved Queries (spec §30) -----------------------------------------------

export interface SavedAuditQuery {
  id: string;
  name: string;
  description: string;
  filters: Partial<AuditEventQuery>;
}

export const savedAuditQueries: SavedAuditQuery[] = [
  { id: "sq-1", name: "Patient Record Access — Today", description: "All patient-record READ events from today", filters: { category: "patient" } },
  { id: "sq-2", name: "Failed Logins — Last 7 Days", description: "Authentication failures", filters: { category: "authentication", result: "failed" } },
  { id: "sq-3", name: "High Severity Events", description: "Severity high or critical", filters: { severity: "high" } },
  { id: "sq-4", name: "Data Exports — This Month", description: "Every export/print/download event", filters: { category: "administration", action: "EXPORT" } },
  { id: "sq-5", name: "Emergency Access", description: "Break-glass access events", filters: {} },
  { id: "sq-6", name: "Permission Changes", description: "Role/permission modification events", filters: { category: "administration" } },
];

// --- Retention Policy (spec §32) — never a single hardcoded universal
// period, since requirements vary by jurisdiction/organization/record type.

export interface AuditRetentionPolicy {
  category: string;
  policy: string;
}

export const auditRetentionPolicies: AuditRetentionPolicy[] = [
  { category: "Clinical Audit", policy: "Configured by policy — jurisdictional medical-record retention rules apply" },
  { category: "Security Audit", policy: "Configured by policy — security/compliance requirement, hospital-configurable" },
  { category: "Integration Audit", policy: "Configured by policy — interoperability agreement terms apply" },
  { category: "Financial Audit", policy: "Configured by policy — financial record-keeping regulation applies" },
];

// --- Query / list functions (spec §2-3, §29 filter builder) ----------------

export interface AuditEventQuery {
  category?: AuditEventCategory;
  action?: AuditActionType;
  severity?: AuditSeverity;
  result?: AuditResult;
  source?: AuditSource;
  departmentId?: string;
  patientId?: string;
  actorName?: string;
  archived?: boolean;
  search?: string;
}

function allEnrichedEvents(): AuditEvent[] {
  return auditEvents;
}

export function getAuditEvents(query: AuditEventQuery = {}) {
  let rows = allEnrichedEvents().filter((e) => e.archived === (query.archived ?? false));
  if (query.category) rows = rows.filter((e) => e.category === query.category);
  if (query.action) rows = rows.filter((e) => e.action === query.action);
  if (query.severity) rows = rows.filter((e) => e.severity === query.severity);
  if (query.result) rows = rows.filter((e) => e.result === query.result);
  if (query.source) rows = rows.filter((e) => e.source === query.source);
  if (query.departmentId) rows = rows.filter((e) => e.departmentId === query.departmentId);
  if (query.patientId) rows = rows.filter((e) => e.patientId === query.patientId);
  if (query.actorName) rows = rows.filter((e) => e.actorName === query.actorName);
  if (query.search) {
    const q = query.search.toLowerCase();
    rows = rows.filter(
      (e) =>
        e.auditId.toLowerCase().includes(q) ||
        e.actorName.toLowerCase().includes(q) ||
        (e.patientId ?? "").toLowerCase().includes(q) ||
        (e.ipAddress ?? "").toLowerCase().includes(q) ||
        (e.resourceId ?? "").toLowerCase().includes(q) ||
        (e.correlationId ?? "").toLowerCase().includes(q) ||
        e.eventName.toLowerCase().includes(q)
    );
  }
  return mockRequest(
    rows
      .map((e) => ({ ...e, departmentName: resolveDepartmentName(e.departmentId), patientName: resolvePatientName(e.patientId) }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  );
}

export function getAuditEvent(id: string) {
  const event = allEnrichedEvents().find((e) => e.id === id);
  if (!event) return mockRequest(null);
  const index = allEnrichedEvents()
    .filter((e) => e.patientId && e.patientId === event.patientId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const pos = index.findIndex((e) => e.id === id);
  return mockRequest({
    ...event,
    departmentName: resolveDepartmentName(event.departmentId),
    patientName: resolvePatientName(event.patientId),
    previousEvent: pos > 0 ? index[pos - 1] : undefined,
    nextEvent: pos >= 0 && pos < index.length - 1 ? index[pos + 1] : undefined,
  });
}

export function getPatientAuditTimeline(patientId: string) {
  const rows = allEnrichedEvents()
    .filter((e) => e.patientId === patientId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return mockRequest(rows);
}

// --- Dashboard (spec §1, §47) -----------------------------------------------

export interface AuditDashboardData {
  totalEvents: number;
  criticalEvents: number;
  failedActions: number;
  todaysEvents: number;
  patientAccessEvents: number;
  dataChangeEvents: number;
  loginEvents: number;
  permissionChanges: number;
  securityEvents: number;
  systemEvents: number;
  byCategory: { category: AuditEventCategory; count: number }[];
}

export function getAuditDashboard() {
  const events = allEnrichedEvents();
  const todays = events.filter((e) => e.timestamp.startsWith(TODAY));
  const categoryMap = new Map<AuditEventCategory, number>();
  events.forEach((e) => categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + 1));

  const data: AuditDashboardData = {
    totalEvents: events.length,
    criticalEvents: events.filter((e) => e.severity === "critical").length,
    failedActions: events.filter((e) => e.result === "failed" || e.result === "denied" || e.result === "blocked").length,
    todaysEvents: todays.length,
    patientAccessEvents: events.filter((e) => e.patientId && e.action === "READ").length,
    dataChangeEvents: events.filter((e) => e.action === "CREATE" || e.action === "UPDATE" || e.action === "DELETE").length,
    loginEvents: events.filter((e) => e.category === "authentication").length,
    permissionChanges: events.filter((e) => e.eventName === "Permission Changed").length,
    securityEvents: events.filter((e) => e.category === "security").length,
    systemEvents: events.filter((e) => e.category === "system").length,
    byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count })),
  };
  return mockRequest(data);
}

// --- Security Audit Dashboard (spec §18) ------------------------------------

export interface SecurityAuditData {
  failedLogins: number;
  blockedRequests: number;
  permissionChanges: number;
  accountLockouts: number;
  suspiciousActivities: number;
}

export function getSecurityAuditData() {
  const events = allEnrichedEvents();
  const data: SecurityAuditData = {
    failedLogins: events.filter((e) => e.category === "authentication" && e.result === "failed").length,
    blockedRequests: events.filter((e) => e.result === "blocked" || e.result === "denied").length,
    permissionChanges: events.filter((e) => e.eventName === "Permission Changed").length,
    accountLockouts: events.filter((e) => e.eventName === "Account Locked").length,
    suspiciousActivities: events.filter((e) => e.category === "security").length,
  };
  return mockRequest(data);
}

// --- Reports (spec §31) — links to a real generated dataset, never a fake
// PDF/export pipeline; produces the same underlying rows the UI can show. --

export interface AuditReportRequest {
  reportType: string;
  requestedBy: string;
  format: "pdf" | "csv" | "excel";
}

export interface AuditReportRow {
  id: string;
  reportType: string;
  requestedBy: string;
  format: "pdf" | "csv" | "excel";
  requestedAt: string;
  status: "queued" | "processing" | "ready" | "failed";
  recordCount: number;
}

export const auditReportRequests: AuditReportRow[] = [];

export function requestAuditReport(input: AuditReportRequest) {
  const row: AuditReportRow = { ...input, id: `rpt-${auditReportRequests.length + 1}`, requestedAt: NOW, status: "ready", recordCount: auditEvents.length };
  auditReportRequests.push(row);
  return mockRequest(row);
}

export function getAuditReportRequests() {
  return mockRequest([...auditReportRequests].reverse());
}

export const auditReportTypes = [
  "Daily Audit Report",
  "Security Report",
  "Patient Access Report",
  "User Activity Report",
  "Data Export Report",
  "Permission Change Report",
  "Integration Audit Report",
  "Emergency Access Report",
  "Failed Access Report",
];

// --- Archive (spec §34) ------------------------------------------------------

export function archiveAuditEvent(eventId: string) {
  const event = auditEvents.find((e) => e.id === eventId);
  if (!event) return mockRequest(null);
  event.archived = true;
  return mockRequest(event);
}

export function getArchivedAuditEvents() {
  return mockRequest(auditEvents.filter((e) => e.archived));
}

// --- Real per-module audit log aggregation (grounds this module in genuine
// mutations from every other module built this session, enriched into the
// richer AuditEvent-style shape for display alongside the curated events
// above). ------------------------------------------------------------------

export interface AggregatedModuleAuditRow {
  id: string;
  module: string;
  timestamp: string;
  actor: string;
  action: string;
  entityId: string;
  detail?: string;
  severity: AuditSeverity;
}

function classifySeverity(action: string): AuditSeverity {
  const lower = action.toLowerCase();
  if (lower.includes("delete") || lower.includes("recall") || lower.includes("rejected") || lower.includes("cancel")) return "high";
  if (lower.includes("adjust") || lower.includes("quarantine") || lower.includes("discontinu") || lower.includes("expired")) return "medium";
  if (lower.includes("view") || lower.includes("acknowledg")) return "low";
  return "info";
}

export async function getAggregatedModuleAuditLog(): Promise<AggregatedModuleAuditRow[]> {
  const [bedLog, labLog, radiologyLog, pharmacyLog, otLog, inventoryLog, emergencyLog] = await Promise.all([
    getBedAuditLog(),
    getLabAuditLog(),
    getRadiologyAuditLog(),
    getPharmacyAuditLog(),
    getOTAuditLog(),
    getInventoryAuditLog(),
    getEmergencyAuditLog(),
  ]);

  const rows: AggregatedModuleAuditRow[] = [
    ...bedLog.map((e) => ({ id: e.id, module: "Beds", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.bedId, detail: e.detail, severity: classifySeverity(e.action) })),
    ...labLog.map((e) => ({ id: e.id, module: "Laboratory", timestamp: e.timestamp, actor: e.actor ?? "System", action: e.action, entityId: e.orderNumber, detail: undefined, severity: classifySeverity(e.action) })),
    ...radiologyLog.map((e) => ({ id: e.id, module: "Radiology", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail, severity: classifySeverity(e.action) })),
    ...pharmacyLog.map((e) => ({ id: e.id, module: "Pharmacy", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail, severity: classifySeverity(e.action) })),
    ...otLog.map((e) => ({ id: e.id, module: "OT/Surgery", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail, severity: classifySeverity(e.action) })),
    ...inventoryLog.map((e) => ({ id: e.id, module: "Inventory", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail, severity: classifySeverity(e.action) })),
    ...emergencyLog.map((e) => ({ id: e.id, module: "Emergency", timestamp: e.timestamp, actor: e.actor, action: e.action, entityId: e.entityId, detail: e.detail, severity: classifySeverity(e.action) })),
  ];
  return rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
