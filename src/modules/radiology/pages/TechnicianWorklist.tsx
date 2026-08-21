import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, PlayCircle, CheckCircle2 } from "lucide-react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyOrder, RadiologyPatient, MriSafetyStatus } from "@modules/radiology/api";

export function TechnicianWorklist() {
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [patients, setPatients] = useState<RadiologyPatient[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mriStatus, setMriStatus] = useState<MriSafetyStatus>("Cleared");
  const [contrastAgent, setContrastAgent] = useState("Iohexol");
  const [quality, setQuality] = useState<"Acceptable" | "Repeat Required" | "Technical Issue" | "Patient Movement">("Acceptable");

  function refresh() {
    api.getOrders().then((all) => setOrders(all.filter((o) => o.status === "Scheduled" || o.status === "Checked-In" || o.status === "In Progress")));
    api.getRadiologyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  function handleComplete(order: RadiologyOrder) {
    api.completeStudy(order.id, order.patientId, order.modality, order.bodyPart, "Tech. Hamza Iqbal", quality).then(refresh);
  }

  return (
    <RadiologyLayout active="Technician Worklist">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Today's Worklist</h1>
        <p className="text-xs text-slate-500 mt-0.5">Check-in, safety screening, and image acquisition.</p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const patient = patients.find((p) => p.id === order.patientId);
          if (!patient) return null;
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <button type="button" onClick={() => setExpanded(isOpen ? null : order.id)} className="w-full flex items-center gap-4 px-5 py-3.5 text-left flex-wrap">
                <span className="text-sm font-bold text-slate-800 w-14 flex-shrink-0">{order.scheduledAt}</span>
                <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient.name}</p><p className="text-[11px] text-slate-400">{order.study} · {order.room}</p></div>
                {(patient.allergies.length > 0 || patient.pregnant || patient.hasImplants) && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600 border-slate-200">{order.status}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-50">
                  {(patient.allergies.length > 0 || patient.pregnant || patient.hasImplants) && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-3 text-xs text-amber-700">
                      {patient.allergies.map((a) => <p key={a.substance}>⚠ Allergy: {a.substance} — {a.reaction}</p>)}
                      {patient.pregnant && <p>⚠ Patient is pregnant</p>}
                      {patient.hasImplants && <p>⚠ Patient has implants — MRI safety screening required</p>}
                    </div>
                  )}

                  {order.status === "Scheduled" && (
                    <button type="button" onClick={() => api.checkInOrder(order.id).then(refresh)} className="text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg px-3 py-2">Check In Patient</button>
                  )}

                  {order.status === "Checked-In" && (
                    <>
                      {order.modality === "MRI" && (
                        <div className="mb-3 pb-3 border-b border-slate-50">
                          <p className="text-xs font-bold text-slate-800 mb-1.5">MRI Safety Screening</p>
                          <select value={mriStatus} onChange={(e) => setMriStatus(e.target.value as MriSafetyStatus)} className="text-xs rounded-lg border border-slate-200 px-3 py-2 mr-2">
                            {(["Screened", "Cleared", "Requires Review", "Not Cleared"] as MriSafetyStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button type="button" onClick={() => api.recordMriScreening(order.id, mriStatus, "", "Tech. Hamza Iqbal")} className="text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-lg px-3 py-2">Save Screening</button>
                        </div>
                      )}
                      {order.contrastRequired && (
                        <div className="mb-3 pb-3 border-b border-slate-50">
                          <p className="text-xs font-bold text-slate-800 mb-1.5">Contrast Administration</p>
                          <input value={contrastAgent} onChange={(e) => setContrastAgent(e.target.value)} className="text-xs rounded-lg border border-slate-200 px-3 py-2 mr-2" />
                          <button type="button" onClick={() => api.recordContrastAdministration(order.id, contrastAgent, "100mL", "Tech. Hamza Iqbal")} className="text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 rounded-lg px-3 py-2">Record Administration</button>
                        </div>
                      )}
                      <button type="button" onClick={() => api.startProcedure(order.id).then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg px-3 py-2">
                        <PlayCircle className="w-3.5 h-3.5" /> Start Acquisition
                      </button>
                    </>
                  )}

                  {order.status === "In Progress" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={quality} onChange={(e) => setQuality(e.target.value as typeof quality)} className="text-xs rounded-lg border border-slate-200 px-3 py-2">
                        {["Acceptable", "Repeat Required", "Technical Issue", "Patient Movement"].map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <button type="button" onClick={() => handleComplete(order)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete Study
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </RadiologyLayout>
  );
}
