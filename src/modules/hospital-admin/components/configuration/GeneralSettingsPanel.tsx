import { useState } from "react";
import { Card, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { GeneralSystemSettings } from "@modules/hospital-admin/api";

interface GeneralSettingsPanelProps {
  settings: GeneralSystemSettings | null;
  onSave: (values: Partial<GeneralSystemSettings>) => void;
}

/** Module-local — General System Settings (spec §3): controls default application behavior. */
export function GeneralSettingsPanel({ settings, onSave }: GeneralSettingsPanelProps) {
  const [values, setValues] = useState<Partial<GeneralSystemSettings>>({});
  if (!settings) return null;
  const current = { ...settings, ...values };

  function set<K extends keyof GeneralSystemSettings>(key: K, value: GeneralSystemSettings[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <FormSection title="Defaults">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <FormField label="Default Language">
              <input className={formInputClass} value={current.defaultLanguage} onChange={(e) => set("defaultLanguage", e.target.value)} />
            </FormField>
            <FormField label="Default Timezone">
              <input className={formInputClass} value={current.defaultTimezone} onChange={(e) => set("defaultTimezone", e.target.value)} />
            </FormField>
            <FormField label="Default Currency">
              <input className={formInputClass} value={current.defaultCurrency} onChange={(e) => set("defaultCurrency", e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <FormField label="Date Format">
              <input className={formInputClass} value={current.dateFormat} onChange={(e) => set("dateFormat", e.target.value)} />
            </FormField>
            <FormField label="Time Format">
              <select className={formInputClass} value={current.timeFormat} onChange={(e) => set("timeFormat", e.target.value as "12-hour" | "24-hour")}>
                <option value="24-hour">24 Hour</option>
                <option value="12-hour">12 Hour</option>
              </select>
            </FormField>
            <FormField label="First Day of Week">
              <select className={formInputClass} value={current.firstDayOfWeek} onChange={(e) => set("firstDayOfWeek", e.target.value as "sunday" | "monday")}>
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Number Format">
              <input className={formInputClass} value={current.numberFormat} onChange={(e) => set("numberFormat", e.target.value)} />
            </FormField>
            <FormField label="Decimal Precision">
              <input type="number" min={0} max={4} className={formInputClass} value={current.decimalPrecision} onChange={(e) => set("decimalPrecision", Number(e.target.value))} />
            </FormField>
            <FormField label="Default Country">
              <input className={formInputClass} value={current.defaultCountry} onChange={(e) => set("defaultCountry", e.target.value)} />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Session & Login">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <FormField label="Session Timeout (min)">
              <input type="number" className={formInputClass} value={current.sessionTimeoutMinutes} onChange={(e) => set("sessionTimeoutMinutes", Number(e.target.value))} />
            </FormField>
            <FormField label="Max Login Attempts">
              <input type="number" className={formInputClass} value={current.maximumLoginAttempts} onChange={(e) => set("maximumLoginAttempts", Number(e.target.value))} />
            </FormField>
            <FormField label="Password Expiration (days)">
              <input type="number" className={formInputClass} value={current.passwordExpirationDays} onChange={(e) => set("passwordExpirationDays", Number(e.target.value))} />
            </FormField>
            <FormField label="Account Lock Duration (min)">
              <input type="number" className={formInputClass} value={current.accountLockDurationMinutes} onChange={(e) => set("accountLockDurationMinutes", Number(e.target.value))} />
            </FormField>
          </div>
          <ConfigToggleRow label="Automatic Logout" description="Sign out inactive sessions after the timeout above" checked={current.automaticLogoutEnabled} onChange={(v) => set("automaticLogoutEnabled", v)} />
        </FormSection>

        <Button size="sm" onClick={() => onSave(values)} disabled={Object.keys(values).length === 0}>Save Changes</Button>
      </Card>
    </div>
  );
}
