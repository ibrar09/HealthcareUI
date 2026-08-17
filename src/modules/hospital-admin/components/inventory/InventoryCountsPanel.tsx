import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { countStatusMeta, statusPillStyle } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { CountStatus } from "@modules/hospital-admin/api";

type CountRow = { id: string; countNumber: string; warehouseName: string; status: CountStatus; scheduledDate: string; lines: unknown[] };

interface InventoryCountsPanelProps {
  counts: CountRow[];
  onAdd: () => void;
  onSelect: (id: string) => void;
}

/** Module-local — Physical Stock Count (spec §28-29): Create -> Freeze/Control Movement -> Count -> Compare -> Variance -> Approval -> Adjustment. */
export function InventoryCountsPanel({ counts, onAdd, onSelect }: InventoryCountsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button onClick={onAdd}><Plus size={14} /> New Count</Button>
      </div>
      <Card hero>
        {counts.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No inventory counts scheduled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Count #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Warehouse</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Items</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Scheduled</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {counts.map((c) => {
                  const meta = countStatusMeta[c.status];
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(c.id)}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{c.countNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.warehouseName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.lines.length}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.scheduledDate}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
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
