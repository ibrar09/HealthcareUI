import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { ImagingOrderRow, RadiologyRoom } from "@modules/hospital-admin/api";

interface StaffOption {
  id: string;
  name: string;
}

interface ScheduleImagingOrderDrawerProps {
  order: ImagingOrderRow | null;
  onClose: () => void;
  onComplete: () => void;
  rooms: RadiologyRoom[];
  technologists: StaffOption[];
  radiologists: StaffOption[];
}

/** Module-local — the scheduling modal (spec §10): Patient/Order are read-only (already known from the order being scheduled), Schedule/Staff/Preparation are editable. Preparation fields are captured as-entered, never validated against clinical protocol rules here. */
export function ScheduleImagingOrderDrawer({ order, onClose, onComplete, rooms, technologists, radiologists }: ScheduleImagingOrderDrawerProps) {
  const [date, setDate] = useState("2026-08-15");
  const [time, setTime] = useState("09:00");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [technologistId, setTechnologistId] = useState(technologists[0]?.id ?? "");
  const [radiologistId, setRadiologistId] = useState(radiologists[0]?.id ?? "");
  const [contrastRequired, setContrastRequired] = useState(false);
  const [fastingRequired, setFastingRequired] = useState(false);
  const [specialPreparation, setSpecialPreparation] = useState("");

  useEffect(() => {
    if (order) {
      setDate("2026-08-15");
      setTime("09:00");
      setRoomId(rooms[0]?.id ?? "");
      setTechnologistId(technologists[0]?.id ?? "");
      setRadiologistId(radiologists[0]?.id ?? "");
      setContrastRequired(false);
      setFastingRequired(false);
      setSpecialPreparation("");
    }
  }, [order, rooms, technologists, radiologists]);

  const selectedRoom = rooms.find((r) => r.id === roomId);

  async function handleSubmit() {
    if (!order || !roomId || !selectedRoom) return;
    await api.scheduleImagingOrder(order.id, {
      scheduledDateTime: `${date}T${time}:00`,
      roomId,
      modalityId: selectedRoom.modalityId,
      technologistId: technologistId || undefined,
      radiologistId: radiologistId || undefined,
      contrastRequired,
      fastingRequired,
      specialPreparation: specialPreparation || undefined,
    });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title="Schedule Study"
      subtitle={order ? `${order.orderNumber} · ${order.patientName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!roomId}>
            Schedule
          </Button>
        </div>
      }
    >
      {order && (
        <>
          <FormSection title="Patient & Order">
            <div className="rounded-xl border border-line px-3.5 py-3 mb-1">
              <p className="text-sm font-semibold text-on-surface">{order.patientName}</p>
              <p className="text-xs text-on-surface-variant">
                {order.studyName} · {order.orderNumber}
              </p>
            </div>
          </FormSection>

          <FormSection title="Schedule">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Date">
                <input type="date" className={formInputClass} value={date} onChange={(e) => setDate(e.target.value)} />
              </FormField>
              <FormField label="Time">
                <input type="time" className={formInputClass} value={time} onChange={(e) => setTime(e.target.value)} />
              </FormField>
            </div>
            <FormField label="Room / Modality">
              <select className={formInputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.number} — {r.location}
                  </option>
                ))}
              </select>
            </FormField>
          </FormSection>

          <FormSection title="Staff">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Technologist">
                <select className={formInputClass} value={technologistId} onChange={(e) => setTechnologistId(e.target.value)}>
                  {technologists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Radiologist">
                <select className={formInputClass} value={radiologistId} onChange={(e) => setRadiologistId(e.target.value)}>
                  {radiologists.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Preparation">
            <div className="flex flex-col gap-2 mb-4">
              <label className="flex items-center gap-2 text-sm text-on-surface">
                <input type="checkbox" className="accent-signal-indigo" checked={contrastRequired} onChange={(e) => setContrastRequired(e.target.checked)} />
                Contrast required
              </label>
              <label className="flex items-center gap-2 text-sm text-on-surface">
                <input type="checkbox" className="accent-signal-indigo" checked={fastingRequired} onChange={(e) => setFastingRequired(e.target.checked)} />
                Fasting required
              </label>
            </div>
            <FormField label="Special Preparation (optional)">
              <input className={formInputClass} value={specialPreparation} onChange={(e) => setSpecialPreparation(e.target.value)} placeholder="e.g. Pregnancy screening required" />
            </FormField>
          </FormSection>
        </>
      )}
    </Drawer>
  );
}
