import { useEffect, useState } from "react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabConfig } from "@modules/laboratory/api";

const LABELS: Record<keyof LabConfig, string> = {
  requireTwoIdentifierVerification: "Require two-identifier patient verification before collection",
  requireTechnicalAndClinicalValidation: "Require separate technical and clinical validation steps",
  autoNotifyOrderingDoctorOnRelease: "Automatically notify ordering doctor when a report is released",
  criticalResultEscalationMinutes: "Critical result escalation window (minutes)",
};

export function Configuration() {
  const [config, setConfig] = useState<LabConfig | null>(null);
  useEffect(() => { api.getLabConfig().then(setConfig); }, []);

  function toggle(key: keyof LabConfig) {
    if (!config || typeof config[key] !== "boolean") return;
    const next = { ...config, [key]: !config[key] };
    setConfig(next);
    api.updateLabConfig({ [key]: next[key] });
  }

  function updateMinutes(value: number) {
    if (!config) return;
    const next = { ...config, criticalResultEscalationMinutes: value };
    setConfig(next);
    api.updateLabConfig({ criticalResultEscalationMinutes: value });
  }

  return (
    <LaboratoryLayout active="Configuration">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Laboratory policy settings.</p>
      </div>
      {config && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col divide-y divide-slate-50">
            {(["requireTwoIdentifierVerification", "requireTechnicalAndClinicalValidation", "autoNotifyOrderingDoctorOnRelease"] as const).map((key) => (
              <label key={key} className="flex items-center justify-between py-2.5 cursor-pointer">
                <span className="text-xs font-medium text-slate-700">{LABELS[key]}</span>
                <input type="checkbox" checked={config[key] as boolean} onChange={() => toggle(key)} className="w-4 h-4 accent-orange-600" />
              </label>
            ))}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs font-medium text-slate-700">{LABELS.criticalResultEscalationMinutes}</span>
              <input type="number" value={config.criticalResultEscalationMinutes} onChange={(e) => updateMinutes(Number(e.target.value))} className="w-20 text-xs rounded-lg border border-slate-200 px-2 py-1.5" />
            </div>
          </div>
        </div>
      )}
    </LaboratoryLayout>
  );
}
