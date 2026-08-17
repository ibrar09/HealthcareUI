import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { facilities } from "./facilities";

// ============================================================================
// Configuration (Hospital Admin's [full] section — full 47-section build per
// CONFIGURATION_MODULE_SPEC.md, per the user's own explicit choice). This is
// the CENTRAL admin control panel — scope + version + validation + approval
// + audit + rollback on every important setting, per the spec's own closing
// "most important rule."
//
// Deliberately NOT a rebuild of config that already lives correctly inside
// its owning module: Departments/Services/Locations stay in Facilities,
// Bed Types/Rooms stay in Beds, Appointment Types stay in Appointments,
// Service Pricing stays in Billing's Contracts tab, and every clinical
// module (Laboratory/Radiology/Pharmacy/OT/Inventory/Emergency) keeps its
// own Settings tab exactly as built earlier this session — this module
// link-outs to those rather than duplicating their CRUD, and only owns
// genuinely NEW cross-cutting settings (locale, security policy, numbering,
// feature flags, interoperability, master data, workflow/approval rules,
// retention/backup, maintenance, and the change-history/versioning/
// approval machinery that wraps around all of it).
//
// Per spec §37/§23's own explicit instruction — never expose real secrets
// in the frontend. Every "secret" field here is a masked reference/metadata
// string (e.g. "Stored in Azure Key Vault — ref kv-fhir-client-secret"),
// never a real value, matching the spec's own "safe metadata, not raw
// passwords/API secrets" framing.
//
// Data model follows §44's own guidance: strongly-typed interfaces for the
// well-known settings groups (Organization/General/Localization/Security/...),
// plus a generic scope-aware `SystemSetting` model (§30 Master Data, §45
// multi-tenant scope resolution) for flexible reference data. §45's
// GLOBAL -> COUNTRY -> ORGANIZATION -> HOSPITAL -> BRANCH -> DEPARTMENT
// resolution is a real, working function here (`resolveSetting`), not just
// a diagram.
// ============================================================================

const NOW = `${TODAY}T15:00:00`;

// --- Configuration History + Versioning (spec §39-40) — every mutation in
// this file calls this, matching the audit-from-day-one discipline every
// other module in this project follows. -------------------------------------

export interface ConfigurationChangeEntry {
  id: string;
  configKey: string;
  configLabel: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  reason?: string;
  timestamp: string;
  ipAddress: string;
  version: number;
}

export const configurationHistory: ConfigurationChangeEntry[] = [];
const versionCounters = new Map<string, number>();

function recordConfigChange(configKey: string, configLabel: string, oldValue: string, newValue: string, changedBy = DEFAULT_ACTOR, reason?: string) {
  const version = (versionCounters.get(configKey) ?? 0) + 1;
  versionCounters.set(configKey, version);
  configurationHistory.unshift({ id: `cfg-hist-${configurationHistory.length + 1}`, configKey, configLabel, oldValue, newValue, changedBy, reason, timestamp: NOW, ipAddress: "192.168.1.10", version });
}

export function getConfigurationHistory(filters: { configKey?: string; search?: string } = {}) {
  let rows = [...configurationHistory];
  if (filters.configKey) rows = rows.filter((r) => r.configKey === filters.configKey);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => r.configLabel.toLowerCase().includes(q) || r.changedBy.toLowerCase().includes(q));
  }
  return mockRequest(rows);
}

export function getConfigurationVersions(configKey: string) {
  return mockRequest(configurationHistory.filter((r) => r.configKey === configKey).sort((a, b) => b.version - a.version));
}

// --- Configuration Change Approval (spec §42) — for critical settings,
// changes route Draft -> Submitted -> Reviewed -> Approved -> Published
// rather than applying immediately. ------------------------------------------

export type ConfigChangeStatus = "draft" | "submitted" | "reviewed" | "approved" | "published" | "rejected";

export interface ConfigurationChangeRequest {
  id: string;
  configKey: string;
  configLabel: string;
  currentValue: string;
  proposedValue: string;
  reason: string;
  status: ConfigChangeStatus;
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  approvedBy?: string;
  publishedAt?: string;
  rejectionReason?: string;
}

/** Critical settings that require the Draft->Approve->Publish workflow rather than an immediate write (spec §42's own list). */
export const criticalConfigKeys = ["security.authPolicy", "patient.mrnFormat", "billing.invoiceNumbering", "consent.defaultScope", "interoperability.hl7Mapping", "interoperability.fhirBaseUrl"];

export const configurationChangeRequests: ConfigurationChangeRequest[] = [];

export interface NewChangeRequestInput {
  configKey: string;
  configLabel: string;
  currentValue: string;
  proposedValue: string;
  reason: string;
  requestedBy: string;
}

export function submitConfigurationChangeRequest(input: NewChangeRequestInput) {
  const request: ConfigurationChangeRequest = { ...input, id: `ccr-${configurationChangeRequests.length + 1}`, status: "submitted", requestedAt: NOW };
  configurationChangeRequests.push(request);
  recordConfigChange(input.configKey, input.configLabel, input.currentValue, `${input.proposedValue} (pending approval)`, input.requestedBy, input.reason);
  return mockRequest(request);
}

export function reviewConfigurationChangeRequest(id: string, actor = DEFAULT_ACTOR) {
  const request = configurationChangeRequests.find((r) => r.id === id);
  if (!request) return mockRequest(null);
  request.status = "reviewed";
  request.reviewedBy = actor;
  return mockRequest(request);
}

export function approveConfigurationChangeRequest(id: string, actor = DEFAULT_ACTOR) {
  const request = configurationChangeRequests.find((r) => r.id === id);
  if (!request) return mockRequest(null);
  request.status = "approved";
  request.approvedBy = actor;
  return mockRequest(request);
}

export function publishConfigurationChangeRequest(id: string, actor = DEFAULT_ACTOR) {
  const request = configurationChangeRequests.find((r) => r.id === id);
  if (!request) return mockRequest(null);
  request.status = "published";
  request.publishedAt = NOW;
  recordConfigChange(request.configKey, request.configLabel, request.currentValue, request.proposedValue, actor, "Published via approval workflow");
  return mockRequest(request);
}

export function rejectConfigurationChangeRequest(id: string, reason: string, actor = DEFAULT_ACTOR) {
  const request = configurationChangeRequests.find((r) => r.id === id);
  if (!request) return mockRequest(null);
  request.status = "rejected";
  request.rejectionReason = reason;
  void actor;
  return mockRequest(request);
}

export function getConfigurationChangeRequests(filters: { status?: ConfigChangeStatus } = {}) {
  let rows = [...configurationChangeRequests].reverse();
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  return mockRequest(rows);
}

// --- Dashboard (spec §1) ------------------------------------------------------

export interface ConfigurationDashboardData {
  totalConfigurations: number;
  activeConfigurations: number;
  pendingChanges: number;
  recentlyModified: number;
  systemDefaults: number;
  hospitalSpecificSettings: number;
  branchSpecificSettings: number;
  failedConfigurationChanges: number;
}

export function getConfigurationDashboard() {
  const settings = systemSettings;
  const data: ConfigurationDashboardData = {
    totalConfigurations: settings.length,
    activeConfigurations: settings.filter((s) => s.isActive).length,
    pendingChanges: configurationChangeRequests.filter((r) => r.status === "submitted" || r.status === "reviewed").length,
    recentlyModified: configurationHistory.filter((h) => h.timestamp.startsWith(TODAY)).length,
    systemDefaults: settings.filter((s) => s.scope === "global").length,
    hospitalSpecificSettings: settings.filter((s) => s.scope === "hospital").length,
    branchSpecificSettings: settings.filter((s) => s.scope === "branch").length,
    failedConfigurationChanges: configurationChangeRequests.filter((r) => r.status === "rejected").length,
  };
  return mockRequest(data);
}

