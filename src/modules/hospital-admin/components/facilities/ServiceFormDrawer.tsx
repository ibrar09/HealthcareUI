import { useEffect, useState } from "react";
import { ClipboardList, FlaskConical, Scan, Stethoscope } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass, ChipSelect } from "@modules/hospital-admin/components/FormPrimitives";

export interface ServiceFormValues {
  name: string;
  category: "consultations" | "laboratory" | "imaging" | "procedures";
  tag: string;
  code: string;
  meta: string;
  coverage: number;
  price: number;
}

const emptyValues: ServiceFormValues = {
  name: "",
  category: "consultations",
  tag: "Outpatient",
  code: "",
  meta: "",
  coverage: 80,
  price: 0,
};

export const serviceCategoryMeta: Record<ServiceFormValues["category"], { label: string; accentColor: string; icon: typeof Stethoscope }> = {
  consultations: { label: "Consultations", accentColor: "var(--signal-indigo)", icon: Stethoscope },
  laboratory: { label: "Laboratory Tests", accentColor: "var(--vital-green)", icon: FlaskConical },
  imaging: { label: "Imaging", accentColor: "var(--pulse-coral)", icon: Scan },
  procedures: { label: "Procedures", accentColor: "var(--caution-amber)", icon: ClipboardList },
};

const categoryOptions = (Object.keys(serviceCategoryMeta) as ServiceFormValues["category"][]).map((key) => ({
  value: key,
  label: serviceCategoryMeta[key].label,
  icon: serviceCategoryMeta[key].icon,
}));

interface ServiceFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => void;
  initialValues?: ServiceFormValues;
}

export function ServiceFormDrawer({ open, onClose, onSubmit, initialValues }: ServiceFormDrawerProps) {
  const [values, setValues] = useState<ServiceFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const selected = serviceCategoryMeta[values.category];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Manage Service" : "Add Service"}
      subtitle={isEdit ? "Update pricing and coverage for this service." : "Register a new billable procedure or test."}
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
            disabled={!values.name || !values.code}
          >
            {isEdit ? "Save Changes" : "Add Service"}
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
          <p className="truncate font-bold text-on-surface">{values.name || "New Service"}</p>
          <p className="truncate text-sm text-on-surface-variant">
            {values.price > 0
              ? `$${values.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "Price not set"}
          </p>
        </div>
      </div>

      <FormSection title="Service Details">
        <div className="mb-4">
          <FormField label="Service Name">
            <input
              className={formInputClass}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Initial General Consultation"
            />
          </FormField>
        </div>

        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Category</span>
        <div className="mb-4">
          <ChipSelect value={values.category} onChange={(v) => set("category", v)} options={categoryOptions} columns={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Billing Code">
            <input className={formInputClass} value={values.code} onChange={(e) => set("code", e.target.value)} placeholder="99203" />
          </FormField>
          <FormField label="Setting">
            <input
              className={formInputClass}
              value={values.tag}
              onChange={(e) => set("tag", e.target.value)}
              placeholder="Outpatient"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Description">
        <FormField label="Duration / Notes">
          <input
            className={formInputClass}
            value={values.meta}
            onChange={(e) => set("meta", e.target.value)}
            placeholder="Duration: 30m • Standard intake"
          />
        </FormField>
      </FormSection>

      <FormSection title="Pricing & Coverage">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price (USD)">
            <input
              type="number"
              min={0}
              step={0.01}
              className={formInputClass}
              value={values.price}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </FormField>
          <FormField label="Avg. Coverage (%)">
            <input
              type="number"
              min={0}
              max={100}
              className={formInputClass}
              value={values.coverage}
              onChange={(e) => set("coverage", Number(e.target.value))}
            />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
