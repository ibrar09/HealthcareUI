import { Stethoscope, Activity, Pill, FlaskConical, FileText } from "lucide-react";
import type { HistoryEntryType, PatientHistoryEntry, RosterStatusTone } from "@modules/doctor-portal/api";

interface PatientHistoryTimelineProps {
  entries: PatientHistoryEntry[];
}

const TYPE_ICON: Record<HistoryEntryType, typeof Stethoscope> = {
  visit: Stethoscope,
  condition: Activity,
  medication: Pill,
  lab: FlaskConical,
  note: FileText,
};

const TYPE_ICON_CLASSES: Record<HistoryEntryType, string> = {
  visit: "bg-blue-50 text-blue-600",
  condition: "bg-rose-50 text-rose-600",
  medication: "bg-violet-50 text-violet-600",
  lab: "bg-emerald-50 text-emerald-600",
  note: "bg-slate-100 text-slate-500",
};

const TONE_TEXT: Record<RosterStatusTone, string> = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  critical: "text-rose-600",
  info: "text-blue-600",
  neutral: "text-slate-500",
};

/** Module-local — chronological, type-tagged clinical timeline for Patient Detail (visits/conditions/medications/labs/notes). */
export function PatientHistoryTimeline({ entries }: PatientHistoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
        <p className="text-sm font-semibold text-slate-600">No history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
      {entries.map((entry) => {
        const Icon = TYPE_ICON[entry.type];
        return (
          <div key={entry.id} className="flex items-start gap-3.5 px-5 py-4">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_ICON_CLASSES[entry.type]}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-bold ${entry.tone ? TONE_TEXT[entry.tone] : "text-slate-800"}`}>{entry.title}</p>
                <span className="text-[11px] text-slate-400 flex-shrink-0">{entry.date}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{entry.summary}</p>
              {entry.meta && <p className="text-[11px] text-slate-400 mt-1">{entry.meta}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
