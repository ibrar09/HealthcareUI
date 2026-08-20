import { useEffect, useState } from "react";
import { Syringe, CheckCircle2 } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { NurseProcedure, NursePatient } from "@modules/nursing-ipd/api";

export function Procedures() {
  const [procedures, setProcedures] = useState<NurseProcedure[]>([]);
  const [patients, setPatients] = useState<NursePatient[]>([]);

  function refresh() {
    api.getProcedures().then(setProcedures);
    api.getMyPatients().then(setPatients);
  }

  useEffect(refresh, []);

  return (
    <NurseLayout active="Procedures">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Procedures</h1>
        <p className="text-xs text-slate-500 mt-0.5">Bedside procedures scheduled across your assigned patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {[...procedures].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)).map((proc) => {
          const patient = patients.find((p) => p.id === proc.patientId);
          if (!patient) return null;
          return (
            <div key={proc.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-14 flex-shrink-0"><p className="text-sm font-bold text-slate-800">{proc.scheduledAt}</p></div>
              <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
              </div>
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 min-w-0 flex-1">
                <Syringe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {proc.name}
              </p>
              {proc.status === "Completed" ? (
                <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-emerald-50 text-emerald-700 border-emerald-100">Completed {proc.performedAt}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => api.completeProcedure(proc.id).then(refresh)}
                  className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 flex-shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                </button>
              )}
            </div>
          );
        })}
      </div>
    </NurseLayout>
  );
}
