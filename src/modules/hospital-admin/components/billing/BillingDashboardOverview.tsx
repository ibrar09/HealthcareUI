import { Banknote, Clock, FileWarning, Receipt } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import type { BillingDashboardData } from "@modules/hospital-admin/api";

export function formatSAR(amount: number) {
  return `SAR ${amount.toLocaleString()}`;
}

interface BillingDashboardOverviewProps {
  data: BillingDashboardData;
}

/** Module-local — Billing Dashboard (spec §2). Only KPIs Phase 1 data genuinely supports — no fabricated Claims figures, since Claims don't exist until Phase 3. */
export function BillingDashboardOverview({ data }: BillingDashboardOverviewProps) {
  const maxAging = Math.max(1, ...data.agingBuckets.map((b) => b.amount));

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Today's Revenue" value={formatSAR(data.todaysRevenue)} icon={<Banknote size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Outstanding Receivables" value={formatSAR(data.outstandingReceivables)} icon={<Receipt size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Pending Charge Review" value={data.pendingChargeReview} icon={<FileWarning size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Avg. Days to Payment" value={data.averageDaysToPayment ?? "—"} icon={<Clock size={14} />} accentColor="var(--signal-indigo)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-on-surface">{data.totalInvoices}</p>
        </Card>
        <Card accentColor="var(--vital-green)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Paid</p>
          <p className="text-2xl font-bold text-vital-green">{data.paidInvoices}</p>
        </Card>
        <Card accentColor="var(--caution-amber)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Partially Paid</p>
          <p className="text-2xl font-bold" style={{ color: "var(--caution-amber)" }}>{data.partiallyPaidInvoices}</p>
        </Card>
        <Card accentColor="var(--signal-indigo)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Unpaid</p>
          <p className="text-2xl font-bold text-signal-indigo">{data.unpaidInvoices}</p>
        </Card>
        <Card accentColor="var(--pulse-coral)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Overdue</p>
          <p className="text-2xl font-bold text-pulse-coral">{data.overdueInvoices}</p>
        </Card>
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Outstanding Receivables — Aging</h2>
        <div className="flex flex-col gap-3">
          {data.agingBuckets.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface font-medium">{b.label}</span>
                <span className="text-on-surface-variant">{formatSAR(b.amount)}</span>
              </div>
              <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full bg-pulse-coral" style={{ width: `${(b.amount / maxAging) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
