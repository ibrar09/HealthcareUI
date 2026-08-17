import { useEffect, useState } from "react";
import { Activity, Baby, BedDouble, Scissors, ShieldAlert, Siren, Smile } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { ChipSelect, FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { WardType } from "@modules/hospital-admin/api";

export interface WardFormValues {
  facilityId: string;
  floorId: string;
  name: string;
  code: string;
  type: WardType;
  nurseStation?: string;
  departmentId?: string;
  status: "active" | "closed";
}

const emptyValues: WardFormValues = {
  facilityId: "",
  floorId: "",
  name: "",
  code: "",
  type: "general",
  nurseStation: "",
  departmentId: undefined,
  status: "active",
};

export const wardTypeMeta: Record<WardType, { label: string; icon: typeof BedDouble; accentColor: string }> = {
  general: { label: "General", icon: BedDouble, accentColor: "var(--signal-indigo)" },
  icu: { label: "ICU", icon: Activity, accentColor: "var(--pulse-coral)" },
  maternity: { label: "Maternity", icon: Baby, accentColor: "var(--vital-green)" },
  pediatric: { label: "Pediatric", icon: Smile, accentColor: "var(--caution-amber)" },
  isolation: { label: "Isolation", icon: ShieldAlert, accentColor: "var(--sunset-coral)" },
  surgical: { label: "Surgical", icon: Scissors, accentColor: "var(--module-radiology)" },
  emergency: { label: "Emergency", icon: Siren, accentColor: "var(--pulse-coral)" },
};

const typeOptions = (Object.keys(wardTypeMeta) as WardType[]).map((key) => ({
  value: key,
  label: wardTypeMeta[key].label,
  icon: wardTypeMeta[key].icon,
}));

interface WardFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: WardFormValues) => void;
  initialValues?: WardFormValues;
  facilityOptions: { id: string; name: string }[];
  floorOptions: { id: string; name: string }[];
  departmentOptions: { id: string; name: string }[];
}

export function WardFormDrawer({
  open,
  onClose,
  onSubmit,
  initialValues,
  facilityOptions,
  floorOptions,
  departmentOptions,
}: WardFormDrawerProps) {
  const [values, setValues] = useState<WardFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof WardFormValues>(key: K, value: WardFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const selected = wardTypeMeta[values.type];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Manage Ward" : "Add Ward"}
      subtitle={isEdit ? "Update ward assignment and status." : "Register a new ward under a facility floor."}
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
            disabled={!values.name || !values.code || !values.facilityId || !values.floorId}
          >
            {isEdit ? "Save Changes" : "Add Ward"}
          </Button>
        </div>
      }
    >
      <div
        className="mb-7 flex items-center gap-4 rounded-2xl border border-line p-4"
        style={{ backgroundColor: `color-mix(in srgb, ${selected.accentColor} 10%, transparent)` }}
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: selected.accentColor }}>
          <selected.icon size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-on-surface">{values.name || "New Ward"}</p>
          <p className="truncate text-sm text-on-surface-variant">{selected.label} ward</p>
        </div>
      </div>

      <FormSection title="Ward Details">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Ward Name">
            <input
              className={formInputClass}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Cardiology Ward B"
            />
          </FormField>
          <FormField label="Ward Code">
            <input
              className={formInputClass}
              value={values.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. CARD-B"
            />
          </FormField>
        </div>

        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Ward Type</span>
        <div className="mb-4">
          <ChipSelect value={values.type} onChange={(v) => set("type", v)} options={typeOptions} columns={4} />
        </div>

        <div className="mb-4">
          <FormField label="Nurse Station (optional)">
            <input
              className={formInputClass}
              value={values.nurseStation ?? ""}
              onChange={(e) => set("nurseStation", e.target.value)}
              placeholder="e.g. 4E Nurse Station"
            />
          </FormField>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Facility">
            <select className={formInputClass} value={values.facilityId} onChange={(e) => set("facilityId", e.target.value)}>
              <option value="" disabled>
                Select a facility
              </option>
              {facilityOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Floor">
            <select className={formInputClass} value={values.floorId} onChange={(e) => set("floorId", e.target.value)}>
              <option value="" disabled>
                Select a floor
              </option>
              {floorOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Owning Department (optional)">
          <select
            className={formInputClass}
            value={values.departmentId ?? ""}
            onChange={(e) => set("departmentId", e.target.value || undefined)}
          >
            <option value="">No department link</option>
            {departmentOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Status">
        <div className="flex gap-2">
          {(["active", "closed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("status", s)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                values.status === s
                  ? s === "active"
                    ? "border-vital-green bg-vital-green/10 text-vital-green"
                    : "border-outline bg-surface-container-low text-on-surface-variant"
                  : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {s === "active" ? "Active" : "Closed"}
            </button>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
