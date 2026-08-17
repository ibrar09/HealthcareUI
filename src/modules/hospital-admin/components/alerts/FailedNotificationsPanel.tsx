import { Card, Button } from "@shared/design-system/components";
import { deliveryStatusMeta, channelLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { NotificationRecord } from "@modules/hospital-admin/api";

interface FailedNotificationsPanelProps {
  notifications: NotificationRecord[];
  onRetry: (id: string) => void;
}

/** Module-local — Failed Notifications (spec §38 dedicated page) + Retry Mechanism (spec §30): Push→SMS→Email channel fallback on retry. */
export function FailedNotificationsPanel({ notifications, onRetry }: FailedNotificationsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No failed or retrying notifications.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {notifications.map((n) => {
              const status = deliveryStatusMeta[n.status];
              return (
                <div key={n.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{n.event} <span className="text-xs font-normal text-on-surface-variant ml-1">{channelLabels[n.channel]} · {n.recipientName}</span></p>
                    <p className="text-xs text-on-surface-variant">{n.failureReason ?? "Unknown failure"} · {formatDateTime(n.createdAt)} · {n.retryCount} retr{n.retryCount === 1 ? "y" : "ies"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                    <Button size="sm" variant="outline" onClick={() => onRetry(n.id)}>Retry</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
