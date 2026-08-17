import { Card } from "@shared/design-system/components";
import { pacuStatusMeta, formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SurgicalCaseRow, PacuStatus, PacuDestination } from "@modules/hospital-admin/api";

const destinationLabels: Record<PacuDestination, string> = {
  ward: "Ward",
  icu: "ICU",
  hdu: "HDU",
  emergency: "Emergency",
  other: "Other",
};

export interface RecoveryRow extends SurgicalCaseRow {
  pacuStatus?: PacuStatus;
  pacuArrivalAt?: string;
  pacuDestination?: PacuDestination;
}

interface PostOpPanelProps {
  cases: RecoveryRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Post-Operative / Recovery / PACU (spec §24-25): patients whose surgery is done but who haven't left PACU yet. */
export function PostOpPanel({ cases, onSelect }: PostOpPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {cases.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No patients in recovery/PACU right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Arrival Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Anesthesia</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Recovery Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cases.map((c) => {
                  const pacu = c.pacuStatus ? pacuStatusMeta[c.pacuStatus] : { label: "Waiting", color: "var(--outline)" };
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(c.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.pacuArrivalAt ? formatDateTime(c.pacuArrivalAt) : "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.anesthesiaType ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${pacu.color} 16%, transparent)`, color: pacu.color }}>
                          {pacu.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-on-surface-variant">{c.pacuDestination ? destinationLabels[c.pacuDestination] : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
