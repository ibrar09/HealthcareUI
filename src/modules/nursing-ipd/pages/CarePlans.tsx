import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ChevronRight } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { CarePlansQueueItem } from "@modules/nursing-ipd/api";

export function CarePlans() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<CarePlansQueueItem[]>([]);

  useEffect(() => {
    api.getCarePlansQueue().then(setQueue);
  }, []);

  return (
    <NurseLayout active="Care Plans">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Care Plans</h1>
        <p className="text-xs text-slate-500 mt-0.5">Active care plans across your assigned patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {queue.map(({ patient, activeCount }) => (
          <button
            key={patient.id}
            type="button"
            onClick={() => navigate(ROUTES.NURSING.PATIENT_CARE_PLANS(patient.id))}
            className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
          >
            <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
              <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed} · {patient.acuity}</p>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-1 hidden sm:flex">
              <ClipboardCheck className="w-3.5 h-3.5 text-slate-400" /> {activeCount} active plan{activeCount === 1 ? "" : "s"}
            </p>
            <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-teal-50 text-teal-700 border-teal-100">{activeCount} Active</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </NurseLayout>
  );
}
