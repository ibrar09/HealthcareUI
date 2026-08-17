import { Users, Hourglass, ClipboardCheck, Stethoscope, Activity, AlertOctagon, BedDouble, ArrowUpRight, ArrowRightLeft, LogOut, Clock, Timer } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import type { EmergencyDashboardData } from "@modules/hospital-admin/api";

interface EmergencyDashboardPanelProps {
  data: EmergencyDashboardData | null;
}

/** Module-local — Emergency Dashboard (spec §1): every KPI computed from real visit/observation/disposition records. */
export function EmergencyDashboardPanel({ data }: EmergencyDashboardPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Patients" value={data.totalPatients} icon={<Users size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Waiting for Triage" value={data.waitingForTriage} icon={<Hourglass size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Triage Completed" value={data.triageCompleted} icon={<ClipboardCheck size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Waiting for Doctor" value={data.waitingForDoctor} icon={<Stethoscope size={14} />} accentColor="var(--signal-indigo)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="In Treatment" value={data.inTreatment} icon={<Activity size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Critical Patients" value={data.criticalPatients} icon={<AlertOctagon size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Observation" value={data.observationPatients} icon={<BedDouble size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Admissions Pending" value={data.admissionsPending} icon={<ArrowUpRight size={14} />} accentColor="var(--caution-amber)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Transfers Pending" value={data.transfersPending} icon={<ArrowRightLeft size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Discharges Today" value={data.dischargesToday} icon={<LogOut size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Avg Wait Time" value={data.averageWaitMinutes} unit="min" icon={<Clock size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Avg Length of Stay" value={data.averageLengthOfStayMinutes} unit="min" icon={<Timer size={14} />} accentColor="var(--signal-indigo)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Arrivals by Hour</h2>
        {data.arrivalsByHour.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4">No arrivals recorded yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {data.arrivalsByHour.map((point) => {
              const max = Math.max(...data.arrivalsByHour.map((p) => p.count), 1);
              return (
                <div key={point.hour} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-t-md bg-pulse-coral/70" style={{ height: `${Math.max((point.count / max) * 100, 4)}%` }} />
                  <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{point.hour}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
