import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { ConfigDashboardPanel } from "@modules/hospital-admin/components/configuration/ConfigDashboardPanel";
import { OrganizationPanel } from "@modules/hospital-admin/components/configuration/OrganizationPanel";
import { GeneralSettingsPanel } from "@modules/hospital-admin/components/configuration/GeneralSettingsPanel";
import { LocalizationPanel } from "@modules/hospital-admin/components/configuration/LocalizationPanel";
import { UsersAccessPanel } from "@modules/hospital-admin/components/configuration/UsersAccessPanel";
import { PatientConfigPanel } from "@modules/hospital-admin/components/configuration/PatientConfigPanel";
import { AppointmentConfigPanel } from "@modules/hospital-admin/components/configuration/AppointmentConfigPanel";
import { ClinicalSettingsPanel } from "@modules/hospital-admin/components/configuration/ClinicalSettingsPanel";
import { FinancialConfigPanel } from "@modules/hospital-admin/components/configuration/FinancialConfigPanel";
import { NotificationConfigPanel } from "@modules/hospital-admin/components/configuration/NotificationConfigPanel";
import { InteroperabilityPanel } from "@modules/hospital-admin/components/configuration/InteroperabilityPanel";
import { SecurityConfigPanel } from "@modules/hospital-admin/components/configuration/SecurityConfigPanel";
import { AuditConfigPanel } from "@modules/hospital-admin/components/configuration/AuditConfigPanel";
import { RetentionBackupPanel } from "@modules/hospital-admin/components/configuration/RetentionBackupPanel";
import { DocumentsConsentPanel } from "@modules/hospital-admin/components/configuration/DocumentsConsentPanel";
import { MasterDataPanel } from "@modules/hospital-admin/components/configuration/MasterDataPanel";
import { WorkflowApprovalsPanel } from "@modules/hospital-admin/components/configuration/WorkflowApprovalsPanel";
import { NumberingFlagsPanel } from "@modules/hospital-admin/components/configuration/NumberingFlagsPanel";
import { MaintenanceEnvironmentPanel } from "@modules/hospital-admin/components/configuration/MaintenanceEnvironmentPanel";
import { ConfigHistoryPanel } from "@modules/hospital-admin/components/configuration/ConfigHistoryPanel";
import { ExportImportDialog } from "@modules/hospital-admin/components/configuration/ExportImportDialog";
import * as api from "@modules/hospital-admin/api";
import type { ConfigurationExportBundle, MirthChannelStatus } from "@modules/hospital-admin/api";

