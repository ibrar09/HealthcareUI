import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { CompoundPreparation, PharmacyPatient } from "@modules/pharmacy/api";

export function IVCompounding() {
  const [preps, setPreps] = useState<CompoundPreparation[]>([]);
  const [patients, setPatients] = useState<PharmacyPatient[]>([]);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.getCompounds().then(setPreps);
    api.getPharmacyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  function handleVerify(id: string) {
    setError(null);
    try {
      api.verifyCompound(id, "Pharm. Manager Adeel Shah").then(refresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    }
  }

  return (
    <PharmacyLayout active="IV / Compounding">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">IV / Compounding</h1>
        <p className="text-xs text-slate-500 mt-0.5">Sterile and non-sterile preparations. High-risk preparations require an independent double-check.</p>
      </div>

      {error && <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>}

      <div className="flex flex-col gap-4">
        {preps.map((p) => {
          const patient = patients.find((x) => x.id === p.patientId);
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                <p className="text-sm font-bold text-slate-800">{p.medicationName}</p>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${p.status === "Verified" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{p.status}</span>
              </div>
              <p className="text-xs text-slate-500">Patient: {patient?.name ?? "—"} · Batch {p.batchNo} · Final volume {p.finalVolume}</p>
              <p className="text-xs text-slate-500 mt-1">Ingredients: {p.ingredients}</p>
              <p className="text-xs text-slate-500 mt-1">Prepared by {p.preparedBy} · Beyond-use: {p.beyondUseDate}</p>
              {p.checkedBy && <p className="text-xs text-emerald-600 mt-1">Checked by {p.checkedBy}</p>}
              {p.status === "Pending Check" && (
                <button type="button" onClick={() => handleVerify(p.id)} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Independent Double-Check
                </button>
              )}
            </div>
          );
        })}
      </div>
    </PharmacyLayout>
  );
}
