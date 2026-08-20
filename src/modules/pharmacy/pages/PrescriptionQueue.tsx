import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/pharmacy/api";
import type { MedicationOrder, PharmacyPatient, OrderStatus, OrderPriority } from "@modules/pharmacy/api";

type FilterKey = "all" | "stat" | "outpatient" | "inpatient" | "emergency";
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" }, { key: "stat", label: "STAT" }, { key: "outpatient", label: "Outpatient" }, { key: "inpatient", label: "Inpatient" }, { key: "emergency", label: "Emergency" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  Received: "bg-slate-100 text-slate-600 border-slate-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-100",
  Verified: "bg-blue-50 text-blue-700 border-blue-100",
  "Clarification Required": "bg-orange-50 text-orange-700 border-orange-100",
  "On Hold": "bg-rose-50 text-rose-700 border-rose-100",
  Ready: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Partially Dispensed": "bg-amber-50 text-amber-700 border-amber-100",
  Dispensed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Cancelled: "bg-slate-100 text-slate-400 border-slate-200",
};
const PRIORITY_STYLE: Record<OrderPriority, string> = { Routine: "bg-slate-100 text-slate-600", Urgent: "bg-amber-100 text-amber-700", STAT: "bg-rose-100 text-rose-700" };

export function PrescriptionQueue() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<MedicationOrder[]>([]);
  const [patients, setPatients] = useState<PharmacyPatient[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getPharmacyPatients().then(setPatients);
  }, []);

  const filtered = useMemo(() => {
    return [...orders]
      .filter((o) => o.status !== "Dispensed" && o.status !== "Cancelled")
      .filter((o) => {
        if (filter === "all") return true;
        if (filter === "stat") return o.priority === "STAT";
        if (filter === "outpatient") return o.setting === "Outpatient";
        if (filter === "inpatient") return o.setting === "Inpatient";
        if (filter === "emergency") return o.setting === "Emergency";
        return true;
      })
      .sort((a, b) => (a.priority === "STAT" ? -1 : 1) - (b.priority === "STAT" ? -1 : 1));
  }, [orders, filter]);

  return (
    <PharmacyLayout active="Prescription Queue">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Prescription Queue</h1>
        <p className="text-xs text-slate-500 mt-0.5">All prescriptions received from Doctor Portal, awaiting review or dispensing.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === f.key ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No prescriptions match this view.</p>
        ) : (
          filtered.map((order) => {
            const patient = patients.find((p) => p.id === order.patientId);
            if (!patient) return null;
            return (
              <button key={order.id} type="button" onClick={() => navigate(ROUTES.PHARMACY.VERIFY_ORDER(order.id))} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors flex-wrap">
                <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 w-40 flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                  <p className="text-[11px] text-slate-400">{patient.mrn} · {order.setting}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700">{order.medicationName} {order.strength}</p>
                  <p className="text-[11px] text-slate-400">{order.dose} · {order.route} · {order.frequency} · Qty {order.quantity}</p>
                </div>
                {order.alerts.length > 0 && <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${PRIORITY_STYLE[order.priority]}`}>{order.priority}</span>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[order.status]}`}>{order.status}</span>
              </button>
            );
          })
        )}
      </div>
    </PharmacyLayout>
  );
}
