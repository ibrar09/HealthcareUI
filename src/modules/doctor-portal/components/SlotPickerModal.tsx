import { useState } from "react";
import { AppointmentModalShell } from "@modules/doctor-portal/components/AppointmentModalShell";
import type { Appointment } from "@modules/doctor-portal/api";

interface SlotPickerModalProps {
  mode: "reschedule" | "accept";
  appointment: Appointment;
  patientName: string;
  onClose: () => void;
  onConfirm: (slot: { date: string; displayDate: string; time: string }) => void;
}

export function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

/** Module-local — shared slot-picking form for both "Reschedule" and "Accept Request" (assign a real slot), since both need the same date+time inputs. */
export function SlotPickerModal({ mode, appointment, patientName, onClose, onConfirm }: SlotPickerModalProps) {
  const [date, setDate] = useState(appointment.date > "2026-08-18" ? appointment.date : "2026-08-19");
  const [time, setTime] = useState("09:00");

  function handleConfirm() {
    onConfirm({ date, displayDate: formatDisplayDate(date), time: formatTime12h(time) });
  }

  return (
    <AppointmentModalShell
      title={mode === "reschedule" ? "Reschedule Appointment" : "Accept Appointment Request"}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Cancel</button>
          <button type="button" onClick={handleConfirm} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl">
            {mode === "reschedule" ? "Confirm New Slot" : "Accept & Schedule"}
          </button>
        </>
      }
    >
      <p className="text-xs text-slate-500 mb-4">{patientName}</p>

      {mode === "reschedule" && (
        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-600">
          <p className="text-slate-400">Current</p>
          <p className="font-semibold">{appointment.displayDate} — {appointment.time}</p>
        </div>
      )}
      {mode === "accept" && appointment.preferredWindow && (
        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-600">
          <p className="text-slate-400">Patient's preferred window</p>
          <p className="font-semibold">{appointment.displayDate} — {appointment.preferredWindow}</p>
        </div>
      )}

      <label className="block text-xs font-semibold text-slate-600 mb-1">New Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />

      <label className="block text-xs font-semibold text-slate-600 mb-1">New Time</label>
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100" />
    </AppointmentModalShell>
  );
}
