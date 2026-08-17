import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormSection } from "@modules/hospital-admin/components/FormPrimitives";
import type { DepartmentDetail, BillableService } from "@modules/hospital-admin/api";

interface AssignDepartmentServicesDrawerProps {
  department: DepartmentDetail | null;
  onClose: () => void;
  onSubmit: (departmentId: string, serviceCodes: string[]) => void;
  services: BillableService[];
}

/** Module-local — assigns which billable services (Billing's Service Catalog) belong to this department (spec §2 "Assign services"). */
export function AssignDepartmentServicesDrawer({ department, onClose, onSubmit, services }: AssignDepartmentServicesDrawerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (department) setSelected(department.assignedServices.map((s) => s.code));
  }, [department]);

  function toggle(code: string) {
    setSelected((codes) => (codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code]));
  }

  return (
    <Drawer
      open={Boolean(department)}
      onClose={onClose}
      title="Assign Services"
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
      <FormSection title="Billable Services">
        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <label key={s.code} className="flex items-center justify-between gap-3 rounded-input border border-line px-3.5 py-2.5 cursor-pointer hover:bg-surface-container-low transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <input type="checkbox" className="accent-signal-indigo" checked={selected.includes(s.code)} onChange={() => toggle(s.code)} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{s.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{s.code}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-on-surface flex-shrink-0">SAR {s.standardPrice.toLocaleString()}</span>
            </label>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
