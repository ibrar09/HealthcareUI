import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";

interface BlockedTimeDrawerProps {
  open: boolean;
  practitionerId: string | null;
  practitionerName?: string;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Add Blocked Time for a doctor (spec §14): time that isn't leave but still isn't bookable. */
export function BlockedTimeDrawer({ open, practitionerId, practitionerName, onClose, onComplete }: BlockedTimeDrawerProps) {
  const [date, setDate] = useState("2026-08-14");
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:00");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setDate("2026-08-14");
      setStartTime("13:00");
      setEndTime("14:00");
      setReason("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!practitionerId || !reason.trim()) return;
    await api.createBlockedTime({ practitionerId, date, startTime, endTime, reason: reason.trim() });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Blocked Time"
      subtitle={practitionerName ? `For ${practitionerName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim()}>
            Add Blocked Time
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Date">
            <input type="date" className={formInputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Start Time">
            <input type="time" className={formInputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </FormField>
          <FormField label="End Time">
            <input type="time" className={formInputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Reason">
          <input className={formInputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Surgery, meeting" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
