import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, PlusCircle, FlaskConical, Syringe, Share2, LogOut } from "lucide-react";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { EDEncounter, EDPatient, TriageAssessment, VitalReading, EDOrder, EDProcedure, Consultation, OrderType, OrderPriority } from "@modules/emergency/api";
import { ACUITY_LABEL, ACUITY_COLOR } from "@modules/emergency/api";

const ORDER_TYPES: OrderType[] = ["Lab", "Radiology", "Medication"];
const ORDER_PRIORITIES: OrderPriority[] = ["Routine", "Urgent", "STAT"];
const ORDER_STATUS_STYLE = { Ordered: "bg-slate-100 text-slate-600", "In Progress": "bg-amber-50 text-amber-700", Completed: "bg-emerald-50 text-emerald-700", Critical: "bg-rose-50 text-rose-700" };

export function EncounterWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [encounter, setEncounter] = useState<EDEncounter | null>(null);
  const [patient, setPatient] = useState<EDPatient | null>(null);
  const [triage, setTriage] = useState<TriageAssessment | null>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [orders, setOrders] = useState<EDOrder[]>([]);
  const [procedures, setProcedures] = useState<EDProcedure[]>([]);
  const [consults, setConsults] = useState<Consultation[]>([]);

  const [noteText, setNoteText] = useState("");
  const [orderDesc, setOrderDesc] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Lab");
  const [orderPriority, setOrderPriority] = useState<OrderPriority>("Routine");
  const [showDisposition, setShowDisposition] = useState(false);

  function refresh() {
    if (!id) return;
    Promise.all([
      api.getEncounterById(id),
      api.getTriageForEncounter(id),
      api.getVitalsForEncounter(id),
      api.getOrdersForEncounter(id),
      api.getProceduresForEncounter(id),
      api.getConsultationsForEncounter(id),
    ]).then(([enc, tri, vit, ord, proc, cons]) => {
      setEncounter(enc);
      setTriage(tri);
      setVitals(vit);
      setOrders(ord);
      setProcedures(proc);
      setConsults(cons);
      if (enc) api.getEDPatientById(enc.patientId).then(setPatient);
      setLoading(false);
    });
  }
  useEffect(refresh, [id]);

  function handleAddNote() {
    if (!id || !noteText.trim()) return;
    api.addClinicalNote(id, noteText.trim(), "Dr. Sana Riaz").then(() => {
      setNoteText("");
      refresh();
    });
  }

  function handleCreateOrder() {
    if (!id || !encounter || !orderDesc.trim()) return;
    api.createOrder(id, encounter.patientId, orderType, orderDesc.trim(), orderPriority, "Dr. Sana Riaz").then(() => {
      setOrderDesc("");
      refresh();
    });
  }

  return (
    <EmergencyLayout active="Doctor Workspace">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {loading && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-500">Loading…</div>}
      {!loading && (!encounter || !patient) && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-600 font-semibold">Encounter not found.</div>}

      {!loading && encounter && patient && (
        <>
          {/* Patient banner */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <p className="text-base font-bold text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-500">{patient.age ?? "Unknown"} yrs · {patient.gender} · {patient.mrn} · {encounter.area ?? "No area"}{encounter.bedId ? ` · Bed ${encounter.bedId.replace("bed-", "")}` : ""}</p>
                </div>
              </div>
              {encounter.acuityLevel && <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: ACUITY_COLOR[encounter.acuityLevel] }}>{encounter.acuityLevel} — {ACUITY_LABEL[encounter.acuityLevel]}</span>}
            </div>
            {patient.allergies.length > 0 && (
              <div className="mt-3 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Allergies</p>
                {patient.allergies.map((a) => <p key={a.substance} className="text-xs text-rose-600">{a.substance} — {a.reaction}</p>)}
              </div>
            )}
            <p className="text-sm text-slate-700 mt-3"><span className="font-semibold">Chief complaint:</span> {encounter.chiefComplaint}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Triage + Vitals */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Triage & Vitals Trend</h2>
              {triage ? (
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div><p className="text-slate-400">BP</p><p className="font-bold text-slate-800">{triage.vitals.bp ?? "—"}</p></div>
                  <div><p className="text-slate-400">HR</p><p className="font-bold text-slate-800">{triage.vitals.hr ?? "—"}</p></div>
                  <div><p className="text-slate-400">SpO₂</p><p className="font-bold text-slate-800">{triage.vitals.spo2 ?? "—"}%</p></div>
                </div>
              ) : <p className="text-xs text-slate-400 mb-3">Not yet triaged.</p>}
              <div className="flex flex-col divide-y divide-slate-50">
                {vitals.map((v) => (
                  <div key={v.id} className="py-1.5 text-xs text-slate-600 flex items-center gap-3">
                    <span className="font-mono text-slate-400 w-14 flex-shrink-0">{v.at}</span>
                    <span>{v.bp && `BP ${v.bp}`} {v.hr && `HR ${v.hr}`} {v.spo2 && `SpO₂ ${v.spo2}%`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Clinical Notes</h2>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Add a clinical note…" className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 mb-2" />
              <button type="button" onClick={handleAddNote} disabled={!noteText.trim()} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 rounded-lg px-3 py-1.5 mb-3">Save Note</button>
              <div className="flex flex-col divide-y divide-slate-50 max-h-40 overflow-y-auto">
                {[...encounter.notes].reverse().map((n, i) => <p key={i} className="text-xs text-slate-600 py-2"><span className="font-semibold text-slate-800">{n.author}</span> ({n.at}): {n.text}</p>)}
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5"><FlaskConical className="w-4 h-4 text-slate-400" /> Orders & Results</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)} className="text-xs rounded-lg border border-slate-200 px-2 py-2">{ORDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
              <input value={orderDesc} onChange={(e) => setOrderDesc(e.target.value)} placeholder="Description" className="flex-1 min-w-[160px] text-xs rounded-lg border border-slate-200 px-3 py-2" />
              <select value={orderPriority} onChange={(e) => setOrderPriority(e.target.value as OrderPriority)} className="text-xs rounded-lg border border-slate-200 px-2 py-2">{ORDER_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select>
              <button type="button" onClick={handleCreateOrder} disabled={!orderDesc.trim()} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 rounded-lg px-3 py-2">Order</button>
            </div>
            <div className="flex flex-col divide-y divide-slate-50">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 py-2 flex-wrap text-xs">
                  <span className="font-semibold text-slate-800 min-w-0 flex-1">{o.type}: {o.description}</span>
                  <span className="text-slate-400">{o.priority}</span>
                  <span className={`font-semibold rounded-full px-2 py-0.5 ${ORDER_STATUS_STYLE[o.status]}`}>{o.status}</span>
                  {o.resultSummary && <span className="text-slate-500 w-full">{o.resultSummary}</span>}
                  {o.status === "Ordered" && <button type="button" onClick={() => api.advanceOrder(o.id).then(refresh)} className="text-red-700 font-semibold hover:underline">Start</button>}
                  {o.status === "In Progress" && <button type="button" onClick={() => api.completeOrder(o.id, "Result documented", false).then(refresh)} className="text-emerald-700 font-semibold hover:underline">Complete</button>}
                </div>
              ))}
              {orders.length === 0 && <p className="text-xs text-slate-400 py-2">No orders yet.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Procedures */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5"><Syringe className="w-4 h-4 text-slate-400" /> Procedures</h2>
              {procedures.map((p) => <p key={p.id} className="text-xs text-slate-600 py-1.5 border-b border-slate-50 last:border-0"><span className="font-semibold text-slate-800">{p.name}</span> — {p.performer} · {p.at} · {p.outcome}</p>)}
              {procedures.length === 0 && <p className="text-xs text-slate-400">No procedures recorded.</p>}
            </div>

            {/* Consultations */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5"><Share2 className="w-4 h-4 text-slate-400" /> Consultations</h2>
              {consults.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0 text-xs">
                  <span className="text-slate-700">{c.specialty} — {c.consultant}</span>
                  <span className="font-semibold text-slate-500">{c.status}</span>
                </div>
              ))}
              {consults.length === 0 && <p className="text-xs text-slate-400">No consultations requested.</p>}
            </div>
          </div>

          {/* Disposition */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <button type="button" onClick={() => setShowDisposition((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg px-4 py-2.5">
              <LogOut className="w-3.5 h-3.5" /> Record Disposition
            </button>
            {showDisposition && <DispositionForm encounterId={encounter.id} patientId={patient.id} onDone={() => { setShowDisposition(false); navigate(ROUTES.EMERGENCY.DISPOSITION); }} />}
          </div>
        </>
      )}
    </EmergencyLayout>
  );
}

function DispositionForm({ encounterId, patientId, onDone }: { encounterId: string; patientId: string; onDone: () => void }) {
  const TYPES: Array<Parameters<typeof api.recordDisposition>[2]> = ["Discharge Home", "Admit", "Transfer", "Observation", "Referred", "Left Before Treatment", "Against Medical Advice", "Deceased"];
  const [type, setType] = useState(TYPES[0]);
  const [notes, setNotes] = useState("");

  return (
    <div className="mt-4 pt-4 border-t border-slate-50">
      <div className="flex flex-wrap gap-2 mb-3">
        {TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setType(t)} className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border ${type === t ? "bg-red-600 border-red-600 text-white" : "bg-white border-slate-200 text-slate-500"}`}>{t}</button>
        ))}
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Disposition notes…" className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 mb-3" />
      <button
        type="button"
        onClick={() => api.recordDisposition(encounterId, patientId, type, "Dr. Sana Riaz", notes.trim() || "No additional notes.").then(onDone)}
        className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2.5"
      >
        Confirm Disposition
      </button>
    </div>
  );
}
