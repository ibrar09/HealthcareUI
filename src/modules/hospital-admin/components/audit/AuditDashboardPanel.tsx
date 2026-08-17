import { Activity, AlertOctagon, XCircle, Calendar, UserCheck, FileEdit } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { categoryLabels } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditDashboardData } from "@modules/hospital-admin/api";

interface AuditDashboardPanelProps {
  data: AuditDashboardData | null;
}

/** Module-local — Audit Dashboard (spec §1, §47): the hospital-wide picture, every count computed from real events. */
export function AuditDashboardPanel({ data }: AuditDashboardPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KPICard label="Total Events" value={data.totalEvents.toLocaleString()} icon={<Activity size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Critical Events" value={data.criticalEvents} icon={<AlertOctagon size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Failed Actions" value={data.failedActions} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Today's Events" value={data.todaysEvents} icon={<Calendar size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Patient Access" value={data.patientAccessEvents} icon={<UserCheck size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Data Changes" value={data.dataChangeEvents} icon={<FileEdit size={14} />} accentColor="var(--caution-amber)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Login Events" value={data.loginEvents} accentColor="var(--signal-indigo)" />
        <KPICard label="Permission Changes" value={data.permissionChanges} accentColor="var(--caution-amber)" />
        <KPICard label="Security Events" value={data.securityEvents} accentColor="var(--pulse-coral)" />
        <KPICard label="System Events" value={data.systemEvents} accentColor="var(--outline)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Events by Category</h2>
        <div className="flex flex-col gap-2.5">
          {data.byCategory.map((row) => {
            const max = Math.max(...data.byCategory.map((r) => r.count), 1);
            return (
              <div key={row.category} className="flex items-center gap-3">
                <span className="w-32 flex-shrink-0 text-xs font-semibold text-on-surface-variant">{categoryLabels[row.category]}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(row.count / max) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-mono font-bold text-on-surface">{row.count}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
