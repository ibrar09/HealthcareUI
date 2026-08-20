import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, ShieldAlert, Activity, Pill, ClipboardList, FileText, ClipboardCheck, MoreHorizontal } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import { VitalsEntryModal } from "@modules/nursing-ipd/components/VitalsEntryModal";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, AcuityLevel, NursePatientVitals } from "@modules/nursing-ipd/api";

const ACUITY_TEXT: Record<AcuityLevel, string> = {
  Critical: "text-rose-700 bg-rose-50 border-rose-100", "High Risk": "text-orange-700 bg-orange-50 border-orange-100",
  Attention: "text-amber-700 bg-amber-50 border-amber-100", Stable: "text-emerald-700 bg-emerald-50 border-emerald-100",
};

export function NurseBedsideWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<NursePatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);

  function refresh() {
    if (!id) return;
    api.getPatientById(id).then((p) => {
      setPatient(p);
      setLoading(false);
    });
  }

  useEffect(refresh, [id]);

  function handleSaveVitals(vitals: NursePatientVitals) {
    if (!id) return;
    api.recordVitals(id, vitals).then(() => {
      refresh();
      setVitalsModalOpen(false);
    });
  }

  return (
    <NurseLayout active="My Patients">
      <button
        type="button"
        onClick={() => navigate(ROUTES.NURSING.PATIENTS)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Patients
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
            <div className="flex items-start gap-4 flex-wrap">
              <img src={patient.avatar} alt={patient.name} className="w-16 h-16 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-800">{patient.name}</h1>
                  <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${ACUITY_TEXT[patient.acuity]}`}>{patient.acuity}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {patient.age} yrs · {patient.gender} · {patient.mrn} · Room {patient.room} · Bed {patient.bed}
                </p>
                <p className="text-sm text-slate-600 mt-1.5">{patient.diagnosis}</p>
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

            {patient.isolation && (
              <div className="mt-3 flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                <ShieldAlert className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-violet-700">{patient.isolation.type}</p>
                  <p className="text-xs text-violet-600">Required PPE: {patient.isolation.ppe.join(", ")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">Vitals</h2>
                <span className="text-[11px] text-slate-400">Recorded {patient.vitals.recordedAt ?? "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">BP</p><p className="text-sm font-bold text-slate-800">{patient.vitals.bp ?? "—"}</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">HR</p><p className="text-sm font-bold text-slate-800">{patient.vitals.hr ?? "—"}</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">SpO₂</p><p className={`text-sm font-bold ${(patient.vitals.spo2 ?? 100) < 94 ? "text-rose-600" : "text-slate-800"}`}>{patient.vitals.spo2 ?? "—"}%</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Temp</p><p className="text-sm font-bold text-slate-800">{patient.vitals.temp ?? "—"}°C</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">RR</p><p className="text-sm font-bold text-slate-800">{patient.vitals.rr ?? "—"}</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Pain</p><p className="text-sm font-bold text-slate-800">{patient.vitals.painScore ?? "—"}/10</p></div>
              </div>
              <button
                type="button"
                onClick={() => setVitalsModalOpen(true)}
                className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl py-2.5"
              >
                <Activity className="w-3.5 h-3.5" /> Record Vitals
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Today</h2>
              <div className="flex flex-col divide-y divide-slate-50">
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700"><Pill className="w-3.5 h-3.5 text-slate-400" /> Medication</span>
                  {patient.nextMedication ? (
                    <span className={`text-xs font-semibold ${patient.nextMedication.overdue ? "text-rose-600" : "text-amber-600"}`}>
                      {patient.nextMedication.overdue ? "Overdue" : patient.nextMedication.time}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">None due</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700"><ClipboardList className="w-3.5 h-3.5 text-slate-400" /> Assessment</span>
                  <span className={`text-xs font-semibold ${patient.assessmentDue ? "text-amber-600" : "text-emerald-600"}`}>{patient.assessmentDue ? "Due" : "Done"}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700"><FileText className="w-3.5 h-3.5 text-slate-400" /> Nursing Note</span>
                  <span className={`text-xs font-semibold ${patient.noteStatus === "Pending" ? "text-amber-600" : "text-emerald-600"}`}>{patient.noteStatus}</span>
                </div>
                <button type="button" onClick={() => navigate(ROUTES.NURSING.PATIENT_CARE_PLANS(patient.id))} className="w-full flex items-center justify-between py-2.5 hover:opacity-70">
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700"><ClipboardCheck className="w-3.5 h-3.5 text-slate-400" /> Care Plan</span>
                  <span className="text-xs font-semibold text-slate-600">{patient.activeCarePlans} Active</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setVitalsModalOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl px-4 py-2.5">
                <Activity className="w-3.5 h-3.5" /> Vitals
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.NURSING.MEDICATION_ADMINISTRATION)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl px-4 py-2.5"
              >
                <Pill className="w-3.5 h-3.5" /> Medication
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.NURSING.PATIENT_ASSESSMENT(patient.id))}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl px-4 py-2.5"
              >
                <ClipboardList className="w-3.5 h-3.5" /> Assessment
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.NURSING.PATIENT_NOTES(patient.id))}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl px-4 py-2.5"
              >
                <FileText className="w-3.5 h-3.5" /> Note
              </button>
              <button
                type="button"
                title="More is coming soon"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 rounded-xl px-4 py-2.5 cursor-not-allowed"
              >
                <MoreHorizontal className="w-3.5 h-3.5" /> More
              </button>
            </div>
          </div>
        </>
      )}

      {vitalsModalOpen && patient && (
        <VitalsEntryModal current={patient.vitals} onClose={() => setVitalsModalOpen(false)} onSave={handleSaveVitals} />
      )}
    </NurseLayout>
  );
}
