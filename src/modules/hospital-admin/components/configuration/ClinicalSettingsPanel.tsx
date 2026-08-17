import { ExternalLink } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { ClinicalSettingsLink, NursingShiftType, NursingRatioConfig } from "@modules/hospital-admin/api";

interface ClinicalSettingsPanelProps {
  links: ClinicalSettingsLink[];
  specialties: string[];
  shiftTypes: NursingShiftType[];
  ratios: NursingRatioConfig[];
}

/** Module-local — Clinical module settings (spec §9-13, §15-16): every clinical module already owns its own real Settings tab — this is a directory, never a duplicate. Nursing shifts/ratios and the specialty catalog are the only genuinely new items with no other home. */
export function ClinicalSettingsPanel({ links, specialties, shiftTypes, ratios }: ClinicalSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-1">Clinical Module Settings</h2>
        <p className="text-xs text-on-surface-variant mb-4">Each module owns its own configuration end to end — jump directly to it rather than duplicating it here.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((link) => (
            <a key={link.module} href={link.route} className="flex items-center justify-between rounded-card border border-line p-3.5 hover:border-signal-indigo transition-colors">
              <div>
                <p className="text-sm font-bold text-on-surface">{link.module}</p>
                <p className="text-xs text-on-surface-variant">{link.description}</p>
              </div>
              <ExternalLink size={14} className="text-on-surface-variant flex-shrink-0" />
            </a>
          ))}
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Medical Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <span key={s} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">{s}</span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Nursing Shift Types</h2>
          <div className="flex flex-col divide-y divide-line">
            {shiftTypes.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface">{s.name}</span>
                <span className="font-mono text-on-surface-variant">{s.startTime} – {s.endTime}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Nurse-to-Patient Ratios</h2>
          <div className="flex flex-col divide-y divide-line">
            {ratios.map((r) => (
              <div key={r.wardType} className="py-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface">{r.wardType}</span>
                <span className="font-mono font-bold text-on-surface">{r.nurseToPatientRatio}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
