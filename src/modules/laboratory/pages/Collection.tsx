import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, TestTube, PackageCheck, XCircle } from "lucide-react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabOrder, LabPatient, LabSpecimen, RejectionReason } from "@modules/laboratory/api";

const REJECTION_REASONS: RejectionReason[] = ["Hemolyzed", "Clotted", "Insufficient Quantity", "Wrong Container", "Unlabeled", "Delayed Transport", "Leaking"];

export function Collection() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);
  const [specimens, setSpecimens] = useState<LabSpecimen[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<RejectionReason>("Hemolyzed");

  function refresh() {
    api.getOrders().then((all) => setOrders(all.filter((o) => o.status === "Ordered" || o.status === "Collection Pending" || o.status === "Collected")));
    api.getLabPatients().then(setPatients);
    api.getSpecimens().then(setSpecimens);
  }
  useEffect(refresh, []);

  return (
    <LaboratoryLayout active="Specimen Collection">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Specimen Collection</h1>
        <p className="text-xs text-slate-500 mt-0.5">Two-identifier verification, collection, accessioning, and receiving.</p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const patient = patients.find((p) => p.id === order.patientId);
          const specimen = specimens.find((s) => s.orderId === order.id);
          if (!patient) return null;
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <button type="button" onClick={() => setExpanded(isOpen ? null : order.id)} className="w-full flex items-center gap-4 px-5 py-3.5 text-left flex-wrap">
                <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient.name}</p><p className="text-[11px] text-slate-400">{patient.mrn} · DOB verification required · {order.panelName ?? `${order.testIds.length} test(s)`}</p></div>
                <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600 border-slate-200">{order.status}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-50">
                  {specimen && <p className="text-xs text-slate-500 mb-3">Sample: {specimen.sampleType} · Container: {specimen.container} · Barcode: {specimen.barcodeId}</p>}

                  {order.status !== "Collected" ? (
                    <button
                      type="button"
                      onClick={() => api.collectSpecimen(order.id, "Phleb. Sana Iqbal").then(refresh)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg px-3 py-2"
                    >
                      <TestTube className="w-3.5 h-3.5" /> Confirm Identity & Collect
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => api.receiveSpecimen(order.id, `LAB-${10000 + Math.floor(Math.random() * 9000)}`).then(refresh)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-2"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> Accession & Receive
                      </button>
                      <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value as RejectionReason)} className="text-xs rounded-lg border border-slate-200 px-2 py-2">
                        {REJECTION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          api.rejectSpecimen(order.id, rejectReason).then(refresh);
                          api.addRejection(order.patientId, order.panelName ?? order.testIds.join(", "), rejectReason, "MLS Sana Iqbal");
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg px-3 py-2"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Specimen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </LaboratoryLayout>
  );
}
