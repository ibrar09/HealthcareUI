import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { DisposalMethod } from "@modules/hospital-admin/api";

type DisposalRow = { id: string; disposalNumber: string; itemName: string; quantity: number; reason: string; method: DisposalMethod; authorizedByName: string; disposedAt: string };

interface DisposalPanelProps {
  records: DisposalRow[];
  onAdd: () => void;
}

/** Module-local — Inventory Disposal (spec §41): Expired/Damaged -> Disposal Request -> Approval -> Disposal -> Record, always with authorized personnel captured. */
export function DisposalPanel({ records, onAdd }: DisposalPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button onClick={onAdd}><Plus size={14} /> Record Disposal</Button>
      </div>
      <Card hero>
        {records.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No disposals recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Disposal #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Qty</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Method</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Authorized By</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{r.disposalNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.itemName}</td>
                    <td className="py-2.5 pr-3 text-right font-mono font-semibold text-on-surface">{r.quantity}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.method.replace(/-/g, " ")}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant max-w-xs truncate">{r.reason}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.authorizedByName}</td>
                    <td className="py-2.5 text-on-surface-variant whitespace-nowrap">{formatDateTime(r.disposedAt)}</td>
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
