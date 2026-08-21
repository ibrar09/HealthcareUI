import { useEffect, useState } from "react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { QcRecord, Calibration, LabAnalyzer } from "@modules/laboratory/api";

type Tab = "qc" | "calibration";

export function QualityControl() {
  const [tab, setTab] = useState<Tab>("qc");
  const [qc, setQc] = useState<QcRecord[]>([]);
  const [calibrations, setCalibrations] = useState<Calibration[]>([]);
  const [analyzers, setAnalyzers] = useState<LabAnalyzer[]>([]);

  useEffect(() => {
    api.getQcRecords().then(setQc);
    api.getCalibrations().then(setCalibrations);
    api.getAnalyzers().then(setAnalyzers);
  }, []);

  return (
    <LaboratoryLayout active="Quality Control">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Quality Control</h1>
        <p className="text-xs text-slate-500 mt-0.5">QC runs and analyzer calibration history. QC failures restrict testing until resolved.</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => setTab("qc")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "qc" ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>QC Records</button>
        <button type="button" onClick={() => setTab("calibration")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "calibration" ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Calibration</button>
      </div>

      {tab === "qc" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {qc.map((r) => {
            const a = analyzers.find((x) => x.id === r.analyzerId);
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{r.testName} — {r.level}</p><p className="text-[11px] text-slate-400">{a?.name ?? "—"} · Target {r.target} · Result {r.result} · {r.performedBy} · {r.at}</p></div>
                <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${r.outcome === "Pass" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{r.outcome}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {calibrations.map((c) => {
            const a = analyzers.find((x) => x.id === c.analyzerId);
            return (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{a?.name ?? "—"}</p><p className="text-[11px] text-slate-400">Lot {c.lot} · {c.performedBy} · {c.at}</p></div>
                <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${c.status === "Pass" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{c.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </LaboratoryLayout>
  );
}
