import { useState } from "react";
import { AppointmentModalShell } from "@modules/doctor-portal/components/AppointmentModalShell";
import type { Appointment } from "@modules/doctor-portal/api";

interface CancelAppointmentModalProps {
  mode: "cancel" | "decline";
  appointment: Appointment;
  patientName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REASONS = ["Doctor unavailable", "Emergency", "Facility issue", "Patient request", "Other"];

/** Module-local — cancellation/decline form with a required reason, per spec (keeps a cancellation history rather than a silent status flip). */
export function CancelAppointmentModal({ mode, appointment, patientName, onClose, onConfirm }: CancelAppointmentModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState("");

  function handleConfirm() {
    onConfirm(notes.trim() ? `${reason} — ${notes.trim()}` : reason);
  }

  return (
    <AppointmentModalShell
      title={mode === "cancel" ? "Cancel Appointment" : "Decline Appointment Request"}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Keep Appointment</button>
          <button type="button" onClick={handleConfirm} className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl">
            {mode === "cancel" ? "Cancel Appointment" : "Decline Request"}
          </button>
        </>
      }
    >
      <p className="text-xs text-slate-500 mb-1">{patientName}</p>
      <p className="text-xs text-slate-400 mb-4">{appointment.displayDate}{appointment.time ? ` — ${appointment.time}` : ""}</p>

      <p className="text-xs font-semibold text-slate-600 mb-2">Reason</p>
      <div className="flex flex-col gap-2 mb-4">
        {REASONS.map((r) => (
          <label key={r} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input type="radio" name="cancel-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-rose-600" />
            {r}
          </label>
        ))}
      </div>

      <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (optional)</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100" />
    </AppointmentModalShell>
  );
}
