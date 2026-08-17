import { Card } from "@shared/design-system/components";
import { channelLabels } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { NotificationRule } from "@modules/hospital-admin/api";

interface NotificationRulesPanelProps {
  rules: NotificationRule[];
}

/** Module-local — Notification Rules (spec §22): the simpler event → condition → notify-role → channel → escalation routing table. */
export function NotificationRulesPanel({ rules }: NotificationRulesPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Event</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Condition</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Notify</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Channel</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">If Not Acknowledged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.event}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{r.condition}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{r.notifyRole}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{r.channels.map((c) => channelLabels[c]).join(" + ")}</td>
                  <td className="py-2.5 text-on-surface-variant">{r.escalateAfterMinutes !== undefined ? `Escalate after ${r.escalateAfterMinutes} min` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
