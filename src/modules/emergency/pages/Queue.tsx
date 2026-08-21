import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, AcuityLevel } from "@modules/emergency/api";
import { ACUITY_LABEL, ACUITY_COLOR } from "@modules/emergency/api";

export function Queue() {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  useEffect(() => {
    api.getEncounters().then((all) => setEncounters(all.filter((e) => e.status === "Waiting")));
    api.getEDPatients().then(setPatients);
  }, []);

  const sorted = [...encounters].sort((a, b) => (a.acuityLevel ?? 5) - (b.acuityLevel ?? 5));

  return (
    <EmergencyLayout active="Queue & Waiting Room">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">ED Queue & Waiting Room</h1>
        <p className="text-xs text-slate-500 mt-0.5">Prioritized by acuity, not simple first-in-first-out.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {sorted.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No patients currently waiting.</p>
        ) : (
          sorted.map((e) => {
            const patient = patients.find((p) => p.id === e.patientId);
            const level = e.acuityLevel as AcuityLevel;
            return (
              <button key={e.id} type="button" onClick={() => navigate(ROUTES.EMERGENCY.ENCOUNTER(e.id))} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 flex-wrap">
                <img src={patient?.avatar} alt={patient?.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient?.name}</p><p className="text-[11px] text-slate-400">{patient?.mrn} · {e.chiefComplaint} · Arrived {e.arrivedAt}</p></div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white flex-shrink-0" style={{ backgroundColor: ACUITY_COLOR[level] }}>{level} — {ACUITY_LABEL[level]}</span>
              </button>
            );
          })
        )}
      </div>
    </EmergencyLayout>
  );
}
