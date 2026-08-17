import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { StockMovementType } from "@modules/hospital-admin/api";

type MovementRow = {
  id: string;
  timestamp: string;
  itemName: string;
  movementType: StockMovementType;
  quantityChange: number;
  fromLocationName?: string;
  toLocationName?: string;
  actor: string;
  referenceId?: string;
};

interface StockMovementsPanelProps {
  movements: MovementRow[];
  typeFilter: StockMovementType | "all";
  onTypeFilterChange: (value: StockMovementType | "all") => void;
}

const types: (StockMovementType | "all")[] = [
  "all", "purchase-receipt", "transfer-in", "transfer-out", "return-in", "return-out", "requisition-issue", "adjustment", "disposal", "expiry", "damage", "count-correction",
];

/** Module-local — Stock Movement ledger (spec §16): every change creates a movement, auditable by construction. */
export function StockMovementsPanel({ movements, typeFilter, onTypeFilterChange }: StockMovementsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value as StockMovementType | "all")}>
          {types.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Movement Types" : t.replace(/-/g, " ")}</option>
          ))}
        </select>
      </div>
      <Card hero>
        {movements.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No stock movements match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Movement</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Qty</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">From</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">To</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(m.timestamp)}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{m.itemName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{m.movementType.replace(/-/g, " ")}</td>
                    <td className="py-2.5 pr-3 text-right font-mono font-bold" style={{ color: m.quantityChange < 0 ? "var(--pulse-coral)" : "var(--vital-green)" }}>
                      {m.quantityChange > 0 ? "+" : ""}{m.quantityChange}
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{m.fromLocationName ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{m.toLocationName ?? "—"}</td>
                    <td className="py-2.5 text-on-surface-variant">{m.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
