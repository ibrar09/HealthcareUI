import { Check, CreditCard, X } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { refundStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { RefundView } from "@modules/hospital-admin/api";

interface RefundsPanelProps {
  refunds: RefundView[];
  onApprove: (id: string) => void;
  onReject: (refund: RefundView) => void;
  onProcess: (refund: RefundView) => void;
}

/** Module-local — Billing "Refunds" tab (spec §20): Payment → Refund Request → Approval → Refund Processing → Refund Completed. */
export function RefundsPanel({ refunds, onApprove, onReject, onProcess }: RefundsPanelProps) {
  if (refunds.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No refunds have been requested yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3 pb-8">
      {refunds.map((r) => {
        const meta = refundStatusMeta[r.status];
        return (
          <Card key={r.id}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="font-bold text-on-surface">
                  {r.refundNumber} <span className="text-xs font-normal text-on-surface-variant">{formatSAR(r.amount)}</span>
                </p>
                <p className="text-xs text-on-surface-variant">
                  {r.patientName} · {r.paymentNumber} · {r.invoiceNumber}
                </p>
                <p className="text-xs text-on-surface-variant mt-1 italic">"{r.reason}"</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Requested by {r.requestedBy} on {r.requestedOn}
                  {r.approvedBy ? ` · Approved by ${r.approvedBy} on ${r.approvedOn}` : ""}
                  {r.processedOn ? ` · Processed ${r.processedOn} (${r.paymentReference})` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.status === "requested" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onReject(r)} icon={<X size={13} />}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => onApprove(r.id)} icon={<Check size={13} />}>
                      Approve
                    </Button>
                  </>
                )}
                {r.status === "approved" && (
                  <Button size="sm" onClick={() => onProcess(r)} icon={<CreditCard size={13} />}>
                    Process
                  </Button>
                )}
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
