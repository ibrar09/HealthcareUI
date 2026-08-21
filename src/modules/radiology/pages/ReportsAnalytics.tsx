import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyOrder } from "@modules/radiology/api";

const STATUS_COLORS: Record<string, string> = { Ordered: "#94a3b8", Scheduled: "#3b82f6", "Checked-In": "#f59e0b", "In Progress": "#0891b2", "Awaiting Report": "#f59e0b", "Report Draft": "#f59e0b", Finalized: "#10b981", Cancelled: "#cbd5e1" };

export function ReportsAnalytics() {
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  useEffect(() => { api.getOrders().then(setOrders); }, []);

  const statusData = Object.entries(orders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const modalityData = Object.entries(orders.reduce<Record<string, number>>((acc, o) => { acc[o.modality] = (acc[o.modality] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));

  return (
    <RadiologyLayout active="Reports & Analytics">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">Operational snapshot across Radiology Department.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {statusData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] ?? "#94a3b8"} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Exams by Modality</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={modalityData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </RadiologyLayout>
  );
}
