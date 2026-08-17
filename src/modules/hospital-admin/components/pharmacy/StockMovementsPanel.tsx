import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { StockTransactionRow } from "@modules/hospital-admin/api";

const typeColors: Record<string, string> = {
  purchase: "var(--vital-green)",
  dispense: "var(--pulse-coral)",
  return: "var(--signal-indigo)",
  transfer: "var(--module-radiology)",
  adjustment: "var(--caution-amber)",
  expiry: "var(--pulse-coral)",
  damage: "var(--pulse-coral)",
  disposal: "var(--outline)",
  correction: "var(--caution-amber)",
};

interface StockMovementsPanelProps {
  transactions: StockTransactionRow[];
}

/** Module-local — Stock Movement ledger (spec §12): every inventory change is a transaction — Purchase/Dispense/Return/Transfer/Adjustment/Expiry/Damage/Disposal/Correction — auditable by construction. */
export function StockMovementsPanel({ transactions }: StockMovementsPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {transactions.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No stock transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Timestamp</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Batch</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Type</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Change</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actor</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(t.timestamp)}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{t.medicationName}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{t.batchNumber ?? "—"}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: `color-mix(in srgb, ${typeColors[t.type]} 16%, transparent)`, color: typeColors[t.type] }}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`py-2.5 pr-3 font-semibold ${t.quantityChange < 0 ? "text-pulse-coral" : t.quantityChange > 0 ? "text-vital-green" : "text-on-surface-variant"}`}>
                      {t.quantityChange > 0 ? "+" : ""}
                      {t.quantityChange}
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{t.actor}</td>
                    <td className="py-2.5 text-on-surface-variant">{t.note ?? "—"}</td>
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
