import { Card } from "@shared/design-system/components";
import { deliveryStatusMeta, channelLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { NotificationRecord, NotificationChannel, NotificationDeliveryStatus } from "@modules/hospital-admin/api";

interface NotificationHistoryPanelProps {
  notifications: NotificationRecord[];
  channelFilter: NotificationChannel | "all";
  onChannelFilterChange: (value: NotificationChannel | "all") => void;
  statusFilter: NotificationDeliveryStatus | "all";
  onStatusFilterChange: (value: NotificationDeliveryStatus | "all") => void;
}

const channels: (NotificationChannel | "all")[] = ["all", "email", "sms", "push", "whatsapp", "in-app"];
const statuses: (NotificationDeliveryStatus | "all")[] = ["all", "created", "queued", "sent", "delivered", "read", "acknowledged", "failed", "retrying"];

/** Module-local — Notification History (spec §38 dedicated page): every notification ever sent, filterable by channel/status. */
export function NotificationHistoryPanel({ notifications, channelFilter, onChannelFilterChange, statusFilter, onStatusFilterChange }: NotificationHistoryPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-2 flex-wrap">
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={channelFilter} onChange={(e) => onChannelFilterChange(e.target.value as NotificationChannel | "all")}>
          {channels.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All Channels" : channelLabels[c]}</option>
          ))}
        </select>
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as NotificationDeliveryStatus | "all")}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Statuses" : deliveryStatusMeta[s].label}</option>
          ))}
        </select>
      </div>

      <Card hero>
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No notifications match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Notification #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Event</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Recipient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Channel</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Created</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {notifications.map((n) => {
                  const status = deliveryStatusMeta[n.status];
                  return (
                    <tr key={n.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{n.notificationNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface">{n.event}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{n.recipientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{channelLabels[n.channel]}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(n.createdAt)}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
