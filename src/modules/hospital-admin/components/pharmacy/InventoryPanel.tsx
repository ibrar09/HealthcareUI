import { Package, CheckCircle2, AlertTriangle, PackageX, CalendarClock, Ban, ShieldQuestion, Hammer, DollarSign } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { batchStatusMeta } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { InventoryOverview, BatchRow } from "@modules/hospital-admin/api";

interface InventoryPanelProps {
  overview: InventoryOverview | null;
  batches: BatchRow[];
}

/** Module-local — Pharmacy Inventory overview (spec §9): stock counts computed from real batch records, plus a full batch-level stock table (medication/batch/expiry/quantity/location/status). */
export function InventoryPanel({ overview, batches }: InventoryPanelProps) {
  if (!overview) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Products" value={overview.totalProducts} icon={<Package size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Available" value={overview.available} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Low Stock" value={overview.lowStock} icon={<AlertTriangle size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Out of Stock" value={overview.outOfStock} icon={<PackageX size={14} />} accentColor="var(--pulse-coral)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Expiring" value={overview.expiring} icon={<CalendarClock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Expired" value={overview.expired} icon={<Ban size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Quarantined" value={overview.quarantined} icon={<ShieldQuestion size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Inventory Value" value={`$${overview.inventoryValue.toLocaleString()}`} icon={<DollarSign size={14} />} accentColor="var(--vital-green)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Stock List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Batch</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Expiry</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Quantity</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Location</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {batches.map((b) => {
                const meta = batchStatusMeta[b.status];
                return (
                  <tr key={b.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{b.medicationName}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{b.batchNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{b.expiryDate}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{b.quantity.toLocaleString()}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{b.locationName}</td>
                    <td className="py-2.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {overview.damaged > 0 && (
        <Card hero accentColor="var(--pulse-coral)">
          <div className="flex items-center gap-2">
            <Hammer size={16} className="text-pulse-coral" />
            <p className="text-sm text-on-surface">
              <span className="font-bold">{overview.damaged}</span> damaged batch(es) — see the Batches tab for detail.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
