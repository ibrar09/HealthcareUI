import { useState } from "react";
import { Search, ShieldQuestion, Ban } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { batchStatusMeta, statusPillStyle } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { InventoryBatch, InventoryBatchStatus } from "@modules/hospital-admin/api";

type BatchRow = InventoryBatch & { itemName: string; itemCode: string; warehouseName: string; daysToExpiry?: number };

interface BatchesPanelProps {
  batches: BatchRow[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: InventoryBatchStatus | "all";
  onStatusFilterChange: (value: InventoryBatchStatus | "all") => void;
  onQuarantine: (batch: BatchRow, reason: string) => void;
  onMarkExpired: (batch: BatchRow) => void;
}

const statuses: (InventoryBatchStatus | "all")[] = ["all", "available", "low", "quarantined", "expired", "damaged", "disposed", "returned"];

/** Module-local — Batch Management + Expiry Management + FEFO (spec §12, §14, §15): every unit of stock traces to a batch, real quarantine/expire actions, never a silent edit. */
export function BatchesPanel({ batches, search, onSearchChange, statusFilter, onStatusFilterChange, onQuarantine, onMarkExpired }: BatchesPanelProps) {
  const [reasonFor, setReasonFor] = useState<BatchRow | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search batch number or item..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as InventoryBatchStatus | "all")}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : batchStatusMeta[s].label}
            </option>
          ))}
        </select>
      </div>

      <Card hero>
        {batches.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No batches match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Batch</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Expiry</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Quantity</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Warehouse</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {batches.map((b) => {
                  const meta = batchStatusMeta[b.status];
                  return (
                    <tr key={b.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{b.batchNumber}</td>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{b.itemName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        {b.expiryDate ?? "—"}
                        {b.daysToExpiry !== undefined && b.status !== "expired" && b.daysToExpiry <= 90 && (
                          <span className="ml-1.5 text-[10px] font-bold" style={{ color: b.daysToExpiry <= 7 ? "var(--pulse-coral)" : "var(--caution-amber)" }}>
                            ({b.daysToExpiry}d)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono font-semibold text-on-surface">{b.quantity.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{b.warehouseName}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status !== "quarantined" && b.status !== "expired" && b.status !== "disposed" && (
                            <button type="button" title="Quarantine" onClick={() => setReasonFor(b)} className="rounded-lg p-1.5 text-signal-indigo hover:bg-signal-indigo/10">
                              <ShieldQuestion size={14} />
                            </button>
                          )}
                          {b.status !== "expired" && b.status !== "disposed" && (
                            <button type="button" title="Mark Expired" onClick={() => onMarkExpired(b)} className="rounded-lg p-1.5 text-pulse-coral hover:bg-pulse-coral/10">
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {reasonFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/40 backdrop-blur-sm" onClick={() => setReasonFor(null)}>
          <div className="bg-white rounded-hero p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-on-surface mb-1">Quarantine Batch</h3>
            <p className="text-sm text-on-surface-variant mb-4">{reasonFor.batchNumber} — {reasonFor.itemName}</p>
            <textarea className="w-full rounded-input border border-line px-3.5 py-2.5 text-sm outline-none focus:border-signal-indigo mb-4" rows={3} placeholder="Reason for quarantine..." value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReasonFor(null)}>Cancel</Button>
              <Button
                disabled={!reason.trim()}
                onClick={() => {
                  onQuarantine(reasonFor, reason);
                  setReasonFor(null);
                  setReason("");
                }}
              >
                Quarantine
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
