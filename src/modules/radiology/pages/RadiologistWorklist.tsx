import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/radiology/api";
import type { RadiologyOrder, RadiologyPatient, OrderPriority } from "@modules/radiology/api";

const PRIORITY_STYLE: Record<OrderPriority, string> = { Routine: "bg-slate-100 text-slate-600", Urgent: "bg-amber-100 text-amber-700", STAT: "bg-rose-100 text-rose-700", Emergency: "bg-rose-200 text-rose-800" };

export function RadiologistWorklist() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [patients, setPatients] = useState<RadiologyPatient[]>([]);

  useEffect(() => {
    api.getOrders().then((all) => setOrders(all.filter((o) => o.status === "Awaiting Report" || o.status === "Report Draft")));
    api.getRadiologyPatients().then(setPatients);
  }, []);

  const summary = {
    stat: orders.filter((o) => o.priority === "STAT" || o.priority === "Emergency").length,
    urgent: orders.filter((o) => o.priority === "Urgent").length,
    routine: orders.filter((o) => o.priority === "Routine").length,
    draft: orders.filter((o) => o.status === "Report Draft").length,
  };

  return (
    <RadiologyLayout active="Radiologist Worklist">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Radiologist Worklist</h1>
        <p className="text-xs text-slate-500 mt-0.5">Studies awaiting interpretation and reporting.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[{ label: "STAT", value: summary.stat, tone: "critical" }, { label: "Urgent", value: summary.urgent, tone: "warning" }, { label: "Routine", value: summary.routine, tone: "default" }, { label: "Awaiting Signature", value: summary.draft, tone: "warning" }].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[130px]">
            <p className={`text-xl font-bold ${s.tone === "critical" ? "text-rose-600" : s.tone === "warning" ? "text-amber-600" : "text-slate-800"}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {orders.length === 0 ? <p className="text-xs text-slate-400 text-center py-10">Worklist is clear.</p> : orders.map((order) => {
          const patient = patients.find((p) => p.id === order.patientId);
          if (!patient) return null;
          return (
            <button key={order.id} type="button" onClick={() => navigate(ROUTES.RADIOLOGY.STUDY_WORKSPACE(order.id))} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 flex-wrap">
              <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 w-40 flex-shrink-0"><p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p><p className="text-[11px] text-slate-400">{patient.mrn}</p></div>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-700">{order.study}</p><p className="text-[11px] text-slate-400">{order.indication}</p></div>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${PRIORITY_STYLE[order.priority]}`}>{order.priority}</span>
              <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-amber-50 text-amber-700 border-amber-100">{order.status}</span>
            </button>
          );
        })}
      </div>
    </RadiologyLayout>
  );
}
