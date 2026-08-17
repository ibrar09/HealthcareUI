import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { DenialView } from "@modules/hospital-admin/api";

interface AssignDenialDrawerProps {
  denial: DenialView | null;
  onClose: () => void;
  onSubmit: (denialId: string, assignedTo: string) => void;
  staffOptions: { id: string; name: string }[];
}

/** Module-local — assigns a denial to a responsible team member (spec §28). */
export function AssignDenialDrawer({ denial, onClose, onSubmit, staffOptions }: AssignDenialDrawerProps) {
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (denial) setAssignedTo(denial.assignedTo ?? staffOptions[0]?.name ?? "");
  }, [denial, staffOptions]);

  function handleSubmit() {
    if (!denial || !assignedTo) return;
    onSubmit(denial.id, assignedTo);
    onClose();
  }

  return (
    <Drawer
      open={Boolean(denial)}
      onClose={onClose}
      title="Assign Denial"
      subtitle={denial?.claimNumber}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!assignedTo}>
            Assign
          </Button>
        </div>
      }
    >
      <FormSection title="Responsible Team Member">
        <FormField label="Assign To">
          <select className={formInputClass} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
