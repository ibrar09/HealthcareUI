import { useEffect, useState } from "react";
import { ScanLine, CalendarCheck, Clock, Activity, CheckCircle2, FileClock, AlertTriangle, Wrench, ArrowRight, ShieldAlert } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, KPICard, StatusChip } from "@shared/design-system/components";
import { DonutChart } from "@modules/hospital-admin/components/DonutChart";
import { imagingOrderStatusMeta, imagingPriorityMeta, modalityStatusMeta, formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import { ImagingOrdersPanel } from "@modules/hospital-admin/components/radiology/ImagingOrdersPanel";
import { ImagingOrderDetailsDrawer } from "@modules/hospital-admin/components/radiology/ImagingOrderDetailsDrawer";
import { AuthorizeImagingOrderDrawer } from "@modules/hospital-admin/components/radiology/AuthorizeImagingOrderDrawer";
import { CancelImagingOrderDrawer } from "@modules/hospital-admin/components/radiology/CancelImagingOrderDrawer";
import { HoldImagingOrderDrawer } from "@modules/hospital-admin/components/radiology/HoldImagingOrderDrawer";
import { ScheduleImagingOrderDrawer } from "@modules/hospital-admin/components/radiology/ScheduleImagingOrderDrawer";
import { SchedulingPanel } from "@modules/hospital-admin/components/radiology/SchedulingPanel";
import { RadiologyWorklistPanel } from "@modules/hospital-admin/components/radiology/RadiologyWorklistPanel";
import { ImagingStudiesPanel } from "@modules/hospital-admin/components/radiology/ImagingStudiesPanel";
import { ImagingStudyDetailsDrawer } from "@modules/hospital-admin/components/radiology/ImagingStudyDetailsDrawer";
import { RadiologyReportsPanel } from "@modules/hospital-admin/components/radiology/RadiologyReportsPanel";
import { RadiologyReportDetailsDrawer } from "@modules/hospital-admin/components/radiology/RadiologyReportDetailsDrawer";
import { RadiologyCriticalFindingsPanel } from "@modules/hospital-admin/components/radiology/RadiologyCriticalFindingsPanel";
import { AcknowledgeRadiologyCriticalFindingDrawer } from "@modules/hospital-admin/components/radiology/AcknowledgeRadiologyCriticalFindingDrawer";
import { ModalitiesPanel } from "@modules/hospital-admin/components/radiology/ModalitiesPanel";
import { ModalityFormDrawer } from "@modules/hospital-admin/components/radiology/ModalityFormDrawer";
import { RoomsPanel } from "@modules/hospital-admin/components/radiology/RoomsPanel";
import { RoomFormDrawer, type RoomFormValues } from "@modules/hospital-admin/components/radiology/RoomFormDrawer";
import { RadiologistsPanel } from "@modules/hospital-admin/components/radiology/RadiologistsPanel";
import { RadiologistDetailDrawer } from "@modules/hospital-admin/components/radiology/RadiologistDetailDrawer";
import { TechnologistsPanel } from "@modules/hospital-admin/components/radiology/TechnologistsPanel";
import { ProceduresPanel } from "@modules/hospital-admin/components/radiology/ProceduresPanel";
import { ProcedureFormDrawer } from "@modules/hospital-admin/components/radiology/ProcedureFormDrawer";
import { ProtocolFormDrawer } from "@modules/hospital-admin/components/radiology/ProtocolFormDrawer";
import { EquipmentPanel } from "@modules/hospital-admin/components/radiology/EquipmentPanel";
import { IntegrationsPanel } from "@modules/hospital-admin/components/radiology/IntegrationsPanel";
import { RadiologyBillingPanel } from "@modules/hospital-admin/components/radiology/RadiologyBillingPanel";
import { RadiologyAnalyticsPanel } from "@modules/hospital-admin/components/radiology/RadiologyAnalyticsPanel";
import { RadiologyAuditPanel } from "@modules/hospital-admin/components/radiology/RadiologyAuditPanel";
import { RadiologySettingsPanel } from "@modules/hospital-admin/components/radiology/RadiologySettingsPanel";
import * as api from "@modules/hospital-admin/api";
import type {
  RadiologyDashboardData,
  ImagingOrderRow,
  ImagingOrderDetail,
  ImagingOrderStatus,
  ImagingOrderPriority,
  ImagingStudyRow,
  ImagingStudyDetail,
  RadiologyReportRow,
  RadiologyReportDetail,
  RadiologyReportStatus,
  CriticalFindingRow,
  RadiologyRoom,
  ModalityRow,
  ModalityStatus,
  NewModalityInput,
  RoomRow,
  RadiologistRow,
  TechnologistRow,
  ImagingProcedure,
  NewImagingProcedureInput,
  RadiologyProtocolRow,
  NewProtocolInput,
  EquipmentRow,
  MaintenanceDashboardData,
  PacsStatusRow,
  PacsSummary,
  IntegrationStatus,
  RadiologyBillingRow,
  RadiologyInsuranceRow,
  RadiologyAnalyticsData,
  RadiologyAuditEntry,
  RadiologyAuditEntityType,
  RadiologySettingsData,
} from "@modules/hospital-admin/api";

const modalityColors: Record<string, string> = {
  ct: "var(--signal-indigo)",
  mri: "var(--module-radiology)",
  xr: "var(--vital-green)",
  us: "var(--caution-amber)",
  mammography: "var(--sunset-coral)",
  fluoroscopy: "var(--pulse-coral)",
  pet: "var(--signal-indigo-light)",
  spect: "var(--outline)",
  dexa: "var(--module-nursing)",
};

const modalityLabels: Record<string, string> = {
  ct: "CT",
  mri: "MRI",
  xr: "X-Ray",
  us: "Ultrasound",
  mammography: "Mammography",
  fluoroscopy: "Fluoroscopy",
  pet: "PET",
  spect: "SPECT",
  dexa: "DEXA",
};

const alertSeverityMeta: Record<string, { icon: string }> = {
  critical: { icon: "🔴" },
  warning: { icon: "🟠" },
  caution: { icon: "🟡" },
  info: { icon: "🔵" },
};

const worklistStatuses = ["scheduled", "checked-in", "in-progress"];

type Tab =
  | "dashboard"
  | "orders"
  | "scheduling"
  | "worklist"
  | "studies"
  | "reports"
  | "critical"
  | "modalities"
  | "rooms"
  | "radiologists"
  | "technologists"
  | "procedures"
  | "equipment"
  | "integrations"
  | "billing"
  | "analytics"
  | "audit"
  | "settings";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Radiology", subtitle: "Main Campus · Radiology Department · Aug 14, 2026" },
  orders: { label: "Orders", title: "Imaging Orders", subtitle: "Every ServiceRequest — search, filter, authorize, schedule." },
  scheduling: { label: "Scheduling", title: "Scheduling", subtitle: "Every scheduled study, plus authorized orders waiting to be scheduled." },
  worklist: { label: "Worklist", title: "Radiology Worklist", subtitle: "What technologists work from today, sorted by priority." },
  studies: { label: "Studies", title: "Studies", subtitle: "Imaging actually performed — distinct from the order that requested it." },
  reports: { label: "Reports", title: "Radiology Reports", subtitle: "View-only — report authorship stays with the radiologist's own workspace." },
  critical: { label: "Critical Findings", title: "Critical Findings", subtitle: "Escalation only — acknowledgment, never a report edit." },
  modalities: { label: "Modalities", title: "Modalities", subtitle: "Equipment registry — never a static dropdown." },
  rooms: { label: "Rooms", title: "Rooms", subtitle: "Room → Modality, capacity, status, and assigned staff." },
  radiologists: { label: "Radiologists", title: "Radiologists", subtitle: "Workload and credentials roster — read-only, joined off Staff & Workforce." },
  technologists: { label: "Technologists", title: "Technologists", subtitle: "Competency, current room/study, and availability — read-only." },
  procedures: { label: "Procedures", title: "Procedures & Protocols", subtitle: "The coded imaging catalog and its per-procedure protocol options." },
  equipment: { label: "Equipment", title: "Equipment & Maintenance", subtitle: "Service history, warranty, and the maintenance due schedule." },
  integrations: { label: "Integrations", title: "PACS / DICOM / FHIR / HL7", subtitle: "Connectivity status and per-study transfer log — no viewer or networking here." },
  billing: { label: "Billing", title: "Billing & Insurance", subtitle: "Cross-reference view of pricing and authorization — the ledger lives in Billing & Revenue." },
  analytics: { label: "Analytics", title: "Radiology Analytics", subtitle: "Volume, turnaround time, and utilization — computed from real records." },
  audit: { label: "Audit", title: "Audit Log", subtitle: "Every workflow action this section owns — never clinical content." },
  settings: { label: "Settings", title: "Settings", subtitle: "Configuration overview — edit values on their own screens." },
};

