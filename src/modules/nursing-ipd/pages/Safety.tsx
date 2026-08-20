import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { SafetyQueueItem } from "@modules/nursing-ipd/api";

const ITEMS: { key: "bedRailsUp" | "callBellInReach" | "fallPrecautionsInPlace"; label: string }[] = [
  { key: "bedRailsUp", label: "Bed rails up" },
  { key: "callBellInReach", label: "Call bell within reach" },
  { key: "fallPrecautionsInPlace", label: "Fall precautions in place" },
];

export function Safety() {
  const [queue, setQueue] = useState<SafetyQueueItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { bedRailsUp: boolean; callBellInReach: boolean; fallPrecautionsInPlace: boolean }>>({});

  function refresh() {
    api.getSafetyQueue().then((items) => {
      setQueue(items);
      setDrafts((prev) =>
        Object.fromEntries(
          items.map((i) => [
            i.patient.id,
            prev[i.patient.id] ?? {
              bedRailsUp: i.check?.bedRailsUp ?? false,
              callBellInReach: i.check?.callBellInReach ?? false,
              fallPrecautionsInPlace: i.check?.fallPrecautionsInPlace ?? false,
            },
          ])
        )
      );
    });
  }

  useEffect(refresh, []);

  function handleSave(patientId: string) {
    const fields = drafts[patientId];
    if (fields) api.saveSafetyCheck(patientId, fields).then(refresh);
  }

  return (
    <NurseLayout active="Safety">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Safety Checks</h1>
        <p className="text-xs text-slate-500 mt-0.5">Environmental safety checklist across your assigned patients.</p>
      </div>

      <div className="flex flex-col gap-4">
        {queue.map(({ patient, check }) => {
          const d = drafts[patient.id];
          if (!d) return null;
          return (
            <div key={patient.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
                <div className="flex items-center gap-3">
                  <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                    <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed} · Fall Risk: {patient.fallRisk}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0">{check ? `Last checked ${check.checkedAt}` : "Not checked yet"}</span>
              </div>
              <div className="flex flex-wrap gap-4 mb-3">
                {ITEMS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d[key]}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [patient.id]: { ...prev[patient.id], [key]: e.target.checked } }))}
                      className="w-4 h-4 accent-teal-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleSave(patient.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Save Check
              </button>
            </div>
          );
        })}
      </div>
    </NurseLayout>
  );
}
