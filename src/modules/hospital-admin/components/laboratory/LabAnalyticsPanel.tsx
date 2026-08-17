import { Beaker, Gauge, TrendingUp } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { labPriorityMeta } from "@modules/hospital-admin/components/laboratory/labStatusMeta";
import type { LabAnalyticsData } from "@modules/hospital-admin/api";

interface LabAnalyticsPanelProps {
  data: LabAnalyticsData;
}

/** Module-local — Laboratory "Analytics" tab: turnaround-time compliance against an international lab-quality benchmark (CLSI/ISO 15189 style), specimen rejection rate, critical-result rate, and category volume. */
export function LabAnalyticsPanel({ data }: LabAnalyticsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Specimen Rejection Rate" value={data.rejectionRate} unit="%" icon={<Beaker size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Critical Result Rate" value={data.criticalRate} unit="%" icon={<Gauge size={14} />} accentColor="var(--pulse-coral)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
          <TrendingUp size={16} className="text-signal-indigo" /> Turnaround Time vs. Target
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          Order → final result, verified orders only. Targets follow a CLSI/ISO 15189-style benchmark by priority (STAT 3h, Urgent 6h, Routine 24h).
        </p>
        <div className="flex flex-col gap-4">
          {data.tatByPriority.map((t) => {
            const meta = labPriorityMeta[t.priority];
            const withinTarget = t.avgHours > 0 && t.avgHours <= t.targetHours;
            const pct = t.avgHours === 0 ? 0 : Math.min(100, (t.avgHours / t.targetHours) * 100);
            return (
              <div key={t.priority}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <span className={`font-bold ${t.avgHours === 0 ? "text-on-surface-variant" : withinTarget ? "text-vital-green" : "text-pulse-coral"}`}>
                    {t.avgHours === 0 ? "No verified orders yet" : `${t.avgHours}h avg (target ${t.targetHours}h)`}
                  </span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: withinTarget ? "var(--vital-green)" : "var(--pulse-coral)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Order Volume by Category</h2>
        <div className="flex flex-col gap-3">
          {data.byCategory.map((c) => {
            const max = Math.max(...data.byCategory.map((x) => x.orders), 1);
            return (
              <div key={c.category}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium capitalize">{c.category}</span>
                  <span className="text-on-surface-variant">{c.orders}</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${(c.orders / max) * 100}%`, backgroundColor: "var(--module-lab)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
