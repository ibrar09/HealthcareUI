import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, AlertTriangle } from "lucide-react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, ArrivalMethod } from "@modules/emergency/api";

const ARRIVAL_METHODS: ArrivalMethod[] = ["Walk-in", "Ambulance", "Police", "Referral", "Transfer"];

export function Arrivals() {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  useEffect(() => {
    api.getEncounters().then((all) => setEncounters(all.filter((e) => e.status === "Arrived")));
    api.getEDPatients().then(setPatients);
  }, []);

  return (
    <EmergencyLayout active="Arrivals & Registration">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Arrivals & Registration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Patient identification and registration — MPI-matched or temporary identity for unidentified patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-slate-400" /> Recently Arrived, Pending Triage</p>
        {encounters.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No new arrivals awaiting triage.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-50">
            {encounters.map((e) => {
              const patient = patients.find((p) => p.id === e.patientId);
              return (
                <div key={e.id} className="flex items-center gap-4 py-3 flex-wrap">
                  <img src={patient?.avatar} alt={patient?.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {patient?.name}
                      {patient?.isTemporaryIdentity && <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5"><AlertTriangle className="w-3 h-3" /> Temporary Identity</span>}
                    </p>
                    <p className="text-[11px] text-slate-400">{patient?.mrn} · {e.arrivalMethod} · Arrived {e.arrivedAt} · {e.chiefComplaint}</p>
                  </div>
                  <button type="button" onClick={() => navigate(ROUTES.EMERGENCY.TRIAGE)} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 flex-shrink-0">Send to Triage</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-bold text-slate-800 mb-3">Registration Reference</p>
        <p className="text-xs text-slate-500 mb-2">Arrival methods supported: {ARRIVAL_METHODS.join(", ")}.</p>
        <p className="text-xs text-slate-500">Unidentified patients are registered under a temporary emergency identity (e.g. <span className="font-mono">UNKNOWN-ED-2026-00021</span>) and never deleted — their clinical history is preserved and reconciled once identity is confirmed.</p>
      </div>
    </EmergencyLayout>
  );
}
