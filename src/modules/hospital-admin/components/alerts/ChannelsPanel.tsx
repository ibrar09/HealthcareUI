import { Card } from "@shared/design-system/components";
import type { CommunicationProviderConfig } from "@modules/hospital-admin/api";

interface ChannelsPanelProps {
  providers: CommunicationProviderConfig[];
}

const statusColor: Record<CommunicationProviderConfig["status"], string> = {
  connected: "var(--vital-green)",
  "not-configured": "var(--outline)",
  error: "var(--pulse-coral)",
};

/** Module-local — Channels (spec §19): reads Configuration's own `getCommunicationProviders()` directly rather than duplicating a second provider registry — Configuration already owns SMTP/SMS/Push/WhatsApp connection status. */
export function ChannelsPanel({ providers }: ChannelsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        <div className="flex flex-col divide-y divide-line">
          {providers.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-on-surface capitalize">{p.channel}</p>
                <p className="text-xs text-on-surface-variant">{p.provider}</p>
                <p className="text-[11px] text-on-surface-variant/70 mt-0.5">{p.credentialReference}</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${statusColor[p.status]} 16%, transparent)`, color: statusColor[p.status] }}>
                {p.status === "not-configured" ? "Not Configured" : p.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
