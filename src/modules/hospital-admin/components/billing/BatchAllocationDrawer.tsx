import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import * as api from "@modules/hospital-admin/api";
import type { ReconciliationBatchView, ClaimView, ReconciliationAllocationView } from "@modules/hospital-admin/api";

interface BatchAllocationDrawerProps {
  batch: ReconciliationBatchView | null;
  onClose: () => void;
  onRefresh: () => void;
}

/** Module-local — Match Claims → Allocate Amounts → Reconcile (spec §32), for one payment batch. */
export function BatchAllocationDrawer({ batch, onClose, onRefresh }: BatchAllocationDrawerProps) {
  const [eligibleClaims, setEligibleClaims] = useState<ClaimView[]>([]);
  const [allocations, setAllocations] = useState<ReconciliationAllocationView[]>([]);
  const [claimId, setClaimId] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!batch) {
      setEligibleClaims([]);
      setAllocations([]);
      return;
    }
    api.getEligibleClaimsForBatch(batch.id).then((rows) => {
      setEligibleClaims(rows);
      setClaimId(rows[0]?.id ?? "");
      setAmount(rows[0] ? Math.min(rows[0].amount, batch.remainingAmount) : 0);
    });
    api.getBatchAllocations(batch.id).then(setAllocations);
  }, [batch]);

  async function handleAllocate() {
    if (!batch || !claimId || amount <= 0) return;
    await api.allocateToBatch({ batchId: batch.id, claimId, amount });
    onRefresh();
    api.getEligibleClaimsForBatch(batch.id).then(setEligibleClaims);
    api.getBatchAllocations(batch.id).then(setAllocations);
  }

  async function handleClose() {
    if (!batch) return;
    await api.closeBatch(batch.id);
    onRefresh();
  }

  const selectedClaim = eligibleClaims.find((c) => c.id === claimId);

  return (
    <Drawer
      open={Boolean(batch)}
      onClose={onClose}
      title={batch ? batch.batchNumber : "Batch"}
      subtitle={batch ? `${batch.payerName} · ${batch.reference}` : undefined}
      footer={
        batch &&
        batch.status === "open" && (
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Close Batch
            </Button>
          </div>
        )
      }
    >
      {batch && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line p-4 bg-signal-indigo-tint/40 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Total</p>
              <p className="text-sm font-bold text-on-surface">{formatSAR(batch.totalAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Allocated</p>
              <p className="text-sm font-bold text-vital-green">{formatSAR(batch.allocatedAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Remaining</p>
              <p className="text-sm font-bold text-caution-amber">{formatSAR(batch.remainingAmount)}</p>
            </div>
          </div>

          {batch.status === "open" && batch.remainingAmount > 0 && (
            <FormSection title="Allocate to a Claim">
              {eligibleClaims.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No accepted, unpaid claims from this payer to allocate against.</p>
              ) : (
                <>
                  <div className="mb-4">
                    <FormField label="Claim">
                      <select
                        className={formInputClass}
                        value={claimId}
                        onChange={(e) => {
                          setClaimId(e.target.value);
                          const c = eligibleClaims.find((cl) => cl.id === e.target.value);
                          if (c) setAmount(Math.min(c.amount, batch.remainingAmount));
                        }}
                      >
                        {eligibleClaims.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.claimNumber} — {c.patientName} ({formatSAR(c.amount)})
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <FormField label={`Amount (max ${formatSAR(Math.min(selectedClaim?.amount ?? 0, batch.remainingAmount))})`}>
                    <input
                      type="number"
                      min={0}
                      className={formInputClass}
                      value={amount}
                      onChange={(e) => setAmount(Math.max(0, Math.min(selectedClaim?.amount ?? 0, batch.remainingAmount, Number(e.target.value) || 0)))}
                    />
                  </FormField>
                  <Button className="mt-4" onClick={handleAllocate} disabled={!claimId || amount <= 0} fullWidth>
                    Allocate
                  </Button>
                </>
              )}
            </FormSection>
          )}

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Allocations</h3>
            {allocations.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No allocations yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {allocations.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{a.claimNumber}</p>
                      <p className="text-xs text-on-surface-variant truncate">{a.patientName}</p>
                    </div>
                    <span className="text-sm font-bold text-vital-green flex-shrink-0">{formatSAR(a.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
