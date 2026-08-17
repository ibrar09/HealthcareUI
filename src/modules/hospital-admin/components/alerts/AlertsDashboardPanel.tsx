import { Bell, AlertOctagon, AlertTriangle, Clock, CheckCircle2, ArrowUpCircle, XCircle, Send, Percent, Timer } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { statusMeta, statusPillStyle } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { AlertsDashboardData } from "@modules/hospital-admin/api";

interface AlertsDashboardPanelProps {
  data: AlertsDashboardData | null;
}

/** Module-local — Alerts & Notifications Dashboard (spec §1): KPIs + status breakdown, plus real live counts pulled from Inventory/Laboratory/Radiology/Security's own alert functions. */
export function AlertsDashboardPanel({ data }: AlertsDashboardPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Alerts Today" value={data.totalAlertsToday} icon={<Bell size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Critical Alerts" value={data.criticalAlerts} icon={<AlertOctagon size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="High-Priority Alerts" value={data.highPriorityAlerts} icon={<AlertTriangle size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Unresolved Alerts" value={data.unresolvedAlerts} icon={<Clock size={14} />} accentColor="var(--caution-amber)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Acknowledged" value={data.acknowledgedAlerts} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Escalated" value={data.escalatedAlerts} icon={<ArrowUpCircle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Failed Notifications" value={data.failedNotifications} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Notifications Sent" value={data.notificationsSent} icon={<Send size={14} />} accentColor="var(--signal-indigo)" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Delivery Rate" value={data.deliveryRatePercent} unit="%" icon={<Percent size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Avg. Response Time" value={data.averageResponseMinutes} unit="min" icon={<Timer size={14} />} accentColor="var(--signal-indigo)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Alert Status Breakdown</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.statusBreakdown).map(([status, count]) => (
            <span key={status} className="rounded-full px-3 py-1.5 text-xs font-bold" style={statusPillStyle(statusMeta[status as keyof typeof statusMeta].color)}>
              {statusMeta[status as keyof typeof statusMeta].label}: {count}
            </span>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-1">Live System Signals</h2>
        <p className="text-xs text-on-surface-variant mb-4">Computed live from each module's own real alert function — never a stale snapshot.</p>
        <div className="flex flex-col divide-y divide-line">
          {data.liveSignals.map((s) => (
            <div key={s.source} className="flex items-center justify-between py-2 text-sm">
              <span className="font-semibold text-on-surface">{s.source}</span>
              <span className="font-mono font-bold text-on-surface">{s.count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
