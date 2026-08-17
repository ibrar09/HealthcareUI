import { Card } from "@shared/design-system/components";
import { surgicalCaseStatusMeta } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SurgicalCaseRow, AnesthesiaAssessment } from "@modules/hospital-admin/api";

export interface AnesthesiaWorklistRow extends SurgicalCaseRow {
  anesthesiaAssessment?: AnesthesiaAssessment;
}

interface AnesthesiaPanelProps {
  worklist: AnesthesiaWorklistRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Anesthesia Dashboard (spec §15): every active case's anesthesia type/ASA class/assessment status. Clinical judgment stays with the anesthesia professional — this only tracks what's on file. */
export function AnesthesiaPanel({ worklist, onSelect }: AnesthesiaPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {worklist.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No active cases need anesthesia review right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">OT</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Anesthesia Type</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">ASA Class</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Assessment</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Case Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {worklist.map((c) => {
                  const status = surgicalCaseStatusMeta[c.status];
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(c.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.roomNumber ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.anesthesiaType ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.anesthesiaAssessment?.asaClass ? `ASA ${c.anesthesiaAssessment.asaClass}` : "—"}</td>
                      <td className="py-2.5 pr-3">
                        {c.anesthesiaAssessment?.completedAt ? <span className="text-vital-green font-semibold">✓ Complete</span> : <span className="text-caution-amber font-semibold">Pending</span>}
                      </td>
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
