import { Plus, MapPin } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import type { Warehouse, StorageLocation } from "@modules/hospital-admin/api";

type WarehouseRow = Warehouse & { managerName?: string };

interface WarehousesPanelProps {
  warehouses: WarehouseRow[];
  locations: StorageLocation[];
  onAdd: () => void;
  onAddLocation: () => void;
}

/** Module-local — Warehouse Management + Storage Location hierarchy (spec §10-11): Warehouse -> Aisle -> Rack -> Shelf -> Bin, so staff can find stock quickly. */
export function WarehousesPanel({ warehouses, locations, onAdd, onAddLocation }: WarehousesPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-on-surface">Warehouses & Stores</h2>
        <Button onClick={onAdd}>
          <Plus size={14} /> Add Warehouse
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((w) => (
          <Card key={w.id} accentColor="var(--module-inventory)">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-on-surface">{w.name}</h3>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${w.status === "active" ? "var(--vital-green)" : "var(--outline)"} 16%, transparent)`, color: w.status === "active" ? "var(--vital-green)" : "var(--outline)" }}>
                {w.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-1">{w.type.replace(/-/g, " ")}</p>
            {(w.building || w.floor || w.room) && (
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <MapPin size={11} /> {[w.building, w.floor && `Floor ${w.floor}`, w.room].filter(Boolean).join(" · ")}
              </p>
            )}
            {w.managerName && <p className="text-xs text-on-surface-variant mt-1">Manager: <span className="font-semibold text-on-surface">{w.managerName}</span></p>}
            <p className="text-xs text-on-surface-variant mt-2">{locations.filter((l) => l.warehouseId === w.id).length} storage location(s)</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-on-surface">Storage Locations</h2>
        <Button variant="outline" onClick={onAddLocation}>
          <Plus size={14} /> Add Location
        </Button>
      </div>

      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Warehouse</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Aisle</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Rack</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Shelf</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Bin</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {locations.map((l) => (
                <tr key={l.id}>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{warehouses.find((w) => w.id === l.warehouseId)?.name ?? "Unknown"}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{l.aisle ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{l.rack ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{l.shelf ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{l.bin ?? "—"}</td>
                  <td className="py-2.5 font-mono text-xs font-semibold text-on-surface">{l.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
