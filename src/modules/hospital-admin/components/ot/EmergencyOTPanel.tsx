import { Siren } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { surgicalCaseStatusMeta, formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SurgicalCaseRow } from "@modules/hospital-admin/api";

interface EmergencyOTPanelProps {
  cases: SurgicalCaseRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Emergency Surgery dashboard (spec §27): visually obvious, but every case here still goes through the same controlled status flow and audit trail as an elective one — no shortcut authorization path. */
export function EmergencyOTPanel({ cases, onSelect }: EmergencyOTPanelProps) {
  return (
    <div className="pb-8">
      <Card hero accentColor="var(--pulse-coral)">
        <div className="flex items-center gap-2 mb-4">
          <Siren size={18} className="text-pulse-coral" />
          <h2 className="text-lg font-bold text-on-surface">Active Emergency Cases</h2>
        </div>
        {cases.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No active emergency cases right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Surgeon</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Anesthesia</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">OT</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cases.map((c) => {
                  const status = surgicalCaseStatusMeta[c.status];
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(c.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.surgeonName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.anesthesiaType ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.roomNumber ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.scheduledDateTime ? formatDateTime(c.scheduledDateTime) : "—"}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${status.color} 16%, transparent)`, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
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
