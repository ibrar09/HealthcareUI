import { useState } from "react";
import { FileDown } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditReportRow } from "@modules/hospital-admin/api";

interface AuditReportsPanelProps {
  reportTypes: string[];
  requests: AuditReportRow[];
  onGenerate: (reportType: string, format: "pdf" | "csv" | "excel") => void;
}

const statusColor: Record<AuditReportRow["status"], string> = {
  queued: "var(--outline)",
  processing: "var(--caution-amber)",
  ready: "var(--vital-green)",
  failed: "var(--pulse-coral)",
};

/** Module-local — Audit Reports / Export Center (spec §31, §58): generating and exporting a report is itself an audited action, never a fabricated download. */
export function AuditReportsPanel({ reportTypes, requests, onGenerate }: AuditReportsPanelProps) {
  const [reportType, setReportType] = useState(reportTypes[0] ?? "");
  const [format, setFormat] = useState<"pdf" | "csv" | "excel">("pdf");

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Report Type</span>
            <select className={formInputClass} value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {reportTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Format</span>
            <select className={formInputClass} value={format} onChange={(e) => setFormat(e.target.value as "pdf" | "csv" | "excel")}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </label>
          <Button onClick={() => onGenerate(reportType, format)}><FileDown size={14} /> Generate Report</Button>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Export Center</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No reports generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Report</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Format</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Requested By</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Requested</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Records</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.reportType}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant uppercase">{r.format}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.requestedBy}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(r.requestedAt)}</td>
                    <td className="py-2.5 pr-3 text-right font-mono font-bold text-on-surface">{r.recordCount.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: `color-mix(in srgb, ${statusColor[r.status]} 16%, transparent)`, color: statusColor[r.status] }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
