import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, AcuityLevel } from "@modules/emergency/api";
import { ACUITY_LABEL, ACUITY_COLOR, RED_FLAGS } from "@modules/emergency/api";

const ACUITY_LEVELS: AcuityLevel[] = [1, 2, 3, 4, 5];

export function Triage() {
  const [encounters, setEncounters] = useState<EDEncounter[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bp, setBp] = useState("");
  const [hr, setHr] = useState("");
  const [rr, setRr] = useState("");
  const [temp, setTemp] = useState("");
  const [spo2, setSpo2] = useState("");
  const [painScore, setPainScore] = useState("0");
  const [flags, setFlags] = useState<string[]>([]);
  const [acuity, setAcuityChoice] = useState<AcuityLevel>(3);

  function refresh() {
    api.getEncounters().then((all) => setEncounters(all.filter((e) => e.status === "Arrived")));
    api.getEDPatients().then(setPatients);
  }
  useEffect(refresh, []);

  function toggleFlag(flag: string) {
    setFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]));
  }

  function handleSubmit(encounterId: string) {
    api.submitTriage(
      encounterId,
      { bp: bp || undefined, hr: hr ? Number(hr) : undefined, rr: rr ? Number(rr) : undefined, temp: temp ? Number(temp) : undefined, spo2: spo2 ? Number(spo2) : undefined, painScore: Number(painScore) },
      flags, acuity, "Nurse Amina Riaz"
    ).then(() => {
      setExpanded(null);
      setBp(""); setHr(""); setRr(""); setTemp(""); setSpo2(""); setPainScore("0"); setFlags([]); setAcuityChoice(3);
      refresh();
    });
  }

  return (
    <EmergencyLayout active="Triage">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Triage</h1>
        <p className="text-xs text-slate-500 mt-0.5">Chief complaint, vitals, configured red flags, and acuity assignment.</p>
      </div>

      <div className="flex flex-col gap-3">
        {encounters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-sm text-slate-500">No patients awaiting triage.</div>
        ) : (
          encounters.map((e) => {
            const patient = patients.find((p) => p.id === e.patientId);
            const isOpen = expanded === e.id;
            return (
              <div key={e.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <button type="button" onClick={() => setExpanded(isOpen ? null : e.id)} className="w-full flex items-center gap-4 px-5 py-3.5 text-left flex-wrap">
                  <img src={patient?.avatar} alt={patient?.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient?.name}</p><p className="text-[11px] text-slate-400">{patient?.mrn} · {e.chiefComplaint}</p></div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-50">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                      <input value={bp} onChange={(ev) => setBp(ev.target.value)} placeholder="BP" className="text-xs rounded-lg border border-slate-200 px-2 py-2" />
                      <input value={hr} onChange={(ev) => setHr(ev.target.value)} placeholder="HR" className="text-xs rounded-lg border border-slate-200 px-2 py-2" />
                      <input value={rr} onChange={(ev) => setRr(ev.target.value)} placeholder="RR" className="text-xs rounded-lg border border-slate-200 px-2 py-2" />
                      <input value={temp} onChange={(ev) => setTemp(ev.target.value)} placeholder="Temp °C" className="text-xs rounded-lg border border-slate-200 px-2 py-2" />
                      <input value={spo2} onChange={(ev) => setSpo2(ev.target.value)} placeholder="SpO₂ %" className="text-xs rounded-lg border border-slate-200 px-2 py-2" />
                      <input value={painScore} onChange={(ev) => setPainScore(ev.target.value)} placeholder="Pain 0-10" className="text-xs rounded-lg border border-slate-200 px-2 py-2" />
                    </div>

                    <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Red Flags</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {RED_FLAGS.map((flag) => (
                        <button key={flag} type="button" onClick={() => toggleFlag(flag)} className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border ${flags.includes(flag) ? "bg-rose-600 border-rose-600 text-white" : "bg-white border-slate-200 text-slate-500"}`}>{flag}</button>
                      ))}
                    </div>

                    <p className="text-xs font-bold text-slate-800 mb-2">Acuity Level</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ACUITY_LEVELS.map((lvl) => (
                        <button key={lvl} type="button" onClick={() => setAcuityChoice(lvl)} className="text-xs font-semibold rounded-full px-3 py-1.5 border-2" style={{ borderColor: ACUITY_COLOR[lvl], backgroundColor: acuity === lvl ? ACUITY_COLOR[lvl] : "white", color: acuity === lvl ? "white" : ACUITY_COLOR[lvl] }}>
                          {lvl} — {ACUITY_LABEL[lvl]}
                        </button>
                      ))}
                    </div>

                    <button type="button" onClick={() => handleSubmit(e.id)} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2.5">Complete Triage</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </EmergencyLayout>
  );
}