/**
 * Radiology — full module per RADIOLOGY_MODULE_SPEC.md: Phase 1 (Dashboard),
 * Phase 2 (Orders/Order Details/Scheduling/Worklist/Studies/Study Details/
 * Reports/Report Details/Critical Findings), Phase 3 (Modalities/Rooms/
 * Radiologists/Technologists/Procedures/Protocols/Equipment/Maintenance),
 * Phase 4 (PACS/DICOM/FHIR/HL7 status, combined under one Integrations tab),
 * Phase 5 (Billing+Insurance combined, Analytics, Audit, Settings). Strictly
 * [oversight]: every mutation here is a workflow/logistics step (authorize,
 * schedule, check in, log acquisition start/finish, cancel, acknowledge,
 * change equipment/room/procedure status, log a service event, retry a PACS
 * transfer) — nothing writes Findings/Impression text or finalizes a report.
 * Radiologists/Technologists stay read-only rosters joined off Staff &
 * Workforce. Billing/Insurance stay cross-reference views, never a second
 * ledger. The Audit tab logs every mutation above via recordRadiologyAudit
 * in the API layer — real entries, not a decorative log.
 */
export function RadiologyManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<RadiologyDashboardData | null>(null);
  const [orders, setOrders] = useState<ImagingOrderRow[]>([]);
  const [worklistOrders, setWorklistOrders] = useState<ImagingOrderRow[]>([]);
  const [readyToSchedule, setReadyToSchedule] = useState<ImagingOrderRow[]>([]);
  const [scheduledOrders, setScheduledOrders] = useState<ImagingOrderRow[]>([]);
  const [studies, setStudies] = useState<ImagingStudyRow[]>([]);
  const [reports, setReports] = useState<RadiologyReportRow[]>([]);
  const [criticalFindings, setCriticalFindings] = useState<CriticalFindingRow[]>([]);
  const [rooms, setRooms] = useState<RadiologyRoom[]>([]);
  const [technologists, setTechnologists] = useState<{ id: string; name: string }[]>([]);
  const [radiologists, setRadiologists] = useState<{ id: string; name: string }[]>([]);
  const [modalities, setModalities] = useState<ModalityRow[]>([]);
  const [modalityFormOpen, setModalityFormOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<(NewModalityInput & { id: string }) | null>(null);
  const [roomsList, setRoomsList] = useState<RoomRow[]>([]);
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<(RoomFormValues & { id: string }) | null>(null);
  const [radiologistsList, setRadiologistsList] = useState<RadiologistRow[]>([]);
  const [selectedRadiologist, setSelectedRadiologist] = useState<RadiologistRow | null>(null);
  const [technologistsList, setTechnologistsList] = useState<TechnologistRow[]>([]);

  const [procedures, setProcedures] = useState<ImagingProcedure[]>([]);
  const [protocols, setProtocols] = useState<RadiologyProtocolRow[]>([]);
  const [procedureFormOpen, setProcedureFormOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<ImagingProcedure | null>(null);
  const [protocolFormOpen, setProtocolFormOpen] = useState(false);

  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceDashboardData | null>(null);

  const [pacsSummary, setPacsSummary] = useState<PacsSummary | null>(null);
  const [pacsStatusList, setPacsStatusList] = useState<PacsStatusRow[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  const [radiologyBilling, setRadiologyBilling] = useState<RadiologyBillingRow[]>([]);
  const [insuranceQueue, setInsuranceQueue] = useState<RadiologyInsuranceRow[]>([]);
  const [billingSearch, setBillingSearch] = useState("");

  const [analytics, setAnalytics] = useState<RadiologyAnalyticsData | null>(null);

  const [auditLog, setAuditLog] = useState<RadiologyAuditEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditEntityFilter, setAuditEntityFilter] = useState<RadiologyAuditEntityType | "all">("all");

  const [settings, setSettings] = useState<RadiologySettingsData | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ImagingOrderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ImagingOrderPriority | "all">("all");
  const [studySearch, setStudySearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<RadiologyReportStatus | "all">("all");
  const [showAllCritical, setShowAllCritical] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrderDetail | null>(null);
  const [authorizeTarget, setAuthorizeTarget] = useState<ImagingOrderRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ImagingOrderRow | null>(null);
  const [holdTarget, setHoldTarget] = useState<ImagingOrderRow | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ImagingOrderRow | null>(null);

  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<ImagingStudyDetail | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<RadiologyReportDetail | null>(null);
  const [acknowledgeTarget, setAcknowledgeTarget] = useState<CriticalFindingRow | null>(null);

  function refreshDashboard() {
    api.getRadiologyDashboard().then(setDashboard);
  }
  function refreshOrders() {
    api.getImagingOrders({ status: statusFilter === "all" ? undefined : statusFilter, priority: priorityFilter === "all" ? undefined : priorityFilter, search }).then(setOrders);
  }
  function refreshWorklistAndScheduling() {
    api.getImagingOrders().then((all) => {
      setWorklistOrders(all.filter((o) => worklistStatuses.includes(o.status)));
      setReadyToSchedule(all.filter((o) => !o.scheduledDateTime && (o.status === "authorized" || o.status === "ordered")));
      setScheduledOrders(all.filter((o) => Boolean(o.scheduledDateTime)).sort((a, b) => (a.scheduledDateTime! < b.scheduledDateTime! ? -1 : 1)));
    });
  }
  function refreshStudies() {
    api.getImagingStudies({ search: studySearch }).then(setStudies);
  }
  function refreshReports() {
    api.getRadiologyReports({ status: reportStatusFilter === "all" ? undefined : reportStatusFilter, search: reportSearch }).then(setReports);
  }
  function refreshCritical() {
    api.getCriticalFindingsList().then(setCriticalFindings);
  }
  function refreshModalities() {
    api.getModalities().then(setModalities);
  }
  function refreshRoomsList() {
    api.getRoomsList().then(setRoomsList);
  }
  function refreshRadiologists() {
    api.getRadiologists().then(setRadiologistsList);
  }
  function refreshTechnologists() {
    api.getTechnologists().then(setTechnologistsList);
  }
  function refreshProcedures() {
    api.getImagingProcedures({ includeInactive: true }).then(setProcedures);
  }
  function refreshProtocols() {
    api.getProtocols().then(setProtocols);
  }
  function refreshEquipment() {
    api.getEquipmentList().then(setEquipment);
  }
  function refreshMaintenance() {
    api.getMaintenanceDashboard().then(setMaintenance);
  }
  function refreshIntegrations() {
    api.getPacsSummary().then(setPacsSummary);
    api.getPacsStatusList().then(setPacsStatusList);
    api.getIntegrationStatuses().then(setIntegrations);
  }
  function refreshBilling() {
    api.getRadiologyBilling({ search: billingSearch }).then(setRadiologyBilling);
    api.getRadiologyInsuranceQueue().then(setInsuranceQueue);
  }
  function refreshAnalytics() {
    api.getRadiologyAnalytics().then(setAnalytics);
  }
  function refreshAudit() {
    api.getRadiologyAuditLog({ entityType: auditEntityFilter === "all" ? undefined : auditEntityFilter, search: auditSearch }).then(setAuditLog);
  }
  function refreshSettings() {
    api.getRadiologySettings().then(setSettings);
  }

  useEffect(() => {
    refreshDashboard();
    refreshWorklistAndScheduling();
    refreshCritical();
    refreshModalities();
    refreshRoomsList();
    refreshRadiologists();
    refreshTechnologists();
    refreshProcedures();
    refreshProtocols();
    refreshEquipment();
    refreshMaintenance();
    refreshIntegrations();
    refreshAnalytics();
    refreshSettings();
    api.getRadiologyRooms().then(setRooms);
    api.getStaffMembers().then((staff) => {
      setTechnologists(staff.filter((s) => s.role === "technician" && s.department === "Radiology").map((s) => ({ id: s.id, name: s.name })));
      setRadiologists(staff.filter((s) => s.role === "doctor" && s.department === "Radiology").map((s) => ({ id: s.id, name: s.name })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    refreshStudies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studySearch]);

  useEffect(() => {
    refreshReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportSearch, reportStatusFilter]);

  useEffect(() => {
    refreshBilling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingSearch]);

  useEffect(() => {
    refreshAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditSearch, auditEntityFilter]);

  useEffect(() => {
    if (selectedOrderId) api.getImagingOrder(selectedOrderId).then(setSelectedOrder);
    else setSelectedOrder(null);
  }, [selectedOrderId]);

  useEffect(() => {
    if (selectedStudyId) api.getImagingStudy(selectedStudyId).then(setSelectedStudy);
    else setSelectedStudy(null);
  }, [selectedStudyId]);

  useEffect(() => {
    if (selectedReportId) api.getRadiologyReport(selectedReportId).then(setSelectedReport);
    else setSelectedReport(null);
  }, [selectedReportId]);

  function refreshAllAfterMutation() {
    refreshDashboard();
    refreshOrders();
    refreshWorklistAndScheduling();
    refreshStudies();
    refreshReports();
    refreshCritical();
    refreshModalities();
    refreshRadiologists();
    refreshTechnologists();
    refreshIntegrations();
    refreshBilling();
    refreshAnalytics();
    refreshAudit();
    if (selectedOrderId) api.getImagingOrder(selectedOrderId).then(setSelectedOrder);
  }

  async function handleQuickAction(fn: () => Promise<unknown>) {
    await fn();
    refreshAllAfterMutation();
  }

  function openAddModality() {
    setEditingModality(null);
    setModalityFormOpen(true);
  }

  function openEditModality(m: ModalityRow) {
    setEditingModality({
      id: m.id,
      name: m.name,
      type: m.type,
      manufacturer: m.manufacturer,
      model: m.model,
      serialNumber: m.serialNumber,
      roomId: m.roomId,
      aeTitle: m.aeTitle,
      ipAddress: m.ipAddress,
      pacsDestination: m.pacsDestination,
      nextMaintenance: m.nextMaintenance,
    });
    setModalityFormOpen(true);
  }

  async function handleModalitySubmit(values: NewModalityInput) {
    if (editingModality) await api.updateModality(editingModality.id, values);
    else await api.createModality(values);
    refreshModalities();
  }

  async function handleSetModalityStatus(m: ModalityRow, status: ModalityStatus) {
    await api.setModalityStatus(m.id, status);
    refreshModalities();
    refreshRoomsList();
    refreshDashboard();
    refreshEquipment();
    refreshMaintenance();
    refreshIntegrations();
    refreshAudit();
  }

  function openAddRoom() {
    setEditingRoom(null);
    setRoomFormOpen(true);
  }

  function openEditRoom(r: RoomRow) {
    setEditingRoom({ id: r.id, number: r.number, location: r.location, modalityId: r.modalityId, capacity: r.capacity, operatingHours: r.operatingHours, assignedStaffIds: r.assignedStaffIds });
    setRoomFormOpen(true);
  }

  async function handleRoomSubmit(values: RoomFormValues) {
    const { assignedStaffIds, ...coreValues } = values;
    if (editingRoom) await api.updateRadiologyRoom(editingRoom.id, coreValues);
    else {
      const created = await api.createRadiologyRoom(coreValues);
      await api.assignRoomStaff(created.id, assignedStaffIds);
      refreshRoomsList();
      api.getRadiologyRooms().then(setRooms);
      return;
    }
    await api.assignRoomStaff(editingRoom.id, assignedStaffIds);
    refreshRoomsList();
    api.getRadiologyRooms().then(setRooms);
  }

  async function handleToggleRoomStatus(r: RoomRow) {
    await api.setRoomStatus(r.id, r.status === "active" ? "closed" : "active");
    refreshRoomsList();
    api.getRadiologyRooms().then(setRooms);
  }

  function openAddProcedure() {
    setEditingProcedure(null);
    setProcedureFormOpen(true);
  }

  function openEditProcedure(p: ImagingProcedure) {
    setEditingProcedure(p);
    setProcedureFormOpen(true);
  }

  async function handleProcedureSubmit(values: NewImagingProcedureInput) {
    if (editingProcedure) await api.updateImagingProcedure(editingProcedure.code, values);
    else await api.createImagingProcedure(values);
    refreshProcedures();
    refreshSettings();
    refreshAudit();
  }

  async function handleToggleProcedureActive(p: ImagingProcedure) {
    await api.setImagingProcedureActive(p.code, !p.active);
    refreshProcedures();
    refreshSettings();
    refreshAudit();
  }

  async function handleProtocolSubmit(values: NewProtocolInput) {
    await api.createProtocol(values);
    refreshProtocols();
    refreshSettings();
    refreshAudit();
  }

  async function handleLogMaintenance(modalityId: string) {
    await api.logMaintenanceEvent(modalityId, "preventive", `Logged by ${currentUserName}`);
    refreshEquipment();
    refreshMaintenance();
    refreshModalities();
    refreshAudit();
  }

  async function handleRetryPacsTransfer(studyId: string) {
    await api.retryPacsTransfer(studyId);
    refreshIntegrations();
    refreshAudit();
  }

  const reportCounts: Record<RadiologyReportStatus, number> = {
    draft: reports.filter((r) => r.status === "draft").length,
    preliminary: reports.filter((r) => r.status === "preliminary").length,
    final: reports.filter((r) => r.status === "final").length,
    amended: reports.filter((r) => r.status === "amended").length,
  };

  function renderDashboardTab(d: RadiologyDashboardData | null, worklist: ImagingOrderRow[]) {
    if (!d) return null;
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label="Orders Today" value={d.ordersToday} icon={<ScanLine size={14} />} accentColor="var(--signal-indigo)" />
          <KPICard label="Scheduled" value={d.scheduled} icon={<CalendarCheck size={14} />} accentColor="var(--module-radiology)" />
          <KPICard label="Waiting" value={d.waiting} icon={<Clock size={14} />} accentColor="var(--caution-amber)" />
          <KPICard label="In Progress" value={d.inProgress} icon={<Activity size={14} />} accentColor="var(--caution-amber)" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label="Completed" value={d.completed} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
          <KPICard label="Awaiting Report" value={d.awaitingReport} icon={<FileClock size={14} />} accentColor="var(--signal-indigo-light)" />
          <KPICard label="Critical Findings" value={d.criticalOpen} icon={<AlertTriangle size={14} />} accentColor="var(--pulse-coral)" />
          <KPICard label="Equipment Alerts" value={d.equipmentAlerts} icon={<Wrench size={14} />} accentColor="var(--pulse-coral)" />
        </div>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-5">Today's Radiology Workflow</h2>
          <div className="flex items-center justify-between gap-1 overflow-x-auto">
            {[
              { label: "Orders", value: d.workflow.orders },
              { label: "Scheduled", value: d.workflow.scheduled },
              { label: "Checked-In", value: d.workflow.checkedIn },
              { label: "In Progress", value: d.workflow.inProgress },
              { label: "Completed", value: d.workflow.completed },
              { label: "Reporting", value: d.workflow.reporting },
              { label: "Final", value: d.workflow.final },
            ].map((stage, i, arr) => (
              <div key={stage.label} className="flex items-center gap-1 flex-shrink-0">
                <div className="flex flex-col items-center gap-1 rounded-2xl border border-line px-4 py-3 min-w-[92px]">
                  <span className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">{stage.label}</span>
                  <span className="text-xl font-bold text-on-surface">{stage.value}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight size={16} className="text-outline-variant flex-shrink-0" />}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card hero className="lg:col-span-1">
            <h2 className="text-lg font-bold text-on-surface mb-4">Volume by Modality</h2>
            {d.byModality.length > 0 && (
              <DonutChart centerLabel="orders" data={d.byModality.map((m) => ({ name: modalityLabels[m.modality] ?? m.modality, value: m.count, color: modalityColors[m.modality] ?? "var(--outline)" }))} size={140} />
            )}
          </Card>

          <Card hero className="lg:col-span-1">
            <h2 className="text-lg font-bold text-on-surface mb-4">Modality Utilization</h2>
            <div className="flex flex-col gap-3">
              {d.modalityUtilization.map((m) => {
                const meta = modalityStatusMeta[m.status];
                return (
                  <div key={m.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{meta.dot}</span>
                      <span className="text-sm font-semibold text-on-surface truncate">{m.name}</span>
                      <span className="text-xs" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-on-surface flex-shrink-0">{m.studiesToday} today</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card hero className="lg:col-span-1">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <FileClock size={16} className="text-signal-indigo" /> Pending Reports
            </h2>
            <div className="flex flex-col gap-3">
              {d.pendingReportsByBucket.map((b) => {
                const max = Math.max(...d.pendingReportsByBucket.map((x) => x.count), 1);
                return (
                  <div key={b.bucket}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface font-medium">{b.bucket}</span>
                      <span className="text-on-surface-variant">{b.count}</span>
                    </div>
                    <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full" style={{ width: `${(b.count / max) * 100}%`, backgroundColor: b.bucket === "> 12 hours" ? "var(--pulse-coral)" : "var(--module-radiology)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <ShieldAlert size={16} className="text-pulse-coral" /> Radiology Alerts
          </h2>
          {d.alerts.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No active alerts.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {d.alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">
                  <span>{alertSeverityMeta[a.severity].icon}</span>
                  <span className="text-sm text-on-surface flex-1">{a.text}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Today's Worklist</h2>
          {worklist.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-6 text-center">No scheduled, checked-in, or in-progress studies right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Study</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Room</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Technologist</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                    <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {worklist.map((o) => {
                    const priority = imagingPriorityMeta[o.priority];
                    const status = imagingOrderStatusMeta[o.status];
                    return (
                      <tr key={o.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => setSelectedOrderId(o.id)}>
                        <td className="py-2.5 pr-3">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                            {priority.label}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 font-medium text-on-surface">{o.patientName}</td>
                        <td className="py-2.5 pr-3 text-on-surface-variant">{o.studyName}</td>
                        <td className="py-2.5 pr-3 text-on-surface-variant">{o.roomNumber ?? "—"}</td>
                        <td className="py-2.5 pr-3 text-on-surface-variant">{o.technologistName ?? "—"}</td>
                        <td className="py-2.5 pr-3 text-on-surface-variant">{o.scheduledDateTime ? formatDateTime(o.scheduledDateTime) : "—"}</td>
                        <td className="py-2.5">
                          <StatusChip tone="neutral">
                            <span style={{ color: status.color }}>{status.label}</span>
                          </StatusChip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }
  return (
    <HospitalAdminLayout active="Radiology">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--module-radiology) 14%, transparent)", color: "var(--module-radiology)" }}>
          <ScanLine size={18} />
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

      {tab === "dashboard" && renderDashboardTab(dashboard, worklistOrders)}

      {tab === "orders" && (
        <ImagingOrdersPanel
          orders={orders}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSelect={setSelectedOrderId}
        />
      )}

      {tab === "scheduling" && (
        <SchedulingPanel readyToSchedule={readyToSchedule} scheduled={scheduledOrders} onSchedule={(o) => setScheduleTarget(o)} onView={(o) => setSelectedOrderId(o.id)} />
      )}

      {tab === "worklist" && (
        <RadiologyWorklistPanel
          orders={worklistOrders}
          onCheckIn={(o) => handleQuickAction(() => api.checkInImagingOrder(o.id, currentUserName))}
          onStart={(o) => handleQuickAction(() => api.startImagingStudy(o.id, currentUserName))}
          onComplete={(o) => handleQuickAction(() => api.completeImagingStudy(o.id, currentUserName))}
          onView={(o) => setSelectedOrderId(o.id)}
        />
      )}

      {tab === "studies" && <ImagingStudiesPanel studies={studies} search={studySearch} onSearchChange={setStudySearch} onSelect={setSelectedStudyId} />}

      {tab === "reports" && (
        <RadiologyReportsPanel
          reports={reports}
          counts={reportCounts}
          statusFilter={reportStatusFilter}
          onStatusFilterChange={setReportStatusFilter}
          search={reportSearch}
          onSearchChange={setReportSearch}
          onSelect={setSelectedReportId}
        />
      )}

      {tab === "critical" && (
        <RadiologyCriticalFindingsPanel findings={criticalFindings} showAll={showAllCritical} onToggleShowAll={setShowAllCritical} onAcknowledge={(f) => setAcknowledgeTarget(f)} />
      )}

      {tab === "modalities" && <ModalitiesPanel modalities={modalities} onAdd={openAddModality} onEdit={openEditModality} onSetStatus={handleSetModalityStatus} />}

      {tab === "rooms" && <RoomsPanel rooms={roomsList} onAdd={openAddRoom} onEdit={openEditRoom} onToggleStatus={handleToggleRoomStatus} />}

      {tab === "radiologists" && <RadiologistsPanel radiologists={radiologistsList} onSelect={setSelectedRadiologist} />}

      {tab === "technologists" && <TechnologistsPanel technologists={technologistsList} />}

      {tab === "procedures" && (
        <ProceduresPanel procedures={procedures} protocols={protocols} onAdd={openAddProcedure} onEdit={openEditProcedure} onToggleActive={handleToggleProcedureActive} onAddProtocol={() => setProtocolFormOpen(true)} />
      )}

      {tab === "equipment" && <EquipmentPanel equipment={equipment} maintenance={maintenance} onLogMaintenance={handleLogMaintenance} />}

      {tab === "integrations" && <IntegrationsPanel summary={pacsSummary} studies={pacsStatusList} integrations={integrations} onRetry={handleRetryPacsTransfer} />}

      {tab === "billing" && <RadiologyBillingPanel billing={radiologyBilling} insuranceQueue={insuranceQueue} search={billingSearch} onSearchChange={setBillingSearch} />}

      {tab === "analytics" && <RadiologyAnalyticsPanel data={analytics} />}

      {tab === "audit" && <RadiologyAuditPanel entries={auditLog} search={auditSearch} onSearchChange={setAuditSearch} entityFilter={auditEntityFilter} onEntityFilterChange={setAuditEntityFilter} />}

      {tab === "settings" && (
        <RadiologySettingsPanel settings={settings} onGoToModalities={() => setTab("modalities")} onGoToRooms={() => setTab("rooms")} onGoToProcedures={() => setTab("procedures")} />
      )}

      <ImagingOrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onAuthorize={() => selectedOrder && setAuthorizeTarget(selectedOrder)}
        onSchedule={() => selectedOrder && setScheduleTarget(selectedOrder)}
        onCheckIn={() => selectedOrder && handleQuickAction(() => api.checkInImagingOrder(selectedOrder.id, currentUserName))}
        onStartStudy={() => selectedOrder && handleQuickAction(() => api.startImagingStudy(selectedOrder.id, currentUserName))}
        onCompleteStudy={() => selectedOrder && handleQuickAction(() => api.completeImagingStudy(selectedOrder.id, currentUserName))}
        onNoShow={() => selectedOrder && handleQuickAction(() => api.markImagingNoShow(selectedOrder.id, currentUserName))}
        onHold={() => selectedOrder && setHoldTarget(selectedOrder)}
        onReleaseHold={() => selectedOrder && handleQuickAction(() => api.releaseImagingOrderHold(selectedOrder.id, currentUserName))}
        onCancel={() => selectedOrder && setCancelTarget(selectedOrder)}
      />

      <AuthorizeImagingOrderDrawer order={authorizeTarget} onClose={() => setAuthorizeTarget(null)} onComplete={refreshAllAfterMutation} />
      <CancelImagingOrderDrawer order={cancelTarget} onClose={() => setCancelTarget(null)} onComplete={refreshAllAfterMutation} />
      <HoldImagingOrderDrawer order={holdTarget} onClose={() => setHoldTarget(null)} onComplete={refreshAllAfterMutation} />
      <ScheduleImagingOrderDrawer order={scheduleTarget} onClose={() => setScheduleTarget(null)} onComplete={refreshAllAfterMutation} rooms={rooms} technologists={technologists} radiologists={radiologists} />

      <ImagingStudyDetailsDrawer study={selectedStudy} onClose={() => setSelectedStudyId(null)} />
      <RadiologyReportDetailsDrawer report={selectedReport} onClose={() => setSelectedReportId(null)} />
      <AcknowledgeRadiologyCriticalFindingDrawer
        finding={acknowledgeTarget}
        onClose={() => setAcknowledgeTarget(null)}
        onComplete={() => {
          refreshCritical();
          refreshDashboard();
          refreshAudit();
        }}
        currentUserName={currentUserName}
      />

      <ModalityFormDrawer open={modalityFormOpen} onClose={() => setModalityFormOpen(false)} onSubmit={handleModalitySubmit} initialValues={editingModality ?? undefined} rooms={rooms} />
      <RoomFormDrawer open={roomFormOpen} onClose={() => setRoomFormOpen(false)} onSubmit={handleRoomSubmit} initialValues={editingRoom ?? undefined} modalities={modalities} technologists={technologists} />
      <RadiologistDetailDrawer radiologist={selectedRadiologist} onClose={() => setSelectedRadiologist(null)} />

      <ProcedureFormDrawer open={procedureFormOpen} onClose={() => setProcedureFormOpen(false)} onSubmit={handleProcedureSubmit} initialValues={editingProcedure ?? undefined} />
      <ProtocolFormDrawer open={protocolFormOpen} onClose={() => setProtocolFormOpen(false)} onSubmit={handleProtocolSubmit} procedures={procedures.filter((p) => p.active)} />
    </HospitalAdminLayout>
  );
}
