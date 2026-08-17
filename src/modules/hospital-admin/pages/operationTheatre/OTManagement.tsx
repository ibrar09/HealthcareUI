import { useEffect, useRef, useState } from "react";
import { Scissors, CalendarClock, Activity, CheckCircle2, CalendarCheck, Siren, XCircle, Gauge, Timer, AlertTriangle, ShieldCheck, Stethoscope, Home, ArrowRight } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, KPICard } from "@shared/design-system/components";
import { OTRoomBoard } from "@modules/hospital-admin/components/ot/OTRoomBoard";
import { OTRoomFormDrawer } from "@modules/hospital-admin/components/ot/OTRoomFormDrawer";
import { SurgerySchedulePanel } from "@modules/hospital-admin/components/ot/SurgerySchedulePanel";
import { SurgicalCasesPanel } from "@modules/hospital-admin/components/ot/SurgicalCasesPanel";
import { SurgicalCaseDetailsDrawer } from "@modules/hospital-admin/components/ot/SurgicalCaseDetailsDrawer";
import { SurgeryRequestDrawer } from "@modules/hospital-admin/components/ot/SurgeryRequestDrawer";
import { ScheduleSurgicalCaseDrawer } from "@modules/hospital-admin/components/ot/ScheduleSurgicalCaseDrawer";
import { CancelSurgicalCaseDrawer } from "@modules/hospital-admin/components/ot/CancelSurgicalCaseDrawer";
import { PostponeSurgicalCaseDrawer } from "@modules/hospital-admin/components/ot/PostponeSurgicalCaseDrawer";
import { DelaySurgicalCaseDrawer } from "@modules/hospital-admin/components/ot/DelaySurgicalCaseDrawer";
import { PreOpPanel } from "@modules/hospital-admin/components/ot/PreOpPanel";
import { PreOpCaseDrawer } from "@modules/hospital-admin/components/ot/PreOpCaseDrawer";
import { AnesthesiaPanel } from "@modules/hospital-admin/components/ot/AnesthesiaPanel";
import { IntraOpPanel } from "@modules/hospital-admin/components/ot/IntraOpPanel";
import { IntraOpCaseDrawer } from "@modules/hospital-admin/components/ot/IntraOpCaseDrawer";
import { ProcedureDocumentationDrawer } from "@modules/hospital-admin/components/ot/ProcedureDocumentationDrawer";
import { PostOpPanel } from "@modules/hospital-admin/components/ot/PostOpPanel";
import { RecoveryCaseDrawer } from "@modules/hospital-admin/components/ot/RecoveryCaseDrawer";
import { SurgicalTeamPanel } from "@modules/hospital-admin/components/ot/SurgicalTeamPanel";
import { InstrumentsPanel } from "@modules/hospital-admin/components/ot/InstrumentsPanel";
import { InstrumentSetFormDrawer } from "@modules/hospital-admin/components/ot/InstrumentSetFormDrawer";
import { ConsumablesPanel } from "@modules/hospital-admin/components/ot/ConsumablesPanel";
import { ImplantsPanel } from "@modules/hospital-admin/components/ot/ImplantsPanel";
import { SpecimensPanel } from "@modules/hospital-admin/components/ot/SpecimensPanel";
import { SpecimenDetailDrawer } from "@modules/hospital-admin/components/ot/SpecimenDetailDrawer";
import { OTEquipmentPanel } from "@modules/hospital-admin/components/ot/OTEquipmentPanel";
import { OTEquipmentFormDrawer } from "@modules/hospital-admin/components/ot/OTEquipmentFormDrawer";
import { EmergencyOTPanel } from "@modules/hospital-admin/components/ot/EmergencyOTPanel";
import { CancellationsPanel } from "@modules/hospital-admin/components/ot/CancellationsPanel";
import { DelaysPanel } from "@modules/hospital-admin/components/ot/DelaysPanel";
import { OTReportsPanel } from "@modules/hospital-admin/components/ot/OTReportsPanel";
import { OTSettingsPanel } from "@modules/hospital-admin/components/ot/OTSettingsPanel";
import { OTAuditPanel } from "@modules/hospital-admin/components/ot/OTAuditPanel";
import * as api from "@modules/hospital-admin/api";
import type {
  OTDashboardData,
  OTRoom,
  OTRoomRow,
  OTRoomStatus,
  NewOTRoomInput,
  SurgicalCaseRow,
  SurgicalCaseDetail,
  SurgicalCaseStatus,
  SurgeryPriority,
  NewSurgeryRequestInput,
  SurgicalProcedure,
  SurgicalTeamOption,
  ChecklistItem,
  SafetyChecklistStage,
  SurgicalTeamMemberRow,
  InstrumentSet,
  InstrumentStatus,
  NewInstrumentSetInput,
  ConsumableItem,
  ConsumableUsageRow,
  ImplantItem,
  ImplantUsageRow,
  SpecimenRow,
  OTEquipmentRow,
  OTEquipmentStatus,
  NewOTEquipmentInput,
  CancelledCaseRow,
  PostponedCaseRow,
  DelayedCaseRow,
  OTReportsData,
  OTSettingsData,
  OTAuditEntry,
  OTAuditEntityType,
} from "@modules/hospital-admin/api";
import type { PreOpWorklistRow } from "@modules/hospital-admin/components/ot/PreOpPanel";
import type { AnesthesiaWorklistRow } from "@modules/hospital-admin/components/ot/AnesthesiaPanel";
import type { RecoveryRow } from "@modules/hospital-admin/components/ot/PostOpPanel";

