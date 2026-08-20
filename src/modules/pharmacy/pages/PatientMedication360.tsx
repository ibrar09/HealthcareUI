import { useEffect, useState } from "react";
import { AlertTriangle, Pill, History } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { PharmacyPatient, MedicationOrder, DispensingRecord, AdverseReaction } from "@modules/pharmacy/api";

export function PatientMedication360() {
  const [patients, setPatients] = useState<PharmacyPatient[]>([]);
  const [orders, setOrders] = useState<MedicationOrder[]>([]);
  const [records, setRecords] = useState<DispensingRecord[]>([]);
  const [adrs, setAdrs] = useState<AdverseReaction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    api.getPharmacyPatients().then((p) => { setPatients(p); if (p.length) setSelectedId(p[0].id); });
    api.getOrders().then(setOrders);
    api.getDispensingRecords().then(setRecords);
    api.getAdrs().then(setAdrs);
  }, []);

  const patient = patients.find((p) => p.id === selectedId);

  return (
    <PharmacyLayout active="Patient Medication 360">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Patient Medication 360</h1>
        <p className="text-xs text-slate-500 mt-0.5">Full medication picture for a single patient.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row min-h-[420px] overflow-hidden">
        <div className="sm:w-60 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 divide-y divide-slate-50">
          {patients.map((p) => (
            <button key={p.id} type="button" onClick={() => setSelectedId(p.id)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${selectedId === p.id ? "bg-violet-50" : ""}`}>
              <p className="text-sm font-bold text-slate-800">{p.name}</p>
              <p className="text-[11px] text-slate-400">{p.mrn}</p>
            </button>
          ))}
        </div>

        {patient && (
          <div className="flex-1 p-5">
            <div className="flex items-center gap-3 mb-4">
              <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              <div><p className="text-base font-bold text-slate-800">{patient.name}</p><p className="text-xs text-slate-500">{patient.age} yrs · {patient.gender} · {patient.setting}{patient.ward ? ` · ${patient.ward}` : ""}</p></div>
            </div>

            {patient.allergies.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Allergies</p>
                {patient.allergies.map((a) => <p key={a.substance} className="text-xs text-rose-600">{a.substance} — {a.reaction}</p>)}
              </div>
            )}

            <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" /> Active Orders</p>
            <div className="flex flex-col divide-y divide-slate-50 mb-4">
              {orders.filter((o) => o.patientId === patient.id).map((o) => (
                <div key={o.id} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{o.medicationName} {o.strength} — {o.dose} {o.frequency}</span>
                  <span className="text-slate-400">{o.status}</span>
                </div>
              ))}
              {orders.filter((o) => o.patientId === patient.id).length === 0 && <p className="text-xs text-slate-400 py-2">No orders on file.</p>}
            </div>

            <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Dispensing History</p>
            <div className="flex flex-col divide-y divide-slate-50 mb-4">
              {records.filter((r) => r.patientId === patient.id).map((r) => (
                <div key={r.id} className="py-2 text-xs text-slate-600">{r.medicationName} — Qty {r.quantity} · Batch {r.batchNo} · {r.at}</div>
              ))}
              {records.filter((r) => r.patientId === patient.id).length === 0 && <p className="text-xs text-slate-400 py-2">No dispensing history.</p>}
            </div>

            <p className="text-xs font-bold text-slate-800 mb-2">Adverse Reactions</p>
            <div className="flex flex-col divide-y divide-slate-50">
              {adrs.filter((a) => a.patientId === patient.id).map((a) => (
                <div key={a.id} className="py-2 text-xs text-rose-600">{a.medicationName} — {a.reaction} ({a.severity})</div>
              ))}
              {adrs.filter((a) => a.patientId === patient.id).length === 0 && <p className="text-xs text-slate-400 py-2">None reported.</p>}
            </div>
          </div>
        )}
      </div>
    </PharmacyLayout>
  );
}
