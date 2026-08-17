import { useEffect, useRef, useState } from "react";
import { Siren } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { EmergencyDashboardPanel } from "@modules/hospital-admin/components/emergency/EmergencyDashboardPanel";
import { EmergencyQueuePanel } from "@modules/hospital-admin/components/emergency/EmergencyQueuePanel";
import { EmergencyVisitDetailDrawer } from "@modules/hospital-admin/components/emergency/EmergencyVisitDetailDrawer";
import { RegisterVisitDrawer } from "@modules/hospital-admin/components/emergency/RegisterVisitDrawer";
import { TriagePanel } from "@modules/hospital-admin/components/emergency/TriagePanel";
import { TriageFormDrawer } from "@modules/hospital-admin/components/emergency/TriageFormDrawer";
import { TreatmentPanel } from "@modules/hospital-admin/components/emergency/TreatmentPanel";
import { ClinicalAssessmentDrawer } from "@modules/hospital-admin/components/emergency/ClinicalAssessmentDrawer";
import { OrdersPanel } from "@modules/hospital-admin/components/emergency/OrdersPanel";
import { OrderFormDrawer } from "@modules/hospital-admin/components/emergency/OrderFormDrawer";
import { ResultsPanel } from "@modules/hospital-admin/components/emergency/ResultsPanel";
import { ObservationPanel } from "@modules/hospital-admin/components/emergency/ObservationPanel";
import { ObservationFormDrawer } from "@modules/hospital-admin/components/emergency/ObservationFormDrawer";
import { DispositionPanel } from "@modules/hospital-admin/components/emergency/DispositionPanel";
import { DischargeFormDrawer } from "@modules/hospital-admin/components/emergency/DischargeFormDrawer";
import { AdmissionFormDrawer } from "@modules/hospital-admin/components/emergency/AdmissionFormDrawer";
import { TransferFormDrawer } from "@modules/hospital-admin/components/emergency/TransferFormDrawer";
import { EmergencyReportsPanel } from "@modules/hospital-admin/components/emergency/EmergencyReportsPanel";
import { EmergencyAuditPanel } from "@modules/hospital-admin/components/emergency/EmergencyAuditPanel";
import * as api from "@modules/hospital-admin/api";
import type {
  EmergencyDashboardData,
  EmergencyQueueRow,
  EmergencyVisitStatus,
  EmergencyOrderType,
  EmergencyObservationStatus,
  EmergencyAuditEntityType,
  NewEmergencyVisitInput,
  PerformTriageInput,
  SaveClinicalAssessmentInput,
  NewEmergencyOrderInput,
  NewObservationInput,
  RecordDischargeInput,
  RequestAdmissionInput,
  RequestTransferInput,
} from "@modules/hospital-admin/api";

type Tab = "dashboard" | "queue" | "triage" | "treatment" | "orders" | "results" | "observation" | "disposition" | "reports" | "audit";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Emergency Department", subtitle: "Arrival to disposition — the real-time operational status right now." },
  queue: { label: "Patient Queue", title: "Emergency Patient Queue", subtitle: "Every active ED patient, priority-sorted — strong visual indicators, never color alone." },
  triage: { label: "Triage", title: "Triage", subtitle: "Registration -> Triage -> Priority -> Emergency Area -> Doctor." },
  treatment: { label: "Treatment", title: "Doctor Workspace", subtitle: "My Emergency Patients — clinical assessment and orders in one place." },
  orders: { label: "Orders", title: "Emergency Orders", subtitle: "Laboratory / Radiology / Medication / Procedure / Consultation / Monitoring — one unified tracker." },
  results: { label: "Lab & Radiology Results", title: "Lab & Radiology Results", subtitle: "Reads the real Laboratory and Radiology modules — never a second results store." },
  observation: { label: "Observation", title: "Emergency Observation", subtitle: "Patients who don't immediately need admission or discharge." },
  disposition: { label: "Disposition", title: "Disposition", subtitle: "Discharge / Admission / Transfer — admission creates a real Bed Management request." },
  reports: { label: "Reports", title: "Emergency Reports", subtitle: "Operational, capacity, and clinical/quality indicators, computed from real records." },
  audit: { label: "Audit", title: "Audit Log", subtitle: "Every workflow action this section owns." },
};

const doctorOptions = api.staffMembers.filter((s) => s.role === "doctor" && s.department === "Emergency").map((s) => ({ id: s.id, name: s.name }));
const nurseOptions = api.staffMembers.filter((s) => s.role === "nurse" && s.department === "Emergency").map((s) => ({ id: s.id, name: s.name }));
const edStaffOptions = [...doctorOptions, ...nurseOptions];
const patientOptions = api.patientSeeds.map((p) => ({ id: p.id, fullName: p.fullName }));
const departmentOptions = api.departmentConfigs.filter((d) => d.active).map((d) => ({ id: d.id, name: d.name }));

