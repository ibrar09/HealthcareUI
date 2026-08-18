import { AlertCircle } from "lucide-react";
import type { Appointment, AppointmentPriority, RosterPatient } from "@modules/doctor-portal/api";

interface RequestsPanelProps {
  requests: Appointment[];
  roster: RosterPatient[];
  onAccept: (appointment: Appointment) => void;
  onDecline: (appointment: Appointment) => void;
}

const PRIORITY_STYLE: Record<AppointmentPriority, string> = {
  Routine: "", Urgent: "text-amber-600", "High Priority": "text-orange-600", Emergency: "text-rose-600",
};

/** Module-local — pending appointment requests (status "Requested"), regardless of which date they're tentatively proposed for. */
export function RequestsPanel({ requests, roster, onAccept, onDecline }: RequestsPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">Appointment Requests</h2>
        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">{requests.length}</span>
      </div>

      {requests.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">No pending requests.</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {requests.map((r) => {
            const patient = roster.find((p) => p.id === r.patientId);
            if (!patient) return null;
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                    {r.priority !== "Routine" && (
                      <span className={`flex items-center gap-0.5 text-[10px] font-bold ${PRIORITY_STYLE[r.priority]}`}>
                        <AlertCircle className="w-3 h-3" /> {r.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{patient.mrn} · {r.visitType} · {r.department}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{r.reason}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Requested: {r.displayDate}{r.preferredWindow ? ` · ${r.preferredWindow}` : ""}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button type="button" onClick={() => onAccept(r)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5">Accept</button>
                  <button type="button" onClick={() => onDecline(r)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5">Decline</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
