import { Card } from "@shared/design-system/components";
import type { DocumentTypeConfig, ConsentTypeConfig } from "@modules/hospital-admin/api";

interface DocumentsConsentPanelProps {
  documentTypes: DocumentTypeConfig[];
  consentTypes: ConsentTypeConfig[];
}

/** Module-local — Document (spec §28) + Consent (spec §29) Configuration, combined. Consent Activity itself (the event log) lives in the Security & Audit module — this owns the consent type/template definitions. */
export function DocumentsConsentPanel({ documentTypes, consentTypes }: DocumentsConsentPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Document Types</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Document</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Digital Signature</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Max Size</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Allowed Types</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {documentTypes.map((d) => (
                <tr key={d.id}>
                  <td className="py-2 pr-3 font-semibold text-on-surface">{d.name}</td>
                  <td className="py-2 pr-3 text-on-surface-variant">{d.requiresDigitalSignature ? "Required" : "Not Required"}</td>
                  <td className="py-2 pr-3 text-on-surface-variant">{d.maxFileSizeMb} MB</td>
                  <td className="py-2 text-on-surface-variant uppercase">{d.allowedFileTypes.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Consent Types</h2>
        <div className="flex flex-col divide-y divide-line">
          {consentTypes.map((c) => (
            <div key={c.id} className="py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-on-surface">{c.name}</p>
                <span className="text-xs text-on-surface-variant">{c.revocable ? "Revocable" : "Non-revocable"} · expires in {c.defaultExpirationDays}d</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Data: {c.dataCategories.join(", ")}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
