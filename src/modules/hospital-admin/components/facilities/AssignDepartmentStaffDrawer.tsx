import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormSection } from "@modules/hospital-admin/components/FormPrimitives";
import type { DepartmentDetail } from "@modules/hospital-admin/api";

interface AssignDepartmentStaffDrawerProps {
  department: DepartmentDetail | null;
  onClose: () => void;
  onSubmit: (departmentId: string, additionalStaffIds: string[]) => void;
  staffOptions: { id: string; name: string; title: string }[];
}

/** Module-local — assigns staff whose *primary* department is elsewhere but who also work in this one (spec §2 "Assign staff"). Primary staff (via each person's own department) aren't editable here — that's the Staff Directory's job. */
export function AssignDepartmentStaffDrawer({ department, onClose, onSubmit, staffOptions }: AssignDepartmentStaffDrawerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (department) setSelected(department.additionalStaff.map((s) => s.id));
  }, [department]);

  function toggle(id: string) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  const primaryIds = new Set(department?.primaryStaff.map((s) => s.id) ?? []);
  const assignable = staffOptions.filter((s) => !primaryIds.has(s.id));

  return (
    <Drawer
      open={Boolean(department)}
      onClose={onClose}
      title="Assign Staff"
      subtitle={department ? `${department.name} — staff also working here` : undefined}
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
      <FormSection title="Additional Staff">
        {department && department.primaryStaff.length > 0 && (
          <p className="text-xs text-on-surface-variant mb-3">
            {department.primaryStaff.map((s) => s.name).join(", ")} {department.primaryStaff.length === 1 ? "is" : "are"} already assigned here as primary staff.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {assignable.map((s) => (
            <label key={s.id} className="flex items-center gap-3 rounded-input border border-line px-3.5 py-2.5 cursor-pointer hover:bg-surface-container-low transition-all">
              <input type="checkbox" className="accent-signal-indigo" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{s.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{s.title}</p>
              </div>
            </label>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
