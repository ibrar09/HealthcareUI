import { ClipboardList, Clock, CheckCircle2, PackageCheck, AlertTriangle, PackageX, CalendarClock, ShieldAlert, DollarSign, RefreshCw, Hourglass, XCircle, Undo2, Split } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import { DonutChart } from "@modules/hospital-admin/components/DonutChart";
import type { PharmacyDashboardData } from "@modules/hospital-admin/api";

interface PharmacyDashboardPanelProps {
  data: PharmacyDashboardData | null;
}

/** Module-local — Pharmacy Dashboard (spec §1): every KPI computed from real prescription/inventory records, never a decorative number. */
export function PharmacyDashboardPanel({ data }: PharmacyDashboardPanelProps) {
  if (!data) return null;
  const maxDay = Math.max(...data.prescriptionsByDay.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <KPICard label="Prescriptions Today" value={data.prescriptionsToday} icon={<ClipboardList size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Pending" value={data.pendingPrescriptions} icon={<Clock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="In Verification" value={data.inVerification} icon={<Hourglass size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Ready" value={data.readyForDispensing} icon={<PackageCheck size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Dispensed Today" value={data.dispensedToday} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Partially Dispensed" value={data.partiallyDispensed} icon={<Split size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Cancelled" value={data.cancelled} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <KPICard label="Returned" value={data.returned} icon={<Undo2 size={14} />} accentColor="var(--outline)" />
        <KPICard label="Low Stock" value={data.lowStock} icon={<AlertTriangle size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Out of Stock" value={data.outOfStock} icon={<PackageX size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Expiring Soon" value={data.expiringSoon} icon={<CalendarClock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Controlled Alerts" value={data.controlledAlerts} icon={<ShieldAlert size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Inventory Value" value={`$${data.inventoryValue.toLocaleString()}`} icon={<DollarSign size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Pending Refills" value={data.pendingRefillRequests} icon={<RefreshCw size={14} />} accentColor="var(--module-radiology)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero className="lg:col-span-2">
          <h2 className="text-lg font-bold text-on-surface mb-4">Prescriptions by Day</h2>
          <div className="flex items-end gap-2 h-40">
            {data.prescriptionsByDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md" style={{ height: `${(d.count / maxDay) * 120}px`, backgroundColor: "var(--signal-indigo)", minHeight: "4px" }} />
                <span className="text-[10px] text-on-surface-variant">{d.date.slice(5)}</span>
                <span className="text-xs font-bold text-on-surface">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Department-wise Prescriptions</h2>
          {data.departmentWisePrescriptions.length > 0 && (
            <DonutChart centerLabel="Rx" data={data.departmentWisePrescriptions.map((d, i) => ({ name: d.department, value: d.count, color: ["var(--signal-indigo)", "var(--module-radiology)", "var(--vital-green)", "var(--caution-amber)", "var(--pulse-coral)"][i % 5] }))} size={140} />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Top Medicines Dispensed</h2>
          {data.topMedicationsDispensed.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-6 text-center">No dispensing activity yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.topMedicationsDispensed.map((m) => {
                const max = Math.max(...data.topMedicationsDispensed.map((x) => x.count), 1);
                return (
                  <div key={m.medicationName}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface font-medium">{m.medicationName}</span>
                      <span className="text-on-surface-variant">{m.count}</span>
                    </div>
                    <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 rounded-full" style={{ width: `${(m.count / max) * 100}%`, backgroundColor: "var(--vital-green)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Turnaround Time</h2>
          <p className="text-3xl font-bold text-on-surface">{data.averageTurnaroundHours}h</p>
          <p className="text-xs text-on-surface-variant mt-1">Average time from prescription to dispensing, across dispensed prescriptions.</p>
        </Card>
      </div>
    </div>
  );
}
