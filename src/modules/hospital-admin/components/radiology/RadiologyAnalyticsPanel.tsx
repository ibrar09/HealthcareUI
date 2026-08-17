import { BarChart3, Clock, XCircle, UserX } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { DonutChart } from "@modules/hospital-admin/components/DonutChart";
import type { RadiologyAnalyticsData } from "@modules/hospital-admin/api";

const modalityColors: Record<string, string> = {
  ct: "var(--signal-indigo)",
  mri: "var(--module-radiology)",
  xr: "var(--vital-green)",
  us: "var(--caution-amber)",
  mammography: "var(--sunset-coral)",
  fluoroscopy: "var(--pulse-coral)",
  pet: "var(--signal-indigo-light)",
  spect: "var(--outline)",
  dexa: "var(--module-nursing)",
};

const modalityLabels: Record<string, string> = {
  ct: "CT",
  mri: "MRI",
  xr: "X-Ray",
  us: "Ultrasound",
  mammography: "Mammography",
  fluoroscopy: "Fluoroscopy",
  pet: "PET",
  spect: "SPECT",
  dexa: "DEXA",
};

const reportStatusColors: Record<string, string> = {
  draft: "var(--outline)",
  preliminary: "var(--caution-amber)",
  final: "var(--vital-green)",
  amended: "var(--signal-indigo)",
};

interface RadiologyAnalyticsPanelProps {
  data: RadiologyAnalyticsData | null;
}

/** Module-local — Radiology "Analytics" tab (spec §32): deeper aggregate view than the Dashboard snapshot. Every metric is computed from real order/study/report records, never a decorative number. */
export function RadiologyAnalyticsPanel({ data }: RadiologyAnalyticsPanelProps) {
  if (!data) return null;
  const maxDept = Math.max(...data.volumeByDepartment.map((d) => d.count), 1);
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Orders" value={data.totalOrders} icon={<BarChart3 size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Avg Turnaround" value={`${data.averageTurnaroundHours}h`} icon={<Clock size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Avg Wait" value={`${data.averageWaitMinutes}m`} icon={<Clock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Cancelled / No-Show" value={data.cancelledOrders + data.noShowOrders} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Volume by Modality</h2>
          {data.volumeByModality.length > 0 && (
            <DonutChart centerLabel="orders" data={data.volumeByModality.map((m) => ({ name: modalityLabels[m.modality] ?? m.modality, value: m.count, color: modalityColors[m.modality] ?? "var(--outline)" }))} size={140} />
          )}
        </Card>

        <Card hero className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Report Status</h2>
          {data.reportStatusBreakdown.length > 0 && (
            <DonutChart centerLabel="reports" data={data.reportStatusBreakdown.map((r) => ({ name: r.status, value: r.count, color: reportStatusColors[r.status] ?? "var(--outline)" }))} size={140} />
          )}
        </Card>

        <Card hero className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Modality Utilization</h2>
          <div className="flex flex-col gap-3">
            {data.modalityUtilization.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{m.name}</span>
                  <span className="text-on-surface-variant">{m.utilizationPercent}%</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${m.utilizationPercent}%`, backgroundColor: "var(--module-radiology)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Volume by Ordering Department</h2>
        <div className="flex flex-col gap-3">
          {data.volumeByDepartment.map((d) => (
            <div key={d.department} className="flex items-center gap-3">
              <span className="text-sm text-on-surface w-40 flex-shrink-0 truncate">{d.department}</span>
              <div className="flex-1 bg-surface-container-low rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full" style={{ width: `${(d.count / maxDept) * 100}%`, backgroundColor: "var(--signal-indigo)" }} />
              </div>
              <span className="text-sm font-bold text-on-surface w-8 text-right flex-shrink-0">{d.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <UserX size={16} className="text-pulse-coral" /> Order Outcomes
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-on-surface">{data.completedStudies}</p>
            <p className="text-xs text-on-surface-variant">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-pulse-coral">{data.cancelledOrders}</p>
            <p className="text-xs text-on-surface-variant">Cancelled</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-caution-amber">{data.noShowOrders}</p>
            <p className="text-xs text-on-surface-variant">No-Show</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
