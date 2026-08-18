import { Stethoscope } from "lucide-react";
import type { Appointment, RosterPatient } from "@modules/doctor-portal/api";

interface QueueCardProps {
  variant: "now" | "next";
  appointment: Appointment | null;
  patient: RosterPatient | null;
  onAction: (appointment: Appointment) => void;
}

const VARIANT_STYLE = {
  now: { label: "NOW", chip: "bg-emerald-100 text-emerald-700", border: "border-emerald-200", cta: "Resume Encounter", ctaClass: "bg-emerald-600 hover:bg-emerald-700" },
  next: { label: "NEXT", chip: "bg-amber-100 text-amber-700", border: "border-amber-200", cta: "Start Encounter", ctaClass: "bg-blue-600 hover:bg-blue-700" },
};

/** Module-local — the big NOW/NEXT cards on the Queue board. Same shape for both, parameterized by variant. */
export function QueueCard({ variant, appointment, patient, onAction }: QueueCardProps) {
  const style = VARIANT_STYLE[variant];

  if (!appointment || !patient) {
    return (
      <div className={`bg-white rounded-2xl border ${style.border} border-dashed p-6 flex-1 flex flex-col items-center justify-center text-center min-h-[180px]`}>
        <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 mb-3 ${style.chip}`}>{style.label}</span>
        <p className="text-sm text-slate-400">{variant === "now" ? "No patient currently in consultation." : "No one waiting."}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border ${style.border} p-5 flex-1 min-h-[180px] flex flex-col justify-between shadow-sm`}>
      <div>
        <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${style.chip}`}>{style.label}</span>
        <div className="flex items-center gap-3 mt-3">
          <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
          <div>
            <p className="text-base font-bold text-slate-800">{patient.name}</p>
            <p className="text-xs text-slate-500">{appointment.time} · {appointment.visitType}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">{appointment.reason}</p>
        {appointment.checkedInAt && <p className="text-[11px] text-slate-400 mt-1">Checked in at {appointment.checkedInAt}</p>}
      </div>
      <button
        type="button"
        onClick={() => onAction(appointment)}
        className={`flex items-center justify-center gap-1.5 text-xs font-semibold text-white rounded-xl py-2.5 mt-4 transition-colors ${style.ctaClass}`}
      >
        <Stethoscope className="w-3.5 h-3.5" /> {style.cta}
      </button>
    </div>
  );
}
