import { useEffect, useState } from "react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabAnalyzer, MaintenanceRecord, AnalyzerStatus } from "@modules/laboratory/api";

type Tab = "status" | "maintenance";
const STATUS_OPTIONS: AnalyzerStatus[] = ["Online", "Offline", "Maintenance", "Error"];
const STATUS_STYLE: Record<AnalyzerStatus, string> = { Online: "bg-emerald-50 text-emerald-700 border-emerald-100", Offline: "bg-slate-100 text-slate-500 border-slate-200", Maintenance: "bg-amber-50 text-amber-700 border-amber-100", Error: "bg-rose-50 text-rose-700 border-rose-100" };

export function Analyzers() {
  const [tab, setTab] = useState<Tab>("status");
  const [analyzers, setAnalyzers] = useState<LabAnalyzer[]>([]);
  const [log, setLog] = useState<MaintenanceRecord[]>([]);

  function refresh() {
    api.getAnalyzers().then(setAnalyzers);
    api.getMaintenanceLog().then(setLog);
  }
  useEffect(refresh, []);

  return (
    <LaboratoryLayout active="Analyzers">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Analyzers</h1>
        <p className="text-xs text-slate-500 mt-0.5">Status, connectivity, and maintenance across laboratory analyzers.</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => setTab("status")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "status" ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Status</button>
        <button type="button" onClick={() => setTab("maintenance")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "maintenance" ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Maintenance Log</button>
      </div>

      {tab === "status" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {analyzers.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{a.name}</p><p className="text-[11px] text-slate-400">{a.manufacturer} · {a.section} · Last comms {a.lastCommunication}</p></div>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[a.status]}`}>{a.status}</span>
              <select value={a.status} onChange={(e) => api.setAnalyzerStatus(a.id, e.target.value as AnalyzerStatus).then(refresh)} className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 flex-shrink-0">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {log.map((m) => {
            const a = analyzers.find((x) => x.id === m.analyzerId);
            return <div key={m.id} className="px-5 py-3 text-xs text-slate-600"><span className="font-semibold text-slate-800">{m.type}</span> — {a?.name ?? "—"} · {m.performedBy} · {m.at}<p className="text-[11px] text-slate-400 mt-0.5">{m.notes}</p></div>;
          })}
        </div>
      )}
    </LaboratoryLayout>
  );
}
