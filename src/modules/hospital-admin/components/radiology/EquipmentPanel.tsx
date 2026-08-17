import { Wrench, ShieldCheck, CalendarClock, AlertOctagon, CheckCircle2 } from "lucide-react";
import { Card, KPICard, Button } from "@shared/design-system/components";
import { modalityStatusMeta } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { EquipmentRow, MaintenanceDashboardData, MaintenanceEvent } from "@modules/hospital-admin/api";

const bucketMeta: Record<string, { label: string; color: string }> = {
  overdue: { label: "Overdue", color: "var(--pulse-coral)" },
  "due-today": { label: "Due Today", color: "var(--caution-amber)" },
  "due-this-week": { label: "Due This Week", color: "var(--signal-indigo)" },
  upcoming: { label: "Upcoming", color: "var(--outline)" },
};

interface EquipmentPanelProps {
  equipment: EquipmentRow[];
  maintenance: MaintenanceDashboardData | null;
  onLogMaintenance: (modalityId: string) => void;
}

/** Module-local — Radiology "Equipment" tab (spec §28-29): service-history/warranty view of the same registry Modalities configures, plus a Maintenance scheduling dashboard computed from each modality's own nextMaintenance date. */
export function EquipmentPanel({ equipment, maintenance, onLogMaintenance }: EquipmentPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {maintenance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label="Overdue" value={maintenance.overdue} icon={<AlertOctagon size={14} />} accentColor="var(--pulse-coral)" />
          <KPICard label="Due Today" value={maintenance.dueToday} icon={<CalendarClock size={14} />} accentColor="var(--caution-amber)" />
          <KPICard label="Due This Week" value={maintenance.dueThisWeek} icon={<Wrench size={14} />} accentColor="var(--signal-indigo)" />
          <KPICard label="Completed (log)" value={maintenance.completed} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
        </div>
      )}

      {maintenance && (
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Maintenance Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Equipment</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Next Maintenance</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {maintenance.upcoming.map((u) => {
                  const meta = bucketMeta[u.bucket];
                  return (
                    <tr key={u.modalityId}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{u.modalityName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{u.nextMaintenance}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipment.map((e) => {
          const meta = modalityStatusMeta[e.status];
          return (
            <Card key={e.id} hero accentColor={meta.color}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span>{meta.dot}</span> {e.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {e.manufacturer} {e.model} · SN {e.serialNumber}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onLogMaintenance(e.id)} icon={<Wrench size={12} />}>
                  Log Service
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Room</p>
                  <p className="font-semibold text-on-surface">{e.roomNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Installed</p>
                  <p className="font-semibold text-on-surface">{e.installationDate}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant flex items-center gap-1">
                    <ShieldCheck size={11} /> Warranty
                  </p>
                  <p className="font-semibold text-on-surface">{e.warrantyExpiration}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Next Maintenance</p>
                  <p className="font-semibold text-on-surface">{e.nextMaintenance}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1.5">Service History</p>
                {e.serviceHistory.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No service events logged yet.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {e.serviceHistory.map((h: MaintenanceEvent) => (
                      <div key={h.id} className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant capitalize">{h.type}</span>
                        <span className="text-on-surface font-medium">{h.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
