import { Search } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { imagingPriorityMeta } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { RadiologyBillingRow, RadiologyInsuranceRow } from "@modules/hospital-admin/api";

const authMeta: Record<string, { label: string; color: string }> = {
  "not-required": { label: "Not Required", color: "var(--outline)" },
  pending: { label: "Pending", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

interface RadiologyBillingPanelProps {
  billing: RadiologyBillingRow[];
  insuranceQueue: RadiologyInsuranceRow[];
  search: string;
  onSearchChange: (value: string) => void;
}

/** Module-local — Radiology "Billing" tab (spec §30-31): cross-reference view of pricing/billing codes already on ImagingProcedure and authorization data already on ImagingOrder — never a second billing ledger, the central Billing & Revenue module owns that. */
export function RadiologyBillingPanel({ billing, insuranceQueue, search, onSearchChange }: RadiologyBillingPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Insurance Authorization Queue</h2>
        {insuranceQueue.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No orders pending or rejected insurance authorization.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Order</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Payer</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {insuranceQueue.map((r) => {
                  const priority = imagingPriorityMeta[r.priority];
                  const auth = authMeta[r.authorizationStatus];
                  return (
                    <tr key={r.orderId}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.orderNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.procedureName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.payerName ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${auth.color} 16%, transparent)`, color: auth.color }}>
                          {auth.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card hero>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-on-surface">Order Billing</h2>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
              placeholder="Search order # or patient..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Order</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Billing Code</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Price</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Payer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {billing.map((r) => (
                <tr key={r.orderId}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.orderNumber}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{r.patientName}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{r.procedureName}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{r.billingCode ?? "—"}</td>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">${r.price}</td>
                  <td className="py-2.5 text-on-surface-variant">{r.payerName ?? "Self-pay"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
