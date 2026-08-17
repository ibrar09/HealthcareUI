import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { transferStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { TransferStatus } from "@modules/hospital-admin/api";

type TransferRow = {
  id: string;
  transferNumber: string;
  fromWarehouseName: string;
  toWarehouseName: string;
  status: TransferStatus;
  requestedAt: string;
  items: { itemId: string; quantity: number }[];
};

interface StockTransfersPanelProps {
  transfers: TransferRow[];
  onAdd: () => void;
  onApprove: (t: TransferRow) => void;
  onShip: (t: TransferRow) => void;
  onReceive: (t: TransferRow) => void;
  onReject: (t: TransferRow) => void;
}

/** Module-local — Stock Transfer (spec §25): Requested -> Approved -> Picking -> Shipped -> In Transit -> Received. */
export function StockTransfersPanel({ transfers, onAdd, onApprove, onShip, onReceive, onReject }: StockTransfersPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button onClick={onAdd}><Plus size={14} /> New Transfer</Button>
      </div>
      <Card hero>
        {transfers.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No stock transfers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Transfer #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">From</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">To</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Items</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transfers.map((t) => {
                  const status = transferStatusMeta[t.status];
                  return (
                    <tr key={t.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{t.transferNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{t.fromWarehouseName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{t.toWarehouseName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{t.items.length}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(t.requestedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status === "requested" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => onApprove(t)}>Approve</Button>
                              <Button size="sm" variant="ghost" onClick={() => onReject(t)}>Reject</Button>
                            </>
                          )}
                          {t.status === "approved" && <Button size="sm" onClick={() => onShip(t)}>Ship</Button>}
                          {(t.status === "shipped" || t.status === "in-transit") && <Button size="sm" onClick={() => onReceive(t)}>Receive</Button>}
                        </div>
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