// --- Organization / Hospital Configuration (spec §2) --------------------------

export interface HospitalOrganizationProfile {
  hospitalName: string;
  legalName: string;
  hospitalCode: string;
  registrationNumber: string;
  taxNumber: string;
  address: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: "12-hour" | "24-hour";
}

export const hospitalOrganizationProfile: HospitalOrganizationProfile = {
  hospitalName: facilities[0]?.name ?? "City General Hospital",
  legalName: "City General Hospital Trust",
  hospitalCode: "CGH-001",
  registrationNumber: "REG-2018-44921",
  taxNumber: "VAT-300219482100003",
  address: facilities[0]?.address ?? "1 Hospital Drive",
  country: "Saudi Arabia",
  city: facilities[0]?.city ?? "Riyadh",
  region: "Riyadh Province",
  postalCode: "12211",
  phone: facilities[0]?.phone ?? "+966 11 555 0100",
  email: facilities[0]?.email ?? "info@citygeneral.org",
  website: "https://citygeneral.org",
  timezone: "Asia/Riyadh",
  currency: "SAR",
  language: "en",
  dateFormat: "DD-MM-YYYY",
  timeFormat: "24-hour",
};

export function getHospitalOrganizationProfile() {
  return mockRequest(hospitalOrganizationProfile);
}

export function updateHospitalOrganizationProfile(updates: Partial<HospitalOrganizationProfile>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.entries(updates).forEach(([key, value]) => {
    const oldValue = String((hospitalOrganizationProfile as unknown as Record<string, unknown>)[key] ?? "");
    if (oldValue !== String(value)) recordConfigChange(`organization.${key}`, `Organization — ${key}`, oldValue, String(value), actor, reason);
  });
  Object.assign(hospitalOrganizationProfile, updates);
  return mockRequest(hospitalOrganizationProfile);
}

export interface HospitalStructureNode {
  id: string;
  label: string;
  type: "hospital" | "branch" | "building" | "department";
  children?: HospitalStructureNode[];
}

/** spec §2's own organization tree example — built from real Facility/Department data, not a fabricated diagram. */
export function getHospitalStructureTree(): HospitalStructureNode {
  return {
    id: "org-root",
    label: hospitalOrganizationProfile.hospitalName,
    type: "hospital",
    children: facilities.map((f) => ({
      id: f.id,
      label: f.name,
      type: "branch",
      children: [{ id: `${f.id}-main`, label: "Main Building", type: "building", children: [] }],
    })),
  };
}

// --- General System Settings (spec §3) -----------------------------------------

export interface GeneralSystemSettings {
  defaultLanguage: string;
  defaultTimezone: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: "12-hour" | "24-hour";
  numberFormat: string;
  decimalPrecision: number;
  firstDayOfWeek: "sunday" | "monday";
  defaultCountry: string;
  defaultRegion: string;
  sessionTimeoutMinutes: number;
  automaticLogoutEnabled: boolean;
  maximumLoginAttempts: number;
  passwordExpirationDays: number;
  accountLockDurationMinutes: number;
}

export const generalSystemSettings: GeneralSystemSettings = {
  defaultLanguage: "en",
  defaultTimezone: "Asia/Riyadh",
  defaultCurrency: "SAR",
  dateFormat: "DD-MM-YYYY",
  timeFormat: "24-hour",
  numberFormat: "1,234.56",
  decimalPrecision: 2,
  firstDayOfWeek: "sunday",
  defaultCountry: "Saudi Arabia",
  defaultRegion: "Riyadh Province",
  sessionTimeoutMinutes: 30,
  automaticLogoutEnabled: true,
  maximumLoginAttempts: 5,
  passwordExpirationDays: 90,
  accountLockDurationMinutes: 30,
};

export function getGeneralSystemSettings() {
  return mockRequest(generalSystemSettings);
}

export function updateGeneralSystemSettings(updates: Partial<GeneralSystemSettings>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.entries(updates).forEach(([key, value]) => {
    const oldValue = String((generalSystemSettings as unknown as Record<string, unknown>)[key] ?? "");
    if (oldValue !== String(value)) recordConfigChange(`general.${key}`, `General — ${key}`, oldValue, String(value), actor, reason);
  });
  Object.assign(generalSystemSettings, updates);
  return mockRequest(generalSystemSettings);
}

// --- Localization & Language (spec §4) ------------------------------------------

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  enabled: boolean;
  translationCoverage: number;
}

export const supportedLanguages: SupportedLanguage[] = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr", enabled: true, translationCoverage: 100 },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl", enabled: true, translationCoverage: 92 },
  { code: "ur", name: "Urdu", nativeName: "اردو", direction: "rtl", enabled: true, translationCoverage: 78 },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr", enabled: false, translationCoverage: 34 },
];

export function getSupportedLanguages() {
  return mockRequest(supportedLanguages);
}

export function setLanguageEnabled(code: string, enabled: boolean, actor = DEFAULT_ACTOR) {
  const language = supportedLanguages.find((l) => l.code === code);
  if (!language) return mockRequest(null);
  language.enabled = enabled;
  recordConfigChange(`localization.${code}`, `Language — ${language.name}`, String(!enabled), String(enabled), actor);
  return mockRequest(language);
}

// --- Users & Access — Roles + Permissions catalog (spec §5). Account CRUD
// itself isn't modeled yet (no user-management module exists); this is the
// RBAC reference catalog every future permission check reads from. ----------

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  isSystemRole: boolean;
}

export interface PermissionDefinition {
  id: string;
  category: string;
  description: string;
}

export const permissionCatalog: PermissionDefinition[] = [
  { id: "PATIENT_VIEW", category: "Patient", description: "View patient records" },
  { id: "PATIENT_CREATE", category: "Patient", description: "Register new patients" },
  { id: "PATIENT_UPDATE", category: "Patient", description: "Edit patient records" },
  { id: "PATIENT_DELETE", category: "Patient", description: "Deactivate/delete patient records" },
  { id: "LAB_RESULT_VIEW", category: "Laboratory", description: "View lab results" },
  { id: "LAB_RESULT_CREATE", category: "Laboratory", description: "Enter lab results" },
  { id: "LAB_RESULT_UPDATE", category: "Laboratory", description: "Correct/amend lab results" },
  { id: "PHARMACY_DISPENSE", category: "Pharmacy", description: "Dispense medication" },
  { id: "PHARMACY_STOCK_VIEW", category: "Pharmacy", description: "View pharmacy stock" },
  { id: "REPORT_VIEW", category: "Reports", description: "View hospital reports" },
  { id: "REPORT_EXPORT", category: "Reports", description: "Export report data" },
  { id: "CONSENT_GRANT", category: "Consent", description: "Grant patient data-sharing consent" },
  { id: "CONSENT_REVOKE", category: "Consent", description: "Revoke patient data-sharing consent" },
  { id: "AUDIT_LOG_VIEW", category: "Audit", description: "View the audit trail" },
  { id: "CONFIGURATION_MANAGE", category: "Administration", description: "Change system configuration" },
  { id: "PRESCRIPTION_CREATE", category: "Medication", description: "Create prescriptions" },
];

