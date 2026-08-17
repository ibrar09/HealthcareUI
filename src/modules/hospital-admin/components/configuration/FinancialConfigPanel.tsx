import { useState } from "react";
import { Card, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { BillingConfiguration, InsurancePolicyTypeConfig } from "@modules/hospital-admin/api";

interface FinancialConfigPanelProps {
  billing: BillingConfiguration | null;
  paymentMethods: string[];
  policyTypes: InsurancePolicyTypeConfig[];
  onSaveBilling: (values: Partial<BillingConfiguration>) => void;
}

/** Module-local — Billing (spec §17) + Insurance (spec §18) Configuration, combined. Service Pricing itself stays owned by Billing's own Contracts tab. */
export function FinancialConfigPanel({ billing, paymentMethods, policyTypes, onSaveBilling }: FinancialConfigPanelProps) {
  const [values, setValues] = useState<Partial<BillingConfiguration>>({});
  if (!billing) return null;
  const current = { ...billing, ...values };

  function set<K extends keyof BillingConfiguration>(key: K, value: BillingConfiguration[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <FormSection title="Billing Rules">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Invoice Number Format">
              <input className={formInputClass} value={current.invoiceNumberFormat} onChange={(e) => set("invoiceNumberFormat", e.target.value)} />
            </FormField>
            <FormField label="Tax / VAT Rate (%)">
              <input type="number" step={0.1} className={formInputClass} value={current.taxRatePercent} onChange={(e) => set("taxRatePercent", Number(e.target.value))} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Default Payment Terms (days)">
              <input type="number" className={formInputClass} value={current.defaultPaymentTermsDays} onChange={(e) => set("defaultPaymentTermsDays", Number(e.target.value))} />
            </FormField>
            <FormField label="Default Credit Limit">
              <input type="number" className={formInputClass} value={current.defaultCreditLimit} onChange={(e) => set("defaultCreditLimit", Number(e.target.value))} />
            </FormField>
            <FormField label="Refund Approval Threshold">
              <input type="number" className={formInputClass} value={current.refundApprovalThreshold} onChange={(e) => set("refundApprovalThreshold", Number(e.target.value))} />
            </FormField>
          </div>
        </FormSection>
        <Button size="sm" onClick={() => onSaveBilling(values)} disabled={Object.keys(values).length === 0}>Save Changes</Button>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Payment Methods</h2>
        <div className="flex flex-wrap gap-2">
          {paymentMethods.map((m) => (
            <span key={m} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">{m}</span>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Insurance Policy Types</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Policy Type</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Pre-Authorization</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Default Copay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {policyTypes.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-3 font-semibold text-on-surface">{p.name}</td>
                  <td className="py-2 pr-3 text-on-surface-variant">{p.requiresPreAuthorization ? "Required" : "Not Required"}</td>
                  <td className="py-2 text-on-surface-variant">{p.defaultCopayPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
