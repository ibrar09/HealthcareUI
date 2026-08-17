import { Card, KPICard } from "@shared/design-system/components";
import { CheckCircle2, Wrench, XCircle } from "lucide-react";
import type { FacilityEquipmentRow, FacilityEquipmentStatus } from "@modules/hospital-admin/api";

interface EquipmentPanelProps {
  equipment: FacilityEquipmentRow[];
  onUpdateStatus: (id: string, status: FacilityEquipmentStatus) => void;
}

const statusMeta: Record<FacilityEquipmentStatus, { label: string; color: string }> = {
  operational: { label: "Operational", color: "var(--vital-green)" },
  maintenance: { label: "Maintenance", color: "var(--caution-amber)" },
  calibration: { label: "Calibration", color: "var(--caution-amber)" },
  "out-of-service": { label: "Out of Service", color: "var(--pulse-coral)" },
  decommissioned: { label: "Decommissioned", color: "var(--outline)" },
};

/** Module-local — Equipment (spec §26-29): facility infrastructure only (generators/HVAC/elevators/fire alarms/medical gas/electrical panels) — clinical equipment stays owned by Radiology/OT/Laboratory's own Equipment tabs. */
export function EquipmentPanel({ equipment, onUpdateStatus }: EquipmentPanelProps) {
  const operational = equipment.filter((e) => e.status === "operational").length;
  const underMaintenance = equipment.filter((e) => e.status === "maintenance" || e.status === "calibration").length;
  const outOfService = equipment.filter((e) => e.status === "out-of-service").length;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KPICard label="Operational" value={operational} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Under Maintenance" value={underMaintenance} icon={<Wrench size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Out of Service" value={outOfService} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
      </div>

      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Equipment</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Location</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Manufacturer / Model</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Next Service</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {equipment.map((e) => {
                const meta = statusMeta[e.status];
                return (
                  <tr key={e.id}>
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-on-surface">{e.name}</p>
                      <p className="text-xs text-on-surface-variant">{e.assetNumber} · {e.facilityName}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.location}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.manufacturer} {e.model}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.nextServiceDate ?? "—"}</td>
                    <td className="py-2.5">
                      <select
                        value={e.status}
                        onChange={(ev) => onUpdateStatus(e.id, ev.target.value as FacilityEquipmentStatus)}
                        className="rounded-full border-none px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer"
                        style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}
                      >
                        {(Object.keys(statusMeta) as FacilityEquipmentStatus[]).map((s) => (
                          <option key={s} value={s}>{statusMeta[s].label}</option>
                        ))}
                      </select>
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
