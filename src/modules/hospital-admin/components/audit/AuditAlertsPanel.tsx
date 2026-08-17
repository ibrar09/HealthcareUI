import { AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { SecurityAuditAlert } from "@modules/hospital-admin/api";

interface AuditAlertsPanelProps {
  alerts: SecurityAuditAlert[];
  onInvestigate: (alert: SecurityAuditAlert) => void;
}

const severityColor: Record<SecurityAuditAlert["severity"], string> = {
  info: "var(--signal-indigo)",
  low: "var(--signal-indigo-light)",
  medium: "var(--caution-amber)",
  high: "var(--pulse-coral)",
  critical: "var(--pulse-coral)",
};

/** Module-local — Audit Alerts (spec §35-36): computed live from real event patterns (elevated access volume, critical events, large exports) — never a stored decorative list. Admin actions available per permission: Investigate, never casually edit/delete audit records. */
export function AuditAlertsPanel({ alerts, onInvestigate }: AuditAlertsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {alerts.length === 0 ? (
        <Card hero><p className="text-center text-sm text-on-surface-variant py-12">No active alerts — nothing unusual detected right now.</p></Card>
      ) : (
        alerts.map((a) => {
          const Icon = a.severity === "critical" || a.severity === "high" ? AlertOctagon : a.severity === "medium" ? AlertTriangle : Info;
          return (
            <Card hero key={a.id} accentColor={severityColor[a.severity]}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Icon size={18} style={{ color: severityColor[a.severity] }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">{a.title}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{a.description}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-1">{formatDateTime(a.createdAt)}</p>
                  </div>
                </div>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0" style={statusPillStyle(severityColor[a.severity])}>{a.status.replace(/-/g, " ")}</span>
              </div>
              {a.status !== "under-investigation" && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => onInvestigate(a)}>Investigate</Button>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
