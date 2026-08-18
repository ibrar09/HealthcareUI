import { useState } from "react";
import { AppointmentModalShell } from "@modules/doctor-portal/components/AppointmentModalShell";
import { formatDisplayDate, formatTime12h } from "@modules/doctor-portal/components/SlotPickerModal";
import type { EncounterType, VisitType, AppointmentPriority, NewAppointmentInput, RosterPatient } from "@modules/doctor-portal/api";

interface BookAppointmentModalProps {
  roster: RosterPatient[];
  defaultDate: string;
  onClose: () => void;
  onConfirm: (input: NewAppointmentInput) => void;
}

const ENCOUNTER_TYPES: EncounterType[] = ["OPD", "IPD", "Emergency", "Telemedicine", "Follow-up"];
const VISIT_TYPES: VisitType[] = [
  "New Consultation", "Follow-up", "Second Opinion", "Chronic Disease Review", "Post-Operative Follow-up",
  "Procedure", "Lab Consultation", "Imaging Review", "Telemedicine", "Annual Check-up",
];
const PRIORITIES: AppointmentPriority[] = ["Routine", "Urgent", "High Priority", "Emergency"];

const inputClass = "w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

/** Module-local — the "+ Book Appointment" form: picks an existing roster patient rather than creating a new one. */
export function BookAppointmentModal({ roster, defaultDate, onClose, onConfirm }: BookAppointmentModalProps) {
  const [patientId, setPatientId] = useState(roster[0]?.id ?? "");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(20);
  const [department, setDepartment] = useState("Cardiology");
  const [location, setLocation] = useState("OPD Room 4");
  const [encounterType, setEncounterType] = useState<EncounterType>("OPD");
  const [visitType, setVisitType] = useState<VisitType>("Follow-up");
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [priority, setPriority] = useState<AppointmentPriority>("Routine");
  const [reason, setReason] = useState("");

  const canBook = Boolean(patientId && date && time && reason.trim());

  function handleConfirm() {
    if (!canBook) return;
    onConfirm({
      patientId, date, displayDate: formatDisplayDate(date), time: formatTime12h(time), duration,
      department, location, encounterType, visitType, isNewPatient, priority, reason: reason.trim(),
    });
  }

  return (
    <AppointmentModalShell
      title="Book Appointment"
      onClose={onClose}
      widthClass="max-w-lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={!canBook} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl">
            Book Appointment
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Patient</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={inputClass}>
            {roster.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.mrn}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (minutes)</label>
            <input type="number" min={10} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as AppointmentPriority)} className={inputClass}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Encounter Type</label>
            <select value={encounterType} onChange={(e) => setEncounterType(e.target.value as EncounterType)} className={inputClass}>
              {ENCOUNTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Visit Type</label>
            <select value={visitType} onChange={(e) => setVisitType(e.target.value as VisitType)} className={inputClass}>
              {VISIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Reason for Visit</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="e.g. Chest pain for 2 days" className={inputClass} />
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input type="checkbox" checked={isNewPatient} onChange={(e) => setIsNewPatient(e.target.checked)} className="accent-blue-600" />
          This is a new patient visit
        </label>
      </div>
    </AppointmentModalShell>
  );
}
