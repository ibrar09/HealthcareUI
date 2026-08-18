import { Trash2 } from "lucide-react";
import type { WaitlistEntry, RosterPatient } from "@modules/doctor-portal/api";

interface WaitlistPanelProps {
  entries: WaitlistEntry[];
  roster: RosterPatient[];
  onSchedule: (entry: WaitlistEntry) => void;
  onRemove: (id: string) => void;
}

/** Module-local — patients waiting for a slot to open up (no proposed date, unlike a Request). */
export function WaitlistPanel({ entries, roster, onSchedule, onRemove }: WaitlistPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">Waitlist</h2>
        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">No one on the waitlist.</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {entries.map((w) => {
            const patient = roster.find((p) => p.id === w.patientId);
            if (!patient) return null;
            return (
              <div key={w.id} className="flex items-center gap-4 px-5 py-3.5">
                <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                  <p className="text-[11px] text-slate-400">{patient.mrn}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{w.reason}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{w.preferredWindow} · Added {w.addedAt}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button type="button" onClick={() => onSchedule(w)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5">
                    Schedule Now
                  </button>
                  <button type="button" onClick={() => onRemove(w.id)} aria-label={`Remove ${patient.name} from waitlist`} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
