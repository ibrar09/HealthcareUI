import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Repeat, Droplets, FileText, ListChecks } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { NurseTask, TaskSummary, NursePatient, TaskCategory } from "@modules/nursing-ipd/api";

type FilterKey = "all" | "pending" | "completed";

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const CATEGORY_ICON: Record<TaskCategory, typeof Repeat> = {
  Mobility: Repeat,
  Hygiene: Droplets,
  Documentation: FileText,
  Other: ListChecks,
};

export function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<NurseTask[]>([]);
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  function refresh() {
    api.getTasks().then(setTasks);
    api.getMyPatients().then(setPatients);
    api.getTaskSummary().then(setSummary);
  }

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    return [...tasks]
      .filter((t) => (filter === "all" ? true : filter === "pending" ? t.status === "Pending" : t.status === "Completed"))
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [tasks, filter]);

  function handleComplete(id: string) {
    api.completeTask(id).then(() => refresh());
  }

  return (
    <NurseLayout active="Tasks">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Tasks</h1>
        <p className="text-xs text-slate-500 mt-0.5">Shift worklist across your assigned patients.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: "Pending", value: summary?.pending ?? 0, tone: "warning" as const },
          { label: "Completed", value: summary?.completed ?? 0, tone: "success" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[130px]">
            <p className={`text-xl font-bold ${s.tone === "warning" ? "text-amber-600" : "text-emerald-600"}`}>{s.value}</p>
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
          <p className="text-xs text-slate-400 text-center py-10">No tasks match this view.</p>
        ) : (
          filtered.map((task) => {
            const patient = patients.find((p) => p.id === task.patientId);
            if (!patient) return null;
            const Icon = CATEGORY_ICON[task.category];
            return (
              <div key={task.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-14 flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">{task.dueTime}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.NURSING.PATIENT_DETAIL(patient.id))}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:opacity-80"
                >
                  <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                    <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
                  </div>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" /> {task.label}
                  </p>
                  {task.completedAt && <p className="text-[11px] text-emerald-600 ml-5 mt-0.5">Completed {task.completedAt}</p>}
                </div>
                {task.status === "Pending" ? (
                  <button
                    type="button"
                    onClick={() => handleComplete(task.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-emerald-50 text-emerald-700 border-emerald-100">Completed</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </NurseLayout>
  );
}
