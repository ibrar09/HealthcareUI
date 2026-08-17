import { AlertTriangle, Beaker, Clock, FlaskConical, TestTubeDiagonal, TimerReset } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { labPriorityMeta } from "@modules/hospital-admin/components/laboratory/labStatusMeta";
import type { LabDashboardData } from "@modules/hospital-admin/api";

interface LabDashboardOverviewProps {
  data: LabDashboardData;
}

/** Module-local — Laboratory "Dashboard" tab: volume, work-in-progress, and TAT at a glance ([oversight] — status/volume only). */
export function LabDashboardOverview({ data }: LabDashboardOverviewProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Orders Today" value={data.ordersToday} icon={<FlaskConical size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Avg. TAT (Verified)" value={data.avgTATHours} unit="hrs" icon={<TimerReset size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Critical — Open" value={data.criticalOpen} icon={<AlertTriangle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Rejected Specimens" value={data.rejectedSpecimens} icon={<Beaker size={14} />} accentColor="var(--caution-amber)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card accentColor="var(--outline)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Pending Collection</p>
          <p className="text-2xl font-bold text-on-surface">{data.pendingCollection}</p>
        </Card>
        <Card accentColor="var(--caution-amber)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Awaiting Receipt</p>
          <p className="text-2xl font-bold text-on-surface">{data.awaitingReceipt}</p>
        </Card>
        <Card accentColor="var(--signal-indigo)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">In Process</p>
          <p className="text-2xl font-bold text-on-surface">{data.inProcess}</p>
        </Card>
        <Card accentColor="var(--module-radiology)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Pending Verification</p>
          <p className="text-2xl font-bold text-on-surface">{data.resultedPendingVerification}</p>
        </Card>
        <Card accentColor="var(--vital-green)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Verified Today</p>
          <p className="text-2xl font-bold text-on-surface">{data.verifiedToday}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Clock size={16} className="text-signal-indigo" /> Orders by Priority
          </h2>
          <div className="flex flex-col gap-3">
            {data.byPriority.map((p) => {
              const meta = labPriorityMeta[p.priority];
              return (
                <div key={p.priority} className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <span className="text-sm font-bold text-on-surface">{p.count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card hero className="lg:col-span-2">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <TestTubeDiagonal size={16} className="text-signal-indigo" /> Orders by Department
          </h2>
          <div className="flex flex-col gap-3">
            {data.byDepartment.map((d) => {
              const max = Math.max(...data.byDepartment.map((x) => x.count), 1);
              return (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium">{d.name}</span>
                    <span className="text-on-surface-variant">{d.count}</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${(d.count / max) * 100}%`, backgroundColor: "var(--module-lab)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