/**
 * Emergency Department — MVP scope per EMERGENCY_MODULE_SPEC.md's own
 * explicit "don't build every screen immediately, start with these 10"
 * instruction (a narrower pass than OT/Pharmacy/Inventory's "do it all").
 * Upgraded from the prior [oversight]-only placeholder the same way
 * Radiology/OT/Pharmacy/Inventory were, since the user's own spec explicitly
 * asks for the full clinical workflow. Lab-type orders and Admission
 * genuinely write into the real Laboratory and Bed Management modules;
 * Results reads real Laboratory/Radiology data — never a duplicate system.
 */
export function EmergencyManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";
  const currentActorId = edStaffOptions[0]?.id ?? "nadia-farhan";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<EmergencyDashboardData | null>(null);

  const [queueRows, setQueueRows] = useState<EmergencyQueueRow[]>([]);
  const [queueSearch, setQueueSearch] = useState("");
  const [queueStatusFilter, setQueueStatusFilter] = useState<EmergencyVisitStatus | "active">("active");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Awaited<ReturnType<typeof api.getEmergencyVisitDetail>>>(null);
  const [registerFormOpen, setRegisterFormOpen] = useState(false);

  const [triageCategories, setTriageCategories] = useState<Awaited<ReturnType<typeof api.getTriageCategories>>>([]);
  const [areas, setAreas] = useState<Awaited<ReturnType<typeof api.getEmergencyAreas>>>([]);
  const [triageQueue, setTriageQueue] = useState<EmergencyQueueRow[]>([]);
  const [triageTarget, setTriageTarget] = useState<EmergencyQueueRow | null>(null);

  const [doctorId, setDoctorId] = useState(doctorOptions[0]?.id ?? "");
  const [workspaceRows, setWorkspaceRows] = useState<Awaited<ReturnType<typeof api.getDoctorWorkspace>>>([]);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessmentVisitId, setAssessmentVisitId] = useState<string | null>(null);
  const [assessmentExisting, setAssessmentExisting] = useState<Awaited<ReturnType<typeof api.getClinicalAssessment>>>(null);

  const [orders, setOrders] = useState<Awaited<ReturnType<typeof api.getEmergencyOrders>>>([]);
  const [orderTypeFilter, setOrderTypeFilter] = useState<EmergencyOrderType | "all">("all");
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [orderFormVisitId, setOrderFormVisitId] = useState<string | null>(null);

  const [labResults, setLabResults] = useState<Awaited<ReturnType<typeof api.getEmergencyLabResults>>>([]);
  const [imagingResults, setImagingResults] = useState<Awaited<ReturnType<typeof api.getEmergencyImagingResults>>>([]);
  const [radiologyReports, setRadiologyReports] = useState<Awaited<ReturnType<typeof api.getEmergencyRadiologyReports>>>([]);

  const [observations, setObservations] = useState<Awaited<ReturnType<typeof api.getObservations>>>([]);
  const [observationFormOpen, setObservationFormOpen] = useState(false);
  const [observationVisitId, setObservationVisitId] = useState<string | null>(null);

  const [pendingDispositionVisits, setPendingDispositionVisits] = useState<EmergencyQueueRow[]>([]);
  const [dispositions, setDispositions] = useState<Awaited<ReturnType<typeof api.getDispositions>>>([]);
  const [dischargeVisitId, setDischargeVisitId] = useState<string | null>(null);
  const [admissionVisitId, setAdmissionVisitId] = useState<string | null>(null);
  const [transferVisitId, setTransferVisitId] = useState<string | null>(null);
  const [bedTypes, setBedTypes] = useState<{ id: string; name: string }[]>([]);

  const [reportsData, setReportsData] = useState<Awaited<ReturnType<typeof api.getEmergencyReports>> | null>(null);

  const [auditLog, setAuditLog] = useState<Awaited<ReturnType<typeof api.getEmergencyAuditLog>>>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditEntityFilter, setAuditEntityFilter] = useState<EmergencyAuditEntityType | "all">("all");

  // Self-closing-drawer reopen race guard (same pattern proven in OT/
  // Pharmacy/Inventory): a background refetch of the still-selected visit
  // must never reopen the drawer after onClose() already cleared it.
  const selectedVisitIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedVisitIdRef.current = selectedVisitId;
  }, [selectedVisitId]);

  function refreshDashboard() {
    api.getEmergencyDashboard().then(setDashboard);
  }
  function refreshQueue() {
    api.getEmergencyQueue({ status: queueStatusFilter, search: queueSearch }).then(setQueueRows);
  }
  function refreshTriageQueue() {
    api.getEmergencyQueue({ status: "waiting-triage" }).then(setTriageQueue);
  }
  function refreshWorkspace() {
    if (doctorId) api.getDoctorWorkspace(doctorId).then(setWorkspaceRows);
  }
  function refreshOrders() {
    api.getEmergencyOrders().then((rows) => setOrders(orderTypeFilter === "all" ? rows : rows.filter((o) => o.orderType === orderTypeFilter)));
  }
  function refreshResults() {
    api.getEmergencyLabResults().then(setLabResults);
    api.getEmergencyImagingResults().then(setImagingResults);
    api.getEmergencyRadiologyReports().then(setRadiologyReports);
  }
  function refreshObservations() {
    api.getObservations().then(setObservations);
  }
  function refreshDisposition() {
    api.getEmergencyQueue({ status: "disposition-pending" }).then((disp) =>
      api.getEmergencyQueue({ status: "in-treatment" }).then((treat) => setPendingDispositionVisits([...disp, ...treat]))
    );
    api.getDispositions().then(setDispositions);
  }
  function refreshReports() {
    api.getEmergencyReports().then(setReportsData);
  }
  function refreshAudit() {
    api.getEmergencyAuditLog({ entityType: auditEntityFilter === "all" ? undefined : auditEntityFilter, search: auditSearch }).then(setAuditLog);
  }

  useEffect(() => {
    refreshDashboard();
    refreshQueue();
    refreshTriageQueue();
    api.getTriageCategories().then(setTriageCategories);
    api.getEmergencyAreas().then(setAreas);
    refreshWorkspace();
    refreshOrders();
    refreshResults();
    refreshObservations();
    refreshDisposition();
    refreshReports();
    refreshAudit();
    api.getBedTypes().then((types) => setBedTypes(types.map((t) => ({ id: t.id, name: t.name }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshQueue(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [queueSearch, queueStatusFilter]);
  useEffect(() => { refreshWorkspace(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [doctorId]);
  useEffect(() => { refreshOrders(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [orderTypeFilter]);
  useEffect(() => { refreshAudit(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [auditSearch, auditEntityFilter]);

  useEffect(() => {
    if (selectedVisitId) {
      const id = selectedVisitId;
      api.getEmergencyVisitDetail(id).then((detail) => {
        if (selectedVisitIdRef.current === id) setSelectedVisit(detail);
      });
    } else {
      setSelectedVisit(null);
    }
  }, [selectedVisitId]);

  useEffect(() => {
    if (assessmentVisitId) api.getClinicalAssessment(assessmentVisitId).then(setAssessmentExisting);
    else setAssessmentExisting(null);
  }, [assessmentVisitId]);

  function refreshAllAfterMutation() {
    refreshDashboard();
    refreshQueue();
    refreshTriageQueue();
    refreshWorkspace();
    refreshOrders();
    refreshResults();
    refreshObservations();
    refreshDisposition();
    refreshReports();
    refreshAudit();
    if (selectedVisitId) {
      const id = selectedVisitId;
      api.getEmergencyVisitDetail(id).then((detail) => {
        if (selectedVisitIdRef.current === id) setSelectedVisit(detail);
      });
    }
  }

  async function handleRegister(values: NewEmergencyVisitInput) {
    await api.registerEmergencyVisit(values, currentUserName);
    refreshAllAfterMutation();
  }

  async function handleTriageSubmit(values: PerformTriageInput) {
    await api.performTriage(values);
    refreshAllAfterMutation();
    setTriageTarget(null);
  }

  async function handleAssign(doctorId: string, nurseId: string) {
    if (!selectedVisitId) return;
    await api.assignVisit({ visitId: selectedVisitId, doctorId: doctorId || undefined, nurseId: nurseId || undefined });
    refreshAllAfterMutation();
  }

  async function handleMarkLeft() {
    if (!selectedVisitId) return;
    await api.markLeftWithoutTreatment(selectedVisitId, currentUserName);
    refreshAllAfterMutation();
    setSelectedVisitId(null);
  }

  async function handleAssessmentSubmit(values: SaveClinicalAssessmentInput) {
    await api.saveClinicalAssessment(values);
    refreshAllAfterMutation();
  }

  async function handleOrderSubmit(values: NewEmergencyOrderInput) {
    await api.createEmergencyOrder(values);
    refreshAllAfterMutation();
  }
  async function handleAdvanceOrder(order: { id: string; status: string }) {
    const next: Record<string, string> = { ordered: "accepted", accepted: "in-progress", "in-progress": "completed", completed: "result-available", "result-available": "reviewed" };
    const nextStatus = next[order.status];
    if (!nextStatus) return;
    await api.advanceOrderStatus(order.id, nextStatus as Parameters<typeof api.advanceOrderStatus>[1], currentUserName);
    refreshAllAfterMutation();
  }

  async function handleObservationSubmit(values: NewObservationInput) {
    await api.createObservation(values, currentUserName);
    refreshAllAfterMutation();
  }
  async function handleAddObservationNote(id: string, note: string) {
    await api.addObservationNote(id, note, currentUserName);
    refreshObservations();
  }
  async function handleCompleteObservation(id: string, outcome: EmergencyObservationStatus) {
    await api.completeObservation(id, outcome, currentUserName);
    refreshAllAfterMutation();
  }

  async function handleDischargeSubmit(values: RecordDischargeInput) {
    await api.recordDischarge(values);
    refreshAllAfterMutation();
  }
  async function handleAdmissionSubmit(values: RequestAdmissionInput) {
    await api.requestAdmission(values);
    refreshAllAfterMutation();
  }
  async function handleTransferSubmit(values: RequestTransferInput) {
    await api.requestTransfer(values);
    refreshAllAfterMutation();
  }
  async function handleAdvanceTransfer(id: string) {
    const disposition = dispositions.find((d) => d.id === id);
    if (!disposition) return;
    const nextStatus = disposition.transferStatus === "requested" ? "in-transit" : "completed";
    await api.advanceTransferStatus(id, nextStatus, currentUserName);
    refreshDisposition();
  }

  const dischargeVisit = queueRows.find((r) => r.id === dischargeVisitId) ?? pendingDispositionVisits.find((r) => r.id === dischargeVisitId);
  const admissionVisit = queueRows.find((r) => r.id === admissionVisitId) ?? pendingDispositionVisits.find((r) => r.id === admissionVisitId);
  const transferVisit = queueRows.find((r) => r.id === transferVisitId) ?? pendingDispositionVisits.find((r) => r.id === transferVisitId);
  const assessmentVisit = workspaceRows.find((r) => r.id === assessmentVisitId) ?? queueRows.find((r) => r.id === assessmentVisitId);
  const orderFormVisit = queueRows.find((r) => r.id === orderFormVisitId) ?? workspaceRows.find((r) => r.id === orderFormVisitId);
  const observationVisit = queueRows.find((r) => r.id === observationVisitId);

  return (
    <HospitalAdminLayout active="Emergency">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--pulse-coral) 14%, transparent)", color: "var(--pulse-coral)" }}>
          <Siren size={18} />
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

      {tab === "dashboard" && <EmergencyDashboardPanel data={dashboard} />}

      {tab === "queue" && (
        <EmergencyQueuePanel
          rows={queueRows}
          search={queueSearch}
          onSearchChange={setQueueSearch}
          statusFilter={queueStatusFilter}
          onStatusFilterChange={setQueueStatusFilter}
          triageCategories={triageCategories}
          onSelect={setSelectedVisitId}
          onRegister={() => setRegisterFormOpen(true)}
        />
      )}

      {tab === "triage" && <TriagePanel rows={triageQueue} onTriage={(id) => setTriageTarget(triageQueue.find((r) => r.id === id) ?? null)} />}

      {tab === "treatment" && (
        <TreatmentPanel
          doctorId={doctorId}
          onDoctorChange={setDoctorId}
          doctors={doctorOptions}
          rows={workspaceRows}
          onOpenAssessment={(id) => { setAssessmentVisitId(id); setAssessmentOpen(true); }}
          onOpenOrders={(id) => { setOrderFormVisitId(id); setOrderFormOpen(true); }}
        />
      )}

      {tab === "orders" && (
        <OrdersPanel
          orders={orders}
          typeFilter={orderTypeFilter}
          onTypeFilterChange={setOrderTypeFilter}
          onAdd={() => { setOrderFormVisitId(null); setOrderFormOpen(true); }}
          onAdvance={handleAdvanceOrder}
        />
      )}

      {tab === "results" && <ResultsPanel labOrders={labResults} imagingOrders={imagingResults} radiologyReports={radiologyReports} />}

      {tab === "observation" && (
        <ObservationPanel
          observations={observations}
          onAdd={() => setObservationFormOpen(true)}
          onAddNote={handleAddObservationNote}
          onComplete={handleCompleteObservation}
        />
      )}

      {tab === "disposition" && (
        <DispositionPanel
          pendingVisits={pendingDispositionVisits}
          dispositions={dispositions}
          onDischarge={setDischargeVisitId}
          onAdmit={setAdmissionVisitId}
          onTransfer={setTransferVisitId}
          onAdvanceTransfer={handleAdvanceTransfer}
        />
      )}

      {tab === "reports" && <EmergencyReportsPanel data={reportsData} />}

      {tab === "audit" && (
        <EmergencyAuditPanel entries={auditLog} search={auditSearch} onSearchChange={setAuditSearch} entityFilter={auditEntityFilter} onEntityFilterChange={setAuditEntityFilter} />
      )}

      <EmergencyVisitDetailDrawer
        visit={selectedVisit}
        onClose={() => setSelectedVisitId(null)}
        doctors={doctorOptions}
        nurses={nurseOptions}
        onAssign={handleAssign}
        onMarkLeft={handleMarkLeft}
        onOpenTriage={() => { if (selectedVisit) { setTriageTarget(queueRows.find((r) => r.id === selectedVisit.id) ?? { ...selectedVisit, latestVitals: undefined } as EmergencyQueueRow); setSelectedVisitId(null); } }}
        onOpenTreatment={() => { if (selectedVisit) { setAssessmentVisitId(selectedVisit.id); setAssessmentOpen(true); setSelectedVisitId(null); } }}
      />

      <RegisterVisitDrawer open={registerFormOpen} onClose={() => setRegisterFormOpen(false)} onSubmit={handleRegister} patients={patientOptions} />

      <TriageFormDrawer visit={triageTarget} onClose={() => setTriageTarget(null)} onSubmit={handleTriageSubmit} triageCategories={triageCategories} areas={areas} triageStaffOptions={edStaffOptions} />

      <ClinicalAssessmentDrawer
        open={assessmentOpen}
        visitId={assessmentVisitId}
        visitLabel={assessmentVisit ? `${assessmentVisit.queueNumber} — ${assessmentVisit.patientName}` : undefined}
        existing={assessmentExisting}
        onClose={() => setAssessmentOpen(false)}
        onSubmit={handleAssessmentSubmit}
        authorId={doctorId || currentActorId}
      />

      <OrderFormDrawer
        open={orderFormOpen}
        visitId={orderFormVisitId}
        visitLabel={orderFormVisit ? `${orderFormVisit.queueNumber} — ${orderFormVisit.patientName}` : undefined}
        onClose={() => setOrderFormOpen(false)}
        onSubmit={handleOrderSubmit}
        orderedBy={doctorId || currentActorId}
        visitOptions={queueRows.map((r) => ({ id: r.id, label: `${r.queueNumber} — ${r.patientName}` }))}
      />

      <ObservationFormDrawer
        open={observationFormOpen}
        visitId={observationVisitId}
        visitLabel={observationVisit ? `${observationVisit.queueNumber} — ${observationVisit.patientName}` : undefined}
        onClose={() => setObservationFormOpen(false)}
        onSubmit={handleObservationSubmit}
        doctors={doctorOptions}
        nurses={nurseOptions}
      />

      <DischargeFormDrawer
        open={Boolean(dischargeVisitId)}
        visitId={dischargeVisitId}
        visitLabel={dischargeVisit ? `${dischargeVisit.queueNumber} — ${dischargeVisit.patientName}` : undefined}
        onClose={() => setDischargeVisitId(null)}
        onSubmit={handleDischargeSubmit}
        decidedBy={doctorId || currentActorId}
      />

      <AdmissionFormDrawer
        open={Boolean(admissionVisitId)}
        visitId={admissionVisitId}
        visitLabel={admissionVisit ? `${admissionVisit.queueNumber} — ${admissionVisit.patientName}` : undefined}
        onClose={() => setAdmissionVisitId(null)}
        onSubmit={handleAdmissionSubmit}
        departments={departmentOptions}
        bedTypes={bedTypes}
        decidedBy={doctorId || currentActorId}
      />

      <TransferFormDrawer
        open={Boolean(transferVisitId)}
        visitId={transferVisitId}
        visitLabel={transferVisit ? `${transferVisit.queueNumber} — ${transferVisit.patientName}` : undefined}
        onClose={() => setTransferVisitId(null)}
        onSubmit={handleTransferSubmit}
        decidedBy={doctorId || currentActorId}
      />
    </HospitalAdminLayout>
  );
}
