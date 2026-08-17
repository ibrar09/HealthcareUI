import { useEffect, useState } from "react";
import { Users, FlaskConical, MessageSquare, Timer } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { KPICard, CardRow, StatusChip, Card, TrendAreaChart } from "@shared/design-system/components";
import * as api from "@modules/doctor-portal/api";
import type { Appointment } from "@shared/types/domain";

const statusTone = { "checked-in": "info", waiting: "warning", completed: "success" } as const;
const statusLabel = { "checked-in": "Checked In", waiting: "Waiting", completed: "Completed" } as const;
const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DoctorDashboard() {
  const [schedule, setSchedule] = useState<Appointment[]>([]);
  const [results, setResults] = useState<Awaited<ReturnType<typeof api.getResultsAwaitingReview>>>([]);
  const [volume, setVolume] = useState<number[]>([]);

  useEffect(() => {
    api.getTodaysSchedule().then(setSchedule);
    api.getResultsAwaitingReview().then(setResults);
    api.getPatientVolume7d().then(setVolume);
  }, []);

  return (
    <DoctorLayout active="Dashboard">
      <h1 className="font-display font-bold text-2xl text-on-surface">Good morning, Dr. Raza</h1>
      <p className="font-mono text-sm text-on-surface-variant/80 mb-6">Thursday, August 14, 2026</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Today's Patients"
          value={14}
          icon={<Users size={14} />}
          accentColor="var(--signal-indigo)"
          trendDelta="8%"
          trend={[6, 9, 7, 11, 10, 12, 14]}
        />
        <KPICard
          label="Pending Results"
          value={6}
          icon={<FlaskConical size={14} />}
          accentColor="var(--pulse-coral)"
          trendDelta="5%"
          trendGood={false}
          trend={[2, 3, 3, 5, 4, 6, 6]}
        />
        <KPICard
          label="Messages"
          value={3}
          icon={<MessageSquare size={14} />}
          accentColor="var(--ink-navy)"
          trendDelta="2%"
          trend={[1, 2, 1, 3, 2, 3, 3]}
        />
        <KPICard
          label="Avg. Wait Time"
          value={12}
          unit="min"
          icon={<Timer size={14} />}
          accentColor="var(--vital-green)"
          trendDelta="6%"
          trendDirection="down"
          trend={[18, 16, 17, 14, 13, 12, 12]}
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <h2 className="font-display font-semibold text-on-surface mb-3">Today's Schedule</h2>
          <div className="flex flex-col gap-3">
            {schedule.map((appt) => (
              <CardRow
                key={appt.time}
                accentColor={
                  appt.status === "checked-in" ? "var(--signal-indigo)" : appt.status === "waiting" ? "var(--caution-amber)" : "var(--vital-green)"
                }
                leading={<span className="font-mono font-bold text-on-surface text-sm w-[78px] inline-block">{appt.time}</span>}
                title={appt.patient}
                subtitle={appt.type}
                trailing={<StatusChip tone={statusTone[appt.status as keyof typeof statusTone]}>{statusLabel[appt.status as keyof typeof statusLabel]}</StatusChip>}
              />
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <h2 className="font-display font-semibold text-on-surface mb-3">Results Awaiting Review</h2>
          <div className="flex flex-col gap-3">
            {results.map((r) => (
              <CardRow
                key={r.test}
                accentColor={r.abnormal ? "var(--pulse-coral)" : "var(--vital-green)"}
                title={r.test}
                subtitle={`${r.patient} · ${r.source}`}
                trailing={
                  r.abnormal ? <StatusChip tone="critical" pulse>Flagged</StatusChip> : <StatusChip tone="success">Normal</StatusChip>
                }
              />
            ))}
          </div>
        </div>
      </div>

      <Card className="mt-6" accentColor="var(--signal-indigo)">
        <h2 className="font-display font-semibold text-on-surface mb-1">Patient Volume This Week</h2>
        <p className="font-mono text-xs text-on-surface-variant/70 mb-3">Mon – Sun</p>
        {volume.length > 0 && (
          <TrendAreaChart
            data={volume.map((value, i) => ({ label: weekLabels[i] ?? "", value }))}
            color="var(--signal-indigo)"
            height={180}
          />
        )}
      </Card>
    </DoctorLayout>
  );
}
