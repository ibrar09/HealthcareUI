import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { AuditDashboardPanel } from "@modules/hospital-admin/components/audit/AuditDashboardPanel";
import { AuditEventsPanel } from "@modules/hospital-admin/components/audit/AuditEventsPanel";
import { AuditEventDetailDrawer } from "@modules/hospital-admin/components/audit/AuditEventDetailDrawer";
import { PatientAccessAuditPanel } from "@modules/hospital-admin/components/audit/PatientAccessAuditPanel";
import { LoginActivityPanel } from "@modules/hospital-admin/components/audit/LoginActivityPanel";
import { SecurityAuditPanel } from "@modules/hospital-admin/components/audit/SecurityAuditPanel";
import { DataExportAuditPanel } from "@modules/hospital-admin/components/audit/DataExportAuditPanel";
import { ConsentAuditPanel } from "@modules/hospital-admin/components/audit/ConsentAuditPanel";
import { EmergencyAccessAuditPanel } from "@modules/hospital-admin/components/audit/EmergencyAccessAuditPanel";
import { IntegrationAuditPanel } from "@modules/hospital-admin/components/audit/IntegrationAuditPanel";
import { SystemAuditPanel } from "@modules/hospital-admin/components/audit/SystemAuditPanel";
import { InvestigationsPanel } from "@modules/hospital-admin/components/audit/InvestigationsPanel";
import { InvestigationDetailDrawer } from "@modules/hospital-admin/components/audit/InvestigationDetailDrawer";
import { AuditAlertsPanel } from "@modules/hospital-admin/components/audit/AuditAlertsPanel";
import { AuditReportsPanel } from "@modules/hospital-admin/components/audit/AuditReportsPanel";
import { AuditRetentionPanel } from "@modules/hospital-admin/components/audit/AuditRetentionPanel";
import { AuditArchivePanel } from "@modules/hospital-admin/components/audit/AuditArchivePanel";
import * as api from "@modules/hospital-admin/api";
import type { AuditEventCategory, AuditSeverity, SavedAuditQuery, InvestigationStatus, AuditIntegrityStatus } from "@modules/hospital-admin/api";

type Tab =
  | "dashboard" | "events" | "patient-access" | "login" | "security" | "exports" | "consent"
  | "emergency-access" | "integration" | "system" | "investigations" | "alerts" | "reports" | "retention" | "archive";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Audit & Security", subtitle: "A complete, traceable history of sensitive activity across the hospital." },
  events: { label: "All Events", title: "Audit Events", subtitle: "Who did what, to which resource, for which patient, when, from where, and whether it succeeded." },
  "patient-access": { label: "Patient Access", title: "Patient Record Access", subtitle: "Every read/write against a patient record — the core of privacy monitoring." },
  login: { label: "Login Activity", title: "Login Activity", subtitle: "Session history and failed login analysis." },
  security: { label: "Security", title: "Security & Permission Audit", subtitle: "Failed logins, blocked requests, lockouts, and every permission change." },
  exports: { label: "Data Exports", title: "Data Export, Print & Download Audit", subtitle: "Who exported, printed, or downloaded what, how much, and whether it was authorized." },
  consent: { label: "Consent", title: "Consent Activity", subtitle: "Patient-controlled data-sharing activity across the wider platform." },
  "emergency-access": { label: "Emergency Access", title: "Break-Glass Access", subtitle: "Every emergency-override access to a patient record — deliberately highly visible." },
  integration: { label: "Integration", title: "Integration Audit", subtitle: "FHIR / HL7 / DICOM / external-system activity." },
  system: { label: "System Events", title: "System Events", subtitle: "Background jobs and scheduled tasks, plus every module's own real audit log." },
  investigations: { label: "Investigations", title: "Investigations", subtitle: "Security/compliance case management across events, users, and patients." },
  alerts: { label: "Alerts", title: "Audit Alerts", subtitle: "Computed live from real event patterns — never a stored decorative list." },
  reports: { label: "Reports", title: "Audit Reports", subtitle: "Generate and track audit report exports — access itself is audited." },
  retention: { label: "Retention & Integrity", title: "Retention & Integrity", subtitle: "Policy-configured retention, never a hardcoded universal period." },
  archive: { label: "Archive", title: "Audit Archive", subtitle: "Active Audit → Archive → Long-Term Storage." },
};

