import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { ROUTES } from "@/constants/routes";
import { QueueCard } from "@modules/doctor-portal/components/QueueCard";
import { QueueList } from "@modules/doctor-portal/components/QueueList";
import { CancelAppointmentModal } from "@modules/doctor-portal/components/CancelAppointmentModal";
import * as api from "@modules/doctor-portal/api";
import type { Appointment, RosterPatient } from "@modules/doctor-portal/api";

function toMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let [, h, m, ampm] = match;
  let hours = parseInt(h, 10);
  if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
  return hours * 60 + parseInt(m, 10);
}

export function Queue() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [roster, setRoster] = useState<RosterPatient[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  function refresh() {
    api.getAppointmentsByDate(api.TODAY_ISO).then(setAppointments);
  }

  useEffect(() => {
    refresh();
    api.getPatientRoster().then(setRoster);
  }, []);

  const active = useMemo(
    () => appointments.filter((a) => !["Completed", "Cancelled", "No-show"].includes(a.status)).sort((a, b) => toMinutes(a.time) - toMinutes(b.time)),
    [appointments]
  );

  const now = active.find((a) => a.status === "In Consultation") ?? null;
  const next = active.find((a) => a.status === "Waiting" && a.id !== now?.id) ?? null;
  const remaining = active.filter((a) => a.id !== now?.id && a.id !== next?.id);

  const nowPatient = now ? roster.find((p) => p.id === now.patientId) ?? null : null;
  const nextPatient = next ? roster.find((p) => p.id === next.patientId) ?? null : null;

  function handleStartEncounter(appt: Appointment) {
    if (appt.status !== "In Consultation") {
      api.updateAppointmentStatus(appt.id, "In Consultation").then(() => refresh());
    }
    navigate(ROUTES.DOCTOR.ENCOUNTER(appt.patientId));
  }

  return (
    <DoctorLayout active="Appointments">
      <button
        type="button"
        onClick={() => navigate(ROUTES.DOCTOR.APPOINTMENTS)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Appointments
      </button>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Queue</h1>
        <p className="text-xs text-slate-500 mt-0.5">Today, 18 Aug 2026 · {active.length} patients remaining</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <QueueCard variant="now" appointment={now} patient={nowPatient} onAction={handleStartEncounter} />
        <QueueCard variant="next" appointment={next} patient={nextPatient} onAction={handleStartEncounter} />
      </div>

      <QueueList
        entries={remaining.map((appointment, i) => ({ appointment, position: i + 3 }))}
        roster={roster}
        onCheckIn={(id) => api.updateAppointmentStatus(id, "Checked-in").then(() => refresh())}
        onMarkWaiting={(id) => api.updateAppointmentStatus(id, "Waiting").then(() => refresh())}
        onStartEncounter={handleStartEncounter}
        onCancel={setCancelTarget}
        onMarkNoShow={(id) => api.updateAppointmentStatus(id, "No-show").then(() => refresh())}
      />

      {cancelTarget && (
        <CancelAppointmentModal
          mode="cancel"
          appointment={cancelTarget}
          patientName={roster.find((p) => p.id === cancelTarget.patientId)?.name ?? ""}
          onClose={() => setCancelTarget(null)}
          onConfirm={(reason) => {
            api.updateAppointmentStatus(cancelTarget.id, "Cancelled", { cancelReason: reason }).then(() => { refresh(); setCancelTarget(null); });
          }}
        />
      )}
    </DoctorLayout>
  );
}
