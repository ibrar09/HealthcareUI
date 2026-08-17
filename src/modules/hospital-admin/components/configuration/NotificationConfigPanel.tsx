import { Card } from "@shared/design-system/components";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import { statusPillStyle } from "@modules/hospital-admin/components/configuration/configHelpers";
import type { NotificationEventConfig, CommunicationProviderConfig } from "@modules/hospital-admin/api";

interface NotificationConfigPanelProps {
  events: NotificationEventConfig[];
  providers: CommunicationProviderConfig[];
  onToggleEvent: (id: string, enabled: boolean) => void;
}

const priorityColor: Record<NotificationEventConfig["priority"], string> = {
  low: "var(--outline)",
  normal: "var(--signal-indigo)",
  high: "var(--caution-amber)",
  critical: "var(--pulse-coral)",
};
const statusColor: Record<CommunicationProviderConfig["status"], string> = {
  connected: "var(--vital-green)",
  "not-configured": "var(--outline)",
  error: "var(--pulse-coral)",
};

/** Module-local — Notification (spec §19) + Communication (spec §20) Configuration, combined: which events fire on which channels, and the gateway providers behind each channel. */
export function NotificationConfigPanel({ events, providers, onToggleEvent }: NotificationConfigPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Notification Events</h2>
        <div className="flex flex-col divide-y divide-line">
          {events.map((e) => (
            <div key={e.id} className="py-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(priorityColor[e.priority])}>{e.priority}</span>
                <span className="text-xs text-on-surface-variant">{e.channels.join(", ")}</span>
              </div>
              <ConfigToggleRow label={e.event} checked={e.enabled} onChange={(v) => onToggleEvent(e.id, v)} />
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Communication Providers</h2>
        <div className="flex flex-col divide-y divide-line">
          {providers.map((p) => (
            <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-on-surface capitalize">{p.channel} — {p.provider}</p>
                <p className="text-xs text-on-surface-variant">{p.credentialReference}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize flex-shrink-0" style={statusPillStyle(statusColor[p.status])}>{p.status.replace(/-/g, " ")}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
