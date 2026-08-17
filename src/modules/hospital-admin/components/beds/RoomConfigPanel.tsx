import { BedSingle, DoorOpen, Pencil, Plus, Power } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { WardView, RoomView, BedListRow } from "@modules/hospital-admin/api";

interface RoomConfigPanelProps {
  wards: WardView[];
  rooms: RoomView[];
  bedsByRoom: Record<string, BedListRow[]>;
  onAddRoom: () => void;
  onEditRoom: (room: RoomView) => void;
  onAddBed: (roomId: string, roomName: string) => void;
  onEditBed: (bed: BedListRow) => void;
  onDecommissionBed: (bed: BedListRow) => void;
}

/** Module-local — Bed Management Phase 4 Configuration tab, Rooms + Beds section (spec §6-9, §27-29). */
export function RoomConfigPanel({ wards, rooms, bedsByRoom, onAddRoom, onEditRoom, onAddBed, onEditBed, onDecommissionBed }: RoomConfigPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Rooms &amp; Beds</h2>
        <Button size="sm" onClick={onAddRoom} icon={<Plus size={14} />}>
          Add Room
        </Button>
      </div>

      {wards.map((ward) => {
        const wardRooms = rooms.filter((r) => r.wardId === ward.id);
        if (wardRooms.length === 0) return null;
        return (
          <div key={ward.id}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {ward.name} <span className="font-mono normal-case">({ward.code})</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {wardRooms.map((room) => {
                const roomBeds = bedsByRoom[room.id] ?? [];
                return (
                  <Card key={room.id}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-signal-indigo-tint text-signal-indigo">
                          <DoorOpen size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{room.name}</p>
                          <p className="text-[11px] text-on-surface-variant truncate">
                            Capacity {room.capacity} · {room.status === "active" ? "Active" : "Closed"}
                            {room.isolationCapable ? " · Isolation-capable" : ""}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => onEditRoom(room)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex-shrink-0" title="Edit Room">
                        <Pencil size={13} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {roomBeds.map((bed) => {
                        const meta = bedStatusMeta[bed.status];
                        return (
                          <div key={bed.id} className="flex items-center justify-between gap-2 rounded-lg border border-line px-2.5 py-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <BedSingle size={12} className="flex-shrink-0 text-on-surface-variant" />
                              <span className="text-xs font-semibold text-on-surface truncate">{bed.identifier}</span>
                              <span className="text-[10px] text-on-surface-variant truncate">{bed.bedTypeName}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                                {meta.label}
                              </span>
                              <button type="button" onClick={() => onEditBed(bed)} className="p-1 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface" title="Edit Bed">
                                <Pencil size={11} />
                              </button>
                              {bed.status === "available" && (
                                <button type="button" onClick={() => onDecommissionBed(bed)} className="p-1 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-pulse-coral" title="Decommission Bed">
                                  <Power size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {roomBeds.length === 0 && <p className="text-xs text-on-surface-variant py-1">No beds in this room yet.</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddBed(room.id, room.name)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-xs font-semibold text-on-surface-variant hover:border-signal-indigo hover:text-signal-indigo transition-all"
                    >
                      <Plus size={12} /> Add Bed
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
