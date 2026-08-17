import { Card, Button } from "@shared/design-system/components";
import { statusPillStyle } from "@modules/hospital-admin/components/configuration/configHelpers";
import type { HL7Configuration, FHIRConfiguration, MirthChannelConfig, ApiClientConfig, WebhookConfig, MirthChannelStatus } from "@modules/hospital-admin/api";

interface InteroperabilityPanelProps {
  hl7: HL7Configuration | null;
  fhir: FHIRConfiguration | null;
  mirthChannels: MirthChannelConfig[];
  apiClients: ApiClientConfig[];
  webhooks: WebhookConfig[];
  onSetMirthStatus: (id: string, status: MirthChannelStatus) => void;
  onRevokeApiClient: (id: string) => void;
}

const mirthStatusColor: Record<MirthChannelStatus, string> = { running: "var(--vital-green)", stopped: "var(--outline)", error: "var(--pulse-coral)" };

/** Module-local — Interoperability (spec §21-23): HL7 / FHIR / Mirth / API / Webhooks, consolidated per the spec's own §43 tree grouping them together. Secrets are always masked references, never real values. */
export function InteroperabilityPanel({ hl7, fhir, mirthChannels, apiClients, webhooks, onSetMirthStatus, onRevokeApiClient }: InteroperabilityPanelProps) {
  if (!hl7 || !fhir) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">HL7 Configuration</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-on-surface-variant">Version</p><p className="font-semibold text-on-surface">{hl7.version}</p></div>
          <div><p className="text-xs text-on-surface-variant">Sending App / Facility</p><p className="font-semibold text-on-surface">{hl7.sendingApplication} / {hl7.sendingFacility}</p></div>
          <div><p className="text-xs text-on-surface-variant">Receiving App / Facility</p><p className="font-semibold text-on-surface">{hl7.receivingApplication} / {hl7.receivingFacility}</p></div>
          <div><p className="text-xs text-on-surface-variant">ACK Behavior</p><p className="font-semibold text-on-surface capitalize">{hl7.ackBehavior.replace(/-/g, " ")}</p></div>
          <div><p className="text-xs text-on-surface-variant">MLLP Endpoint</p><p className="font-mono text-xs font-semibold text-on-surface">{hl7.mllpEndpoint}</p></div>
          <div><p className="text-xs text-on-surface-variant">Retry Attempts</p><p className="font-semibold text-on-surface">{hl7.retryAttempts}</p></div>
        </div>
        <p className="text-xs text-on-surface-variant mt-3">Supported message types: {hl7.supportedMessageTypes.join(", ")}</p>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">FHIR Configuration</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-3">
          <div><p className="text-xs text-on-surface-variant">Version</p><p className="font-semibold text-on-surface">{fhir.version}</p></div>
          <div><p className="text-xs text-on-surface-variant">Server Base URL</p><p className="font-mono text-xs font-semibold text-on-surface break-all">{fhir.serverBaseUrl}</p></div>
          <div><p className="text-xs text-on-surface-variant">Auth Type</p><p className="font-semibold text-on-surface uppercase">{fhir.authenticationType}</p></div>
          <div><p className="text-xs text-on-surface-variant">Client ID</p><p className="font-mono text-xs font-semibold text-on-surface">{fhir.clientId}</p></div>
          <div><p className="text-xs text-on-surface-variant">Client Secret</p><p className="text-xs text-on-surface-variant italic">{fhir.clientSecretReference}</p></div>
          <div><p className="text-xs text-on-surface-variant">Scopes</p><p className="font-mono text-xs font-semibold text-on-surface">{fhir.scopes.join(", ")}</p></div>
        </div>
        <p className="text-xs text-on-surface-variant">Supported resources: {fhir.supportedResources.join(", ")}</p>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Mirth Channels</h2>
        <div className="flex flex-col divide-y divide-line">
          {mirthChannels.map((c) => (
            <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-on-surface">{c.name}</p>
                <p className="text-xs text-on-surface-variant">{c.sourceSystem} → {c.destinationSystem} ({c.transformation})</p>
                <p className="text-[11px] text-on-surface-variant/70">{c.messagesProcessedToday} processed today · {c.errorsToday} error(s)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={statusPillStyle(mirthStatusColor[c.status])}>{c.status}</span>
                {c.status === "running" ? (
                  <Button size="sm" variant="ghost" onClick={() => onSetMirthStatus(c.id, "stopped")}>Stop</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => onSetMirthStatus(c.id, "running")}>Start</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">API Clients</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Client</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Environment</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Rate Limit</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {apiClients.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.name}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{c.environment}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{c.rateLimitPerMinute}/min</td>
                  <td className="py-2.5 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${c.status === "active" ? "bg-vital-green/14 text-vital-green" : "bg-outline/14 text-on-surface-variant"}`}>{c.status}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    {c.status === "active" && <Button size="sm" variant="ghost" onClick={() => onRevokeApiClient(c.id)}>Revoke</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Webhooks</h2>
        <div className="flex flex-col divide-y divide-line">
          {webhooks.map((w) => (
            <div key={w.id} className="py-2.5">
              <p className="text-sm font-semibold text-on-surface">{w.name}</p>
              <p className="text-xs text-on-surface-variant font-mono break-all">{w.targetUrl}</p>
              <p className="text-[11px] text-on-surface-variant/70">{w.events.join(", ")} · last delivery {w.lastDeliveryStatus ?? "—"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