type Tab =
  | "dashboard"
  | "schedule"
  | "cases"
  | "rooms"
  | "preop"
  | "anesthesia"
  | "intraop"
  | "postop"
  | "team"
  | "instruments"
  | "consumables"
  | "implants"
  | "specimens"
  | "equipment"
  | "emergency"
  | "cancellations"
  | "delays"
  | "reports"
  | "settings"
  | "audit";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "OT / Surgery Management", subtitle: "Where every surgical case sits in the lifecycle, right now." },
  schedule: { label: "Surgery Schedule", title: "Today's Surgery Schedule", subtitle: "Every case scheduled for today, across all OT rooms." },
  cases: { label: "Surgical Cases", title: "Surgical Cases", subtitle: "The full case list — standardized lifecycle status, never arbitrary colors." },
  rooms: { label: "OT Rooms", title: "OT Rooms", subtitle: "Room status board and configuration." },
  preop: { label: "Pre-Op", title: "Pre-Operative Dashboard", subtitle: "Consent, checklist, and anesthesia completion — READY FOR OT vs NOT READY, computed live." },
  anesthesia: { label: "Anesthesia", title: "Anesthesia", subtitle: "Anesthesia type, ASA class, and pre-anesthesia assessment status across active cases." },
  intraop: { label: "Intra-Op", title: "Intra-Operative", subtitle: "Live cases from Ready for OT through Surgery in Progress — safety checklist and time tracking." },
  postop: { label: "Post-Op / Recovery", title: "Post-Operative / Recovery", subtitle: "PACU status and the post-op note that hands each patient off to their destination unit." },
  team: { label: "Surgical Team", title: "Surgical Team", subtitle: "Workload roster — read-only, joined off Staff & Workforce." },
  instruments: { label: "Instruments", title: "Instruments", subtitle: "Sterile instrument sets — sterilization status and validity, never just a quantity count." },
  consumables: { label: "Consumables", title: "Consumables", subtitle: "Catalog and per-case usage — every usage feeds inventory, never a second stock system." },
  implants: { label: "Implants", title: "Implants", subtitle: "Serial/lot/UDI-tracked catalog and a permanent traceability log." },
  specimens: { label: "Specimens", title: "Specimens", subtitle: "Specimen → Label → Collection → Pathology — result content stays pathology's own." },
  equipment: { label: "Equipment", title: "Equipment", subtitle: "Per-item technical/service status for OT room equipment." },
  emergency: { label: "Emergency OT", title: "Emergency Surgery", subtitle: "Active emergency cases — same controlled status flow and audit trail as elective ones." },
  cancellations: { label: "Cancellations", title: "Cancellations", subtitle: "Every cancelled or postponed case, with its recorded reason." },
  delays: { label: "Delays", title: "Delays", subtitle: "Every recorded delay, worst first." },
  reports: { label: "Reports", title: "OT Reports", subtitle: "Volume, turnaround, cancellation/emergency rate — computed from real case records." },
  settings: { label: "OT Settings", title: "OT Settings", subtitle: "Configuration overview — edit values on their own screens." },
  audit: { label: "Audit", title: "Audit Log", subtitle: "Every workflow action this section owns — never clinical content." },
};

