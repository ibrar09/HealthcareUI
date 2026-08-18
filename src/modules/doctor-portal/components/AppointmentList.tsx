import { AlertCircle, Video } from "lucide-react";
import { AppointmentActionsMenu } from "@modules/doctor-portal/components/AppointmentActionsMenu";
import type { Appointment, AppointmentStatus, AppointmentPriority, RosterPatient } from "@modules/doctor-portal/api";

interface AppointmentListProps {
  appointments: Appointment[];
  roster: RosterPatient[];
  onOpenDetails: (appointmentId: string) => void;
  onCheckIn: (id: string) => void;
  onMarkWaiting: (id: string) => void;
  onStartEncounter: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onMarkNoShow: (id: string) => void;
  onAccept: (appointment: Appointment) => void;
  onDecline: (appointment: Appointment) => void;
  onMarkCompleted: (id: string) => void;
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  Requested: "bg-slate-100 text-slate-600 border-slate-200",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  "Checked-in": "bg-violet-50 text-violet-700 border-violet-100",
  Waiting: "bg-amber-50 text-amber-700 border-amber-100",
  "In Consultation": "bg-emerald-50 text-emerald-700 border-emerald-100",
  Completed: "bg-slate-100 text-slate-500 border-slate-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  "No-show": "bg-rose-50 text-rose-700 border-rose-100",
  Rescheduled: "bg-blue-50 text-blue-700 border-blue-100",
};

const PRIORITY_STYLE: Record<AppointmentPriority, string> = {
  Routine: "", Urgent: "text-amber-600", "High Priority": "text-orange-600", Emergency: "text-rose-600",
};

/** Module-local — the day's appointment rows: patient identity, visit info, status, and status-appropriate actions (Check In/Start Encounter/Reschedule/Cancel/Accept/Decline). */
export function AppointmentList({
  appointments, roster, onOpenDetails, onCheckIn, onMarkWaiting, onStartEncounter,
  onReschedule, onCancel, onMarkNoShow, onAccept, onDecline, onMarkCompleted,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
        <p className="text-sm font-semibold text-slate-600">No appointments match this view.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
      {appointments.map((appt) => {
        const patient = roster.find((p) => p.id === appt.patientId);
        if (!patient) return null;

        const menuItems: { label: string; onClick: () => void; danger?: boolean }[] = [];
        if (appt.status === "Scheduled" || appt.status === "Confirmed") {
          menuItems.push({ label: "Reschedule", onClick: () => onReschedule(appt) });
          menuItems.push({ label: "Mark No-show", onClick: () => onMarkNoShow(appt.id) });
          menuItems.push({ label: "Cancel Appointment", onClick: () => onCancel(appt), danger: true });
        } else if (appt.status === "Checked-in") {
          menuItems.push({ label: "Reschedule", onClick: () => onReschedule(appt) });
          menuItems.push({ label: "Cancel Appointment", onClick: () => onCancel(appt), danger: true });
        } else if (appt.status === "Waiting") {
          menuItems.push({ label: "Cancel Appointment", onClick: () => onCancel(appt), danger: true });
        } else if (appt.status === "In Consultation") {
          menuItems.push({ label: "Mark Completed", onClick: () => onMarkCompleted(appt.id) });
        } else if (appt.status === "Cancelled" || appt.status === "No-show") {
          menuItems.push({ label: "Reschedule", onClick: () => onReschedule(appt) });
        }

        return (
          <div
            key={appt.id}
            role="button"
            tabIndex={0}
            aria-label={`View appointment details for ${patient.name}`}
            onClick={() => onOpenDetails(appt.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenDetails(appt.id); } }}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors w-full text-left cursor-pointer focus:outline-none focus:bg-blue-50/40"
          >
            <div className="w-20 flex-shrink-0">
              <p className="text-sm font-bold text-slate-800">{appt.time || "—"}</p>
              <p className="text-[11px] text-slate-400">{appt.duration} min</p>
            </div>

            <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                {appt.isNewPatient && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">NEW PATIENT</span>}
                {appt.encounterType === "Telemedicine" && <Video className="w-3.5 h-3.5 text-blue-400" aria-label="Telemedicine" />}
                {appt.priority !== "Routine" && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold ${PRIORITY_STYLE[appt.priority]}`}>
                    <AlertCircle className="w-3 h-3" /> {appt.priority.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{patient.mrn} · {appt.visitType} · {appt.department}</p>
              <p className="text-xs text-slate-600 mt-0.5">{appt.reason}{appt.preferredWindow ? ` · Preferred: ${appt.preferredWindow}` : ""}</p>
            </div>

            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[appt.status]}`}>{appt.status}</span>

            <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {appt.status === "Requested" && (
                <>
                  <button type="button" onClick={() => onAccept(appt)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5">Accept</button>
                  <button type="button" onClick={() => onDecline(appt)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5">Decline</button>
                </>
              )}
              {(appt.status === "Scheduled" || appt.status === "Confirmed") && (
                <button type="button" onClick={() => onCheckIn(appt.id)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5">Check In</button>
              )}
              {appt.status === "Checked-in" && (
                <button type="button" onClick={() => onMarkWaiting(appt.id)} className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg px-3 py-1.5">Mark Waiting</button>
              )}
              {(appt.status === "Waiting" || appt.status === "In Consultation") && (
                <button type="button" onClick={() => onStartEncounter(appt)} className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5">
                  {appt.status === "In Consultation" ? "Resume Encounter" : "Start Encounter"}
                </button>
              )}
              <AppointmentActionsMenu items={menuItems} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
