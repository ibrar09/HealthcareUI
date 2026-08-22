import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { Disposition as DispositionType, EDPatient } from "@modules/emergency/api";

const TYPE_STYLE: Record<string, string> = {
  "Discharge Home": "bg-emerald-50 text-emerald-700", Admit: "bg-blue-50 text-blue-700", Transfer: "bg-purple-50 text-purple-700",
  Observation: "bg-amber-50 text-amber-700", Referred: "bg-slate-100 text-slate-600", "Left Before Treatment": "bg-rose-50 text-rose-700",
  "Against Medical Advice": "bg-rose-50 text-rose-700", Deceased: "bg-slate-800 text-white",
};

export function Disposition() {
  const [dispositions, setDispositions] = useState<DispositionType[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  useEffect(() => {
    api.getDispositions().then(setDispositions);
    api.getEDPatients().then(setPatients);
  }, []);

  return (
    <EmergencyLayout active="Disposition">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Disposition</h1>
        <p className="text-xs text-slate-500 mt-0.5">Recorded clinical decisions and encounter outcomes.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {dispositions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No dispositions recorded yet this shift.</p>
        ) : (
          dispositions.map((d) => {
            const patient = patients.find((p) => p.id === d.patientId);
            return (
              <div key={d.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                <LogOut className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{patient?.name ?? "—"}</p><p className="text-[11px] text-slate-400">{d.decidedBy} · {d.decidedAt} · {d.notes}</p></div>
                <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${TYPE_STYLE[d.type] ?? "bg-slate-100 text-slate-600"}`}>{d.type}</span>
              </div>
            );
          })
        )}
      </div>
    </EmergencyLayout>
  );
}
