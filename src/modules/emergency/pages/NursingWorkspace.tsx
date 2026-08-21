import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, EDOrder } from "@modules/emergency/api";

export function NursingWorkspace() {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);
  const [orders, setOrders] = useState<EDOrder[]>([]);

  useEffect(() => {
    api.getEncounters().then((all) => setEncounters(all.filter((e) => e.assignedNurse)));
    api.getEDPatients().then(setPatients);
    api.getOrders().then(setOrders);
  }, []);

  return (
    <EmergencyLayout active="Nursing Workspace">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Nursing Workspace</h1>
        <p className="text-xs text-slate-500 mt-0.5">Assigned patients, pending medications, and monitoring tasks.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {encounters.map((e) => {
          const patient = patients.find((p) => p.id === e.patientId);
          const pendingMeds = orders.filter((o) => o.encounterId === e.id && o.type === "Medication" && o.status !== "Completed").length;
          return (
            <button key={e.id} type="button" onClick={() => navigate(ROUTES.EMERGENCY.ENCOUNTER(e.id))} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 flex-wrap">
              <img src={patient?.avatar} alt={patient?.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient?.name}</p><p className="text-[11px] text-slate-400">{e.area} · {e.assignedNurse}</p></div>
              {pendingMeds > 0 && <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 bg-amber-50 text-amber-700 border border-amber-100">{pendingMeds} med(s) pending</span>}
              <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600 border-slate-200">{e.status}</span>
            </button>
          );
        })}
      </div>
    </EmergencyLayout>
  );
}
