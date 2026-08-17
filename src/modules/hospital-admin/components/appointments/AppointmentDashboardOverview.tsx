import { CalendarClock, Clock, TrendingUp, Users } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { appointmentStatusMeta } from "@modules/hospital-admin/components/appointmentStatusMeta";
import type { AppointmentDashboardData, AppointmentStatus } from "@modules/hospital-admin/api";

const overviewOrder: AppointmentStatus[] = ["confirmed", "checked-in", "in-progress", "completed", "cancelled", "no-show"];

interface AppointmentDashboardOverviewProps {
  data: AppointmentDashboardData;
}

/** Module-local — the Appointments Dashboard tab (spec §1). */
export function AppointmentDashboardOverview({ data }: AppointmentDashboardOverviewProps) {
  const pending = data.byStatus.requested + data.byStatus["pending-confirmation"];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Today's Appointments" value={data.todaysTotal} icon={<CalendarClock size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Waiting Patients" value={data.waitingPatients} icon={<Users size={14} />} accentColor="var(--module-pharmacy)" />
        <KPICard label="Available Slots Today" value={data.availableSlotsToday} icon={<Clock size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Pending Requests" value={data.pendingRequests} icon={<TrendingUp size={14} />} accentColor="var(--caution-amber)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {overviewOrder.map((s) => (
          <Card key={s} accentColor={appointmentStatusMeta[s].color}>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">{appointmentStatusMeta[s].label}</p>
            <p className="text-2xl font-bold" style={{ color: appointmentStatusMeta[s].color }}>
              {data.byStatus[s]}
            </p>
          </Card>
        ))}
        <Card accentColor="var(--outline-variant)">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Pending</p>
          <p className="text-2xl font-bold text-on-surface-variant">{pending}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Doctor Utilization Today</h2>
          <div className="flex flex-col gap-3">
            {data.doctorUtilization.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{d.name}</span>
                  <span className="text-on-surface-variant">
                    {d.booked}/{d.total} booked · {d.utilization}%
                  </span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${d.utilization}%`, backgroundColor: d.utilization >= 100 ? "var(--pulse-coral)" : "var(--signal-indigo)" }}
                  />
                </div>
              </div>
            ))}
            {data.fullyBookedDoctors > 0 && (
              <p className="text-xs text-pulse-coral font-semibold mt-1">
                {data.fullyBookedDoctors} doctor{data.fullyBookedDoctors > 1 ? "s" : ""} fully booked today
              </p>
            )}
          </div>
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Department Utilization Today</h2>
          {data.departmentUtilization.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No appointments booked today yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.departmentUtilization.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium">{d.name}</span>
                    <span className="text-on-surface-variant">{d.utilization}%</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, d.utilization)}%`, backgroundColor: "var(--module-radiology)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
