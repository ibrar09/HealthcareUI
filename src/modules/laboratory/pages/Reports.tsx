import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabResult, LabOrder, LabPatient } from "@modules/laboratory/api";

export function Reports() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);
  const [amending, setAmending] = useState<LabResult | null>(null);
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");

  function refresh() {
    api.getResults().then((all) => setResults(all.filter((r) => r.status === "Released" || r.status === "Amended")));
    api.getOrders().then(setOrders);
    api.getLabPatients().then(setPatients);
  }
  useEffect(refresh, []);

  function handleAmend() {
    if (!amending || !newValue.trim() || !reason.trim()) return;
    api.amendResult(amending.id, newValue.trim(), reason.trim(), "Sr. MLS Fatima Zahra").then(() => {
      setAmending(null);
      setNewValue("");
      setReason("");
      refresh();
    });
  }

  return (
    <LaboratoryLayout active="Reports">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Reports & Amendments</h1>
        <p className="text-xs text-slate-500 mt-0.5">Released results. Amending a report never overwrites history — it versions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {results.map((r) => {
          const order = orders.find((o) => o.id === r.orderId);
          const patient = patients.find((p) => p.id === r.patientId);
          return (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{patient?.name ?? "—"} — {r.testName}</p>
                <p className="text-[11px] text-slate-400">{order?.accessionNo} · Value: {r.value} {r.unit} · Ref: {r.refRangeDisplay} · v{r.version}</p>
                {r.amendReason && <p className="text-[11px] text-amber-600 mt-0.5">Amended: {r.amendReason}</p>}
              </div>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${r.status === "Amended" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{r.status}</span>
              <button type="button" onClick={() => { setAmending(r); setNewValue(r.value); }} className="text-[11px] font-semibold text-orange-700 hover:bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5 flex-shrink-0">Amend</button>
            </div>
          );
        })}
      </div>

      {amending && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 flex items-center justify-center p-4" onClick={() => setAmending(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-slate-800 mb-3">Amend {amending.testName}</h2>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">New Value</label>
            <input value={newValue} onChange={(e) => setNewValue(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-3" />
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Reason for Amendment</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-4" />
            <button type="button" onClick={handleAmend} disabled={!newValue.trim() || !reason.trim()} className="w-full text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 rounded-lg px-4 py-2.5">Save Amendment</button>
          </div>
        </div>
      )}
    </LaboratoryLayout>
  );
}
