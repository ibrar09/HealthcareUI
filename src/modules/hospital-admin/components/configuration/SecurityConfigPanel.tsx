import { useState } from "react";
import { Card, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { SecurityConfiguration } from "@modules/hospital-admin/api";

interface SecurityConfigPanelProps {
  config: SecurityConfiguration | null;
  onSave: (values: Partial<SecurityConfiguration>) => void;
}

/** Module-local — Security Configuration (spec §24): Authentication, Authorization, and Security Policy settings. This is a major, dedicated section per the spec's own instruction. */
export function SecurityConfigPanel({ config, onSave }: SecurityConfigPanelProps) {
  const [values, setValues] = useState<Partial<SecurityConfiguration>>({});
  if (!config) return null;
  const current = { ...config, ...values };

  function set<K extends keyof SecurityConfiguration>(key: K, value: SecurityConfiguration[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <FormSection title="Authentication">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="JWT Expiration (minutes)">
              <input type="number" className={formInputClass} value={current.jwtExpirationMinutes} onChange={(e) => set("jwtExpirationMinutes", Number(e.target.value))} />
            </FormField>
            <FormField label="Refresh Token Expiration (days)">
              <input type="number" className={formInputClass} value={current.refreshTokenExpirationDays} onChange={(e) => set("refreshTokenExpirationDays", Number(e.target.value))} />
            </FormField>
          </div>
          <ConfigToggleRow label="MFA Required" description="Require multi-factor authentication for all users" checked={current.mfaRequired} onChange={(v) => set("mfaRequired", v)} />
        </FormSection>

        <FormSection title="Password Policy">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Minimum Length">
              <input type="number" className={formInputClass} value={current.passwordMinLength} onChange={(e) => set("passwordMinLength", Number(e.target.value))} />
            </FormField>
            <FormField label="Password History Count">
              <input type="number" className={formInputClass} value={current.passwordHistoryCount} onChange={(e) => set("passwordHistoryCount", Number(e.target.value))} />
            </FormField>
          </div>
          <div className="mt-2">
            <ConfigToggleRow label="Require Special Character" checked={current.passwordRequireSpecialChar} onChange={(v) => set("passwordRequireSpecialChar", v)} />
          </div>
        </FormSection>

        <FormSection title="Session & Access Policy">
          <div className="mb-2">
            <FormField label="Concurrent Sessions Allowed">
              <input type="number" className={formInputClass} value={current.concurrentSessionsAllowed} onChange={(e) => set("concurrentSessionsAllowed", Number(e.target.value))} />
            </FormField>
          </div>
          <ConfigToggleRow label="IP Restriction" description="Restrict access to an allow-listed IP range" checked={current.ipRestrictionEnabled} onChange={(v) => set("ipRestrictionEnabled", v)} />
          <ConfigToggleRow label="Suspicious Login Detection" checked={current.suspiciousLoginDetectionEnabled} onChange={(v) => set("suspiciousLoginDetectionEnabled", v)} />
        </FormSection>

        <Button size="sm" onClick={() => onSave(values)} disabled={Object.keys(values).length === 0}>Save Changes</Button>
      </Card>
    </div>
  );
}
