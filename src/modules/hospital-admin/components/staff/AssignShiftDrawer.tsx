import { useEffect, useState } from "react";
import { Clock, Moon, Sun, X } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { ChipSelect, FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { ShiftType } from "@modules/hospital-admin/api";

export interface ShiftFormValues {
  staffId: string;
  day: string;
  type: ShiftType;
  time: string;
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const shiftTypeOptions: { value: ShiftType; label: string; icon: typeof Sun }[] = [
  { value: "standard", label: "Standard", icon: Sun },
  { value: "night", label: "Night", icon: Moon },
  { value: "leave", label: "Leave", icon: Clock },
  { value: "gap", label: "Clear", icon: X },
];

interface AssignShiftDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ShiftFormValues) => void;
  staffOptions: { value: string; label: string }[];
  initialValues?: ShiftFormValues;
}

export function AssignShiftDrawer({ open, onClose, onSubmit, staffOptions, initialValues }: AssignShiftDrawerProps) {
  const emptyValues: ShiftFormValues = {
    staffId: staffOptions[0]?.value ?? "",
    day: "Mon",
    type: "standard",
    time: "9 AM–5 PM",
  };

  const [values, setValues] = useState<ShiftFormValues>(initialValues ?? emptyValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  function set<K extends keyof ShiftFormValues>(key: K, value: ShiftFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Assign Shift"
      subtitle="Set a staff member's shift for a specific day."
      widthClass="max-w-md"
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
          >
            Save Shift
          </Button>
        </div>
      }
    >
      <FormSection title="Staff Member">
        <div className="grid grid-cols-2 gap-2">
          {staffOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("staffId", opt.value)}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold text-left transition-all ${
                values.staffId === opt.value
                  ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo"
                  : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Day">
        <ChipSelect value={values.day} onChange={(v) => set("day", v)} options={weekDays.map((d) => ({ value: d, label: d }))} columns={7} />
      </FormSection>

      <FormSection title="Shift Type">
        <ChipSelect value={values.type} onChange={(v) => set("type", v)} options={shiftTypeOptions} columns={4} />
      </FormSection>

      {(values.type === "standard" || values.type === "night") && (
        <FormSection title="Time">
          <FormField label="Shift Time">
            <input
              className={formInputClass}
              value={values.time}
              onChange={(e) => set("time", e.target.value)}
              placeholder="9 AM–5 PM"
            />
          </FormField>
        </FormSection>
      )}
    </Drawer>
  );
}
