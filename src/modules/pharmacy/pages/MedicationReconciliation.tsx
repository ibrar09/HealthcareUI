import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { PharmacyPatient, ReconciliationItem } from "@modules/pharmacy/api";

const DECISIONS: ReconciliationItem["decision"][] = ["Continue", "Stop", "Modify", "New", "Unclear"];
const DECISION_STYLE: Record<ReconciliationItem["decision"], string> = {
  Continue: "bg-emerald-50 text-emerald-700 border-emerald-100", Stop: "bg-rose-50 text-rose-700 border-rose-100",
  Modify: "bg-amber-50 text-amber-700 border-amber-100", New: "bg-blue-50 text-blue-700 border-blue-100", Unclear: "bg-slate-100 text-slate-600 border-slate-200",
};

export function MedicationReconciliation() {
  const [patients, setPatients] = useState<PharmacyPatient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPharmacyPatients().then((p) => { setPatients(p.filter((x) => x.setting === "Inpatient")); if (p.length) setSelectedId(p.find((x) => x.setting === "Inpatient")?.id ?? null); });
  }, []);

  useEffect(() => {
    if (selectedId) api.getReconciliation(selectedId).then(setItems);
  }, [selectedId]);

  function updateDecision(index: number, decision: ReconciliationItem["decision"]) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, decision } : it)));
  }

  function handleSave() {
    if (!selectedId) return;
    api.saveReconciliation(selectedId, items).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <PharmacyLayout active="Medication Reconciliation">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Medication Reconciliation</h1>
        <p className="text-xs text-slate-500 mt-0.5">Compare home medications against hospital orders at admission/transfer/discharge.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {patients.map((p) => (
          <button key={p.id} type="button" onClick={() => setSelectedId(p.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${selectedId === p.id ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No reconciliation data for this patient.</p>
        ) : (
          items.map((item, i) => (
            <div key={item.medicationName} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-700 min-w-0 flex-1">{item.medicationName}</p>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${item.home ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-400"}`}>Home {item.home ? "✓" : "—"}</span>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${item.hospital ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-400"}`}>Hospital {item.hospital ? "✓" : "—"}</span>
              <select value={item.decision} onChange={(e) => updateDecision(i, e.target.value as ReconciliationItem["decision"])} className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border ${DECISION_STYLE[item.decision]}`}>
                {DECISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <button type="button" onClick={handleSave} className="mt-4 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-4 py-2.5">
          {saved ? "Saved" : "Save Reconciliation"}
        </button>
      )}
    </PharmacyLayout>
  );
}
