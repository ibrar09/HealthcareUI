import { Card } from "@shared/design-system/components";
import { deliveryStatusMeta, channelLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { NotificationRecord } from "@modules/hospital-admin/api";

interface DeliveryLogsPanelProps {
  notifications: NotificationRecord[];
}

/** Module-local — Notification Delivery Tracking (spec §29): full CREATED→QUEUED→SENT→DELIVERED→READ→ACKNOWLEDGED status trail per notification. */
export function DeliveryLogsPanel({ notifications }: DeliveryLogsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Notification #</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Channel</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Sent</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Delivered</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Read</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Retries</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {notifications.map((n) => {
                const status = deliveryStatusMeta[n.status];
                return (
                  <tr key={n.id}>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{n.notificationNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{channelLabels[n.channel]}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{n.sentAt ? formatDateTime(n.sentAt) : "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{n.deliveredAt ? formatDateTime(n.deliveredAt) : "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{n.readAt ? formatDateTime(n.readAt) : "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{n.retryCount}</td>
                    <td className="py-2.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