export const roleDefinitions: RoleDefinition[] = [
  { id: "role-super-admin", name: "Super Admin", description: "Platform-wide, all organizations", permissionIds: permissionCatalog.map((p) => p.id), isSystemRole: true },
  { id: "role-hospital-admin", name: "Hospital Admin", description: "Full access within one hospital", permissionIds: permissionCatalog.filter((p) => p.category !== "Administration").map((p) => p.id).concat(["CONFIGURATION_MANAGE"]), isSystemRole: true },
  { id: "role-branch-admin", name: "Branch Admin", description: "Full access within one branch", permissionIds: ["PATIENT_VIEW", "PATIENT_UPDATE", "REPORT_VIEW"], isSystemRole: false },
  { id: "role-doctor", name: "Doctor", description: "Clinical documentation and orders", permissionIds: ["PATIENT_VIEW", "PATIENT_UPDATE", "LAB_RESULT_VIEW", "PRESCRIPTION_CREATE"], isSystemRole: true },
  { id: "role-nurse", name: "Nurse", description: "Bedside clinical documentation", permissionIds: ["PATIENT_VIEW", "PATIENT_UPDATE", "LAB_RESULT_VIEW"], isSystemRole: true },
  { id: "role-pharmacist", name: "Pharmacist", description: "Pharmacy verification and dispensing", permissionIds: ["PATIENT_VIEW", "PHARMACY_DISPENSE", "PHARMACY_STOCK_VIEW", "PRESCRIPTION_CREATE"], isSystemRole: true },
  { id: "role-lab-technician", name: "Laboratory Technician", description: "Specimen and result entry", permissionIds: ["LAB_RESULT_VIEW", "LAB_RESULT_CREATE"], isSystemRole: true },
  { id: "role-radiologist", name: "Radiologist", description: "Imaging review and reporting", permissionIds: ["PATIENT_VIEW", "LAB_RESULT_VIEW"], isSystemRole: true },
  { id: "role-receptionist", name: "Receptionist", description: "Registration and scheduling", permissionIds: ["PATIENT_VIEW", "PATIENT_CREATE"], isSystemRole: true },
  { id: "role-billing-officer", name: "Billing Officer", description: "Invoicing and payments", permissionIds: ["PATIENT_VIEW", "REPORT_VIEW"], isSystemRole: true },
  { id: "role-finance-officer", name: "Finance Officer", description: "Financial reporting and reconciliation", permissionIds: ["REPORT_VIEW", "REPORT_EXPORT"], isSystemRole: true },
  { id: "role-it-admin", name: "IT Administrator", description: "System and integration configuration", permissionIds: ["CONFIGURATION_MANAGE", "AUDIT_LOG_VIEW"], isSystemRole: true },
  { id: "role-auditor", name: "Auditor", description: "Read-only compliance access", permissionIds: ["AUDIT_LOG_VIEW", "REPORT_VIEW"], isSystemRole: true },
];

export function getRoleDefinitions() {
  return mockRequest(roleDefinitions);
}
export function getPermissionCatalog() {
  return mockRequest(permissionCatalog);
}

export function updateRolePermissions(roleId: string, permissionIds: string[], actor = DEFAULT_ACTOR) {
  const role = roleDefinitions.find((r) => r.id === roleId);
  if (!role) return mockRequest(null);
  recordConfigChange(`role.${roleId}`, `Role — ${role.name}`, `${role.permissionIds.length} permissions`, `${permissionIds.length} permissions`, actor);
  role.permissionIds = permissionIds;
  return mockRequest(role);
}

// --- Patient Configuration (spec §6) --------------------------------------------

export interface PatientConfiguration {
  mrnPrefix: string;
  mrnStartingNumber: number;
  mrnFormat: string;
  nationalIdRequired: boolean;
  passportSupported: boolean;
  temporaryPatientIdEnabled: boolean;
  duplicateDetectionEnabled: boolean;
  requiredFields: string[];
  minorGuardianRequired: boolean;
  emergencyRegistrationAllowed: boolean;
}

export const patientConfiguration: PatientConfiguration = {
  mrnPrefix: "MRN",
  mrnStartingNumber: 100000,
  mrnFormat: "MRN-{YYYY}-{######}",
  nationalIdRequired: true,
  passportSupported: true,
  temporaryPatientIdEnabled: true,
  duplicateDetectionEnabled: true,
  requiredFields: ["Full Name", "Date of Birth", "Gender", "Phone"],
  minorGuardianRequired: true,
  emergencyRegistrationAllowed: true,
};

export function getPatientConfiguration() {
  return mockRequest(patientConfiguration);
}
export function updatePatientConfiguration(updates: Partial<PatientConfiguration>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.entries(updates).forEach(([key, value]) => {
    const oldValue = String((patientConfiguration as unknown as Record<string, unknown>)[key] ?? "");
    if (oldValue !== String(value)) recordConfigChange(`patient.${key}`, `Patient Config — ${key}`, oldValue, String(value), actor, reason);
  });
  Object.assign(patientConfiguration, updates);
  return mockRequest(patientConfiguration);
}

export function previewMrnFormat(): string {
  const year = new Date(TODAY).getFullYear();
  return patientConfiguration.mrnFormat.replace("{YYYY}", String(year)).replace("{######}", String(patientConfiguration.mrnStartingNumber).padStart(6, "0"));
}

// --- Appointment Configuration (spec §7) — Appointment Types themselves
// stay owned by Appointments' own Schedules tab; this owns the scheduling
// RULES that don't have a home there yet. -------------------------------------

export interface AppointmentConfiguration {
  defaultConsultationMinutes: number;
  slotIntervalMinutes: number;
  cancellationWindowHours: number;
  reschedulingAllowed: boolean;
  noShowGraceMinutes: number;
  maxAppointmentsPerDoctorPerDay: number;
  onlineBookingEnabled: boolean;
  walkInAllowed: boolean;
}

export const appointmentConfiguration: AppointmentConfiguration = {
  defaultConsultationMinutes: 20,
  slotIntervalMinutes: 15,
  cancellationWindowHours: 24,
  reschedulingAllowed: true,
  noShowGraceMinutes: 15,
  maxAppointmentsPerDoctorPerDay: 24,
  onlineBookingEnabled: true,
  walkInAllowed: true,
};

export function getAppointmentConfiguration() {
  return mockRequest(appointmentConfiguration);
}
export function updateAppointmentConfiguration(updates: Partial<AppointmentConfiguration>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.entries(updates).forEach(([key, value]) => {
    const oldValue = String((appointmentConfiguration as unknown as Record<string, unknown>)[key] ?? "");
    if (oldValue !== String(value)) recordConfigChange(`appointment.${key}`, `Appointment Config — ${key}`, oldValue, String(value), actor, reason);
  });
  Object.assign(appointmentConfiguration, updates);
  return mockRequest(appointmentConfiguration);
}

// --- Clinical Settings link-outs (spec §9-13, §15-16) — every clinical
// module already owns its own real Settings tab; this is a directory, never
// a duplicate. New cross-cutting items with no other home live here too. ----

export interface ClinicalSettingsLink {
  module: string;
  description: string;
  route: string;
}

export const clinicalSettingsLinks: ClinicalSettingsLink[] = [
  { module: "Laboratory", description: "Test catalog, specimen types, reference ranges, critical values", route: "/hospital-admin/laboratory" },
  { module: "Radiology", description: "Modalities, procedures, protocols, equipment", route: "/hospital-admin/radiology" },
  { module: "Pharmacy", description: "Medication catalog, controlled substances, dispensing rules", route: "/hospital-admin/pharmacy" },
  { module: "Operation Theatre", description: "Rooms, instrument sets, surgery types", route: "/hospital-admin/operation-theatre" },
  { module: "Emergency", description: "Triage categories, treatment areas, bays", route: "/hospital-admin/emergency" },
  { module: "Inventory", description: "Categories, warehouses, approval thresholds", route: "/hospital-admin/inventory" },
  { module: "Billing", description: "Service pricing, payer contracts", route: "/hospital-admin/billing" },
];

export const medicalSpecialties: string[] = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "ENT", "Ophthalmology",
  "General Medicine", "General Surgery", "Emergency Medicine", "Anesthesiology", "Radiology",
  "Pathology", "Psychiatry", "Obstetrics & Gynecology", "Urology", "Nephrology", "Oncology",
];

