import { useEffect, useState } from "react";
import { CheckCircle2, ArrowUpCircle } from "lucide-react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { CriticalAlert, EDPatient } from "@modules/emergency/api";

export function CriticalResults() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  function refresh() {
    api.getCriticalAlerts().then(setAlerts);
    api.getEDPatients().then(setPatients);
  }
  useEffect(refresh, []);

  return (
    <EmergencyLayout active="Critical Results">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Critical Results</h1>
        <p className="text-xs text-slate-500 mt-0.5">Lab and Radiology critical findings requiring acknowledgement.</p>
      </div>
      <div className="flex flex-col gap-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-sm text-slate-500">No critical results pending.</div>
        ) : (
          alerts.map((a) => {
            const patient = patients.find((p) => p.id === a.patientId);
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                  <p className="text-sm font-bold text-slate-800">{patient?.name ?? "—"}</p>
                  <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${a.acknowledged ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>{a.acknowledged ? "Acknowledged" : "Unacknowledged"}</span>
                </div>
                <p className="text-sm font-semibold text-rose-700">{a.source}: {a.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">Notified {a.recipientDoctor} at {a.notifiedAt}{a.escalated && " · Escalated"}</p>
                <div className="flex gap-2 mt-3">
                  {!a.acknowledged && (
                    <button type="button" onClick={() => api.acknowledgeCriticalAlert(a.id).then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                    </button>
                  )}
                  {!a.acknowledged && !a.escalated && (
                    <button type="button" onClick={() => api.escalateCriticalAlert(a.id).then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg px-3 py-1.5">
                      <ArrowUpCircle className="w-3.5 h-3.5" /> Escalate
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </EmergencyLayout>
  );
}
