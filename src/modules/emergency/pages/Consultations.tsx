import { useEffect, useState } from "react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { Consultation, EDPatient } from "@modules/emergency/api";

export function Consultations() {
  const [consults, setConsults] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  function refresh() {
    api.getConsultations().then(setConsults);
    api.getEDPatients().then(setPatients);
  }
  useEffect(refresh, []);

  return (
    <EmergencyLayout active="Consultations">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Consultations</h1>
        <p className="text-xs text-slate-500 mt-0.5">Specialist consultation requests across the ED.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {consults.map((c) => {
          const patient = patients.find((p) => p.id === c.patientId);
          return (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{patient?.name ?? "—"} — {c.specialty}</p><p className="text-[11px] text-slate-400">{c.consultant} · Requested {c.requestedAt}{c.recommendation && ` · ${c.recommendation}`}</p></div>
              <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600">{c.status}</span>
              {c.status !== "Completed" && c.status !== "Declined" && <button type="button" onClick={() => api.advanceConsultation(c.id).then(refresh)} className="text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-2.5 py-1.5 flex-shrink-0">Advance</button>}
            </div>
          );
        })}
      </div>
    </EmergencyLayout>
  );
}
