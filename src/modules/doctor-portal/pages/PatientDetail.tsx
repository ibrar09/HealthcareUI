import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, AlertTriangle, Stethoscope } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { PatientHistoryTimeline } from "@modules/doctor-portal/components/PatientHistoryTimeline";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/doctor-portal/api";
import type { RosterPatient, PatientHistory, HistoryEntryType, RosterStatusTone } from "@modules/doctor-portal/api";

const TYPE_CHIPS: { key: HistoryEntryType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "visit", label: "Visits" },
  { key: "condition", label: "Diagnoses" },
  { key: "medication", label: "Medications" },
  { key: "order", label: "Orders" },
  { key: "lab", label: "Labs" },
  { key: "note", label: "Notes" },
];

const TONE_CLASSES: Record<RosterStatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  critical: "bg-rose-50 text-rose-700 border-rose-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<RosterPatient | null>(null);
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<HistoryEntryType | "all">("all");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getRosterPatient(id), api.getPatientHistory(id)]).then(([p, h]) => {
      setPatient(p);
      setHistory(h);
      setLoading(false);
    });
  }, [id]);

  const filteredEntries = useMemo(() => {
    if (!history) return [];
    if (activeType === "all") return history.entries;
    return history.entries.filter((e) => e.type === activeType);
  }, [history, activeType]);

  return (
    <DoctorLayout active="Patients">
      <button
        type="button"
        onClick={() => navigate(ROUTES.DOCTOR.PATIENTS)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Patients
      </button>

      {loading && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-500">Loading patient record…</div>}

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
                  <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${TONE_CLASSES[patient.statusTone]}`}>{patient.status}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {patient.age} yrs · {patient.gender} · DOB {patient.dob} · {patient.mrn}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <a href={`tel:${patient.phone}`} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                    <Phone className="w-3.5 h-3.5" /> {patient.phone}
                  </a>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.conditions.map((c) => (
                      <span key={c} className="text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-100 rounded-full px-2 py-0.5">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.DOCTOR.ENCOUNTER(patient.id))}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-500/30 flex-shrink-0"
              >
                <Stethoscope className="w-3.5 h-3.5" /> Start Encounter
              </button>
            </div>

            {history && history.allergies.length > 0 && (
              <div className="mt-4 flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-rose-700">Allergies</p>
                  {history.allergies.map((a) => (
                    <p key={a.substance} className="text-xs text-rose-600">
                      <span className="font-semibold">{a.substance}</span> — {a.reaction}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter patient history">
              {TYPE_CHIPS.map((chip) => {
                const isActive = chip.key === activeType;
                const count = chip.key === "all" ? history?.entries.length ?? 0 : history?.entries.filter((e) => e.type === chip.key).length ?? 0;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveType(chip.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {chip.label}
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <PatientHistoryTimeline entries={filteredEntries} />
        </>
      )}
    </DoctorLayout>
  );
}