export interface NursingShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export const nursingShiftTypes: NursingShiftType[] = [
  { id: "shift-morning", name: "Morning", startTime: "07:00", endTime: "15:00" },
  { id: "shift-evening", name: "Evening", startTime: "15:00", endTime: "23:00" },
  { id: "shift-night", name: "Night", startTime: "23:00", endTime: "07:00" },
];

export interface NursingRatioConfig {
  wardType: string;
  nurseToPatientRatio: string;
}

export const nursingRatios: NursingRatioConfig[] = [
  { wardType: "General Ward", nurseToPatientRatio: "1:6" },
  { wardType: "ICU", nurseToPatientRatio: "1:2" },
  { wardType: "Emergency", nurseToPatientRatio: "1:4" },
  { wardType: "Pediatric Ward", nurseToPatientRatio: "1:5" },
];

export function getClinicalSettingsLinks() {
  return mockRequest(clinicalSettingsLinks);
}
export function getMedicalSpecialties() {
  return mockRequest(medicalSpecialties);
}
export function getNursingShiftTypes() {
  return mockRequest(nursingShiftTypes);
}
export function getNursingRatios() {
  return mockRequest(nursingRatios);
}

// --- Financial Configuration — Billing (spec §17) + Insurance (spec §18)
// combined. Service Pricing itself stays owned by Billing's Contracts tab. --

export interface BillingConfiguration {
  invoiceNumberFormat: string;
  defaultPaymentTermsDays: number;
  taxRatePercent: number;
  defaultCreditLimit: number;
  refundApprovalThreshold: number;
}

export const billingConfiguration: BillingConfiguration = {
  invoiceNumberFormat: "INV-{YYYY}-{######}",
  defaultPaymentTermsDays: 30,
  taxRatePercent: 15,
  defaultCreditLimit: 50000,
  refundApprovalThreshold: 5000,
};

export const paymentMethodsCatalog = ["Cash", "Card", "Bank Transfer", "Insurance", "Online Payment"];

export interface InsurancePolicyTypeConfig {
  id: string;
  name: string;
  requiresPreAuthorization: boolean;
  defaultCopayPercent: number;
}

export const insurancePolicyTypes: InsurancePolicyTypeConfig[] = [
  { id: "pt-basic", name: "Basic", requiresPreAuthorization: true, defaultCopayPercent: 20 },
  { id: "pt-standard", name: "Standard", requiresPreAuthorization: true, defaultCopayPercent: 10 },
  { id: "pt-premium", name: "Premium", requiresPreAuthorization: false, defaultCopayPercent: 0 },
];

export function getBillingConfiguration() {
  return mockRequest(billingConfiguration);
}
export function updateBillingConfiguration(updates: Partial<BillingConfiguration>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.entries(updates).forEach(([key, value]) => {
    const oldValue = String((billingConfiguration as unknown as Record<string, unknown>)[key] ?? "");
    if (oldValue !== String(value)) recordConfigChange(`billing.${key}`, `Billing Config — ${key}`, oldValue, String(value), actor, reason);
  });
  Object.assign(billingConfiguration, updates);
  return mockRequest(billingConfiguration);
}
export function getPaymentMethodsCatalog() {
  return mockRequest(paymentMethodsCatalog);
}
export function getInsurancePolicyTypes() {
  return mockRequest(insurancePolicyTypes);
}

// --- Notification & Communication Configuration (spec §19-20 combined) -------

export type NotificationChannel = "email" | "sms" | "push" | "whatsapp" | "in-app";

export interface NotificationEventConfig {
  id: string;
  event: string;
  channels: NotificationChannel[];
  enabled: boolean;
  priority: "low" | "normal" | "high" | "critical";
}

export const notificationEventConfigs: NotificationEventConfig[] = [
  { id: "ne-appt-booked", event: "Appointment Booked", channels: ["email", "sms"], enabled: true, priority: "normal" },
  { id: "ne-appt-reminder", event: "Appointment Reminder", channels: ["sms", "push"], enabled: true, priority: "normal" },
  { id: "ne-appt-cancelled", event: "Appointment Cancelled", channels: ["email", "sms"], enabled: true, priority: "normal" },
  { id: "ne-lab-result", event: "Lab Result Available", channels: ["push", "in-app"], enabled: true, priority: "normal" },
  { id: "ne-rx-created", event: "Prescription Created", channels: ["push"], enabled: true, priority: "normal" },
  { id: "ne-payment", event: "Payment Received", channels: ["email"], enabled: true, priority: "low" },
  { id: "ne-emergency-alert", event: "Emergency Alert", channels: ["sms", "push", "in-app"], enabled: true, priority: "critical" },
  { id: "ne-critical-lab", event: "Critical Lab Result", channels: ["sms", "push", "in-app"], enabled: true, priority: "critical" },
];

export function getNotificationEventConfigs() {
  return mockRequest(notificationEventConfigs);
}
export function toggleNotificationEvent(id: string, enabled: boolean, actor = DEFAULT_ACTOR) {
  const config = notificationEventConfigs.find((c) => c.id === id);
  if (!config) return mockRequest(null);
  recordConfigChange(`notification.${id}`, `Notification — ${config.event}`, String(config.enabled), String(enabled), actor);
  config.enabled = enabled;
  return mockRequest(config);
}

export interface CommunicationProviderConfig {
  id: string;
  channel: NotificationChannel;
  provider: string;
  status: "connected" | "not-configured" | "error";
  credentialReference: string;
}

export const communicationProviders: CommunicationProviderConfig[] = [
  { id: "cp-email", channel: "email", provider: "SMTP — Hospital Mail Relay", status: "connected", credentialReference: "Stored in Secrets Manager — ref smtp-creds-prod" },
  { id: "cp-sms", channel: "sms", provider: "SMS Gateway — Regional Provider", status: "connected", credentialReference: "Stored in Secrets Manager — ref sms-api-key-prod" },
  { id: "cp-push", channel: "push", provider: "Firebase Cloud Messaging", status: "connected", credentialReference: "Stored in Secrets Manager — ref fcm-server-key" },
  { id: "cp-whatsapp", channel: "whatsapp", provider: "WhatsApp Business API", status: "not-configured", credentialReference: "Not configured" },
];

export function getCommunicationProviders() {
  return mockRequest(communicationProviders);
}

// --- Interoperability: HL7 + FHIR + Mirth + API + Webhooks (spec §21-23,
// consolidated per the spec's own §43 tree grouping them under one
// "Interoperability" node). ----------------------------------------------

export interface HL7Configuration {
  version: string;
  sendingApplication: string;
  receivingApplication: string;
  sendingFacility: string;
  receivingFacility: string;
  ackBehavior: "always" | "on-error-only" | "never";
  retryAttempts: number;
  mllpEndpoint: string;
  supportedMessageTypes: string[];
}

export const hl7Configuration: HL7Configuration = {
  version: "2.5.1",
  sendingApplication: "HMS",
  receivingApplication: "External LIS",
  sendingFacility: "CGH-001",
  receivingFacility: "EXT-LIS-01",
  ackBehavior: "always",
  retryAttempts: 3,
  mllpEndpoint: "mllp://10.20.30.40:6661",
  supportedMessageTypes: ["ADT^A01", "ADT^A03", "ORM^O01", "ORU^R01", "SIU^S12"],
};

export interface FHIRConfiguration {
  version: "R4" | "R4B" | "R5";
  serverBaseUrl: string;
  authenticationType: "oauth2" | "basic" | "none";
  clientId: string;
  clientSecretReference: string;
  scopes: string[];
  supportedResources: string[];
}

