import { useEffect, useMemo, useState } from "react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyOrder, RadiologyPatient, OrderStatus, OrderPriority } from "@modules/radiology/api";

type FilterKey = "all" | "unscheduled" | "stat" | "scheduled";
const FILTERS: { key: FilterKey; label: string }[] = [{ key: "all", label: "All" }, { key: "unscheduled", label: "Unscheduled" }, { key: "stat", label: "STAT" }, { key: "scheduled", label: "Scheduled" }];
const STATUS_STYLE: Record<OrderStatus, string> = {
  Ordered: "bg-slate-100 text-slate-600 border-slate-200", Scheduled: "bg-blue-50 text-blue-700 border-blue-100", "Checked-In": "bg-amber-50 text-amber-700 border-amber-100",
  "In Progress": "bg-cyan-50 text-cyan-700 border-cyan-100", "Awaiting Report": "bg-amber-50 text-amber-700 border-amber-100", "Report Draft": "bg-amber-50 text-amber-700 border-amber-100",
  Finalized: "bg-emerald-50 text-emerald-700 border-emerald-100", Cancelled: "bg-slate-100 text-slate-400 border-slate-200",
};
const PRIORITY_STYLE: Record<OrderPriority, string> = { Routine: "bg-slate-100 text-slate-600", Urgent: "bg-amber-100 text-amber-700", STAT: "bg-rose-100 text-rose-700", Emergency: "bg-rose-200 text-rose-800" };

export function Orders() {
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [patients, setPatients] = useState<RadiologyPatient[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [scheduling, setScheduling] = useState<RadiologyOrder | null>(null);
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");

  function refresh() {
    api.getOrders().then(setOrders);
    api.getRadiologyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "unscheduled") return o.status === "Ordered";
      if (filter === "stat") return o.priority === "STAT" || o.priority === "Emergency";
      if (filter === "scheduled") return o.status === "Scheduled";
      return true;
    });
  }, [orders, filter]);

  function handleSchedule() {
    if (!scheduling || !time.trim() || !room.trim()) return;
    api.scheduleOrder(scheduling.id, time.trim(), room.trim(), "Tech. Hamza Iqbal").then(() => {
      setScheduling(null);
      setTime("");
      setRoom("");
      refresh();
    });
  }

  return (
    <RadiologyLayout active="Orders">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Radiology Orders</h1>
        <p className="text-xs text-slate-500 mt-0.5">Orders received from Doctor Portal, pending review and scheduling.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter === f.key ? "bg-cyan-600 border-cyan-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {filtered.map((order) => {
          const patient = patients.find((p) => p.id === order.patientId);
          if (!patient) return null;
          return (
            <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 w-40 flex-shrink-0"><p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p><p className="text-[11px] text-slate-400">{patient.mrn}</p></div>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-700">{order.study}</p><p className="text-[11px] text-slate-400">{order.orderingDoctor} · {order.indication}</p></div>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${PRIORITY_STYLE[order.priority]}`}>{order.priority}</span>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[order.status]}`}>{order.status}</span>
              {order.status === "Ordered" && (
                <button type="button" onClick={() => setScheduling(order)} className="text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg px-3 py-1.5 flex-shrink-0">Schedule</button>
              )}
            </div>
          );
        })}
      </div>

      {scheduling && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 flex items-center justify-center p-4" onClick={() => setScheduling(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-slate-800 mb-3">Schedule {scheduling.study}</h2>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Time</label>
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 10:30" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-3" />
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Room</label>
            <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder={`e.g. ${scheduling.modality}-1`} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-4" />
            <button type="button" onClick={handleSchedule} disabled={!time.trim() || !room.trim()} className="w-full text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 rounded-lg px-4 py-2.5">Confirm Schedule</button>
          </div>
        </div>
      )}
    </RadiologyLayout>
  );
}
