import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, KPICard, Button } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/laboratory/labStatusMeta";
import type { LabCriticalAlertRow } from "@modules/hospital-admin/api";

interface LabCriticalResultsPanelProps {
  alerts: LabCriticalAlertRow[];
  showAll: boolean;
  onToggleShowAll: (v: boolean) => void;
  onAcknowledge: (alert: LabCriticalAlertRow) => void;
}

/** Module-local — Laboratory "Critical Results" tab: escalation only, per the module map's [oversight] scope ("no result entry here"). */
export function LabCriticalResultsPanel({ alerts, showAll, onToggleShowAll, onAcknowledge }: LabCriticalResultsPanelProps) {
  const open = alerts.filter((a) => !a.acknowledged);
  const visible = showAll ? alerts : open;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Open — Needs Escalation" value={open.length} icon={<AlertTriangle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Acknowledged" value={alerts.length - open.length} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
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
        <p className="text-center text-sm text-on-surface-variant py-12">No critical results to escalate.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => (
            <Card key={a.id} accentColor={a.acknowledged ? "var(--vital-green)" : "var(--pulse-coral)"}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-bold text-on-surface flex items-center gap-2">
                    <AlertTriangle size={14} className="text-pulse-coral flex-shrink-0" />
                    {a.testName}: <span className="font-mono">{a.value}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {a.patientName} · {a.orderNumber} · Reference: {a.referenceRangeText}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Flagged {formatDateTime(a.flaggedAt)}
                    {a.acknowledged && ` · Acknowledged by ${a.acknowledgedBy} at ${a.acknowledgedAt ? formatDateTime(a.acknowledgedAt) : ""}`}
                  </p>
                  {a.escalationNote && <p className="text-xs text-on-surface-variant mt-1 italic">"{a.escalationNote}"</p>}
                </div>
                <div className="flex-shrink-0">
                  {a.acknowledged ? (
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-vital-green/14 text-vital-green">Acknowledged</span>
                  ) : (
                    <Button size="sm" onClick={() => onAcknowledge(a)}>
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
