import { Card } from "@shared/design-system/components";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import { formatDateTime } from "@modules/hospital-admin/components/configuration/configHelpers";
import type { DataRetentionPolicy, BackupConfiguration } from "@modules/hospital-admin/api";

interface RetentionBackupPanelProps {
  policies: DataRetentionPolicy[];
  backup: BackupConfiguration | null;
  onUpdateBackup: (updates: Partial<BackupConfiguration>) => void;
}

/** Module-local — Data Retention (spec §26) + Backup (spec §27), combined. Retention is deliberately never a single hardcoded universal period — it varies by jurisdiction, organization, and record type. */
export function RetentionBackupPanel({ policies, backup, onUpdateBackup }: RetentionBackupPanelProps) {
  if (!backup) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Data Retention Policy</h2>
        <div className="flex flex-col divide-y divide-line">
          {policies.map((p) => (
            <div key={p.category} className="py-2.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface">{p.category}</span>
              <span className="text-on-surface-variant text-right max-w-xs">{p.retentionPeriod}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Backup Configuration</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-3">
          <div><p className="text-xs text-on-surface-variant">Frequency</p><p className="font-semibold text-on-surface capitalize">{backup.frequency}</p></div>
          <div><p className="text-xs text-on-surface-variant">Full Backup Day</p><p className="font-semibold text-on-surface">{backup.fullBackupDay}</p></div>
          <div><p className="text-xs text-on-surface-variant">Retention</p><p className="font-semibold text-on-surface">{backup.retentionDays} days</p></div>
          <div><p className="text-xs text-on-surface-variant">Primary Location</p><p className="font-semibold text-on-surface">{backup.primaryLocation}</p></div>
          <div><p className="text-xs text-on-surface-variant">Secondary Location</p><p className="font-semibold text-on-surface">{backup.secondaryLocation}</p></div>
          <div><p className="text-xs text-on-surface-variant">Last Verified</p><p className="font-semibold text-on-surface">{formatDateTime(backup.lastVerifiedAt)}</p></div>
        </div>
        <ConfigToggleRow label="Encryption Enabled" checked={backup.encryptionEnabled} onChange={(v) => onUpdateBackup({ encryptionEnabled: v })} />
      </Card>
    </div>
  );
}
