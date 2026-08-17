import { useEffect, useMemo, useState } from "react";
import { Building2, BedDouble, Users, LayoutGrid, Plus, Search, CheckCircle2, Wrench } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { Card, KPICard } from "@shared/design-system/components";
import { DonutChart } from "@modules/hospital-admin/components/DonutChart";
import { FacilityCard } from "@modules/hospital-admin/components/facilities/FacilityCard";
import { FacilityFormDrawer, FacilityFormValues } from "@modules/hospital-admin/components/facilities/FacilityFormDrawer";
import { DepartmentCard } from "@modules/hospital-admin/components/facilities/DepartmentCard";
import {
  DepartmentFormDrawer,
  DepartmentFormValues,
  categoryMeta,
} from "@modules/hospital-admin/components/facilities/DepartmentFormDrawer";
import { DepartmentDetailDrawer } from "@modules/hospital-admin/components/facilities/DepartmentDetailDrawer";
import { DepartmentTypeConfigPanel } from "@modules/hospital-admin/components/facilities/DepartmentTypeConfigPanel";
import { DepartmentTypeFormDrawer } from "@modules/hospital-admin/components/facilities/DepartmentTypeFormDrawer";
import { AssignDepartmentStaffDrawer } from "@modules/hospital-admin/components/facilities/AssignDepartmentStaffDrawer";
import { AssignDepartmentServicesDrawer } from "@modules/hospital-admin/components/facilities/AssignDepartmentServicesDrawer";
import { AssignDepartmentAppointmentTypesDrawer } from "@modules/hospital-admin/components/facilities/AssignDepartmentAppointmentTypesDrawer";
import { DepartmentWorkingHoursDrawer } from "@modules/hospital-admin/components/facilities/DepartmentWorkingHoursDrawer";
import { ServiceRow } from "@modules/hospital-admin/components/facilities/ServiceRow";
import {
  ServiceFormDrawer,
  ServiceFormValues,
  serviceCategoryMeta,
} from "@modules/hospital-admin/components/facilities/ServiceFormDrawer";
import { WardCard } from "@modules/hospital-admin/components/facilities/WardCard";
import { WardFormDrawer, WardFormValues } from "@modules/hospital-admin/components/facilities/WardFormDrawer";
import { FacilitiesOverviewPanel } from "@modules/hospital-admin/components/facilities/FacilitiesOverviewPanel";
import { MaintenancePanel } from "@modules/hospital-admin/components/facilities/MaintenancePanel";
import { NewWorkOrderDrawer } from "@modules/hospital-admin/components/facilities/NewWorkOrderDrawer";
import { EquipmentPanel } from "@modules/hospital-admin/components/facilities/EquipmentPanel";
import { IncidentsPanel } from "@modules/hospital-admin/components/facilities/IncidentsPanel";
import { NewIncidentDrawer } from "@modules/hospital-admin/components/facilities/NewIncidentDrawer";
import * as api from "@modules/hospital-admin/api";
import type { FacilityWorkOrderStatus, FacilityMaintenancePriority, FacilityEquipmentStatus, FacilityIncidentStatus } from "@modules/hospital-admin/api";

type Facility = Awaited<ReturnType<typeof api.getFacilities>>[number];
type Department = Awaited<ReturnType<typeof api.getDepartmentDirectory>>[number];
type DepartmentType = Awaited<ReturnType<typeof api.getDepartmentTypes>>[number];
type CatalogService = Awaited<ReturnType<typeof api.getCatalogServices>>[number];
type Staff = Awaited<ReturnType<typeof api.getStaffMembers>>[number];
type Ward = Awaited<ReturnType<typeof api.getWards>>[number];
type Floor = Awaited<ReturnType<typeof api.getFloors>>[number];
type Tab = "overview" | "locations" | "departments" | "services" | "beds" | "maintenance" | "equipment" | "incidents";

const activityTone: Record<string, string> = {
  success: "var(--vital-green)",
  warning: "var(--caution-amber)",
  info: "var(--signal-indigo)",
};

