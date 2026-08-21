import { useEffect, useState } from "react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { RejectedSpecimen, LabPatient } from "@modules/laboratory/api";

export function Rejected() {
  const [rejections, setRejections] = useState<RejectedSpecimen[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);

  function refresh() {
    api.getRejections().then(setRejections);
    api.getLabPatients().then(setPatients);
  }
  useEffect(refresh, []);

  return (
    <LaboratoryLayout active="Rejected & Recollection">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Rejected Specimens & Recollection</h1>
        <p className="text-xs text-slate-500 mt-0.5">Rejected specimens are never deleted — full history is kept.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {rejections.map((r) => {
          const patient = patients.find((p) => p.id === r.patientId);
          return (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{patient?.name ?? "—"} — {r.testName}</p>
                <p className="text-[11px] text-slate-400">{r.reason} · Rejected by {r.rejectedBy} · {r.rejectedAt}</p>
              </div>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${r.recollectionStatus === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{r.recollectionStatus === "Required" ? "Recollection Required" : "Recollected"}</span>
              {r.recollectionStatus === "Required" && (
                <button type="button" onClick={() => api.markRecollected(r.id).then(refresh)} className="text-[11px] font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg px-2.5 py-1.5 flex-shrink-0">Mark Recollected</button>
              )}
            </div>
          );
        })}
      </div>
    </LaboratoryLayout>
  );
}
