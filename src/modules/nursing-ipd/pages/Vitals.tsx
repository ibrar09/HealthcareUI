import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { VitalsEntryModal } from "@modules/nursing-ipd/components/VitalsEntryModal";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, NursePatientVitals } from "@modules/nursing-ipd/api";

export function Vitals() {
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [target, setTarget] = useState<NursePatient | null>(null);

  function refresh() {
    api.getMyPatients().then(setPatients);
  }

  useEffect(refresh, []);

  function handleSave(vitals: NursePatientVitals) {
    if (!target) return;
    api.recordVitals(target.id, vitals).then(() => {
      refresh();
      setTarget(null);
    });
  }

  return (
    <NurseLayout active="Vitals">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Vitals</h1>
        <p className="text-xs text-slate-500 mt-0.5">Latest recorded vitals across your assigned patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {patients.map((patient) => (
          <div key={patient.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
            <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
            <div className="min-w-0 w-40 flex-shrink-0">
              <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
              <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 flex-1 min-w-[240px]">
              <div><p className="text-[9px] text-slate-400 uppercase">BP</p><p className="text-xs font-bold text-slate-800">{patient.vitals.bp ?? "—"}</p></div>
              <div><p className="text-[9px] text-slate-400 uppercase">HR</p><p className="text-xs font-bold text-slate-800">{patient.vitals.hr ?? "—"}</p></div>
              <div><p className="text-[9px] text-slate-400 uppercase">SpO₂</p><p className={`text-xs font-bold ${(patient.vitals.spo2 ?? 100) < 94 ? "text-rose-600" : "text-slate-800"}`}>{patient.vitals.spo2 ?? "—"}%</p></div>
              <div><p className="text-[9px] text-slate-400 uppercase">Temp</p><p className="text-xs font-bold text-slate-800">{patient.vitals.temp ?? "—"}°C</p></div>
              <div><p className="text-[9px] text-slate-400 uppercase">RR</p><p className="text-xs font-bold text-slate-800">{patient.vitals.rr ?? "—"}</p></div>
              <div><p className="text-[9px] text-slate-400 uppercase">Recorded</p><p className="text-xs font-bold text-slate-800">{patient.vitals.recordedAt ?? "—"}</p></div>
            </div>
            <button
              type="button"
              onClick={() => setTarget(patient)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 flex-shrink-0"
            >
              <Activity className="w-3.5 h-3.5" /> Record
            </button>
          </div>
        ))}
      </div>

      {target && <VitalsEntryModal current={target.vitals} onClose={() => setTarget(null)} onSave={handleSave} />}
    </NurseLayout>
  );
}
