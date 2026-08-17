import { Building2, DoorOpen, ClipboardList, AlertOctagon, Wrench, ShieldAlert } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import type { FacilitiesOverviewData, Facility } from "@modules/hospital-admin/api";

interface FacilitiesOverviewPanelProps {
  data: FacilitiesOverviewData | null;
  statuses: { id: string; name: string; status: Facility["status"] }[];
}

const statusMeta: Record<Facility["status"], { label: string; color: string }> = {
  active: { label: "Operational", color: "var(--vital-green)" },
  maintenance: { label: "Maintenance", color: "var(--caution-amber)" },
};

/** Module-local — Facilities Overview (spec §2-3): "What is the physical condition and operational status of the hospital?" Every number computed from the real physical hierarchy + real work orders/equipment/incidents. */
export function FacilitiesOverviewPanel({ data, statuses }: FacilitiesOverviewPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Facilities" value={data.totalFacilities} icon={<Building2 size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Floors" value={data.totalFloors} icon={<DoorOpen size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Operational Rooms" value={data.operationalRooms} unit={`/ ${data.totalRooms}`} icon={<DoorOpen size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Open Work Orders" value={data.openWorkOrders} icon={<ClipboardList size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Critical Issues" value={data.criticalWorkOrders} icon={<AlertOctagon size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Equipment Under Maintenance" value={data.equipmentUnderMaintenance} icon={<Wrench size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Open Incidents" value={data.openIncidents} icon={<ShieldAlert size={14} />} accentColor="var(--pulse-coral)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Facility Status</h2>
        <div className="flex flex-col divide-y divide-line">
          {statuses.map((s) => {
            const meta = statusMeta[s.status];
            return (
              <div key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-semibold text-on-surface">{s.name}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: meta.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
