import { useEffect, useState } from "react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { LabDashboardOverview } from "@modules/hospital-admin/components/laboratory/LabDashboardOverview";
import { LabOrdersPanel } from "@modules/hospital-admin/components/laboratory/LabOrdersPanel";
import { LabOrderDetailsDrawer } from "@modules/hospital-admin/components/laboratory/LabOrderDetailsDrawer";
import { CaptureLabOrderDrawer } from "@modules/hospital-admin/components/laboratory/CaptureLabOrderDrawer";
import { CancelLabOrderDrawer } from "@modules/hospital-admin/components/laboratory/CancelLabOrderDrawer";
import { LabCriticalResultsPanel } from "@modules/hospital-admin/components/laboratory/LabCriticalResultsPanel";
import { AcknowledgeCriticalAlertDrawer } from "@modules/hospital-admin/components/laboratory/AcknowledgeCriticalAlertDrawer";
import { LabTestCatalogConfigPanel } from "@modules/hospital-admin/components/laboratory/LabTestCatalogConfigPanel";
import { LabTestCatalogFormDrawer } from "@modules/hospital-admin/components/laboratory/LabTestCatalogFormDrawer";
import { LabAnalyticsPanel } from "@modules/hospital-admin/components/laboratory/LabAnalyticsPanel";
import { LabAuditLogPanel } from "@modules/hospital-admin/components/laboratory/LabAuditLogPanel";
import * as api from "@modules/hospital-admin/api";
import type {
  LabDashboardData,
  LabOrderRow,
  LabOrderDetail,
  LabOrderStatus,
  LabOrderPriority,
  LabTestCatalogEntry,
  NewLabTestCatalogInput,
  LabCriticalAlertRow,
  LabAnalyticsData,
  LabAuditEvent,
  DepartmentDirectoryRow,
} from "@modules/hospital-admin/api";

type Tab = "dashboard" | "orders" | "critical" | "catalog" | "analytics" | "audit";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Laboratory", subtitle: "Hospital-wide lab volume, turnaround, and status at a glance." },
  orders: { label: "Orders", title: "Lab Orders", subtitle: "Every ServiceRequest — search, filter, and drill into a full result view." },
  critical: { label: "Critical Results", title: "Critical Results", subtitle: "Values requiring escalation — acknowledgment only, never result entry." },
  catalog: { label: "Test Catalog", title: "Test Catalog", subtitle: "The configurable, LOINC-coded test lookup every order draws from." },
  analytics: { label: "Analytics", title: "Lab Analytics", subtitle: "Turnaround-time compliance, rejection rate, and category volume." },
  audit: { label: "Audit", title: "Lab Audit Log", subtitle: "Every administrative action taken in this section, traceable." },
};

/**
 * Laboratory — Hospital Admin's [oversight] section (HOSPITAL_ADMIN_MODULE_MAP.md).
 * FHIR-aligned per HMS_DOMAIN_STANDARDS.md §22-26: ServiceRequest/Specimen/
 * Observation/DiagnosticReport. View-only for results; the only mutations are
 * genuinely administrative (order capture/cancel, critical acknowledgment) —
 * result entry belongs to the not-yet-built `laboratory` portal, not here.
 */
