import { Receipt } from "lucide-react";
import { chargeStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { ChargeView } from "@modules/hospital-admin/api";

interface ChargeListProps {
  charges: ChargeView[];
}

/** Module-local — Billing "Charges" tab (spec §5-6): every captured charge, across statuses. */
export function ChargeList({ charges }: ChargeListProps) {
  if (charges.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No charges match your filters.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {charges.map((c) => {
        const meta = chargeStatusMeta[c.status];
        return (
          <div key={c.id} className="relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden shadow-card">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
              <Receipt size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-on-surface truncate">{c.serviceName}</h3>
              <p className="text-xs text-on-surface-variant truncate">
                {c.patientName} · {c.patientMrn} · {c.department}
              </p>
            </div>
            <div className="hidden md:block text-right flex-shrink-0 w-24">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Qty × Price</p>
              <p className="text-xs font-semibold text-on-surface">
                {c.quantity} × {formatSAR(c.unitPrice)}
              </p>
            </div>
            <div className="hidden lg:block text-right flex-shrink-0 w-28">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Amount</p>
              <p className="text-sm font-bold text-on-surface">{formatSAR(c.amount)}</p>
            </div>
            <div className="hidden xl:block text-right flex-shrink-0 w-24">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Captured</p>
              <p className="text-xs font-semibold text-on-surface">{c.capturedOn}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}>
                {meta.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
