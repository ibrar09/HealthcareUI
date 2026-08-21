import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyOrder, Equipment, CriticalFinding } from "@modules/radiology/api";

export function Notifications() {
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [findings, setFindings] = useState<CriticalFinding[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getEquipment().then(setEquipment);
    api.getCriticalFindings().then(setFindings);
  }, []);

  const rows = [
    ...orders.filter((o) => o.priority === "STAT" && o.status !== "Finalized").map((o) => ({ severity: "critical" as const, message: `STAT study pending — ${o.study}`, source: o.patientId })),
    ...findings.filter((f) => !f.acknowledged).map((f) => ({ severity: "critical" as const, message: `Unacknowledged critical finding — ${f.finding.slice(0, 60)}…`, source: f.recipientDoctor })),
    ...equipment.filter((e) => e.status !== "Online").map((e) => ({ severity: "medium" as const, message: `${e.modality} (${e.room}) — ${e.status}`, source: e.room })),
  ];
  const style = { critical: "bg-rose-50 text-rose-700 border-rose-100", medium: "bg-amber-50 text-amber-700 border-amber-100" };

  return (
    <RadiologyLayout active="Notifications">
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
    </RadiologyLayout>
  );
}
