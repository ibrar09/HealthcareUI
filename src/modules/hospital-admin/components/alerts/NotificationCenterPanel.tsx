import { Card } from "@shared/design-system/components";
import { deliveryStatusMeta, channelLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { NotificationRecord } from "@modules/hospital-admin/api";

interface NotificationCenterPanelProps {
  notifications: NotificationRecord[];
}

/** Module-local — Notification Center (spec §38 dedicated page): the in-app 🔔 feed for the signed-in user. */
export function NotificationCenterPanel({ notifications }: NotificationCenterPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No notifications yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {notifications.map((n) => {
              const status = deliveryStatusMeta[n.status];
              return (
                <div key={n.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{n.event.split("_").join(" ")}</p>
                    <p className="text-xs text-on-surface-variant">{channelLabels[n.channel]} · {formatDateTime(n.createdAt)}</p>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0" style={statusPillStyle(status.color)}>{status.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
