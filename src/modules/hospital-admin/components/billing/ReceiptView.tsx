import { CheckCircle2 } from "lucide-react";
import { Drawer } from "@shared/design-system/components";
import { paymentMethodLabel } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { PaymentView, InvoiceView } from "@modules/hospital-admin/api";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-dashed border-line last:border-b-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  );
}

interface ReceiptViewProps {
  payment: PaymentView | null;
  invoice: InvoiceView | null;
  onClose: () => void;
}

/** Module-local — Receipt (spec §17-19 "Receipts"): a printable-style view of a successful Payment, not a separately stored entity. */
export function ReceiptView({ payment, invoice, onClose }: ReceiptViewProps) {
  return (
    <Drawer open={Boolean(payment)} onClose={onClose} title="Receipt" subtitle={payment ? payment.paymentNumber : undefined}>
      {payment && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line p-6 bg-vital-green/[0.06]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vital-green/15 text-vital-green">
              <CheckCircle2 size={26} />
            </span>
            <p className="text-2xl font-bold text-on-surface">{formatSAR(payment.amount)}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-vital-green">Payment Successful</p>
          </div>

          <div className="rounded-2xl border border-line p-4">
            <Row label="Payment ID" value={payment.paymentNumber} />
            <Row label="Invoice" value={payment.invoiceNumber} />
            <Row label="Patient" value={payment.patientName} />
            <Row label="Amount" value={formatSAR(payment.amount)} />
            <Row label="Method" value={paymentMethodLabel[payment.method]} />
            <Row label="Status" value={payment.status === "success" ? "Success" : payment.status === "pending" ? "Pending" : "Failed"} />
            {payment.transactionReference && <Row label="Transaction Reference" value={payment.transactionReference} />}
            <Row label="Date" value={payment.date} />
            <Row label="Recorded By" value={payment.recordedBy} />
          </div>

          {invoice && (
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Invoice Balance After This Payment</h3>
              <div className="flex justify-between text-sm rounded-xl border border-line px-4 py-3">
                <span className="text-on-surface-variant">Remaining Balance</span>
                <span className={`font-bold ${invoice.balance > 0 ? "text-pulse-coral" : "text-vital-green"}`}>{formatSAR(invoice.balance)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
