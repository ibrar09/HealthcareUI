import { useState } from "react";
import { Building2 } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { HospitalOrganizationProfile, HospitalStructureNode } from "@modules/hospital-admin/api";

interface OrganizationPanelProps {
  profile: HospitalOrganizationProfile | null;
  structure: HospitalStructureNode | null;
  onSave: (values: Partial<HospitalOrganizationProfile>) => void;
}

function StructureTree({ node, depth = 0 }: { node: HospitalStructureNode; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 py-1">
        <Building2 size={13} className="text-on-surface-variant" />
        <span className="text-sm text-on-surface font-semibold">{node.label}</span>
        <span className="text-[10px] uppercase text-on-surface-variant/60">{node.type}</span>
      </div>
      {node.children?.map((child) => <StructureTree key={child.id} node={child} depth={depth + 1} />)}
    </div>
  );
}

/** Module-local — Organization / Hospital Configuration (spec §2): basic hospital info + real structure tree from Facility/Department data. */
export function OrganizationPanel({ profile, structure, onSave }: OrganizationPanelProps) {
  const [values, setValues] = useState<Partial<HospitalOrganizationProfile>>({});
  if (!profile) return null;
  const current = { ...profile, ...values };

  function set<K extends keyof HospitalOrganizationProfile>(key: K, value: HospitalOrganizationProfile[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <FormSection title="Hospital Information">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Hospital Name">
              <input className={formInputClass} value={current.hospitalName} onChange={(e) => set("hospitalName", e.target.value)} />
            </FormField>
            <FormField label="Legal Name">
              <input className={formInputClass} value={current.legalName} onChange={(e) => set("legalName", e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <FormField label="Hospital Code">
              <input className={formInputClass} value={current.hospitalCode} onChange={(e) => set("hospitalCode", e.target.value)} />
            </FormField>
            <FormField label="Registration Number">
              <input className={formInputClass} value={current.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} />
            </FormField>
            <FormField label="Tax / VAT Number">
              <input className={formInputClass} value={current.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <input className={formInputClass} value={current.phone} onChange={(e) => set("phone", e.target.value)} />
            </FormField>
            <FormField label="Email">
              <input className={formInputClass} value={current.email} onChange={(e) => set("email", e.target.value)} />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Address">
          <div className="mb-4">
            <FormField label="Address">
              <input className={formInputClass} value={current.address} onChange={(e) => set("address", e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <FormField label="Country">
              <input className={formInputClass} value={current.country} onChange={(e) => set("country", e.target.value)} />
            </FormField>
            <FormField label="City">
              <input className={formInputClass} value={current.city} onChange={(e) => set("city", e.target.value)} />
            </FormField>
            <FormField label="Region">
              <input className={formInputClass} value={current.region} onChange={(e) => set("region", e.target.value)} />
            </FormField>
            <FormField label="Postal Code">
              <input className={formInputClass} value={current.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Locale">
          <div className="grid grid-cols-4 gap-4">
            <FormField label="Timezone">
              <input className={formInputClass} value={current.timezone} onChange={(e) => set("timezone", e.target.value)} />
            </FormField>
            <FormField label="Currency">
              <input className={formInputClass} value={current.currency} onChange={(e) => set("currency", e.target.value)} />
            </FormField>
            <FormField label="Date Format">
              <input className={formInputClass} value={current.dateFormat} onChange={(e) => set("dateFormat", e.target.value)} />
            </FormField>
            <FormField label="Time Format">
              <select className={formInputClass} value={current.timeFormat} onChange={(e) => set("timeFormat", e.target.value as "12-hour" | "24-hour")}>
                <option value="24-hour">24 Hour</option>
                <option value="12-hour">12 Hour</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        <Button size="sm" onClick={() => onSave(values)} disabled={Object.keys(values).length === 0}>Save Changes</Button>
      </Card>

      {structure && (
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Hospital Structure</h2>
          <StructureTree node={structure} />
        </Card>
      )}
    </div>
  );
}
