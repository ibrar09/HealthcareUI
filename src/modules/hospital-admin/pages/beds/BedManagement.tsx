import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { BedDashboardOverview } from "@modules/hospital-admin/components/beds/BedDashboardOverview";
import { BedList } from "@modules/hospital-admin/components/beds/BedList";
import { BedMapView } from "@modules/hospital-admin/components/beds/BedMapView";
import { WardStatsCard } from "@modules/hospital-admin/components/beds/WardStatsCard";
import { RoomCard } from "@modules/hospital-admin/components/beds/RoomCard";
import { BedDetailsDrawer, BedQuickAction } from "@modules/hospital-admin/components/beds/BedDetailsDrawer";
import { BedActionDrawer, BedActionMode } from "@modules/hospital-admin/components/beds/BedActionDrawer";
import { BedRequestQueue } from "@modules/hospital-admin/components/beds/BedRequestQueue";
import { AssignRequestDrawer } from "@modules/hospital-admin/components/beds/AssignRequestDrawer";
import { RejectRequestDrawer } from "@modules/hospital-admin/components/beds/RejectRequestDrawer";
import { NewBedRequestDrawer } from "@modules/hospital-admin/components/beds/NewBedRequestDrawer";
import { CleaningQueue } from "@modules/hospital-admin/components/beds/CleaningQueue";
import { IsolationPanel } from "@modules/hospital-admin/components/beds/IsolationPanel";
import { OccupancyAnalytics } from "@modules/hospital-admin/components/beds/OccupancyAnalytics";
import { BedAuditLog } from "@modules/hospital-admin/components/beds/BedAuditLog";
import { BedTypeConfigPanel } from "@modules/hospital-admin/components/beds/BedTypeConfigPanel";
import { BedTypeFormDrawer } from "@modules/hospital-admin/components/beds/BedTypeFormDrawer";
import { RoomConfigPanel } from "@modules/hospital-admin/components/beds/RoomConfigPanel";
import { RoomFormDrawer } from "@modules/hospital-admin/components/beds/RoomFormDrawer";
import { BedFormDrawer } from "@modules/hospital-admin/components/beds/BedFormDrawer";
import { DecommissionBedDrawer } from "@modules/hospital-admin/components/beds/DecommissionBedDrawer";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import * as api from "@modules/hospital-admin/api";
import type {
  BedDashboardData,
  BedListRow,
  WardView,
  RoomView,
  BedTypeConfig,
  BedStatus,
  BedRequestView,
  IsolationBedRow,
  WardOccupancy,
  BedTypeOccupancy,
  BedAuditEvent,
  NewBedTypeInput,
  NewRoomInput,
  NewBedInput,
  UpdateBedConfigInput,
} from "@modules/hospital-admin/api";

type Tab = "dashboard" | "beds" | "map" | "wards" | "rooms" | "requests" | "cleaning" | "isolation" | "analytics" | "audit" | "config";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Bed Management", subtitle: "Hospital-wide bed occupancy, breakdowns, and operational status." },
  beds: { label: "Beds", title: "Bed List", subtitle: "Search and filter every configured bed across the hospital." },
  map: { label: "Bed Map", title: "Bed Map", subtitle: "Visual ward-by-ward, room-by-room bed status layout." },
  wards: { label: "Wards", title: "Wards", subtitle: "Ward-level occupancy, coverage, and nurse station assignment." },
  rooms: { label: "Rooms", title: "Rooms", subtitle: "Room-level capacity, occupancy, and compatibility rules." },
  requests: { label: "Requests", title: "Bed Request Queue", subtitle: "Pending bed requests from clinical staff, ready to assign or reject." },
  cleaning: { label: "Cleaning", title: "Cleaning Queue", subtitle: "Beds awaiting turnaround before they're available again." },
  isolation: { label: "Isolation", title: "Isolation Management", subtitle: "Active isolation precautions and isolation-capable bed inventory." },
  analytics: { label: "Analytics", title: "Occupancy Analytics", subtitle: "Deeper occupancy breakdowns by ward and bed type." },
  audit: { label: "Audit", title: "Bed Audit Log", subtitle: "Hospital-wide, filterable trail of every bed status change." },
  config: { label: "Configuration", title: "Bed Inventory Configuration", subtitle: "Add/edit Bed Types, Rooms, and individual beds — hospital setup, not day-to-day operations." },
};

