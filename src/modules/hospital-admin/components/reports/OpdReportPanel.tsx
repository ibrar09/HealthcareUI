import { Card, KPICard } from "@shared/design-system/components";
import type { OpdReportData } from "@modules/hospital-admin/api";

interface OpdReportPanelProps {
  data: OpdReportData | null;
}

/** Module-local — OPD Reports (spec §7-8): visits, new vs. follow-up, department breakdown, no-show/cancellation. */
export function OpdReportPanel({ data }: OpdReportPanelProps) {
  if (!data) return null;
  const noShowRate = data.totalVisits ? Math.round((data.noShows / data.totalVisits) * 100) : 0;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KPICard label="Total OPD Visits" value={data.totalVisits} accentColor="var(--signal-indigo)" />
        <KPICard label="New Patient Visits" value={data.newPatientVisits} accentColor="var(--vital-green)" />
        <KPICard label="Follow-up Visits" value={data.followUpVisits} accentColor="var(--signal-indigo)" />
        <KPICard label="Walk-ins" value={data.walkIns} accentColor="var(--caution-amber)" />
        <KPICard label="No-Show Rate" value={`${noShowRate}%`} accentColor="var(--pulse-coral)" />
        <KPICard label="Cancelled" value={data.cancelled} accentColor="var(--pulse-coral)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Visits by Department</h2>
        <div className="flex flex-col gap-2.5">
          {data.byDepartment.map((row) => {
            const max = Math.max(...data.byDepartment.map((r) => r.count), 1);
            return (
              <div key={row.departmentName} className="flex items-center gap-3">
                <span className="w-40 flex-shrink-0 text-xs font-semibold text-on-surface-variant">{row.departmentName}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(row.count / max) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-mono font-bold text-on-surface">{row.count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Booking Source</h2>
        <div className="flex flex-col divide-y divide-line">
          {data.bySource.map((row) => (
            <div key={row.source} className="py-2 flex items-center justify-between text-sm">
              <span className="text-on-surface font-semibold capitalize">{row.source.replace(/-/g, " ")}</span>
              <span className="font-mono font-bold text-on-surface">{row.count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
