import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { MedicationOrder, MedicationBatch, Recall, Intervention } from "@modules/pharmacy/api";

export function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<MedicationOrder[]>([]);
  const [batches, setBatches] = useState<MedicationBatch[]>([]);
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getBatches().then(setBatches);
    api.getRecalls().then(setRecalls);
    api.getInterventions().then(setInterventions);
  }, []);

  const stats = {
    pending: orders.filter((o) => o.status === "Received" || o.status === "Under Review").length,
    verificationRequired: orders.filter((o) => o.status === "Received" || o.status === "Under Review").length,
    readyToDispense: orders.filter((o) => o.status === "Ready").length,
    stat: orders.filter((o) => o.priority === "STAT" && o.status !== "Dispensed" && o.status !== "Cancelled").length,
    lowStock: batches.filter((b) => b.status === "Available" && b.quantity > 0 && b.quantity <= b.minStock).length,
    outOfStock: batches.filter((b) => b.status === "Available" && b.quantity === 0).length,
    expiringSoon: batches.filter((b) => b.status === "Available" && new Date(b.expiryDate).getTime() - Date.now() < 30 * 86400000).length,
    clinicalAlerts: orders.reduce((sum, o) => sum + o.alerts.length, 0),
    openRecalls: recalls.filter((r) => r.status === "Open").length,
    openInterventions: interventions.filter((i) => i.status === "Open").length,
  };

  const cards = [
    { label: "Pending Prescriptions", value: stats.pending, tone: "default", route: ROUTES.PHARMACY.PRESCRIPTION_QUEUE },
    { label: "Verification Required", value: stats.verificationRequired, tone: "warning", route: ROUTES.PHARMACY.PRESCRIPTION_QUEUE },
    { label: "Ready for Dispensing", value: stats.readyToDispense, tone: "default", route: ROUTES.PHARMACY.DISPENSING },
    { label: "STAT Orders", value: stats.stat, tone: "critical", route: ROUTES.PHARMACY.PRESCRIPTION_QUEUE },
    { label: "Low Stock", value: stats.lowStock, tone: "warning", route: ROUTES.PHARMACY.INVENTORY },
    { label: "Out of Stock", value: stats.outOfStock, tone: "critical", route: ROUTES.PHARMACY.INVENTORY },
    { label: "Expiring Soon", value: stats.expiringSoon, tone: "warning", route: ROUTES.PHARMACY.INVENTORY },
    { label: "Clinical Alerts", value: stats.clinicalAlerts, tone: "critical", route: ROUTES.PHARMACY.PRESCRIPTION_QUEUE },
    { label: "Open Recalls", value: stats.openRecalls, tone: "critical", route: ROUTES.PHARMACY.RECALLS },
    { label: "Open Interventions", value: stats.openInterventions, tone: "warning", route: ROUTES.PHARMACY.INTERVENTIONS },
  ] as const;

  const toneClass: Record<string, string> = { default: "text-slate-800", warning: "text-amber-600", critical: "text-rose-600" };

  return (
    <PharmacyLayout active="Dashboard">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Pharmacy Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time snapshot across Main Pharmacy.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => navigate(c.route)} className="text-left bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 hover:border-violet-200 transition-colors">
            <p className={`text-2xl font-bold ${toneClass[c.tone]}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>
    </PharmacyLayout>
  );
}
