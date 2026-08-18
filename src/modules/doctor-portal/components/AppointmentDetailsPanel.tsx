import { useNavigate } from "react-router-dom";
import { X, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Stethoscope } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { Appointment, AppointmentStatus, RosterPatient } from "@modules/doctor-portal/api";

interface AppointmentDetailsPanelProps {
  appointment: Appointment | null;
  patient: RosterPatient | null;
  onClose: () => void;
  onStartEncounter: (appointment: Appointment) => void;
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

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
      <span className={done ? "text-slate-600" : "text-amber-700 font-medium"}>{label}</span>
    </div>
  );
}

/** Module-local — Appointment Details slide-over: identity, appointment record fields, patient snapshot, pre-visit checklist, and the primary clinical action. */
export function AppointmentDetailsPanel({ appointment, patient, onClose, onStartEncounter }: AppointmentDetailsPanelProps) {
  const navigate = useNavigate();
  if (!appointment || !patient) return null;
  const appt = appointment;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Appointment details" className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-sm font-bold text-slate-800">Appointment</h2>
          <button type="button" onClick={onClose} aria-label="Close appointment details" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-start gap-3">
              <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div>
                <p className="text-base font-bold text-slate-800">{patient.name}</p>
                <p className="text-xs text-slate-500">{patient.mrn}</p>
              </div>
            </div>
            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[appt.status]}`}>{appt.status}</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-600 space-y-1">
            <p><span className="text-slate-400">Appointment ID:</span> {appt.id}</p>
            <p><span className="text-slate-400">Date:</span> {appt.displayDate}</p>
            <p><span className="text-slate-400">Time:</span> {appt.time || "Not yet scheduled"}</p>
            <p><span className="text-slate-400">Duration:</span> {appt.duration} minutes</p>
            <p><span className="text-slate-400">Type:</span> {appt.visitType} ({appt.encounterType})</p>
            <p><span className="text-slate-400">Department:</span> {appt.department}</p>
            <p><span className="text-slate-400">Location:</span> {appt.location}</p>
            {appt.previousSlot && <p><span className="text-slate-400">Rescheduled from:</span> {appt.previousSlot}</p>}
            {appt.cancelReason && <p><span className="text-slate-400">Cancel reason:</span> {appt.cancelReason}</p>}
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Patient Snapshot</p>
          <div className="mb-4">
            <p className="text-xs text-slate-600 mb-1">{patient.age}{patient.gender === "Male" ? "M" : "F"} · {patient.conditions.join(", ") || "No conditions on record"}</p>
            {patient.allergies.length > 0 && (
              <p className="flex items-center gap-1 text-xs font-semibold text-rose-600 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {patient.allergies.map((a) => a.substance).join(", ")}
              </p>
            )}
            <p className="text-xs text-slate-500">Last visit: {patient.lastVisit}</p>
            {patient.recentResults[0] && <p className="text-xs text-slate-500">Recent {patient.recentResults[0].name}: {patient.recentResults[0].value}</p>}
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pre-Visit</p>
          <div className="flex flex-col gap-1.5 mb-4">
            <ChecklistRow label="Patient questionnaire completed" done={appt.preVisit.questionnaireComplete} />
            <ChecklistRow label="Insurance verified" done={appt.preVisit.insuranceVerified} />
            <ChecklistRow label="Previous records available" done={appt.preVisit.previousRecordsAvailable} />
            <ChecklistRow label="Recent labs available" done={appt.preVisit.recentLabsAvailable} />
          </div>

          {appt.reason && (
            <div className="mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for Visit</p>
              <p className="text-xs text-slate-600">{appt.reason}{appt.reasonDuration ? ` — ${appt.reasonDuration}` : ""}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(patient.id))}
            className="flex items-center justify-center gap-1.5 flex-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-2.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Patient 360
          </button>
          {(appt.status === "Waiting" || appt.status === "In Consultation") && (
            <button
              type="button"
              onClick={() => onStartEncounter(appt)}
              className="flex items-center justify-center gap-1.5 flex-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl py-2.5 transition-colors shadow-sm shadow-blue-500/30"
            >
              <Stethoscope className="w-3.5 h-3.5" /> {appt.status === "In Consultation" ? "Resume Encounter" : "Start Encounter"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
