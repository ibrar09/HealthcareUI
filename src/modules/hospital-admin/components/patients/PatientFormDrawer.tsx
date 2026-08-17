import { useEffect, useState } from "react";
import { Building2, Mail, MapPin, Phone, ShieldCheck, UserPlus } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { ChipSelect, FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { CommunicationPreference, MaritalStatus } from "@modules/hospital-admin/api";

export interface PatientFormValues {
  givenName: string;
  familyName: string;
  preferredName?: string;
  dob: string;
  gender: "male" | "female" | "other" | "unknown";
  maritalStatus: MaritalStatus;
  nationalId?: string;
  managingOrganizationId: string;
  phone: string;
  email: string;
  address: string;
  communicationPreference: CommunicationPreference;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
}

const emptyValues: PatientFormValues = {
  givenName: "",
  familyName: "",
  preferredName: "",
  dob: "",
  gender: "female",
  maritalStatus: "unknown",
  nationalId: "",
  managingOrganizationId: "",
  phone: "",
  email: "",
  address: "",
  communicationPreference: "phone",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  emergencyContactAddress: "",
};

const genderOptions = [
  { value: "female" as const, label: "Female" },
  { value: "male" as const, label: "Male" },
  { value: "other" as const, label: "Other" },
  { value: "unknown" as const, label: "Unknown" },
];

const maritalStatusOptions: { value: MaritalStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "unknown", label: "Unknown" },
];

const communicationOptions = [
  { value: "phone" as const, label: "Phone" },
  { value: "email" as const, label: "Email" },
  { value: "sms" as const, label: "SMS" },
];

const relationshipOptions = ["Spouse", "Parent", "Child", "Sibling", "Family Member", "Friend", "Guardian", "Other"];

interface PatientFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => void;
  initialValues?: PatientFormValues;
  facilityOptions: { id: string; name: string }[];
}

export function PatientFormDrawer({ open, onClose, onSubmit, initialValues, facilityOptions }: PatientFormDrawerProps) {
  const [values, setValues] = useState<PatientFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof PatientFormValues>(key: K, value: PatientFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Patient" : "New Patient"}
      subtitle={isEdit ? "Update demographics, contact, and insurance." : "Register a new patient in the hospital registry."}
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
            disabled={!values.givenName || !values.familyName || !values.dob || !values.managingOrganizationId}
          >
            {isEdit ? "Save Changes" : "Register Patient"}
          </Button>
        </div>
      }
    >
      <div
        className="mb-7 flex items-center gap-4 rounded-2xl border border-line p-4"
        style={{ backgroundColor: "var(--signal-indigo-tint)" }}
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-signal-indigo shadow-sm">
          <UserPlus size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-on-surface">
            {values.givenName || values.familyName ? `${values.givenName} ${values.familyName}`.trim() : "New Patient"}
          </p>
          <p className="truncate text-sm text-on-surface-variant">{values.dob || "Date of birth not set"}</p>
        </div>
      </div>

      <FormSection title="Demographics">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Given Name">
            <input
              className={formInputClass}
              value={values.givenName}
              onChange={(e) => set("givenName", e.target.value)}
              placeholder="Jane"
            />
          </FormField>
          <FormField label="Family Name">
            <input
              className={formInputClass}
              value={values.familyName}
              onChange={(e) => set("familyName", e.target.value)}
              placeholder="Doe"
            />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Preferred Name (optional)">
            <input
              className={formInputClass}
              value={values.preferredName ?? ""}
              onChange={(e) => set("preferredName", e.target.value)}
              placeholder="What they'd like to be called"
            />
          </FormField>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Date of Birth">
            <input type="date" className={formInputClass} value={values.dob} onChange={(e) => set("dob", e.target.value)} />
          </FormField>
          <FormField label="National ID (optional)">
            <input
              className={formInputClass}
              value={values.nationalId ?? ""}
              onChange={(e) => set("nationalId", e.target.value)}
              placeholder="35202-1234567-1"
            />
          </FormField>
        </div>
        <div className="mb-4">
          <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Gender</span>
          <ChipSelect value={values.gender} onChange={(v) => set("gender", v)} options={genderOptions} columns={4} />
        </div>
        <FormField label="Marital Status">
          <select className={formInputClass} value={values.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value as MaritalStatus)}>
            {maritalStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Registration">
        <FormField label="Managing Facility">
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <select
              className={`${formInputClass} pl-9`}
              value={values.managingOrganizationId}
              onChange={(e) => set("managingOrganizationId", e.target.value)}
            >
              <option value="" disabled>
                Select a facility
              </option>
              {facilityOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </FormField>
      </FormSection>

      <FormSection title="Contact">
        <div className="mb-4 grid grid-cols-2 gap-4">
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
          <FormField label="Email">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane.doe@gmail.com"
              />
            </div>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Address">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="14 Aslam Road, Lahore"
              />
            </div>
          </FormField>
        </div>
        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Preferred Contact Method</span>
        <ChipSelect value={values.communicationPreference} onChange={(v) => set("communicationPreference", v)} options={communicationOptions} />
      </FormSection>

      <FormSection title="Insurance">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Provider">
            <div className="relative">
              <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className={`${formInputClass} pl-9`}
                value={values.insuranceProvider}
                onChange={(e) => set("insuranceProvider", e.target.value)}
                placeholder="State Life Health"
              />
            </div>
          </FormField>
          <FormField label="Policy Number">
            <input
              className={formInputClass}
              value={values.insurancePolicyNumber}
              onChange={(e) => set("insurancePolicyNumber", e.target.value)}
              placeholder="SLH-XXXXX-X"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Emergency Contact">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Name">
            <input
              className={formInputClass}
              value={values.emergencyContactName}
              onChange={(e) => set("emergencyContactName", e.target.value)}
              placeholder="John Doe"
            />
          </FormField>
          <FormField label="Relationship">
            <select
              className={formInputClass}
              value={values.emergencyContactRelationship}
              onChange={(e) => set("emergencyContactRelationship", e.target.value)}
            >
              <option value="" disabled>
                Select relationship
              </option>
              {relationshipOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone">
            <input
              className={formInputClass}
              value={values.emergencyContactPhone}
              onChange={(e) => set("emergencyContactPhone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </FormField>
          <FormField label="Address (optional)">
            <input
              className={formInputClass}
              value={values.emergencyContactAddress ?? ""}
              onChange={(e) => set("emergencyContactAddress", e.target.value)}
              placeholder="Same as patient, or different"
            />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
