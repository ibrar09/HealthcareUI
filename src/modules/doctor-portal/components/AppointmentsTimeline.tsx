import { Calendar, Check, Phone } from "lucide-react";
import type { DoctorAppointment, AttendedProgress } from "@modules/doctor-portal/api";

interface AppointmentsTimelineProps {
  appointments: DoctorAppointment[];
  progress: AttendedProgress | null;
  activePatientId: string | null;
  onSelectPatient: (id: string) => void;
}

/** Module-local — Today's Appointments as a vertical timeline (spec §6-7), with attended-progress bars at the top. */
export function AppointmentsTimeline({ appointments, progress, activePatientId, onSelectPatient }: AppointmentsTimelineProps) {
  const realCount = appointments.filter((a) => !a.isBreak).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800">Today's Appointments</h2>
        <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors" aria-label="Open calendar">
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {progress && (
        <div className="mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Attended Appointments</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">New Patients</span>
                <span className="text-[11px] font-bold text-slate-700">{progress.newPatients.done}/{progress.newPatients.total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(progress.newPatients.done / progress.newPatients.total) * 100}%` }} />
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Follow-Up Patients</span>
                <span className="text-[11px] font-bold text-slate-700">{progress.followUpPatients.done}/{progress.followUpPatients.total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(progress.followUpPatients.done / progress.followUpPatients.total) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Appointment</span>
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">{realCount}</span>
        </div>
        <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[580px]">
        {appointments.map((apt) => {
          if (apt.isBreak) {
            return (
              <div key={apt.id} className="flex items-center space-x-3 py-2 opacity-60">
                <span className="text-[11px] font-medium text-slate-400 w-10 text-right">{apt.time}</span>
                <div className="flex-1 border-b border-dashed border-slate-300 flex items-center justify-center">
                  <span className="bg-slate-100 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-slate-500">{apt.title}</span>
                </div>
              </div>
            );
          }

          const isSelected = activePatientId === apt.id;
          const isOngoing = apt.status === "ongoing";
          const isAttended = apt.status === "attended";

          return (
            <div key={apt.id} className="relative flex items-center space-x-3 group">
              <div className="w-10 text-right flex-shrink-0">
                <span className="text-[11px] font-semibold text-slate-500">{apt.time}</span>
                {isOngoing && apt.currentTime && (
                  <span className="block text-[10px] font-bold text-white bg-blue-600 px-1 py-0.5 rounded text-center mt-0.5">{apt.currentTime}</span>
                )}
              </div>

              <div className="relative flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 ${
                    isOngoing ? "bg-blue-600 border-blue-200 ring-2 ring-blue-100" : isAttended ? "bg-emerald-500 border-emerald-100" : "bg-slate-300 border-slate-100"
                  }`}
                />
                <div className="w-0.5 h-12 bg-slate-100 -mb-2" />
              </div>

              <button
                type="button"
                onClick={() => onSelectPatient(apt.id)}
                className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                  isSelected ? "bg-blue-50/70 border-blue-200 ring-1 ring-blue-300/50 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={apt.avatar} alt={apt.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-blue-950" : "text-slate-800"}`}>{apt.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{apt.issue}</p>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  {isAttended ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : isOngoing ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 animate-pulse">
                      <Phone className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <Phone className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
