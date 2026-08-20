import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2, PauseCircle, MessageCircleQuestion, Stethoscope } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/pharmacy/api";
import type { MedicationOrder, PharmacyPatient } from "@modules/pharmacy/api";

const SEVERITY_STYLE = { critical: "bg-rose-50 text-rose-700 border-rose-100", high: "bg-orange-50 text-orange-700 border-orange-100", medium: "bg-amber-50 text-amber-700 border-amber-100" };

export function ClinicalVerification() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<MedicationOrder | null>(null);
  const [patient, setPatient] = useState<PharmacyPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [showHold, setShowHold] = useState<"hold" | "clarify" | null>(null);
  const [showIntervention, setShowIntervention] = useState(false);
  const [interventionText, setInterventionText] = useState("");

  function refresh() {
    if (!id) return;
    api.getOrderById(id).then((o) => {
      setOrder(o);
      (o ? api.getPharmacyPatientById(o.patientId) : Promise.resolve(null)).then((p) => {
        setPatient(p);
        setLoading(false);
      });
    });
  }
  useEffect(refresh, [id]);

  function handleVerify() {
    if (!id) return;
    api.verifyOrder(id, "Pharm. Zainab Hussain").then(() => navigate(ROUTES.PHARMACY.PRESCRIPTION_QUEUE));
  }

  function handleHoldOrClarify() {
    if (!id || !reason.trim()) return;
    const action = showHold === "hold" ? api.holdOrder : api.requestClarification;
    action(id, reason.trim()).then(() => navigate(ROUTES.PHARMACY.PRESCRIPTION_QUEUE));
  }

  function handleIntervention() {
    if (!id || !order || !patient || !interventionText.trim()) return;
    api.createIntervention({
      orderId: id, patientId: patient.id, medicationName: order.medicationName,
      issueType: order.alerts[0]?.type === "Allergy" ? "Allergy" : "Other", severity: order.alerts[0]?.severity ?? "medium",
      description: order.alerts[0]?.message ?? interventionText.trim(), recommendation: interventionText.trim(),
    }).then(() => {
      setShowIntervention(false);
      setInterventionText("");
      navigate(ROUTES.PHARMACY.INTERVENTIONS);
    });
  }

  return (
    <PharmacyLayout active="Prescription Queue">
      <button type="button" onClick={() => navigate(ROUTES.PHARMACY.PRESCRIPTION_QUEUE)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Prescription Queue
      </button>

      {loading && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-500">Loading…</div>}
      {!loading && (!order || !patient) && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-600 font-semibold">Order not found.</div>}

      {!loading && order && patient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Patient</h2>
            <div className="flex items-center gap-3 mb-3">
              <img src={patient.avatar} alt={patient.name} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
              <div>
                <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                <p className="text-[11px] text-slate-400">{patient.age} yrs · {patient.gender} · {patient.mrn}</p>
              </div>
            </div>
            {patient.allergies.length > 0 ? (
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs font-bold text-rose-700 mb-1">Allergies</p>
                {patient.allergies.map((a) => <p key={a.substance} className="text-xs text-rose-600"><span className="font-semibold">{a.substance}</span> — {a.reaction}</p>)}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-3">No known allergies.</p>
            )}
            <p className="text-xs font-bold text-slate-800 mb-1">Active Conditions</p>
            <p className="text-xs text-slate-600">{patient.conditions.length ? patient.conditions.join(", ") : "None documented"}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Prescription</h2>
            <div className="grid grid-cols-2 gap-2.5 text-xs mb-3">
              <div><p className="text-slate-400">Medication</p><p className="font-semibold text-slate-800">{order.medicationName} {order.strength}</p></div>
              <div><p className="text-slate-400">Form / Route</p><p className="font-semibold text-slate-800">{order.form} · {order.route}</p></div>
              <div><p className="text-slate-400">Dose / Frequency</p><p className="font-semibold text-slate-800">{order.dose} · {order.frequency}</p></div>
              <div><p className="text-slate-400">Duration / Qty</p><p className="font-semibold text-slate-800">{order.duration} · {order.quantity}</p></div>
              <div><p className="text-slate-400">Indication</p><p className="font-semibold text-slate-800">{order.indication}</p></div>
              <div><p className="text-slate-400">Prescriber</p><p className="font-semibold text-slate-800">{order.prescriber}</p></div>
            </div>
            {order.controlled && <span className="text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-100 rounded-full px-2.5 py-1">Controlled Medication</span>}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Safety Checks</h2>
            {order.alerts.length === 0 ? (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> No safety alerts detected.</p>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {order.alerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 border rounded-xl px-4 py-3 ${SEVERITY_STYLE[a.severity]}`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div><p className="text-xs font-bold">{a.type} — {a.severity}</p><p className="text-xs mt-0.5">{a.message}</p></div>
                  </div>
                ))}
              </div>
            )}

            {order.status !== "Verified" && order.status !== "Ready" && order.status !== "Dispensed" && order.status !== "Cancelled" && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                <button type="button" onClick={handleVerify} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                </button>
                <button type="button" onClick={() => setShowHold("hold")} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg px-4 py-2.5">
                  <PauseCircle className="w-3.5 h-3.5" /> Hold
                </button>
                <button type="button" onClick={() => setShowHold("clarify")} className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-lg px-4 py-2.5">
                  <MessageCircleQuestion className="w-3.5 h-3.5" /> Request Clarification
                </button>
                {order.alerts.length > 0 && (
                  <button type="button" onClick={() => setShowIntervention(true)} className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-lg px-4 py-2.5">
                    <Stethoscope className="w-3.5 h-3.5" /> Document Intervention
                  </button>
                )}
              </div>
            )}

            {showHold && (
              <div className="mt-4 pt-4 border-t border-slate-50">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">{showHold === "hold" ? "Reason for hold" : "Clarification needed"}</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200" />
                <button type="button" onClick={handleHoldOrClarify} disabled={!reason.trim()} className="mt-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 rounded-lg px-4 py-2">Submit</button>
              </div>
            )}

            {showIntervention && (
              <div className="mt-4 pt-4 border-t border-slate-50">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Recommendation to prescriber</label>
                <textarea value={interventionText} onChange={(e) => setInterventionText(e.target.value)} rows={2} className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-200" />
                <button type="button" onClick={handleIntervention} disabled={!interventionText.trim()} className="mt-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 rounded-lg px-4 py-2">Log Intervention</button>
              </div>
            )}
          </div>
        </div>
      )}
    </PharmacyLayout>
  );
}
