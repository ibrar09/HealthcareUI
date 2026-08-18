import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import type { RosterPatient, RosterStatusTone } from "@modules/doctor-portal/api";

interface PatientRosterListProps {
  patients: RosterPatient[];
}

const TONE_CLASSES: Record<RosterStatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  critical: "bg-rose-50 text-rose-700 border-rose-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

/** Module-local — searchable/filterable patient list for the My Patients screen. "View" opens the patient's full record. */
export function PatientRosterList({ patients }: PatientRosterListProps) {
  const navigate = useNavigate();

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
        <p className="text-sm font-semibold text-slate-600">No patients match your search.</p>
        <p className="text-xs text-slate-400 mt-1">Try a different name, MRN, phone number, or filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 max-h-[calc(100vh-320px)] overflow-y-auto">
      {patients.map((p) => (
        <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
          <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
              <span className="text-[11px] text-slate-400 flex-shrink-0">{p.age}{p.gender === "Male" ? "M" : "F"}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{p.mrn}</p>
          </div>

          <div className="hidden md:flex flex-wrap gap-1.5 flex-1 min-w-0">
            {p.conditions.map((c) => (
              <span key={c} className="text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-100 rounded-full px-2 py-0.5 whitespace-nowrap">
                {c}
              </span>
            ))}
          </div>

          <p className="hidden lg:block text-[11px] text-slate-500 w-28 flex-shrink-0">{p.lastVisit}</p>

          <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${TONE_CLASSES[p.statusTone]}`}>
            {p.status}
          </span>

          <button
            type="button"
            onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(p.id))}
            className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 flex-shrink-0"
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
