import { Phone, Mail, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import type { FollowUpPatient } from "@modules/doctor-portal/api";

interface FollowUpPatientsPanelProps {
  patients: FollowUpPatient[];
}

/** Module-local — patients who missed a scheduled follow-up (spec §28 "the system should automatically remind the doctor"). */
export function FollowUpPatientsPanel({ patients }: FollowUpPatientsPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800">Follow-Up Patients</h2>
        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">{patients.length}</span>
      </div>

      <div className="flex flex-col divide-y divide-slate-100">
        {patients.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No overdue follow-ups.</p>
        ) : (
          patients.map((p) => (
            <div key={p.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5 flex-shrink-0">{p.condition}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.reason}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Last due: {p.date}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 mt-2 pl-12">
                <div className="flex items-center gap-3 min-w-0">
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                    <Phone className="w-3 h-3" /> {p.phone}
                  </a>
                  <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 truncate">
                    <Mail className="w-3 h-3" /> <span className="truncate">{p.email}</span>
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(p.patientId))}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex-shrink-0"
                >
                  History <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
