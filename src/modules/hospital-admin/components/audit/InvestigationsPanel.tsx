import { Card } from "@shared/design-system/components";
import { statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { Investigation, InvestigationStatus } from "@modules/hospital-admin/api";

interface InvestigationsPanelProps {
  investigations: Investigation[];
  onSelect: (id: string) => void;
}

const statusMeta: Record<InvestigationStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "var(--pulse-coral)" },
  "under-review": { label: "Under Review", color: "var(--caution-amber)" },
  resolved: { label: "Resolved", color: "var(--vital-green)" },
  closed: { label: "Closed", color: "var(--outline)" },
};

/** Module-local — Investigation view (spec §37): for security/compliance staff working a case across multiple events, users, and patients. */
export function InvestigationsPanel({ investigations, onSelect }: InvestigationsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        {investigations.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No open investigations.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {investigations.map((inv) => {
              const status = statusMeta[inv.status];
              return (
                <div key={inv.id} className="py-3 cursor-pointer hover:bg-surface-container-low -mx-2 px-2 rounded-lg" onClick={() => onSelect(inv.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-on-surface">{inv.caseNumber} — {inv.subject}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{inv.userIds.length} user(s) · {inv.patientIds.length} patient(s) · assigned to {inv.assignedTo} · opened {formatDateTime(inv.openedAt)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
