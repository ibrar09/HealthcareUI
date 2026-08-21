import { useEffect, useState } from "react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { Equipment as EquipmentType, QcRecord, EquipmentStatus } from "@modules/radiology/api";

type Tab = "status" | "qc";
const STATUS_OPTIONS: EquipmentStatus[] = ["Online", "Offline", "Maintenance", "Out of Service"];
const STATUS_STYLE: Record<EquipmentStatus, string> = { Online: "bg-emerald-50 text-emerald-700 border-emerald-100", Offline: "bg-rose-50 text-rose-700 border-rose-100", Maintenance: "bg-amber-50 text-amber-700 border-amber-100", "Out of Service": "bg-slate-100 text-slate-500 border-slate-200" };

export function Equipment() {
  const [tab, setTab] = useState<Tab>("status");
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [qc, setQc] = useState<QcRecord[]>([]);

  function refresh() {
    api.getEquipment().then(setEquipment);
    api.getQcRecords().then(setQc);
  }
  useEffect(refresh, []);

  return (
    <RadiologyLayout active="Equipment">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Equipment</h1>
        <p className="text-xs text-slate-500 mt-0.5">Modality status, maintenance schedule, and quality control.</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => setTab("status")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "status" ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Status & Maintenance</button>
        <button type="button" onClick={() => setTab("qc")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "qc" ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Quality Control</button>
      </div>

      {tab === "status" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {equipment.map((e) => (
            <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{e.modality} — {e.room}</p><p className="text-[11px] text-slate-400">{e.manufacturer} · Next maintenance {e.nextMaintenance}</p></div>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[e.status]}`}>{e.status}</span>
              <select value={e.status} onChange={(ev) => api.setEquipmentStatus(e.id, ev.target.value as EquipmentStatus).then(refresh)} className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 flex-shrink-0">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <>
          <button type="button" onClick={() => equipment[0] && api.recordQc(equipment[0].id, "Pass", "Tech. Hamza Iqbal").then(refresh)} className="mb-4 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg px-3 py-2">Record QC Pass (CT-1)</button>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            {qc.map((r) => {
              const eq = equipment.find((e) => e.id === r.equipmentId);
              return <div key={r.id} className="px-5 py-3 text-xs text-slate-600">{eq?.modality ?? "—"} ({eq?.room}) — <span className={r.result === "Pass" ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>{r.result}</span> · {r.performedBy} · {r.at}</div>;
            })}
          </div>
        </>
      )}
    </RadiologyLayout>
  );
}