/**
 * OT / Surgery — full module per OT_MODULE_SPEC.md, all 4 phases. Phase 1
 * (Core UI): OT Dashboard, Surgery Schedule, Surgical Cases, Surgery Case
 * Details, Surgery Request, OT Rooms. Phase 2 (Clinical workflow): Pre-Op,
 * Anesthesia, Intra-Op, Post-Op/Recovery. Phase 3 (Supporting operations):
 * Surgical Team, Instruments, Consumables, Implants, Specimens, Equipment.
 * Phase 4 (Management): Emergency OT, Cancellations, Delays, Reports, OT
 * Settings, Audit. Strictly [oversight]: every field captured is
 * structured/short-form administrative data — never a freeform
 * clinical-narrative editor, and Consumables/Implants/Specimens stay
 * registries + traceability logs, never a second Pharmacy/Inventory system.
 */
export function OTManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<OTDashboardData | null>(null);
  const [todaysSchedule, setTodaysSchedule] = useState<SurgicalCaseRow[]>([]);
  const [cases, setCases] = useState<SurgicalCaseRow[]>([]);
  const [rooms, setRooms] = useState<OTRoom[]>([]);
  const [roomsList, setRoomsList] = useState<OTRoomRow[]>([]);
  const [procedures, setProcedures] = useState<SurgicalProcedure[]>([]);
  const [teamOptions, setTeamOptions] = useState<{ surgeons: SurgicalTeamOption[]; anesthesiologists: SurgicalTeamOption[]; nurses: SurgicalTeamOption[]; technicians: SurgicalTeamOption[] }>({
    surgeons: [],
    anesthesiologists: [],
    nurses: [],
    technicians: [],
  });
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SurgicalCaseStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<SurgeryPriority | "all">("all");

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<SurgicalCaseDetail | null>(null);
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<SurgicalCaseRow | null>(null);
  const [scheduleMode, setScheduleMode] = useState<"schedule" | "reschedule">("schedule");
  const [cancelTarget, setCancelTarget] = useState<SurgicalCaseRow | null>(null);
  const [postponeTarget, setPostponeTarget] = useState<SurgicalCaseRow | null>(null);
  const [delayTarget, setDelayTarget] = useState<SurgicalCaseRow | null>(null);

  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<(NewOTRoomInput & { id: string }) | null>(null);

  const [preOpWorklist, setPreOpWorklist] = useState<PreOpWorklistRow[]>([]);
  const [preOpChecklistTemplate, setPreOpChecklistTemplate] = useState<ChecklistItem[]>([]);
  const [preOpSelectedId, setPreOpSelectedId] = useState<string | null>(null);
  const [preOpSelectedCase, setPreOpSelectedCase] = useState<SurgicalCaseDetail | null>(null);

  const [anesthesiaWorklist, setAnesthesiaWorklist] = useState<AnesthesiaWorklistRow[]>([]);

  const [intraOpCases, setIntraOpCases] = useState<SurgicalCaseRow[]>([]);
  const [safetyChecklistTemplate, setSafetyChecklistTemplate] = useState<Record<SafetyChecklistStage, ChecklistItem[]> | null>(null);
  const [intraOpSelectedId, setIntraOpSelectedId] = useState<string | null>(null);
  const [intraOpSelectedCase, setIntraOpSelectedCase] = useState<SurgicalCaseDetail | null>(null);
  const [procedureDocTarget, setProcedureDocTarget] = useState<SurgicalCaseRow | null>(null);

  const [recoveryCases, setRecoveryCases] = useState<RecoveryRow[]>([]);
  const [recoverySelectedId, setRecoverySelectedId] = useState<string | null>(null);
  const [recoverySelectedCase, setRecoverySelectedCase] = useState<SurgicalCaseDetail | null>(null);

  const [team, setTeam] = useState<SurgicalTeamMemberRow[]>([]);

  const [instrumentSets, setInstrumentSets] = useState<InstrumentSet[]>([]);
  const [instrumentFormOpen, setInstrumentFormOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<(NewInstrumentSetInput & { id: string }) | null>(null);

  const [consumables, setConsumables] = useState<ConsumableItem[]>([]);
  const [consumableUsage, setConsumableUsage] = useState<ConsumableUsageRow[]>([]);

  const [implants, setImplants] = useState<ImplantItem[]>([]);
  const [implantUsage, setImplantUsage] = useState<ImplantUsageRow[]>([]);

  const [specimens, setSpecimens] = useState<SpecimenRow[]>([]);
  const [selectedSpecimen, setSelectedSpecimen] = useState<SpecimenRow | null>(null);

  const [equipment, setEquipment] = useState<OTEquipmentRow[]>([]);
  const [equipmentFormOpen, setEquipmentFormOpen] = useState(false);

  const [emergencyCases, setEmergencyCases] = useState<SurgicalCaseRow[]>([]);
  const [cancelledCases, setCancelledCases] = useState<CancelledCaseRow[]>([]);
  const [postponedCases, setPostponedCases] = useState<PostponedCaseRow[]>([]);
  const [delayedCases, setDelayedCases] = useState<DelayedCaseRow[]>([]);
  const [reportsData, setReportsData] = useState<OTReportsData | null>(null);
  const [otSettings, setOtSettings] = useState<OTSettingsData | null>(null);

  const [auditLog, setAuditLog] = useState<OTAuditEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditEntityFilter, setAuditEntityFilter] = useState<OTAuditEntityType | "all">("all");

  // Pre-Op/Intra-Op/Recovery each perform mutations *and* self-close from
  // the same drawer (unlike the Phase 1 pattern, where Cancel/Postpone/Delay
  // are separate small drawers from the main details view). Without a
  // guard, refreshAllAfterMutation's "refetch the still-selected case"
  // step below closes over the pre-click selected id, so its refetch
  // resolves ~250ms later and pops the drawer back open right after the
  // same action's own onClose() ran. These refs hold the *current* id at
  // promise-resolution time so a since-cleared selection is never reapplied.
  const preOpSelectedIdRef = useRef<string | null>(null);
  const intraOpSelectedIdRef = useRef<string | null>(null);
  const recoverySelectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    preOpSelectedIdRef.current = preOpSelectedId;
  }, [preOpSelectedId]);
  useEffect(() => {
    intraOpSelectedIdRef.current = intraOpSelectedId;
  }, [intraOpSelectedId]);
  useEffect(() => {
    recoverySelectedIdRef.current = recoverySelectedId;
  }, [recoverySelectedId]);

  function refreshDashboard() {
    api.getOTDashboard().then(setDashboard);
  }
  function refreshSchedule() {
    api.getTodaysSurgerySchedule().then(setTodaysSchedule);
  }
  function refreshCases() {
    api.getSurgicalCases({ status: statusFilter === "all" ? undefined : statusFilter, priority: priorityFilter === "all" ? undefined : priorityFilter, search }).then(setCases);
  }
  function refreshRoomsList() {
    api.getOTRoomsList().then(setRoomsList);
  }
  function refreshPreOp() {
    api.getPreOpWorklist().then(setPreOpWorklist);
  }
  function refreshAnesthesia() {
    api.getAnesthesiaWorklist().then(setAnesthesiaWorklist);
  }
  function refreshIntraOp() {
    api.getIntraOpCases().then(setIntraOpCases);
  }
  function refreshRecovery() {
    api.getRecoveryCases().then(setRecoveryCases);
  }
  function refreshTeam() {
    api.getSurgicalTeamRoster().then(setTeam);
  }
  function refreshInstruments() {
    api.getInstrumentSets().then(setInstrumentSets);
  }
  function refreshConsumables() {
    api.getConsumablesCatalog().then(setConsumables);
    api.getConsumableUsage().then(setConsumableUsage);
  }
  function refreshImplants() {
    api.getImplantCatalog().then(setImplants);
    api.getImplantUsageLog().then(setImplantUsage);
  }
  function refreshSpecimens() {
    api.getSpecimens().then(setSpecimens);
  }
  function refreshEquipment() {
    api.getOTEquipment().then(setEquipment);
  }
  function refreshEmergency() {
    api.getEmergencyCases().then(setEmergencyCases);
  }
  function refreshCancellations() {
    api.getCancelledCases().then(setCancelledCases);
    api.getPostponedCases().then(setPostponedCases);
  }
  function refreshDelays() {
    api.getDelayedCases().then(setDelayedCases);
  }
  function refreshReports() {
    api.getOTReports().then(setReportsData);
  }
  function refreshSettings() {
    api.getOTSettings().then(setOtSettings);
  }
  function refreshAudit() {
    api.getOTAuditLog({ entityType: auditEntityFilter === "all" ? undefined : auditEntityFilter, search: auditSearch }).then(setAuditLog);
  }

  useEffect(() => {
    refreshDashboard();
    refreshSchedule();
    refreshRoomsList();
    refreshPreOp();
    refreshAnesthesia();
    refreshIntraOp();
    refreshRecovery();
    refreshTeam();
    refreshInstruments();
    refreshConsumables();
    refreshImplants();
    refreshSpecimens();
    refreshEquipment();
    refreshEmergency();
    refreshCancellations();
    refreshDelays();
    refreshReports();
    refreshSettings();
    api.getOTRooms().then(setRooms);
    api.getSurgicalProcedures().then(setProcedures);
    api.getOTTeamOptions().then(setTeamOptions);
    api.getOTPatientOptions().then(setPatients);
    api.getPreOpChecklistTemplate().then(setPreOpChecklistTemplate);
    api.getSafetyChecklistTemplate().then(setSafetyChecklistTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditSearch, auditEntityFilter]);

  useEffect(() => {
    refreshCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    if (selectedCaseId) api.getSurgicalCase(selectedCaseId).then(setSelectedCase);
    else setSelectedCase(null);
  }, [selectedCaseId]);

  useEffect(() => {
    if (preOpSelectedId) {
      const id = preOpSelectedId;
      api.getSurgicalCase(id).then((detail) => {
        if (preOpSelectedIdRef.current === id) setPreOpSelectedCase(detail);
      });
    } else setPreOpSelectedCase(null);
  }, [preOpSelectedId]);

  useEffect(() => {
    if (intraOpSelectedId) {
      const id = intraOpSelectedId;
      api.getSurgicalCase(id).then((detail) => {
        if (intraOpSelectedIdRef.current === id) setIntraOpSelectedCase(detail);
      });
    } else setIntraOpSelectedCase(null);
  }, [intraOpSelectedId]);

  useEffect(() => {
    if (recoverySelectedId) {
      const id = recoverySelectedId;
      api.getSurgicalCase(id).then((detail) => {
        if (recoverySelectedIdRef.current === id) setRecoverySelectedCase(detail);
      });
    } else setRecoverySelectedCase(null);
  }, [recoverySelectedId]);

  function refreshAllAfterMutation() {
    refreshDashboard();
    refreshSchedule();
    refreshCases();
    refreshRoomsList();
    refreshPreOp();
    refreshAnesthesia();
    refreshIntraOp();
    refreshRecovery();
    refreshTeam();
    refreshEmergency();
    refreshCancellations();
    refreshDelays();
    refreshReports();
    refreshAudit();
    if (selectedCaseId) api.getSurgicalCase(selectedCaseId).then(setSelectedCase);
    if (preOpSelectedId) {
      const id = preOpSelectedId;
      api.getSurgicalCase(id).then((detail) => {
        if (preOpSelectedIdRef.current === id) setPreOpSelectedCase(detail);
      });
    }
    if (intraOpSelectedId) {
      const id = intraOpSelectedId;
      api.getSurgicalCase(id).then((detail) => {
        if (intraOpSelectedIdRef.current === id) setIntraOpSelectedCase(detail);
      });
    }
    if (recoverySelectedId) {
      const id = recoverySelectedId;
      api.getSurgicalCase(id).then((detail) => {
        if (recoverySelectedIdRef.current === id) setRecoverySelectedCase(detail);
      });
    }
  }

  async function handleApprove(id: string) {
    await api.approveSurgicalCase(id, currentUserName);
    refreshAllAfterMutation();
  }

  async function handleNoShow(id: string) {
    await api.markSurgicalCaseNoShow(id, currentUserName);
    refreshAllAfterMutation();
  }

  async function handleNewRequest(values: NewSurgeryRequestInput) {
    await api.createSurgeryRequest(values, currentUserName);
    refreshAllAfterMutation();
  }

  function openScheduleFromRow(c: SurgicalCaseRow, mode: "schedule" | "reschedule") {
    setScheduleMode(mode);
    setScheduleTarget(c);
  }

  function openAddRoom() {
    setEditingRoom(null);
    setRoomFormOpen(true);
  }

  function openEditRoom(r: OTRoomRow) {
    setEditingRoom({ id: r.id, number: r.number, type: r.type, location: r.location, equipment: r.equipment, maintenanceSchedule: r.maintenanceSchedule });
    setRoomFormOpen(true);
  }

  async function handleRoomSubmit(values: NewOTRoomInput) {
    if (editingRoom) await api.updateOTRoom(editingRoom.id, values);
    else await api.createOTRoom(values);
    refreshRoomsList();
    api.getOTRooms().then(setRooms);
    refreshDashboard();
  }

  async function handleSetRoomStatus(r: OTRoomRow, status: OTRoomStatus) {
    await api.setOTRoomStatus(r.id, status);
    refreshRoomsList();
    api.getOTRooms().then(setRooms);
    refreshDashboard();
  }

  function openCompleteSurgery() {
    if (!intraOpSelectedCase) return;
    setProcedureDocTarget(intraOpSelectedCase);
    setIntraOpSelectedId(null);
  }

  async function handleMoveToRecovery() {
    if (!recoverySelectedCase) return;
    await api.moveCaseToRecovery(recoverySelectedCase.id, recoverySelectedCase.icuBedRequirement ? "icu" : "ward", currentUserName);
    refreshAllAfterMutation();
  }

  function openAddInstrument() {
    setEditingInstrument(null);
    setInstrumentFormOpen(true);
  }

  function openEditInstrument(s: InstrumentSet) {
    setEditingInstrument({ id: s.id, setId: s.setId, name: s.name, sterilizationStatus: s.sterilizationStatus, sterilizationExpiry: s.sterilizationExpiry, location: s.location });
    setInstrumentFormOpen(true);
  }

  async function handleInstrumentSubmit(values: NewInstrumentSetInput) {
    if (editingInstrument) await api.updateInstrumentSet(editingInstrument.id, values);
    else await api.createInstrumentSet(values);
    refreshInstruments();
    refreshSettings();
    refreshAudit();
  }

  async function handleSetInstrumentStatus(s: InstrumentSet, status: InstrumentStatus) {
    await api.setInstrumentStatus(s.id, status);
    refreshInstruments();
    refreshAudit();
  }

  async function handleEquipmentSubmit(values: NewOTEquipmentInput) {
    await api.createOTEquipment(values);
    refreshEquipment();
    refreshAudit();
  }

  async function handleSetEquipmentStatus(e: OTEquipmentRow, status: OTEquipmentStatus) {
    await api.setOTEquipmentStatus(e.id, status);
    refreshEquipment();
    refreshAudit();
  }

  function refreshAfterCaseSideEffects() {
    refreshConsumables();
    refreshImplants();
    refreshSpecimens();
  }

  function renderDashboardTab(d: OTDashboardData | null) {
    if (!d) return null;
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard label="Today's Surgeries" value={d.todaysSurgeries} icon={<CalendarClock size={14} />} accentColor="var(--signal-indigo)" />
          <KPICard label="In Progress" value={d.inProgress} icon={<Activity size={14} />} accentColor="var(--pulse-coral)" />
          <KPICard label="Completed" value={d.completed} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
          <KPICard label="Scheduled" value={d.scheduled} icon={<CalendarCheck size={14} />} accentColor="var(--module-radiology)" />
          <KPICard label="Emergency" value={d.emergency} icon={<Siren size={14} />} accentColor="var(--pulse-coral)" />
          <KPICard label="Cancelled" value={d.cancelled} icon={<XCircle size={14} />} accentColor="var(--outline)" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard label="OT Utilization" value={`${d.utilizationPercent}%`} icon={<Gauge size={14} />} accentColor="var(--signal-indigo)" />
          <KPICard label="Avg Duration" value={`${d.averageProcedureDurationMinutes}m`} icon={<Timer size={14} />} accentColor="var(--module-radiology)" />
          <KPICard label="Delayed" value={d.delayedSurgeries} icon={<AlertTriangle size={14} />} accentColor="var(--caution-amber)" />
          <KPICard label="Pending Pre-Op" value={d.pendingPreOpAssessments} icon={<Stethoscope size={14} />} accentColor="var(--caution-amber)" />
          <KPICard label="Pending Anesthesia" value={d.pendingAnesthesiaClearance} icon={<ShieldCheck size={14} />} accentColor="var(--caution-amber)" />
          <KPICard label="PACU Occupancy" value={d.pacuOccupancy} icon={<Home size={14} />} accentColor="var(--module-radiology)" />
        </div>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">OT Room Status</h2>
          <OTRoomBoard rooms={d.rooms} compact />
        </Card>

        <Card hero>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-on-surface">Today's Surgery Schedule</h2>
            <button type="button" onClick={() => setTab("schedule")} className="text-sm font-semibold text-signal-indigo hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {d.todaysSchedule.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-6 text-center">No surgeries scheduled for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Surgeon</th>
                    <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">OT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {d.todaysSchedule.map((c) => (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => setSelectedCaseId(c.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.scheduledDateTime?.slice(11, 16)}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.surgeonName}</td>
                      <td className="py-2.5 text-on-surface-variant">{c.roomNumber ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <HospitalAdminLayout active="Operation Theatre">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--pulse-coral) 14%, transparent)", color: "var(--pulse-coral)" }}>
          <Scissors size={18} />
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

      {tab === "dashboard" && renderDashboardTab(dashboard)}

      {tab === "schedule" && (
        <SurgerySchedulePanel
          cases={todaysSchedule}
          onView={setSelectedCaseId}
          onDelay={(c) => setDelayTarget(c)}
          onReschedule={(c) => openScheduleFromRow(c, "reschedule")}
          onCancel={(c) => setCancelTarget(c)}
        />
      )}

      {tab === "cases" && (
        <SurgicalCasesPanel
          cases={cases}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSelect={setSelectedCaseId}
          onNewRequest={() => setRequestDrawerOpen(true)}
        />
      )}

      {tab === "rooms" && <OTRoomBoard rooms={roomsList} onAdd={openAddRoom} onEdit={openEditRoom} onSetStatus={handleSetRoomStatus} />}

      {tab === "preop" && <PreOpPanel worklist={preOpWorklist} onSelect={setPreOpSelectedId} />}

      {tab === "anesthesia" && <AnesthesiaPanel worklist={anesthesiaWorklist} onSelect={setPreOpSelectedId} />}

      {tab === "intraop" && <IntraOpPanel cases={intraOpCases} onSelect={setIntraOpSelectedId} />}

      {tab === "postop" && <PostOpPanel cases={recoveryCases} onSelect={setRecoverySelectedId} />}

      {tab === "team" && <SurgicalTeamPanel team={team} />}

      {tab === "instruments" && <InstrumentsPanel sets={instrumentSets} onAdd={openAddInstrument} onEdit={openEditInstrument} onSetStatus={handleSetInstrumentStatus} />}

      {tab === "consumables" && <ConsumablesPanel catalog={consumables} usageLog={consumableUsage} />}

      {tab === "implants" && <ImplantsPanel catalog={implants} usageLog={implantUsage} />}

      {tab === "specimens" && <SpecimensPanel specimens={specimens} onSelect={(id) => setSelectedSpecimen(specimens.find((s) => s.id === id) ?? null)} />}

      {tab === "equipment" && <OTEquipmentPanel equipment={equipment} onAdd={() => setEquipmentFormOpen(true)} onSetStatus={handleSetEquipmentStatus} />}

      {tab === "emergency" && <EmergencyOTPanel cases={emergencyCases} onSelect={setSelectedCaseId} />}

      {tab === "cancellations" && <CancellationsPanel cancelled={cancelledCases} postponed={postponedCases} />}

      {tab === "delays" && <DelaysPanel cases={delayedCases} />}

      {tab === "reports" && <OTReportsPanel data={reportsData} />}

      {tab === "settings" && (
        <OTSettingsPanel
          settings={otSettings}
          onGoToRooms={() => setTab("rooms")}
          onGoToInstruments={() => setTab("instruments")}
          onGoToTeam={() => setTab("team")}
          onGoToImplants={() => setTab("implants")}
        />
      )}

      {tab === "audit" && <OTAuditPanel entries={auditLog} search={auditSearch} onSearchChange={setAuditSearch} entityFilter={auditEntityFilter} onEntityFilterChange={setAuditEntityFilter} />}

      <SurgicalCaseDetailsDrawer
        caseDetail={selectedCase}
        onClose={() => setSelectedCaseId(null)}
        onApprove={() => selectedCase && handleApprove(selectedCase.id)}
        onSchedule={() => selectedCase && openScheduleFromRow(selectedCase, "schedule")}
        onReschedule={() => selectedCase && openScheduleFromRow(selectedCase, "reschedule")}
        onDelay={() => selectedCase && setDelayTarget(selectedCase)}
        onCancel={() => selectedCase && setCancelTarget(selectedCase)}
        onPostpone={() => selectedCase && setPostponeTarget(selectedCase)}
        onNoShow={() => selectedCase && handleNoShow(selectedCase.id)}
      />

      <SurgeryRequestDrawer
        open={requestDrawerOpen}
        onClose={() => setRequestDrawerOpen(false)}
        onSubmit={handleNewRequest}
        patients={patients}
        procedures={procedures}
        surgeons={teamOptions.surgeons}
        anesthesiologists={teamOptions.anesthesiologists}
        nurses={teamOptions.nurses}
        technicians={teamOptions.technicians}
      />

      <ScheduleSurgicalCaseDrawer caseRow={scheduleTarget} mode={scheduleMode} onClose={() => setScheduleTarget(null)} onComplete={refreshAllAfterMutation} rooms={rooms} />
      <CancelSurgicalCaseDrawer caseRow={cancelTarget} onClose={() => setCancelTarget(null)} onComplete={refreshAllAfterMutation} />
      <PostponeSurgicalCaseDrawer caseRow={postponeTarget} onClose={() => setPostponeTarget(null)} onComplete={refreshAllAfterMutation} />
      <DelaySurgicalCaseDrawer caseRow={delayTarget} onClose={() => setDelayTarget(null)} onComplete={refreshAllAfterMutation} />

      <OTRoomFormDrawer open={roomFormOpen} onClose={() => setRoomFormOpen(false)} onSubmit={handleRoomSubmit} initialValues={editingRoom ?? undefined} />

      <PreOpCaseDrawer caseDetail={preOpSelectedCase} onClose={() => setPreOpSelectedId(null)} onComplete={refreshAllAfterMutation} checklistTemplate={preOpChecklistTemplate} />

      {safetyChecklistTemplate && (
        <IntraOpCaseDrawer
          caseDetail={intraOpSelectedCase}
          onClose={() => setIntraOpSelectedId(null)}
          onComplete={refreshAllAfterMutation}
          safetyChecklistTemplate={safetyChecklistTemplate}
          onCompleteSurgery={openCompleteSurgery}
        />
      )}

      <ProcedureDocumentationDrawer
        caseRow={procedureDocTarget}
        onClose={() => setProcedureDocTarget(null)}
        onComplete={() => {
          refreshAllAfterMutation();
          refreshAfterCaseSideEffects();
        }}
      />

      <RecoveryCaseDrawer caseDetail={recoverySelectedCase} onClose={() => setRecoverySelectedId(null)} onComplete={refreshAllAfterMutation} onMoveToRecovery={handleMoveToRecovery} />

      <InstrumentSetFormDrawer open={instrumentFormOpen} onClose={() => setInstrumentFormOpen(false)} onSubmit={handleInstrumentSubmit} initialValues={editingInstrument ?? undefined} />

      <OTEquipmentFormDrawer open={equipmentFormOpen} onClose={() => setEquipmentFormOpen(false)} onSubmit={handleEquipmentSubmit} rooms={rooms} />

      <SpecimenDetailDrawer specimen={selectedSpecimen} onClose={() => setSelectedSpecimen(null)} onComplete={refreshSpecimens} />
    </HospitalAdminLayout>
  );
}
