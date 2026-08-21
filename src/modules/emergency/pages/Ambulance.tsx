import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { AmbulanceRecord } from "@modules/emergency/api";

const STATUS_STYLE = { Dispatched: "bg-slate-100 text-slate-600", "En Route": "bg-amber-50 text-amber-700", Arrived: "bg-blue-50 text-blue-700", "Handed Over": "bg-emerald-50 text-emerald-700" };

export function Ambulance() {
  const [records, setRecords] = useState<AmbulanceRecord[]>([]);
  function refresh() { api.getAmbulanceRecords().then(setRecords); }
  useEffect(refresh, []);

  return (
    <EmergencyLayout active="Ambulance">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Ambulance</h1>
        <p className="text-xs text-slate-500 mt-0.5">Pre-hospital records and ambulance status.</p>
      </div>
      <div className="flex flex-col gap-4">
        {records.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Truck className="w-4 h-4 text-slate-400" /> {r.ambulanceId} — {r.crew}</p>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${STATUS_STYLE[r.status]}`}>{r.status}</span>
            </div>
            <p className="text-xs text-slate-500">Dispatched {r.dispatchedAt}{r.arrivedAt && ` · Arrived ${r.arrivedAt}`}</p>
            <p className="text-xs text-slate-600 mt-1">{r.prehospitalNotes}</p>
            {r.status !== "Handed Over" && (
              <button type="button" onClick={() => api.advanceAmbulanceStatus(r.id).then(refresh)} className="mt-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5">Advance Status</button>
            )}
          </div>
        ))}
      </div>
    </EmergencyLayout>
  );
}