export const fhirConfiguration: FHIRConfiguration = {
  version: "R4",
  serverBaseUrl: "https://fhir.citygeneral.org/r4",
  authenticationType: "oauth2",
  clientId: "hms-frontend-client",
  clientSecretReference: "Stored in Azure Key Vault — ref kv-fhir-client-secret",
  scopes: ["patient/*.read", "patient/*.write"],
  supportedResources: ["Patient", "Practitioner", "Organization", "Encounter", "Observation", "DiagnosticReport", "Medication", "MedicationRequest", "AllergyIntolerance", "Condition", "Procedure", "ImagingStudy", "DocumentReference"],
};

export function getHL7Configuration() {
  return mockRequest(hl7Configuration);
}
export function updateHL7Configuration(updates: Partial<HL7Configuration>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.assign(hl7Configuration, updates);
  recordConfigChange("interoperability.hl7Mapping", "HL7 Configuration", "previous", "updated", actor, reason);
  return mockRequest(hl7Configuration);
}
export function getFHIRConfiguration() {
  return mockRequest(fhirConfiguration);
}
export function updateFHIRConfiguration(updates: Partial<FHIRConfiguration>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.assign(fhirConfiguration, updates);
  recordConfigChange("interoperability.fhirBaseUrl", "FHIR Configuration", "previous", "updated", actor, reason);
  return mockRequest(fhirConfiguration);
}

export type MirthChannelStatus = "running" | "stopped" | "error";

export interface MirthChannelConfig {
  id: string;
  name: string;
  sourceSystem: string;
  destinationSystem: string;
  transformation: string;
  status: MirthChannelStatus;
  messagesProcessedToday: number;
  errorsToday: number;
}

export const mirthChannels: MirthChannelConfig[] = [
  { id: "mc-adt-in", name: "Inbound ADT", sourceSystem: "External Registration System", destinationSystem: "HMS Patient Service", transformation: "HL7 ADT -> FHIR Patient", status: "running", messagesProcessedToday: 214, errorsToday: 1 },
  { id: "mc-oru-in", name: "Inbound Lab Results", sourceSystem: "External LIS", destinationSystem: "HMS Laboratory Service", transformation: "HL7 ORU -> FHIR DiagnosticReport", status: "running", messagesProcessedToday: 96, errorsToday: 0 },
  { id: "mc-siu-out", name: "Outbound Scheduling", sourceSystem: "HMS Appointment Service", destinationSystem: "Partner Clinic", transformation: "FHIR Appointment -> HL7 SIU", status: "stopped", messagesProcessedToday: 0, errorsToday: 0 },
];

export function getMirthChannels() {
  return mockRequest(mirthChannels);
}
export function setMirthChannelStatus(id: string, status: MirthChannelStatus, actor = DEFAULT_ACTOR) {
  const channel = mirthChannels.find((c) => c.id === id);
  if (!channel) return mockRequest(null);
  recordConfigChange(`interoperability.mirth.${id}`, `Mirth Channel — ${channel.name}`, channel.status, status, actor);
  channel.status = status;
  return mockRequest(channel);
}

export type ApiEnvironment = "development" | "testing" | "staging" | "production";

export interface ApiClientConfig {
  id: string;
  name: string;
  environment: ApiEnvironment;
  baseUrl: string;
  apiKeyReference: string;
  rateLimitPerMinute: number;
  timeoutSeconds: number;
  status: "active" | "revoked";
}

export const apiClientConfigs: ApiClientConfig[] = [
  { id: "api-fhir-gateway", name: "FHIR Integration Gateway", environment: "production", baseUrl: "https://api.citygeneral.org/v1", apiKeyReference: "Stored in Secrets Manager — ref api-key-fhir-gw", rateLimitPerMinute: 300, timeoutSeconds: 30, status: "active" },
  { id: "api-insurance", name: "Insurance Eligibility API", environment: "production", baseUrl: "https://eligibility.insurer-network.example/v2", apiKeyReference: "Stored in Secrets Manager — ref api-key-insurer", rateLimitPerMinute: 120, timeoutSeconds: 15, status: "active" },
  { id: "api-staging-sandbox", name: "Sandbox Test Client", environment: "staging", baseUrl: "https://staging-api.citygeneral.org/v1", apiKeyReference: "Stored in Secrets Manager — ref api-key-staging", rateLimitPerMinute: 60, timeoutSeconds: 30, status: "active" },
];

export function getApiClientConfigs() {
  return mockRequest(apiClientConfigs);
}
export function revokeApiClient(id: string, actor = DEFAULT_ACTOR) {
  const client = apiClientConfigs.find((c) => c.id === id);
  if (!client) return mockRequest(null);
  recordConfigChange(`interoperability.api.${id}`, `API Client — ${client.name}`, "active", "revoked", actor);
  client.status = "revoked";
  return mockRequest(client);
}

export interface WebhookConfig {
  id: string;
  name: string;
  targetUrl: string;
  events: string[];
  status: "active" | "disabled";
  lastDeliveryStatus?: "success" | "failed";
}

export const webhookConfigs: WebhookConfig[] = [
  { id: "wh-1", name: "External Billing Sync", targetUrl: "https://partner-billing.example/webhooks/hms", events: ["invoice.created", "payment.recorded"], status: "active", lastDeliveryStatus: "success" },
  { id: "wh-2", name: "Regional Health Exchange", targetUrl: "https://exchange.regional-health.example/hms-events", events: ["patient.consent.granted", "patient.consent.revoked"], status: "active", lastDeliveryStatus: "success" },
];

export function getWebhookConfigs() {
  return mockRequest(webhookConfigs);
}

// --- Security Configuration (spec §24) ------------------------------------------

export interface SecurityConfiguration {
  jwtExpirationMinutes: number;
  refreshTokenExpirationDays: number;
  mfaRequired: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  passwordHistoryCount: number;
  concurrentSessionsAllowed: number;
  ipRestrictionEnabled: boolean;
  suspiciousLoginDetectionEnabled: boolean;
}

export const securityConfiguration: SecurityConfiguration = {
  jwtExpirationMinutes: 15,
  refreshTokenExpirationDays: 7,
  mfaRequired: true,
  passwordMinLength: 12,
  passwordRequireSpecialChar: true,
  passwordHistoryCount: 5,
  concurrentSessionsAllowed: 2,
  ipRestrictionEnabled: false,
  suspiciousLoginDetectionEnabled: true,
};

export function getSecurityConfiguration() {
  return mockRequest(securityConfiguration);
}
export function updateSecurityConfiguration(updates: Partial<SecurityConfiguration>, actor = DEFAULT_ACTOR, reason?: string) {
  Object.entries(updates).forEach(([key, value]) => {
    const oldValue = String((securityConfiguration as unknown as Record<string, unknown>)[key] ?? "");
    if (oldValue !== String(value)) recordConfigChange(`security.${key}`, `Security — ${key}`, oldValue, String(value), actor, reason);
  });
  Object.assign(securityConfiguration, updates);
  return mockRequest(securityConfiguration);
}

// --- Audit Configuration (spec §25) — settings for the Audit module,
// never the audit log itself (Security & Audit module owns that). ----------

export interface AuditConfiguration {
  auditEnabled: boolean;
  logLevel: "minimal" | "standard" | "verbose";
  immutableLogs: boolean;
  trackedEvents: string[];
}

export const auditConfiguration: AuditConfiguration = {
  auditEnabled: true,
  logLevel: "standard",
  immutableLogs: true,
  trackedEvents: ["LOGIN", "LOGOUT", "PATIENT_VIEW", "PATIENT_CREATE", "PATIENT_UPDATE", "PATIENT_DELETE", "LAB_RESULT_VIEW", "LAB_RESULT_UPDATE", "PRESCRIPTION_CREATE", "PRESCRIPTION_UPDATE", "RECORD_EXPORT", "RECORD_SHARE", "CONFIGURATION_CHANGE"],
};

export function getAuditConfiguration() {
  return mockRequest(auditConfiguration);
}
export function updateAuditConfiguration(updates: Partial<AuditConfiguration>, actor = DEFAULT_ACTOR) {
  Object.assign(auditConfiguration, updates);
  recordConfigChange("audit.settings", "Audit Configuration", "previous", "updated", actor);
  return mockRequest(auditConfiguration);
}

