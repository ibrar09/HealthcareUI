import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Maximize2, Clock, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { DoctorAppointment } from "@modules/doctor-portal/api";

interface OngoingConsultationCardProps {
  patient: DoctorAppointment | null;
  onSaveNotes: (appointmentId: string, notes: string) => void;
  onFinish: (appointmentId: string) => void;
}

const quickTags = ["Prescribed antacids 20mg", "Follow up in 2 weeks", "Vitals stable (BP 120/80)"];

/** Module-local — the encounter workspace card (spec §5): patient summary, structured detail grid, consultation notes with quick-tag presets, and the finish/save actions. */
export function OngoingConsultationCard({ patient, onSaveNotes, onFinish }: OngoingConsultationCardProps) {
  const navigate = useNavigate();
  const [notesText, setNotesText] = useState(patient?.notes ?? "");

  useEffect(() => {
    setNotesText(patient?.notes ?? "");
  }, [patient?.id]);

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 mb-6">
        Select a patient from Today's Appointments to open their consultation.
      </div>
    );
  }

  function handleAddQuickTag(tag: string) {
    setNotesText((prev) => (prev ? `${prev}\n• ${tag}` : `• ${tag}`));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-slate-800">Ongoing Consultation</h2>
          {patient.status === "ongoing" && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
          )}
        </div>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50" aria-label="Expand">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-between mb-5 gap-3">
        <div className="flex items-center space-x-3.5">
          <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
          <div>
            <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <span>{patient.type ?? "Regular Patient"}</span>
              <span>·</span>
              <span className="font-semibold text-blue-600">{patient.issue}</span>
            </div>
            {patient.patientId && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(patient.patientId!))}
                className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
              >
                View Full History <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
          <span>{patient.timeSlot ?? `${patient.time} – 12:00`}</span>
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <Clock className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-5">
        <div className="xl:col-span-6 grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referring Doctor</p>
            <p className="font-semibold text-slate-700 flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{patient.referringDoctor}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Doctor</p>
            <p className="font-semibold text-slate-700 flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{patient.assignedDoctor}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MRN</p>
            <p className="font-semibold text-slate-700 mt-0.5">{patient.mrn}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupation</p>
            <p className="font-semibold text-slate-700 mt-0.5">{patient.occupation}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coverage Expiry</p>
            <p className="font-semibold text-slate-700 mt-0.5">{patient.coverageExpiry}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</p>
            <p className="font-semibold text-slate-700 mt-0.5">{patient.details}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Special Notes</p>
            <p className="font-medium text-slate-600 mt-0.5 bg-amber-50/60 text-amber-900 border border-amber-100 p-2 rounded-lg text-[11px]">"{patient.specialNotes}"</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
            <p className="font-medium text-slate-600 mt-0.5 truncate">{patient.address}</p>
          </div>
        </div>

        <div className="xl:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="consultation-notes" className="text-xs font-bold text-slate-700">Consultation Notes</label>
              <span className="text-[10px] text-slate-400">Auto-saved to EHR</span>
            </div>
            <textarea
              id="consultation-notes"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Type consultation clinical notes, symptoms, or prescription..."
              rows={5}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-blue-500 focus:outline-none transition-all leading-relaxed"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddQuickTag(tag)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onSaveNotes(patient.id, notesText)}
          className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
        >
          Save Notes
        </button>
        <button
          type="button"
          onClick={() => onFinish(patient.id)}
          className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-500/30"
        >
          Finish Consultation
        </button>
      </div>
    </div>
  );
}
