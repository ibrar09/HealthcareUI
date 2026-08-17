import { Card, Button } from "@shared/design-system/components";
import { refillStatusMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { RefillRequestRow } from "@modules/hospital-admin/api";

interface RefillsPanelProps {
  refills: RefillRequestRow[];
  onApprove: (refill: RefillRequestRow) => void;
  onReject: (refill: RefillRequestRow) => void;
}

/** Module-local — Refill Management (spec §21): requested → approved/rejected → ready → dispensed. */
export function RefillsPanel({ refills, onApprove, onReject }: RefillsPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {refills.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No refill requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Rx #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Refills</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Requested</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {refills.map((r) => {
                  const meta = refillStatusMeta[r.status];
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.prescriptionNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.medicationName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        {r.refillsUsed}/{r.refillsAllowed} used
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(r.requestedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {r.status === "requested" && (
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => onReject(r)}>
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => onApprove(r)} disabled={r.refillsUsed >= r.refillsAllowed}>
                              Approve
                            </Button>
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