export function LaboratoryManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<LabDashboardData | null>(null);
  const [orders, setOrders] = useState<LabOrderRow[]>([]);
  const [catalog, setCatalog] = useState<LabTestCatalogEntry[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<LabCriticalAlertRow[]>([]);
  const [analytics, setAnalytics] = useState<LabAnalyticsData | null>(null);
  const [auditEvents, setAuditEvents] = useState<LabAuditEvent[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [departments, setDepartments] = useState<DepartmentDirectoryRow[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LabOrderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<LabOrderPriority | "all">("all");
  const [showAllCritical, setShowAllCritical] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LabOrderDetail | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<LabOrderRow | null>(null);
  const [acknowledgeTarget, setAcknowledgeTarget] = useState<LabCriticalAlertRow | null>(null);
  const [catalogFormOpen, setCatalogFormOpen] = useState(false);
  const [editingCatalogEntry, setEditingCatalogEntry] = useState<(NewLabTestCatalogInput & { id: string }) | null>(null);

  function refreshDashboard() {
    api.getLabDashboard().then(setDashboard);
  }
  function refreshOrders() {
    api.getLabOrders({ status: statusFilter === "all" ? undefined : statusFilter, priority: priorityFilter === "all" ? undefined : priorityFilter, search }).then(setOrders);
  }
  function refreshCatalog() {
    api.getLabTestCatalog({ includeInactive: true }).then(setCatalog);
  }
  function refreshCritical() {
    api.getLabCriticalAlerts().then(setCriticalAlerts);
  }
  function refreshAnalytics() {
    api.getLabAnalytics().then(setAnalytics);
  }
  function refreshAudit() {
    api.getLabAuditLog({ action: auditActionFilter === "all" ? undefined : auditActionFilter }).then(setAuditEvents);
  }

  useEffect(() => {
    refreshDashboard();
    refreshCatalog();
    refreshCritical();
    refreshAnalytics();
    api.getDepartmentDirectory().then(setDepartments);
    api.getStaffMembers().then((staff) => setDoctors(staff.filter((s) => s.role === "doctor").map((s) => ({ id: s.id, name: s.name }))));
  }, []);

  useEffect(() => {
    refreshOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    refreshAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditActionFilter]);

  useEffect(() => {
    if (selectedOrderId) {
      api.getLabOrder(selectedOrderId).then(setSelectedOrder);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderId]);

  function refreshAllAfterMutation() {
    refreshDashboard();
    refreshOrders();
    refreshCritical();
    refreshAnalytics();
    refreshAudit();
    if (selectedOrderId) api.getLabOrder(selectedOrderId).then(setSelectedOrder);
  }

  function openAddCatalogEntry() {
    setEditingCatalogEntry(null);
    setCatalogFormOpen(true);
  }

  async function handleCatalogSubmit(values: NewLabTestCatalogInput) {
    if (editingCatalogEntry) {
      await api.updateLabTestCatalogEntry(editingCatalogEntry.id, values);
    } else {
      await api.createLabTestCatalogEntry(values);
    }
    refreshCatalog();
  }

  async function handleToggleCatalogActive(entry: LabTestCatalogEntry) {
    await api.setLabTestCatalogActive(entry.id, !entry.active);
    refreshCatalog();
  }

  async function handleAcknowledgeComplete() {
    refreshAllAfterMutation();
  }

  const auditActionOptions = Array.from(new Set(auditEvents.map((e) => e.action)));

  return (
    <HospitalAdminLayout active="Laboratory">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">{tabMeta[tab].title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{tabMeta[tab].subtitle}</p>
        </div>
      </div>

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

      {tab === "dashboard" && dashboard && <LabDashboardOverview data={dashboard} />}

      {tab === "orders" && (
        <LabOrdersPanel
          orders={orders}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSelect={setSelectedOrderId}
          onCapture={() => setCaptureOpen(true)}
        />
      )}

      {tab === "critical" && (
        <LabCriticalResultsPanel alerts={criticalAlerts} showAll={showAllCritical} onToggleShowAll={setShowAllCritical} onAcknowledge={setAcknowledgeTarget} />
      )}

      {tab === "catalog" && (
        <LabTestCatalogConfigPanel
          catalog={catalog}
          onAdd={openAddCatalogEntry}
          onEdit={(entry) => {
            setEditingCatalogEntry({
              id: entry.id,
              code: entry.code,
              name: entry.name,
              category: entry.category,
              specimenType: entry.specimenType,
              unit: entry.unit,
              referenceRangeText: entry.referenceRangeText,
              refLow: entry.refLow,
              refHigh: entry.refHigh,
              criticalLow: entry.criticalLow,
              criticalHigh: entry.criticalHigh,
              turnaroundTimeHours: entry.turnaroundTimeHours,
            });
            setCatalogFormOpen(true);
          }}
          onToggleActive={handleToggleCatalogActive}
        />
      )}

      {tab === "analytics" && analytics && <LabAnalyticsPanel data={analytics} />}

      {tab === "audit" && (
        <LabAuditLogPanel events={auditEvents} actionFilter={auditActionFilter} onActionFilterChange={setAuditActionFilter} actionOptions={auditActionOptions} />
      )}

      <LabOrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onCancel={() => {
          if (selectedOrder) setCancelTarget(selectedOrder);
        }}
      />

      <CaptureLabOrderDrawer
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onComplete={refreshAllAfterMutation}
        catalog={catalog.filter((c) => c.active)}
        practitioners={doctors}
        departments={departments}
      />

      <CancelLabOrderDrawer
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onComplete={() => {
          refreshAllAfterMutation();
          setSelectedOrderId(null);
        }}
        currentUserName={currentUserName}
      />

      <AcknowledgeCriticalAlertDrawer alert={acknowledgeTarget} onClose={() => setAcknowledgeTarget(null)} onComplete={handleAcknowledgeComplete} currentUserName={currentUserName} />

      <LabTestCatalogFormDrawer open={catalogFormOpen} onClose={() => setCatalogFormOpen(false)} onSubmit={handleCatalogSubmit} initialValues={editingCatalogEntry ?? undefined} />
    </HospitalAdminLayout>
  );
}
