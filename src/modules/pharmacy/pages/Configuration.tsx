import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { PharmacyConfig } from "@modules/pharmacy/api";

const LABELS: Record<keyof PharmacyConfig, string> = {
  enforceFefo: "Enforce First-Expire-First-Out dispensing",
  requireFormularyApproval: "Require approval for non-formulary orders",
  requireDoubleCheckHighRisk: "Require independent double-check for high-risk preparations",
  lowStockNotifications: "Notify on low stock",
};

export function Configuration() {
  const [config, setConfig] = useState<PharmacyConfig | null>(null);
  useEffect(() => { api.getPharmacyConfig().then(setConfig); }, []);

  function toggle(key: keyof PharmacyConfig) {
    if (!config) return;
    const next = { ...config, [key]: !config[key] };
    setConfig(next);
    api.updatePharmacyConfig({ [key]: next[key] });
  }

  return (
    <PharmacyLayout active="Configuration">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Pharmacy policy settings for Main Pharmacy.</p>
      </div>
      {config && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col divide-y divide-slate-50">
            {(Object.keys(LABELS) as (keyof PharmacyConfig)[]).map((key) => (
              <label key={key} className="flex items-center justify-between py-2.5 cursor-pointer">
                <span className="text-xs font-medium text-slate-700">{LABELS[key]}</span>
                <input type="checkbox" checked={config[key]} onChange={() => toggle(key)} className="w-4 h-4 accent-violet-600" />
              </label>
            ))}
          </div>
        </div>
      )}
    </PharmacyLayout>
  );
}
