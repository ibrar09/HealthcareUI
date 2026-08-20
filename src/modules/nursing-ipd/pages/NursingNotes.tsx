import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronRight } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { NotesQueueItem } from "@modules/nursing-ipd/api";

export function NursingNotes() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<NotesQueueItem[]>([]);

  useEffect(() => {
    api.getNotesQueue().then(setQueue);
  }, []);

  return (
    <NurseLayout active="Nursing Notes">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Nursing Notes</h1>
        <p className="text-xs text-slate-500 mt-0.5">Shift documentation status across your assigned patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {queue.map(({ patient, lastNoteAt }) => (
          <button
            key={patient.id}
            type="button"
            onClick={() => navigate(ROUTES.NURSING.PATIENT_NOTES(patient.id))}
            className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
          >
            <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
              <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed} · {patient.acuity}</p>
            </div>
            <div className="min-w-0 flex-1 hidden sm:block">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {lastNoteAt ? `Last note ${lastNoteAt}` : "No notes yet this shift"}
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${
                patient.noteStatus === "Documented" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
              }`}
            >
              {patient.noteStatus}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </NurseLayout>
  );
}
