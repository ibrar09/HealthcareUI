import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, AcuityLevel } from "@modules/emergency/api";
import { ACUITY_LABEL, ACUITY_COLOR } from "@modules/emergency/api";

export function DoctorWorkspace() {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  useEffect(() => {
    api.getEncounters().then((all) => setEncounters(all.filter((e) => ["Waiting", "In Treatment", "Observation", "Disposition Pending"].includes(e.status))));
    api.getEDPatients().then(setPatients);
  }, []);

  const sorted = [...encounters].sort((a, b) => (a.acuityLevel ?? 5) - (b.acuityLevel ?? 5));

  return (
    <EmergencyLayout active="Doctor Workspace">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Doctor Workspace</h1>
        <p className="text-xs text-slate-500 mt-0.5">Active ED patients — assessment, orders, and disposition.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {sorted.map((e) => {
          const patient = patients.find((p) => p.id === e.patientId);
          const level = e.acuityLevel as AcuityLevel | undefined;
          return (
            <button key={e.id} type="button" onClick={() => navigate(ROUTES.EMERGENCY.ENCOUNTER(e.id))} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 flex-wrap">
              <img src={patient?.avatar} alt={patient?.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient?.name}</p><p className="text-[11px] text-slate-400">{e.chiefComplaint} · {e.area ?? "No area assigned"} · {e.assignedDoctor ?? "Unassigned"}</p></div>
              {level && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white flex-shrink-0" style={{ backgroundColor: ACUITY_COLOR[level] }}>{level} — {ACUITY_LABEL[level]}</span>}
              <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600 border-slate-200">{e.status}</span>
            </button>
          );
        })}
      </div>
    </EmergencyLayout>
  );
}
