import { useEffect, useState } from "react";
import { Baby, Bone, Building2, FlaskConical, Heart, Pill, Scan, Scissors, Siren, UserRound } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { ChipSelect, FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { DepartmentTypeConfig } from "@modules/hospital-admin/api";

export type DepartmentCategory = "cardiology" | "emergency" | "radiology" | "laboratory" | "opd" | "pediatrics" | "orthopedics" | "surgery" | "pharmacy" | "other";

export interface DepartmentFormValues {
  facilityId: string;
  name: string;
  code: string;
  category: DepartmentCategory;
  typeId: string;
  headDoctorId: string;
  floorId?: string;
}

function emptyValues(facilityId: string, typeId: string): DepartmentFormValues {
  return { facilityId, name: "", code: "", category: "other", typeId, headDoctorId: "", floorId: undefined };
}

export const categoryMeta: Record<DepartmentCategory, { label: string; icon: typeof Heart; accentColor: string }> = {
  cardiology: { label: "Cardiology", icon: Heart, accentColor: "var(--pulse-coral)" },
  emergency: { label: "Emergency", icon: Siren, accentColor: "var(--sunset-coral)" },
  radiology: { label: "Radiology", icon: Scan, accentColor: "var(--module-radiology)" },
  laboratory: { label: "Laboratory", icon: FlaskConical, accentColor: "var(--module-lab)" },
  opd: { label: "OPD", icon: UserRound, accentColor: "var(--signal-indigo)" },
  pediatrics: { label: "Pediatrics", icon: Baby, accentColor: "var(--vital-green)" },
  orthopedics: { label: "Orthopedics", icon: Bone, accentColor: "var(--caution-amber)" },
  surgery: { label: "Surgery / OT", icon: Scissors, accentColor: "var(--pulse-coral)" },
  pharmacy: { label: "Pharmacy", icon: Pill, accentColor: "var(--caution-amber)" },
  other: { label: "Other", icon: Building2, accentColor: "var(--outline)" },
};

const categoryOptions = (Object.keys(categoryMeta) as DepartmentCategory[]).map((key) => ({
  value: key,
  label: categoryMeta[key].label,
  icon: categoryMeta[key].icon,
}));

interface DepartmentFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
  initialValues?: DepartmentFormValues;
  staffOptions: { id: string; name: string }[];
  facilityOptions: { id: string; name: string }[];
  floorOptions: { id: string; name: string }[];
  departmentTypes: DepartmentTypeConfig[];
}

/** Module-local — Department identity/location fields (spec §2). Staff roster, services, appointment types, working hours, and lifecycle live on DepartmentDetailDrawer, not this form. */
export function DepartmentFormDrawer({ open, onClose, onSubmit, initialValues, staffOptions, facilityOptions, floorOptions, departmentTypes }: DepartmentFormDrawerProps) {
  const defaultFacilityId = facilityOptions[0]?.id ?? "";
  const defaultTypeId = departmentTypes[0]?.id ?? "";
  const [values, setValues] = useState<DepartmentFormValues>(initialValues ?? emptyValues(defaultFacilityId, defaultTypeId));
  const isEdit = Boolean(initialValues);
  const selectedHead = staffOptions.find((s) => s.id === values.headDoctorId);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues(defaultFacilityId, defaultTypeId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  function set<K extends keyof DepartmentFormValues>(key: K, value: DepartmentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const selected = categoryMeta[values.category];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Department" : "Add Department"}
      subtitle={isEdit ? "Update department identity and location." : "Register a new department at a facility."}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(values);
              onClose();
            }}
            disabled={!values.name || !values.code || !values.headDoctorId || !values.typeId || !values.facilityId}
          >
            {isEdit ? "Save Changes" : "Add Department"}
          </Button>
        </div>
      }
    >
      <div
        className="mb-7 flex items-center gap-4 rounded-2xl border border-line p-4"
        style={{ backgroundColor: `color-mix(in srgb, ${selected.accentColor} 10%, transparent)` }}
      >
        <span
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
          style={{ color: selected.accentColor }}
        >
          <selected.icon size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-on-surface">{values.name || "New Department"}</p>
          <p className="truncate text-sm text-on-surface-variant">{selectedHead?.name || "Department head not set"}</p>
        </div>
      </div>

      <FormSection title="Department Details">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Department Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Cardiology" />
          </FormField>
          <FormField label="Code">
            <input className={formInputClass} value={values.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. CARD" />
          </FormField>
        </div>

        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Category</span>
        <div className="mb-4">
          <ChipSelect value={values.category} onChange={(v) => set("category", v)} options={categoryOptions} columns={4} />
        </div>

        <div className="mb-4">
          <FormField label="Type">
            <select className={formInputClass} value={values.typeId} onChange={(e) => set("typeId", e.target.value)}>
              {departmentTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="mb-4">
          <FormField label="Department Head">
            <select className={formInputClass} value={values.headDoctorId} onChange={(e) => set("headDoctorId", e.target.value)}>
              <option value="" disabled>
                Select a staff member
              </option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Facility">
            <select className={formInputClass} value={values.facilityId} onChange={(e) => set("facilityId", e.target.value)} disabled={isEdit}>
              {facilityOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Floor (optional)">
            <select className={formInputClass} value={values.floorId ?? ""} onChange={(e) => set("floorId", e.target.value || undefined)}>
              <option value="">No floor set</option>
              {floorOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
