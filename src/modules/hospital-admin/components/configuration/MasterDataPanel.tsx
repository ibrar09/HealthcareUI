import { useState } from "react";
import { Card } from "@shared/design-system/components";
import { statusPillStyle } from "@modules/hospital-admin/components/configuration/configHelpers";
import type { CountryReference, CurrencyReference, TerminologySystemReference, SystemSetting } from "@modules/hospital-admin/api";

interface MasterDataPanelProps {
  countries: CountryReference[];
  currencies: CurrencyReference[];
  terminologySystems: TerminologySystemReference[];
  scopedSettings: SystemSetting[];
  onResolve: (departmentId: string) => SystemSetting | undefined;
}

const scopeColor: Record<string, string> = { global: "var(--outline)", country: "var(--signal-indigo-light)", organization: "var(--signal-indigo)", hospital: "var(--caution-amber)", branch: "var(--module-radiology)", department: "var(--vital-green)" };

/** Module-local — Master Data (spec §30): centralized reference data including standardized terminology systems (ICD-11/SNOMED CT/LOINC/RxNorm/DICOM/UCUM) as real reference metadata, never arbitrary dropdown values. Also demonstrates §45's real GLOBAL->...->DEPARTMENT scope resolution. */
export function MasterDataPanel({ countries, currencies, terminologySystems, scopedSettings, onResolve }: MasterDataPanelProps) {
  const [resolvedFor, setResolvedFor] = useState<"none" | "dept-cardiology">("none");
  const resolved = resolvedFor === "dept-cardiology" ? onResolve("dept-cardiology") : onResolve("");

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Terminology Systems</h2>
        <div className="flex flex-col divide-y divide-line">
          {terminologySystems.map((t) => (
            <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-on-surface">{t.name} <span className="text-xs font-normal text-on-surface-variant">— {t.fullName}</span></p>
                <p className="text-xs text-on-surface-variant">{t.domain} · v{t.version}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize flex-shrink-0 ${t.status === "active" ? "bg-vital-green/14 text-vital-green" : "bg-outline/14 text-on-surface-variant"}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Countries</h2>
          <div className="flex flex-col divide-y divide-line">
            {countries.map((c) => (
              <div key={c.code} className="py-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface">{c.name}</span>
                <span className="text-xs text-on-surface-variant">{c.defaultCurrency} · {c.defaultTimezone}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Currencies</h2>
          <div className="flex flex-col divide-y divide-line">
            {currencies.map((c) => (
              <div key={c.code} className="py-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface">{c.name}</span>
                <span className="font-mono text-xs text-on-surface-variant">{c.symbol}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-1">Scoped Settings & Resolution</h2>
        <p className="text-xs text-on-surface-variant mb-4">GLOBAL → COUNTRY → ORGANIZATION → HOSPITAL → BRANCH → DEPARTMENT — the most specific match wins.</p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Scope</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Category</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Key</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {scopedSettings.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 pr-3"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={statusPillStyle(scopeColor[s.scope])}>{s.scope}</span></td>
                  <td className="py-2 pr-3 text-on-surface-variant">{s.category}</td>
                  <td className="py-2 pr-3 font-mono text-xs text-on-surface-variant">{s.key}</td>
                  <td className="py-2 font-mono font-bold text-on-surface">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <button type="button" onClick={() => setResolvedFor("none")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${resolvedFor === "none" ? "bg-gradient-brand text-white" : "border border-line text-on-surface-variant"}`}>Resolve for: Hospital default</button>
          <button type="button" onClick={() => setResolvedFor("dept-cardiology")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${resolvedFor === "dept-cardiology" ? "bg-gradient-brand text-white" : "border border-line text-on-surface-variant"}`}>Resolve for: Cardiology dept</button>
        </div>
        <p className="text-sm text-on-surface">
          APPOINTMENT.DEFAULT_DURATION resolves to <span className="font-mono font-bold">{resolved?.value ?? "—"}</span> minutes
          {resolved && <span className="text-on-surface-variant"> (matched at <strong>{resolved.scope}</strong> scope)</span>}
        </p>
      </Card>
    </div>
  );
}
