import { useEffect, useState } from "react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabInventoryItem } from "@modules/laboratory/api";

const STATUS_STYLE = { Available: "bg-emerald-50 text-emerald-700 border-emerald-100", "Low Stock": "bg-amber-50 text-amber-700 border-amber-100", Expired: "bg-rose-50 text-rose-700 border-rose-100", Quarantined: "bg-slate-100 text-slate-500 border-slate-200" };

export function Inventory() {
  const [items, setItems] = useState<LabInventoryItem[]>([]);
  function refresh() { api.getInventory().then(setItems); }
  useEffect(refresh, []);

  return (
    <LaboratoryLayout active="Inventory">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Inventory</h1>
        <p className="text-xs text-slate-500 mt-0.5">Reagents, consumables, controls, and calibrators.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              <p className="text-[11px] text-slate-400">{item.type} · Lot {item.lot} · {item.location} · Exp {item.expiryDate}</p>
            </div>
            <p className={`text-sm font-bold flex-shrink-0 ${item.quantity <= item.minStock ? "text-amber-600" : "text-slate-800"}`}>{item.quantity} {item.unit}</p>
            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[item.status]}`}>{item.status}</span>
            {item.status === "Available" && (
              <button type="button" onClick={() => api.adjustStock(item.id, -1).then(refresh)} className="text-[11px] font-semibold text-orange-700 hover:bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5 flex-shrink-0">Use 1 unit</button>
            )}
          </div>
        ))}
      </div>
    </LaboratoryLayout>
  );
}
