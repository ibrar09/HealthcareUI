import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { MedicationBatch, StockMovement } from "@modules/pharmacy/api";

type Tab = "stock" | "expiry" | "movements" | "quarantine";
const TABS: { key: Tab; label: string }[] = [{ key: "stock", label: "Stock & Batches" }, { key: "expiry", label: "Expiry" }, { key: "movements", label: "Transfers & Returns" }, { key: "quarantine", label: "Quarantine" }];

const STATUS_STYLE = { Available: "bg-emerald-50 text-emerald-700 border-emerald-100", Reserved: "bg-blue-50 text-blue-700 border-blue-100", Quarantined: "bg-amber-50 text-amber-700 border-amber-100", Expired: "bg-rose-50 text-rose-700 border-rose-100", Recalled: "bg-rose-50 text-rose-700 border-rose-100" };

export function Inventory() {
  const [tab, setTab] = useState<Tab>("stock");
  const [batches, setBatches] = useState<MedicationBatch[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [returnBatchId, setReturnBatchId] = useState("");
  const [returnReason, setReturnReason] = useState("");

  function refresh() {
    api.getBatches().then(setBatches);
    api.getMovements().then(setMovements);
  }
  useEffect(refresh, []);

  const now = Date.now();
  const expiring = [...batches].filter((b) => b.status === "Available").sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  return (
    <PharmacyLayout active="Inventory">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Inventory</h1>
        <p className="text-xs text-slate-500 mt-0.5">Stock, batches, expiry, transfers, returns, and quarantine across Main Pharmacy.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === t.key ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "stock" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {batches.map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{b.medicationName}</p>
                <p className="text-[11px] text-slate-400">Batch {b.batchNo} · {b.location}</p>
              </div>
              <p className={`text-sm font-bold flex-shrink-0 ${b.quantity <= b.minStock ? "text-amber-600" : "text-slate-800"}`}>{b.quantity} units</p>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[b.status]}`}>{b.status}</span>
              {b.status === "Available" && (
                <button type="button" onClick={() => api.transferStock(b.id, "Ward 4B", 10).then(refresh)} className="text-[11px] font-semibold text-violet-700 hover:bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1 flex-shrink-0">Transfer 10 → Ward 4B</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "expiry" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {expiring.map((b) => {
            const daysLeft = Math.round((new Date(b.expiryDate).getTime() - now) / 86400000);
            const bucket = daysLeft < 0 ? "Expired" : daysLeft <= 30 ? "< 30 days" : daysLeft <= 90 ? "30–90 days" : daysLeft <= 180 ? "90–180 days" : "180+ days";
            return (
              <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{b.medicationName}</p><p className="text-[11px] text-slate-400">Batch {b.batchNo}</p></div>
                <p className="text-xs text-slate-600 flex-shrink-0">Expires {b.expiryDate}</p>
                <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${bucket === "Expired" || bucket === "< 30 days" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{bucket}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "movements" && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
            <p className="text-xs font-bold text-slate-800 mb-3">Record a Return</p>
            <div className="flex flex-wrap gap-2 items-end">
              <select value={returnBatchId} onChange={(e) => setReturnBatchId(e.target.value)} className="text-xs rounded-lg border border-slate-200 px-3 py-2">
                <option value="">Select batch…</option>
                {batches.filter((b) => b.status === "Available").map((b) => <option key={b.id} value={b.id}>{b.medicationName} — {b.batchNo}</option>)}
              </select>
              <input placeholder="Reason" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="text-xs rounded-lg border border-slate-200 px-3 py-2" />
              <button
                type="button"
                disabled={!returnBatchId}
                onClick={() => api.returnStock(returnBatchId, 5, returnReason || "Ward return").then(() => { refresh(); setReturnBatchId(""); setReturnReason(""); })}
                className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 rounded-lg px-3 py-2"
              >
                Return 5 units
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            {movements.length === 0 ? <p className="text-xs text-slate-400 text-center py-10">No transfers or returns recorded yet.</p> : movements.map((m) => (
              <div key={m.id} className="px-5 py-3 text-xs text-slate-600">{m.type} — {m.quantity} units · {m.from} → {m.to} · {m.reason} · {m.at}</div>
            ))}
          </div>
        </>
      )}

      {tab === "quarantine" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {batches.filter((b) => b.status === "Quarantined").length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No quarantined stock.</p>
          ) : (
            batches.filter((b) => b.status === "Quarantined").map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{b.medicationName}</p><p className="text-[11px] text-amber-600">{b.quarantineReason}</p></div>
                <p className="text-xs text-slate-500 flex-shrink-0">{b.quantity} units</p>
                <button type="button" onClick={() => api.releaseFromQuarantine(b.id).then(refresh)} className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 flex-shrink-0">Release</button>
              </div>
            ))
          )}
        </div>
      )}
    </PharmacyLayout>
  );
}
