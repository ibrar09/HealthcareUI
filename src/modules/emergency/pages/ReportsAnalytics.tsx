import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { EDEncounter, Disposition } from "@modules/emergency/api";
import { ACUITY_LABEL, ACUITY_COLOR } from "@modules/emergency/api";

export function ReportsAnalytics() {
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [dispositions, setDispositions] = useState<Disposition[]>([]);

  useEffect(() => {
    api.getEncounters().then(setEncounters);
    api.getDispositions().then(setDispositions);
  }, []);

  const acuityData = Object.entries(
    encounters.reduce<Record<number, number>>((acc, e) => {
      if (e.acuityLevel) acc[e.acuityLevel] = (acc[e.acuityLevel] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([level, value]) => ({ name: `${level} — ${ACUITY_LABEL[Number(level) as 1 | 2 | 3 | 4 | 5]}`, value, level: Number(level) }));

  const areaData = Object.entries(encounters.reduce<Record<string, number>>((acc, e) => { if (e.area) acc[e.area] = (acc[e.area] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));

  return (
    <EmergencyLayout active="Reports & Analytics">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">Acuity distribution and treatment area workload.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: "Total Arrivals", value: encounters.length },
          { label: "Dispositions Recorded", value: dispositions.length },
          { label: "Admit Rate", value: dispositions.length ? `${Math.round((dispositions.filter((d) => d.type === "Admit").length / dispositions.length) * 100)}%` : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[140px]">
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Acuity Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={acuityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {acuityData.map((d) => <Cell key={d.name} fill={ACUITY_COLOR[d.level as 1 | 2 | 3 | 4 | 5]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Patients by Treatment Area</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={areaData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </EmergencyLayout>
  );
}
