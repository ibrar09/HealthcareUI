import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseRow, OTRoom } from "@modules/hospital-admin/api";

interface ScheduleSurgicalCaseDrawerProps {
  caseRow: SurgicalCaseRow | null;
  mode: "schedule" | "reschedule";
  onClose: () => void;
  onComplete: () => void;
  rooms: OTRoom[];
}

/** Module-local — OT Allocation (spec §9, "Ready to Schedule" step): assigns date/time/room. Reschedule reuses the same fields, distinguished only by title and which api function it calls. */
export function ScheduleSurgicalCaseDrawer({ caseRow, mode, onClose, onComplete, rooms }: ScheduleSurgicalCaseDrawerProps) {
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");

  useEffect(() => {
    if (caseRow) {
      setScheduledDateTime(caseRow.scheduledDateTime ?? "");
      setRoomId(caseRow.roomNumber ? rooms.find((r) => r.number === caseRow.roomNumber)?.id ?? rooms[0]?.id ?? "" : rooms[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseRow]);

  async function handleSubmit() {
    if (!caseRow || !scheduledDateTime || !roomId) return;
    const input = { scheduledDateTime, roomId };
    if (mode === "schedule") await api.scheduleSurgicalCase(caseRow.id, input);
    else await api.rescheduleSurgicalCase(caseRow.id, input);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(caseRow)}
      onClose={onClose}
      title={mode === "schedule" ? "Schedule Surgery" : "Reschedule Surgery"}
      subtitle={caseRow ? `${caseRow.caseNumber} · ${caseRow.patientName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!scheduledDateTime || !roomId}>
            {mode === "schedule" ? "Schedule" : "Save New Time"}
          </Button>
        </div>
      }
    >
      <FormSection title="OT Allocation">
        <div className="mb-4">
          <FormField label="Date & Time">
            <input type="datetime-local" className={formInputClass} value={scheduledDateTime.slice(0, 16)} onChange={(e) => setScheduledDateTime(`${e.target.value}:00`)} />
          </FormField>
        </div>
        <FormField label="OT Room">
          <select className={formInputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} — {r.type}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
