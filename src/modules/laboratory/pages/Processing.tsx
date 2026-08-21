import { useEffect, useState } from "react";
import { FlaskConical, CheckCircle2 } from "lucide-react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabOrder, LabPatient, LabSpecimen, LabTest } from "@modules/laboratory/api";

export function Processing() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);
  const [specimens, setSpecimens] = useState<LabSpecimen[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);

  function refresh() {
    api.getOrders().then((all) => setOrders(all.filter((o) => o.status === "Received")));
    api.getLabPatients().then(setPatients);
    api.getSpecimens().then(setSpecimens);
    api.getTests().then(setTests);
  }
  useEffect(refresh, []);

  return (
    <LaboratoryLayout active="Processing & Aliquots">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Specimen Processing & Aliquots</h1>
        <p className="text-xs text-slate-500 mt-0.5">Centrifugation, separation, and aliquoting before analyzer testing.</p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-sm text-slate-500">No specimens awaiting processing.</div>
        ) : (
          orders.map((order) => {
            const patient = patients.find((p) => p.id === order.patientId);
            const specimen = specimens.find((s) => s.orderId === order.id);
            if (!patient) return null;
            const sections = Array.from(new Set(order.testIds.map((id) => tests.find((t) => t.id === id)?.section).filter(Boolean)));
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div><p className="text-sm font-bold text-slate-800">{patient.name}</p><p className="text-[11px] text-slate-400">{order.accessionNo} · {specimen?.sampleType}</p></div>
                </div>
                <p className="text-xs text-slate-500 mb-3">Will be aliquoted into {sections.length} aliquot(s) for: {sections.join(", ")}</p>
                <button type="button" onClick={() => api.setOrderStatus(order.id, "Testing").then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete Processing → Send to Analyzer
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5"><FlaskConical className="w-4 h-4 text-slate-400" /> Currently in Processing/Testing</h2>
        <p className="text-xs text-slate-500">See the Worklists screen for section-by-section testing status.</p>
      </div>
    </LaboratoryLayout>
  );
}
