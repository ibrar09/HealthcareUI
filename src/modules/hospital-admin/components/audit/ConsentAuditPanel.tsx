import { Card } from "@shared/design-system/components";
import { statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { ConsentAuditEvent, ConsentAction } from "@modules/hospital-admin/api";

interface ConsentAuditPanelProps {
  events: ConsentAuditEvent[];
}

const actionMeta: Record<ConsentAction, { label: string; color: string }> = {
  CONSENT_GRANTED: { label: "Granted", color: "var(--vital-green)" },
  CONSENT_REVOKED: { label: "Revoked", color: "var(--pulse-coral)" },
  CONSENT_UPDATED: { label: "Updated", color: "var(--signal-indigo)" },
  CONSENT_EXPIRED: { label: "Expired", color: "var(--outline)" },
  CONSENT_DENIED: { label: "Denied", color: "var(--pulse-coral)" },
};

/** Module-local — Consent Audit (spec §25): patient-controlled data-sharing activity across the larger Universal Healthcare Platform ecosystem. */
export function ConsentAuditPanel({ events }: ConsentAuditPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        {events.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No consent events recorded.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {events.map((e) => {
              const meta = actionMeta[e.action];
              return (
                <div key={e.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-on-surface">{e.patientId} — {e.purpose}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{e.organization} · {e.dataCategories.join(", ")}{e.durationDays ? ` · ${e.durationDays} days` : ""}</p>
                  <p className="text-[11px] text-on-surface-variant/70 mt-0.5">By {e.actor} · {formatDateTime(e.timestamp)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
