import { Card } from "@shared/design-system/components";
import { consentStatusMeta } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { ConsentStatus } from "@modules/hospital-admin/api";

export interface PreOpWorklistRow {
  id: string;
  caseNumber: string;
  patientName: string;
  procedureName: string;
  surgeonName: string;
  checklistCompletedCount: number;
  checklistTotalCount: number;
  consentStatus?: ConsentStatus;
  anesthesiaAssessed: boolean;
  preOpReady: boolean;
}

interface PreOpPanelProps {
  worklist: PreOpWorklistRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Pre-Operative Dashboard (spec §12): Consent/Checklist/Anesthesia completion at a glance, READY FOR OT vs NOT READY computed from real data, never a manual flag. */
export function PreOpPanel({ worklist, onSelect }: PreOpPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {worklist.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No cases in pre-op workup right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Surgeon</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Consent</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Checklist</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Anesthesia</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {worklist.map((c) => {
                  const consent = c.consentStatus ? consentStatusMeta[c.consentStatus] : { label: "Required", color: "var(--outline)" };
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(c.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.surgeonName}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${consent.color} 16%, transparent)`, color: consent.color }}>
                          {consent.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        {c.checklistCompletedCount}/{c.checklistTotalCount}
                      </td>
                      <td className="py-2.5 pr-3">
                        {c.anesthesiaAssessed ? <span className="text-vital-green font-semibold">✓ Assessed</span> : <span className="text-on-surface-variant">Pending</span>}
                      </td>
                      <td className="py-2.5">
                        {c.preOpReady ? (
                          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-vital-green/14 text-vital-green">READY FOR OT</span>
                        ) : (
                          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-caution-amber/14 text-caution-amber">NOT READY</span>
                        )}
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
