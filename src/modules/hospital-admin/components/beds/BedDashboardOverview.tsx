import { BedDouble, CalendarClock, ShieldAlert, TrendingUp, Users, Wrench } from "lucide-react";
import { Card, KPICard, TrendAreaChart } from "@shared/design-system/components";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { BedDashboardData, BedStatus } from "@modules/hospital-admin/api";

function labelTrend(trend: number[]) {
  const end = new Date(2026, 7, 14);
  return trend.map((value, i) => {
    const daysAgo = trend.length - 1 - i;
    const date = new Date(end);
    date.setDate(date.getDate() - daysAgo);
    return { label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value };
  });
}

const statusOrder: BedStatus[] = ["available", "occupied", "reserved", "cleaning", "maintenance", "blocked", "out-of-service"];

interface BedDashboardOverviewProps {
  data: BedDashboardData;
}

/** Module-local — the Bed Management Dashboard tab (spec §1): the full metric/breakdown set. */
export function BedDashboardOverview({ data }: BedDashboardOverviewProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Beds" value={data.total} icon={<BedDouble size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Occupancy Rate" value={data.occupancyRate} unit="%" icon={<TrendingUp size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Admissions Today" value={data.admissionsToday} icon={<Users size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Isolation Beds" value={data.isolationBeds} icon={<ShieldAlert size={14} />} accentColor="var(--sunset-coral)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {statusOrder.map((s) => (
          <Card key={s} accentColor={bedStatusMeta[s].color}>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">{bedStatusMeta[s].label}</p>
            <p className="text-2xl font-bold" style={{ color: bedStatusMeta[s].color }}>
              {data.byStatus[s]}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero className="lg:col-span-2">
          <h2 className="text-lg font-bold text-on-surface mb-4">Occupancy Trend</h2>
          <TrendAreaChart data={labelTrend(data.occupancyTrend)} color="var(--signal-indigo)" height={220} valueFormatter={(v) => `${v}%`} />
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <CalendarClock size={16} className="text-signal-indigo" /> Expected Discharges Today
          </h2>
          {data.expectedDischargesToday.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No discharges expected today.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.expectedDischargesToday.map((d) => (
                <div key={d.bedIdentifier} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{d.patientName}</p>
                    <p className="text-xs text-on-surface-variant truncate">{d.wardName}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-on-surface-variant flex-shrink-0">{d.bedIdentifier}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Available Beds by Department</h2>
          <div className="flex flex-col gap-3">
            {data.byDepartment.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{d.name}</span>
                  <span className="text-on-surface-variant">
                    {d.available}/{d.total} available
                  </span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${d.total > 0 ? (d.available / d.total) * 100 : 0}%`, backgroundColor: "var(--vital-green)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hero className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Occupied Beds by Ward</h2>
          <div className="flex flex-col gap-3">
            {data.byWard.map((w) => (
              <div key={w.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{w.name}</span>
                  <span className="text-on-surface-variant">{w.occupancyRate}%</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${w.occupancyRate}%`, backgroundColor: "var(--signal-indigo)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hero className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Wrench size={16} className="text-pulse-coral" /> Operational Notes
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Beds under maintenance</span>
              <span className="font-bold text-on-surface">{data.bedsUnderMaintenance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Available — male-restricted</span>
              <span className="font-bold text-on-surface">{data.genderAvailability.male}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Available — female-restricted</span>
              <span className="font-bold text-on-surface">{data.genderAvailability.female}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Available — mixed/any</span>
              <span className="font-bold text-on-surface">{data.genderAvailability.any}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
