import { useEffect, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { claimStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import * as api from "@modules/hospital-admin/api";
import type { ClaimView, ClaimValidationCheck, ClaimEvent } from "@modules/hospital-admin/api";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-on-surface">{value || "—"}</p>
    </div>
  );
}

interface ClaimDetailsDrawerProps {
  claim: ClaimView | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenResponse: (claim: ClaimView) => void;
  onOpenResubmit: (claim: ClaimView) => void;
  onOpenPayment: (claim: ClaimView) => void;
}

/** Module-local — Claim Details (spec §25) with a live Claim Validation checklist (spec §26) and Claim History timeline. */
export function ClaimDetailsDrawer({ claim, onClose, onRefresh, onOpenResponse, onOpenResubmit, onOpenPayment }: ClaimDetailsDrawerProps) {
  const [checks, setChecks] = useState<ClaimValidationCheck[]>([]);
  const [history, setHistory] = useState<ClaimEvent[]>([]);
  const [markingReady, setMarkingReady] = useState(false);

  useEffect(() => {
    if (!claim) {
      setChecks([]);
      setHistory([]);
      return;
    }
    api.getClaimValidation(claim.id).then(setChecks);
    api.getClaimHistory(claim.id).then(setHistory);
  }, [claim]);

  async function handleMarkReady() {
    if (!claim) return;
    setMarkingReady(true);
    try {
      await api.markClaimReady(claim.id);
      onRefresh();
    } finally {
      setMarkingReady(false);
    }
  }

  async function handleSubmitClaim() {
    if (!claim) return;
    await api.submitClaim(claim.id);
    onRefresh();
  }

  const meta = claim ? claimStatusMeta[claim.status] : null;
  const allChecksPass = checks.every((c) => c.pass);

  return (
    <Drawer
      open={Boolean(claim)}
      onClose={onClose}
      title={claim ? claim.claimNumber : "Claim"}
      subtitle={claim ? `${claim.patientName} · ${claim.payerName}` : undefined}
      footer={
        claim && (
          <div className="flex items-center justify-end gap-3">
            {claim.status === "draft" && (
              <Button onClick={handleMarkReady} disabled={!allChecksPass || markingReady}>
                Mark Ready
              </Button>
            )}
            {claim.status === "ready" && <Button onClick={handleSubmitClaim}>Submit Claim</Button>}
            {claim.status === "submitted" && <Button onClick={() => onOpenResponse(claim)}>Record Payer Response</Button>}
            {claim.status === "rejected" && <Button onClick={() => onOpenResubmit(claim)}>Resubmit</Button>}
            {claim.status === "accepted" && <Button onClick={() => onOpenPayment(claim)}>Record Payment</Button>}
          </div>
        )
      }
    >
      {claim && meta && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between rounded-2xl border border-line p-4" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}>
            <div>
              <p className="text-xs text-on-surface-variant">Created {claim.createdOn}</p>
              <p className="text-lg font-bold text-on-surface">{formatSAR(claim.amount)} claimed</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
              {meta.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Invoice" value={claim.invoiceNumber} />
            <Field label="Payer" value={claim.payerName} />
            <Field label="Submitted" value={claim.submittedOn} />
            <Field label="Responded" value={claim.respondedOn} />
            {claim.rejectionReason && <Field label="Rejection Reason" value={claim.rejectionReason} />}
            {claim.paidAmount !== undefined && <Field label="Paid Amount" value={formatSAR(claim.paidAmount)} />}
          </div>

          {(claim.status === "draft" || claim.status === "ready") && checks.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Claim Validation</h3>
              <div className="flex flex-col gap-1.5">
                {checks.map((c) => (
                  <div key={c.label} className={`flex items-start gap-1.5 text-xs ${c.pass ? "text-vital-green" : "text-pulse-coral"}`}>
                    {c.pass ? <Check size={13} className="flex-shrink-0 mt-0.5" /> : <X size={13} className="flex-shrink-0 mt-0.5" />}
                    <div>
                      <span className="font-semibold">{c.label}</span>
                      {c.detail && <p className="text-on-surface-variant">{c.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <Clock size={12} /> History
              </h3>
              <div className="flex flex-col gap-2">
                {history.map((e) => (
                  <div key={e.id} className="rounded-xl border border-line px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-on-surface">{e.action}</p>
                      <p className="text-[10px] text-on-surface-variant flex-shrink-0">{e.timestamp}</p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {e.actor}
                      {e.detail ? ` · ${e.detail}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
