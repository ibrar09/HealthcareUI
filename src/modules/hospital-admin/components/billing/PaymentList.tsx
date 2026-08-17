import { CreditCard } from "lucide-react";
import { paymentMethodLabel } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { PaymentView } from "@modules/hospital-admin/api";

const statusColor: Record<PaymentView["status"], string> = {
  success: "var(--vital-green)",
  pending: "var(--caution-amber)",
  failed: "var(--pulse-coral)",
};

interface PaymentListProps {
  payments: PaymentView[];
  onSelect: (paymentId: string) => void;
}

/** Module-local — Billing "Payments" tab (spec §17-19). */
export function PaymentList({ payments, onSelect }: PaymentListProps) {
  if (payments.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No payments recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((p) => {
        const color = statusColor[p.status];
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
              <CreditCard size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-on-surface truncate">{p.paymentNumber}</h3>
              <p className="text-xs text-on-surface-variant truncate">
                {p.patientName} · {p.invoiceNumber} · {p.date}
              </p>
            </div>
            <div className="hidden md:block text-right flex-shrink-0 w-28">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Method</p>
              <p className="text-xs font-semibold text-on-surface">{paymentMethodLabel[p.method]}</p>
            </div>
            <div className="hidden lg:block text-right flex-shrink-0 w-28">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Amount</p>
              <p className="text-sm font-bold text-on-surface">{formatSAR(p.amount)}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                {p.status === "success" ? "Success" : p.status === "pending" ? "Pending" : "Failed"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
