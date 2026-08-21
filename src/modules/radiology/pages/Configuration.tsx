import { useEffect, useState } from "react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyConfig } from "@modules/radiology/api";

const LABELS: Record<keyof RadiologyConfig, string> = {
  requireMriScreening: "Require MRI safety screening before scheduling MRI studies",
  requireContrastRenalCheck: "Require renal function check before contrast administration",
  autoNotifyOrderingDoctor: "Automatically notify ordering doctor when report is finalized",
  criticalFindingEscalationMinutes: "Critical finding escalation window (minutes)",
};

export function Configuration() {
  const [config, setConfig] = useState<RadiologyConfig | null>(null);
  useEffect(() => { api.getRadiologyConfig().then(setConfig); }, []);

  function toggle(key: keyof RadiologyConfig) {
    if (!config || typeof config[key] !== "boolean") return;
    const next = { ...config, [key]: !config[key] };
    setConfig(next);
    api.updateRadiologyConfig({ [key]: next[key] });
  }

  function updateMinutes(value: number) {
    if (!config) return;
    const next = { ...config, criticalFindingEscalationMinutes: value };
    setConfig(next);
    api.updateRadiologyConfig({ criticalFindingEscalationMinutes: value });
  }

  return (
    <RadiologyLayout active="Configuration">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Radiology Department policy settings.</p>
      </div>
      {config && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col divide-y divide-slate-50">
            {(["requireMriScreening", "requireContrastRenalCheck", "autoNotifyOrderingDoctor"] as const).map((key) => (
              <label key={key} className="flex items-center justify-between py-2.5 cursor-pointer">
                <span className="text-xs font-medium text-slate-700">{LABELS[key]}</span>
                <input type="checkbox" checked={config[key] as boolean} onChange={() => toggle(key)} className="w-4 h-4 accent-cyan-600" />
              </label>
            ))}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs font-medium text-slate-700">{LABELS.criticalFindingEscalationMinutes}</span>
              <input type="number" value={config.criticalFindingEscalationMinutes} onChange={(e) => updateMinutes(Number(e.target.value))} className="w-20 text-xs rounded-lg border border-slate-200 px-2 py-1.5" />
            </div>
          </div>
        </div>
      )}
    </RadiologyLayout>
  );
}
