import { useEffect, useState } from "react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyCharge } from "@modules/radiology/api";

export function Billing() {
  const [charges, setCharges] = useState<RadiologyCharge[]>([]);
  function refresh() { api.getCharges().then(setCharges); }
  useEffect(refresh, []);

  return (
    <RadiologyLayout active="Billing">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Billing</h1>
        <p className="text-xs text-slate-500 mt-0.5">Charges generated from completed radiology studies.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {charges.map((c) => (
          <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{c.study}</p><p className="text-[11px] text-slate-400">{c.payer}</p></div>
            <p className="text-sm font-bold text-slate-800 flex-shrink-0">${c.amount}</p>
            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${c.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : c.status === "Billed" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{c.status}</span>
            {c.status !== "Paid" && <button type="button" onClick={() => api.markCharged(c.id, c.status === "Pending" ? "Billed" : "Paid").then(refresh)} className="text-[11px] font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg px-2.5 py-1.5 flex-shrink-0">Advance</button>}
          </div>
        ))}
      </div>
    </RadiologyLayout>
  );
}
