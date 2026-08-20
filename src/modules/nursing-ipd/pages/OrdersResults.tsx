import { useEffect, useState } from "react";
import { FlaskConical, Radiation } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { ClinicalOrder, NursePatient, OrderStatus } from "@modules/nursing-ipd/api";

const STATUS_STYLE: Record<OrderStatus, string> = {
  Ordered: "bg-amber-50 text-amber-700 border-amber-100",
  Collected: "bg-slate-100 text-slate-600 border-slate-200",
  Final: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function OrdersResults() {
  const [orders, setOrders] = useState<ClinicalOrder[]>([]);
  const [patients, setPatients] = useState<NursePatient[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getMyPatients().then(setPatients);
  }, []);

  return (
    <NurseLayout active="Orders & Results">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Orders & Results</h1>
        <p className="text-xs text-slate-500 mt-0.5">Laboratory and imaging orders across your assigned patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {orders.map((order) => {
          const patient = patients.find((p) => p.id === order.patientId);
          if (!patient) return null;
          const Icon = order.category === "Laboratory" ? FlaskConical : Radiation;
          return (
            <div key={order.id} className="px-5 py-3.5">
              <div className="flex items-center gap-4 flex-wrap">
                <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                  <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
                </div>
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 min-w-0 flex-1">
                  <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {order.name}
                </p>
                <span className="text-[11px] text-slate-400 flex-shrink-0">Ordered {order.orderedAt}</span>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[order.status]}`}>{order.status}</span>
              </div>
              {order.result && <p className="text-xs text-slate-600 mt-2 pl-[52px]">{order.result}</p>}
            </div>
          );
        })}
      </div>
    </NurseLayout>
  );
}