/**
 * Audit & Security — full 48-section build per AUDIT_MODULE_SPEC.md, per
 * the user's own explicit choice. Additive to every other module's own
 * scoped audit log (Beds/Laboratory/Radiology/Pharmacy/OT/Inventory/
 * Emergency all keep their own `recordXAudit` and their own Audit tab) —
 * this is the hospital-wide event trail, aggregating and enriching those
 * real logs (surfaced in System Events) alongside curated event streams
 * for concepts no existing module tracks (Authentication, Security, Data
 * Export/Print/Download, Consent, Emergency/Break-glass Access).
 */
export function AuditManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof api.getAuditDashboard>> | null>(null);

  const [events, setEvents] = useState<Awaited<ReturnType<typeof api.getAuditEvents>>>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<AuditEventCategory | "all">("all");
  const [eventSeverityFilter, setEventSeverityFilter] = useState<AuditSeverity | "all">("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Awaited<ReturnType<typeof api.getAuditEvent>>>(null);

  const [loginSessions, setLoginSessions] = useState<Awaited<ReturnType<typeof api.getLoginSessions>>>([]);
  const [failedLogins, setFailedLogins] = useState<ReturnType<typeof api.getFailedLoginSummary>>([]);

  const [securityData, setSecurityData] = useState<Awaited<ReturnType<typeof api.getSecurityAuditData>> | null>(null);
  const [dataExports, setDataExports] = useState<Awaited<ReturnType<typeof api.getDataExportEvents>>>([]);
  const [consentEvents, setConsentEvents] = useState<Awaited<ReturnType<typeof api.getConsentAuditEvents>>>([]);
  const [emergencyAccessEvents, setEmergencyAccessEvents] = useState<Awaited<ReturnType<typeof api.getEmergencyAccessEvents>>>([]);
  const [moduleLog, setModuleLog] = useState<Awaited<ReturnType<typeof api.getAggregatedModuleAuditLog>>>([]);

  const [investigationsList, setInvestigationsList] = useState<Awaited<ReturnType<typeof api.getInvestigations>>>([]);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Awaited<ReturnType<typeof api.getInvestigations>>[number] | null>(null);

  const [alerts, setAlerts] = useState<ReturnType<typeof api.getAuditAlerts>>([]);

  const [reportRequests, setReportRequests] = useState<Awaited<ReturnType<typeof api.getAuditReportRequests>>>([]);

  const [archivedEvents, setArchivedEvents] = useState<Awaited<ReturnType<typeof api.getArchivedAuditEvents>>>([]);
  const [showArchived, setShowArchived] = useState(false);

  const selectedInvestigationIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedInvestigationIdRef.current = selectedInvestigationId;
  }, [selectedInvestigationId]);

  function refreshDashboard() {
    api.getAuditDashboard().then(setDashboard);
  }
  function refreshEvents() {
    api.getAuditEvents({ category: eventCategoryFilter === "all" ? undefined : eventCategoryFilter, severity: eventSeverityFilter === "all" ? undefined : eventSeverityFilter, search: eventSearch }).then(setEvents);
  }
  function refreshLogins() {
    api.getLoginSessions().then(setLoginSessions);
    setFailedLogins(api.getFailedLoginSummary());
  }
  function refreshSecurity() {
    api.getSecurityAuditData().then(setSecurityData);
  }
  function refreshExports() {
    api.getDataExportEvents().then(setDataExports);
  }
  function refreshConsent() {
    api.getConsentAuditEvents().then(setConsentEvents);
  }
  function refreshEmergencyAccess() {
    api.getEmergencyAccessEvents().then(setEmergencyAccessEvents);
  }
  function refreshModuleLog() {
    api.getAggregatedModuleAuditLog().then(setModuleLog);
  }
  function refreshInvestigations() {
    api.getInvestigations().then(setInvestigationsList);
  }
  function refreshAlerts() {
    setAlerts(api.getAuditAlerts());
  }
  function refreshReports() {
    api.getAuditReportRequests().then(setReportRequests);
  }
  function refreshArchive() {
    api.getArchivedAuditEvents().then(setArchivedEvents);
  }

  useEffect(() => {
    refreshDashboard();
    refreshEvents();
    refreshLogins();
    refreshSecurity();
    refreshExports();
    refreshConsent();
    refreshEmergencyAccess();
    refreshModuleLog();
    refreshInvestigations();
    refreshAlerts();
    refreshReports();
    refreshArchive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshEvents(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [eventSearch, eventCategoryFilter, eventSeverityFilter]);

  useEffect(() => {
    if (selectedEventId) api.getAuditEvent(selectedEventId).then(setSelectedEvent);
    else setSelectedEvent(null);
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedInvestigationId) {
      const id = selectedInvestigationId;
      api.getInvestigations().then((rows) => {
        if (selectedInvestigationIdRef.current === id) setSelectedInvestigation(rows.find((r) => r.id === id) ?? null);
      });
    } else {
      setSelectedInvestigation(null);
    }
    // Deliberately NOT keyed on investigationsList — this drawer keeps its own
    // local note-draft state, and re-running this effect on every background
    // list refresh would refetch a fresh investigation object mid-edit. The
    // mutation handlers below update `selectedInvestigation` directly from
    // their own return value instead, the same "don't clobber unsaved local
    // state with a stale background refetch" fix applied to OT's Pre-Op/
    // Recovery drawers earlier this session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInvestigationId]);

  const savedQueries: SavedAuditQuery[] = api.savedAuditQueries;
  const reportTypes = api.auditReportTypes;
  const retentionPolicies = api.auditRetentionPolicies;

  function applySavedQuery(query: SavedAuditQuery) {
    setEventCategoryFilter((query.filters.category as AuditEventCategory | undefined) ?? "all");
    setEventSeverityFilter((query.filters.severity as AuditSeverity | undefined) ?? "all");
    setEventSearch("");
  }

  async function handleAddInvestigationNote(note: string) {
    if (!selectedInvestigationId) return;
    const updated = await api.addInvestigationNote(selectedInvestigationId, note, currentUserName);
    if (selectedInvestigationIdRef.current === selectedInvestigationId) setSelectedInvestigation(updated);
    refreshInvestigations();
  }
  async function handleUpdateInvestigationStatus(status: InvestigationStatus, resolution?: string) {
    if (!selectedInvestigationId) return;
    const updated = await api.updateInvestigationStatus(selectedInvestigationId, status, resolution);
    if (selectedInvestigationIdRef.current === selectedInvestigationId) setSelectedInvestigation(updated);
    refreshInvestigations();
  }
  async function handleOpenInvestigationFromEvent() {
    if (!selectedEvent) return;
    const investigation = await api.openInvestigation({
      subject: selectedEvent.eventName,
      userIds: selectedEvent.actorId ? [selectedEvent.actorId] : [],
      patientIds: selectedEvent.patientId ? [selectedEvent.patientId] : [],
      assignedTo: currentUserName,
    });
    refreshInvestigations();
    setSelectedEventId(null);
    setSelectedInvestigationId(investigation.id);
    setTab("investigations");
  }
  async function handleInvestigateAlert(alert: { relatedActorName?: string; title: string }) {
    const investigation = await api.openInvestigation({ subject: alert.title, userIds: [], patientIds: [], assignedTo: currentUserName });
    refreshInvestigations();
    setSelectedInvestigationId(investigation.id);
    setTab("investigations");
  }

  async function handleGenerateReport(reportType: string, format: "pdf" | "csv" | "excel") {
    await api.requestAuditReport({ reportType, requestedBy: currentUserName, format });
    refreshReports();
  }

  async function handleArchiveEvent(id: string) {
    await api.archiveAuditEvent(id);
    refreshEvents();
    refreshArchive();
    refreshDashboard();
  }

  const patientAccessEvents = events.filter((e) => e.patientId && e.action === "READ");
  const securityEvents = events.filter((e) => e.category === "security");
  const permissionChangeEvents = events.filter((e) => e.eventName === "Permission Changed");
  const integrationEvents = events.filter((e) => e.category === "integration");
  const systemEvents = events.filter((e) => e.category === "system");

  const integritySummary: { status: AuditIntegrityStatus; count: number }[] = (["verified", "pending", "error"] as AuditIntegrityStatus[]).map((status) => ({
    status,
    count: events.filter((e) => e.integrityStatus === status).length,
  }));

  return (
    <HospitalAdminLayout active="Audit">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--module-nursing) 14%, transparent)", color: "var(--module-nursing)" }}>
          <ShieldCheck size={18} />
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

      {tab === "dashboard" && <AuditDashboardPanel data={dashboard} />}

      {tab === "events" && (
        <AuditEventsPanel
          events={events}
          search={eventSearch}
          onSearchChange={setEventSearch}
          categoryFilter={eventCategoryFilter}
          onCategoryFilterChange={setEventCategoryFilter}
          severityFilter={eventSeverityFilter}
          onSeverityFilterChange={setEventSeverityFilter}
          savedQueries={savedQueries}
          onApplySavedQuery={applySavedQuery}
          onSelect={setSelectedEventId}
        />
      )}

      {tab === "patient-access" && <PatientAccessAuditPanel events={patientAccessEvents} onSelect={setSelectedEventId} />}

      {tab === "login" && <LoginActivityPanel sessions={loginSessions} failedLogins={failedLogins} />}

      {tab === "security" && <SecurityAuditPanel data={securityData} securityEvents={securityEvents} permissionChanges={permissionChangeEvents} onSelect={setSelectedEventId} />}

      {tab === "exports" && <DataExportAuditPanel events={dataExports} />}

      {tab === "consent" && <ConsentAuditPanel events={consentEvents} />}

      {tab === "emergency-access" && <EmergencyAccessAuditPanel events={emergencyAccessEvents} />}

      {tab === "integration" && <IntegrationAuditPanel events={integrationEvents} />}

      {tab === "system" && <SystemAuditPanel events={systemEvents} moduleLog={moduleLog} />}

      {tab === "investigations" && <InvestigationsPanel investigations={investigationsList} onSelect={setSelectedInvestigationId} />}

      {tab === "alerts" && <AuditAlertsPanel alerts={alerts} onInvestigate={handleInvestigateAlert} />}

      {tab === "reports" && <AuditReportsPanel reportTypes={reportTypes} requests={reportRequests} onGenerate={handleGenerateReport} />}

      {tab === "retention" && <AuditRetentionPanel policies={retentionPolicies} integritySummary={integritySummary} />}

      {tab === "archive" && <AuditArchivePanel activeEvents={events} archivedEvents={archivedEvents} showArchived={showArchived} onToggleView={setShowArchived} onArchive={handleArchiveEvent} />}

      <AuditEventDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
        onOpenInvestigation={handleOpenInvestigationFromEvent}
        onSelectRelated={(id) => setSelectedEventId(id)}
      />

      <InvestigationDetailDrawer
        investigation={selectedInvestigation}
        onClose={() => setSelectedInvestigationId(null)}
        onAddNote={handleAddInvestigationNote}
        onUpdateStatus={handleUpdateInvestigationStatus}
      />
    </HospitalAdminLayout>
  );
}
