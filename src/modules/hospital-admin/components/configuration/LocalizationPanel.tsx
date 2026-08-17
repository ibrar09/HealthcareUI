import { Card } from "@shared/design-system/components";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { SupportedLanguage } from "@modules/hospital-admin/api";

interface LocalizationPanelProps {
  languages: SupportedLanguage[];
  onToggle: (code: string, enabled: boolean) => void;
}

/** Module-local — Localization & Language (spec §4): the frontend automatically switches layout direction per language (RTL for Arabic/Urdu). */
export function LocalizationPanel({ languages, onToggle }: LocalizationPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-1">Supported Languages</h2>
        <p className="text-xs text-on-surface-variant mb-4">Arabic and Urdu render right-to-left automatically when enabled.</p>
        <div className="flex flex-col divide-y divide-line">
          {languages.map((lang) => (
            <div key={lang.code} className="py-2.5">
              <ConfigToggleRow
                label={`${lang.name} (${lang.nativeName})`}
                description={`${lang.direction.toUpperCase()} · ${lang.translationCoverage}% translated`}
                checked={lang.enabled}
                onChange={(v) => onToggle(lang.code, v)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
