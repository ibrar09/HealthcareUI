import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabOrder, LabTest } from "@modules/laboratory/api";

const STATUS_COLORS: Record<string, string> = { Ordered: "#94a3b8", "Collection Pending": "#3b82f6", Collected: "#f59e0b", Received: "#f59e0b", Testing: "#ea580c", Validation: "#ea580c", Released: "#10b981", Cancelled: "#cbd5e1" };

export function Analytics() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getTests().then(setTests);
  }, []);

  const statusData = Object.entries(orders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const sectionData = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      o.testIds.forEach((id) => {
        const section = tests.find((t) => t.id === id)?.section;
        if (section) acc[section] = (acc[section] ?? 0) + 1;
      });
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <LaboratoryLayout active="Analytics">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">Order volume, section workload, and turnaround snapshot.</p>
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
          <h2 className="text-sm font-bold text-slate-800 mb-4">Test Volume by Section</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectionData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#ea580c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </LaboratoryLayout>
  );
}
