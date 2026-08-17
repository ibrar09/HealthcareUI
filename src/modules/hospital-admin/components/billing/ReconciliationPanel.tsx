import { Landmark, Plus } from "lucide-react";
import { Button } from "@shared/design-system/components";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { ReconciliationBatchView } from "@modules/hospital-admin/api";

interface ReconciliationPanelProps {
  batches: ReconciliationBatchView[];
  onCreateBatch: () => void;
  onSelectBatch: (batchId: string) => void;
}

/** Module-local — Billing "Reconciliation" tab (spec §32): Payer Payment → Payment File/Reference → Match Claims → Allocate → Reconcile. */
export function ReconciliationPanel({ batches, onCreateBatch, onSelectBatch }: ReconciliationPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onCreateBatch} icon={<Plus size={14} />}>
          New Payment Batch
        </Button>
      </div>

      {batches.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No payer payment batches yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {batches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBatch(b.id)}
              className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: b.status === "reconciled" ? "var(--vital-green)" : "var(--caution-amber)" }} />
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                <Landmark size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-on-surface truncate">{b.batchNumber}</h3>
                <p className="text-xs text-on-surface-variant truncate">
                  {b.payerName} · {b.reference} · {b.date}
                </p>
              </div>
              <div className="hidden md:block text-right flex-shrink-0 w-28">
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Total</p>
                <p className="text-xs font-semibold text-on-surface">{formatSAR(b.totalAmount)}</p>
              </div>
              <div className="hidden lg:block text-right flex-shrink-0 w-28">
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Remaining</p>
                <p className={`text-sm font-bold ${b.remainingAmount > 0 ? "text-caution-amber" : "text-vital-green"}`}>{formatSAR(b.remainingAmount)}</p>
              </div>
              <div className="flex-shrink-0">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    backgroundColor: b.status === "reconciled" ? "color-mix(in srgb, var(--vital-green) 16%, transparent)" : "color-mix(in srgb, var(--caution-amber) 16%, transparent)",
                    color: b.status === "reconciled" ? "var(--vital-green)" : "var(--caution-amber)",
                  }}
                >
                  {b.status === "reconciled" ? "Reconciled" : "Open"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
