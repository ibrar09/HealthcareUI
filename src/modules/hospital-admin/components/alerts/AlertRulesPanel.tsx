import { Card } from "@shared/design-system/components";
import { severityMeta, channelLabels, statusPillStyle } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { AlertRule } from "@modules/hospital-admin/api";

interface AlertRulesPanelProps {
  rules: AlertRule[];
  onToggle: (id: string, enabled: boolean) => void;
}

/** Module-local — Alert Rules Builder (spec §23): the no-code WHEN/AND/THEN rule shape, rendered as a readable chain rather than a literal drag-and-drop canvas. */
export function AlertRulesPanel({ rules, onToggle }: AlertRulesPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {rules.map((rule) => {
        const severity = severityMeta[rule.priority];
        return (
          <Card key={rule.id} hero accentColor={rule.enabled ? undefined : "var(--outline)"}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-base font-bold text-on-surface">{rule.name}</h2>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(severity.color)}>{severity.label}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-sm mb-4">
              <p><span className="font-mono text-xs font-bold text-signal-indigo">WHEN</span> <span className="text-on-surface">{rule.triggerEvent}</span></p>
              {rule.conditions.map((c, i) => (
                <p key={i}><span className="font-mono text-xs font-bold text-signal-indigo">AND</span> <span className="text-on-surface">{c.field} {c.operator.replace("-", " ")} {c.value}</span></p>
              ))}
              <p><span className="font-mono text-xs font-bold text-vital-green">THEN</span> <span className="text-on-surface">Create Alert, notify {rule.notifyRoles.join(", ")} via {rule.channels.map((c) => channelLabels[c]).join(" + ")}</span></p>
              {rule.escalateAfterMinutes !== undefined && (
                <p><span className="font-mono text-xs font-bold text-pulse-coral">ESCALATE AFTER</span> <span className="text-on-surface">{rule.escalateAfterMinutes} minutes if unacknowledged</span></p>
              )}
            </div>
            <ConfigToggleRow label="Rule Active" checked={rule.enabled} onChange={(v) => onToggle(rule.id, v)} />
          </Card>
        );
      })}
    </div>
  );
}
