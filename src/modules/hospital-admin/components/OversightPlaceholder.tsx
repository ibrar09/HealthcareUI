import { ReactNode } from "react";
import { Card, StatusChip } from "@shared/design-system/components";

interface PlannedSection {
  label: string;
  description: string;
}

interface OversightPlaceholderProps {
  title: string;
  subtitle: string;
  scopeNote: string;
  icon: ReactNode;
  accentColor: string;
  sections: PlannedSection[];
}

/**
 * Module-local — shared shell for Hospital Admin's not-yet-built [oversight]/[full]
 * sections (HOSPITAL_ADMIN_MODULE_MAP.md tree). Gives each section a real, navigable
 * page with its planned scope laid out, rather than a blank route, until the user
 * directs which piece to actually design next.
 */
export function OversightPlaceholder({ title, subtitle, scopeNote, icon, accentColor, sections }: OversightPlaceholderProps) {
  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-1">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`, color: accentColor }}
        >
          {icon}
        </span>
        <h1 className="font-display font-bold text-2xl text-on-surface">{title}</h1>
      </div>
      <p className="text-sm text-on-surface-variant mb-6">{subtitle}</p>

      <Card className="mb-6">
        <p className="text-sm text-on-surface-variant">{scopeNote}</p>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Planned Sections</h2>
        <div className="flex flex-col divide-y divide-line">
          {sections.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <div className="text-sm font-semibold text-on-surface">{s.label}</div>
                <div className="text-xs text-on-surface-variant mt-0.5">{s.description}</div>
              </div>
              <StatusChip tone="neutral">Not built yet</StatusChip>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
