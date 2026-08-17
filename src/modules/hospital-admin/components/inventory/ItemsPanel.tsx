import { Search, Plus, Barcode } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { categoryLabels } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { InventoryItem, ItemCategory } from "@modules/hospital-admin/api";

interface ItemsPanelProps {
  items: InventoryItem[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: ItemCategory | "all";
  onCategoryFilterChange: (value: ItemCategory | "all") => void;
  onAdd: () => void;
  onEdit: (item: InventoryItem) => void;
  onToggleStatus: (item: InventoryItem) => void;
}

const categories: (ItemCategory | "all")[] = ["all", "medical-supply", "surgical", "laboratory", "ppe", "implant", "consumable", "equipment", "general"];

/** Module-local — Item Master (spec §3-8): category/type/UOM/identifiers, configurable never hardcoded. */
export function ItemsPanel({ items, search, onSearchChange, categoryFilter, onCategoryFilterChange, onAdd, onEdit, onToggleStatus }: ItemsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search item name, code, barcode, manufacturer..."
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
          <Button onClick={onAdd}>
            <Plus size={14} /> Add Item
          </Button>
        </div>
      </div>

      <Card hero>
        {items.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No items match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Code</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Name</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Category</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Manufacturer</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Unit</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reorder Level</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Unit Cost</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr key={item.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onEdit(item)}>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{item.itemCode}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">
                      <div className="flex items-center gap-1.5">
                        {item.name}
                        {item.isSerialTracked && (
                          <span title="Serial-tracked">
                            <Barcode size={12} className="text-signal-indigo" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{categoryLabels[item.category]}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{item.manufacturer ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{item.baseUnit}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{item.reorderLevel}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant font-mono">${item.unitCost.toFixed(2)}</td>
                    <td className="py-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item)}
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${item.status === "active" ? "var(--vital-green)" : "var(--outline)"} 16%, transparent)`,
                          color: item.status === "active" ? "var(--vital-green)" : "var(--outline)",
                        }}
                      >
                        {item.status === "active" ? "Active" : item.status === "inactive" ? "Inactive" : "Discontinued"}
                      </button>
                    </td>
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
