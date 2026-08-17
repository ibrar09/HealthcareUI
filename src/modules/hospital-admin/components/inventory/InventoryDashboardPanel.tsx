import { Boxes, PackageCheck, AlertTriangle, PackageX, CalendarClock, Ban, ClipboardList, ShoppingCart, Truck, ArrowLeftRight, AlarmClock, ShieldQuestion, Hammer, RefreshCcw } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { categoryLabels } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { InventoryDashboardData } from "@modules/hospital-admin/api";

interface InventoryDashboardPanelProps {
  data: InventoryDashboardData | null;
}

/** Module-local — Inventory Dashboard (spec §1): every KPI computed from real stock/batch/requisition/PO records, never a decorative number. */
export function InventoryDashboardPanel({ data }: InventoryDashboardPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Items" value={data.totalItems} icon={<Boxes size={14} />} accentColor="var(--module-inventory)" />
        <KPICard label="Active Items" value={data.activeItems} icon={<PackageCheck size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Total Stock Qty" value={data.totalStockQuantity.toLocaleString()} icon={<Boxes size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Inventory Value" value={`$${data.totalInventoryValue.toLocaleString()}`} icon={<ShoppingCart size={14} />} accentColor="var(--vital-green)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Low Stock" value={data.lowStockItems} icon={<AlertTriangle size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Out of Stock" value={data.outOfStockItems} icon={<PackageX size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Expiring Soon" value={data.expiringSoon} icon={<CalendarClock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Expired" value={data.expiredItems} icon={<Ban size={14} />} accentColor="var(--pulse-coral)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Pending Purchase Requests" value={data.pendingPurchaseRequests} icon={<ClipboardList size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Pending Purchase Orders" value={data.pendingPurchaseOrders} icon={<ShoppingCart size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Pending Goods Receipts" value={data.pendingGoodsReceipts} icon={<Truck size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Pending Transfers" value={data.pendingTransfers} icon={<ArrowLeftRight size={14} />} accentColor="var(--caution-amber)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Pending Approvals" value={data.pendingApprovals} icon={<AlarmClock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="In Quarantine" value={data.itemsInQuarantine} icon={<ShieldQuestion size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Damaged" value={data.damagedItems} icon={<Hammer size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Reorder Required" value={data.reorderRequired} icon={<RefreshCcw size={14} />} accentColor="var(--caution-amber)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Stock by Category</h2>
          <div className="flex flex-col gap-2.5">
            {data.stockByCategory.length === 0 && <p className="text-sm text-on-surface-variant py-4">No stock recorded yet.</p>}
            {data.stockByCategory.map((row) => {
              const max = Math.max(...data.stockByCategory.map((r) => r.quantity), 1);
              return (
                <div key={row.category} className="flex items-center gap-3">
                  <span className="w-32 flex-shrink-0 text-xs font-semibold text-on-surface-variant">{categoryLabels[row.category]}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(row.quantity / max) * 100}%` }} />
                  </div>
                  <span className="w-14 text-right text-xs font-mono font-bold text-on-surface">{row.quantity.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Stock Consumption Trend</h2>
          {data.stockConsumptionTrend.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4">No consumption recorded yet.</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {data.stockConsumptionTrend.map((point) => {
                const max = Math.max(...data.stockConsumptionTrend.map((p) => p.quantity), 1);
                return (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full rounded-t-md bg-signal-indigo/70" style={{ height: `${Math.max((point.quantity / max) * 100, 4)}%` }} />
                    <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{point.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero accentColor="var(--caution-amber)">
          <h2 className="text-lg font-bold text-on-surface mb-4">Low Stock</h2>
          <div className="flex flex-col divide-y divide-line">
            {data.lowStockList.length === 0 && <p className="text-sm text-on-surface-variant py-4">Nothing below reorder level.</p>}
            {data.lowStockList.slice(0, 8).map((row) => (
              <div key={row.itemName} className="flex items-center justify-between py-2 text-sm">
                <span className="text-on-surface font-semibold">{row.itemName}</span>
                <span className="text-on-surface-variant text-xs">
                  {row.available} available <span className="text-on-surface-variant/60">(reorder at {row.reorderLevel})</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card hero accentColor="var(--pulse-coral)">
          <h2 className="text-lg font-bold text-on-surface mb-4">Expiring Soon (30 days)</h2>
          <div className="flex flex-col divide-y divide-line">
            {data.expiringSoonList.length === 0 && <p className="text-sm text-on-surface-variant py-4">Nothing expiring in the next 30 days.</p>}
            {data.expiringSoonList.slice(0, 8).map((row) => (
              <div key={row.batchNumber} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="text-on-surface font-semibold">{row.itemName}</span>
                  <span className="text-on-surface-variant text-xs ml-1.5 font-mono">{row.batchNumber}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: row.daysToExpiry <= 7 ? "var(--pulse-coral)" : "var(--caution-amber)" }}>
                  {row.daysToExpiry}d left
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