export function BedManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<BedDashboardData | null>(null);
  const [bedList, setBedList] = useState<BedListRow[]>([]);
  const [wards, setWards] = useState<WardView[]>([]);
  const [rooms, setRooms] = useState<RoomView[]>([]);
  const [bedTypes, setBedTypes] = useState<BedTypeConfig[]>([]);
  const [requests, setRequests] = useState<BedRequestView[]>([]);
  const [staff, setStaff] = useState<Awaited<ReturnType<typeof api.getStaffMembers>>>([]);
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof api.getDepartmentConfigs>>>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BedStatus | "all">("all");
  const [wardFilter, setWardFilter] = useState<string | "all">("all");
  const [bedTypeFilter, setBedTypeFilter] = useState<string | "all">("all");

  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedBed, setSelectedBed] = useState<BedListRow | null>(null);
  const [actionMode, setActionMode] = useState<BedActionMode | null>(null);

  const [assignRequest, setAssignRequest] = useState<BedRequestView | null>(null);
  const [rejectRequest, setRejectRequest] = useState<BedRequestView | null>(null);
  const [newRequestOpen, setNewRequestOpen] = useState(false);

  const [isolationData, setIsolationData] = useState<{
    activeIsolation: IsolationBedRow[];
    totalIsolationCapableRooms: number;
    totalIsolationCapableBeds: number;
    availableIsolationCapableBeds: BedListRow[];
  } | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    overallOccupancyRate: number;
    byWard: WardOccupancy[];
    byBedType: BedTypeOccupancy[];
    genderAvailability: { male: number; female: number };
  } | null>(null);
  const [auditEvents, setAuditEvents] = useState<BedAuditEvent[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState("all");

  const [allBedTypes, setAllBedTypes] = useState<BedTypeConfig[]>([]);
  const [configBeds, setConfigBeds] = useState<BedListRow[]>([]);
  const [bedTypeFormOpen, setBedTypeFormOpen] = useState(false);
  const [editingBedType, setEditingBedType] = useState<(NewBedTypeInput & { id: string }) | null>(null);
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<(NewRoomInput & { id: string }) | null>(null);
  const [bedFormTarget, setBedFormTarget] = useState<{ mode: "add" | "edit"; roomId?: string; roomName?: string; bed?: BedListRow } | null>(null);
  const [decommissionTarget, setDecommissionTarget] = useState<BedListRow | null>(null);

  function refreshAll() {
    api.getBedDashboard().then(setDashboard);
    api.getBedList({ search, status: statusFilter, wardId: wardFilter, bedTypeId: bedTypeFilter }).then(setBedList);
    api.getWards().then(setWards);
    api.getRooms().then(setRooms);
    api.getBedRequests().then(setRequests);
    if (selectedBedId) api.getBed(selectedBedId).then(setSelectedBed);
    api.getIsolationOverview().then(setIsolationData);
    if (tab === "analytics") api.getOccupancyAnalytics().then(setAnalyticsData);
    if (tab === "audit") api.getBedAuditLog().then(setAuditEvents);
    if (tab === "config") {
      api.getBedTypes({ includeInactive: true }).then(setAllBedTypes);
      api.getBedList({}).then(setConfigBeds);
    }
    api.getBedTypes().then(setBedTypes);
  }

  useEffect(() => {
    if (tab === "analytics") api.getOccupancyAnalytics().then(setAnalyticsData);
    else if (tab === "audit") api.getBedAuditLog().then(setAuditEvents);
    else if (tab === "config") {
      api.getBedTypes({ includeInactive: true }).then(setAllBedTypes);
      api.getBedList({}).then(setConfigBeds);
    }
  }, [tab]);

  useEffect(() => {
    api.getBedDashboard().then(setDashboard);
    api.getWards().then(setWards);
    api.getRooms().then(setRooms);
    api.getBedTypes().then(setBedTypes);
    api.getBedRequests().then(setRequests);
    api.getStaffMembers().then(setStaff);
    api.getDepartmentConfigs().then(setDepartments);
    api.getIsolationOverview().then(setIsolationData);
  }, []);

  useEffect(() => {
    api.getBedList({ search, status: statusFilter, wardId: wardFilter, bedTypeId: bedTypeFilter }).then(setBedList);
  }, [search, statusFilter, wardFilter, bedTypeFilter]);

  useEffect(() => {
    if (!selectedBedId) {
      setSelectedBed(null);
      return;
    }
    api.getBed(selectedBedId).then(setSelectedBed);
  }, [selectedBedId]);

  async function handleQuickAction(action: BedQuickAction) {
    if (!selectedBed) return;
    if (action === "release") await api.releaseBed(selectedBed.id, currentUserName);
    else if (action === "cancel-reservation") await api.cancelReservation(selectedBed.id, currentUserName);
    else if (action === "complete-cleaning") await api.completeCleaning(selectedBed.id, currentUserName);
    else if (action === "complete-maintenance") await api.completeMaintenance(selectedBed.id, currentUserName);
    else if (action === "unblock") await api.unblockBed(selectedBed.id, currentUserName);
    else if (action === "return-to-service") await api.returnToService(selectedBed.id, currentUserName);
    else if (action === "clear-isolation") await api.clearIsolation(selectedBed.id, currentUserName);
    refreshAll();
  }

  async function handleBedTypeSubmit(values: NewBedTypeInput) {
    if (editingBedType) await api.updateBedType(editingBedType.id, values);
    else await api.createBedType(values);
    refreshAll();
    api.getBedTypes({ includeInactive: true }).then(setAllBedTypes);
  }

  async function handleToggleBedTypeActive(bt: BedTypeConfig) {
    await api.setBedTypeActive(bt.id, !bt.active);
    refreshAll();
    api.getBedTypes({ includeInactive: true }).then(setAllBedTypes);
  }

  async function handleRoomSubmit(values: NewRoomInput) {
    if (editingRoom) await api.updateRoom(editingRoom.id, values);
    else await api.createRoom(values);
    api.getRooms().then(setRooms);
  }

  async function handleBedFormSubmitAdd(values: NewBedInput) {
    await api.createBed(values, currentUserName);
    api.getBedList({}).then(setConfigBeds);
    refreshAll();
  }

  async function handleBedFormSubmitEdit(values: UpdateBedConfigInput) {
    if (!bedFormTarget?.bed) return;
    await api.updateBedConfig(bedFormTarget.bed.id, values, currentUserName);
    api.getBedList({}).then(setConfigBeds);
    refreshAll();
  }

  async function handleDecommission(bedId: string, reason: string) {
    await api.decommissionBed(bedId, reason, currentUserName);
    api.getBedList({}).then(setConfigBeds);
    refreshAll();
  }

  const bedsByRoom = configBeds.reduce<Record<string, BedListRow[]>>((acc, b) => {
    (acc[b.roomId] ??= []).push(b);
    return acc;
  }, {});

  const statusFilters: { value: BedStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...(Object.keys(bedStatusMeta) as BedStatus[]).map((s) => ({ value: s, label: bedStatusMeta[s].label })),
  ];

  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name }));
  const departmentOptions = departments.map((d) => ({ id: d.id, name: d.name }));
  const cleaningBeds = bedList.filter((b) => b.status === "cleaning");
  const pendingRequestCount = requests.filter((r) => r.status === "pending").length;
  const isolationCount = isolationData?.activeIsolation.length ?? 0;

  return (
    <HospitalAdminLayout active="Beds">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
            <span>Bed Management</span>
            {tab !== "dashboard" && (
              <>
                <span>›</span>
                <span className="text-signal-indigo font-medium">{tabMeta[tab].label}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{tabMeta[tab].title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{tabMeta[tab].subtitle}</p>
        </div>
        {tab === "requests" && (
          <button
            type="button"
            onClick={() => setNewRequestOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
          >
            <Plus size={16} /> New Request
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex gap-2 flex-wrap">
          {(["dashboard", "beds", "map", "wards", "rooms", "requests", "cleaning", "isolation", "analytics", "audit", "config"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {tabMeta[t].label}
              {t === "requests" && pendingRequestCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-pulse-coral px-1 text-[10px] font-bold text-white">
                  {pendingRequestCount}
                </span>
              )}
              {t === "cleaning" && cleaningBeds.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-caution-amber px-1 text-[10px] font-bold text-white">
                  {cleaningBeds.length}
                </span>
              )}
              {t === "isolation" && isolationCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sunset-coral px-1 text-[10px] font-bold text-white">
                  {isolationCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "beds" && (
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bed, patient, MRN, ward, room..."
              className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
            />
          </div>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="bg-white border border-line text-sm rounded-lg px-3 py-2 outline-none focus:border-signal-indigo transition-all"
          >
            <option value="all">All Wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select
            value={bedTypeFilter}
            onChange={(e) => setBedTypeFilter(e.target.value)}
            className="bg-white border border-line text-sm rounded-lg px-3 py-2 outline-none focus:border-signal-indigo transition-all"
          >
            <option value="all">All Bed Types</option>
            {bedTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "dashboard" && dashboard && <BedDashboardOverview data={dashboard} />}

      {tab === "beds" && <div className="pb-8"><BedList rows={bedList} onSelectBed={setSelectedBedId} /></div>}

      {tab === "map" && <BedMapView wards={wards} onSelectBed={setSelectedBedId} />}

      {tab === "wards" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {wards.map((w) => (
            <WardStatsCard key={w.id} ward={w} />
          ))}
        </div>
      )}

      {tab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
      )}

      {tab === "requests" && (
        <div className="pb-8">
          <BedRequestQueue requests={requests} onAssign={(id) => setAssignRequest(requests.find((r) => r.id === id) ?? null)} onReject={(id) => setRejectRequest(requests.find((r) => r.id === id) ?? null)} />
        </div>
      )}

      {tab === "cleaning" && (
        <div className="pb-8">
          <CleaningQueue
            beds={cleaningBeds}
            onComplete={async (bedId) => {
              await api.completeCleaning(bedId, currentUserName);
              refreshAll();
            }}
          />
        </div>
      )}

      {tab === "isolation" && isolationData && <IsolationPanel {...isolationData} onSelectBed={setSelectedBedId} />}

      {tab === "analytics" && analyticsData && <OccupancyAnalytics {...analyticsData} />}

      {tab === "audit" && (
        <BedAuditLog
          events={auditActionFilter === "all" ? auditEvents : auditEvents.filter((e) => e.action === auditActionFilter)}
          actionFilter={auditActionFilter}
          onActionFilterChange={setAuditActionFilter}
          actionOptions={Array.from(new Set(auditEvents.map((e) => e.action))).sort()}
        />
      )}

      {tab === "config" && (
        <div className="flex flex-col gap-6 pb-8">
          <BedTypeConfigPanel
            bedTypes={allBedTypes}
            onAdd={() => {
              setEditingBedType(null);
              setBedTypeFormOpen(true);
            }}
            onEdit={(bt) => {
              setEditingBedType(bt);
              setBedTypeFormOpen(true);
            }}
            onToggleActive={handleToggleBedTypeActive}
          />
          <RoomConfigPanel
            wards={wards}
            rooms={rooms}
            bedsByRoom={bedsByRoom}
            onAddRoom={() => {
              setEditingRoom(null);
              setRoomFormOpen(true);
            }}
            onEditRoom={(room) => {
              setEditingRoom({
                id: room.id,
                wardId: room.wardId,
                name: room.name,
                type: room.type,
                capacity: room.capacity,
                genderRestriction: room.genderRestriction,
                isolationCapable: room.isolationCapable,
                status: room.status,
              });
              setRoomFormOpen(true);
            }}
            onAddBed={(roomId, roomName) => setBedFormTarget({ mode: "add", roomId, roomName })}
            onEditBed={(bed) => setBedFormTarget({ mode: "edit", roomName: bed.roomName, bed })}
            onDecommissionBed={setDecommissionTarget}
          />
        </div>
      )}

      <BedDetailsDrawer
        bed={selectedBed}
        onClose={() => setSelectedBedId(null)}
        onViewPatient={(id) => navigate(ROUTES.HOSPITAL_ADMIN.PATIENT_DETAIL(id))}
        onOpenAction={setActionMode}
        onQuickAction={handleQuickAction}
      />

      <BedActionDrawer
        mode={actionMode}
        bed={selectedBed}
        onClose={() => setActionMode(null)}
        onComplete={refreshAll}
        staffOptions={staffOptions}
        availableBedOptions={bedList.filter((b) => b.status === "available" && b.id !== selectedBed?.id)}
        currentUserName={currentUserName}
      />

      <AssignRequestDrawer request={assignRequest} onClose={() => setAssignRequest(null)} onComplete={refreshAll} staffOptions={staffOptions} currentUserName={currentUserName} />
      <RejectRequestDrawer request={rejectRequest} onClose={() => setRejectRequest(null)} onComplete={refreshAll} />
      <NewBedRequestDrawer
        open={newRequestOpen}
        onClose={() => setNewRequestOpen(false)}
        onComplete={refreshAll}
        bedTypes={bedTypes}
        departmentOptions={departmentOptions}
        staffOptions={staffOptions}
        requestedByStaffId={staffOptions[0]?.id ?? ""}
      />

      <BedTypeFormDrawer
        open={bedTypeFormOpen}
        onClose={() => setBedTypeFormOpen(false)}
        onSubmit={handleBedTypeSubmit}
        initialValues={editingBedType ?? undefined}
      />

      <RoomFormDrawer
        open={roomFormOpen}
        onClose={() => setRoomFormOpen(false)}
        onSubmit={handleRoomSubmit}
        initialValues={editingRoom ?? undefined}
        wardOptions={wards.map((w) => ({ id: w.id, name: w.name }))}
      />

      <BedFormDrawer
        open={Boolean(bedFormTarget)}
        onClose={() => setBedFormTarget(null)}
        mode={bedFormTarget?.mode ?? "add"}
        roomName={bedFormTarget?.roomName}
        roomId={bedFormTarget?.roomId}
        onSubmitAdd={handleBedFormSubmitAdd}
        onSubmitEdit={handleBedFormSubmitEdit}
        initialValues={bedFormTarget?.bed ? { identifier: bedFormTarget.bed.identifier, bedTypeId: bedFormTarget.bed.bedTypeId } : undefined}
        bedTypes={allBedTypes.filter((t) => t.active)}
      />

      <DecommissionBedDrawer bed={decommissionTarget} onClose={() => setDecommissionTarget(null)} onSubmit={handleDecommission} />
    </HospitalAdminLayout>
  );
}
