import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { ConsumableItem, ConsumableUsageRow } from "@modules/hospital-admin/api";

interface ConsumablesPanelProps {
  catalog: ConsumableItem[];
  usageLog: ConsumableUsageRow[];
}

/** Module-local — Consumables (spec §23): catalog + usage log. Every usage decrements catalog stock — feeds inventory/billing, never a second inventory system of its own. */
export function ConsumablesPanel({ catalog, usageLog }: ConsumablesPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Consumables Catalog</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Unit</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Unit Cost</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {catalog.map((c) => (
                <tr key={c.code}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.name}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{c.unit}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">${c.unitCost.toFixed(2)}</td>
                  <td className="py-2.5 font-semibold text-on-surface">{c.stockQuantity.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Usage Log</h2>
        {usageLog.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No consumable usage recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Case</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Quantity</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {usageLog.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{u.caseNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.consumableName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.quantity}</td>
                    <td className="py-2.5 text-on-surface-variant">{formatDateTime(u.recordedAt)}</td>
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
