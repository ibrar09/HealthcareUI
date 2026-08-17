import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, KPICard, Button } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { CriticalFindingRow } from "@modules/hospital-admin/api";

interface RadiologyCriticalFindingsPanelProps {
  findings: CriticalFindingRow[];
  showAll: boolean;
  onToggleShowAll: (v: boolean) => void;
  onAcknowledge: (finding: CriticalFindingRow) => void;
}

/** Module-local — Radiology "Critical Findings" tab (spec §23): Finding Identified → Notification → Acknowledgement → Audit. Acknowledgment is the one workflow action this section owns. */
export function RadiologyCriticalFindingsPanel({ findings, showAll, onToggleShowAll, onAcknowledge }: RadiologyCriticalFindingsPanelProps) {
  const open = findings.filter((f) => f.notificationStatus !== "acknowledged");
  const visible = showAll ? findings : open;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Open — Needs Acknowledgement" value={open.length} icon={<AlertTriangle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Acknowledged" value={findings.length - open.length} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onToggleShowAll(false)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            !showAll ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => onToggleShowAll(true)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            showAll ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          All
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No critical findings to escalate.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((f) => (
            <Card key={f.id} accentColor={f.notificationStatus === "acknowledged" ? "var(--vital-green)" : "var(--pulse-coral)"}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-bold text-on-surface flex items-center gap-2">
                    <AlertTriangle size={14} className="text-pulse-coral flex-shrink-0" />
                    {f.finding}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {f.patientName} · {f.orderNumber} · Radiologist: {f.radiologistName}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Flagged {formatDateTime(f.flaggedAt)}
                    {f.notifiedClinicianName && ` · Notified ${f.notifiedClinicianName}`}
                    {f.notificationStatus === "acknowledged" && f.acknowledgedAt && ` · Acknowledged by ${f.acknowledgedBy} at ${formatDateTime(f.acknowledgedAt)}`}
                  </p>
                  {f.escalationNote && <p className="text-xs text-on-surface-variant mt-1 italic">"{f.escalationNote}"</p>}
                </div>
                <div className="flex-shrink-0">
                  {f.notificationStatus === "acknowledged" ? (
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-vital-green/14 text-vital-green">Acknowledged</span>
                  ) : (
                    <Button size="sm" onClick={() => onAcknowledge(f)}>
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