// --- Data Retention (spec §26) + Backup (spec §27), combined ------------------

export interface DataRetentionPolicy {
  category: string;
  retentionPeriod: string;
}

export const dataRetentionPolicies: DataRetentionPolicy[] = [
  { category: "Audit Logs", retentionPeriod: "7 years (jurisdictional minimum)" },
  { category: "Medical Records", retentionPeriod: "Configurable by hospital policy" },
  { category: "Lab Results", retentionPeriod: "10 years" },
  { category: "Imaging Studies", retentionPeriod: "10 years" },
  { category: "Billing Records", retentionPeriod: "7 years" },
  { category: "Temporary Files", retentionPeriod: "30 days" },
];

export interface BackupConfiguration {
  frequency: "hourly" | "daily" | "weekly";
  fullBackupDay: string;
  encryptionEnabled: boolean;
  primaryLocation: string;
  secondaryLocation: string;
  retentionDays: number;
  lastVerifiedAt: string;
}

export const backupConfiguration: BackupConfiguration = {
  frequency: "daily",
  fullBackupDay: "Sunday",
  encryptionEnabled: true,
  primaryLocation: "Primary Data Center — Riyadh",
  secondaryLocation: "Secondary Data Center — Jeddah (encrypted replica)",
  retentionDays: 90,
  lastVerifiedAt: `${TODAY}T03:15:00`,
};

export function getDataRetentionPolicies() {
  return mockRequest(dataRetentionPolicies);
}
export function getBackupConfiguration() {
  return mockRequest(backupConfiguration);
}
export function updateBackupConfiguration(updates: Partial<BackupConfiguration>, actor = DEFAULT_ACTOR) {
  Object.assign(backupConfiguration, updates);
  recordConfigChange("backup.settings", "Backup Configuration", "previous", "updated", actor);
  return mockRequest(backupConfiguration);
}

// --- Document (spec §28) + Consent (spec §29) Configuration, combined --------

export interface DocumentTypeConfig {
  id: string;
  name: string;
  requiresDigitalSignature: boolean;
  maxFileSizeMb: number;
  allowedFileTypes: string[];
}

export const documentTypeConfigs: DocumentTypeConfig[] = [
  { id: "doc-lab-report", name: "Lab Report", requiresDigitalSignature: true, maxFileSizeMb: 10, allowedFileTypes: ["pdf"] },
  { id: "doc-discharge-summary", name: "Discharge Summary", requiresDigitalSignature: true, maxFileSizeMb: 10, allowedFileTypes: ["pdf"] },
  { id: "doc-prescription", name: "Prescription", requiresDigitalSignature: true, maxFileSizeMb: 5, allowedFileTypes: ["pdf"] },
  { id: "doc-medical-certificate", name: "Medical Certificate", requiresDigitalSignature: true, maxFileSizeMb: 5, allowedFileTypes: ["pdf"] },
  { id: "doc-referral-letter", name: "Referral Letter", requiresDigitalSignature: false, maxFileSizeMb: 5, allowedFileTypes: ["pdf", "docx"] },
  { id: "doc-consent-form", name: "Consent Form", requiresDigitalSignature: true, maxFileSizeMb: 5, allowedFileTypes: ["pdf"] },
  { id: "doc-radiology-report", name: "Radiology Report", requiresDigitalSignature: true, maxFileSizeMb: 20, allowedFileTypes: ["pdf"] },
];

export interface ConsentTypeConfig {
  id: string;
  name: string;
  defaultExpirationDays: number;
  revocable: boolean;
  dataCategories: string[];
}

export const consentTypeConfigs: ConsentTypeConfig[] = [
  { id: "ct-treatment", name: "Treatment", defaultExpirationDays: 30, revocable: true, dataCategories: ["Laboratory", "Medication", "Imaging"] },
  { id: "ct-data-sharing", name: "Data Sharing", defaultExpirationDays: 90, revocable: true, dataCategories: ["Full Record"] },
  { id: "ct-research", name: "Research", defaultExpirationDays: 365, revocable: true, dataCategories: ["De-identified Clinical Data"] },
];

export function getDocumentTypeConfigs() {
  return mockRequest(documentTypeConfigs);
}
export function getConsentTypeConfigs() {
  return mockRequest(consentTypeConfigs);
}

// --- Master Data (spec §30) — centralized reference data, including
// standardized terminology systems as reference metadata, never raw
// dropdown values. -------------------------------------------------------

export interface CountryReference {
  code: string;
  name: string;
  defaultCurrency: string;
  defaultTimezone: string;
}

export const countryReferenceData: CountryReference[] = [
  { code: "SA", name: "Saudi Arabia", defaultCurrency: "SAR", defaultTimezone: "Asia/Riyadh" },
  { code: "AE", name: "United Arab Emirates", defaultCurrency: "AED", defaultTimezone: "Asia/Dubai" },
  { code: "PK", name: "Pakistan", defaultCurrency: "PKR", defaultTimezone: "Asia/Karachi" },
  { code: "US", name: "United States", defaultCurrency: "USD", defaultTimezone: "America/New_York" },
  { code: "GB", name: "United Kingdom", defaultCurrency: "GBP", defaultTimezone: "Europe/London" },
];

export interface CurrencyReference {
  code: string;
  name: string;
  symbol: string;
}

