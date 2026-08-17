import { DoorOpen, ShieldCheck, Users } from "lucide-react";
import type { RoomView } from "@modules/hospital-admin/api";

const roomTypeLabel: Record<RoomView["type"], string> = {
  private: "Private",
  "semi-private": "Semi-Private",
  general: "General",
  isolation: "Isolation",
};

const genderLabel: Record<RoomView["genderRestriction"], string> = {
  male: "Male only",
  female: "Female only",
  any: "Mixed",
};

interface RoomCardProps {
  room: RoomView;
}

/** Module-local — Bed Management "Rooms" tab card (spec §6). */
export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="relative bg-white rounded-3xl border border-white shadow-soft overflow-hidden p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-signal-indigo-tint text-signal-indigo">
            <DoorOpen size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-on-surface leading-snug truncate">{room.name}</h3>
            <p className="text-xs text-on-surface-variant truncate">
              {room.wardName} ({room.wardCode}) · {room.floorName}
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0"
          style={{
            backgroundColor: room.status === "active" ? "color-mix(in srgb, var(--vital-green) 14%, transparent)" : "color-mix(in srgb, var(--outline) 14%, transparent)",
            color: room.status === "active" ? "var(--vital-green)" : "var(--outline)",
          }}
        >
          {room.status === "active" ? "Active" : "Closed"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant">
          {roomTypeLabel[room.type]}
        </span>
        <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
          <Users size={10} /> {genderLabel[room.genderRestriction]}
        </span>
        {room.isolationCapable && (
          <span className="rounded-full bg-sunset-coral/10 px-2.5 py-1 text-[10px] font-semibold text-sunset-coral flex items-center gap-1">
            <ShieldCheck size={10} /> Isolation-capable
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Capacity</p>
          <p className="text-xl font-bold text-on-surface">{room.capacity}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Occupied</p>
          <p className="text-xl font-bold text-signal-indigo">{room.currentOccupancy}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Available</p>
          <p className="text-xl font-bold text-vital-green">{room.availableBeds}</p>
        </div>
      </div>
    </div>
  );
}
