import { Plus, ShieldQuestion } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { recallStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { InventoryRecallStatus } from "@modules/hospital-admin/api";

type RecallRow = { id: string; recallNumber: string; itemName: string; manufacturer: string; reason: string; status: InventoryRecallStatus; initiatedAt: string; affectedBatchIds: string[] };
type QuarantinedBatchRow = { id: string; itemName: string; batchNumber: string; quantity: number; quarantineReason?: string };

interface RecallsPanelProps {
  recalls: RecallRow[];
  quarantinedBatches: QuarantinedBatchRow[];
  onAdd: () => void;
  onView: (r: RecallRow) => void;
  onClose: (r: RecallRow) => void;
}

/** Module-local — Inventory Recall + Quarantine (spec §39-40): Manufacturer Recall -> Affected Batch -> Quarantine Stock -> Trace Usage, plus the live quarantine list every recall feeds. */
export function RecallsPanel({ recalls, quarantinedBatches, onAdd, onView, onClose }: RecallsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-on-surface">Recalls</h2>
        <Button onClick={onAdd}><Plus size={14} /> Initiate Recall</Button>
      </div>

      <Card hero>
        {recalls.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-8">No recalls on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Recall #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Manufacturer</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Batches</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Initiated</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recalls.map((r) => {
                  const meta = recallStatusMeta[r.status];
                  return (
                    <tr key={r.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onView(r)}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{r.recallNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.itemName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.manufacturer}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.affectedBatchIds.length}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(r.initiatedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                      </td>
                      <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {r.status !== "closed" && <Button size="sm" variant="outline" onClick={() => onClose(r)}>Close</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2">
        <ShieldQuestion size={16} className="text-signal-indigo" />
        <h2 className="text-base font-bold text-on-surface">Quarantined Stock</h2>
      </div>
      <Card hero>
        {quarantinedBatches.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-8">No batches in quarantine.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {quarantinedBatches.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-on-surface">{b.itemName}</span>
                  <span className="ml-1.5 font-mono text-xs text-on-surface-variant">{b.batchNumber}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-on-surface">{b.quantity}</span>
                  {b.quarantineReason && <p className="text-xs text-on-surface-variant max-w-xs">{b.quarantineReason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
