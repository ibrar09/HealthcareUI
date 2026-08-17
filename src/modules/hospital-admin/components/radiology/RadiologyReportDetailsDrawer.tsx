import { AlertTriangle } from "lucide-react";
import { Drawer } from "@shared/design-system/components";
import { radiologyReportStatusMeta, formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { RadiologyReportDetail } from "@modules/hospital-admin/api";

interface RadiologyReportDetailsDrawerProps {
  report: RadiologyReportDetail | null;
  onClose: () => void;
}

/** Module-local — Report Details (spec §22): Clinical Information/Technique/Findings/Impression/Recommendation, view-only. */
export function RadiologyReportDetailsDrawer({ report, onClose }: RadiologyReportDetailsDrawerProps) {
  const meta = report ? radiologyReportStatusMeta[report.status] : null;

  return (
    <Drawer open={Boolean(report)} onClose={onClose} title={report?.orderNumber ?? ""} subtitle={report ? `${report.patientName} · ${report.studyName}` : undefined}>
      {report && meta && (
        <>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
              {meta.label}
            </span>
            {report.hasCriticalFinding && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pulse-coral/14 text-pulse-coral text-xs font-bold px-2.5 py-1">
                <AlertTriangle size={12} /> Critical finding
              </span>
            )}
          </div>

          <div className="mb-6 rounded-xl border border-line divide-y divide-line">
            <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
              <span className="text-xs text-on-surface-variant flex-shrink-0">Radiologist</span>
              <span className="text-sm font-medium text-on-surface text-right">{report.radiologistName}</span>
            </div>
            <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
              <span className="text-xs text-on-surface-variant flex-shrink-0">Effective</span>
              <span className="text-sm font-medium text-on-surface text-right">{formatDateTime(report.effectiveDateTime)}</span>
            </div>
            {report.issuedDateTime && (
              <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
                <span className="text-xs text-on-surface-variant flex-shrink-0">Issued</span>
                <span className="text-sm font-medium text-on-surface text-right">{formatDateTime(report.issuedDateTime)}</span>
              </div>
            )}
          </div>

          {report.technique && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Technique</h3>
              <p className="text-sm text-on-surface">{report.technique}</p>
            </div>
          )}
          {report.findings && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Findings</h3>
              <p className="text-sm text-on-surface">{report.findings}</p>
            </div>
          )}
          {report.impression && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Impression</h3>
              <p className={`text-sm ${report.hasCriticalFinding ? "text-pulse-coral font-semibold" : "text-on-surface"}`}>{report.impression}</p>
            </div>
          )}
          {report.recommendation && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Recommendation</h3>
              <p className="text-sm text-on-surface">{report.recommendation}</p>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