const newFacilityAccents = ["var(--signal-indigo)", "var(--vital-green)", "var(--caution-amber)", "var(--sunset-coral)"];

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string; addLabel: string }> = {
  overview: {
    label: "Overview",
    title: "Facilities Overview",
    subtitle: "The physical condition and operational status of the hospital.",
    addLabel: "",
  },
  locations: {
    label: "Locations",
    title: "Facilities",
    subtitle: "Manage and monitor hospital campus locations.",
    addLabel: "Add Facility",
  },
  departments: {
    label: "Departments",
    title: "Department Configuration",
    subtitle: "Configure departments, staffing, and operating status across facilities.",
    addLabel: "Add Department",
  },
  services: {
    label: "Services",
    title: "Service Catalog & Pricing",
    subtitle: "Manage billable procedures, diagnostic tests, and clinical consultations.",
    addLabel: "Add Service",
  },
  beds: {
    label: "Wards & Beds",
    title: "Wards & Bed Inventory",
    subtitle: "Physical bed inventory by ward and room. Admissions and transfers happen in Bed Management.",
    addLabel: "Add Ward",
  },
  maintenance: {
    label: "Maintenance",
    title: "Maintenance & Work Orders",
    subtitle: "Report facility problems and track them through to resolution.",
    addLabel: "Report a Problem",
  },
  equipment: {
    label: "Equipment",
    title: "Facility Equipment",
    subtitle: "Infrastructure equipment — generators, HVAC, elevators, fire alarms, medical gas systems.",
    addLabel: "",
  },
  incidents: {
    label: "Incidents",
    title: "Facility Incidents",
    subtitle: "Something that actually happened — distinct from a routine maintenance request.",
    addLabel: "Report Incident",
  },
};

