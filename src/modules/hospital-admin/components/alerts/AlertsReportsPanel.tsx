import { Card, KPICard } from "@shared/design-system/components";
import { severityMeta, channelLabels } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { AlertsReportData } from "@modules/hospital-admin/api";

interface AlertsReportsPanelProps {
  data: AlertsReportData | null;
}

function BarList({ rows, colorFor }: { rows: { label: string; count: number }[]; colorFor?: (label: string) => string }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-36 flex-shrink-0 text-xs font-semibold text-on-surface-variant truncate">{row.label}</span>
          <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(row.count / max) * 100}%`, backgroundColor: colorFor ? colorFor(row.label) : "var(--signal-indigo)" }} />
          </div>
          <span className="w-10 text-right text-xs font-mono font-bold text-on-surface">{row.count}</span>
        </div>
      ))}
    </div>
  );
}

/** Module-local — Notification Reports (spec §37): counts by department/severity/source/channel, all computed from real Alert/Notification records. */
export function AlertsReportsPanel({ data }: AlertsReportsPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Alerts" value={data.totalAlerts} accentColor="var(--signal-indigo)" />
        <KPICard label="Acknowledged" value={data.acknowledged} accentColor="var(--vital-green)" />
        <KPICard label="Escalated" value={data.escalated} accentColor="var(--pulse-coral)" />
        <KPICard label="Unresolved" value={data.unresolved} accentColor="var(--caution-amber)" />
      </div>
      <KPICard label="Average Acknowledgement Time" value={data.averageAcknowledgementMinutes} unit="min" accentColor="var(--signal-indigo)" />

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Alerts by Severity</h2>
        <BarList rows={data.bySeverity.map((r) => ({ label: severityMeta[r.severity].label, count: r.count }))} colorFor={(label) => Object.values(severityMeta).find((s) => s.label === label)?.color ?? "var(--signal-indigo)"} />
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Alerts by Department</h2>
        <BarList rows={data.byDepartment.map((r) => ({ label: r.name, count: r.count }))} />
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Alerts by Source</h2>
        <BarList rows={data.bySource.map((r) => ({ label: r.source, count: r.count }))} />
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Notifications by Channel</h2>
        <BarList rows={data.byChannel.map((r) => ({ label: channelLabels[r.channel], count: r.count }))} />
      </Card>
    </div>
  );
}
