import { useEffect, useState } from "react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { EDProcedure, EDPatient } from "@modules/emergency/api";

export function Procedures() {
  const [procedures, setProcedures] = useState<EDProcedure[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  useEffect(() => {
    api.getProcedures().then(setProcedures);
    api.getEDPatients().then(setPatients);
  }, []);

  return (
    <EmergencyLayout active="Procedures">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Procedures</h1>
        <p className="text-xs text-slate-500 mt-0.5">Bedside procedures performed across the ED.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {procedures.map((p) => {
          const patient = patients.find((x) => x.id === p.patientId);
          return (
            <div key={p.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                <p className="text-sm font-semibold text-slate-800">{patient?.name ?? "—"} — {p.name}</p>
                <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${p.outcome === "Successful" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.outcome}</span>
              </div>
              <p className="text-xs text-slate-500">{p.performer} · {p.at} · Indication: {p.indication}</p>
              <p className="text-xs text-slate-600 mt-1">{p.findings}</p>
            </div>
          );
        })}
      </div>
    </EmergencyLayout>
  );
}
