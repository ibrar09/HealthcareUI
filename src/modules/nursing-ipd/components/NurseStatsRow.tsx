import { Users, HeartPulse, Pill, CheckSquare, Activity, Clock } from "lucide-react";

interface DashboardStats {
  myPatients: number;
  critical: number;
  medicationsDue: number;
  tasksDue: number;
  vitalsDue: number;
  pending: number;
}

interface NurseStatsRowProps {
  stats: DashboardStats | null;
}

const CARD_STYLE = {
  default: { bg: "bg-teal-50", icon: "text-teal-600", value: "text-slate-800" },
  critical: { bg: "bg-rose-50", icon: "text-rose-600", value: "text-rose-600" },
  warning: { bg: "bg-amber-50", icon: "text-amber-600", value: "text-amber-600" },
};

/** Module-local — the Nurse Dashboard's header stat row, computed live from the assigned patient list. */
export function NurseStatsRow({ stats }: NurseStatsRowProps) {
  const cards: { label: string; value: number; icon: typeof Users; tone: keyof typeof CARD_STYLE }[] = [
    { label: "My Patients", value: stats?.myPatients ?? 0, icon: Users, tone: "default" },
    { label: "Critical", value: stats?.critical ?? 0, icon: HeartPulse, tone: (stats?.critical ?? 0) > 0 ? "critical" : "default" },
    { label: "Medications Due", value: stats?.medicationsDue ?? 0, icon: Pill, tone: "warning" },
    { label: "Tasks Due", value: stats?.tasksDue ?? 0, icon: CheckSquare, tone: "default" },
    { label: "Vitals Due", value: stats?.vitalsDue ?? 0, icon: Activity, tone: (stats?.vitalsDue ?? 0) > 0 ? "warning" : "default" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, tone: "default" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
      {cards.map((c) => {
        const style = CARD_STYLE[c.tone];
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-2.5 ${style.bg}`}>
              <Icon className={`w-4.5 h-4.5 ${style.icon}`} />
            </span>
            <p className={`text-2xl font-bold ${style.value}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}