type Tab =
  | "dashboard" | "organization" | "general" | "localization" | "access" | "patient" | "appointment"
  | "clinical" | "financial" | "notifications" | "interoperability" | "security" | "audit-settings"
  | "retention-backup" | "documents-consent" | "master-data" | "workflow" | "numbering-flags"
  | "maintenance" | "history";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Configuration", subtitle: "Scope + Version + Validation + Approval + Audit + Rollback on every important setting." },
  organization: { label: "Organization", title: "Organization / Hospital", subtitle: "Basic hospital information and structure." },
  general: { label: "General", title: "General System Settings", subtitle: "Controls default application behavior." },
  localization: { label: "Localization", title: "Localization & Language", subtitle: "Multi-language support with automatic RTL/LTR switching." },
  access: { label: "Users & Access", title: "Users & Access Configuration", subtitle: "Roles and fine-grained RBAC permissions — never a bare ADMIN = EVERYTHING." },
  patient: { label: "Patient", title: "Patient Configuration", subtitle: "Identification format, registration requirements, duplicate detection." },
  appointment: { label: "Appointment", title: "Appointment Configuration", subtitle: "Scheduling rules — Appointment Types stay owned by the Appointments module." },
  clinical: { label: "Clinical", title: "Clinical Module Settings", subtitle: "Every clinical module owns its own configuration — this is a directory." },
  financial: { label: "Financial", title: "Billing & Insurance Configuration", subtitle: "Billing rules, payment methods, insurance policy types." },
  notifications: { label: "Notifications", title: "Notification & Communication", subtitle: "Which events fire on which channels, and the gateways behind them." },
  interoperability: { label: "Interoperability", title: "Interoperability", subtitle: "HL7 / FHIR / Mirth / API / Webhooks — secrets are always masked references." },
  security: { label: "Security", title: "Security Configuration", subtitle: "Authentication, password policy, and session/access policy." },
  "audit-settings": { label: "Audit Settings", title: "Audit Configuration", subtitle: "What gets audited and how — never the audit log itself." },
  "retention-backup": { label: "Retention & Backup", title: "Data Retention & Backup", subtitle: "Retention is policy-configured, never a single hardcoded universal period." },
  "documents-consent": { label: "Documents & Consent", title: "Document & Consent Configuration", subtitle: "Document type rules and consent type/template definitions." },
  "master-data": { label: "Master Data", title: "Master Data", subtitle: "Centralized reference data and standardized terminology systems." },
  workflow: { label: "Workflow & Approvals", title: "Workflow & Approvals", subtitle: "Hospital processes, approval chains, and operational queues — all configurable." },
  "numbering-flags": { label: "Numbering & Flags", title: "System Numbering & Feature Flags", subtitle: "Consistent ID formats, and toggling functionality without a redeploy." },
  maintenance: { label: "Maintenance", title: "Maintenance & Environment", subtitle: "Maintenance windows, system announcements, and environment metadata." },
  history: { label: "History", title: "Configuration History", subtitle: "Who, what, when, old value, new value, reason — for every change." },
};

/**
 * Configuration — full 47-section build per CONFIGURATION_MODULE_SPEC.md,
 * per the user's own explicit choice. The central admin control panel:
 * every important setting gets scope + version + validation + approval +
 * audit + rollback, per the spec's own closing "most important rule."
 * Deliberately does NOT rebuild config that already lives correctly inside
 * its owning module (Departments/Rooms/Beds/Appointment Types/Service
 * Pricing/every clinical module's own Settings tab) — this module link-outs
 * to those and only owns genuinely new cross-cutting settings.
 */
