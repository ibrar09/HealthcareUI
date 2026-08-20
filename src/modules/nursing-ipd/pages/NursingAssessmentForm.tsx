import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, BodySystem, SystemFinding, SystemFindingValue, RiskLevel } from "@modules/nursing-ipd/api";
import { BODY_SYSTEMS } from "@modules/nursing-ipd/api";

const RISK_LEVELS: RiskLevel[] = ["Low", "Moderate", "High", "Severe"];

export function NursingAssessmentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<NursePatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [findings, setFindings] = useState<Record<BodySystem, SystemFinding>>(
    () => Object.fromEntries(BODY_SYSTEMS.map((system) => [system, { system, finding: "Normal" as SystemFindingValue }])) as Record<BodySystem, SystemFinding>
  );
  const [fallRiskLevel, setFallRiskLevel] = useState<RiskLevel>("Low");
  const [skinRiskLevel, setSkinRiskLevel] = useState<RiskLevel>("Low");
  const [generalNotes, setGeneralNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    api.getPatientById(id).then((p) => {
      setPatient(p);
      setLoading(false);
    });
  }, [id]);

  function setFinding(system: BodySystem, finding: SystemFindingValue) {
    setFindings((prev) => ({ ...prev, [system]: { system, finding, notes: finding === "Normal" ? undefined : prev[system].notes } }));
  }

  function setNotes(system: BodySystem, notes: string) {
    setFindings((prev) => ({ ...prev, [system]: { ...prev[system], notes } }));
  }

  const abnormalMissingNotes = Object.values(findings).some((f) => f.finding === "Abnormal" && !f.notes?.trim());

  function handleSubmit() {
    if (!id || abnormalMissingNotes) return;
    setSaving(true);
    api
      .submitAssessment(id, {
        systems: Object.values(findings),
        fallRiskLevel,
        skinRiskLevel,
        generalNotes: generalNotes.trim() || undefined,
      })
      .then(() => navigate(ROUTES.NURSING.PATIENT_DETAIL(id)));
  }

  return (
    <NurseLayout active="Assessments">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {loading && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-500">Loading…</div>}

      {!loading && !patient && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-600">Patient not found.</p>
        </div>
      )}

      {!loading && patient && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div>
                <h1 className="text-base font-bold text-slate-800">{patient.name}</h1>
                <p className="text-xs text-slate-500">{patient.age} yrs · {patient.gender} · Room {patient.room} · Bed {patient.bed}</p>
              </div>
            </div>
            {patient.allergies.length > 0 && (
              <div className="mt-4 flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-700">Allergies</p>
                  {patient.allergies.map((a) => (
                    <p key={a.substance} className="text-xs text-rose-600"><span className="font-semibold">{a.substance}</span> — {a.reaction}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Systems Assessment</h2>
            <div className="flex flex-col divide-y divide-slate-50">
              {BODY_SYSTEMS.map((system) => {
                const f = findings[system];
                return (
                  <div key={system} className="py-3.5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <p className="text-sm font-semibold text-slate-700">{system}</p>
                      <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setFinding(system, "Normal")}
                          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${f.finding === "Normal" ? "bg-emerald-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinding(system, "Abnormal")}
                          className={`px-3 py-1.5 text-xs font-semibold transition-colors border-l border-slate-200 ${f.finding === "Abnormal" ? "bg-amber-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                        >
                          Abnormal
                        </button>
                      </div>
                    </div>
                    {f.finding === "Abnormal" && (
                      <textarea
                        value={f.notes ?? ""}
                        onChange={(e) => setNotes(system, e.target.value)}
                        placeholder={`Describe the abnormal finding for ${system}…`}
                        rows={2}
                        className="mt-2.5 w-full text-xs rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <label className="text-xs font-bold text-slate-800 block mb-2">Fall Risk Level</label>
              <select
                value={fallRiskLevel}
                onChange={(e) => setFallRiskLevel(e.target.value as RiskLevel)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200"
              >
                {RISK_LEVELS.filter((l) => l !== "Severe").map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <label className="text-xs font-bold text-slate-800 block mb-2">Skin Risk Level</label>
              <select
                value={skinRiskLevel}
                onChange={(e) => setSkinRiskLevel(e.target.value as RiskLevel)}
                className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200"
              >
                {RISK_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
            <label className="text-xs font-bold text-slate-800 block mb-2">General Notes (optional)</label>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows={3}
              placeholder="Any additional observations…"
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {abnormalMissingNotes && (
            <p className="text-xs text-rose-600 font-semibold mb-3">Add a note for every system marked Abnormal before completing the assessment.</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={abnormalMissingNotes || saving}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl px-6 py-3"
          >
            <CheckCircle2 className="w-4 h-4" /> {saving ? "Saving…" : "Complete Assessment"}
          </button>
        </>
      )}
    </NurseLayout>
  );
}
