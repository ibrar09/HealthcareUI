import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { transferStatusMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { StockTransferRow } from "@modules/hospital-admin/api";

interface TransfersPanelProps {
  transfers: StockTransferRow[];
  onAdd: () => void;
  onApprove: (transfer: StockTransferRow) => void;
  onComplete: (transfer: StockTransferRow) => void;
}

/** Module-local — Stock Transfer (spec §13): Main Pharmacy → Transfer Request → Approval → destination location, supporting pharmacy-to-pharmacy/ward/OT/ICU. */
export function TransfersPanel({ transfers, onAdd, onApprove, onComplete }: TransfersPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Request Transfer
        </Button>
      </div>
      <Card hero>
        {transfers.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No stock transfers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Batch</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Quantity</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">From → To</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Requested</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transfers.map((t) => {
                  const meta = transferStatusMeta[t.status];
                  return (
                    <tr key={t.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{t.medicationName}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{t.batchNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{t.quantity}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        {t.fromLocationName} → {t.toLocationName}
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(t.requestedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {t.status === "requested" && (
                          <Button size="sm" variant="outline" onClick={() => onApprove(t)}>
                            Approve
                          </Button>
                        )}
                        {t.status === "approved" && (
                          <Button size="sm" onClick={() => onComplete(t)}>
                            Complete
                          </Button>
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
