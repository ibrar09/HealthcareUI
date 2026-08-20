import { useEffect, useState } from "react";
import { CheckCircle2, Stethoscope } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { RoundsQueueItem } from "@modules/nursing-ipd/api";

export function Rounds() {
  const [queue, setQueue] = useState<RoundsQueueItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function refresh() {
    api.getRoundsQueue().then((items) => {
      setQueue(items);
      setDrafts((prev) => Object.fromEntries(items.map((i) => [i.patient.id, prev[i.patient.id] ?? i.notes ?? ""])));
    });
  }

  useEffect(refresh, []);

  function handleMark(patientId: string) {
    api.markRounded(patientId, drafts[patientId] ?? "").then(refresh);
  }

  return (
    <NurseLayout active="Rounds">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Rounds</h1>
        <p className="text-xs text-slate-500 mt-0.5">Physician rounding status across your assigned patients.</p>
      </div>

      <div className="flex flex-col gap-4">
        {queue.map(({ patient, roundedAt }) => (
          <div key={patient.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-3">
                <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                  <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
                </div>
              </div>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${roundedAt ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                {roundedAt ? `Rounded ${roundedAt}` : "Not rounded"}
              </span>
            </div>
            <textarea
              value={drafts[patient.id] ?? ""}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [patient.id]: e.target.value }))}
              rows={2}
              placeholder="Rounding notes…"
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200"
            />
            <button
              type="button"
              onClick={() => handleMark(patient.id)}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5"
            >
              {roundedAt ? <Stethoscope className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />} {roundedAt ? "Update Rounding" : "Mark Rounded"}
            </button>
          </div>
        ))}
      </div>
    </NurseLayout>
  );
}
