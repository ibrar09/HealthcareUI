import { Card, KPICard } from "@shared/design-system/components";
import type { HospitalCensusData } from "@modules/hospital-admin/api";

interface HospitalCensusPanelProps {
  data: HospitalCensusData | null;
}

/** Module-local — Hospital Census (spec §4): how many patients are currently in the hospital, right now, by care area. */
export function HospitalCensusPanel({ data }: HospitalCensusPanelProps) {
  if (!data) return null;
  const rows = [
    { label: "OPD", value: data.opd },
    { label: "Emergency", value: data.emergency },
    { label: "IPD", value: data.ipd },
    { label: "ICU", value: data.icu },
    { label: "Observation", value: data.observation },
    { label: "Day Care", value: data.dayCare },
  ];
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Hospital Census</h2>
        <div className="flex flex-col divide-y divide-line">
          {rows.map((r) => (
            <div key={r.label} className="py-2.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-on-surface">{r.label}</span>
              <span className="font-mono font-bold text-lg text-on-surface">{r.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Current Patients" value={data.totalCurrentPatients} accentColor="var(--signal-indigo)" />
        <KPICard label="New Patients Today" value={data.newPatientsToday} accentColor="var(--vital-green)" />
        <KPICard label="Discharged Today" value={data.dischargedToday} accentColor="var(--caution-amber)" />
        <KPICard label="Current Admissions" value={data.currentAdmissions} accentColor="var(--signal-indigo)" />
      </div>
    </div>
  );
}
