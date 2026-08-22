import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, VitalReading } from "@modules/emergency/api";

export function Monitoring() {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);
  const [readings, setReadings] = useState<VitalReading[]>([]);

  useEffect(() => {
    api.getEncounters().then((all) => setEncounters(all.filter((e) => ["In Treatment", "Observation"].includes(e.status))));
    api.getEDPatients().then(setPatients);
    api.getLatestVitalsByEncounter().then(setReadings);
  }, []);

  return (
    <EmergencyLayout active="Monitoring">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Monitoring</h1>
        <p className="text-xs text-slate-500 mt-0.5">Latest continuous observations across active patients.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {encounters.map((e) => {
          const patient = patients.find((p) => p.id === e.patientId);
          const latest = [...readings].filter((r) => r.encounterId === e.id).sort((a, b) => b.at.localeCompare(a.at))[0];
          return (
            <button key={e.id} type="button" onClick={() => navigate(ROUTES.EMERGENCY.ENCOUNTER(e.id))} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 flex-wrap">
              <img src={patient?.avatar} alt={patient?.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 w-40 flex-shrink-0"><p className="text-sm font-bold text-slate-800">{patient?.name}</p><p className="text-[11px] text-slate-400">{e.area}</p></div>
              <div className="min-w-0 flex-1 text-xs text-slate-600">
                {latest ? <>Last recorded {latest.at}: {latest.bp && `BP ${latest.bp} `}{latest.hr && `HR ${latest.hr} `}{latest.spo2 && `SpO₂ ${latest.spo2}%`}</> : "No readings yet"}
              </div>
            </button>
          );
        })}
      </div>
    </EmergencyLayout>
  );
}
