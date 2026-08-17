import { Card } from "@shared/design-system/components";
import { coverageStatusMeta } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { PrescriptionInsuranceRow } from "@modules/hospital-admin/api";

interface PharmacyInsurancePanelProps {
  rows: PrescriptionInsuranceRow[];
}

/** Module-local — Insurance / Pharmacy Coverage (spec §27-28): cross-reference view only, never a duplicate of the central Billing & Revenue module's own ledger, and never one hard-coded country's insurance workflow. */
export function PharmacyInsurancePanel({ rows }: PharmacyInsurancePanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Rx #</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Total Price</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Payer</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Copay</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const meta = coverageStatusMeta[r.coverageStatus];
                return (
                  <tr key={r.prescriptionId}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.prescriptionNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.patientName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.medicationSummary}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">${r.totalPrice.toFixed(2)}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.payerName ?? "Self-pay"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.copay !== undefined ? `$${r.copay.toFixed(2)}` : "—"}</td>
                    <td className="py-2.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
