import { Card } from "@shared/design-system/components";
import { resultMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { DataExportEvent } from "@modules/hospital-admin/api";

interface DataExportAuditPanelProps {
  events: DataExportEvent[];
}

/** Module-local — Data Export + Print + Download Audit (spec §22-24), consolidated into one tab per this project's established discipline: who exported/printed/downloaded what, how many records, why, and where to. */
export function DataExportAuditPanel({ events }: DataExportAuditPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        {events.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No export, print, or download events recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reference</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">User</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Method</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Dataset</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Records</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Authorized</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.map((e) => {
                  const result = resultMeta[e.result];
                  return (
                    <tr key={e.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{e.referenceId}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{e.actorName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{e.method}{e.format ? ` · ${e.format}` : ""}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{e.dataset}</td>
                      <td className="py-2.5 pr-3 text-right font-mono font-bold text-on-surface">{e.recordCount.toLocaleString()}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${e.authorized ? "bg-vital-green/14 text-vital-green" : "bg-pulse-coral/14 text-pulse-coral"}`}>{e.authorized ? "Authorized" : "Unauthorized"}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(e.timestamp)}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(result.color)}>{result.label}</span>
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
