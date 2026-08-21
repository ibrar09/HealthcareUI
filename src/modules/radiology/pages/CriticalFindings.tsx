import { useEffect, useState } from "react";
import { CheckCircle2, ArrowUpCircle } from "lucide-react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { CriticalFinding, RadiologyPatient } from "@modules/radiology/api";

export function CriticalFindings() {
  const [findings, setFindings] = useState<CriticalFinding[]>([]);
  const [patients, setPatients] = useState<RadiologyPatient[]>([]);

  function refresh() {
    api.getCriticalFindings().then(setFindings);
    api.getRadiologyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  return (
    <RadiologyLayout active="Critical Findings">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Critical Findings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Urgent findings requiring clinician acknowledgement.</p>
      </div>

      <div className="flex flex-col gap-4">
        {findings.map((f) => {
          const patient = patients.find((p) => p.id === f.patientId);
          return (
            <div key={f.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                <p className="text-sm font-bold text-slate-800">{patient?.name ?? "—"}</p>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${f.acknowledged ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>{f.acknowledged ? "Acknowledged" : "Unacknowledged"}</span>
              </div>
              <p className="text-xs text-slate-700">{f.finding}</p>
              <p className="text-[11px] text-slate-400 mt-1">Notified {f.recipientDoctor} at {f.notifiedAt}{f.escalated && " · Escalated"}</p>
              <div className="flex gap-2 mt-3">
                {!f.acknowledged && (
                  <button type="button" onClick={() => api.acknowledgeCriticalFinding(f.id).then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                  </button>
                )}
                {!f.acknowledged && !f.escalated && (
                  <button type="button" onClick={() => api.escalateCriticalFinding(f.id).then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg px-3 py-1.5">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Escalate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </RadiologyLayout>
  );
}
