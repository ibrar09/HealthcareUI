import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SpecimenRow } from "@modules/hospital-admin/api";

const labelStatusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "var(--caution-amber)" },
  labeled: { label: "Labeled", color: "var(--vital-green)" },
};

const pathologyStatusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "var(--outline)" },
  sent: { label: "Sent", color: "var(--signal-indigo)" },
  "in-progress": { label: "In Progress", color: "var(--caution-amber)" },
  resulted: { label: "Resulted", color: "var(--vital-green)" },
};

interface SpecimensPanelProps {
  specimens: SpecimenRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Specimen Management (spec §20): Specimen → Label → Collection → Pathology → Result, view-only for the result itself (pathology owns that content, not OT). */
export function SpecimensPanel({ specimens, onSelect }: SpecimensPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {specimens.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No specimens collected yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Specimen ID</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Case</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Type</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Collected</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Label</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Pathology</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {specimens.map((s) => {
                  const label = labelStatusMeta[s.labelStatus];
                  const pathology = pathologyStatusMeta[s.pathologyStatus];
                  return (
                    <tr key={s.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(s.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{s.specimenId}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{s.caseNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{s.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{s.type}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{formatDateTime(s.collectionTime)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${label.color} 16%, transparent)`, color: label.color }}>
                          {label.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${pathology.color} 16%, transparent)`, color: pathology.color }}>
                          {pathology.label}
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
