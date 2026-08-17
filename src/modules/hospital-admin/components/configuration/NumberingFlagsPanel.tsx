import { Card } from "@shared/design-system/components";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { NumberingFormat, FeatureFlagConfig } from "@modules/hospital-admin/api";

interface NumberingFlagsPanelProps {
  numberingFormats: NumberingFormat[];
  previewFor: (format: NumberingFormat) => string;
  featureFlags: FeatureFlagConfig[];
  onToggleFlag: (id: string, enabled: boolean) => void;
}

/** Module-local — System Numbering (spec §35) + Feature Flags (spec §36), combined: consistent ID formats across every module, and the ability to enable/disable functionality without redeploying. */
export function NumberingFlagsPanel({ numberingFormats, previewFor, featureFlags, onToggleFlag }: NumberingFlagsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">System Numbering</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Entity</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Prefix</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Digits</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {numberingFormats.map((f) => (
                <tr key={f.id}>
                  <td className="py-2 pr-3 font-semibold text-on-surface">{f.entityType}</td>
                  <td className="py-2 pr-3 font-mono text-on-surface-variant">{f.prefix}</td>
                  <td className="py-2 pr-3 text-on-surface-variant">{f.digitCount}</td>
                  <td className="py-2 font-mono font-bold text-on-surface">{previewFor(f)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Feature Flags</h2>
        <div className="flex flex-col divide-y divide-line">
          {featureFlags.map((f) => (
            <ConfigToggleRow key={f.id} label={f.name} description={f.description} checked={f.enabled} onChange={(v) => onToggleFlag(f.id, v)} />
          ))}
        </div>
      </Card>
    </div>
  );
}
