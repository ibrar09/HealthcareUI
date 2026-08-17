import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { DoctorLeaveType } from "@modules/hospital-admin/api";

const leaveTypeOptions: { value: DoctorLeaveType; label: string }[] = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "training", label: "Training" },
  { value: "conference", label: "Conference" },
  { value: "personal", label: "Personal" },
  { value: "hospital-closure", label: "Hospital Closure" },
];

interface DoctorLeaveDrawerProps {
  open: boolean;
  practitionerId: string | null;
  practitionerName?: string;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Add Doctor Leave (spec §13): whole-day(s) unavailability, overrides the regular schedule. */
export function DoctorLeaveDrawer({ open, practitionerId, practitionerName, onClose, onComplete }: DoctorLeaveDrawerProps) {
  const [startDate, setStartDate] = useState("2026-08-17");
  const [endDate, setEndDate] = useState("2026-08-17");
  const [type, setType] = useState<DoctorLeaveType>("annual");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setStartDate("2026-08-17");
      setEndDate("2026-08-17");
      setType("annual");
      setReason("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!practitionerId) return;
    await api.createDoctorLeave({ practitionerId, startDate, endDate, type, reason: reason || undefined });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Doctor Leave"
      subtitle={practitionerName ? `For ${practitionerName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={endDate < startDate}>
            Add Leave
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Start Date">
            <input type="date" className={formInputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
          <FormField label="End Date">
            <input type="date" className={formInputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Type">
            <select className={formInputClass} value={type} onChange={(e) => setType(e.target.value as DoctorLeaveType)}>
              {leaveTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Reason (optional)">
          <input className={formInputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family vacation" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
