import { AlertTriangle, Pill, Activity, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import type { AcuityLevel, NursePatient } from "@modules/nursing-ipd/api";

interface MyPatientsPreviewProps {
  patients: NursePatient[];
}

const ACUITY_BORDER: Record<AcuityLevel, string> = {
  Critical: "border-l-rose-500", "High Risk": "border-l-orange-500", Attention: "border-l-amber-500", Stable: "border-l-emerald-500",
};
const ACUITY_TEXT: Record<AcuityLevel, string> = {
  Critical: "text-rose-700 bg-rose-50 border-rose-100", "High Risk": "text-orange-700 bg-orange-50 border-orange-100",
  Attention: "text-amber-700 bg-amber-50 border-amber-100", Stable: "text-emerald-700 bg-emerald-50 border-emerald-100",
};

/** Module-local — the Nurse Dashboard's "My Patients" preview: card-per-patient with an acuity-colored accent stripe, photo, and the flags that matter most at a glance. */
export function MyPatientsPreview({ patients }: MyPatientsPreviewProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800">My Patients</h2>
        <span className="text-xs text-slate-400">{patients.length} assigned</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {patients.map((p) => (
          <div
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`Open ${p.name}'s bedside workspace`}
            onClick={() => navigate(ROUTES.NURSING.PATIENT_DETAIL(p.id))}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(ROUTES.NURSING.PATIENT_DETAIL(p.id)); } }}
            className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${ACUITY_BORDER[p.acuity]} shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-200`}
          >
            <div className="flex items-start gap-3">
              <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-slate-800">{p.name}</p>
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${ACUITY_TEXT[p.acuity]}`}>{p.acuity}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Room {p.room} · Bed {p.bed}</p>
                <p className="text-xs text-slate-600 mt-1">{p.diagnosis}</p>
              </div>
            </div>

            {(p.nextMedication || p.vitalsDue || p.assessmentDue) && (
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-50">
                {p.nextMedication && (
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${p.nextMedication.overdue ? "text-rose-600" : "text-amber-600"}`}>
                    <Pill className="w-3 h-3" /> {p.nextMedication.overdue ? "Overdue" : p.nextMedication.time}
                  </span>
                )}
                {p.vitalsDue && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <Activity className="w-3 h-3" /> Vitals due
                  </span>
                )}
                {p.assessmentDue && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <ClipboardList className="w-3 h-3" /> Assessment due
                  </span>
                )}
              </div>
            )}

            {p.allergies.length > 0 && (
              <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-2">
                <AlertTriangle className="w-3 h-3" /> {p.allergies.map((a) => a.substance).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
