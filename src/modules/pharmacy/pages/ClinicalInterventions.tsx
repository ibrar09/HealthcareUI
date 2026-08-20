import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { Intervention, PharmacyPatient } from "@modules/pharmacy/api";

const SEVERITY_STYLE = { critical: "bg-rose-50 text-rose-700 border-rose-100", high: "bg-orange-50 text-orange-700 border-orange-100", medium: "bg-amber-50 text-amber-700 border-amber-100" };

export function ClinicalInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [patients, setPatients] = useState<PharmacyPatient[]>([]);
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});

  function refresh() {
    api.getInterventions().then(setInterventions);
    api.getPharmacyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  function handleResolve(id: string) {
    api.resolveIntervention(id, responseDrafts[id] ?? "").then(refresh);
  }

  return (
    <PharmacyLayout active="Clinical Interventions">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Clinical Interventions</h1>
        <p className="text-xs text-slate-500 mt-0.5">Pharmacist-initiated issues raised with prescribers.</p>
      </div>

      <div className="flex flex-col gap-4">
        {interventions.map((i) => {
          const patient = patients.find((p) => p.id === i.patientId);
          return (
            <div key={i.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                <p className="text-sm font-bold text-slate-800">{patient?.name ?? "—"} — {i.medicationName}</p>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${SEVERITY_STYLE[i.severity]}`}>{i.issueType}</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">{i.description}</p>
              <p className="text-xs text-violet-700"><span className="font-semibold">Recommendation:</span> {i.recommendation}</p>
              <p className="text-[11px] text-slate-400 mt-1">{i.createdAt}</p>

              {i.status === "Open" ? (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <textarea
                    value={responseDrafts[i.id] ?? ""}
                    onChange={(e) => setResponseDrafts((prev) => ({ ...prev, [i.id]: e.target.value }))}
                    rows={2}
                    placeholder="Prescriber response…"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200"
                  />
                  <button type="button" onClick={() => handleResolve(i.id)} disabled={!responseDrafts[i.id]?.trim()} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 rounded-lg px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              ) : (
                <p className="mt-3 pt-3 border-t border-slate-50 text-xs text-emerald-600"><span className="font-semibold">Resolved</span> — {i.prescriberResponse}</p>
              )}
            </div>
          );
        })}
      </div>
    </PharmacyLayout>
  );
}
