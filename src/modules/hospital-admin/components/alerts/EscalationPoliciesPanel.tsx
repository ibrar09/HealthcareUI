import { Card } from "@shared/design-system/components";
import { categoryLabels, severityMeta, statusPillStyle } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { EscalationPolicy } from "@modules/hospital-admin/api";

interface EscalationPoliciesPanelProps {
  policies: EscalationPolicy[];
}

/** Module-local — Escalation Management (spec §24): each policy's level chain, per-category/severity. */
export function EscalationPoliciesPanel({ policies }: EscalationPoliciesPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {policies.map((p) => (
        <Card key={p.id} hero>
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-base font-bold text-on-surface">{p.name}</h2>
            <span className="text-xs text-on-surface-variant">{p.appliesToCategory === "all" ? "All Categories" : categoryLabels[p.appliesToCategory]}</span>
          </div>
          <div className="flex gap-1.5 mb-4">
            {p.appliesToSeverity.map((s) => (
              <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(severityMeta[s].color)}>{severityMeta[s].label}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {p.levels.map((level, i) => (
              <div key={level.level} className="flex items-center gap-2">
                <div className="rounded-card border border-line px-3 py-2 text-sm">
                  <p className="font-semibold text-on-surface">Level {level.level} — {level.role}</p>
                  <p className="text-xs text-on-surface-variant">{level.afterMinutes === 0 ? "Immediately" : `After ${level.afterMinutes} min`}</p>
                </div>
                {i < p.levels.length - 1 && <span className="text-on-surface-variant">→</span>}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
