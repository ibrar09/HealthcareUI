import { Ban, CreditCard, FileMinus, FilePlus, FileStack, Receipt as ReceiptIcon, RotateCcw } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { invoiceStatusMeta, paymentMethodLabel, claimStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { InvoiceView, PaymentView, ClaimView, AdjustmentView, WriteOffView } from "@modules/hospital-admin/api";

interface InvoiceDetailsDrawerProps {
  invoice: InvoiceView | null;
  payments: PaymentView[];
  claim: ClaimView | null;
  adjustments: AdjustmentView[];
  writeOffs: WriteOffView[];
  onClose: () => void;
  onRecordPayment: () => void;
  onCancelInvoice: () => void;
  onViewReceipt: (paymentId: string) => void;
  onCreateClaim: () => void;
  onViewClaim: (claimId: string) => void;
  onRequestRefund: (payment: PaymentView) => void;
  onAddAdjustment: () => void;
  onRequestWriteOff: () => void;
}

/** Module-local — Invoice Details (spec §15-16), plus Create Claim (spec §23), Request Refund (spec §20), and Add Adjustment / Request Write-Off (spec §21/§51) entry points. */
export function InvoiceDetailsDrawer({
  invoice,
  payments,
  claim,
  adjustments,
  writeOffs,
  onClose,
  onRecordPayment,
  onCancelInvoice,
  onViewReceipt,
  onCreateClaim,
  onViewClaim,
  onRequestRefund,
  onAddAdjustment,
  onRequestWriteOff,
}: InvoiceDetailsDrawerProps) {
  const meta = invoice ? invoiceStatusMeta[invoice.status] : null;
  const netAdjustment = adjustments.reduce((sum, a) => sum + (a.type === "credit" ? a.amount : -a.amount), 0);
  const approvedWriteOff = writeOffs.filter((w) => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
  const effectiveBalance = invoice ? Math.max(0, invoice.balance - netAdjustment - approvedWriteOff) : 0;
  const canRecordPayment = invoice && effectiveBalance > 0 && invoice.status !== "cancelled" && invoice.status !== "void";
  const canCancel = invoice && invoice.amountPaid === 0 && invoice.status !== "cancelled" && invoice.status !== "void";
  const canCreateClaim = invoice && invoice.insuranceAmount > 0 && !claim && invoice.status !== "cancelled" && invoice.status !== "void";
  const canAdjust = invoice && invoice.status !== "cancelled" && invoice.status !== "void";
  const canWriteOff = invoice && effectiveBalance > 0 && invoice.status !== "cancelled" && invoice.status !== "void";

  return (
    <Drawer
      open={Boolean(invoice)}
      onClose={onClose}
      title={invoice ? invoice.invoiceNumber : "Invoice"}
      subtitle={invoice ? `${invoice.patientName} · ${invoice.patientMrn}` : undefined}
      footer={
        invoice && (
          <div className="flex items-center justify-end gap-3">
            {canCancel && (
              <Button variant="danger" onClick={onCancelInvoice} icon={<Ban size={14} />}>
                Cancel Invoice
              </Button>
            )}
            {canAdjust && (
              <Button variant="outline" onClick={onAddAdjustment} icon={<FilePlus size={14} />}>
                Add Adjustment
              </Button>
            )}
            {canWriteOff && (
              <Button variant="outline" onClick={onRequestWriteOff} icon={<FileMinus size={14} />}>
                Request Write-Off
              </Button>
            )}
            {canCreateClaim && (
              <Button variant="outline" onClick={onCreateClaim} icon={<FileStack size={14} />}>
                Create Claim
              </Button>
            )}
            {canRecordPayment && (
              <Button onClick={onRecordPayment} icon={<CreditCard size={14} />}>
                Record Payment
              </Button>
            )}
          </div>
        )
      }
    >
      {invoice && meta && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between rounded-2xl border border-line p-4" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}>
            <div>
              <p className="text-xs text-on-surface-variant">Issued {invoice.issuedDate} · Due {invoice.dueDate}</p>
              <p className="text-lg font-bold text-on-surface">{formatSAR(effectiveBalance)} outstanding</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
              {meta.label}
            </span>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Line Items</h3>
            <div className="flex flex-col gap-1.5">
              {invoice.lineItems.map((li) => (
                <div key={li.chargeId} className="flex items-center justify-between text-sm">
                  <span className="text-on-surface">
                    {li.serviceName} <span className="text-on-surface-variant">× {li.quantity}</span>
                  </span>
                  <span className="font-semibold text-on-surface">{formatSAR(li.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 border-t border-line mt-3 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Gross Amount</span>
                <span className="font-semibold text-on-surface">{formatSAR(invoice.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Discount</span>
                <span className="font-semibold text-on-surface">−{formatSAR(invoice.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Insurance</span>
                <span className="font-semibold text-on-surface">−{formatSAR(invoice.insuranceAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5">
                <span className="font-bold text-on-surface">Patient Responsibility</span>
                <span className="font-bold text-signal-indigo">{formatSAR(invoice.patientResponsibility)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Amount Paid</span>
                <span className="font-semibold text-vital-green">{formatSAR(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-on-surface">Balance</span>
                <span className="font-bold text-pulse-coral">{formatSAR(effectiveBalance)}</span>
              </div>
            </div>
          </div>

          {claim && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Insurance Claim</h3>
              <button
                type="button"
                onClick={() => onViewClaim(claim.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left hover:bg-surface-container-low transition-all w-full"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{claim.claimNumber}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {claim.payerName} · {formatSAR(claim.amount)}
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${claimStatusMeta[claim.status].color} 16%, transparent)`, color: claimStatusMeta[claim.status].color }}
                >
                  {claimStatusMeta[claim.status].label}
                </span>
              </button>
            </div>
          )}

          {(adjustments.length > 0 || writeOffs.length > 0) && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Adjustments &amp; Write-Offs</h3>
              <div className="flex flex-col gap-2">
                {adjustments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs rounded-xl border border-line px-3.5 py-2.5">
                    <span className="text-on-surface-variant">
                      {a.adjustmentNumber} · {a.reason}
                    </span>
                    <span className={`font-bold flex-shrink-0 ${a.type === "credit" ? "text-vital-green" : "text-pulse-coral"}`}>
                      {a.type === "credit" ? "−" : "+"}
                      {formatSAR(a.amount)}
                    </span>
                  </div>
                ))}
                {writeOffs.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-xs rounded-xl border border-line px-3.5 py-2.5">
                    <span className="text-on-surface-variant">
                      {w.writeOffNumber} · {w.reason} ({w.status})
                    </span>
                    {w.status === "approved" && <span className="font-bold text-vital-green flex-shrink-0">−{formatSAR(w.amount)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No payments recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
                    <button type="button" onClick={() => onViewReceipt(p.id)} className="flex-1 min-w-0 text-left flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {formatSAR(p.amount)} · {paymentMethodLabel[p.method]}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {p.paymentNumber} · {p.date}
                        </p>
                      </div>
                      <ReceiptIcon size={16} className="flex-shrink-0 text-on-surface-variant" />
                    </button>
                    {p.status === "success" && (
                      <button
                        type="button"
                        onClick={() => onRequestRefund(p)}
                        className="flex-shrink-0 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-signal-indigo"
                        title="Request Refund"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
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
