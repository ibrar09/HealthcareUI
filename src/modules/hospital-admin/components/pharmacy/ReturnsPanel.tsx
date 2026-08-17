import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { MedicationReturnRow } from "@modules/hospital-admin/api";

const sourceLabels: Record<string, string> = { patient: "Patient", ward: "Ward", pharmacy: "Pharmacy", supplier: "Supplier" };
const conditionLabels: Record<string, string> = { "sealed-unused": "Sealed/Unused", "opened-unused": "Opened/Unused", damaged: "Damaged", "suspected-contaminated": "Suspected Contaminated" };

interface ReturnsPanelProps {
  returns: MedicationReturnRow[];
  onAdd: () => void;
  onRestock: (ret: MedicationReturnRow) => void;
}

/** Module-local — Medication Returns (spec §22): patient/ward/pharmacy/supplier returns. Restocking is deliberate and separate — only sealed/unused-condition returns qualify. */
export function ReturnsPanel({ returns, onAdd, onRestock }: ReturnsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Record Return
        </Button>
      </div>
      <Card hero>
        {returns.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No returns recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Quantity</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Source</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Condition</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Recorded</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {returns.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.medicationName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.quantity}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{sourceLabels[r.source]}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{conditionLabels[r.condition]}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.reason}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(r.recordedAt)}</td>
                    <td className="py-2.5">
                      {r.restocked ? (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-vital-green/14 text-vital-green">Restocked</span>
                      ) : r.condition === "sealed-unused" ? (
                        <Button size="sm" variant="outline" onClick={() => onRestock(r)}>
                          Restock
                        </Button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">Not eligible</span>
                      )}
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
