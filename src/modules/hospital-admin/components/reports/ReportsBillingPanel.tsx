import { Card, KPICard } from "@shared/design-system/components";
import type { BillingDashboardData, BillingRevenueByDepartment } from "@modules/hospital-admin/api";

interface ReportsBillingPanelProps {
  dashboard: BillingDashboardData | null;
  revenueByDepartment: BillingRevenueByDepartment[];
}

/** Module-local — Billing Reports (spec §32-34): revenue, receivables, aging, and revenue-by-department, reusing Billing & Revenue's own real dashboard data. */
export function ReportsBillingPanel({ dashboard, revenueByDepartment }: ReportsBillingPanelProps) {
  if (!dashboard) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Today's Revenue" value={`$${dashboard.todaysRevenue.toLocaleString()}`} accentColor="var(--vital-green)" />
        <KPICard label="Outstanding Receivables" value={`$${dashboard.outstandingReceivables.toLocaleString()}`} accentColor="var(--caution-amber)" />
        <KPICard label="Total Invoices" value={dashboard.totalInvoices} accentColor="var(--signal-indigo)" />
        <KPICard label="Overdue Invoices" value={dashboard.overdueInvoices} accentColor="var(--pulse-coral)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Paid Invoices" value={dashboard.paidInvoices} accentColor="var(--vital-green)" />
        <KPICard label="Unpaid Invoices" value={dashboard.unpaidInvoices} accentColor="var(--pulse-coral)" />
        <KPICard label="Partially Paid" value={dashboard.partiallyPaidInvoices} accentColor="var(--caution-amber)" />
        <KPICard label="Pending Charge Review" value={dashboard.pendingChargeReview} accentColor="var(--signal-indigo)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Revenue by Department</h2>
          {revenueByDepartment.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4 text-center">No captured charges yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {revenueByDepartment.map((row) => (
                <div key={row.departmentName} className="py-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-on-surface">{row.departmentName}</span>
                  <span className="font-mono font-bold text-on-surface">${row.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Aging Buckets</h2>
          <div className="flex flex-col divide-y divide-line">
            {dashboard.agingBuckets.map((row) => (
              <div key={row.label} className="py-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface">{row.label}</span>
                <span className="font-mono font-bold text-on-surface">${row.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
