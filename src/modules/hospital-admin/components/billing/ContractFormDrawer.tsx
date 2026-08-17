import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewContractInput, ContractRate, Payer, BillableService } from "@modules/hospital-admin/api";

interface ContractFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewContractInput) => void;
  payers: Payer[];
  services: BillableService[];
}

/** Module-local — Contract Management (spec §45-46): payer, effective window, payment terms, negotiated per-service rates. */
export function ContractFormDrawer({ open, onClose, onSubmit, payers, services }: ContractFormDrawerProps) {
  const [payerId, setPayerId] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("2026-01-01");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [rates, setRates] = useState<ContractRate[]>([]);

  useEffect(() => {
    if (open) {
      setPayerId(payers[0]?.id ?? "");
      setContractNumber("");
      setEffectiveDate("2026-01-01");
      setExpiryDate("2026-12-31");
      setPaymentTermsDays(30);
      setRates([]);
    }
  }, [open, payers]);

  function addRate() {
    const firstUnused = services.find((s) => !rates.some((r) => r.serviceCode === s.code));
    if (!firstUnused) return;
    setRates((r) => [...r, { serviceCode: firstUnused.code, price: firstUnused.standardPrice }]);
  }

  function updateRate(index: number, updates: Partial<ContractRate>) {
    setRates((r) => r.map((rate, i) => (i === index ? { ...rate, ...updates } : rate)));
  }

  function removeRate(index: number) {
    setRates((r) => r.filter((_, i) => i !== index));
  }

  const canSubmit = payerId && contractNumber.trim() && rates.length > 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Contract"
      subtitle="Negotiated per-service rates for a payer."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit({ payerId, contractNumber: contractNumber.trim(), effectiveDate, expiryDate, paymentTermsDays, rates });
              onClose();
            }}
            disabled={!canSubmit}
          >
            Add Contract
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Payer">
            <select className={formInputClass} value={payerId} onChange={(e) => setPayerId(e.target.value)}>
              {payers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Contract Number">
            <input className={formInputClass} value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} placeholder="e.g. CON-2026-004" />
          </FormField>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <FormField label="Effective Date">
            <input type="date" className={formInputClass} value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </FormField>
          <FormField label="Expiry Date">
            <input type="date" className={formInputClass} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </FormField>
          <FormField label="Payment Terms (days)">
            <input type="number" min={1} className={formInputClass} value={paymentTermsDays} onChange={(e) => setPaymentTermsDays(Math.max(1, Number(e.target.value) || 1))} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Rates">
        <div className="flex flex-col gap-2 mb-3">
          {rates.map((rate, i) => (
            <div key={i} className="flex items-center gap-2">
              <select className={formInputClass} value={rate.serviceCode} onChange={(e) => updateRate(i, { serviceCode: e.target.value })}>
                {services.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                className={`${formInputClass} w-28 flex-shrink-0`}
                value={rate.price}
                onChange={(e) => updateRate(i, { price: Math.max(0, Number(e.target.value) || 0) })}
              />
              <button type="button" onClick={() => removeRate(i)} className="flex-shrink-0 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-pulse-coral">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRate}
          disabled={rates.length >= services.length}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-xs font-semibold text-on-surface-variant hover:border-signal-indigo hover:text-signal-indigo transition-all disabled:opacity-40"
        >
          <Plus size={12} /> Add Rate
        </button>
      </FormSection>
    </Drawer>
  );
}
