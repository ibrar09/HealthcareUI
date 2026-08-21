import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, EDOrder, CriticalAlert } from "@modules/emergency/api";
import { ACUITY_LABEL, ACUITY_COLOR } from "@modules/emergency/api";

export function Handover() {
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);
  const [orders, setOrders] = useState<EDOrder[]>([]);
  const [critical, setCritical] = useState<CriticalAlert[]>([]);

  useEffect(() => {
    api.getEncounters().then((all) => setEncounters(all.filter((e) => !["Discharged", "Admitted", "Transferred", "LWBS", "AMA", "Deceased"].includes(e.status))));
    api.getEDPatients().then(setPatients);
    api.getOrders().then(setOrders);
    api.getCriticalAlerts().then(setCritical);
  }, []);

  return (
    <EmergencyLayout active="Handover">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">ED Handover</h1>
        <p className="text-xs text-slate-500 mt-0.5">Structured briefing for the incoming clinician — all active patients.</p>
      </div>

      <div className="flex flex-col gap-4">
        {encounters.map((e) => {
          const patient = patients.find((p) => p.id === e.patientId);
          const pending = orders.filter((o) => o.encounterId === e.id && o.status !== "Completed" && o.status !== "Critical");
          const alerts = critical.filter((c) => c.encounterId === e.id && !c.acknowledged);
          if (!patient) return null;
          return (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <p className="text-sm font-bold text-slate-800">{patient.name} <span className="text-[11px] font-normal text-slate-400">{e.area ?? "Waiting"} · {e.assignedDoctor ?? "Unassigned"}</span></p>
                {e.acuityLevel && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: ACUITY_COLOR[e.acuityLevel] }}>{e.acuityLevel} — {ACUITY_LABEL[e.acuityLevel]}</span>}
              </div>
              <p className="text-xs text-slate-600 mb-2">{e.chiefComplaint}</p>
              {alerts.length > 0 && <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> {alerts.length} unacknowledged critical result(s)</p>}
              {pending.length > 0 && <p className="text-xs text-amber-600">Pending: {pending.map((o) => o.description).join(", ")}</p>}
              {alerts.length === 0 && pending.length === 0 && <p className="text-xs text-slate-400">No pending items.</p>}
            </div>
          );
        })}
      </div>
    </EmergencyLayout>
  );
}
