import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { MedicationOrder, MedicationBatch, Recall } from "@modules/pharmacy/api";

export function Alerts() {
  const [orders, setOrders] = useState<MedicationOrder[]>([]);
  const [batches, setBatches] = useState<MedicationBatch[]>([]);
  const [recalls, setRecalls] = useState<Recall[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getBatches().then(setBatches);
    api.getRecalls().then(setRecalls);
  }, []);

  const rows = [
    ...orders.flatMap((o) => o.alerts.map((a) => ({ severity: a.severity, message: `${a.type}: ${a.message}`, source: o.medicationName }))),
    ...batches.filter((b) => b.status === "Available" && b.quantity === 0).map((b) => ({ severity: "high" as const, message: `Out of stock — ${b.medicationName}`, source: b.batchNo })),
    ...batches.filter((b) => b.status === "Available" && b.quantity > 0 && b.quantity <= b.minStock).map((b) => ({ severity: "medium" as const, message: `Low stock — ${b.medicationName} (${b.quantity} left)`, source: b.batchNo })),
    ...recalls.filter((r) => r.status === "Open").map((r) => ({ severity: "critical" as const, message: `Open recall — ${r.medicationName}`, source: r.id })),
  ];

  const style = { critical: "bg-rose-50 text-rose-700 border-rose-100", high: "bg-orange-50 text-orange-700 border-orange-100", medium: "bg-amber-50 text-amber-700 border-amber-100" };

  return (
    <PharmacyLayout active="Alerts">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Alerts</h1>
        <p className="text-xs text-slate-500 mt-0.5">{rows.length} active alerts across clinical safety, inventory, and recalls.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {rows.length === 0 ? <p className="text-xs text-slate-400 text-center py-10">No active alerts.</p> : rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <p className="text-xs text-slate-700 flex-1">{r.message}</p>
            <span className="text-[11px] text-slate-400 flex-shrink-0">{r.source}</span>
            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${style[r.severity]}`}>{r.severity}</span>
          </div>
        ))}
      </div>
    </PharmacyLayout>
  );
}
