import { Search } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { categoryLabels, stockStatusMeta, statusPillStyle } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { ItemStockRow, ItemCategory, StockStatus } from "@modules/hospital-admin/api";

interface StockOverviewPanelProps {
  rows: ItemStockRow[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: ItemCategory | "all";
  onCategoryFilterChange: (value: ItemCategory | "all") => void;
  statusFilter: StockStatus | "all";
  onStatusFilterChange: (value: StockStatus | "all") => void;
}

const categories: (ItemCategory | "all")[] = ["all", "medical-supply", "surgical", "laboratory", "ppe", "implant", "consumable", "equipment", "general"];
const statuses: (StockStatus | "all")[] = ["all", "available", "low-stock", "out-of-stock", "quarantined", "damaged", "expired", "in-transit"];

/** Module-local — Stock Overview (spec §8-9): On Hand/Available/Reserved/Allocated/Damaged/Quarantined/In Transit/On Order, computed live from real batch/asset/reservation/transfer/PO records. */
export function StockOverviewPanel({ rows, search, onSearchChange, categoryFilter, onCategoryFilterChange, statusFilter, onStatusFilterChange }: StockOverviewPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search item name or code..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value as ItemCategory | "all")}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : categoryLabels[c]}
              </option>
            ))}
          </select>
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as StockStatus | "all")}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : stockStatusMeta[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card hero>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No stock matches this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Location</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">On Hand</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Available</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reserved</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">In Transit</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">On Order</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => {
                  const meta = stockStatusMeta[r.status];
                  return (
                    <tr key={r.itemId}>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-on-surface">{r.itemName}</div>
                        <div className="text-xs text-on-surface-variant font-mono">{r.itemCode}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.primaryWarehouse ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-right font-mono font-semibold text-on-surface">{r.onHand.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-right font-mono text-on-surface-variant">{r.available.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-right font-mono text-on-surface-variant">{r.reserved.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-right font-mono text-on-surface-variant">{r.inTransit.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-right font-mono text-on-surface-variant">{r.onOrder.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>
                          {meta.label}
                        </span>
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
