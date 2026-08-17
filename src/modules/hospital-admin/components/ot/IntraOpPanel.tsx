import { Card } from "@shared/design-system/components";
import { surgicalCaseStatusMeta } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SurgicalCaseRow } from "@modules/hospital-admin/api";

interface IntraOpPanelProps {
  cases: SurgicalCaseRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Intra-Operative live case screen (spec §17): every case at or past Ready for OT, shown as a control-center card, not a passive table row. */
export function IntraOpPanel({ cases, onSelect }: IntraOpPanelProps) {
  if (cases.length === 0) {
    return (
      <Card hero>
        <p className="text-center text-sm text-on-surface-variant py-12">No cases currently in the OT pipeline (Ready for OT through Surgery in Progress).</p>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
      {cases.map((c) => {
        const status = surgicalCaseStatusMeta[c.status];
        return (
          <Card key={c.id} hero accentColor={status.color} className="cursor-pointer" onClick={() => onSelect(c.id)}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{c.caseNumber}</span>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${status.color} 16%, transparent)`, color: status.color }}>
                {status.label.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Patient</p>
                <p className="text-sm font-bold text-on-surface">{c.patientName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Procedure</p>
                <p className="text-sm font-bold text-on-surface truncate">{c.procedureName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Surgeon</p>
                <p className="text-sm font-semibold text-on-surface">{c.surgeonName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">OT</p>
                <p className="text-sm font-semibold text-on-surface">{c.roomNumber ?? "—"}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
