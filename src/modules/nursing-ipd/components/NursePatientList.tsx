import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import type { AcuityLevel, NursePatient } from "@modules/nursing-ipd/api";

interface NursePatientListProps {
  patients: NursePatient[];
}

const ACUITY_DOT: Record<AcuityLevel, string> = {
  Critical: "bg-rose-500", "High Risk": "bg-orange-500", Attention: "bg-amber-500", Stable: "bg-emerald-500",
};
const ACUITY_TEXT: Record<AcuityLevel, string> = {
  Critical: "text-rose-700 bg-rose-50 border-rose-100", "High Risk": "text-orange-700 bg-orange-50 border-orange-100",
  Attention: "text-amber-700 bg-amber-50 border-amber-100", Stable: "text-emerald-700 bg-emerald-50 border-emerald-100",
};

/** Module-local — the full My Patients list: identity, allergy (never hidden), vitals snapshot, next medication, pending tasks. "Open" leads to the Bedside Workspace. */
export function NursePatientList({ patients }: NursePatientListProps) {
  const navigate = useNavigate();

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
        <p className="text-sm font-semibold text-slate-600">No patients match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
      {patients.map((p) => (
        <div key={p.id} className="flex items-start gap-4 px-5 py-4">
          <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ACUITY_DOT[p.acuity]}`} />
              <p className="text-sm font-bold text-slate-800">{p.name}</p>
              <span className="text-[11px] text-slate-400">{p.age}{p.gender === "Male" ? "M" : "F"}</span>
              <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${ACUITY_TEXT[p.acuity]}`}>{p.acuity}</span>
              {p.isolation && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
                  <ShieldAlert className="w-3 h-3" /> {p.isolation.type}
                </span>
              )}
              {p.dischargePending && (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">Discharge Pending</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{p.mrn} · Room {p.room} · Bed {p.bed}</p>
            <p className="text-xs text-slate-600 mt-1">{p.diagnosis}</p>

            {p.allergies.length > 0 && (
              <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1">
                <AlertTriangle className="w-3 h-3" /> {p.allergies.map((a) => a.substance).join(", ")}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-500">
              {p.vitals.spo2 !== undefined && <span>SpO₂ {p.vitals.spo2}%</span>}
              {p.vitals.bp && <span>BP {p.vitals.bp}</span>}
              {p.vitals.hr !== undefined && <span>HR {p.vitals.hr}</span>}
              {p.nextMedication && (
                <span className={p.nextMedication.overdue ? "font-semibold text-rose-600" : "font-semibold text-amber-600"}>
                  {p.nextMedication.overdue ? "Medication overdue" : `Next medication ${p.nextMedication.time}`}
                </span>
              )}
              {p.pendingTasks > 0 && <span className="font-semibold text-slate-600">{p.pendingTasks} task{p.pendingTasks > 1 ? "s" : ""} pending</span>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.NURSING.PATIENT_DETAIL(p.id))}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex-shrink-0"
          >
            Open →
          </button>
        </div>
      ))}
    </div>
  );
}
