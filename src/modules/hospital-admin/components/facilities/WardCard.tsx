import { useState } from "react";
import { StatusChip } from "@shared/design-system/components";
import { wardTypeMeta } from "@modules/hospital-admin/components/facilities/WardFormDrawer";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { WardView } from "@modules/hospital-admin/api";

type WardBed = WardView["rooms"][number]["beds"][number];

interface WardCardProps {
  ward: WardView;
  onManage?: () => void;
}

/** Module-local — a ward's physical bed inventory (Facilities › Wards & Beds tab). Read-only bed grid; status changes belong to Bed Management. */
export function WardCard({ ward, onManage }: WardCardProps) {
  const meta = wardTypeMeta[ward.type];
  const allBeds = ward.rooms.flatMap((r) => r.beds);
  const occupied = allBeds.filter((b) => b.status === "occupied").length;
  const [selected, setSelected] = useState<{ bed: WardBed; roomName: string } | null>(null);

  return (
    <div className="relative bg-white rounded-3xl border border-white shadow-soft overflow-hidden flex flex-col">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.accentColor }} />
      <div className="p-6 pl-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `color-mix(in srgb, ${meta.accentColor} 14%, transparent)`, color: meta.accentColor }}
            >
              <meta.icon size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-on-surface leading-snug truncate">{ward.name}</h3>
              <p className="text-sm text-on-surface-variant truncate">
                {ward.floorName}
                {ward.departmentName ? ` · ${ward.departmentName}` : ""}
              </p>
            </div>
          </div>
          <StatusChip tone={ward.status === "active" ? "success" : "neutral"}>{ward.status === "active" ? "Active" : "Closed"}</StatusChip>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Bed Occupancy</p>
            <p className="font-bold text-on-surface text-2xl leading-none">
              {occupied}/{allBeds.length}
            </p>
          </div>
          {onManage && (
            <button
              type="button"
              onClick={onManage}
              className="text-sm font-semibold text-signal-indigo hover:text-signal-indigo-dark transition-colors"
            >
              Manage Ward
            </button>
          )}
        </div>

        {ward.rooms.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic">No rooms configured yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {ward.rooms.map((room) => (
              <div key={room.id}>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1.5">{room.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {room.beds.map((bed) => {
                    const bedMeta = bedStatusMeta[bed.status];
                    const isSelected = selected?.bed.id === bed.id;
                    return (
                      <button
                        key={bed.id}
                        type="button"
                        onClick={() => setSelected(isSelected ? null : { bed, roomName: room.name })}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold text-white transition-all hover:scale-105 ${
                          isSelected ? "ring-2 ring-offset-2 ring-signal-indigo" : ""
                        }`}
                        style={{ backgroundColor: bedMeta.color }}
                      >
                        {bed.identifier.split("-").pop()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div
            className="flex items-center gap-3 rounded-xl border border-line px-4 py-3"
            style={{ backgroundColor: `color-mix(in srgb, ${bedStatusMeta[selected.bed.status].color} 8%, transparent)` }}
          >
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ backgroundColor: bedStatusMeta[selected.bed.status].color }}
            >
              {selected.bed.identifier.split("-").pop()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface truncate">
                {selected.bed.identifier} · {selected.roomName}
              </p>
              <p className="text-xs text-on-surface-variant truncate">
                {bedStatusMeta[selected.bed.status].label}
                {selected.bed.patientName ? ` — ${selected.bed.patientName}` : ""} · {selected.bed.bedTypeName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
