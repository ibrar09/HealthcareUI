import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { ControlledTransaction, ControlledAction } from "@modules/pharmacy/api";

const ACTIONS: ControlledAction[] = ["Received", "Dispensed", "Administered", "Returned", "Wasted"];

export function ControlledMedications() {
  const [transactions, setTransactions] = useState<ControlledTransaction[]>([]);
  const [medicationName, setMedicationName] = useState("Morphine Sulfate 10mg/mL");
  const [batchNo, setBatchNo] = useState("MOR-2610");
  const [action, setAction] = useState<ControlledAction>("Dispensed");
  const [quantity, setQuantity] = useState("1");
  const [witness, setWitness] = useState("");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.getControlledTransactions().then(setTransactions);
  }
  useEffect(refresh, []);

  function handleRecord() {
    setError(null);
    try {
      api.recordControlledTransaction({ medicationName, batchNo, action, quantity: Number(quantity), performedBy: "Pharm. Zainab Hussain", witness: witness.trim() || undefined }).then(() => {
        setWitness("");
        refresh();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record transaction.");
    }
  }

  return (
    <PharmacyLayout active="Controlled Medications">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Controlled Medications</h1>
        <p className="text-xs text-slate-500 mt-0.5">Restricted-access transaction log. All wastage requires a witness.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
        <p className="text-xs font-bold text-slate-800 mb-3">Record Transaction</p>
        {error && <p className="text-xs text-rose-600 font-semibold mb-2">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-3">
          <input value={medicationName} onChange={(e) => setMedicationName(e.target.value)} placeholder="Medication" className="text-xs rounded-lg border border-slate-200 px-3 py-2" />
          <input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} placeholder="Batch No." className="text-xs rounded-lg border border-slate-200 px-3 py-2" />
          <select value={action} onChange={(e) => setAction(e.target.value as ControlledAction)} className="text-xs rounded-lg border border-slate-200 px-3 py-2">
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="text-xs rounded-lg border border-slate-200 px-3 py-2" />
          <input value={witness} onChange={(e) => setWitness(e.target.value)} placeholder={action === "Wasted" ? "Witness (required)" : "Witness (optional)"} className="text-xs rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <button type="button" onClick={handleRecord} disabled={action === "Wasted" && !witness.trim()} className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 rounded-lg px-4 py-2">Record</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {transactions.map((t) => (
          <div key={t.id} className="px-5 py-3 text-xs text-slate-600 flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-slate-800">{t.action}</span> {t.medicationName} — {t.batchNo} · Qty {t.quantity} · {t.performedBy}{t.witness ? ` · Witness: ${t.witness}` : ""} · {t.at}
          </div>
        ))}
      </div>
    </PharmacyLayout>
  );
}
