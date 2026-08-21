import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyOrder, Equipment, CriticalFinding } from "@modules/radiology/api";

export function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [findings, setFindings] = useState<CriticalFinding[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getEquipment().then(setEquipment);
    api.getCriticalFindings().then(setFindings);
  }, []);

  const stats = {
    scheduledToday: orders.filter((o) => o.status === "Scheduled").length,
    waiting: orders.filter((o) => o.status === "Checked-In").length,
    inProgress: orders.filter((o) => o.status === "In Progress").length,
    pendingReports: orders.filter((o) => o.status === "Awaiting Report" || o.status === "Report Draft").length,
    stat: orders.filter((o) => o.priority === "STAT" && o.status !== "Finalized" && o.status !== "Cancelled").length,
    criticalFindings: findings.filter((f) => !f.acknowledged).length,
    unscheduled: orders.filter((o) => o.status === "Ordered").length,
  };

  const cards = [
    { label: "Unscheduled Orders", value: stats.unscheduled, tone: "warning", route: ROUTES.RADIOLOGY.ORDERS },
    { label: "Scheduled", value: stats.scheduledToday, tone: "default", route: ROUTES.RADIOLOGY.ORDERS },
    { label: "Waiting", value: stats.waiting, tone: "default", route: ROUTES.RADIOLOGY.TECHNICIAN_WORKLIST },
    { label: "In Progress", value: stats.inProgress, tone: "default", route: ROUTES.RADIOLOGY.TECHNICIAN_WORKLIST },
    { label: "Pending Reports", value: stats.pendingReports, tone: "warning", route: ROUTES.RADIOLOGY.RADIOLOGIST_WORKLIST },
    { label: "STAT", value: stats.stat, tone: "critical", route: ROUTES.RADIOLOGY.ORDERS },
    { label: "Critical Findings", value: stats.criticalFindings, tone: "critical", route: ROUTES.RADIOLOGY.CRITICAL_FINDINGS },
  ] as const;
  const toneClass: Record<string, string> = { default: "text-slate-800", warning: "text-amber-600", critical: "text-rose-600" };

  return (
    <RadiologyLayout active="Dashboard">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Radiology Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time snapshot across Radiology Department.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => navigate(c.route)} className="text-left bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 hover:border-cyan-200 transition-colors">
            <p className={`text-2xl font-bold ${toneClass[c.tone]}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Modality Status</h2>
        <div className="flex flex-wrap gap-3">
          {equipment.map((e) => (
            <span key={e.id} className={`text-xs font-semibold border rounded-full px-3 py-1.5 ${e.status === "Online" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
              {e.modality} ({e.room}): {e.status}
            </span>
          ))}
          <span className="text-xs font-semibold border rounded-full px-3 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-100">PACS: Connected</span>
          <span className="text-xs font-semibold border rounded-full px-3 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-100">DICOM: Healthy</span>
        </div>
      </div>
    </RadiologyLayout>
  );
}
