import { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert, Pill, ClipboardList, CheckSquare, Bell, Save } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, NurseShift, AlertsQueueEntry } from "@modules/nursing-ipd/api";

export function ShiftHandover() {
  const [shift, setShift] = useState<NurseShift | null>(null);
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [alerts, setAlerts] = useState<AlertsQueueEntry[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  useEffect(() => {
    api.getShift().then(setShift);
    api.getMyPatients().then(setPatients);
    api.getAlerts().then(setAlerts);
    api.getAllHandoverNotes().then((all) => setNotes(Object.fromEntries(all.map((n) => [n.patientId, n.note]))));
  }, []);

  function handleSave(patientId: string) {
    api.saveHandoverNote(patientId, notes[patientId] ?? "").then(() => {
      setSavedFlash(patientId);
      setTimeout(() => setSavedFlash(null), 1500);
    });
  }

  return (
    <NurseLayout active="Shift Handover">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Shift Handover</h1>
        <p className="text-xs text-slate-500 mt-0.5">Per-patient briefing for the incoming nurse.</p>
      </div>

      {shift && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5 flex flex-wrap gap-6">
          <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Outgoing Nurse</p><p className="text-sm font-bold text-slate-800">{shift.nurseName}</p></div>
          <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Ward</p><p className="text-sm font-bold text-slate-800">{shift.ward}</p></div>
          <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Shift</p><p className="text-sm font-bold text-slate-800">{shift.shiftType} ({shift.startTime}–{shift.endTime})</p></div>
          <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Charge Nurse</p><p className="text-sm font-bold text-slate-800">{shift.chargeNurse}</p></div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {patients.map((patient) => {
          const patientAlerts = alerts.filter((a) => a.patientId === patient.id && !a.acknowledged);
          return (
            <div key={patient.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div className="flex items-center gap-3">
                  <img src={patient.avatar} alt={patient.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{patient.name} <span className="text-[11px] font-semibold text-slate-400">Room {patient.room} · Bed {patient.bed}</span></p>
                    <p className="text-xs text-slate-500">{patient.diagnosis}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 bg-slate-100 text-slate-600 border-slate-200">{patient.acuity}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {patient.allergies.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-1">
                    <AlertTriangle className="w-3 h-3" /> {patient.allergies.map((a) => a.substance).join(", ")}
                  </span>
                )}
                {patient.isolation && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-1">
                    <ShieldAlert className="w-3 h-3" /> {patient.isolation.type}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-600"><Pill className="w-3.5 h-3.5 text-slate-400" /> {patient.nextMedication ? `Due ${patient.nextMedication.time}` : "None due"}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600"><ClipboardList className="w-3.5 h-3.5 text-slate-400" /> {patient.assessmentDue ? "Assessment due" : "Assessed"}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600"><CheckSquare className="w-3.5 h-3.5 text-slate-400" /> {patient.pendingTasks} task{patient.pendingTasks === 1 ? "" : "s"}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600"><Bell className="w-3.5 h-3.5 text-slate-400" /> {patientAlerts.length} alert{patientAlerts.length === 1 ? "" : "s"}</div>
              </div>

              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Handover Note</label>
              <textarea
                value={notes[patient.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [patient.id]: e.target.value }))}
                rows={2}
                placeholder="Anything the next nurse should know…"
                className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200"
              />
              <button
                type="button"
                onClick={() => handleSave(patient.id)}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 border border-teal-100 rounded-lg px-3 py-1.5"
              >
                <Save className="w-3.5 h-3.5" /> {savedFlash === patient.id ? "Saved" : "Save Note"}
              </button>
            </div>
          );
        })}
      </div>
    </NurseLayout>
  );
}
