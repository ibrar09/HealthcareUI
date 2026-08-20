import { useEffect, useState } from "react";
import { CheckCircle2, Circle, LogOut } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { DischargeQueueItem, DischargeChecklistItem } from "@modules/nursing-ipd/api";

export function Discharge() {
  const [queue, setQueue] = useState<DischargeQueueItem[]>([]);
  const [checklists, setChecklists] = useState<Record<string, DischargeChecklistItem[]>>({});

  function refresh() {
    api.getDischargeQueue().then((items) => {
      setQueue(items);
      items.forEach((item) => {
        api.getChecklistForPatient(item.patient.id).then((list) => setChecklists((prev) => ({ ...prev, [item.patient.id]: list })));
      });
    });
  }

  useEffect(refresh, []);

  function handleToggle(id: string) {
    api.toggleChecklistItem(id).then(() => refresh());
  }

  function handleComplete(patientId: string) {
    api.completeDischarge(patientId).then(() => refresh());
  }

  return (
    <NurseLayout active="Discharge">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Discharge</h1>
        <p className="text-xs text-slate-500 mt-0.5">Discharge readiness checklists for patients pending discharge.</p>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-sm font-semibold text-slate-600">No patients pending discharge right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {queue.map(({ patient, completed, total }) => {
            const items = checklists[patient.id] ?? [];
            const allDone = total > 0 && completed === total;
            return (
              <div key={patient.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                  <div className="flex items-center gap-3">
                    <img src={patient.avatar} alt={patient.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                      <p className="text-xs text-slate-500">Room {patient.room} · Bed {patient.bed} · {patient.diagnosis}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 bg-slate-100 text-slate-600 border-slate-200">{completed}/{total} complete</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 mb-4 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
                </div>

                <div className="flex flex-col divide-y divide-slate-50 mb-4">
                  {items.map((item) => (
                    <button key={item.id} type="button" onClick={() => handleToggle(item.id)} className="w-full flex items-center gap-2.5 py-2 text-left hover:opacity-70">
                      {item.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                      <span className={`text-xs ${item.completed ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}>{item.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleComplete(patient.id)}
                  disabled={!allDone}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg px-4 py-2.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Complete Discharge
                </button>
              </div>
            );
          })}
        </div>
      )}
    </NurseLayout>
  );
}
