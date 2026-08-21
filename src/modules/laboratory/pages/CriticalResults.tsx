import { useEffect, useState } from "react";
import { CheckCircle2, ArrowUpCircle } from "lucide-react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { CriticalResult, LabPatient } from "@modules/laboratory/api";

export function CriticalResults() {
  const [criticalResults, setCriticalResults] = useState<CriticalResult[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);

  function refresh() {
    api.getCriticalResults().then(setCriticalResults);
    api.getLabPatients().then(setPatients);
  }
  useEffect(refresh, []);

  return (
    <LaboratoryLayout active="Critical Results">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Critical Results</h1>
        <p className="text-xs text-slate-500 mt-0.5">Life-threatening values requiring immediate clinician acknowledgement.</p>
      </div>

      <div className="flex flex-col gap-4">
        {criticalResults.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-sm text-slate-500">No critical results pending.</div>
        ) : (
          criticalResults.map((c) => {
            const patient = patients.find((p) => p.id === c.patientId);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                  <p className="text-sm font-bold text-slate-800">{patient?.name ?? "—"}</p>
                  <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${c.acknowledged ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>{c.acknowledged ? "Acknowledged" : "Unacknowledged"}</span>
                </div>
                <p className="text-sm font-semibold text-rose-700">{c.testName}: {c.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">Notified {c.recipientDoctor} at {c.notifiedAt}{c.escalated && " · Escalated"}</p>
                <div className="flex gap-2 mt-3">
                  {!c.acknowledged && (
                    <button type="button" onClick={() => api.acknowledgeCriticalResult(c.id).then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                    </button>
                  )}
                  {!c.acknowledged && !c.escalated && (
                    <button type="button" onClick={() => api.escalateCriticalResult(c.id).then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg px-3 py-1.5">
                      <ArrowUpCircle className="w-3.5 h-3.5" /> Escalate
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </LaboratoryLayout>
  );
}
