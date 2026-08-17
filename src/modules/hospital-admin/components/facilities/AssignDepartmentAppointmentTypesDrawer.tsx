import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormSection } from "@modules/hospital-admin/components/FormPrimitives";
import type { DepartmentDetail } from "@modules/hospital-admin/api";

interface AssignDepartmentAppointmentTypesDrawerProps {
  department: DepartmentDetail | null;
  onClose: () => void;
  onSubmit: (departmentId: string, appointmentTypeIds: string[]) => void;
  appointmentTypes: { id: string; name: string }[];
}

/** Module-local — assigns which appointment types are bookable in this department (spec §2 "Configure appointment types"). */
export function AssignDepartmentAppointmentTypesDrawer({ department, onClose, onSubmit, appointmentTypes }: AssignDepartmentAppointmentTypesDrawerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (department) setSelected(department.assignedAppointmentTypes.map((t) => t.id));
  }, [department]);

  function toggle(id: string) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  return (
    <Drawer
      open={Boolean(department)}
      onClose={onClose}
      title="Assign Appointment Types"
      subtitle={department?.name}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (department) onSubmit(department.id, selected);
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <FormSection title="Appointment Types">
        <div className="flex flex-wrap gap-2">
          {appointmentTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selected.includes(t.id) ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo" : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
