import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Card, KPICard, Button } from "@shared/design-system/components";
import type { PacsStatusRow, PacsSummary, IntegrationStatus } from "@modules/hospital-admin/api";

const transferMeta: Record<string, { label: string; color: string }> = {
  success: { label: "Sent", color: "var(--vital-green)" },
  pending: { label: "Pending", color: "var(--caution-amber)" },
  failed: { label: "Failed", color: "var(--pulse-coral)" },
};

const integrationStatusMeta: Record<string, { label: string; color: string }> = {
  connected: { label: "Connected", color: "var(--vital-green)" },
  degraded: { label: "Degraded", color: "var(--caution-amber)" },
  disconnected: { label: "Disconnected", color: "var(--pulse-coral)" },
};

interface IntegrationsPanelProps {
  summary: PacsSummary | null;
  studies: PacsStatusRow[];
  integrations: IntegrationStatus[];
  onRetry: (studyId: string) => void;
}

/** Module-local — Radiology "Integrations" tab, covering spec §19 (PACS), §20 (DICOM), and the lightweight FHIR/HL7 status mentions. [oversight]: retry is a workflow-level action on the pacsTransferStatus already recorded per study — no DICOM networking or PACS viewer lives here. */
export function IntegrationsPanel({ summary, studies, integrations, onRetry }: IntegrationsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label="PACS Connectivity" value={summary.connected ? "Connected" : "Degraded"} icon={summary.connected ? <Wifi size={14} /> : <WifiOff size={14} />} accentColor={summary.connected ? "var(--vital-green)" : "var(--pulse-coral)"} />
          <KPICard label="Transferred" value={summary.success} icon={<RefreshCw size={14} />} accentColor="var(--vital-green)" />
          <KPICard label="Pending" value={summary.pending} icon={<RefreshCw size={14} />} accentColor="var(--caution-amber)" />
          <KPICard label="Failed" value={summary.failed} icon={<RefreshCw size={14} />} accentColor="var(--pulse-coral)" />
        </div>
      )}

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Integration Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrations.map((i) => {
            const meta = integrationStatusMeta[i.status];
            return (
              <div key={i.name} className="rounded-xl border border-line px-4 py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-on-surface">{i.name}</p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">{i.standard}</p>
                <p className="text-xs text-on-surface-variant">{i.detail}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Study Transfer Log (PACS / DICOM)</h2>
        {studies.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No studies transferred yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Order</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">AE Title</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Destination</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Study UID</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {studies.map((s) => {
                  const meta = transferMeta[s.transferStatus];
                  return (
                    <tr key={s.studyId}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{s.orderNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{s.patientName}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{s.aeTitle}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{s.pacsDestination}</td>
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-on-surface-variant truncate max-w-[180px]" title={s.studyInstanceUID}>
                        {s.studyInstanceUID}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {s.transferStatus === "failed" && (
                          <Button size="sm" variant="outline" onClick={() => onRetry(s.studyId)} icon={<RefreshCw size={12} />}>
                            Retry
                          </Button>
                        )}
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
