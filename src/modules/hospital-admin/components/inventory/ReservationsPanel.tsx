import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { reservationStatusMeta, statusPillStyle } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { ReservationStatus, ReservationReferenceType } from "@modules/hospital-admin/api";

type ReservationRow = {
  id: string;
  itemName: string;
  quantity: number;
  reservedFor: string;
  referenceType: ReservationReferenceType;
  departmentName?: string;
  neededBy?: string;
  status: ReservationStatus;
};

interface ReservationsPanelProps {
  reservations: ReservationRow[];
  onAdd: () => void;
  onFulfill: (r: ReservationRow) => void;
  onCancel: (r: ReservationRow) => void;
}

/** Module-local — Inventory Reservation (spec §30): e.g. OT Surgery Tomorrow -> Reserve -> Surgical Supplies. On Hand stays intact; Available shrinks. */
export function ReservationsPanel({ reservations, onAdd, onFulfill, onCancel }: ReservationsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button onClick={onAdd}><Plus size={14} /> New Reservation</Button>
      </div>
      <Card hero>
        {reservations.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No active reservations.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-right py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Qty</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reserved For</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Department</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Needed By</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reservations.map((r) => {
                  const meta = reservationStatusMeta[r.status];
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.itemName}</td>
                      <td className="py-2.5 pr-3 text-right font-mono font-semibold text-on-surface">{r.quantity}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.reservedFor}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.departmentName ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.neededBy ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        {r.status === "active" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => onFulfill(r)}>Fulfill</Button>
                            <Button size="sm" variant="ghost" onClick={() => onCancel(r)}>Cancel</Button>
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
