import { Card, Button } from "@shared/design-system/components";
import { inpatientOrderStatusMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { InpatientOrderRow } from "@modules/hospital-admin/api";

interface InpatientMedicationPanelProps {
  orders: InpatientOrderRow[];
  onVerify: (order: InpatientOrderRow) => void;
  onPrepare: (order: InpatientOrderRow) => void;
  onSupply: (order: InpatientOrderRow) => void;
}

/** Module-local — Inpatient Medication Workflow (spec §19-20): Doctor → Medication Order → Pharmacy Verification → Preparation → Ward. This screen ends at "Supplied to Ward" — Administration is nursing's own MAR record, a different module's concern, never merged in here. */
export function InpatientMedicationPanel({ orders, onVerify, onPrepare, onSupply }: InpatientMedicationPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {orders.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No inpatient medication orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Order #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Ward</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Dose / Route</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Ordered</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => {
                  const meta = inpatientOrderStatusMeta[o.status];
                  return (
                    <tr key={o.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{o.orderNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.wardName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.medicationName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant capitalize">
                        {o.dose} · {o.route} · {o.frequency}
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(o.orderedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {o.status === "ordered" && (
                          <Button size="sm" variant="outline" onClick={() => onVerify(o)}>
                            Verify
                          </Button>
                        )}
                        {o.status === "pharmacy-verified" && (
                          <Button size="sm" variant="outline" onClick={() => onPrepare(o)}>
                            Start Preparing
                          </Button>
                        )}
                        {o.status === "preparing" && (
                          <Button size="sm" onClick={() => onSupply(o)}>
                            Supply to Ward
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
