import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ListChecks, LayoutList, CalendarRange } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { ROUTES } from "@/constants/routes";
import { AppointmentDashboardStats } from "@modules/doctor-portal/components/AppointmentDashboardStats";
import { ClinicalBrief } from "@modules/doctor-portal/components/ClinicalBrief";
import { AppointmentDateNav } from "@modules/doctor-portal/components/AppointmentDateNav";
import { AppointmentFilters, type AppointmentStatusFilterKey } from "@modules/doctor-portal/components/AppointmentFilters";
import { AppointmentList } from "@modules/doctor-portal/components/AppointmentList";
import { AppointmentDetailsPanel } from "@modules/doctor-portal/components/AppointmentDetailsPanel";
import { SlotPickerModal, formatDisplayDate } from "@modules/doctor-portal/components/SlotPickerModal";
import { CancelAppointmentModal } from "@modules/doctor-portal/components/CancelAppointmentModal";
import { BookAppointmentModal } from "@modules/doctor-portal/components/BookAppointmentModal";
import { CalendarNav, type CalendarGranularity } from "@modules/doctor-portal/components/CalendarNav";
import { MonthCalendar, monthLabel } from "@modules/doctor-portal/components/MonthCalendar";
import { WeekCalendar, weekLabel } from "@modules/doctor-portal/components/WeekCalendar";
import * as api from "@modules/doctor-portal/api";
import type { Appointment, AppointmentSummary, EncounterType, RosterPatient } from "@modules/doctor-portal/api";

const STATUS_CHIP_LABELS: { key: AppointmentStatusFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "requested", label: "Requested" },
  { key: "upcoming", label: "Upcoming" },
  { key: "waiting", label: "Waiting" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no-show", label: "No Show" },
];

function matchesStatusChip(a: Appointment, key: AppointmentStatusFilterKey): boolean {
  switch (key) {
    case "all": return true;
    case "requested": return a.status === "Requested";
    case "upcoming": return a.status === "Scheduled" || a.status === "Confirmed";
    case "waiting": return a.status === "Checked-in" || a.status === "Waiting";
    case "in-progress": return a.status === "In Consultation";
    case "completed": return a.status === "Completed";
    case "cancelled": return a.status === "Cancelled";
    case "no-show": return a.status === "No-show";
  }
}

