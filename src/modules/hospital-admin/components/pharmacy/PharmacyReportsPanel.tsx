import { ClipboardCheck, TrendingUp, XCircle, Clock, DollarSign } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import type { PharmacyReportsData } from "@modules/hospital-admin/api";

interface PharmacyReportsPanelProps {
  data: PharmacyReportsData | null;
}

/** Module-local — Pharmacy Reports (spec §39 Phase 3): dispensing rate, cancellation rate, turnaround, revenue, and stock consumption — all computed from real prescription/stock-transaction records. */
export function PharmacyReportsPanel({ data }: PharmacyReportsPanelProps) {
  if (!data) return null;
  const maxConsumption = Math.max(...data.stockConsumption.map((s) => s.quantity), 1);
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <KPICard label="Total Prescriptions" value={data.totalPrescriptions} icon={<ClipboardCheck size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Dispensing Rate" value={`${data.dispensingRate}%`} icon={<TrendingUp size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Cancellation Rate" value={`${data.cancellationRate}%`} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Avg Turnaround" value={`${data.averageTurnaroundHours}h`} icon={<Clock size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Revenue" value={`$${data.revenueThisMonth.toLocaleString()}`} icon={<DollarSign size={14} />} accentColor="var(--vital-green)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Stock Consumption</h2>
        {data.stockConsumption.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No dispensing activity recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.stockConsumption.map((s) => (
              <div key={s.medicationName}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface font-medium">{s.medicationName}</span>
                  <span className="text-on-surface-variant">{s.quantity}</span>
                </div>
                <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${(s.quantity / maxConsumption) * 100}%`, backgroundColor: "var(--signal-indigo)" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
