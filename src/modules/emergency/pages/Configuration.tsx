import { useEffect, useState } from "react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { EDConfig } from "@modules/emergency/api";

const LABELS: Record<keyof EDConfig, string> = {
  requireTwoIdentifierVerification: "Require two-identifier patient verification before high-risk actions",
  autoNotifyOnCriticalResult: "Automatically notify assigned doctor on critical result",
  reassessmentIntervalMinutes: "Waiting room reassessment interval (minutes)",
  criticalAlertEscalationMinutes: "Critical alert escalation window (minutes)",
};

export function Configuration() {
  const [config, setConfig] = useState<EDConfig | null>(null);
  useEffect(() => { api.getEDConfig().then(setConfig); }, []);

  function toggle(key: keyof EDConfig) {
    if (!config || typeof config[key] !== "boolean") return;
    const next = { ...config, [key]: !config[key] };
    setConfig(next);
    api.updateEDConfig({ [key]: next[key] });
  }

  function updateNumber(key: "reassessmentIntervalMinutes" | "criticalAlertEscalationMinutes", value: number) {
    if (!config) return;
    const next = { ...config, [key]: value };
    setConfig(next);
    api.updateEDConfig({ [key]: value });
  }

  return (
    <EmergencyLayout active="Configuration">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Emergency Department policy settings.</p>
      </div>
      {config && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col divide-y divide-slate-50">
            {(["requireTwoIdentifierVerification", "autoNotifyOnCriticalResult"] as const).map((key) => (
              <label key={key} className="flex items-center justify-between py-2.5 cursor-pointer">
                <span className="text-xs font-medium text-slate-700">{LABELS[key]}</span>
                <input type="checkbox" checked={config[key] as boolean} onChange={() => toggle(key)} className="w-4 h-4 accent-red-600" />
              </label>
            ))}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs font-medium text-slate-700">{LABELS.reassessmentIntervalMinutes}</span>
              <input type="number" value={config.reassessmentIntervalMinutes} onChange={(e) => updateNumber("reassessmentIntervalMinutes", Number(e.target.value))} className="w-20 text-xs rounded-lg border border-slate-200 px-2 py-1.5" />
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs font-medium text-slate-700">{LABELS.criticalAlertEscalationMinutes}</span>
              <input type="number" value={config.criticalAlertEscalationMinutes} onChange={(e) => updateNumber("criticalAlertEscalationMinutes", Number(e.target.value))} className="w-20 text-xs rounded-lg border border-slate-200 px-2 py-1.5" />
            </div>
          </div>
        </div>
      )}
    </EmergencyLayout>
  );
}
