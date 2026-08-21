import { useEffect, useState } from "react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { Referral, RadiologyPatient } from "@modules/radiology/api";

export function Referrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patients, setPatients] = useState<RadiologyPatient[]>([]);

  function refresh() {
    api.getReferrals().then(setReferrals);
    api.getRadiologyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  return (
    <RadiologyLayout active="Referrals">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Referrals</h1>
        <p className="text-xs text-slate-500 mt-0.5">External and internal referrals.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {referrals.map((r) => {
          const patient = patients.find((p) => p.id === r.patientId);
          return (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{patient?.name ?? "—"}</p><p className="text-[11px] text-slate-400">{r.referringOrg} — {r.referringDoctor} · {r.reason}</p></div>
              <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600 border-slate-200">{r.status}</span>
              {r.status !== "Completed" && <button type="button" onClick={() => api.advanceReferral(r.id).then(refresh)} className="text-[11px] font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg px-2.5 py-1.5 flex-shrink-0">Advance</button>}
            </div>
          );
        })}
      </div>
    </RadiologyLayout>
  );
}
