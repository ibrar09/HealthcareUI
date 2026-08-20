import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { AlertsQueueEntry, AlertSummary, AlertSeverity } from "@modules/nursing-ipd/api";

type FilterKey = "all" | "unacknowledged" | "acknowledged";

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unacknowledged", label: "Unacknowledged" },
  { key: "acknowledged", label: "Acknowledged" },
];

const SEVERITY_STYLE: Record<AlertSeverity, string> = {
  critical: "bg-rose-50 text-rose-700 border-rose-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
};

export function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertsQueueEntry[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  function refresh() {
    api.getAlerts().then(setAlerts);
    api.getAlertSummary().then(setSummary);
  }

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    return alerts.filter((a) => (filter === "all" ? true : filter === "unacknowledged" ? !a.acknowledged : a.acknowledged));
  }, [alerts, filter]);

  return (
    <NurseLayout active="Alerts">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Safety Alerts</h1>
        <p className="text-xs text-slate-500 mt-0.5">Ward-wide safety alert feed across your assigned patients.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: "Critical", value: summary?.critical ?? 0, tone: "critical" as const },
          { label: "High", value: summary?.high ?? 0, tone: "high" as const },
          { label: "Medium", value: summary?.medium ?? 0, tone: "medium" as const },
          { label: "Unacknowledged", value: summary?.unacknowledged ?? 0, tone: "default" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[130px]">
            <p className={`text-xl font-bold ${s.tone === "critical" ? "text-rose-600" : s.tone === "high" ? "text-orange-600" : s.tone === "medium" ? "text-amber-600" : "text-slate-800"}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.key === filter;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isActive ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No alerts match this view.</p>
        ) : (
          filtered.map((alert) => (
            <div key={alert.id} className="flex items-center gap-4 px-5 py-3.5">
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${alert.severity === "critical" ? "text-rose-500" : alert.severity === "high" ? "text-orange-500" : "text-amber-500"}`} />
              <button
                type="button"
                onClick={() => navigate(ROUTES.NURSING.PATIENT_DETAIL(alert.patientId))}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:opacity-80"
              >
                <img src={alert.patient.avatar} alt={alert.patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{alert.patient.name}</p>
                  <p className="text-[11px] text-slate-400">Room {alert.patient.room} · Bed {alert.patient.bed}</p>
                </div>
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700">{alert.category}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{alert.message}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Raised {alert.raisedAt}{alert.acknowledgedAt && ` · Acknowledged ${alert.acknowledgedAt}`}</p>
              </div>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${SEVERITY_STYLE[alert.severity]}`}>{alert.severity}</span>
              {!alert.acknowledged ? (
                <button
                  type="button"
                  onClick={() => api.acknowledgeAlert(alert.id).then(refresh)}
                  className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 flex-shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                </button>
              ) : (
                <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-emerald-50 text-emerald-700 border-emerald-100">Acknowledged</span>
              )}
            </div>
          ))
        )}
      </div>
    </NurseLayout>
  );
}
