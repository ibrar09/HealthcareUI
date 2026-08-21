import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Save, CheckCircle2, AlertTriangle, PlusCircle } from "lucide-react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/radiology/api";
import type { RadiologyOrder, RadiologyPatient, RadiologyReport, RadiologyStudy } from "@modules/radiology/api";

export function StudyWorkspace() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<RadiologyOrder | null>(null);
  const [patient, setPatient] = useState<RadiologyPatient | null>(null);
  const [study, setStudy] = useState<RadiologyStudy | null>(null);
  const [report, setReport] = useState<RadiologyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [technique, setTechnique] = useState("");
  const [comparison, setComparison] = useState("");
  const [showCritical, setShowCritical] = useState(false);
  const [criticalText, setCriticalText] = useState("");
  const [showAddendum, setShowAddendum] = useState(false);
  const [addendumText, setAddendumText] = useState("");

  function refresh() {
    if (!orderId) return;
    api.getOrderById(orderId).then((o) => {
      setOrder(o);
      Promise.all([
        o ? api.getRadiologyPatientById(o.patientId) : Promise.resolve(null),
        api.getStudyByOrderId(orderId),
        api.getReportByOrderId(orderId),
      ]).then(([p, s, r]) => {
        setPatient(p);
        setStudy(s);
        setReport(r);
        if (r) { setFindings(r.findings); setImpression(r.impression); setTechnique(r.technique); setComparison(r.comparison); }
        setLoading(false);
      });
    });
  }
  useEffect(refresh, [orderId]);

  function handleSaveDraft() {
    if (!order || !patient) return;
    api.saveDraft(order.id, patient.id, "Dr. Radiologist Iqra Sheikh", { clinicalIndication: order.indication, technique, comparison, findings, impression }).then((r) => {
      setReport(r);
      setOrder((prev) => (prev ? { ...prev, status: "Report Draft" } : prev));
    });
  }

  function handleFinalize() {
    if (!order) return;
    api.finalizeReport(order.id).then((r) => {
      if (r) setReport(r);
      setOrder((prev) => (prev ? { ...prev, status: "Finalized" } : prev));
    });
  }

  function handleAddendum() {
    if (!order || !addendumText.trim()) return;
    api.addAddendum(order.id, addendumText.trim(), "Dr. Radiologist Iqra Sheikh").then((r) => {
      if (r) setReport(r);
      setAddendumText("");
      setShowAddendum(false);
    });
  }

  function handleCriticalFinding() {
    if (!order || !patient || !criticalText.trim()) return;
    api.createCriticalFinding({ patientId: patient.id, orderId: order.id, finding: criticalText.trim(), severity: "critical", recipientDoctor: order.orderingDoctor }).then(() => {
      setCriticalText("");
      setShowCritical(false);
      navigate(ROUTES.RADIOLOGY.CRITICAL_FINDINGS);
    });
  }

  return (
    <RadiologyLayout active="Radiologist Worklist">
      <button type="button" onClick={() => navigate(ROUTES.RADIOLOGY.RADIOLOGIST_WORKLIST)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Radiologist Worklist
      </button>

      {loading && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-500">Loading…</div>}
      {!loading && (!order || !patient) && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-600 font-semibold">Order not found.</div>}

      {!loading && order && patient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-slate-900 rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center min-h-[420px] text-center">
            <ImageOff className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No PACS connected</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">This pane renders DICOM images once integrated with a real PACS/viewer. Study reference: {study?.accessionNumber ?? "pending acquisition"}.</p>
            {study && <p className="text-[11px] text-slate-600 mt-3">{study.imageCount} images · UID {study.studyInstanceUID}</p>}
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-2">
                <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div><p className="text-sm font-bold text-slate-800">{patient.name}</p><p className="text-[11px] text-slate-400">{patient.age} yrs · {patient.mrn} · {order.study}</p></div>
              </div>
              {patient.allergies.length > 0 && <p className="text-xs text-rose-600">⚠ {patient.allergies.map((a) => a.substance).join(", ")}</p>}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Report</h2>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Technique</label>
              <input value={technique} onChange={(e) => setTechnique(e.target.value)} className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 mb-2" />
              <label className="text-xs font-semibold text-slate-600 block mb-1">Comparison</label>
              <input value={comparison} onChange={(e) => setComparison(e.target.value)} className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 mb-2" />
              <label className="text-xs font-semibold text-slate-600 block mb-1">Findings</label>
              <textarea value={findings} onChange={(e) => setFindings(e.target.value)} rows={4} className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 mb-2" />
              <label className="text-xs font-semibold text-slate-600 block mb-1">Impression</label>
              <textarea value={impression} onChange={(e) => setImpression(e.target.value)} rows={3} className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 mb-3" />

              {report?.status === "Final" || report?.status === "Amended" ? (
                <p className="text-xs text-emerald-600 font-semibold mb-3">Finalized {report.finalizedAt} — v{report.version}{report.status === "Amended" ? " (amended)" : ""}</p>
              ) : (
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={handleSaveDraft} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-2">
                    <Save className="w-3.5 h-3.5" /> Save Draft
                  </button>
                  <button type="button" onClick={handleFinalize} disabled={!report} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Finalize & Sign
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button type="button" onClick={() => setShowCritical((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Critical Finding
                </button>
                {report?.status === "Final" && (
                  <button type="button" onClick={() => setShowAddendum((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-lg px-3 py-2">
                    <PlusCircle className="w-3.5 h-3.5" /> Add Addendum
                  </button>
                )}
              </div>

              {showCritical && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <textarea value={criticalText} onChange={(e) => setCriticalText(e.target.value)} rows={2} placeholder="Describe the critical finding…" className="w-full text-xs rounded-lg border border-rose-200 px-3 py-2 mb-2" />
                  <button type="button" onClick={handleCriticalFinding} disabled={!criticalText.trim()} className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 rounded-lg px-3 py-2">Notify Ordering Doctor</button>
                </div>
              )}
              {showAddendum && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <textarea value={addendumText} onChange={(e) => setAddendumText(e.target.value)} rows={2} placeholder="Addendum text…" className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 mb-2" />
                  <button type="button" onClick={handleAddendum} disabled={!addendumText.trim()} className="text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 rounded-lg px-3 py-2">Add Addendum</button>
                </div>
              )}
              {report && report.addenda.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  {report.addenda.map((a, i) => <p key={i} className="text-xs text-slate-600 mb-1"><span className="font-semibold">Addendum ({a.at}):</span> {a.text}</p>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </RadiologyLayout>
  );
}
