import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { AppointmentDashboardOverview } from "@modules/hospital-admin/components/appointments/AppointmentDashboardOverview";
import { AppointmentCalendarView } from "@modules/hospital-admin/components/appointments/AppointmentCalendarView";
import { AppointmentList } from "@modules/hospital-admin/components/appointments/AppointmentList";
import { AppointmentDetailsDrawer, AppointmentQuickAction } from "@modules/hospital-admin/components/appointments/AppointmentDetailsDrawer";
import { CreateAppointmentDrawer } from "@modules/hospital-admin/components/appointments/CreateAppointmentDrawer";
import { RescheduleDrawer } from "@modules/hospital-admin/components/appointments/RescheduleDrawer";
import { CancelAppointmentDrawer } from "@modules/hospital-admin/components/appointments/CancelAppointmentDrawer";
import { QueueView } from "@modules/hospital-admin/components/appointments/QueueView";
import { ScheduleCard } from "@modules/hospital-admin/components/appointments/ScheduleCard";
import { ScheduleFormDrawer, ScheduleFormValues } from "@modules/hospital-admin/components/appointments/ScheduleFormDrawer";
import { BlockedTimeDrawer } from "@modules/hospital-admin/components/appointments/BlockedTimeDrawer";
import { DoctorLeaveDrawer } from "@modules/hospital-admin/components/appointments/DoctorLeaveDrawer";
import { appointmentStatusMeta } from "@modules/hospital-admin/components/appointmentStatusMeta";
import * as api from "@modules/hospital-admin/api";
import type { AppointmentDashboardData, AppointmentListRow, AppointmentStatus, AppointmentTypeConfig, DaySchedule, BlockedTime, DoctorLeave } from "@modules/hospital-admin/api";

type Tab = "dashboard" | "calendar" | "appointments" | "queue" | "schedules";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Appointments", subtitle: "Today's appointment volume, status breakdown, and provider utilization." },
  calendar: { label: "Calendar", title: "Appointment Calendar", subtitle: "Day view of a doctor's schedule — booked visits and open slots." },
  appointments: { label: "Appointments", title: "All Appointments", subtitle: "Search and filter every booked appointment." },
  queue: { label: "Queue", title: "Today's Queue", subtitle: "Checked-in and waiting patients, in arrival order." },
  schedules: { label: "Schedules", title: "Doctor Schedules", subtitle: "Working patterns, leave, and blocked time — the engine behind the Calendar." },
};

const TODAY = "2026-08-14";

