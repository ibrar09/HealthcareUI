import { FileText } from "lucide-react";
import { invoiceStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { InvoiceView } from "@modules/hospital-admin/api";

interface InvoiceListProps {
  invoices: InvoiceView[];
  onSelect: (invoiceId: string) => void;
}

/** Module-local — Billing "Invoices" tab (spec §15-16). */
export function InvoiceList({ invoices, onSelect }: InvoiceListProps) {
  if (invoices.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No invoices match your filters.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {invoices.map((inv) => {
        const meta = invoiceStatusMeta[inv.status];
        return (
          <button
            key={inv.id}
            type="button"
            onClick={() => onSelect(inv.id)}
            className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
              <FileText size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-on-surface truncate">{inv.invoiceNumber}</h3>
              <p className="text-xs text-on-surface-variant truncate">
                {inv.patientName} · {inv.patientMrn} · Issued {inv.issuedDate}
              </p>
            </div>
            <div className="hidden md:block text-right flex-shrink-0 w-28">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Total Due</p>
              <p className="text-xs font-semibold text-on-surface">{formatSAR(inv.patientResponsibility)}</p>
            </div>
            <div className="hidden lg:block text-right flex-shrink-0 w-28">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Balance</p>
              <p className={`text-sm font-bold ${inv.balance > 0 ? "text-pulse-coral" : "text-vital-green"}`}>{formatSAR(inv.balance)}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}>
                {meta.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
