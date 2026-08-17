import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { AuditRetentionPolicy, AuditIntegrityStatus } from "@modules/hospital-admin/api";

interface AuditRetentionPanelProps {
  policies: AuditRetentionPolicy[];
  integritySummary: { status: AuditIntegrityStatus; count: number }[];
}

const integrityMeta: Record<AuditIntegrityStatus, { label: string; icon: typeof ShieldCheck; color: string }> = {
  verified: { label: "Verified", icon: ShieldCheck, color: "var(--vital-green)" },
  pending: { label: "Verification Pending", icon: ShieldQuestion, color: "var(--caution-amber)" },
  error: { label: "Integrity Error", icon: ShieldAlert, color: "var(--pulse-coral)" },
};

/** Module-local — Audit Retention (spec §32) + Audit Integrity (spec §33), combined into one settings tab. Retention is never a single hardcoded universal period — requirements vary by jurisdiction/organization/record type. */
export function AuditRetentionPanel({ policies, integritySummary }: AuditRetentionPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Audit Retention Policy</h2>
        <div className="flex flex-col divide-y divide-line">
          {policies.map((p) => (
            <div key={p.category} className="py-2.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface">{p.category}</span>
              <span className="text-on-surface-variant text-right max-w-xs">{p.policy}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Audit Integrity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {integritySummary.map((row) => {
            const meta = integrityMeta[row.status];
            const Icon = meta.icon;
            return (
              <div key={row.status} className="flex items-center gap-3 rounded-card border border-line p-3.5">
                <Icon size={20} style={{ color: meta.color }} />
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant">{meta.label}</p>
                  <p className="text-xl font-mono font-bold text-on-surface">{row.count.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-on-surface-variant mt-4">A production audit system protects audit records from unauthorized modification or deletion — this view is read-only by design.</p>
      </Card>
    </div>
  );
}
