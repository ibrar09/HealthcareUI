import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, MedicationSummary, TaskSummary, AlertSummary } from "@modules/nursing-ipd/api";

const ACUITY_COLORS: Record<string, string> = { Critical: "#e11d48", "High Risk": "#f97316", Attention: "#f59e0b", Stable: "#10b981" };

export function Reports() {
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [medSummary, setMedSummary] = useState<MedicationSummary | null>(null);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null);

  useEffect(() => {
    api.getMyPatients().then(setPatients);
    api.getMedicationSummary().then(setMedSummary);
    api.getTaskSummary().then(setTaskSummary);
    api.getAlertSummary().then(setAlertSummary);
  }, []);

  const acuityData = Object.entries(
    patients.reduce<Record<string, number>>((acc, p) => {
      acc[p.acuity] = (acc[p.acuity] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const medData = medSummary ? [
    { name: "Administered", value: medSummary.administered },
    { name: "Due", value: medSummary.due },
    { name: "Overdue", value: medSummary.overdue },
    { name: "Scheduled", value: medSummary.scheduled },
  ] : [];

  return (
    <NurseLayout active="Reports">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Shift Report</h1>
        <p className="text-xs text-slate-500 mt-0.5">Snapshot across your assigned patients this shift.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: "Patients", value: patients.length },
          { label: "Tasks Completed", value: taskSummary?.completed ?? 0 },
          { label: "Meds Administered", value: medSummary?.administered ?? 0 },
          { label: "Unacknowledged Alerts", value: alertSummary?.unacknowledged ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[140px]">
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Patients by Acuity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={acuityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {acuityData.map((d) => <Cell key={d.name} fill={ACUITY_COLORS[d.name] ?? "#94a3b8"} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {acuityData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ACUITY_COLORS[d.name] ?? "#94a3b8" }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Medication Administration</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={medData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </NurseLayout>
  );
}