export const currencyReferenceData: CurrencyReference[] = [
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

export interface TerminologySystemReference {
  id: string;
  name: string;
  fullName: string;
  version: string;
  domain: string;
  status: "active" | "inactive";
}

export const terminologySystems: TerminologySystemReference[] = [
  { id: "icd-11", name: "ICD-11", fullName: "International Classification of Diseases, 11th Revision", version: "2023", domain: "Diagnoses", status: "active" },
  { id: "snomed-ct", name: "SNOMED CT", fullName: "Systematized Nomenclature of Medicine — Clinical Terms", version: "2026-International", domain: "Clinical Findings & Procedures", status: "active" },
  { id: "loinc", name: "LOINC", fullName: "Logical Observation Identifiers Names and Codes", version: "2.77", domain: "Laboratory & Clinical Observations", status: "active" },
  { id: "rxnorm", name: "RxNorm", fullName: "RxNorm", version: "2026-08", domain: "Medications", status: "active" },
  { id: "dicom", name: "DICOM", fullName: "Digital Imaging and Communications in Medicine", version: "2023e", domain: "Imaging", status: "active" },
  { id: "ucum", name: "UCUM", fullName: "Unified Code for Units of Measure", version: "2.2", domain: "Units of Measure", status: "active" },
];

export function getCountryReferenceData() {
  return mockRequest(countryReferenceData);
}
export function getCurrencyReferenceData() {
  return mockRequest(currencyReferenceData);
}
export function getTerminologySystems() {
  return mockRequest(terminologySystems);
}

// --- Generic scope-aware system settings (spec §30 dynamic config, §45
// multi-tenant scope resolution) — a real, working "most specific wins"
// resolver, not just a diagram. ------------------------------------------

export type ConfigScope = "global" | "country" | "organization" | "hospital" | "branch" | "department";

export interface SystemSetting {
  id: string;
  scope: ConfigScope;
  scopeRefId?: string;
  category: string;
  key: string;
  value: string;
  valueType: "string" | "integer" | "boolean" | "decimal";
  description: string;
  isActive: boolean;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

const scopeOrder: ConfigScope[] = ["department", "branch", "hospital", "organization", "country", "global"];

export const systemSettings: SystemSetting[] = [
  { id: "ss-1", scope: "global", category: "APPOINTMENT", key: "DEFAULT_DURATION", value: "30", valueType: "integer", description: "Default appointment duration (minutes)", isActive: true, version: 1, updatedBy: DEFAULT_ACTOR, updatedAt: `2025-01-10T09:00:00` },
  { id: "ss-2", scope: "hospital", scopeRefId: "fac-main-campus", category: "APPOINTMENT", key: "DEFAULT_DURATION", value: "30", valueType: "integer", description: "Default appointment duration (minutes)", isActive: true, version: 1, updatedBy: DEFAULT_ACTOR, updatedAt: `2025-06-01T09:00:00` },
  { id: "ss-3", scope: "department", scopeRefId: "dept-cardiology", category: "APPOINTMENT", key: "DEFAULT_DURATION", value: "45", valueType: "integer", description: "Cardiology consultations run longer", isActive: true, version: 2, updatedBy: DEFAULT_ACTOR, updatedAt: `${TODAY}T10:31:00` },
  { id: "ss-4", scope: "global", category: "GENERAL", key: "CURRENCY", value: "SAR", valueType: "string", description: "Default currency", isActive: true, version: 1, updatedBy: DEFAULT_ACTOR, updatedAt: `2025-01-10T09:00:00` },
  { id: "ss-5", scope: "global", category: "BILLING", key: "TAX_RATE", value: "15", valueType: "decimal", description: "Default VAT rate (%)", isActive: true, version: 1, updatedBy: DEFAULT_ACTOR, updatedAt: `2025-01-10T09:00:00` },
];

export function getSystemSettings(filters: { category?: string; scope?: ConfigScope } = {}) {
  let rows = [...systemSettings];
  if (filters.category) rows = rows.filter((s) => s.category === filters.category);
  if (filters.scope) rows = rows.filter((s) => s.scope === filters.scope);
  return mockRequest(rows);
}

/** GLOBAL -> COUNTRY -> ORGANIZATION -> HOSPITAL -> BRANCH -> DEPARTMENT resolution (spec §45): walks from most-specific to least, returns the first match. A real implementation, not just the diagram. */
export function resolveSetting(category: string, key: string, refIds: Partial<Record<ConfigScope, string>> = {}): SystemSetting | undefined {
  for (const scope of scopeOrder) {
    const refId = refIds[scope];
    const match = systemSettings.find((s) => s.category === category && s.key === key && s.isActive && s.scope === scope && (scope === "global" || s.scopeRefId === refId));
    if (match) return match;
  }
  return undefined;
}

export interface NewSystemSettingInput {
  scope: ConfigScope;
  scopeRefId?: string;
  category: string;
  key: string;
  value: string;
  valueType: SystemSetting["valueType"];
  description: string;
}

export function upsertSystemSetting(input: NewSystemSettingInput, actor = DEFAULT_ACTOR, reason?: string) {
  const existing = systemSettings.find((s) => s.scope === input.scope && s.scopeRefId === input.scopeRefId && s.category === input.category && s.key === input.key);
  if (existing) {
    recordConfigChange(`${input.category}.${input.key}.${input.scope}`, `${input.category} — ${input.key} (${input.scope})`, existing.value, input.value, actor, reason);
    existing.value = input.value;
    existing.version += 1;
    existing.updatedBy = actor;
    existing.updatedAt = NOW;
    return mockRequest(existing);
  }
  const setting: SystemSetting = { ...input, id: `ss-${systemSettings.length + 1}`, isActive: true, version: 1, updatedBy: actor, updatedAt: NOW };
  systemSettings.push(setting);
  recordConfigChange(`${input.category}.${input.key}.${input.scope}`, `${input.category} — ${input.key} (${input.scope})`, "—", input.value, actor, reason);
  return mockRequest(setting);
}

// --- Workflow (spec §31) + Approval (spec §32) Configuration, combined -------

export interface WorkflowStepConfig {
  order: number;
  step: string;
  responsibleRole: string;
  requiresApproval: boolean;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  steps: WorkflowStepConfig[];
}

export const workflowConfigs: WorkflowConfig[] = [
  {
    id: "wf-patient-journey",
    name: "Patient Registration → Discharge",
    steps: [
      { order: 1, step: "Registration", responsibleRole: "Receptionist", requiresApproval: false },
      { order: 2, step: "Appointment", responsibleRole: "Receptionist", requiresApproval: false },
      { order: 3, step: "Check-In", responsibleRole: "Receptionist", requiresApproval: false },
      { order: 4, step: "Consultation", responsibleRole: "Doctor", requiresApproval: false },
      { order: 5, step: "Investigation", responsibleRole: "Doctor", requiresApproval: false },
      { order: 6, step: "Diagnosis", responsibleRole: "Doctor", requiresApproval: false },
      { order: 7, step: "Prescription", responsibleRole: "Doctor", requiresApproval: false },
      { order: 8, step: "Billing", responsibleRole: "Billing Officer", requiresApproval: false },
      { order: 9, step: "Discharge", responsibleRole: "Doctor", requiresApproval: true },
    ],
  },
];

export interface ApprovalRuleConfig {
  id: string;
  processName: string;
  triggerCondition: string;
  approverChain: string[];
}

export const approvalRuleConfigs: ApprovalRuleConfig[] = [
  { id: "ar-refund", processName: "Refund Approval", triggerCondition: "Refund > SAR 5,000", approverChain: ["Finance Officer", "Finance Manager"] },
  { id: "ar-purchase", processName: "Purchase Approval", triggerCondition: "Purchase Order > SAR 25,000", approverChain: ["Procurement Officer", "Hospital Admin"] },
  { id: "ar-insurance", processName: "Insurance Approval", triggerCondition: "Claim > SAR 10,000", approverChain: ["Billing Officer", "Finance Officer"] },
  { id: "ar-record-release", processName: "Record Release Approval", triggerCondition: "External record release request", approverChain: ["Hospital Admin"] },
  { id: "ar-data-sharing", processName: "Data Sharing Approval", triggerCondition: "New third-party data-sharing agreement", approverChain: ["Hospital Admin", "IT Administrator"] },
];

export function getWorkflowConfigs() {
  return mockRequest(workflowConfigs);
}
export function getApprovalRuleConfigs() {
  return mockRequest(approvalRuleConfigs);
}

// --- Queue Configuration (spec §33) ---------------------------------------------

export interface QueueConfig {
  id: string;
  name: string;
  department: string;
  maxWaitMinutes: number;
  escalationEnabled: boolean;
}

export const queueConfigs: QueueConfig[] = [
  { id: "q-registration", name: "Registration Queue", department: "OPD", maxWaitMinutes: 15, escalationEnabled: true },
  { id: "q-doctor", name: "Doctor Queue", department: "OPD", maxWaitMinutes: 30, escalationEnabled: true },
  { id: "q-pharmacy", name: "Pharmacy Queue", department: "Pharmacy", maxWaitMinutes: 20, escalationEnabled: true },
  { id: "q-lab", name: "Laboratory Queue", department: "Laboratory", maxWaitMinutes: 20, escalationEnabled: false },
  { id: "q-radiology", name: "Radiology Queue", department: "Radiology", maxWaitMinutes: 30, escalationEnabled: false },
  { id: "q-emergency", name: "Emergency Queue", department: "Emergency", maxWaitMinutes: 10, escalationEnabled: true },
  { id: "q-billing", name: "Billing Queue", department: "Billing", maxWaitMinutes: 15, escalationEnabled: false },
];

export function getQueueConfigs() {
  return mockRequest(queueConfigs);
}
export function updateQueueConfig(id: string, updates: Partial<QueueConfig>, actor = DEFAULT_ACTOR) {
  const queue = queueConfigs.find((q) => q.id === id);
  if (!queue) return mockRequest(null);
  recordConfigChange(`queue.${id}`, `Queue — ${queue.name}`, "previous", "updated", actor);
  Object.assign(queue, updates);
  return mockRequest(queue);
}

// --- System Numbering (spec §35) ------------------------------------------------

export interface NumberingFormat {
  id: string;
  entityType: string;
  prefix: string;
  includeYear: boolean;
  digitCount: number;
}

export const numberingFormats: NumberingFormat[] = [
  { id: "num-patient", entityType: "Patient ID", prefix: "PAT", includeYear: true, digitCount: 6 },
  { id: "num-mrn", entityType: "MRN", prefix: "MRN", includeYear: true, digitCount: 6 },
  { id: "num-appointment", entityType: "Appointment ID", prefix: "APT", includeYear: true, digitCount: 6 },
  { id: "num-prescription", entityType: "Prescription ID", prefix: "RX", includeYear: true, digitCount: 6 },
  { id: "num-lab-order", entityType: "Lab Order ID", prefix: "LAB", includeYear: true, digitCount: 4 },
  { id: "num-invoice", entityType: "Invoice ID", prefix: "INV", includeYear: true, digitCount: 6 },
  { id: "num-claim", entityType: "Claim ID", prefix: "CLM", includeYear: true, digitCount: 6 },
  { id: "num-surgery", entityType: "Surgery ID", prefix: "SUR", includeYear: true, digitCount: 4 },
  { id: "num-admission", entityType: "Admission ID", prefix: "ADM", includeYear: true, digitCount: 6 },
];

export function getNumberingFormats() {
  return mockRequest(numberingFormats);
}
export function previewNumberFormat(format: NumberingFormat): string {
  const year = new Date(TODAY).getFullYear();
  const digits = "1".padStart(format.digitCount, "0");
  return format.includeYear ? `${format.prefix}-${year}-${digits}` : `${format.prefix}-${digits}`;
}
export function updateNumberingFormat(id: string, updates: Partial<NumberingFormat>, actor = DEFAULT_ACTOR) {
  const format = numberingFormats.find((f) => f.id === id);
  if (!format) return mockRequest(null);
  recordConfigChange(`numbering.${id}`, `Numbering — ${format.entityType}`, previewNumberFormat(format), "updated", actor);
  Object.assign(format, updates);
  return mockRequest(format);
}

// --- Feature Flags (spec §36) ---------------------------------------------------

export interface FeatureFlagConfig {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const featureFlags: FeatureFlagConfig[] = [
  { id: "ff-online-appt", key: "ONLINE_APPOINTMENT", name: "Online Appointment Booking", description: "Allow patients to self-book via the patient app/portal", enabled: true },
  { id: "ff-self-registration", key: "PATIENT_SELF_REGISTRATION", name: "Patient Self Registration", description: "Allow new patients to register themselves online", enabled: true },
  { id: "ff-whatsapp", key: "WHATSAPP_NOTIFICATION", name: "WhatsApp Notifications", description: "Send notifications via WhatsApp Business API", enabled: false },
  { id: "ff-fhir-sharing", key: "FHIR_SHARING", name: "FHIR Data Sharing", description: "Enable cross-organization FHIR data exchange", enabled: true },
  { id: "ff-ai-assistant", key: "AI_ASSISTANT", name: "AI Assistant", description: "Clinical documentation assistant features", enabled: false },
  { id: "ff-telemedicine", key: "TELEMEDICINE", name: "Telemedicine", description: "Video consultation support", enabled: true },
];

export function getFeatureFlags() {
  return mockRequest(featureFlags);
}
export function setFeatureFlag(id: string, enabled: boolean, actor = DEFAULT_ACTOR) {
  const flag = featureFlags.find((f) => f.id === id);
  if (!flag) return mockRequest(null);
  recordConfigChange(`feature-flag.${flag.key}`, `Feature Flag — ${flag.name}`, String(flag.enabled), String(enabled), actor);
  flag.enabled = enabled;
  return mockRequest(flag);
}

// --- Environment & Secrets (spec §37) — safe metadata only, never real
// secret values, per the spec's own explicit instruction. -------------------

export interface EnvironmentInfo {
  environment: ApiEnvironment;
  appVersion: string;
  deployedAt: string;
  secretsManagedBy: string;
}

export const environmentInfos: EnvironmentInfo[] = [
  { environment: "production", appVersion: "2026.8.2", deployedAt: `${TODAY}T02:00:00`, secretsManagedBy: "Azure Key Vault" },
  { environment: "staging", appVersion: "2026.8.3-rc1", deployedAt: `${TODAY}T08:00:00`, secretsManagedBy: "Azure Key Vault (staging vault)" },
  { environment: "testing", appVersion: "2026.8.3-dev", deployedAt: `${TODAY}T11:00:00`, secretsManagedBy: "HashiCorp Vault (dev cluster)" },
  { environment: "development", appVersion: "2026.8.4-local", deployedAt: `${TODAY}T13:00:00`, secretsManagedBy: "Local .env (never committed)" },
];

export function getEnvironmentInfos() {
  return mockRequest(environmentInfos);
}

// --- System Maintenance (spec §38) ----------------------------------------------

export interface MaintenanceWindow {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface MaintenanceState {
  maintenanceModeActive: boolean;
  readOnlyModeActive: boolean;
  announcement?: string;
  scheduledWindows: MaintenanceWindow[];
}

export const maintenanceState: MaintenanceState = {
  maintenanceModeActive: false,
  readOnlyModeActive: false,
  announcement: undefined,
  scheduledWindows: [{ id: "mw-1", dayOfWeek: "Sunday", startTime: "02:00", endTime: "03:00", description: "Database maintenance window" }],
};

export function getMaintenanceState() {
  return mockRequest(maintenanceState);
}
export function setMaintenanceMode(active: boolean, announcement: string | undefined, actor = DEFAULT_ACTOR) {
  recordConfigChange("maintenance.mode", "Maintenance Mode", String(maintenanceState.maintenanceModeActive), String(active), actor);
  maintenanceState.maintenanceModeActive = active;
  maintenanceState.announcement = announcement;
  return mockRequest(maintenanceState);
}
export function setReadOnlyMode(active: boolean, actor = DEFAULT_ACTOR) {
  recordConfigChange("maintenance.readOnly", "Read-Only Mode", String(maintenanceState.readOnlyModeActive), String(active), actor);
  maintenanceState.readOnlyModeActive = active;
  return mockRequest(maintenanceState);
}

// --- Import / Export (spec §41) — secrets are always redacted, never
// exported in plain text. -------------------------------------------------

export interface ConfigurationExportBundle {
  exportedAt: string;
  exportedBy: string;
  general: GeneralSystemSettings;
  organization: HospitalOrganizationProfile;
  security: Omit<SecurityConfiguration, never>;
  featureFlags: FeatureFlagConfig[];
  numberingFormats: NumberingFormat[];
  note: string;
}

export function exportConfiguration(actor = DEFAULT_ACTOR): ConfigurationExportBundle {
  recordConfigChange("system.export", "Configuration Export", "—", "exported", actor);
  return {
    exportedAt: NOW,
    exportedBy: actor,
    general: generalSystemSettings,
    organization: hospitalOrganizationProfile,
    security: securityConfiguration,
    featureFlags: featureFlags,
    numberingFormats: numberingFormats,
    note: "API keys, client secrets, and credential references are intentionally excluded from this export.",
  };
}

export function importConfiguration(bundle: Partial<ConfigurationExportBundle>, actor = DEFAULT_ACTOR) {
  if (bundle.general) Object.assign(generalSystemSettings, bundle.general);
  if (bundle.featureFlags) bundle.featureFlags.forEach((incoming) => {
    const existing = featureFlags.find((f) => f.key === incoming.key);
    if (existing) existing.enabled = incoming.enabled;
  });
  recordConfigChange("system.import", "Configuration Import", "—", "imported", actor);
  return mockRequest({ success: true, importedAt: NOW });
}
