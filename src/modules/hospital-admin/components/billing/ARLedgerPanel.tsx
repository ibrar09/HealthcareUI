import { UserPlus, Wallet } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { arCategoryLabel } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { ARLedgerRow } from "@modules/hospital-admin/api";

interface ARSummary {
  totalAR: number;
  byCategory: { insurance: number; patient: number; corporate: number; government: number };
  agingBuckets: { label: string; amount: number }[];
}

interface ARLedgerPanelProps {
  summary: ARSummary;
  rows: ARLedgerRow[];
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  agingFilter: string;
  onAgingFilterChange: (bucket: string) => void;
  onAssignCollector: (row: ARLedgerRow) => void;
}

const categoryOptions = ["insurance", "patient", "corporate", "government"];

/** Module-local — Accounts Receivable + Aging (spec §30-31), one shared ledger view since §31's own column list already IS the aging table. */
export function ARLedgerPanel({ summary, rows, categoryFilter, onCategoryFilterChange, agingFilter, onAgingFilterChange, onAssignCollector }: ARLedgerPanelProps) {
  const maxAging = Math.max(1, ...summary.agingBuckets.map((b) => b.amount));

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total AR" value={formatSAR(summary.totalAR)} icon={<Wallet size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Insurance AR" value={formatSAR(summary.byCategory.insurance)} accentColor="var(--signal-indigo)" />
        <KPICard label="Patient AR" value={formatSAR(summary.byCategory.patient)} accentColor="var(--caution-amber)" />
        <KPICard label="Corporate AR" value={formatSAR(summary.byCategory.corporate)} accentColor="var(--module-radiology)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">AR Aging</h2>
        <div className="flex flex-col gap-3">
          {summary.agingBuckets.map((b) => (
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

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          {["all", ...categoryOptions].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryFilterChange(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                categoryFilter === c ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {c === "all" ? "All Categories" : arCategoryLabel[c]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...summary.agingBuckets.map((b) => b.label)].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onAgingFilterChange(b)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                agingFilter === b ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {b === "all" ? "All Aging" : b}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No outstanding receivables match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[820px] flex flex-col gap-2">
            <div className="grid grid-cols-9 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wide text-on-surface-variant font-bold">
              <span className="col-span-2">Patient / Invoice</span>
              <span>Payer</span>
              <span>Category</span>
              <span className="text-right">Original</span>
              <span className="text-right">Paid</span>
              <span className="text-right">Outstanding</span>
              <span>Aging</span>
              <span>Collector</span>
            </div>
            {rows.map((r) => (
              <div key={r.invoiceId} className="grid grid-cols-9 gap-2 items-center rounded-xl border border-line px-3 py-2.5">
                <div className="col-span-2 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{r.patientName}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">
                    {r.invoiceNumber}
                    {r.claimNumber ? ` · ${r.claimNumber}` : ""}
                  </p>
                </div>
                <span className="text-xs text-on-surface-variant truncate">{r.payerName ?? "—"}</span>
                <span className="text-xs text-on-surface-variant">{arCategoryLabel[r.category]}</span>
                <span className="text-right text-xs text-on-surface">{formatSAR(r.originalAmount)}</span>
                <span className="text-right text-xs text-vital-green">{formatSAR(r.paidAmount)}</span>
                <span className="text-right text-xs font-bold text-pulse-coral">{formatSAR(r.outstanding)}</span>
                <span className="text-xs text-on-surface-variant">
                  {r.agingBucket} <span className="text-on-surface-variant/60">({r.daysOutstanding}d)</span>
                </span>
                <button type="button" onClick={() => onAssignCollector(r)} className="flex items-center gap-1 text-xs font-semibold text-signal-indigo hover:underline">
                  <UserPlus size={11} /> {r.assignedCollector ?? "Assign"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
