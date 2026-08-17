import { DoorOpen, Pencil, Plus, Power } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { modalityStatusMeta } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { RoomRow } from "@modules/hospital-admin/api";

interface RoomsPanelProps {
  rooms: RoomRow[];
  onAdd: () => void;
  onEdit: (room: RoomRow) => void;
  onToggleStatus: (room: RoomRow) => void;
}

/** Module-local — Radiology "Rooms" tab (spec §14): Room → Modality, capacity/status/assigned staff/operating hours. */
export function RoomsPanel({ rooms, onAdd, onEdit, onToggleStatus }: RoomsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((r) => {
          const modMeta = r.modalityStatus ? modalityStatusMeta[r.modalityStatus] : undefined;
          return (
            <Card key={r.id} hero className={r.status === "closed" ? "opacity-50" : undefined}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 bg-signal-indigo-tint text-signal-indigo">
                    <DoorOpen size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">
                      Room {r.number} {r.status === "closed" && <span className="text-xs font-normal text-on-surface-variant">(Closed)</span>}
                    </h3>
                    <p className="text-xs text-on-surface-variant">{r.location}</p>
                  </div>
                </div>
                <button type="button" onClick={() => onEdit(r)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                  <Pencil size={14} />
                </button>
              </div>

              {r.modalityName && (
                <div className="mb-3 pl-4 border-l-2 border-line">
                  <p className="text-sm font-semibold text-on-surface">{r.modalityName}</p>
                  {modMeta && (
                    <p className="text-xs" style={{ color: modMeta.color }}>
                      {modMeta.dot} {modMeta.label}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Capacity</p>
                  <p className="text-sm font-semibold text-on-surface">{r.capacity}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Operating Hours</p>
                  <p className="text-sm font-semibold text-on-surface">{r.operatingHours}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Assigned Staff</p>
                <p className="text-sm text-on-surface">{r.assignedStaffNames.length > 0 ? r.assignedStaffNames.join(", ") : "Unassigned"}</p>
              </div>

              <Button variant="outline" size="sm" onClick={() => onToggleStatus(r)} icon={<Power size={12} />}>
                {r.status === "active" ? "Close Room" : "Reopen Room"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
