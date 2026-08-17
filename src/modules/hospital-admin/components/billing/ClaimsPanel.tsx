import { FileStack } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { claimStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { ClaimView, ClaimStatus } from "@modules/hospital-admin/api";

const statusOrder: ClaimStatus[] = ["draft", "ready", "submitted", "accepted", "rejected", "denied", "paid"];

interface ClaimsPanelProps {
  byStatus: Record<ClaimStatus, number>;
  totalClaimed: number;
  totalPaid: number;
  claims: ClaimView[];
  statusFilter: ClaimStatus | "all";
  onStatusFilterChange: (status: ClaimStatus | "all") => void;
  onSelect: (claimId: string) => void;
}

/** Module-local — Billing "Claims" tab: Claims Dashboard counts (spec §24) folded into the same tab as Claim List (spec §23). */
export function ClaimsPanel({ byStatus, totalClaimed, totalPaid, claims, statusFilter, onStatusFilterChange, onSelect }: ClaimsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Claimed" value={formatSAR(totalClaimed)} icon={<FileStack size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Total Paid by Payers" value={formatSAR(totalPaid)} icon={<FileStack size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Submitted (Awaiting Response)" value={byStatus.submitted} accentColor="var(--caution-amber)" />
        <KPICard label="Denied" value={byStatus.denied} accentColor="var(--sunset-coral)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {statusOrder.map((s) => (
          <Card key={s} accentColor={claimStatusMeta[s].color}>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">{claimStatusMeta[s].label}</p>
            <p className="text-2xl font-bold" style={{ color: claimStatusMeta[s].color }}>
              {byStatus[s]}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", ...statusOrder] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusFilterChange(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === s ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {s === "all" ? "All" : claimStatusMeta[s].label}
          </button>
        ))}
      </div>

      {claims.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No claims match this filter.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {claims.map((c) => {
            const meta = claimStatusMeta[c.status];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                  <FileStack size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-on-surface truncate">{c.claimNumber}</h3>
                  <p className="text-xs text-on-surface-variant truncate">
                    {c.patientName} · {c.payerName} · {c.invoiceNumber}
                  </p>
                </div>
                <div className="hidden md:block text-right flex-shrink-0 w-28">
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Amount</p>
                  <p className="text-sm font-bold text-on-surface">{formatSAR(c.amount)}</p>
                </div>
                <div className="hidden lg:block text-right flex-shrink-0 w-24">
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Created</p>
                  <p className="text-xs font-semibold text-on-surface">{c.createdOn}</p>
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
      )}
    </div>
  );
}
