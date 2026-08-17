import { Card } from "@shared/design-system/components";
import { categoryLabels } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { InventoryReportsData, InventoryAnalyticsData } from "@modules/hospital-admin/api";

interface InventoryReportsPanelProps {
  reports: InventoryReportsData | null;
  analytics: InventoryAnalyticsData | null;
}

/** Module-local — Reports + Analytics (spec §43-44): stock/movement/procurement/consumption reports, plus turnover/slow-moving/dead-stock/expiry-loss/supplier-performance analytics — one tab, all computed from real records. */
export function InventoryReportsPanel({ reports, analytics }: InventoryReportsPanelProps) {
  if (!reports || !analytics) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Stock by Category</h2>
          <div className="flex flex-col divide-y divide-line">
            {reports.stockReport.map((r) => (
              <div key={r.category} className="py-2 flex items-center justify-between text-sm">
                <span className="text-on-surface font-semibold">{categoryLabels[r.category]}</span>
                <span className="text-on-surface-variant text-xs">{r.itemCount} items · {r.totalQuantity.toLocaleString()} units · ${r.totalValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Movement Summary</h2>
          <div className="flex flex-col divide-y divide-line">
            {reports.movementReport.map((r) => (
              <div key={r.movementType} className="py-2 flex items-center justify-between text-sm">
                <span className="text-on-surface font-semibold capitalize">{r.movementType.replace(/-/g, " ")}</span>
                <span className="text-on-surface-variant text-xs">{r.count} events · {r.totalQuantity.toLocaleString()} units</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Consumption by Department</h2>
        {reports.consumptionByDepartment.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No consumption recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {reports.consumptionByDepartment.map((row) => {
              const max = Math.max(...reports.consumptionByDepartment.map((r) => r.quantity), 1);
              return (
                <div key={row.department} className="flex items-center gap-3">
                  <span className="w-40 flex-shrink-0 text-xs font-semibold text-on-surface-variant">{row.department}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(row.quantity / max) * 100}%` }} />
                  </div>
                  <span className="w-14 text-right text-xs font-mono font-bold text-on-surface">{row.quantity.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-1">Inventory Turnover</h2>
          <p className="font-mono font-bold text-3xl text-on-surface mb-4">{analytics.inventoryTurnover.toFixed(2)}x</p>
          <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Slow-Moving Items</h3>
          <div className="flex flex-col divide-y divide-line">
            {analytics.slowMovingItems.slice(0, 6).map((r) => (
              <div key={r.itemName} className="py-1.5 flex items-center justify-between text-sm">
                <span className="text-on-surface">{r.itemName}</span>
                <span className="text-xs text-caution-amber font-semibold">{r.daysSinceLastMovement}d idle</span>
              </div>
            ))}
            {analytics.slowMovingItems.length === 0 && <p className="text-sm text-on-surface-variant py-2">Nothing slow-moving right now.</p>}
          </div>
        </Card>

        <Card hero accentColor="var(--pulse-coral)">
          <h2 className="text-lg font-bold text-on-surface mb-1">Expiry Loss Value</h2>
          <p className="font-mono font-bold text-3xl text-pulse-coral mb-4">${analytics.expiryLossValue.toLocaleString()}</p>
          <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Supplier Performance</h3>
          <div className="flex flex-col divide-y divide-line">
            {analytics.supplierPerformance.map((s) => (
              <div key={s.supplierName} className="py-1.5 flex items-center justify-between text-sm">
                <span className="text-on-surface">{s.supplierName}</span>
                <span className="text-xs text-on-surface-variant">{s.onTimeDeliveryRate}% on-time · {s.qualityIssueCount} issues</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {analytics.deadStockItems.length > 0 && (
        <Card hero accentColor="var(--outline)">
          <h2 className="text-lg font-bold text-on-surface mb-4">Dead Stock</h2>
          <div className="flex flex-col divide-y divide-line">
            {analytics.deadStockItems.map((r) => (
              <div key={r.itemName} className="py-1.5 flex items-center justify-between text-sm">
                <span className="text-on-surface">{r.itemName}</span>
                <span className="font-mono font-bold text-on-surface-variant">{r.onHand} on hand</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
