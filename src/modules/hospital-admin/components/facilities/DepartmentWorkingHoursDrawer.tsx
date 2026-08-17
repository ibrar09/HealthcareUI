import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { DepartmentDetail } from "@modules/hospital-admin/api";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DepartmentWorkingHoursDrawerProps {
  department: DepartmentDetail | null;
  onClose: () => void;
  onSubmit: (departmentId: string, workingHours: { workingDays: string[]; startTime: string; endTime: string }) => void;
}

/** Module-local — department-wide default operating hours (spec §2 "Configure working hours") — separate from any individual doctor's own Schedule. */
export function DepartmentWorkingHoursDrawer({ department, onClose, onSubmit }: DepartmentWorkingHoursDrawerProps) {
  const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  useEffect(() => {
    if (department) {
      setWorkingDays(department.workingHours?.workingDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri"]);
      setStartTime(department.workingHours?.startTime ?? "08:00");
      setEndTime(department.workingHours?.endTime ?? "17:00");
    }
  }, [department]);

  function toggleDay(day: string) {
    setWorkingDays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day]));
  }

  return (
    <Drawer
      open={Boolean(department)}
      onClose={onClose}
      title="Working Hours"
      subtitle={department?.name}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (department) onSubmit(department.id, { workingDays, startTime, endTime });
              onClose();
            }}
            disabled={workingDays.length === 0}
          >
            Save
          </Button>
        </div>
      }
    >
      <FormSection title="Working Days">
        <div className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                workingDays.includes(day) ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo" : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Hours">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Time">
            <input type="time" className={formInputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </FormField>
          <FormField label="End Time">
            <input type="time" className={formInputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