export function Appointments() {
  const navigate = useNavigate();
  const [roster, setRoster] = useState<RosterPatient[]>([]);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [summary, setSummary] = useState<AppointmentSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(api.TODAY_ISO);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarGranularity, setCalendarGranularity] = useState<CalendarGranularity>("month");

  const [search, setSearch] = useState("");
  const [statusChip, setStatusChip] = useState<AppointmentStatusFilterKey>("all");
  const [typeFilter, setTypeFilter] = useState<EncounterType | "all">("all");

  const [detailsAppointmentId, setDetailsAppointmentId] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ appt: Appointment; mode: "cancel" | "decline" } | null>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  function refreshDay() {
    api.getAppointmentsByDate(selectedDate).then(setDayAppointments);
  }
  function refreshSummary() {
    api.getAppointmentSummary().then(setSummary);
  }
  function refreshToday() {
    api.getAppointmentsByDate(api.TODAY_ISO).then(setTodaysAppointments);
  }
  function refreshCalendar() {
    api.getAppointments().then(setAllAppointments);
  }
  function refreshAll() {
    refreshDay();
    refreshSummary();
    refreshToday();
    refreshCalendar();
  }

  useEffect(() => {
    api.getPatientRoster().then(setRoster);
    api.getCurrentDoctor().then((d) => setDoctorName(d.name));
    refreshSummary();
    refreshToday();
    refreshCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const dateLabel = selectedDate === api.TODAY_ISO ? `Today, ${formatDisplayDate(selectedDate)}` : formatDisplayDate(selectedDate);

  const chips = useMemo(
    () => STATUS_CHIP_LABELS.map(({ key, label }) => ({ key, label, count: dayAppointments.filter((a) => matchesStatusChip(a, key)).length })),
    [dayAppointments]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return dayAppointments.filter((a) => {
      if (!matchesStatusChip(a, statusChip)) return false;
      if (typeFilter !== "all" && a.encounterType !== typeFilter) return false;
      if (!query) return true;
      const patient = roster.find((p) => p.id === a.patientId);
      return (
        (patient?.name.toLowerCase().includes(query) ?? false) ||
        (patient?.mrn.toLowerCase().includes(query) ?? false) ||
        a.id.toLowerCase().includes(query) ||
        a.department.toLowerCase().includes(query)
      );
    });
  }, [dayAppointments, statusChip, typeFilter, search, roster]);

  const detailsAppointment = allAppointments.find((a) => a.id === detailsAppointmentId) ?? dayAppointments.find((a) => a.id === detailsAppointmentId) ?? null;
  const detailsPatient = detailsAppointment ? roster.find((p) => p.id === detailsAppointment.patientId) ?? null : null;

  function handleStartEncounter(appt: Appointment) {
    if (appt.status !== "In Consultation") {
      api.updateAppointmentStatus(appt.id, "In Consultation").then(() => refreshAll());
    }
    navigate(ROUTES.DOCTOR.ENCOUNTER(appt.patientId));
  }

  return (
    <DoctorLayout active="Appointments">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-800">Appointments</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.DOCTOR.QUEUE)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2.5"
          >
            <ListChecks className="w-3.5 h-3.5" /> Queue View
          </button>
          <button
            type="button"
            onClick={() => setBookModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 shadow-sm shadow-blue-500/30"
          >
            <Plus className="w-3.5 h-3.5" /> Book Appointment
          </button>
        </div>
      </div>

      <AppointmentDashboardStats summary={summary} />

      <ClinicalBrief doctorName={doctorName} todaysAppointments={todaysAppointments} roster={roster} />

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        {viewMode === "list" ? (
          <AppointmentDateNav date={selectedDate} onDateChange={setSelectedDate} label={dateLabel} />
        ) : (
          <CalendarNav
            granularity={calendarGranularity}
            onGranularityChange={setCalendarGranularity}
            referenceDate={selectedDate}
            onReferenceDateChange={setSelectedDate}
            label={calendarGranularity === "month" ? monthLabel(selectedDate) : weekLabel(selectedDate)}
          />
        )}

        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
          >
            <LayoutList className="w-3.5 h-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            aria-label="Calendar view"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ${viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
          >
            <CalendarRange className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          <AppointmentFilters
            search={search}
            onSearchChange={setSearch}
            chips={chips}
            activeChip={statusChip}
            onChipChange={setStatusChip}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />

          <AppointmentList
            appointments={filtered}
            roster={roster}
            onOpenDetails={setDetailsAppointmentId}
            onCheckIn={(id) => api.updateAppointmentStatus(id, "Checked-in").then(() => refreshAll())}
            onMarkWaiting={(id) => api.updateAppointmentStatus(id, "Waiting").then(() => refreshAll())}
            onStartEncounter={handleStartEncounter}
            onReschedule={setRescheduleTarget}
            onCancel={(appt) => setCancelTarget({ appt, mode: "cancel" })}
            onMarkNoShow={(id) => api.updateAppointmentStatus(id, "No-show").then(() => refreshAll())}
            onAccept={setAcceptTarget}
            onDecline={(appt) => setCancelTarget({ appt, mode: "decline" })}
            onMarkCompleted={(id) => api.updateAppointmentStatus(id, "Completed").then(() => refreshAll())}
          />
        </>
      ) : calendarGranularity === "month" ? (
        <MonthCalendar
          referenceDate={selectedDate}
          appointments={allAppointments}
          todayIso={api.TODAY_ISO}
          onSelectDay={(iso) => { setSelectedDate(iso); setViewMode("list"); }}
        />
      ) : (
        <WeekCalendar
          referenceDate={selectedDate}
          appointments={allAppointments}
          roster={roster}
          todayIso={api.TODAY_ISO}
          onSelectAppointment={setDetailsAppointmentId}
        />
      )}

      <AppointmentDetailsPanel
        appointment={detailsAppointment}
        patient={detailsPatient}
        onClose={() => setDetailsAppointmentId(null)}
        onStartEncounter={(appt) => { setDetailsAppointmentId(null); handleStartEncounter(appt); }}
      />

      {rescheduleTarget && (
        <SlotPickerModal
          mode="reschedule"
          appointment={rescheduleTarget}
          patientName={roster.find((p) => p.id === rescheduleTarget.patientId)?.name ?? ""}
          onClose={() => setRescheduleTarget(null)}
          onConfirm={(slot) => {
            api.rescheduleAppointment(rescheduleTarget.id, slot).then(() => { refreshAll(); setRescheduleTarget(null); });
          }}
        />
      )}

      {acceptTarget && (
        <SlotPickerModal
          mode="accept"
          appointment={acceptTarget}
          patientName={roster.find((p) => p.id === acceptTarget.patientId)?.name ?? ""}
          onClose={() => setAcceptTarget(null)}
          onConfirm={(slot) => {
            api.acceptAppointmentRequest(acceptTarget.id, slot).then(() => { refreshAll(); setAcceptTarget(null); });
          }}
        />
      )}

      {cancelTarget && (
        <CancelAppointmentModal
          mode={cancelTarget.mode}
          appointment={cancelTarget.appt}
          patientName={roster.find((p) => p.id === cancelTarget.appt.patientId)?.name ?? ""}
          onClose={() => setCancelTarget(null)}
          onConfirm={(reason) => {
            const action = cancelTarget.mode === "cancel"
              ? api.updateAppointmentStatus(cancelTarget.appt.id, "Cancelled", { cancelReason: reason })
              : api.declineAppointmentRequest(cancelTarget.appt.id, reason);
            action.then(() => { refreshAll(); setCancelTarget(null); });
          }}
        />
      )}

      {bookModalOpen && (
        <BookAppointmentModal
          roster={roster}
          defaultDate={selectedDate}
          onClose={() => setBookModalOpen(false)}
          onConfirm={(input) => {
            api.bookAppointment(input).then(() => { refreshAll(); setBookModalOpen(false); });
          }}
        />
      )}
    </DoctorLayout>
  );
}
