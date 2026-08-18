import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, AlertTriangle, Phone, Stethoscope, ExternalLink } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { PatientHistoryTimeline } from "@modules/doctor-portal/components/PatientHistoryTimeline";
import * as api from "@modules/doctor-portal/api";
import type { RosterPatient, PatientHistory, ClinicalStatus } from "@modules/doctor-portal/api";

interface PatientQuickViewProps {
  patientId: string | null;
  onClose: () => void;
}

const CLINICAL_STATUS_DOT: Record<ClinicalStatus, string> = {
  Stable: "bg-emerald-500", Attention: "bg-amber-500", "High Risk": "bg-orange-500", Critical: "bg-rose-500", "Follow-up": "bg-blue-500",
};
const CLINICAL_STATUS_TEXT: Record<ClinicalStatus, string> = {
  Stable: "text-emerald-700 bg-emerald-50 border-emerald-100", Attention: "text-amber-700 bg-amber-50 border-amber-100",
  "High Risk": "text-orange-700 bg-orange-50 border-orange-100", Critical: "text-rose-700 bg-rose-50 border-rose-100",
  "Follow-up": "text-blue-700 bg-blue-50 border-blue-100",
};

/** Module-local — Level 2 "Quick View" slide-over: problem/meds/labs/timeline preview without leaving My Patients. "View Full Record" is the deep link to Patient 360 (PatientDetail). */
export function PatientQuickView({ patientId, onClose }: PatientQuickViewProps) {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<RosterPatient | null>(null);
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    setPatient(null);
    setHistory(null);
    Promise.all([api.getRosterPatient(patientId), api.getPatientHistory(patientId)]).then(([p, h]) => {
      setPatient(p);
      setHistory(h);
      setLoading(false);
    });
  }, [patientId]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!patientId) return null;

  const medications = history?.entries.filter((e) => e.type === "medication") ?? [];
  const labs = history?.entries.filter((e) => e.type === "lab" || e.type === "order") ?? [];
  const recentTimeline = history?.entries.slice(0, 5) ?? [];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Patient quick view" className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-sm font-bold text-slate-800">Quick View</h2>
          <button type="button" onClick={onClose} aria-label="Close quick view" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <p className="text-sm text-slate-500 text-center py-10">Loading…</p>}

          {!loading && patient && (
            <>
              <div className="flex items-start gap-3 mb-4">
                <img src={patient.avatar} alt={patient.name} className="w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-500">{patient.mrn} · {patient.age} yrs · {patient.gender}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold border rounded-full px-2 py-0.5 ${CLINICAL_STATUS_TEXT[patient.clinicalStatus]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${CLINICAL_STATUS_DOT[patient.clinicalStatus]}`} /> {patient.clinicalStatus}
                  </span>
                </div>
              </div>

              <a href={`tel:${patient.phone}`} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-4">
                <Phone className="w-3.5 h-3.5" /> {patient.phone}
              </a>

              {patient.allergies.length > 0 && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-rose-700">Allergies</p>
                    {patient.allergies.map((a) => (
                      <p key={a.substance} className="text-xs text-rose-600"><span className="font-semibold">{a.substance}</span> — {a.reaction}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-3 mb-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Encounter</p>
                <p className="text-sm font-semibold text-slate-800">{patient.encounterType} · {patient.department}</p>
                <p className="text-xs text-slate-500 mt-0.5">{patient.visitReason}</p>
                {(patient.encounterType === "IPD" || patient.encounterType === "Emergency") && (
                  <p className="text-xs text-slate-500 mt-0.5">{patient.location}</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Active Medications</p>
                {medications.length === 0 ? (
                  <p className="text-xs text-slate-400">No active medications on record.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {medications.map((m) => (
                      <p key={m.id} className="text-xs text-slate-700"><span className="font-semibold">{m.title}</span> — {m.summary}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recent Labs</p>
                {labs.length === 0 ? (
                  <p className="text-xs text-slate-400">No recent labs on record.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {labs.map((l) => (
                      <p key={l.id} className="text-xs text-slate-700"><span className="font-semibold">{l.title}</span> — {l.summary}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recent Timeline</p>
                <PatientHistoryTimeline entries={recentTimeline} />
              </div>
            </>
          )}
        </div>

        {!loading && patient && (
          <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(patient.id))}
              className="flex items-center justify-center gap-1.5 flex-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-2.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Full Record
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.DOCTOR.ENCOUNTER(patient.id))}
              className="flex items-center justify-center gap-1.5 flex-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl py-2.5 transition-colors shadow-sm shadow-blue-500/30"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Start Encounter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
