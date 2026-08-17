import { useState } from "react";
import { Card, Button } from "@shared/design-system/components";
import { batchStatusMeta } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { BatchRow, BatchStatus } from "@modules/hospital-admin/api";

type ExpiryBucket = "all" | 30 | 60 | 90;

interface BatchesPanelProps {
  batches: BatchRow[];
  onQuarantine: (batch: BatchRow) => void;
  onMarkExpired: (batch: BatchRow) => void;
  onReturnToSupplier: (batch: BatchRow) => void;
}

const statusOptions: (BatchStatus | "all")[] = ["all", "available", "low", "expired", "quarantined", "damaged", "reserved"];

/** Module-local — Batch Management + Expiry Management (spec §10-11): every unit of stock traces to a batch; 30/60/90-day expiry buckets with Quarantine/Return-to-Supplier/Mark-Expired actions. Never allows expired inventory to be silently dispensed — dispensePrescription only draws from non-expired batches. */
export function BatchesPanel({ batches, onQuarantine, onMarkExpired, onReturnToSupplier }: BatchesPanelProps) {
  const [expiryBucket, setExpiryBucket] = useState<ExpiryBucket>("all");
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "all">("all");

  let rows = batches;
  if (expiryBucket !== "all") rows = rows.filter((b) => b.daysUntilExpiry <= expiryBucket && b.daysUntilExpiry >= 0);
  if (statusFilter !== "all") rows = rows.filter((b) => b.status === statusFilter);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", 30, 60, 90] as ExpiryBucket[]).map((bucket) => (
          <button
            key={String(bucket)}
            type="button"
            onClick={() => setExpiryBucket(bucket)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all ${expiryBucket === bucket ? "bg-signal-indigo text-white border-signal-indigo" : "border-line text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            {bucket === "all" ? "All Batches" : `Expiring in ${bucket} Days`}
          </button>
        ))}
        <select className="rounded-input border border-line px-3 py-1.5 text-xs outline-none focus:border-signal-indigo ml-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BatchStatus | "all")}>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : batchStatusMeta[s].label}
            </option>
          ))}
        </select>
      </div>

      <Card hero>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No batches match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Batch #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Mfg / Expiry</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Quantity</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Cost / Price</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Supplier</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((b) => {
                  const meta = batchStatusMeta[b.status];
                  return (
                    <tr key={b.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{b.batchNumber}</td>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{b.medicationName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">
                        {b.manufacturingDate} → {b.expiryDate}
                      </td>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{b.quantity.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        ${b.unitCost.toFixed(2)} / ${b.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{b.supplierName}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {b.status !== "expired" && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {b.status !== "quarantined" && (
                              <Button size="sm" variant="ghost" onClick={() => onQuarantine(b)}>
                                Quarantine
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => onReturnToSupplier(b)}>
                              Return
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onMarkExpired(b)}>
                              Mark Expired
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
