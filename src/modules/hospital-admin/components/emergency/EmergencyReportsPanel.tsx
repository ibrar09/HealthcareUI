import { Card, KPICard } from "@shared/design-system/components";
import { arrivalModeLabels, statusPillStyle } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyReportsData } from "@modules/hospital-admin/api";

interface EmergencyReportsPanelProps {
  data: EmergencyReportsData | null;
}

/** Module-local — Emergency Reports (spec §24): operational, capacity, and clinical/quality indicators computed from real visit records. */
export function EmergencyReportsPanel({ data }: EmergencyReportsPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Visits" value={data.visitsTotal} accentColor="var(--pulse-coral)" />
        <KPICard label="Admission Rate" value={`${data.admissionRate}%`} accentColor="var(--signal-indigo)" />
        <KPICard label="Discharge Rate" value={`${data.dischargeRate}%`} accentColor="var(--vital-green)" />
        <KPICard label="Transfer Rate" value={`${data.transferRate}%`} accentColor="var(--module-radiology)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Left Without Treatment" value={`${data.leftWithoutTreatmentRate}%`} accentColor="var(--pulse-coral)" />
        <KPICard label="Bay Utilization" value={`${data.bayUtilizationPercent}%`} accentColor="var(--caution-amber)" />
        <KPICard label="Door-to-Triage" value={data.averageDoorToTriageMinutes} unit="min" accentColor="var(--signal-indigo)" />
        <KPICard label="Door-to-Doctor" value={data.averageDoorToDoctorMinutes} unit="min" accentColor="var(--signal-indigo)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Triage Distribution</h2>
          {data.triageDistribution.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4">No triaged visits yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.triageDistribution.map((row) => {
                const max = Math.max(...data.triageDistribution.map((r) => r.count), 1);
                return (
                  <div key={row.categoryName} className="flex items-center gap-3">
                    <span className="w-28 flex-shrink-0 text-xs font-semibold text-on-surface-variant">{row.categoryName}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(row.count / max) * 100}%`, backgroundColor: row.color }} />
                    </div>
                    <span className="w-8 text-right text-xs font-mono font-bold text-on-surface">{row.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Arrival Mode</h2>
          <div className="flex flex-col divide-y divide-line">
            {data.arrivalModeDistribution.map((row) => (
              <div key={row.mode} className="py-2 flex items-center justify-between text-sm">
                <span className="text-on-surface font-semibold">{arrivalModeLabels[row.mode]}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle("var(--signal-indigo)")}>{row.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
