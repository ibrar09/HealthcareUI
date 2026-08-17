import { Building, Pencil, Plus, Power } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { payerTypeLabel } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import type { Payer, InsurancePlanView } from "@modules/hospital-admin/api";

interface PayersPanelProps {
  payers: Payer[];
  plansByPayer: Record<string, InsurancePlanView[]>;
  onAddPayer: () => void;
  onEditPayer: (payer: Payer) => void;
  onToggleActive: (payer: Payer) => void;
  onAddPlan: (payerId: string, payerName: string) => void;
}

/** Module-local — Billing "Payers" tab (spec §10): payer registry with nested Insurance Plans. */
export function PayersPanel({ payers, plansByPayer, onAddPayer, onEditPayer, onToggleActive, onAddPlan }: PayersPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAddPayer} icon={<Plus size={14} />}>
          Add Payer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {payers.map((p) => {
          const plans = plansByPayer[p.id] ?? [];
          return (
            <Card key={p.id} className={p.status === "inactive" ? "opacity-50" : ""}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-signal-indigo-tint text-signal-indigo">
                    <Building size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {p.name} {p.status === "inactive" && <span className="text-xs font-normal text-on-surface-variant">(Inactive)</span>}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">{payerTypeLabel[p.type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => onEditPayer(p)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface" title="Edit">
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(p)}
                    className={`p-1.5 rounded-lg ${p.status === "active" ? "text-on-surface-variant hover:bg-surface-container-low hover:text-pulse-coral" : "text-vital-green hover:bg-vital-green/10"}`}
                    title={p.status === "active" ? "Deactivate" : "Activate"}
                  >
                    <Power size={13} />
                  </button>
                </div>
              </div>

              {(p.contactPhone || p.contactEmail) && (
                <p className="text-xs text-on-surface-variant mb-3">
                  {p.contactPhone}
                  {p.contactPhone && p.contactEmail ? " · " : ""}
                  {p.contactEmail}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between rounded-lg border border-line px-2.5 py-1.5">
                    <span className="text-xs font-semibold text-on-surface">{plan.name}</span>
                    <span className="text-[10px] text-on-surface-variant">{plan.planType}</span>
                  </div>
                ))}
                {plans.length === 0 && <p className="text-xs text-on-surface-variant py-1">No plans configured.</p>}
              </div>

              <button
                type="button"
                onClick={() => onAddPlan(p.id, p.name)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-xs font-semibold text-on-surface-variant hover:border-signal-indigo hover:text-signal-indigo transition-all"
              >
                <Plus size={12} /> Add Plan
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
