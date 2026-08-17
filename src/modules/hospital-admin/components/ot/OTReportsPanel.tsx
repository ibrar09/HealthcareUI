import { BarChart3, Clock, XCircle, Siren, AlertTriangle } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import type { OTReportsData } from "@modules/hospital-admin/api";

interface OTReportsPanelProps {
  data: OTReportsData | null;
}

/** Module-local — OT Reports (spec §34): operational figures computed from real case records — surgeries per department/surgeon/room, turnaround, cancellation/emergency rate, complication count from Procedure Documentation. Exact clinical-quality metrics stay a hospital clinical-governance decision, not hardcoded here. */
export function OTReportsPanel({ data }: OTReportsPanelProps) {
  if (!data) return null;
  const maxDept = Math.max(...data.surgeriesPerDepartment.map((d) => d.count), 1);
  const maxSurgeon = Math.max(...data.surgeriesPerSurgeon.map((s) => s.count), 1);
  const maxRoom = Math.max(...data.surgeriesPerRoom.map((r) => r.count), 1);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Cases" value={data.totalCases} icon={<BarChart3 size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Avg Turnaround" value={`${data.averageTurnaroundHours}h`} icon={<Clock size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Cancellation Rate" value={`${data.cancellationRate}%`} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Emergency Rate" value={`${data.emergencyRate}%`} icon={<Siren size={14} />} accentColor="var(--caution-amber)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-caution-amber" /> Complications Recorded
        </h2>
        <p className="text-3xl font-bold text-on-surface">{data.complicationCount}</p>
        <p className="text-xs text-on-surface-variant mt-1">Cases with a non-"None" complication note in Procedure Documentation.</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero>
          <h2 className="text-base font-bold text-on-surface mb-4">Surgeries per Department</h2>
          <div className="flex flex-col gap-3">
            {data.surgeriesPerDepartment.map((d) => (
              <div key={d.department}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{d.department}</span>
                  <span className="text-on-surface-variant">{d.count}</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${(d.count / maxDept) * 100}%`, backgroundColor: "var(--signal-indigo)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hero>
          <h2 className="text-base font-bold text-on-surface mb-4">Surgeries per Surgeon</h2>
          <div className="flex flex-col gap-3">
            {data.surgeriesPerSurgeon.map((s) => (
              <div key={s.surgeon}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{s.surgeon}</span>
                  <span className="text-on-surface-variant">{s.count}</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${(s.count / maxSurgeon) * 100}%`, backgroundColor: "var(--module-radiology)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hero>
          <h2 className="text-base font-bold text-on-surface mb-4">Surgeries per Room</h2>
          <div className="flex flex-col gap-3">
            {data.surgeriesPerRoom.map((r) => (
              <div key={r.room}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{r.room}</span>
                  <span className="text-on-surface-variant">{r.count}</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${(r.count / maxRoom) * 100}%`, backgroundColor: "var(--pulse-coral)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
