import { useState } from "react";
import { Card, Button } from "@shared/design-system/components";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { MaintenanceState, EnvironmentInfo } from "@modules/hospital-admin/api";

interface MaintenanceEnvironmentPanelProps {
  maintenance: MaintenanceState | null;
  environments: EnvironmentInfo[];
  onSetMaintenanceMode: (active: boolean, announcement?: string) => void;
  onSetReadOnlyMode: (active: boolean) => void;
}

/** Module-local — System Maintenance (spec §38) + Environment info (spec §37, safe metadata only — never real secrets, per the spec's own explicit instruction). */
export function MaintenanceEnvironmentPanel({ maintenance, environments, onSetMaintenanceMode, onSetReadOnlyMode }: MaintenanceEnvironmentPanelProps) {
  const [announcement, setAnnouncement] = useState("");
  if (!maintenance) return null;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero accentColor={maintenance.maintenanceModeActive ? "var(--pulse-coral)" : undefined}>
        <h2 className="text-lg font-bold text-on-surface mb-4">Maintenance Mode</h2>
        <ConfigToggleRow label="Maintenance Mode Active" description="Blocks non-admin access hospital-wide" checked={maintenance.maintenanceModeActive} onChange={(v) => onSetMaintenanceMode(v, announcement || undefined)} />
        <ConfigToggleRow label="Read-Only Mode" description="Allow viewing but block writes" checked={maintenance.readOnlyModeActive} onChange={onSetReadOnlyMode} />
        <div className="mt-3">
          <textarea className={formInputClass} rows={2} placeholder="System announcement (optional)" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Scheduled Maintenance Windows</h2>
        <div className="flex flex-col divide-y divide-line">
          {maintenance.scheduledWindows.map((w) => (
            <div key={w.id} className="py-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface">{w.dayOfWeek}, {w.startTime} – {w.endTime}</span>
              <span className="text-xs text-on-surface-variant">{w.description}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-1">Environments</h2>
        <p className="text-xs text-on-surface-variant mb-4">Safe metadata only — secrets are never exposed here, always managed through the environment's own secrets manager.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Environment</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Version</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Secrets Managed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {environments.map((e) => (
                <tr key={e.environment}>
                  <td className="py-2 pr-3 font-semibold text-on-surface capitalize">{e.environment}</td>
                  <td className="py-2 pr-3 font-mono text-on-surface-variant">{e.appVersion}</td>
                  <td className="py-2 text-on-surface-variant">{e.secretsManagedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
