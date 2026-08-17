import { useEffect, useState } from "react";
import { Activity, Building2, Check, Mail, MapPin, Phone, Stethoscope } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { ChipSelect, FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";

export interface FacilityFormValues {
  name: string;
  type: "campus" | "clinic" | "diagnostic";
  status: "active" | "maintenance";
  address: string;
  city: string;
  district: string;
  beds: number;
  staff: number;
  departments: number;
  phone: string;
  email: string;
}

const emptyValues: FacilityFormValues = {
  name: "",
  type: "campus",
  status: "active",
  address: "",
  city: "",
  district: "",
  beds: 0,
  staff: 0,
  departments: 0,
  phone: "",
  email: "",
};

const typeOptions: { value: FacilityFormValues["type"]; label: string; icon: typeof Building2 }[] = [
  { value: "campus", label: "Hospital Campus", icon: Building2 },
  { value: "clinic", label: "Clinic", icon: Stethoscope },
  { value: "diagnostic", label: "Diagnostic Center", icon: Activity },
];

interface FacilityFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FacilityFormValues) => void;
  initialValues?: FacilityFormValues;
}

export function FacilityFormDrawer({ open, onClose, onSubmit, initialValues }: FacilityFormDrawerProps) {
  const [values, setValues] = useState<FacilityFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof FacilityFormValues>(key: K, value: FacilityFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const selectedType = typeOptions.find((t) => t.value === values.type)!;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Manage Facility" : "Add Facility"}
      subtitle={isEdit ? "Update campus details and capacity." : "Register a new hospital campus or clinic."}
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
            disabled={!values.name || !values.address}
          >
            {isEdit ? "Save Changes" : "Add Facility"}
          </Button>
        </div>
      }
    >
      {/* Live preview */}
      <div
        className="mb-7 flex items-center gap-4 rounded-2xl border border-line p-4"
        style={{ backgroundColor: "var(--signal-indigo-tint)" }}
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-signal-indigo shadow-sm">
          <selectedType.icon size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-on-surface">{values.name || "New Facility"}</p>
          <p className="truncate text-sm text-on-surface-variant">{values.address || "Address not set"}</p>
        </div>
      </div>

      <FormSection title="Basic Information">
        <div className="mb-4">
          <FormField label="Facility Name">
            <input
              className={formInputClass}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Main Campus"
            />
          </FormField>
        </div>

        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Facility Type</span>
        <div className="mb-4">
          <ChipSelect value={values.type} onChange={(v) => set("type", v)} options={typeOptions} />
        </div>

        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Status</span>
        <div className="flex gap-2">
          {(["active", "maintenance"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("status", s)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                values.status === s
                  ? s === "active"
                    ? "border-vital-green bg-vital-green/10 text-vital-green"
                    : "border-caution-amber bg-caution-amber/10 text-caution-amber"
                  : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {values.status === s && <Check size={12} />}
              {s === "active" ? "Active" : "Maintenance"}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Location">
        <div className="mb-4">
          <FormField label="Street Address">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="14 Aslam Road"
              />
            </div>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City">
            <input className={formInputClass} value={values.city} onChange={(e) => set("city", e.target.value)} placeholder="Lahore" />
          </FormField>
          <FormField label="District">
            <input
              className={formInputClass}
              value={values.district}
              onChange={(e) => set("district", e.target.value)}
              placeholder="District 1"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Capacity">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Beds">
            <input
              type="number"
              min={0}
              className={formInputClass}
              value={values.beds}
              onChange={(e) => set("beds", Number(e.target.value))}
            />
          </FormField>
          <FormField label="Staff">
            <input
              type="number"
              min={0}
              className={formInputClass}
              value={values.staff}
              onChange={(e) => set("staff", Number(e.target.value))}
            />
          </FormField>
          <FormField label="Departments">
            <input
              type="number"
              min={0}
              className={formInputClass}
              value={values.departments}
              onChange={(e) => set("departments", Number(e.target.value))}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Contact">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone">
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+92 42 111 000"
              />
            </div>
          </FormField>
          <FormField label="Email">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="admin@citygeneral.org"
              />
            </div>
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
