import { FlaskConical, ScanLine } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { LabOrderRow, ImagingOrderRow, RadiologyReportRow } from "@modules/hospital-admin/api";

interface ResultsPanelProps {
  labOrders: LabOrderRow[];
  imagingOrders: ImagingOrderRow[];
  radiologyReports: RadiologyReportRow[];
}

/** Module-local — Lab & Radiology Results (spec §10-11): reads the REAL Laboratory/Radiology modules, never a second results store. */
export function ResultsPanel({ labOrders, imagingOrders, radiologyReports }: ResultsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical size={16} className="text-on-surface-variant" />
          <h2 className="text-lg font-bold text-on-surface">Laboratory Results</h2>
        </div>
        {labOrders.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No laboratory orders for current ED patients.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {labOrders.map((o) => (
              <div key={o.id} className="py-2.5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{o.patientName} — {o.testNames.join(", ")}</p>
                  <p className="text-xs text-on-surface-variant">{o.orderNumber} · {formatDateTime(o.orderedDateTime)}</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: o.hasCriticalFlag ? "color-mix(in srgb, var(--pulse-coral) 16%, transparent)" : "color-mix(in srgb, var(--signal-indigo) 16%, transparent)", color: o.hasCriticalFlag ? "var(--pulse-coral)" : "var(--signal-indigo)" }}>
                  {o.hasCriticalFlag ? "Critical" : o.status.replace(/-/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hero>
        <div className="flex items-center gap-2 mb-4">
          <ScanLine size={16} className="text-on-surface-variant" />
          <h2 className="text-lg font-bold text-on-surface">Imaging Orders</h2>
        </div>
        {imagingOrders.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No imaging orders for current ED patients.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {imagingOrders.map((o) => (
              <div key={o.id} className="py-2.5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{o.patientName} — {o.studyName}</p>
                  <p className="text-xs text-on-surface-variant">{o.orderNumber} · {formatDateTime(o.orderedDateTime)}</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: "color-mix(in srgb, var(--module-radiology) 16%, transparent)", color: "var(--module-radiology)" }}>{o.status.replace(/-/g, " ")}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hero>
        <div className="flex items-center gap-2 mb-4">
          <ScanLine size={16} className="text-on-surface-variant" />
          <h2 className="text-lg font-bold text-on-surface">Radiology Reports</h2>
        </div>
        {radiologyReports.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No radiology reports for current ED patients.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {radiologyReports.map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{r.patientName} — {r.studyName}</p>
                  <p className="text-xs text-on-surface-variant">{r.radiologistName} · {formatDateTime(r.effectiveDateTime)}</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: "color-mix(in srgb, var(--vital-green) 16%, transparent)", color: "var(--vital-green)" }}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
