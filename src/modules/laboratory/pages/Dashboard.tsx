import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabOrder, LabPatient, LabAnalyzer, CriticalResult } from "@modules/laboratory/api";

const STATUS_STYLE: Record<string, string> = {
  Ordered: "bg-slate-100 text-slate-600", "Collection Pending": "bg-blue-50 text-blue-700", Collected: "bg-amber-50 text-amber-700",
  Received: "bg-amber-50 text-amber-700", Testing: "bg-orange-50 text-orange-700", Validation: "bg-orange-50 text-orange-700", Released: "bg-emerald-50 text-emerald-700",
};

export function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);
  const [analyzers, setAnalyzers] = useState<LabAnalyzer[]>([]);
  const [critical, setCritical] = useState<CriticalResult[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getLabPatients().then(setPatients);
    api.getAnalyzers().then(setAnalyzers);
    api.getCriticalResults().then(setCritical);
  }, []);

  const stats = {
    todayOrders: orders.length,
    stat: orders.filter((o) => o.priority === "STAT" && o.status !== "Released" && o.status !== "Cancelled").length,
    awaitingCollection: orders.filter((o) => o.status === "Ordered" || o.status === "Collection Pending").length,
    testing: orders.filter((o) => o.status === "Testing").length,
    pendingValidation: orders.filter((o) => o.status === "Validation").length,
    completed: orders.filter((o) => o.status === "Released").length,
    criticalOpen: critical.filter((c) => !c.acknowledged).length,
  };

  const cards = [
    { label: "Today's Orders", value: stats.todayOrders, tone: "default", route: ROUTES.LABORATORY.ORDERS },
    { label: "STAT In Progress", value: stats.stat, tone: "critical", route: ROUTES.LABORATORY.ORDERS },
    { label: "Awaiting Collection", value: stats.awaitingCollection, tone: "warning", route: ROUTES.LABORATORY.COLLECTION },
    { label: "Testing", value: stats.testing, tone: "default", route: ROUTES.LABORATORY.WORKLISTS },
    { label: "Pending Validation", value: stats.pendingValidation, tone: "warning", route: ROUTES.LABORATORY.WORKLISTS },
    { label: "Completed", value: stats.completed, tone: "default", route: ROUTES.LABORATORY.REPORTS },
    { label: "Critical Results", value: stats.criticalOpen, tone: "critical", route: ROUTES.LABORATORY.CRITICAL_RESULTS },
  ] as const;
  const toneClass: Record<string, string> = { default: "text-slate-800", warning: "text-amber-600", critical: "text-rose-600" };

  const liveBoard = [...orders].filter((o) => o.status !== "Ordered" && o.status !== "Cancelled").sort((a, b) => (a.priority === "STAT" ? -1 : 1) - (b.priority === "STAT" ? -1 : 1)).slice(0, 10);

  return (
    <LaboratoryLayout active="Dashboard">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Laboratory Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time snapshot across Main Laboratory.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => navigate(c.route)} className="text-left bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 hover:border-orange-200 transition-colors">
            <p className={`text-2xl font-bold ${toneClass[c.tone]}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Live Laboratory Board</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-4">Accession</th><th className="py-2 pr-4">Patient</th><th className="py-2 pr-4">Priority</th><th className="py-2 pr-4">Tests</th><th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {liveBoard.map((o) => {
                const patient = patients.find((p) => p.id === o.patientId);
                return (
                  <tr key={o.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-mono text-slate-600">{o.accessionNo ?? "—"}</td>
                    <td className="py-2 pr-4 font-semibold text-slate-800">{patient?.name ?? "—"}</td>
                    <td className="py-2 pr-4"><span className={`font-semibold ${o.priority === "STAT" ? "text-rose-600" : o.priority === "Urgent" ? "text-amber-600" : "text-slate-500"}`}>{o.priority}</span></td>
                    <td className="py-2 pr-4 text-slate-500">{o.panelName ?? o.testIds.length + " test(s)"}</td>
                    <td className="py-2"><span className={`text-[11px] font-semibold rounded-full px-2 py-1 ${STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-600"}`}>{o.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Analyzer Status</h2>
        <div className="flex flex-wrap gap-3">
          {analyzers.map((a) => (
            <span key={a.id} className={`text-xs font-semibold border rounded-full px-3 py-1.5 ${a.status === "Online" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : a.status === "Error" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
              {a.name}: {a.status}
            </span>
          ))}
        </div>
      </div>
    </LaboratoryLayout>
  );
}
