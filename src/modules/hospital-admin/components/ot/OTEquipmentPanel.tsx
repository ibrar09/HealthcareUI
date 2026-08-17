import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { otEquipmentStatusMeta } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { OTEquipmentRow, OTEquipmentStatus } from "@modules/hospital-admin/api";

const statusCycle: OTEquipmentStatus[] = ["operational", "in-use", "maintenance", "out-of-service"];

interface OTEquipmentPanelProps {
  equipment: OTEquipmentRow[];
  onAdd: () => void;
  onSetStatus: (item: OTEquipmentRow, status: OTEquipmentStatus) => void;
}

/** Module-local — OT Equipment (spec §28): per-item technical/service status, distinct from Rooms' own simple equipment display list. */
export function OTEquipmentPanel({ equipment, onAdd, onSetStatus }: OTEquipmentPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Equipment
        </Button>
      </div>
      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Equipment</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Room</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Last Service</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Next Service</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {equipment.map((e) => {
                const meta = otEquipmentStatusMeta[e.status];
                return (
                  <tr key={e.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{e.name}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.roomNumber ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.lastServiceDate ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.nextServiceDate ?? "—"}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {statusCycle
                          .filter((s) => s !== e.status)
                          .map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => onSetStatus(e, s)}
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold border border-line text-on-surface-variant hover:bg-surface-container-low transition-all"
                            >
                              {otEquipmentStatusMeta[s].label}
                            </button>
                          ))}
                      </div>
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