export function FacilityList() {
  const [tab, setTab] = useState<Tab>("overview");

  const [overviewData, setOverviewData] = useState<Awaited<ReturnType<typeof api.getFacilitiesOverview>> | null>(null);
  const [facilityStatuses, setFacilityStatuses] = useState<Awaited<ReturnType<typeof api.getFacilityStatusOverview>>>([]);

  const [workOrders, setWorkOrders] = useState<Awaited<ReturnType<typeof api.getFacilityWorkOrders>>>([]);
  const [woStatusFilter, setWoStatusFilter] = useState<FacilityWorkOrderStatus | "all">("all");
  const [woPriorityFilter, setWoPriorityFilter] = useState<FacilityMaintenancePriority | "all">("all");
  const [newWorkOrderOpen, setNewWorkOrderOpen] = useState(false);

  const [equipment, setEquipment] = useState<Awaited<ReturnType<typeof api.getFacilityEquipment>>>([]);

  const [incidents, setIncidents] = useState<Awaited<ReturnType<typeof api.getFacilityIncidents>>>([]);
  const [incidentStatusFilter, setIncidentStatusFilter] = useState<FacilityIncidentStatus | "all">("all");
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof api.getFacilityActivity>>>([]);
  const [facilityDrawerOpen, setFacilityDrawerOpen] = useState(false);
  const [editingFacilityIndex, setEditingFacilityIndex] = useState<number | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptDrawerOpen, setDeptDrawerOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<Awaited<ReturnType<typeof api.getDepartment>> | null>(null);

  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [deptTypeFormOpen, setDeptTypeFormOpen] = useState(false);
  const [editingDeptType, setEditingDeptType] = useState<DepartmentType | null>(null);
  const [assignStaffTarget, setAssignStaffTarget] = useState<Awaited<ReturnType<typeof api.getDepartment>> | null>(null);
  const [assignServicesTarget, setAssignServicesTarget] = useState<Awaited<ReturnType<typeof api.getDepartment>> | null>(null);
  const [assignApptTypesTarget, setAssignApptTypesTarget] = useState<Awaited<ReturnType<typeof api.getDepartment>> | null>(null);
  const [workingHoursTarget, setWorkingHoursTarget] = useState<Awaited<ReturnType<typeof api.getDepartment>> | null>(null);
  const [billableServices, setBillableServices] = useState<Awaited<ReturnType<typeof api.getBillableServices>>>([]);
  const [appointmentTypeOptions, setAppointmentTypeOptions] = useState<Awaited<ReturnType<typeof api.getAppointmentTypes>>>([]);

  const [services, setServices] = useState<CatalogService[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

  const [staff, setStaff] = useState<Staff[]>([]);

  const [wards, setWards] = useState<Ward[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [wardDrawerOpen, setWardDrawerOpen] = useState(false);
  const [editingWardIndex, setEditingWardIndex] = useState<number | null>(null);
  const [bedStats, setBedStats] = useState<Awaited<ReturnType<typeof api.getBedStats>> | null>(null);

  function refreshDepartments() {
    api.getDepartmentDirectory().then(setDepartments);
  }

  function refreshOverview() {
    setOverviewData(api.getFacilitiesOverview());
    api.getFacilityStatusOverview().then(setFacilityStatuses);
  }
  function refreshWorkOrders() {
    api.getFacilityWorkOrders({ status: woStatusFilter, priority: woPriorityFilter }).then(setWorkOrders);
  }
  function refreshEquipment() {
    api.getFacilityEquipment().then(setEquipment);
  }
  function refreshIncidents() {
    api.getFacilityIncidents({ status: incidentStatusFilter }).then(setIncidents);
  }

  useEffect(() => {
    api.getFacilities().then(setFacilities);
    api.getFacilityActivity().then(setActivity);
    refreshDepartments();
    api.getDepartmentTypes({ includeInactive: true }).then(setDepartmentTypes);
    api.getCatalogServices().then(setServices);
    api.getStaffMembers().then(setStaff);
    api.getWards().then(setWards);
    api.getFloors().then(setFloors);
    api.getBedStats().then(setBedStats);
    api.getBillableServices().then(setBillableServices);
    api.getAppointmentTypes().then(setAppointmentTypeOptions);
    refreshOverview();
    refreshWorkOrders();
    refreshEquipment();
    refreshIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshWorkOrders(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [woStatusFilter, woPriorityFilter]);
  useEffect(() => { refreshIncidents(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [incidentStatusFilter]);

  useEffect(() => {
    if (!selectedDeptId) {
      setSelectedDept(null);
      return;
    }
    api.getDepartment(selectedDeptId).then(setSelectedDept);
  }, [selectedDeptId]);

  function refreshSelectedDept() {
    if (selectedDeptId) api.getDepartment(selectedDeptId).then(setSelectedDept);
  }

  const totals = facilities.reduce(
    (acc, f) => ({
      beds: acc.beds + f.beds,
      staff: acc.staff + f.staff,
      departments: acc.departments + f.departments,
    }),
    { beds: 0, staff: 0, departments: 0 }
  );

  function openAddFacility() {
    setEditingFacilityIndex(null);
    setFacilityDrawerOpen(true);
  }

  function openManageFacility(index: number) {
    setEditingFacilityIndex(index);
    setFacilityDrawerOpen(true);
  }

  function handleFacilitySubmit(values: FacilityFormValues) {
    if (editingFacilityIndex !== null) {
      setFacilities((prev) =>
        prev.map((f, i) =>
          i === editingFacilityIndex ? { ...f, ...values, occupiedBeds: Math.min(f.occupiedBeds, values.beds) } : f
        )
      );
    } else {
      setFacilities((prev) => [
        ...prev,
        {
          ...values,
          id: `fac-${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${prev.length}`,
          identifier: `FAC-${String(prev.length + 1).padStart(3, "0")}`,
          parentOrganization: "City General Health Network",
          occupiedBeds: 0,
          accentColor: newFacilityAccents[prev.length % newFacilityAccents.length],
        },
      ]);
    }
  }

  function openAddDepartment() {
    setEditingDeptId(null);
    setDeptDrawerOpen(true);
  }

  function openEditDepartment(id: string) {
    // Close the Detail drawer first — both are full-width right-side panels,
    // so leaving the Detail drawer open underneath would stack it directly
    // over the edit form (same fixed position/size) and intercept its clicks.
    setSelectedDeptId(null);
    setEditingDeptId(id);
    setDeptDrawerOpen(true);
  }

  async function handleDepartmentSubmit(values: DepartmentFormValues) {
    if (editingDeptId !== null) {
      await api.updateDepartment(editingDeptId, values);
    } else {
      await api.createDepartment(values);
    }
    refreshDepartments();
    refreshSelectedDept();
  }

  async function handleToggleDeptActive() {
    if (!selectedDept) return;
    await api.setDepartmentActive(selectedDept.id, !selectedDept.active);
    refreshDepartments();
    refreshSelectedDept();
  }

  async function handleAssignStaff(departmentId: string, additionalStaffIds: string[]) {
    await api.assignDepartmentStaff(departmentId, additionalStaffIds);
    refreshDepartments();
    refreshSelectedDept();
  }

  async function handleAssignServices(departmentId: string, serviceCodes: string[]) {
    await api.assignDepartmentServices(departmentId, serviceCodes);
    refreshSelectedDept();
  }

  async function handleAssignApptTypes(departmentId: string, appointmentTypeIds: string[]) {
    await api.assignDepartmentAppointmentTypes(departmentId, appointmentTypeIds);
    refreshSelectedDept();
  }

  async function handleSetWorkingHours(departmentId: string, workingHours: { workingDays: string[]; startTime: string; endTime: string }) {
    await api.setDepartmentWorkingHours(departmentId, workingHours);
    refreshSelectedDept();
  }

  async function handleCreateWorkOrder(input: api.NewFacilityWorkOrderInput) {
    await api.createFacilityWorkOrder(input);
    refreshWorkOrders();
    refreshOverview();
  }
  async function handleAdvanceWorkOrder(id: string, status: FacilityWorkOrderStatus) {
    await api.updateFacilityWorkOrderStatus(id, status);
    refreshWorkOrders();
    refreshOverview();
  }
  async function handleUpdateEquipmentStatus(id: string, status: FacilityEquipmentStatus) {
    await api.updateFacilityEquipmentStatus(id, status);
    refreshEquipment();
    refreshOverview();
  }
  async function handleCreateIncident(input: api.NewFacilityIncidentInput) {
    await api.createFacilityIncident(input);
    refreshIncidents();
    refreshOverview();
  }
  async function handleAdvanceIncident(id: string, status: FacilityIncidentStatus) {
    await api.updateFacilityIncidentStatus(id, status);
    refreshIncidents();
    refreshOverview();
  }

  function openAddDeptType() {
    setEditingDeptType(null);
    setDeptTypeFormOpen(true);
  }

  async function handleDeptTypeSubmit(values: { name: string; description?: string; accentColor: string }) {
    if (editingDeptType) await api.updateDepartmentType(editingDeptType.id, values);
    else await api.createDepartmentType(values);
    api.getDepartmentTypes({ includeInactive: true }).then(setDepartmentTypes);
  }

  async function handleToggleDeptTypeActive(type: DepartmentType) {
    await api.setDepartmentTypeActive(type.id, !type.active);
    api.getDepartmentTypes({ includeInactive: true }).then(setDepartmentTypes);
  }

  function openAddService() {
    setEditingServiceIndex(null);
    setServiceDrawerOpen(true);
  }

  function openManageService(index: number) {
    setEditingServiceIndex(index);
    setServiceDrawerOpen(true);
  }

  function handleServiceSubmit(values: ServiceFormValues) {
    if (editingServiceIndex !== null) {
      setServices((prev) => prev.map((s, i) => (i === editingServiceIndex ? { ...s, ...values } : s)));
    } else {
      setServices((prev) => [...prev, values]);
    }
  }

  function openAddWard() {
    setEditingWardIndex(null);
    setWardDrawerOpen(true);
  }

  function openManageWard(index: number) {
    setEditingWardIndex(index);
    setWardDrawerOpen(true);
  }

  async function handleWardSubmit(values: WardFormValues) {
    if (editingWardIndex !== null) {
      const editing = wards[editingWardIndex];
      await api.updateWard(editing.id, values);
    } else {
      await api.createWard(values);
    }
    api.getWards().then(setWards);
  }

  const editingFacility = editingFacilityIndex !== null ? facilities[editingFacilityIndex] : undefined;
  const editingDeptSource = editingDeptId !== null ? departments.find((d) => d.id === editingDeptId) : undefined;
  const editingDepartment: DepartmentFormValues | undefined = editingDeptSource
    ? {
        facilityId: editingDeptSource.facilityId,
        name: editingDeptSource.name,
        code: editingDeptSource.code,
        category: editingDeptSource.category,
        typeId: editingDeptSource.typeId,
        headDoctorId: editingDeptSource.headDoctorId,
        floorId: editingDeptSource.floorId,
      }
    : undefined;
  const editingService = editingServiceIndex !== null ? services[editingServiceIndex] : undefined;
  const editingWard: WardFormValues | undefined =
    editingWardIndex !== null
      ? {
          facilityId: wards[editingWardIndex].facilityId,
          floorId: wards[editingWardIndex].floorId,
          name: wards[editingWardIndex].name,
          code: wards[editingWardIndex].code,
          type: wards[editingWardIndex].type,
          nurseStation: wards[editingWardIndex].nurseStation,
          departmentId: wards[editingWardIndex].departmentId,
          status: wards[editingWardIndex].status,
        }
      : undefined;

  const filteredServices = services.filter((s) => s.name.toLowerCase().includes(serviceSearch.toLowerCase()));
  const servicesByCategory = (Object.keys(serviceCategoryMeta) as (keyof typeof serviceCategoryMeta)[])
    .map((cat) => ({ cat, items: filteredServices.filter((s) => s.category === cat) }))
    .filter((g) => g.items.length > 0);

  const addAction = {
    overview: undefined,
    locations: openAddFacility,
    departments: openAddDepartment,
    services: openAddService,
    beds: openAddWard,
    maintenance: () => setNewWorkOrderOpen(true),
    equipment: undefined,
    incidents: () => setNewIncidentOpen(true),
  }[tab];

  return (
    <HospitalAdminLayout active="Facilities">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
            <span>Facilities</span>
            {tab !== "overview" && (
              <>
                <span>›</span>
                <span className="text-signal-indigo font-medium">{tabMeta[tab].label}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{tabMeta[tab].title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{tabMeta[tab].subtitle}</p>
        </div>
        {addAction && (
          <button
            type="button"
            onClick={addAction}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
          >
            <Plus size={16} /> {tabMeta[tab].addLabel}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex gap-2 flex-wrap">
          {(["overview", "locations", "departments", "services", "beds", "maintenance", "equipment", "incidents"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {tabMeta[t].label}
            </button>
          ))}
        </div>
        {tab === "services" && (
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-1.5 outline-none focus:border-signal-indigo transition-all"
            />
          </div>
        )}
      </div>

      {tab === "locations" ? (
        <>
          {facilities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
              <KPICard label="Total Facilities" value={facilities.length} icon={<Building2 size={14} />} accentColor="var(--signal-indigo)" />
              <KPICard label="Total Beds" value={totals.beds} icon={<BedDouble size={14} />} accentColor="var(--vital-green)" />
              <KPICard label="Total Staff" value={totals.staff} icon={<Users size={14} />} accentColor="var(--module-radiology)" />
              <KPICard label="Departments" value={totals.departments} icon={<LayoutGrid size={14} />} accentColor="var(--caution-amber)" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {facilities.map((f, i) => (
              <FacilityCard key={f.id} {...f} onManage={() => openManageFacility(i)} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
            <Card hero>
              <h2 className="text-lg font-bold text-on-surface mb-6">Bed Distribution</h2>
              {facilities.some((f) => f.beds > 0) && (
                <div className="flex items-center justify-center">
                  <DonutChart
                    data={facilities.filter((f) => f.beds > 0).map((f) => ({ name: f.name, value: f.beds, color: f.accentColor }))}
                    centerLabel="beds"
                    size={150}
                  />
                </div>
              )}
            </Card>

            <Card hero className="lg:col-span-2">
              <h2 className="text-lg font-bold text-on-surface mb-4">Facility Activity</h2>
              <div className="flex flex-col gap-3">
                {activity.map((a) => (
                  <div key={a.text} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: activityTone[a.tone] }} />
                    <span className="flex-1 text-sm text-on-surface">{a.text}</span>
                    <span className="text-xs text-on-surface-variant flex-shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : tab === "departments" ? (
        <div className="flex flex-col gap-6 pb-8">
          <DepartmentTypeConfigPanel
            departmentTypes={departmentTypes}
            onAdd={openAddDeptType}
            onEdit={(t) => {
              setEditingDeptType(t);
              setDeptTypeFormOpen(true);
            }}
            onToggleActive={handleToggleDeptTypeActive}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((d) => {
              const meta = categoryMeta[d.category];
              return (
                <DepartmentCard
                  key={d.id}
                  name={d.name}
                  code={d.code}
                  headDoctorName={d.headDoctorName}
                  floorName={d.floorName}
                  typeName={d.typeName}
                  typeAccentColor={d.typeAccentColor}
                  totalStaffCount={d.totalStaffCount}
                  active={d.active}
                  operationalStatus={d.operationalStatus}
                  icon={<meta.icon size={20} />}
                  accentColor={meta.accentColor}
                  onSelect={() => setSelectedDeptId(d.id)}
                />
              );
            })}
          </div>
        </div>
      ) : tab === "services" ? (
        <div className="flex flex-col gap-8 pb-8">
          {servicesByCategory.map(({ cat, items }) => {
            const meta = serviceCategoryMeta[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <meta.icon size={14} style={{ color: meta.accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{meta.label}</h2>
                  <div className="flex-1 h-px bg-line" />
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((s) => {
                    const globalIndex = services.indexOf(s);
                    return (
                      <ServiceRow
                        key={s.name}
                        name={s.name}
                        tag={s.tag}
                        code={s.code}
                        meta={s.meta}
                        coverage={s.coverage}
                        price={s.price}
                        accentColor={meta.accentColor}
                        icon={<meta.icon size={18} />}
                        onManage={() => openManageService(globalIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filteredServices.length === 0 && (
            <p className="text-center text-sm text-on-surface-variant py-12">No services match your search.</p>
          )}
        </div>
      ) : tab === "beds" ? (
        <>
          {bedStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
              <KPICard label="Total Beds Configured" value={bedStats.total} icon={<BedDouble size={14} />} accentColor="var(--signal-indigo)" />
              <KPICard label="Available" value={bedStats.available} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
              <KPICard label="Occupied" value={bedStats.occupied} icon={<Users size={14} />} accentColor="var(--module-radiology)" />
              <KPICard label="Out of Service" value={bedStats.outOfService} icon={<Wrench size={14} />} accentColor="var(--pulse-coral)" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {wards.map((w, i) => (
              <WardCard key={w.id} ward={w} onManage={() => openManageWard(i)} />
            ))}
            {wards.length === 0 && (
              <p className="col-span-full text-center text-sm text-on-surface-variant py-12">No wards configured yet.</p>
            )}
          </div>
        </>
      ) : tab === "maintenance" ? (
        <MaintenancePanel
          workOrders={workOrders}
          statusFilter={woStatusFilter}
          onStatusFilterChange={setWoStatusFilter}
          priorityFilter={woPriorityFilter}
          onPriorityFilterChange={setWoPriorityFilter}
          onAdvanceStatus={handleAdvanceWorkOrder}
        />
      ) : tab === "equipment" ? (
        <EquipmentPanel equipment={equipment} onUpdateStatus={handleUpdateEquipmentStatus} />
      ) : tab === "incidents" ? (
        <IncidentsPanel
          incidents={incidents}
          statusFilter={incidentStatusFilter}
          onStatusFilterChange={setIncidentStatusFilter}
          onAdvanceStatus={handleAdvanceIncident}
        />
      ) : (
        <FacilitiesOverviewPanel data={overviewData} statuses={facilityStatuses} />
      )}

      <FacilityFormDrawer
        open={facilityDrawerOpen}
        onClose={() => setFacilityDrawerOpen(false)}
        onSubmit={handleFacilitySubmit}
        initialValues={
          editingFacility
            ? {
                name: editingFacility.name,
                type: editingFacility.type,
                status: editingFacility.status,
                address: editingFacility.address,
                city: editingFacility.city,
                district: editingFacility.district,
                beds: editingFacility.beds,
                staff: editingFacility.staff,
                departments: editingFacility.departments,
                phone: editingFacility.phone,
                email: editingFacility.email,
              }
            : undefined
        }
      />

      <DepartmentFormDrawer
        open={deptDrawerOpen}
        onClose={() => setDeptDrawerOpen(false)}
        onSubmit={handleDepartmentSubmit}
        initialValues={editingDepartment}
        staffOptions={staff.map((s) => ({ id: s.id, name: s.name }))}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
        floorOptions={floors.map((f) => ({ id: f.id, name: f.name }))}
        departmentTypes={departmentTypes.filter((t) => t.active)}
      />

      <DepartmentDetailDrawer
        department={selectedDept}
        onClose={() => setSelectedDeptId(null)}
        onEdit={() => selectedDept && openEditDepartment(selectedDept.id)}
        onToggleActive={handleToggleDeptActive}
        onAssignStaff={() => setAssignStaffTarget(selectedDept)}
        onAssignServices={() => setAssignServicesTarget(selectedDept)}
        onAssignAppointmentTypes={() => setAssignApptTypesTarget(selectedDept)}
        onSetWorkingHours={() => setWorkingHoursTarget(selectedDept)}
      />

      <DepartmentTypeFormDrawer
        open={deptTypeFormOpen}
        onClose={() => setDeptTypeFormOpen(false)}
        onSubmit={handleDeptTypeSubmit}
        initialValues={editingDeptType ?? undefined}
      />

      <AssignDepartmentStaffDrawer
        department={assignStaffTarget}
        onClose={() => setAssignStaffTarget(null)}
        onSubmit={handleAssignStaff}
        staffOptions={staff.map((s) => ({ id: s.id, name: s.name, title: s.title }))}
      />

      <AssignDepartmentServicesDrawer
        department={assignServicesTarget}
        onClose={() => setAssignServicesTarget(null)}
        onSubmit={handleAssignServices}
        services={billableServices}
      />

      <AssignDepartmentAppointmentTypesDrawer
        department={assignApptTypesTarget}
        onClose={() => setAssignApptTypesTarget(null)}
        onSubmit={handleAssignApptTypes}
        appointmentTypes={appointmentTypeOptions.map((t) => ({ id: t.id, name: t.name }))}
      />

      <DepartmentWorkingHoursDrawer department={workingHoursTarget} onClose={() => setWorkingHoursTarget(null)} onSubmit={handleSetWorkingHours} />

      <ServiceFormDrawer
        open={serviceDrawerOpen}
        onClose={() => setServiceDrawerOpen(false)}
        onSubmit={handleServiceSubmit}
        initialValues={editingService}
      />

      <WardFormDrawer
        open={wardDrawerOpen}
        onClose={() => setWardDrawerOpen(false)}
        onSubmit={handleWardSubmit}
        initialValues={editingWard}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
        floorOptions={floors.map((f) => ({ id: f.id, name: f.name }))}
        departmentOptions={departments.map((d) => ({ id: d.id, name: d.name }))}
      />

      <NewWorkOrderDrawer
        open={newWorkOrderOpen}
        onClose={() => setNewWorkOrderOpen(false)}
        onSubmit={handleCreateWorkOrder}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
        departmentOptions={departments.map((d) => ({ id: d.id, name: d.name }))}
      />

      <NewIncidentDrawer
        open={newIncidentOpen}
        onClose={() => setNewIncidentOpen(false)}
        onSubmit={handleCreateIncident}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
      />
    </HospitalAdminLayout>
  );
}
