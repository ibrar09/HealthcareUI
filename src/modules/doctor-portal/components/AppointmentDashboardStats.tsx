import type { AppointmentSummary } from "@modules/doctor-portal/api";

interface AppointmentDashboardStatsProps {
  summary: AppointmentSummary | null;
}

/** Module-local — the Appointments header stat row (Today/Upcoming/Waiting/In Progress/Completed/Cancelled/No Show). */
export function AppointmentDashboardStats({ summary }: AppointmentDashboardStatsProps) {
  const stats: { label: string; value: number; tone?: "critical" | "warning" }[] = [
    { label: "Today", value: summary?.today ?? 0 },
    { label: "Upcoming", value: summary?.upcoming ?? 0 },
    { label: "Waiting", value: summary?.waiting ?? 0, tone: (summary?.waiting ?? 0) > 0 ? "warning" : undefined },
    { label: "In Progress", value: summary?.inProgress ?? 0 },
    { label: "Completed", value: summary?.completed ?? 0 },
    { label: "Cancelled", value: summary?.cancelled ?? 0 },
    { label: "No Show", value: summary?.noShow ?? 0, tone: (summary?.noShow ?? 0) > 0 ? "critical" : undefined },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-2.5 flex-1 min-w-[110px]">
          <p className={`text-xl font-bold ${s.tone === "critical" ? "text-rose-600" : s.tone === "warning" ? "text-amber-600" : "text-slate-800"}`}>{s.value}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
