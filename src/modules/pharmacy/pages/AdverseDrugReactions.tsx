import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { AdverseReaction, PharmacyPatient } from "@modules/pharmacy/api";

export function AdverseDrugReactions() {
  const [adrs, setAdrs] = useState<AdverseReaction[]>([]);
  const [patients, setPatients] = useState<PharmacyPatient[]>([]);

  function refresh() {
    api.getAdrs().then(setAdrs);
    api.getPharmacyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  return (
    <PharmacyLayout active="Adverse Drug Reactions">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Adverse Drug Reactions</h1>
        <p className="text-xs text-slate-500 mt-0.5">Reported ADRs across your patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {adrs.map((a) => {
          const patient = patients.find((p) => p.id === a.patientId);
          return (
            <div key={a.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                <p className="text-sm font-bold text-slate-800">{patient?.name ?? "—"} — {a.medicationName}</p>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${a.status === "Reviewed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{a.status}</span>
              </div>
              <p className="text-xs text-slate-600">{a.reaction} — {a.severity} · Onset: {a.onset}</p>
              <p className="text-xs text-slate-500 mt-0.5">Action taken: {a.actionTaken}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Reported by {a.reportedBy} · {a.reportedAt}</p>
              {a.status === "Reported" && (
                <button type="button" onClick={() => api.reviewAdr(a.id).then(refresh)} className="mt-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5">Mark Reviewed</button>
              )}
            </div>
          );
        })}
      </div>
    </PharmacyLayout>
  );
}
