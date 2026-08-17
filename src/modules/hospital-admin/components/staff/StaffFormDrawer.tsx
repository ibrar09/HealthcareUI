import { useEffect, useState } from "react";
import { Check, CreditCard, FlaskConical, Headset, Mail, Phone, Stethoscope, Syringe } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { ChipSelect, FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { StaffMember } from "@modules/hospital-admin/api";

export type StaffFormValues = StaffMember;

const emptyValues: StaffFormValues = {
  id: "",
  name: "",
  role: "doctor",
  specialty: "",
  title: "",
  licenseNumber: "",
  status: "active",
  email: "",
  phone: "",
  nationalId: "",
  department: "",
  schedule: [],
};

export const roleMeta: Record<StaffFormValues["role"], { label: string; icon: typeof Stethoscope; accentColor: string }> = {
  doctor: { label: "Doctor", icon: Stethoscope, accentColor: "var(--signal-indigo)" },
  nurse: { label: "Nurse", icon: Syringe, accentColor: "var(--vital-green)" },
  technician: { label: "Technician", icon: FlaskConical, accentColor: "var(--caution-amber)" },
  admin: { label: "Admin", icon: Headset, accentColor: "var(--module-radiology)" },
};

const roleOptions = (Object.keys(roleMeta) as StaffFormValues["role"][]).map((key) => ({
  value: key,
  label: roleMeta[key].label,
  icon: roleMeta[key].icon,
}));

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusOptions: { value: StaffFormValues["status"]; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "var(--vital-green)" },
  { value: "on-leave", label: "On Leave", color: "var(--caution-amber)" },
  { value: "inactive", label: "Inactive", color: "var(--outline)" },
];

interface StaffFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: StaffFormValues) => void;
  initialValues?: StaffFormValues;
  departmentOptions: string[];
}

export function StaffFormDrawer({ open, onClose, onSubmit, initialValues, departmentOptions }: StaffFormDrawerProps) {
  const [values, setValues] = useState<StaffFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof StaffFormValues>(key: K, value: StaffFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleDay(day: string) {
    setValues((v) => ({
      ...v,
      schedule: v.schedule.includes(day) ? v.schedule.filter((d) => d !== day) : [...v.schedule, day],
    }));
  }

  const selected = roleMeta[values.role];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Manage Staff Member" : "Add Staff Member"}
      subtitle={isEdit ? "Update role, schedule, and status." : "Onboard a new doctor, nurse, technician, or admin."}
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
            disabled={!values.name || !values.licenseNumber}
          >
            {isEdit ? "Save Changes" : "Add Staff Member"}
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
          <p className="truncate font-bold text-on-surface">{values.name || "New Staff Member"}</p>
          <p className="truncate text-sm text-on-surface-variant">{values.title || selected.label}</p>
        </div>
      </div>

      <FormSection title="Personal Information">
        <div className="mb-4">
          <FormField label="Full Name">
            <input
              className={formInputClass}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Dr. Jane Doe"
            />
          </FormField>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Email">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane.doe@citygeneral.org"
              />
            </div>
          </FormField>
          <FormField label="Phone">
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </FormField>
        </div>
        <FormField label="National ID">
          <div className="relative">
            <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className={`${formInputClass} pl-9`}
              value={values.nationalId}
              onChange={(e) => set("nationalId", e.target.value)}
              placeholder="ID-XXXXX-XXXX"
            />
          </div>
        </FormField>
      </FormSection>

      <FormSection title="Professional Information">
        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Role</span>
        <div className="mb-4">
          <ChipSelect value={values.role} onChange={(v) => set("role", v)} options={roleOptions} columns={4} />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Specialty">
            <input
              className={formInputClass}
              value={values.specialty}
              onChange={(e) => set("specialty", e.target.value)}
              placeholder="Cardiology"
            />
          </FormField>
          <FormField label="Department">
            <select className={formInputClass} value={values.department} onChange={(e) => set("department", e.target.value)}>
              <option value="" disabled>
                Select a department
              </option>
              {departmentOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Title">
            <input
              className={formInputClass}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Attending"
            />
          </FormField>
          <FormField label="License Number">
            <input
              className={formInputClass}
              value={values.licenseNumber}
              onChange={(e) => set("licenseNumber", e.target.value)}
              placeholder="MED-XXXX-YYYY"
            />
          </FormField>
        </div>

        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Status</span>
        <div className="flex gap-2">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => set("status", s.value)}
              className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all"
              style={
                values.status === s.value
                  ? { borderColor: s.color, backgroundColor: `color-mix(in srgb, ${s.color} 12%, transparent)`, color: s.color }
                  : { borderColor: "var(--line)", color: "var(--on-surface-variant)" }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Schedule (Weekly Availability)">
        <div className="flex flex-wrap gap-2">
          {weekDays.map((day) => {
            const active = values.schedule.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "border-vital-green bg-vital-green/10 text-vital-green"
                    : "border-line text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {active && <Check size={11} />}
                {day}
              </button>
            );
          })}
        </div>
      </FormSection>
    </Drawer>
  );
}