export function Appointments() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<AppointmentDashboardData | null>(null);
  const [appointmentList, setAppointmentList] = useState<AppointmentListRow[]>([]);
  const [schedules, setSchedules] = useState<Awaited<ReturnType<typeof api.getSchedules>>>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeConfig[]>([]);
  const [facilities, setFacilities] = useState<Awaited<ReturnType<typeof api.getFacilities>>>([]);
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof api.getDepartmentConfigs>>>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [doctorFilter, setDoctorFilter] = useState<string | "all">("all");

  const [calendarDoctor, setCalendarDoctor] = useState("");
  const [calendarDate, setCalendarDate] = useState(TODAY);
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentListRow | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<{ practitionerId: string; date: string; time: string } | null>(null);

  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentListRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentListRow | null>(null);
  const [queue, setQueue] = useState<AppointmentListRow[]>([]);

  const [staff, setStaff] = useState<Awaited<ReturnType<typeof api.getStaffMembers>>>([]);
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Awaited<ReturnType<typeof api.getSchedules>>[number] | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<{ practitionerId: string; practitionerName: string } | null>(null);
  const [blockTarget, setBlockTarget] = useState<{ practitionerId: string; practitionerName: string } | null>(null);

  /** Refreshes every list/summary view. Deliberately does NOT touch `selectedAppointment` —
   * callers that are about to close the details drawer (cancel/reschedule) must not race a
   * stale re-fetch against `setSelectedAppointmentId(null)`, or the late-arriving fetch
   * reopens the drawer with the just-changed data. Callers that want to keep the drawer
   * open with fresh data (quick actions) call `refreshSelected()` explicitly instead. */
  function refreshLists() {
    api.getAppointmentDashboard().then(setDashboard);
    api.getAppointments({ search, status: statusFilter, practitionerId: doctorFilter }).then(setAppointmentList);
    api.getTodayQueue().then(setQueue);
    if (calendarDoctor) api.getDaySchedule(calendarDoctor, calendarDate).then(setDaySchedule);
  }

  function refreshSelected() {
    if (selectedAppointmentId) api.getAppointment(selectedAppointmentId).then(setSelectedAppointment);
  }

  function refreshAll() {
    refreshLists();
    refreshSelected();
  }

  function refreshSchedules() {
    api.getSchedules().then(setSchedules);
    api.getDoctorLeaves().then(setLeaves);
    api.getBlockedTimes().then(setBlockedTimes);
    if (calendarDoctor) api.getDaySchedule(calendarDoctor, calendarDate).then(setDaySchedule);
  }

  async function handleQuickAction(action: AppointmentQuickAction) {
    if (!selectedAppointmentId) return;
    if (action === "check-in") await api.checkInAppointment(selectedAppointmentId);
    else if (action === "start-consultation") await api.startConsultation(selectedAppointmentId);
    else if (action === "complete-consultation") await api.completeConsultation(selectedAppointmentId);
    else if (action === "no-show") await api.markNoShow(selectedAppointmentId);
    refreshAll();
  }

  useEffect(() => {
    api.getAppointmentDashboard().then(setDashboard);
    api.getSchedules().then((s) => {
      setSchedules(s);
      if (s.length > 0) setCalendarDoctor(s[0].practitionerId);
    });
    api.getAppointmentTypes().then(setAppointmentTypes);
    api.getFacilities().then(setFacilities);
    api.getDepartmentConfigs().then(setDepartments);
    api.getTodayQueue().then(setQueue);
    api.getStaffMembers().then(setStaff);
    api.getDoctorLeaves().then(setLeaves);
    api.getBlockedTimes().then(setBlockedTimes);
  }, []);

  useEffect(() => {
    api.getAppointments({ search, status: statusFilter, practitionerId: doctorFilter }).then(setAppointmentList);
  }, [search, statusFilter, doctorFilter]);

  useEffect(() => {
    if (!calendarDoctor) return;
    api.getDaySchedule(calendarDoctor, calendarDate).then(setDaySchedule);
  }, [calendarDoctor, calendarDate]);

  useEffect(() => {
    if (!selectedAppointmentId) {
      setSelectedAppointment(null);
      return;
    }
    api.getAppointment(selectedAppointmentId).then(setSelectedAppointment);
  }, [selectedAppointmentId]);

  const statusFilters: { value: AppointmentStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...(Object.keys(appointmentStatusMeta) as AppointmentStatus[]).map((s) => ({ value: s, label: appointmentStatusMeta[s].label })),
  ];

  function openCreate(prefill?: { practitionerId: string; date: string; time: string }) {
    setCreatePrefill(prefill ?? null);
    setCreateOpen(true);
  }

  return (
    <HospitalAdminLayout active="Appointments">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
            <span>Appointments</span>
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
        <button
          type="button"
          onClick={() => {
            if (tab === "schedules") {
              setEditingSchedule(null);
              setScheduleFormOpen(true);
            } else {
              openCreate();
            }
          }}
          className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
        >
          <Plus size={16} /> {tab === "schedules" ? "Add Schedule" : "New Appointment"}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex gap-2 flex-wrap">
          {(["dashboard", "calendar", "appointments", "queue", "schedules"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {tabMeta[t].label}
              {t === "queue" && queue.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-module-pharmacy px-1 text-[10px] font-bold text-white">
                  {queue.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "calendar" && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <select
            value={calendarDoctor}
            onChange={(e) => setCalendarDoctor(e.target.value)}
            className="bg-white border border-line text-sm rounded-lg px-3 py-2 outline-none focus:border-signal-indigo transition-all"
          >
            {schedules.map((s) => (
              <option key={s.practitionerId} value={s.practitionerId}>
                {s.practitionerName} {s.departmentName ? `· ${s.departmentName}` : ""}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={calendarDate}
            onChange={(e) => setCalendarDate(e.target.value)}
            className="bg-white border border-line text-sm rounded-lg px-3 py-2 outline-none focus:border-signal-indigo transition-all"
          />
        </div>
      )}

      {tab === "appointments" && (
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, MRN, doctor, department..."
              className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
            />
          </div>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="bg-white border border-line text-sm rounded-lg px-3 py-2 outline-none focus:border-signal-indigo transition-all"
          >
            <option value="all">All Doctors</option>
            {schedules.map((s) => (
              <option key={s.practitionerId} value={s.practitionerId}>
                {s.practitionerName}
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

      {tab === "dashboard" && dashboard && <AppointmentDashboardOverview data={dashboard} />}

      {tab === "calendar" && (
        <div className="pb-8">
          <AppointmentCalendarView
            daySchedule={daySchedule}
            onSelectAppointment={setSelectedAppointmentId}
            onSelectSlot={(time) => openCreate({ practitionerId: calendarDoctor, date: calendarDate, time })}
          />
        </div>
      )}

      {tab === "appointments" && (
        <div className="pb-8">
          <AppointmentList rows={appointmentList} onSelect={setSelectedAppointmentId} />
        </div>
      )}

      {tab === "queue" && (
        <div className="pb-8">
          <QueueView
            rows={queue}
            onSelect={setSelectedAppointmentId}
            onStartConsultation={async (id) => {
              await api.startConsultation(id);
              refreshAll();
            }}
            onCompleteConsultation={async (id) => {
              await api.completeConsultation(id);
              refreshAll();
            }}
          />
        </div>
      )}

      {tab === "schedules" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {schedules.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              leaves={leaves.filter((l) => l.practitionerId === s.practitionerId)}
              blockedTimes={blockedTimes.filter((b) => b.practitionerId === s.practitionerId)}
              onEdit={() => {
                setEditingSchedule(s);
                setScheduleFormOpen(true);
              }}
              onAddLeave={() => setLeaveTarget({ practitionerId: s.practitionerId, practitionerName: s.practitionerName })}
              onAddBlockedTime={() => setBlockTarget({ practitionerId: s.practitionerId, practitionerName: s.practitionerName })}
              onRemoveLeave={async (id) => {
                await api.removeDoctorLeave(id);
                refreshSchedules();
              }}
              onRemoveBlockedTime={async (id) => {
                await api.removeBlockedTime(id);
                refreshSchedules();
              }}
            />
          ))}
        </div>
      )}

      <AppointmentDetailsDrawer
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointmentId(null)}
        onViewPatient={(id) => navigate(ROUTES.HOSPITAL_ADMIN.PATIENT_DETAIL(id))}
        onQuickAction={handleQuickAction}
        onReschedule={() => selectedAppointment && setRescheduleTarget(selectedAppointment)}
        onCancel={() => selectedAppointment && setCancelTarget(selectedAppointment)}
      />

      <CreateAppointmentDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onComplete={refreshAll}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
        departmentOptions={departments.map((d) => ({ id: d.id, name: d.name }))}
        schedules={schedules}
        appointmentTypes={appointmentTypes}
        prefill={createPrefill}
      />

      <RescheduleDrawer
        appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onComplete={() => {
          setSelectedAppointmentId(null);
          refreshLists();
        }}
      />

      <CancelAppointmentDrawer
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onComplete={() => {
          setSelectedAppointmentId(null);
          refreshLists();
        }}
      />

      <ScheduleFormDrawer
        open={scheduleFormOpen}
        onClose={() => setScheduleFormOpen(false)}
        onSubmit={async (values: ScheduleFormValues) => {
          if (editingSchedule) await api.updateSchedule(editingSchedule.id, values);
          else await api.createSchedule(values);
          refreshSchedules();
        }}
        initialValues={
          editingSchedule
            ? {
                practitionerId: editingSchedule.practitionerId,
                facilityId: editingSchedule.facilityId,
                departmentId: editingSchedule.departmentId,
                workingDays: editingSchedule.workingDays,
                startTime: editingSchedule.startTime,
                endTime: editingSchedule.endTime,
                slotDurationMinutes: editingSchedule.slotDurationMinutes,
                active: editingSchedule.active,
              }
            : undefined
        }
        practitionerOptions={staff.filter((s) => s.role === "doctor").map((s) => ({ id: s.id, name: s.name }))}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
        departmentOptions={departments.map((d) => ({ id: d.id, name: d.name }))}
      />

      <DoctorLeaveDrawer
        open={Boolean(leaveTarget)}
        practitionerId={leaveTarget?.practitionerId ?? null}
        practitionerName={leaveTarget?.practitionerName}
        onClose={() => setLeaveTarget(null)}
        onComplete={refreshSchedules}
      />

      <BlockedTimeDrawer
        open={Boolean(blockTarget)}
        practitionerId={blockTarget?.practitionerId ?? null}
        practitionerName={blockTarget?.practitionerName}
        onClose={() => setBlockTarget(null)}
        onComplete={refreshSchedules}
      />
    </HospitalAdminLayout>
  );
}
