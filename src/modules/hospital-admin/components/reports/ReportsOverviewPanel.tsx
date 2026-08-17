import { Users, Stethoscope, Siren, BedDouble, LogOut, FlaskConical, ScanLine, Pill, DollarSign } from "lucide-react";
import { KPICard } from "@shared/design-system/components";
import type { ReportsOverviewData } from "@modules/hospital-admin/api";

interface ReportsOverviewPanelProps {
  data: ReportsOverviewData | null;
}

/** Module-local — Reports Main Dashboard (spec §2): the overall hospital picture, every KPI computed live from the real records every other module owns. */
export function ReportsOverviewPanel({ data }: ReportsOverviewPanelProps) {
  if (!data) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <KPICard label="Today's Patients" value={data.patientsToday} icon={<Users size={14} />} accentColor="var(--signal-indigo)" />
      <KPICard label="OPD Visits" value={data.opdVisitsToday} icon={<Stethoscope size={14} />} accentColor="var(--vital-green)" />
      <KPICard label="Emergency" value={data.emergencyToday} icon={<Siren size={14} />} accentColor="var(--pulse-coral)" />
      <KPICard label="Admissions" value={data.admissionsToday} icon={<BedDouble size={14} />} accentColor="var(--signal-indigo)" />
      <KPICard label="Discharges" value={data.dischargesToday} icon={<LogOut size={14} />} accentColor="var(--vital-green)" />
      <KPICard label="Bed Occupancy" value={`${data.bedOccupancyPercent}%`} icon={<BedDouble size={14} />} accentColor="var(--caution-amber)" />
      <KPICard label="Lab Tests" value={data.labTestsToday} icon={<FlaskConical size={14} />} accentColor="var(--module-lab)" />
      <KPICard label="Radiology" value={data.radiologyToday} icon={<ScanLine size={14} />} accentColor="var(--module-radiology)" />
      <KPICard label="Pharmacy Orders" value={data.pharmacyOrdersToday} icon={<Pill size={14} />} accentColor="var(--module-pharmacy)" />
      <KPICard label="Revenue" value={`$${data.revenueToday.toLocaleString()}`} icon={<DollarSign size={14} />} accentColor="var(--vital-green)" />
    </div>
  );
}
