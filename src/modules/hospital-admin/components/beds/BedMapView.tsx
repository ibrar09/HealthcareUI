import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { WardView, BedStatus } from "@modules/hospital-admin/api";

interface BedMapViewProps {
  wards: WardView[];
  onSelectBed: (id: string) => void;
}

/** Module-local — the visual Bed Map (spec §8): ward → room → colored bed tiles, click to open details. */
export function BedMapView({ wards, onSelectBed }: BedMapViewProps) {
  const statuses = Object.keys(bedStatusMeta) as BedStatus[];

  return (
    <div className="flex flex-col gap-8 pb-4">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white px-5 py-3 shadow-card">
        {statuses.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md flex-shrink-0" style={{ backgroundColor: bedStatusMeta[s].color }} />
            <span className="text-xs text-on-surface-variant">{bedStatusMeta[s].label}</span>
          </div>
        ))}
      </div>

      {wards.map((ward) => (
        <div key={ward.id}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-on-surface">
              {ward.name.toUpperCase()} <span className="text-on-surface-variant font-medium">— {ward.floorName}</span>
            </h2>
            <div className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ward.rooms.map((room) => (
              <div key={room.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <p className="text-xs font-bold text-on-surface mb-3">{room.name}</p>
                <div className="flex flex-wrap gap-2">
                  {room.beds.map((bed) => {
                    const meta = bedStatusMeta[bed.status];
                    return (
                      <button
                        key={bed.id}
                        type="button"
                        title={`${bed.identifier} — ${meta.label}${bed.patientName ? ` — ${bed.patientName}` : ""}`}
                        onClick={() => onSelectBed(bed.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-[10px] font-bold text-white transition-transform hover:scale-105"
                        style={{ backgroundColor: meta.color }}
                      >
                        {bed.identifier.split("-").pop()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {ward.rooms.length === 0 && <p className="text-xs text-on-surface-variant italic">No rooms configured yet.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
