import { Card } from "@shared/design-system/components";
import type { PatientVolumePoint } from "@modules/hospital-admin/api";

interface PatientVolumePanelProps {
  points: PatientVolumePoint[];
}

/** Module-local — Patient Volume (spec §5): real registration/OPD/ED-arrival dates bucketed by day, never a fabricated series. */
export function PatientVolumePanel({ points }: PatientVolumePanelProps) {
  const max = Math.max(...points.map((p) => p.newPatients + p.opdVisits + p.emergencyVisits), 1);
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Patient Volume</h2>
        {points.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No dated activity recorded yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {points.map((p) => {
              const total = p.newPatients + p.opdVisits + p.emergencyVisits;
              return (
                <div key={p.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col-reverse rounded-t-md overflow-hidden" style={{ height: `${Math.max((total / max) * 100, 4)}%` }}>
                    <div style={{ height: `${(p.newPatients / (total || 1)) * 100}%`, backgroundColor: "var(--vital-green)" }} />
                    <div style={{ height: `${(p.opdVisits / (total || 1)) * 100}%`, backgroundColor: "var(--signal-indigo)" }} />
                    <div style={{ height: `${(p.emergencyVisits / (total || 1)) * 100}%`, backgroundColor: "var(--pulse-coral)" }} />
                  </div>
                  <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{p.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--vital-green)" }} /> New Patients</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--signal-indigo)" }} /> OPD Visits</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--pulse-coral)" }} /> Emergency Visits</span>
        </div>
      </Card>
    </div>
  );
}
