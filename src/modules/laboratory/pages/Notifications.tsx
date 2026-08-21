import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabOrder, CriticalResult, LabAnalyzer, LabInventoryItem } from "@modules/laboratory/api";

export function Notifications() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [critical, setCritical] = useState<CriticalResult[]>([]);
  const [analyzers, setAnalyzers] = useState<LabAnalyzer[]>([]);
  const [inventory, setInventory] = useState<LabInventoryItem[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getCriticalResults().then(setCritical);
    api.getAnalyzers().then(setAnalyzers);
    api.getInventory().then(setInventory);
  }, []);

  const rows = [
    ...orders.filter((o) => o.priority === "STAT" && o.status !== "Released" && o.status !== "Cancelled").map((o) => ({ severity: "critical" as const, message: `STAT order pending — ${o.panelName ?? o.testIds.length + " test(s)"}`, source: o.accessionNo ?? o.id })),
    ...critical.filter((c) => !c.acknowledged).map((c) => ({ severity: "critical" as const, message: `Unacknowledged critical result — ${c.testName}: ${c.value}`, source: c.recipientDoctor })),
    ...analyzers.filter((a) => a.status !== "Online").map((a) => ({ severity: "medium" as const, message: `${a.name} — ${a.status}`, source: a.section })),
    ...inventory.filter((i) => i.status === "Low Stock" || i.status === "Expired").map((i) => ({ severity: "medium" as const, message: `${i.status} — ${i.name}`, source: i.location })),
  ];
  const style = { critical: "bg-rose-50 text-rose-700 border-rose-100", medium: "bg-amber-50 text-amber-700 border-amber-100" };

  return (
    <LaboratoryLayout active="Notifications">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
        <p className="text-xs text-slate-500 mt-0.5">{rows.length} active notifications.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {rows.length === 0 ? <p className="text-xs text-slate-400 text-center py-10">No active notifications.</p> : rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <p className="text-xs text-slate-700 flex-1">{r.message}</p>
            <span className="text-[11px] text-slate-400 flex-shrink-0">{r.source}</span>
            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${style[r.severity]}`}>{r.severity}</span>
          </div>
        ))}
      </div>
    </LaboratoryLayout>
  );
}
