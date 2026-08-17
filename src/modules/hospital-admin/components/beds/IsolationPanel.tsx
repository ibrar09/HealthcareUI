import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { IsolationBedRow, BedListRow } from "@modules/hospital-admin/api";

const isolationTypeLabel: Record<string, string> = {
  contact: "Contact",
  droplet: "Droplet",
  airborne: "Airborne",
  protective: "Protective",
  other: "Other",
};

interface IsolationPanelProps {
  activeIsolation: IsolationBedRow[];
  totalIsolationCapableRooms: number;
  totalIsolationCapableBeds: number;
  availableIsolationCapableBeds: BedListRow[];
  onSelectBed: (bedId: string) => void;
}

/** Module-local — Bed Management Phase 3 Isolation tab (spec §19-20): active precautions + isolation-capable inventory. */
export function IsolationPanel({ activeIsolation, totalIsolationCapableRooms, totalIsolationCapableBeds, availableIsolationCapableBeds, onSelectBed }: IsolationPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Beds Under Precaution" value={activeIsolation.length} icon={<ShieldAlert size={14} />} accentColor="var(--sunset-coral)" />
        <KPICard label="Isolation-Capable Rooms" value={totalIsolationCapableRooms} icon={<ShieldCheck size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Isolation-Capable Beds" value={totalIsolationCapableBeds} icon={<ShieldCheck size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Available Now" value={availableIsolationCapableBeds.length} icon={<ShieldCheck size={14} />} accentColor="var(--vital-green)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Active Isolation Precautions</h2>
        {activeIsolation.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No beds currently under isolation precaution.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeIsolation.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBed(b.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left hover:bg-surface-container-low transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface truncate">{b.patientName ?? "—"}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {b.identifier} · {b.wardName} / {b.roomName}
                    {!b.isolationCapableRoom && <span className="text-caution-amber font-semibold"> · Room not isolation-rated</span>}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--sunset-coral) 16%, transparent)", color: "var(--sunset-coral)" }}
                >
                  {isolationTypeLabel[b.isolationType ?? "other"] ?? "Required"}
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Available Isolation-Capable Beds</h2>
        {availableIsolationCapableBeds.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No isolation-capable beds are currently available.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {availableIsolationCapableBeds.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBed(b.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left hover:bg-surface-container-low transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{b.identifier}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {b.wardName} / {b.roomName} · {b.bedTypeName}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${bedStatusMeta.available.color} 16%, transparent)`, color: bedStatusMeta.available.color }}
                >
                  Available
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
