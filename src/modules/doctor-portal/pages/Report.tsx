import { useEffect, useMemo, useState } from "react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { ReportBarChart } from "@modules/doctor-portal/components/ReportBarChart";
import { ReportPieChart } from "@modules/doctor-portal/components/ReportPieChart";
import * as api from "@modules/doctor-portal/api";
import type { Appointment, RosterPatient, ClinicalStatus } from "@modules/doctor-portal/api";

const CLINICAL_STATUS_COLORS: Record<ClinicalStatus, string> = {
  Stable: "#10B981", Attention: "#F59E0B", "High Risk": "#F97316", Critical: "#F43F5E", "Follow-up": "#3B82F6",
};

function countBy<T extends string>(items: T[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return Array.from(counts.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function Report() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [roster, setRoster] = useState<RosterPatient[]>([]);

  useEffect(() => {
    api.getAppointments().then(setAppointments);
    api.getPatientRoster().then(setRoster);
  }, []);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "Completed").length;
    const noShow = appointments.filter((a) => a.status === "No-show").length;
    const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
    const followUps = appointments.filter((a) => a.visitType === "Follow-up").length;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
    return {
      totalPatients: roster.length,
      totalAppointments: total,
      completed,
      noShowRate: pct(noShow),
      cancellationRate: pct(cancelled),
      followUpRate: pct(followUps),
    };
  }, [appointments, roster]);

  const statusBreakdown = useMemo(() => countBy(appointments.map((a) => a.status)), [appointments]);
  const visitTypeBreakdown = useMemo(() => countBy(appointments.map((a) => a.visitType)), [appointments]);

  const clinicalStatusBreakdown = useMemo(() => {
    const counts = countBy(roster.map((p) => p.clinicalStatus));
    return counts.map((c) => ({ ...c, color: CLINICAL_STATUS_COLORS[c.label as ClinicalStatus] ?? "#94A3B8" }));
  }, [roster]);

  const topDiagnoses = useMemo(() => {
    const all = roster.flatMap((p) => p.conditions);
    return countBy(all).slice(0, 8).reverse(); // reverse so highest count renders at top of a horizontal bar chart
  }, [roster]);

  return (
    <DoctorLayout active="Report">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Report</h1>
        <p className="text-xs text-slate-500 mt-0.5">A snapshot of your practice, computed from your actual patients and appointments.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: "Total Patients", value: stats.totalPatients },
          { label: "Total Appointments", value: stats.totalAppointments },
          { label: "Completed", value: stats.completed },
          { label: "No-show Rate", value: `${stats.noShowRate}%`, warn: stats.noShowRate > 15 },
          { label: "Cancellation Rate", value: `${stats.cancellationRate}%` },
          { label: "Follow-up Rate", value: `${stats.followUpRate}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[150px]">
            <p className={`text-xl font-bold ${s.warn ? "text-rose-600" : "text-slate-800"}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Appointments by Status</h2>
          <ReportBarChart data={statusBreakdown} layout="vertical" color="#2563EB" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Appointments by Visit Type</h2>
          <ReportBarChart data={visitTypeBreakdown} layout="horizontal" color="#7C3AED" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Patients by Clinical Status</h2>
          <ReportPieChart data={clinicalStatusBreakdown} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Top Diagnoses</h2>
          <ReportBarChart data={topDiagnoses} layout="horizontal" color="#0EA5E9" height={280} />
        </div>
      </div>
    </DoctorLayout>
  );
}
