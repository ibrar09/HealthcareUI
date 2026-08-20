import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ChevronRight } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { AssessmentQueueItem, AssessmentQueueStatus } from "@modules/nursing-ipd/api";

type FilterKey = "all" | "due" | "scheduled" | "completed";

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "due", label: "Due" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
];

const STATUS_STYLE: Record<AssessmentQueueStatus, string> = {
  Due: "bg-amber-50 text-amber-700 border-amber-100",
  Scheduled: "bg-slate-100 text-slate-600 border-slate-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function Assessments() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<AssessmentQueueItem[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    api.getAssessmentQueue().then(setQueue);
  }, []);

  const summary = useMemo(
    () => ({
      due: queue.filter((q) => q.status === "Due").length,
      scheduled: queue.filter((q) => q.status === "Scheduled").length,
      completed: queue.filter((q) => q.status === "Completed").length,
    }),
    [queue]
  );

  const filtered = useMemo(() => {
    return queue.filter((q) => {
      if (filter === "all") return true;
      if (filter === "due") return q.status === "Due";
      if (filter === "scheduled") return q.status === "Scheduled";
      if (filter === "completed") return q.status === "Completed";
      return true;
    });
  }, [queue, filter]);

  return (
    <NurseLayout active="Assessments">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Nursing Assessments</h1>
        <p className="text-xs text-slate-500 mt-0.5">Systems assessment status across your assigned patients.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: "Due", value: summary.due, tone: "warning" as const },
          { label: "Scheduled", value: summary.scheduled, tone: "default" as const },
          { label: "Completed", value: summary.completed, tone: "success" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[130px]">
            <p className={`text-xl font-bold ${s.tone === "warning" ? "text-amber-600" : s.tone === "success" ? "text-emerald-600" : "text-slate-800"}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.key === filter;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isActive ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No patients match this view.</p>
        ) : (
          filtered.map(({ patient, status, lastAssessedAt, nextDueEstimate }) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => (status === "Completed" ? navigate(ROUTES.NURSING.PATIENT_DETAIL(patient.id)) : navigate(ROUTES.NURSING.PATIENT_ASSESSMENT(patient.id)))}
              className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
            >
              <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed} · {patient.acuity}</p>
              </div>
              <div className="min-w-0 flex-1 hidden sm:block">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                  {status === "Completed" && lastAssessedAt && `Last assessed ${lastAssessedAt}`}
                  {status === "Due" && (lastAssessedAt ? `Previously assessed ${lastAssessedAt}` : "Not yet assessed this shift")}
                  {status === "Scheduled" && nextDueEstimate && `Next due ~${nextDueEstimate}`}
                </p>
              </div>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[status]}`}>{status}</span>
              {status !== "Completed" ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-teal-700 flex-shrink-0">
                  Start <ChevronRight className="w-3.5 h-3.5" />
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </NurseLayout>
  );
}
