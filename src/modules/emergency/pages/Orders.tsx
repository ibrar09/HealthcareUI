import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { EDOrder, EDPatient, OrderStatus } from "@modules/emergency/api";

const STATUS_STYLE: Record<OrderStatus, string> = { Ordered: "bg-slate-100 text-slate-600", "In Progress": "bg-amber-50 text-amber-700", Completed: "bg-emerald-50 text-emerald-700", Critical: "bg-rose-50 text-rose-700" };

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<EDOrder[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getEDPatients().then(setPatients);
  }, []);

  return (
    <EmergencyLayout active="Orders & Results">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Orders & Results</h1>
        <p className="text-xs text-slate-500 mt-0.5">Lab, Radiology, and Medication orders across the ED.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {orders.map((o) => {
          const patient = patients.find((p) => p.id === o.patientId);
          return (
            <button key={o.id} type="button" onClick={() => navigate(ROUTES.EMERGENCY.ENCOUNTER(o.encounterId))} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 flex-wrap">
              <img src={patient?.avatar} alt={patient?.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient?.name}</p><p className="text-[11px] text-slate-400">{o.type}: {o.description} · {o.orderedBy}</p></div>
              <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600">{o.priority}</span>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[o.status]}`}>{o.status}</span>
            </button>
          );
        })}
      </div>
    </EmergencyLayout>
  );
}
