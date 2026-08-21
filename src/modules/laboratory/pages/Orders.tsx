import { useEffect, useMemo, useState } from "react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabOrder, LabPatient, OrderStatus, OrderPriority } from "@modules/laboratory/api";

type FilterKey = "all" | "stat" | "pending" | "active" | "released";
const FILTERS: { key: FilterKey; label: string }[] = [{ key: "all", label: "All" }, { key: "stat", label: "STAT" }, { key: "pending", label: "Awaiting Collection" }, { key: "active", label: "In Progress" }, { key: "released", label: "Released" }];

const STATUS_STYLE: Record<OrderStatus, string> = {
  Ordered: "bg-slate-100 text-slate-600 border-slate-200", "Collection Pending": "bg-blue-50 text-blue-700 border-blue-100", Collected: "bg-amber-50 text-amber-700 border-amber-100",
  Received: "bg-amber-50 text-amber-700 border-amber-100", Testing: "bg-orange-50 text-orange-700 border-orange-100", Validation: "bg-orange-50 text-orange-700 border-orange-100",
  Released: "bg-emerald-50 text-emerald-700 border-emerald-100", Cancelled: "bg-slate-100 text-slate-400 border-slate-200",
};
const PRIORITY_STYLE: Record<OrderPriority, string> = { Routine: "bg-slate-100 text-slate-600", Urgent: "bg-amber-100 text-amber-700", STAT: "bg-rose-100 text-rose-700" };

export function Orders() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  function refresh() {
    api.getOrders().then(setOrders);
    api.getLabPatients().then(setPatients);
  }
  useEffect(refresh, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "stat") return o.priority === "STAT";
      if (filter === "pending") return o.status === "Ordered" || o.status === "Collection Pending";
      if (filter === "active") return ["Collected", "Received", "Testing", "Validation"].includes(o.status);
      if (filter === "released") return o.status === "Released";
      return true;
    });
  }, [orders, filter]);

  return (
    <LaboratoryLayout active="Orders">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Laboratory Orders</h1>
        <p className="text-xs text-slate-500 mt-0.5">Orders received from Doctor Portal, Nursing, and Emergency.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter === f.key ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {filtered.map((order) => {
          const patient = patients.find((p) => p.id === order.patientId);
          if (!patient) return null;
          return (
            <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 w-40 flex-shrink-0"><p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p><p className="text-[11px] text-slate-400">{patient.mrn} · {order.accessionNo ?? "No accession yet"}</p></div>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-700">{order.panelName ?? `${order.testIds.length} test(s)`}</p><p className="text-[11px] text-slate-400">{order.orderingDoctor} · {order.indication}</p></div>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${PRIORITY_STYLE[order.priority]}`}>{order.priority}</span>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[order.status]}`}>{order.status}</span>
            </div>
          );
        })}
      </div>
    </LaboratoryLayout>
  );
}
