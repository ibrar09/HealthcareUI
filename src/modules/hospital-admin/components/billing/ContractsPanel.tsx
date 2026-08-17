import { FileSignature, Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { PayerContractView, ServicePricingRow } from "@modules/hospital-admin/api";

const statusColor: Record<PayerContractView["status"], string> = {
  active: "var(--vital-green)",
  expired: "var(--outline)",
  pending: "var(--caution-amber)",
};

interface ContractsPanelProps {
  contracts: PayerContractView[];
  pricing: ServicePricingRow[];
  onAddContract: () => void;
}

/** Module-local — Billing "Contracts" tab: Contract Management (spec §45-46) + Service Pricing cross-reference (spec §8-9). */
export function ContractsPanel({ contracts, pricing, onAddContract }: ContractsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Payer Contracts</h2>
        <Button size="sm" onClick={onAddContract} icon={<Plus size={14} />}>
          Add Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {contracts.map((c) => {
          const color = statusColor[c.status];
          return (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-signal-indigo-tint text-signal-indigo">
                    <FileSignature size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{c.contractNumber}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{c.payerName}</p>
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
                  {c.status === "active" ? "Active" : c.status === "expired" ? "Expired" : "Pending"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">
                {c.effectiveDate} → {c.expiryDate} · Payment Terms {c.paymentTermsDays} Days
              </p>
              <div className="flex flex-col gap-1.5">
                {c.rates.map((r) => (
                  <div key={r.serviceCode} className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">{r.serviceCode}</span>
                    <span className="font-semibold text-on-surface">{formatSAR(r.price)}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Service Pricing — Cross-Payer Reference</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[560px] flex flex-col gap-2">
            <div className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wide text-on-surface-variant font-bold">
              <span>Service</span>
              <span className="text-right">Standard Price</span>
              <span className="col-span-2">Contracted Rates</span>
            </div>
            {pricing.map((row) => (
              <div key={row.serviceCode} className="grid grid-cols-4 gap-2 items-center rounded-xl border border-line px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{row.serviceName}</p>
                  <p className="text-[10px] text-on-surface-variant">{row.department}</p>
                </div>
                <span className="text-right text-sm text-on-surface">{formatSAR(row.standardPrice)}</span>
                <div className="col-span-2 flex flex-wrap gap-1.5">
                  {row.contractRates.length === 0 ? (
                    <span className="text-xs text-on-surface-variant">No contracted rate</span>
                  ) : (
                    row.contractRates.map((r) => (
                      <span key={r.contractNumber} className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                        {r.payerName}: {formatSAR(r.price)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
