import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { returnStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { ReturnStatus, ReturnReason } from "@modules/hospital-admin/api";

type StockReturnRow = {
  id: string;
  returnNumber: string;
  direction: "department-to-store" | "store-to-supplier";
  fromDepartmentName?: string;
  toWarehouseName?: string;
  supplierName?: string;
  reason: ReturnReason;
  status: ReturnStatus;
  requestedAt: string;
  items: { itemId: string; quantity: number }[];
};

interface StockReturnsPanelProps {
  returns: StockReturnRow[];
  onAdd: () => void;
  onApprove: (r: StockReturnRow) => void;
  onReceive: (r: StockReturnRow) => void;
  onReject: (r: StockReturnRow) => void;
}

/** Module-local — Stock Returns (spec §26): Department->Store, Store->Supplier, with real reason capture. */
export function StockReturnsPanel({ returns, onAdd, onApprove, onReceive, onReject }: StockReturnsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button onClick={onAdd}><Plus size={14} /> New Return</Button>
      </div>
      <Card hero>
        {returns.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No stock returns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Return #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">From</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">To</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {returns.map((r) => {
                  const status = returnStatusMeta[r.status];
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{r.returnNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.fromDepartmentName ?? "Store"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.toWarehouseName ?? r.supplierName ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.reason.replace(/-/g, " ")}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(r.requestedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        {r.status === "requested" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => onApprove(r)}>Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => onReject(r)}>Reject</Button>
                          </div>
                        )}
                        {r.status === "approved" && <Button size="sm" onClick={() => onReceive(r)}>Receive</Button>}
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
