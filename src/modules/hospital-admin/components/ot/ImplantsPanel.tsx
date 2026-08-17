import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { ImplantItem, ImplantUsageRow } from "@modules/hospital-admin/api";

interface ImplantsPanelProps {
  catalog: ImplantItem[];
  usageLog: ImplantUsageRow[];
}

/** Module-local — Implant registry + traceability (spec §21): serial/lot/UDI tracked per unit, and every use logged permanently — traceability is the whole point of this screen. */
export function ImplantsPanel({ catalog, usageLog }: ImplantsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Implant Catalog</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Type</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Manufacturer</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Model</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Serial / Lot</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Available</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {catalog.map((i) => (
                <tr key={i.id}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{i.type}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{i.manufacturer}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{i.model}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">
                    {i.serialNumber} / {i.lotNumber}
                  </td>
                  <td className={`py-2.5 pr-3 font-semibold ${i.quantityAvailable <= 5 ? "text-caution-amber" : "text-on-surface"}`}>{i.quantityAvailable}</td>
                  <td className="py-2.5 text-on-surface-variant">{i.expiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Traceability Log</h2>
        {usageLog.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No implants used yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Case</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Implant</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Lot / Serial</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Quantity</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {usageLog.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{u.caseNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.patientName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.implantType}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">
                      {u.lotNumber} / {u.serialNumber}
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.quantityUsed}</td>
                    <td className="py-2.5 text-on-surface-variant">{formatDateTime(u.recordedAt)}</td>
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