export function ConfigurationManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof api.getConfigurationDashboard>> | null>(null);
  const [orgProfile, setOrgProfile] = useState<Awaited<ReturnType<typeof api.getHospitalOrganizationProfile>> | null>(null);
  const [structure, setStructure] = useState<ReturnType<typeof api.getHospitalStructureTree> | null>(null);
  const [general, setGeneral] = useState<Awaited<ReturnType<typeof api.getGeneralSystemSettings>> | null>(null);
  const [languages, setLanguages] = useState<Awaited<ReturnType<typeof api.getSupportedLanguages>>>([]);
  const [roles, setRoles] = useState<Awaited<ReturnType<typeof api.getRoleDefinitions>>>([]);
  const [permissions, setPermissions] = useState<Awaited<ReturnType<typeof api.getPermissionCatalog>>>([]);
  const [patientConfig, setPatientConfig] = useState<Awaited<ReturnType<typeof api.getPatientConfiguration>> | null>(null);
  const [appointmentConfig, setAppointmentConfig] = useState<Awaited<ReturnType<typeof api.getAppointmentConfiguration>> | null>(null);
  const [clinicalLinks, setClinicalLinks] = useState<Awaited<ReturnType<typeof api.getClinicalSettingsLinks>>>([]);
  const [specialties, setSpecialties] = useState<Awaited<ReturnType<typeof api.getMedicalSpecialties>>>([]);
  const [shiftTypes, setShiftTypes] = useState<Awaited<ReturnType<typeof api.getNursingShiftTypes>>>([]);
  const [ratios, setRatios] = useState<Awaited<ReturnType<typeof api.getNursingRatios>>>([]);
  const [billingConfig, setBillingConfig] = useState<Awaited<ReturnType<typeof api.getBillingConfiguration>> | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Awaited<ReturnType<typeof api.getPaymentMethodsCatalog>>>([]);
  const [policyTypes, setPolicyTypes] = useState<Awaited<ReturnType<typeof api.getInsurancePolicyTypes>>>([]);
  const [notificationEvents, setNotificationEvents] = useState<Awaited<ReturnType<typeof api.getNotificationEventConfigs>>>([]);
  const [providers, setProviders] = useState<Awaited<ReturnType<typeof api.getCommunicationProviders>>>([]);
  const [hl7, setHl7] = useState<Awaited<ReturnType<typeof api.getHL7Configuration>> | null>(null);
  const [fhir, setFhir] = useState<Awaited<ReturnType<typeof api.getFHIRConfiguration>> | null>(null);
  const [mirthChannels, setMirthChannels] = useState<Awaited<ReturnType<typeof api.getMirthChannels>>>([]);
  const [apiClients, setApiClients] = useState<Awaited<ReturnType<typeof api.getApiClientConfigs>>>([]);
  const [webhooks, setWebhooks] = useState<Awaited<ReturnType<typeof api.getWebhookConfigs>>>([]);
  const [security, setSecurity] = useState<Awaited<ReturnType<typeof api.getSecurityConfiguration>> | null>(null);
  const [auditConfig, setAuditConfig] = useState<Awaited<ReturnType<typeof api.getAuditConfiguration>> | null>(null);
  const [retentionPolicies, setRetentionPolicies] = useState<Awaited<ReturnType<typeof api.getDataRetentionPolicies>>>([]);
  const [backup, setBackup] = useState<Awaited<ReturnType<typeof api.getBackupConfiguration>> | null>(null);
  const [documentTypes, setDocumentTypes] = useState<Awaited<ReturnType<typeof api.getDocumentTypeConfigs>>>([]);
  const [consentTypes, setConsentTypes] = useState<Awaited<ReturnType<typeof api.getConsentTypeConfigs>>>([]);
  const [countries, setCountries] = useState<Awaited<ReturnType<typeof api.getCountryReferenceData>>>([]);
  const [currencies, setCurrencies] = useState<Awaited<ReturnType<typeof api.getCurrencyReferenceData>>>([]);
  const [terminologySystems, setTerminologySystems] = useState<Awaited<ReturnType<typeof api.getTerminologySystems>>>([]);
  const [scopedSettings, setScopedSettings] = useState<Awaited<ReturnType<typeof api.getSystemSettings>>>([]);
  const [workflows, setWorkflows] = useState<Awaited<ReturnType<typeof api.getWorkflowConfigs>>>([]);
  const [approvalRules, setApprovalRules] = useState<Awaited<ReturnType<typeof api.getApprovalRuleConfigs>>>([]);
  const [queues, setQueues] = useState<Awaited<ReturnType<typeof api.getQueueConfigs>>>([]);
  const [numberingFormats, setNumberingFormats] = useState<Awaited<ReturnType<typeof api.getNumberingFormats>>>([]);
  const [featureFlags, setFeatureFlags] = useState<Awaited<ReturnType<typeof api.getFeatureFlags>>>([]);
  const [maintenance, setMaintenance] = useState<Awaited<ReturnType<typeof api.getMaintenanceState>> | null>(null);
  const [environments, setEnvironments] = useState<Awaited<ReturnType<typeof api.getEnvironmentInfos>>>([]);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof api.getConfigurationHistory>>>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [changeRequests, setChangeRequests] = useState<Awaited<ReturnType<typeof api.getConfigurationChangeRequests>>>([]);

  const [exportImportMode, setExportImportMode] = useState<"export" | "import" | null>(null);
  const [exportBundle, setExportBundle] = useState<ConfigurationExportBundle | null>(null);

  function refreshDashboard() { api.getConfigurationDashboard().then(setDashboard); }
  function refreshHistory() { api.getConfigurationHistory({ search: historySearch }).then(setHistory); }
  function refreshChangeRequests() { api.getConfigurationChangeRequests().then(setChangeRequests); }

  useEffect(() => {
    refreshDashboard();
    api.getHospitalOrganizationProfile().then(setOrgProfile);
    setStructure(api.getHospitalStructureTree());
    api.getGeneralSystemSettings().then(setGeneral);
    api.getSupportedLanguages().then(setLanguages);
    api.getRoleDefinitions().then(setRoles);
    api.getPermissionCatalog().then(setPermissions);
    api.getPatientConfiguration().then(setPatientConfig);
    api.getAppointmentConfiguration().then(setAppointmentConfig);
    api.getClinicalSettingsLinks().then(setClinicalLinks);
    api.getMedicalSpecialties().then(setSpecialties);
    api.getNursingShiftTypes().then(setShiftTypes);
    api.getNursingRatios().then(setRatios);
    api.getBillingConfiguration().then(setBillingConfig);
    api.getPaymentMethodsCatalog().then(setPaymentMethods);
    api.getInsurancePolicyTypes().then(setPolicyTypes);
    api.getNotificationEventConfigs().then(setNotificationEvents);
    api.getCommunicationProviders().then(setProviders);
    api.getHL7Configuration().then(setHl7);
    api.getFHIRConfiguration().then(setFhir);
    api.getMirthChannels().then(setMirthChannels);
    api.getApiClientConfigs().then(setApiClients);
    api.getWebhookConfigs().then(setWebhooks);
    api.getSecurityConfiguration().then(setSecurity);
    api.getAuditConfiguration().then(setAuditConfig);
    api.getDataRetentionPolicies().then(setRetentionPolicies);
    api.getBackupConfiguration().then(setBackup);
    api.getDocumentTypeConfigs().then(setDocumentTypes);
    api.getConsentTypeConfigs().then(setConsentTypes);
    api.getCountryReferenceData().then(setCountries);
    api.getCurrencyReferenceData().then(setCurrencies);
    api.getTerminologySystems().then(setTerminologySystems);
    api.getSystemSettings({ category: "APPOINTMENT" }).then(setScopedSettings);
    api.getWorkflowConfigs().then(setWorkflows);
    api.getApprovalRuleConfigs().then(setApprovalRules);
    api.getQueueConfigs().then(setQueues);
    api.getNumberingFormats().then(setNumberingFormats);
    api.getFeatureFlags().then(setFeatureFlags);
    api.getMaintenanceState().then(setMaintenance);
    api.getEnvironmentInfos().then(setEnvironments);
    refreshHistory();
    refreshChangeRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshHistory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [historySearch]);

  async function handleSaveOrg(values: Parameters<typeof api.updateHospitalOrganizationProfile>[0]) {
    const updated = await api.updateHospitalOrganizationProfile(values, currentUserName);
    setOrgProfile(updated);
    refreshDashboard();
    refreshHistory();
  }
  async function handleSaveGeneral(values: Parameters<typeof api.updateGeneralSystemSettings>[0]) {
    const updated = await api.updateGeneralSystemSettings(values, currentUserName);
    setGeneral(updated);
    refreshHistory();
  }
  async function handleToggleLanguage(code: string, enabled: boolean) {
    await api.setLanguageEnabled(code, enabled, currentUserName);
    api.getSupportedLanguages().then(setLanguages);
    refreshHistory();
  }
  async function handleUpdateRolePermissions(roleId: string, permissionIds: string[]) {
    await api.updateRolePermissions(roleId, permissionIds, currentUserName);
    api.getRoleDefinitions().then(setRoles);
    refreshHistory();
  }
  async function handleSavePatient(values: Parameters<typeof api.updatePatientConfiguration>[0]) {
    const updated = await api.updatePatientConfiguration(values, currentUserName);
    setPatientConfig(updated);
    refreshHistory();
  }
  async function handleSaveAppointment(values: Parameters<typeof api.updateAppointmentConfiguration>[0]) {
    const updated = await api.updateAppointmentConfiguration(values, currentUserName);
    setAppointmentConfig(updated);
    refreshHistory();
  }
  async function handleSaveBilling(values: Parameters<typeof api.updateBillingConfiguration>[0]) {
    const updated = await api.updateBillingConfiguration(values, currentUserName);
    setBillingConfig(updated);
    refreshHistory();
  }
  async function handleToggleNotification(id: string, enabled: boolean) {
    await api.toggleNotificationEvent(id, enabled, currentUserName);
    api.getNotificationEventConfigs().then(setNotificationEvents);
    refreshHistory();
  }
  async function handleSetMirthStatus(id: string, status: MirthChannelStatus) {
    await api.setMirthChannelStatus(id, status, currentUserName);
    api.getMirthChannels().then(setMirthChannels);
    refreshHistory();
  }
  async function handleRevokeApiClient(id: string) {
    await api.revokeApiClient(id, currentUserName);
    api.getApiClientConfigs().then(setApiClients);
    refreshHistory();
  }
  async function handleSaveSecurity(values: Parameters<typeof api.updateSecurityConfiguration>[0]) {
    const updated = await api.updateSecurityConfiguration(values, currentUserName);
    setSecurity(updated);
    refreshHistory();
    refreshDashboard();
  }
  async function handleUpdateAudit(updates: Parameters<typeof api.updateAuditConfiguration>[0]) {
    const updated = await api.updateAuditConfiguration(updates, currentUserName);
    setAuditConfig(updated);
    refreshHistory();
  }
  async function handleUpdateBackup(updates: Parameters<typeof api.updateBackupConfiguration>[0]) {
    const updated = await api.updateBackupConfiguration(updates, currentUserName);
    setBackup(updated);
    refreshHistory();
  }
  function resolveAppointmentDuration(departmentId: string) {
    return api.resolveSetting("APPOINTMENT", "DEFAULT_DURATION", departmentId ? { department: departmentId, hospital: "fac-main-campus" } : { hospital: "fac-main-campus" });
  }
  async function handleToggleFlag(id: string, enabled: boolean) {
    await api.setFeatureFlag(id, enabled, currentUserName);
    api.getFeatureFlags().then(setFeatureFlags);
    refreshHistory();
    refreshDashboard();
  }
  async function handleSetMaintenanceMode(active: boolean, announcement?: string) {
    const updated = await api.setMaintenanceMode(active, announcement, currentUserName);
    setMaintenance(updated);
    refreshHistory();
  }
  async function handleSetReadOnlyMode(active: boolean) {
    const updated = await api.setReadOnlyMode(active, currentUserName);
    setMaintenance(updated);
    refreshHistory();
  }
  async function handleReviewRequest(id: string) { await api.reviewConfigurationChangeRequest(id, currentUserName); refreshChangeRequests(); }
  async function handleApproveRequest(id: string) { await api.approveConfigurationChangeRequest(id, currentUserName); refreshChangeRequests(); }
  async function handlePublishRequest(id: string) { await api.publishConfigurationChangeRequest(id, currentUserName); refreshChangeRequests(); refreshHistory(); }
  async function handleRejectRequest(id: string) { await api.rejectConfigurationChangeRequest(id, "Rejected by reviewer", currentUserName); refreshChangeRequests(); }

  function openExport() {
    setExportBundle(api.exportConfiguration(currentUserName));
    setExportImportMode("export");
  }
  function openImport() {
    setExportImportMode("import");
  }
  async function handleImport(json: string) {
    try {
      const parsed = JSON.parse(json);
      await api.importConfiguration(parsed, currentUserName);
      refreshDashboard();
      refreshHistory();
      api.getGeneralSystemSettings().then(setGeneral);
      api.getFeatureFlags().then(setFeatureFlags);
    } catch {
      // Invalid JSON — the drawer stays closed either way; a real build would surface a toast here.
    }
  }

  return (
    <HospitalAdminLayout active="Configuration">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--outline) 20%, transparent)", color: "var(--on-surface-variant)" }}>
          <Settings size={18} />
        </span>
        <h1 className="font-display font-bold text-2xl text-on-surface">{tabMeta[tab].title}</h1>
      </div>
      <p className="text-sm text-on-surface-variant mb-6">{tabMeta[tab].subtitle}</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(tabMeta) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low bg-white border border-line"
            }`}
          >
            {tabMeta[t].label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <ConfigDashboardPanel data={dashboard} onExport={openExport} onImport={openImport} onViewHistory={() => setTab("history")} />}
      {tab === "organization" && <OrganizationPanel profile={orgProfile} structure={structure} onSave={handleSaveOrg} />}
      {tab === "general" && <GeneralSettingsPanel settings={general} onSave={handleSaveGeneral} />}
      {tab === "localization" && <LocalizationPanel languages={languages} onToggle={handleToggleLanguage} />}
      {tab === "access" && <UsersAccessPanel roles={roles} permissions={permissions} onUpdateRolePermissions={handleUpdateRolePermissions} />}
      {tab === "patient" && <PatientConfigPanel config={patientConfig} preview={api.previewMrnFormat()} onSave={handleSavePatient} />}
      {tab === "appointment" && <AppointmentConfigPanel config={appointmentConfig} onSave={handleSaveAppointment} />}
      {tab === "clinical" && <ClinicalSettingsPanel links={clinicalLinks} specialties={specialties} shiftTypes={shiftTypes} ratios={ratios} />}
      {tab === "financial" && <FinancialConfigPanel billing={billingConfig} paymentMethods={paymentMethods} policyTypes={policyTypes} onSaveBilling={handleSaveBilling} />}
      {tab === "notifications" && <NotificationConfigPanel events={notificationEvents} providers={providers} onToggleEvent={handleToggleNotification} />}
      {tab === "interoperability" && (
        <InteroperabilityPanel hl7={hl7} fhir={fhir} mirthChannels={mirthChannels} apiClients={apiClients} webhooks={webhooks} onSetMirthStatus={handleSetMirthStatus} onRevokeApiClient={handleRevokeApiClient} />
      )}
      {tab === "security" && <SecurityConfigPanel config={security} onSave={handleSaveSecurity} />}
      {tab === "audit-settings" && <AuditConfigPanel config={auditConfig} onUpdate={handleUpdateAudit} />}
      {tab === "retention-backup" && <RetentionBackupPanel policies={retentionPolicies} backup={backup} onUpdateBackup={handleUpdateBackup} />}
      {tab === "documents-consent" && <DocumentsConsentPanel documentTypes={documentTypes} consentTypes={consentTypes} />}
      {tab === "master-data" && (
        <MasterDataPanel countries={countries} currencies={currencies} terminologySystems={terminologySystems} scopedSettings={scopedSettings} onResolve={resolveAppointmentDuration} />
      )}
      {tab === "workflow" && <WorkflowApprovalsPanel workflows={workflows} approvalRules={approvalRules} queues={queues} />}
      {tab === "numbering-flags" && (
        <NumberingFlagsPanel numberingFormats={numberingFormats} previewFor={api.previewNumberFormat} featureFlags={featureFlags} onToggleFlag={handleToggleFlag} />
      )}
      {tab === "maintenance" && (
        <MaintenanceEnvironmentPanel maintenance={maintenance} environments={environments} onSetMaintenanceMode={handleSetMaintenanceMode} onSetReadOnlyMode={handleSetReadOnlyMode} />
      )}
      {tab === "history" && (
        <ConfigHistoryPanel
          history={history}
          search={historySearch}
          onSearchChange={setHistorySearch}
          changeRequests={changeRequests}
          onReview={handleReviewRequest}
          onApprove={handleApproveRequest}
          onPublish={handlePublishRequest}
          onReject={handleRejectRequest}
        />
      )}

      <ExportImportDialog mode={exportImportMode} exportBundle={exportBundle} onClose={() => setExportImportMode(null)} onImport={handleImport} />
    </HospitalAdminLayout>
  );
}
