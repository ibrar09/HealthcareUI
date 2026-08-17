import { Card } from "@shared/design-system/components";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { AuditConfiguration } from "@modules/hospital-admin/api";

interface AuditConfigPanelProps {
  config: AuditConfiguration | null;
  onUpdate: (updates: Partial<AuditConfiguration>) => void;
}

/** Module-local — Audit Configuration (spec §25): what gets audited and how — settings for the Audit module, never the audit log itself (Security & Audit owns that). */
export function AuditConfigPanel({ config, onUpdate }: AuditConfigPanelProps) {
  if (!config) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <ConfigToggleRow label="Auditing Enabled" checked={config.auditEnabled} onChange={(v) => onUpdate({ auditEnabled: v })} />
        <ConfigToggleRow label="Immutable Logs" description="Normal admins may never silently delete audit history" checked={config.immutableLogs} onChange={(v) => onUpdate({ immutableLogs: v })} />
        <div className="py-2.5">
          <p className="text-sm font-semibold text-on-surface mb-1.5">Log Level</p>
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={config.logLevel} onChange={(e) => onUpdate({ logLevel: e.target.value as AuditConfiguration["logLevel"] })}>
            <option value="minimal">Minimal</option>
            <option value="standard">Standard</option>
            <option value="verbose">Verbose</option>
          </select>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Tracked Audit Events</h2>
        <div className="flex flex-wrap gap-2">
          {config.trackedEvents.map((e) => (
            <span key={e} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-mono font-bold text-on-surface-variant">{e}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}
