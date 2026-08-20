import { useNavigate } from "react-router-dom";
import { AlertTriangle, ShieldAlert, Pill } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { AcuityLevel, WardBedSlot } from "@modules/nursing-ipd/api";

interface WardBedCardProps {
  slot: WardBedSlot;
}

const ACUITY_BORDER: Record<AcuityLevel, string> = {
  Critical: "border-t-rose-500", "High Risk": "border-t-orange-500", Attention: "border-t-amber-500", Stable: "border-t-emerald-500",
};
const ACUITY_DOT: Record<AcuityLevel, string> = {
  Critical: "bg-rose-500", "High Risk": "bg-orange-500", Attention: "bg-amber-500", Stable: "bg-emerald-500",
};

/** Module-local — a single bed tile in the Ward view: occupied (patient summary, click to Bedside Workspace) or empty. */
export function WardBedCard({ slot }: WardBedCardProps) {
  const navigate = useNavigate();
  const { patient } = slot;

  if (!patient) {
    return (
      <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center min-h-[150px]">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bed {slot.bed}</p>
        <p className="text-xs text-slate-400">Empty</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.NURSING.PATIENT_DETAIL(patient.id))}
      className={`text-left bg-white rounded-2xl border border-slate-100 border-t-4 ${ACUITY_BORDER[patient.acuity]} shadow-sm p-4 min-h-[150px] hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bed {slot.bed}</p>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ACUITY_DOT[patient.acuity]}`} />
      </div>
      <div className="flex items-center gap-2.5 mb-2">
        <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
          <p className="text-[11px] text-slate-400">{patient.age}{patient.gender === "Male" ? "M" : "F"}</p>
        </div>
      </div>
      <p className="text-xs text-slate-600 truncate mb-2">{patient.diagnosis}</p>
      <div className="flex flex-wrap items-center gap-2">
        {patient.isolation && <ShieldAlert className="w-3.5 h-3.5 text-violet-600" aria-label="Isolation precautions" />}
        {patient.allergies.length > 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" aria-label="Has allergies" />}
        {patient.nextMedication && <Pill className={`w-3.5 h-3.5 ${patient.nextMedication.overdue ? "text-rose-600" : "text-amber-600"}`} aria-label="Medication due" />}
      </div>
    </button>
  );
}
