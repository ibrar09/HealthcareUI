import { useEffect, useState } from "react";
import { PackageX } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { Recall } from "@modules/pharmacy/api";

const SEVERITY_STYLE = { critical: "bg-rose-50 text-rose-700 border-rose-100", high: "bg-orange-50 text-orange-700 border-orange-100", medium: "bg-amber-50 text-amber-700 border-amber-100" };

export function MedicationRecall() {
  const [recalls, setRecalls] = useState<Recall[]>([]);
  function refresh() { api.getRecalls().then(setRecalls); }
  useEffect(refresh, []);

  return (
    <PharmacyLayout active="Medication Recall">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Medication Recall</h1>
        <p className="text-xs text-slate-500 mt-0.5">Active and closed recalls. Matching batches are automatically quarantined.</p>
      </div>

      <div className="flex flex-col gap-4">
        {recalls.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><PackageX className="w-4 h-4 text-rose-500" /> {r.id} — {r.medicationName}</p>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${r.status === "Open" ? SEVERITY_STYLE[r.severity] : "bg-slate-100 text-slate-500 border-slate-200"}`}>{r.status}</span>
            </div>
            <p className="text-xs text-slate-600">Batch {r.batchNo} · Affected qty: {r.affectedQuantity} · Severity: {r.severity}</p>
            <p className="text-xs text-slate-500 mt-1">{r.reason}</p>
            <p className="text-[11px] text-slate-400 mt-1">Created {r.createdAt}</p>
            {r.status === "Open" && (
              <button type="button" onClick={() => api.closeRecall(r.id).then(refresh)} className="mt-3 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5">Close Recall</button>
            )}
          </div>
        ))}
      </div>
    </PharmacyLayout>
  );
}
