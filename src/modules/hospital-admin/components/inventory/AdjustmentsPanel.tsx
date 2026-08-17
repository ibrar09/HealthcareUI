import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { adjustmentStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { AdjustmentApprovalStatus, AdjustmentReason } from "@modules/hospital-admin/api";

type AdjustmentRow = {
  id: string;
  itemName: string;
  warehouseName: string;
  quantityChange: number;
  reason: AdjustmentReason;
  note?: string;
  status: AdjustmentApprovalStatus;
  createdAt: string;
};

interface AdjustmentsPanelProps {
  adjustments: AdjustmentRow[];
  onAdd: () => void;
  onApprove: (a: AdjustmentRow) => void;
  onReject: (a: AdjustmentRow) => void;
}

/** Module-local — Inventory Adjustment (spec §27): system vs. physical mismatch, reason/user/approval/audit always required, never a silent edit. */
export function AdjustmentsPanel({ adjustments, onAdd, onApprove, onReject }: AdjustmentsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button onClick={onAdd}><Plus size={14} /> New Adjustment</Button>
      </div>
      <Card hero>
        {adjustments.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No adjustments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Warehouse</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Change</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {adjustments.map((a) => {
                  const meta = adjustmentStatusMeta[a.status];
                  return (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{a.itemName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{a.warehouseName}</td>
                      <td className="py-2.5 pr-3 text-right font-mono font-bold" style={{ color: a.quantityChange < 0 ? "var(--pulse-coral)" : "var(--vital-green)" }}>
                        {a.quantityChange > 0 ? "+" : ""}{a.quantityChange}
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{a.reason.replace(/-/g, " ")}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(a.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        {a.status === "pending-approval" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => onApprove(a)}>Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => onReject(a)}>Reject</Button>
                          </div>
                        )}
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
