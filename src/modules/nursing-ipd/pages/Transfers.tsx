import { useEffect, useState } from "react";
import { ArrowLeftRight, CheckCircle2, Plus } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { TransferRequest, NursePatient } from "@modules/nursing-ipd/api";

export function Transfers() {
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [reason, setReason] = useState("");

  function refresh() {
    api.getTransfers().then(setTransfers);
    api.getMyPatients().then((p) => {
      setPatients(p);
      if (!patientId && p.length) setPatientId(p[0].id);
    });
  }

  useEffect(refresh, []);

  function handleRequest() {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient || !toLocation.trim() || !reason.trim()) return;
    api.requestTransfer(patientId, `Medical Ward A — Room ${patient.room}`, toLocation.trim(), reason.trim()).then(() => {
      setToLocation("");
      setReason("");
      setShowForm(false);
      refresh();
    });
  }

  return (
    <NurseLayout active="Transfers">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Transfers</h1>
          <p className="text-xs text-slate-500 mt-0.5">Patient transfer requests across your assigned patients.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-2">
          <Plus className="w-3.5 h-3.5" /> New Transfer Request
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Patient</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200">
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Transfer To</label>
              <input value={toLocation} onChange={(e) => setToLocation(e.target.value)} placeholder="e.g. ICU, Step-Down Unit" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Reason</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Clinical reason" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200" />
            </div>
          </div>
          <button type="button" onClick={handleRequest} disabled={!toLocation.trim() || !reason.trim()} className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg px-4 py-2.5">
            Submit Request
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {transfers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No transfer requests yet.</p>
        ) : (
          transfers.map((t) => {
            const patient = patients.find((p) => p.id === t.patientId);
            if (!patient) return null;
            return (
              <div key={t.id} className="px-5 py-3.5">
                <div className="flex items-center gap-4 flex-wrap">
                  <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1"><ArrowLeftRight className="w-3 h-3" /> {t.fromLocation} → {t.toLocation}</p>
                  </div>
                  <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${t.status === "Requested" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>{t.status}</span>
                  {t.status === "Requested" && (
                    <button type="button" onClick={() => api.completeTransfer(t.id).then(refresh)} className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 pl-[52px]">Reason: {t.reason}</p>
              </div>
            );
          })
        )}
      </div>
    </NurseLayout>
  );
}
