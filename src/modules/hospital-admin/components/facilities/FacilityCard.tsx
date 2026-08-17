import { Activity, BedDouble, Building2, LayoutGrid, MapPin, Stethoscope, Users } from "lucide-react";
import { StatusChip } from "@shared/design-system/components";

interface FacilityCardProps {
  name: string;
  type: "campus" | "clinic" | "diagnostic";
  address: string;
  beds: number;
  occupiedBeds: number;
  staff: number;
  departments: number;
  status: "active" | "maintenance";
  accentColor: string;
  onManage?: () => void;
}

const typeMeta = {
  campus: { label: "Hospital Campus", icon: Building2 },
  clinic: { label: "Clinic", icon: Stethoscope },
  diagnostic: { label: "Diagnostic Center", icon: Activity },
};

const stat = (icon: React.ReactNode, value: string | number, label: string) => (
  <div className="flex flex-col items-center gap-1 flex-1">
    <span className="text-on-surface-variant">{icon}</span>
    <span className="text-lg font-bold text-on-surface leading-none">{value}</span>
    <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">{label}</span>
  </div>
);

/** Module-local — the Facilities grid card. Only this screen needs it right now. */
export function FacilityCard({
  name,
  type,
  address,
  beds,
  occupiedBeds,
  staff,
  departments,
  status,
  accentColor,
  onManage,
}: FacilityCardProps) {
  const occupancyPercent = beds > 0 ? Math.round((occupiedBeds / beds) * 100) : null;
  const TypeIcon = typeMeta[type].icon;

  return (
    <div className="relative bg-white rounded-3xl border border-white shadow-soft overflow-hidden flex flex-col">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl"
        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 22%, transparent)` }}
      />
      <div
        className="h-1.5 w-full flex-shrink-0"
        style={{ backgroundImage: `linear-gradient(90deg, ${accentColor}, color-mix(in srgb, ${accentColor} 40%, transparent))` }}
      />
      <div className="p-6 flex flex-col gap-5 z-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-on-surface leading-snug">{name}</h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs font-medium" style={{ color: accentColor }}>
              <TypeIcon size={12} />
              {typeMeta[type].label}
            </div>
          </div>
          <StatusChip tone={status === "active" ? "success" : "warning"}>
            {status === "active" ? "Active" : "Maintenance"}
          </StatusChip>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="truncate">{address}</span>
        </div>

        <div className="flex items-center border-y border-line py-4">
          {stat(<BedDouble size={16} />, beds, "Beds")}
          <div className="h-8 w-px bg-line" />
          {stat(<Users size={16} />, staff >= 1000 ? `${(staff / 1000).toFixed(1)}k` : staff, "Staff")}
          <div className="h-8 w-px bg-line" />
          {stat(<LayoutGrid size={16} />, departments, "Depts")}
        </div>

        {occupancyPercent !== null ? (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-on-surface-variant font-medium">Bed Occupancy</span>
              <span className="text-on-surface font-bold">{occupancyPercent}%</span>
            </div>
            <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${occupancyPercent}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-on-surface-variant italic">Outpatient only — no inpatient beds</div>
        )}

        <button
          type="button"
          onClick={onManage}
          className="mt-1 w-full rounded-xl border border-line py-2.5 text-sm font-semibold text-signal-indigo hover:bg-signal-indigo-tint transition-colors"
        >
          Manage Facility
        </button>
      </div>
    </div>
  );
}
