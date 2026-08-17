import { BedDouble } from "lucide-react";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { WardView, BedStatus } from "@modules/hospital-admin/api";

interface WardStatsCardProps {
  ward: WardView;
}

/** Module-local — Bed Management "Wards" tab card, full status breakdown (spec §7). */
export function WardStatsCard({ ward }: WardStatsCardProps) {
  const allBeds = ward.rooms.flatMap((r) => r.beds);
  const counts = allBeds.reduce(
    (acc, b) => {
      acc[b.status] += 1;
      return acc;
    },
    { available: 0, reserved: 0, occupied: 0, cleaning: 0, maintenance: 0, blocked: 0, "out-of-service": 0 } as Record<BedStatus, number>
  );
  const occupancyRate = allBeds.length > 0 ? Math.round((counts.occupied / allBeds.length) * 100) : 0;

  return (
    <div className="relative bg-white rounded-3xl border border-white shadow-soft overflow-hidden p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-signal-indigo-tint text-signal-indigo">
            <BedDouble size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-on-surface leading-snug truncate">{ward.name}</h3>
            <p className="text-xs text-on-surface-variant font-mono">
              {ward.code} · {ward.floorName}
              {ward.departmentName ? ` · ${ward.departmentName}` : ""}
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0"
          style={{
            backgroundColor: ward.status === "active" ? "color-mix(in srgb, var(--vital-green) 14%, transparent)" : "color-mix(in srgb, var(--outline) 14%, transparent)",
            color: ward.status === "active" ? "var(--vital-green)" : "var(--outline)",
          }}
        >
          {ward.status === "active" ? "Active" : "Closed"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 border-y border-line py-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Total Beds</p>
          <p className="text-xl font-bold text-on-surface">{allBeds.length}</p>
        </div>
        {(["occupied", "available", "cleaning", "maintenance"] as const).map((s) => (
          <div key={s}>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">{bedStatusMeta[s].label}</p>
            <p className="text-xl font-bold" style={{ color: bedStatusMeta[s].color }}>
              {counts[s]}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-on-surface-variant font-medium">Occupancy</span>
          <span className="text-on-surface font-bold">{occupancyRate}%</span>
        </div>
        <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${occupancyRate}%`, backgroundColor: bedStatusMeta.occupied.color }}
          />
        </div>
      </div>

      {ward.nurseStation && (
        <p className="text-xs text-on-surface-variant">
          Nurse station: <span className="font-semibold text-on-surface">{ward.nurseStation}</span>
        </p>
      )}
    </div>
  );
}
