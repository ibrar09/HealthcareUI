import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { MedicationOrder, MedicationBatch } from "@modules/pharmacy/api";

const STATUS_COLORS: Record<string, string> = { Received: "#94a3b8", "Under Review": "#f59e0b", Verified: "#3b82f6", Ready: "#10b981", Dispensed: "#7c3aed", "On Hold": "#e11d48", Cancelled: "#cbd5e1", "Clarification Required": "#f97316", "Partially Dispensed": "#f59e0b" };

export function Reports() {
  const [orders, setOrders] = useState<MedicationOrder[]>([]);
  const [batches, setBatches] = useState<MedicationBatch[]>([]);

  useEffect(() => {
    api.getOrders().then(setOrders);
    api.getBatches().then(setBatches);
  }, []);

  const statusData = Object.entries(orders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const stockValue = batches.reduce<Record<string, number>>((acc, b) => { acc[b.location.split(" — ")[0]] = (acc[b.location.split(" — ")[0]] ?? 0) + b.quantity; return acc; }, {});
  const stockData = Object.entries(stockValue).map(([name, value]) => ({ name, value }));

  return (
    <PharmacyLayout active="Reports">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">Prescription volume and stock distribution snapshot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Prescriptions by Status</h2>
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
          <h2 className="text-sm font-bold text-slate-800 mb-4">Stock by Location</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stockData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PharmacyLayout>
  );
}
