import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Activity, Pill, ClipboardList, CheckCircle2 } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { EncounterSectionCard, EncounterAddButton } from "@modules/doctor-portal/components/EncounterSectionCard";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/doctor-portal/api";
import type { RosterPatient, PatientHistoryEntry, OrderUrgency } from "@modules/doctor-portal/api";

const inputClass = "w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export function EncounterWorkspace() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") ?? undefined;
  const navigate = useNavigate();

  const [patient, setPatient] = useState<RosterPatient | null>(null);
  const [loading, setLoading] = useState(true);

  const [diagnoses, setDiagnoses] = useState<PatientHistoryEntry[]>([]);
  const [prescriptions, setPrescriptions] = useState<PatientHistoryEntry[]>([]);
  const [orders, setOrders] = useState<PatientHistoryEntry[]>([]);
  const [notesText, setNotesText] = useState("");
  const [finishing, setFinishing] = useState(false);

  const [dxName, setDxName] = useState("");
  const [dxStatus, setDxStatus] = useState<"Active" | "Resolved" | "Chronic">("Active");
  const [dxNotes, setDxNotes] = useState("");

  const [rxMedication, setRxMedication] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxFrequency, setRxFrequency] = useState("");
  const [rxDuration, setRxDuration] = useState("");
  const [rxInstructions, setRxInstructions] = useState("");

  const [ordTestName, setOrdTestName] = useState("");
  const [ordUrgency, setOrdUrgency] = useState<OrderUrgency>("Routine");
  const [ordInstructions, setOrdInstructions] = useState("");

  useEffect(() => {
    if (!patientId) return;
    api.getRosterPatient(patientId).then((p) => {
      setPatient(p);
      setLoading(false);
    });
  }, [patientId]);

  const canFinish = useMemo(
    () => diagnoses.length > 0 || prescriptions.length > 0 || orders.length > 0 || notesText.trim().length > 0,
    [diagnoses, prescriptions, orders, notesText]
  );

  async function handleAddDiagnosis() {
    if (!patientId || !dxName.trim()) return;
    const history = await api.addEncounterDiagnosis(patientId, { name: dxName.trim(), status: dxStatus, notes: dxNotes.trim() || undefined });
    setDiagnoses((prev) => [history.entries[0], ...prev]);
    setDxName("");
    setDxNotes("");
    setDxStatus("Active");
  }

  async function handleAddPrescription() {
    if (!patientId || !rxMedication.trim() || !rxDosage.trim() || !rxFrequency.trim() || !rxDuration.trim()) return;
    const history = await api.addEncounterPrescription(patientId, {
      medication: rxMedication.trim(), dosage: rxDosage.trim(), frequency: rxFrequency.trim(),
      duration: rxDuration.trim(), instructions: rxInstructions.trim() || undefined,
    });
    setPrescriptions((prev) => [history.entries[0], ...prev]);
    setRxMedication(""); setRxDosage(""); setRxFrequency(""); setRxDuration(""); setRxInstructions("");
  }

  async function handleAddOrder() {
    if (!patientId || !ordTestName.trim()) return;
    const history = await api.addEncounterOrder(patientId, { testName: ordTestName.trim(), urgency: ordUrgency, instructions: ordInstructions.trim() || undefined });
    setOrders((prev) => [history.entries[0], ...prev]);
    setOrdTestName("");
    setOrdInstructions("");
    setOrdUrgency("Routine");
  }

  async function handleFinish() {
    if (!patientId || !canFinish) return;
    setFinishing(true);
    if (notesText.trim()) await api.addEncounterNote(patientId, notesText.trim());
    await api.finishEncounter(patientId, appointmentId);
    navigate(ROUTES.DOCTOR.PATIENT_DETAIL(patientId));
  }

  return (
    <DoctorLayout active="Patients">
      <button
        type="button"
        onClick={() => patientId && navigate(ROUTES.DOCTOR.PATIENT_DETAIL(patientId))}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Record
      </button>

      {loading && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-500">Loading…</div>}

      {!loading && !patient && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-600">Patient not found.</p>
        </div>
      )}

      {!loading && patient && (
        <>
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <img src={patient.avatar} alt={patient.name} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
              <div>
                <h1 className="text-lg font-bold text-slate-800">Encounter — {patient.name}</h1>
                <p className="text-xs text-slate-500">{patient.mrn} · {patient.age} yrs · {patient.gender}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFinish}
              disabled={!canFinish || finishing}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-500/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {finishing ? "Finishing…" : "Finish Encounter"}
            </button>
          </div>
          {!canFinish && (
            <p className="text-[11px] text-slate-400 -mt-3 mb-5">Add at least one diagnosis, prescription, order, or note before finishing.</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <EncounterSectionCard
              icon={<Activity className="w-4 h-4 text-rose-600" />}
              title="Diagnosis"
              count={diagnoses.length}
              emptyLabel="No diagnoses added yet."
              form={
                <div className="flex flex-col gap-2">
                  <input className={inputClass} placeholder="Condition name" value={dxName} onChange={(e) => setDxName(e.target.value)} />
                  <select className={inputClass} value={dxStatus} onChange={(e) => setDxStatus(e.target.value as typeof dxStatus)}>
                    <option value="Active">Active</option>
                    <option value="Chronic">Chronic</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <textarea className={inputClass} rows={2} placeholder="Notes (optional)" value={dxNotes} onChange={(e) => setDxNotes(e.target.value)} />
                  <EncounterAddButton onClick={handleAddDiagnosis} disabled={!dxName.trim()} label="Add Diagnosis" />
                </div>
              }
            >
              {diagnoses.map((d) => (
                <div key={d.id} className="py-2.5 first:pt-0">
                  <p className="text-xs font-bold text-slate-800">{d.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.summary}</p>
                </div>
              ))}
            </EncounterSectionCard>

            <EncounterSectionCard
              icon={<Pill className="w-4 h-4 text-violet-600" />}
              title="Prescription"
              count={prescriptions.length}
              emptyLabel="No prescriptions added yet."
              form={
                <div className="flex flex-col gap-2">
                  <input className={inputClass} placeholder="Medication" value={rxMedication} onChange={(e) => setRxMedication(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputClass} placeholder="Dosage (e.g. 500mg)" value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} />
                    <input className={inputClass} placeholder="Frequency" value={rxFrequency} onChange={(e) => setRxFrequency(e.target.value)} />
                  </div>
                  <input className={inputClass} placeholder="Duration (e.g. 7 days)" value={rxDuration} onChange={(e) => setRxDuration(e.target.value)} />
                  <textarea className={inputClass} rows={2} placeholder="Instructions (optional)" value={rxInstructions} onChange={(e) => setRxInstructions(e.target.value)} />
                  <EncounterAddButton
                    onClick={handleAddPrescription}
                    disabled={!rxMedication.trim() || !rxDosage.trim() || !rxFrequency.trim() || !rxDuration.trim()}
                    label="Add Prescription"
                  />
                </div>
              }
            >
              {prescriptions.map((p) => (
                <div key={p.id} className="py-2.5 first:pt-0">
                  <p className="text-xs font-bold text-slate-800">{p.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.summary}</p>
                </div>
              ))}
            </EncounterSectionCard>

            <EncounterSectionCard
              icon={<ClipboardList className="w-4 h-4 text-amber-600" />}
              title="Orders"
              count={orders.length}
              emptyLabel="No lab/imaging orders yet."
              form={
                <div className="flex flex-col gap-2">
                  <input className={inputClass} placeholder="Test / imaging name" value={ordTestName} onChange={(e) => setOrdTestName(e.target.value)} />
                  <select className={inputClass} value={ordUrgency} onChange={(e) => setOrdUrgency(e.target.value as OrderUrgency)}>
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT</option>
                  </select>
                  <textarea className={inputClass} rows={2} placeholder="Instructions (optional)" value={ordInstructions} onChange={(e) => setOrdInstructions(e.target.value)} />
                  <EncounterAddButton onClick={handleAddOrder} disabled={!ordTestName.trim()} label="Add Order" />
                </div>
              }
            >
              {orders.map((o) => (
                <div key={o.id} className="py-2.5 first:pt-0">
                  <p className="text-xs font-bold text-slate-800">{o.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{o.summary}</p>
                </div>
              ))}
            </EncounterSectionCard>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Encounter Notes</h2>
            <textarea
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-blue-500 focus:outline-none transition-all leading-relaxed"
              rows={4}
              placeholder="Freeform clinical notes for this visit…"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
          </div>
        </>
      )}
    </DoctorLayout>
  );
}
