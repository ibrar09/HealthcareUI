import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, CriticalAlert, AcuityLevel } from "@modules/emergency/api";
import { ACUITY_LABEL, ACUITY_COLOR } from "@modules/emergency/api";

const STATUS_STYLE: Record<string, string> = {
  Arrived: "bg-slate-100 text-slate-600", Triaged: "bg-blue-50 text-blue-700", Waiting: "bg-amber-50 text-amber-700",
  "In Treatment": "bg-red-50 text-red-700", Observation: "bg-purple-50 text-purple-700", "Disposition Pending": "bg-amber-50 text-amber-700",
};

export function Dashboard() {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);
  const [critical, setCritical] = useState<CriticalAlert[]>([]);

  useEffect(() => {
    api.getEncounters().then(setEncounters);
    api.getEDPatients().then(setPatients);
    api.getCriticalAlerts().then(setCritical);
  }, []);

  const active = encounters.filter((e) => !["Discharged", "Admitted", "Transferred", "LWBS", "AMA", "Deceased"].includes(e.status));
  const stats = {
    total: active.length,
    waitingTriage: active.filter((e) => e.status === "Arrived").length,
    waiting: active.filter((e) => e.status === "Waiting").length,
    inTreatment: active.filter((e) => e.status === "In Treatment").length,
    observation: active.filter((e) => e.status === "Observation").length,
    resus: active.filter((e) => e.area === "Resuscitation").length,
    critical: critical.filter((c) => !c.acknowledged).length,
  };

  const cards = [
    { label: "Total ED Patients", value: stats.total, tone: "default", route: ROUTES.EMERGENCY.QUEUE },
    { label: "Waiting for Triage", value: stats.waitingTriage, tone: "warning", route: ROUTES.EMERGENCY.TRIAGE },
    { label: "Waiting for Doctor", value: stats.waiting, tone: "warning", route: ROUTES.EMERGENCY.QUEUE },
    { label: "In Treatment", value: stats.inTreatment, tone: "default", route: ROUTES.EMERGENCY.BEDS },
    { label: "Observation", value: stats.observation, tone: "default", route: ROUTES.EMERGENCY.BEDS },
    { label: "Resuscitation", value: stats.resus, tone: "critical", route: ROUTES.EMERGENCY.BEDS },
    { label: "Critical Results", value: stats.critical, tone: "critical", route: ROUTES.EMERGENCY.CRITICAL_RESULTS },
  ] as const;
  const toneClass: Record<string, string> = { default: "text-slate-800", warning: "text-amber-600", critical: "text-rose-600" };

  return (
    <EmergencyLayout active="Dashboard">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Emergency Department Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time snapshot across the ED.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => navigate(c.route)} className="text-left bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 hover:border-red-200 transition-colors">
            <p className={`text-2xl font-bold ${toneClass[c.tone]}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Live ED Board</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-4">Patient</th><th className="py-2 pr-4">Acuity</th><th className="py-2 pr-4">Area</th><th className="py-2 pr-4">Doctor</th><th className="py-2 pr-4">Arrived</th><th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {active.map((e) => {
                const patient = patients.find((p) => p.id === e.patientId);
                return (
                  <tr key={e.id} className="border-b border-slate-50 cursor-pointer hover:bg-slate-50" onClick={() => navigate(ROUTES.EMERGENCY.ENCOUNTER(e.id))}>
                    <td className="py-2 pr-4 font-semibold text-slate-800">{patient?.name ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {e.acuityLevel && <span className="font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: ACUITY_COLOR[e.acuityLevel as AcuityLevel] }}>{e.acuityLevel} — {ACUITY_LABEL[e.acuityLevel as AcuityLevel]}</span>}
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{e.area ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-500">{e.assignedDoctor ?? "Unassigned"}</td>
                    <td className="py-2 pr-4 text-slate-500">{e.arrivedAt}</td>
                    <td className="py-2"><span className={`text-[11px] font-semibold rounded-full px-2 py-1 ${STATUS_STYLE[e.status] ?? "bg-slate-100 text-slate-600"}`}>{e.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </EmergencyLayout>
  );
}
