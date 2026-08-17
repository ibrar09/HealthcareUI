import { Card } from "@shared/design-system/components";
import { assetStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { AssetStatus } from "@modules/hospital-admin/api";

type AssetRow = { id: string; itemName: string; serialNumber: string; lotNumber?: string; warehouseName: string; status: AssetStatus; assignedToName?: string };
type ImplantUsageRow = { id: string; itemName: string; serialNumber?: string; lotNumber?: string; patientName: string; procedureName: string; surgeonName?: string; dateUsed: string };

interface AssetImplantPanelProps {
  assets: AssetRow[];
  implantUsages: ImplantUsageRow[];
}

/** Module-local — Serial/Asset Tracking + Implant Tracking (spec §13, §38): individually-tracked equipment/implants, and every implant's patient/procedure/surgeon traceability. */
export function AssetImplantPanel({ assets, implantUsages }: AssetImplantPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Serialized Assets</h2>
        {assets.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No serialized assets on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Item</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Serial</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Lot</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Location</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Assigned To</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {assets.map((a) => {
                  const meta = assetStatusMeta[a.status];
                  return (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{a.itemName}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{a.serialNumber}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{a.lotNumber ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{a.warehouseName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{a.assignedToName ?? "—"}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card hero accentColor="var(--module-inventory)">
        <h2 className="text-lg font-bold text-on-surface mb-4">Implant Patient Traceability</h2>
        {implantUsages.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No implant usage recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Implant</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Serial / Lot</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Surgeon</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {implantUsages.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{u.itemName}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{u.serialNumber ?? u.lotNumber ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.patientName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.procedureName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{u.surgeonName ?? "—"}</td>
                    <td className="py-2.5 text-on-surface-variant whitespace-nowrap">{formatDateTime(u.dateUsed)}</td>
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
