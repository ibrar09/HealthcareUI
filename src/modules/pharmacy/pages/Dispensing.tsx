import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { MedicationOrder, PharmacyPatient } from "@modules/pharmacy/api";

export function Dispensing() {
  const [orders, setOrders] = useState<MedicationOrder[]>([]);
  const [patients, setPatients] = useState<PharmacyPatient[]>([]);

  function refresh() {
    api.getOrders().then(setOrders);
    api.getPharmacyPatients().then(setPatients);
  }
  useEffect(refresh, []);

  const ready = orders.filter((o) => o.status === "Verified" || o.status === "Ready");

  function handleDispense(order: MedicationOrder) {
    const batch = api.getFefoBatch(order.medicationName);
    if (!batch) {
      window.alert(`No available stock for ${order.medicationName}. Cannot dispense.`);
      return;
    }
    if (batch.quantity < order.quantity) {
      window.alert(`Insufficient stock: ${batch.quantity} available, ${order.quantity} needed (batch ${batch.batchNo}).`);
      return;
    }
    api.dispenseOrder(order.id, order.patientId, order.medicationName, order.quantity, batch.id, batch.batchNo, "Pharm. Zainab Hussain").then(refresh);
  }

  return (
    <PharmacyLayout active="Dispensing">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Dispensing</h1>
        <p className="text-xs text-slate-500 mt-0.5">Verified prescriptions ready to dispense — FEFO batch selection is automatic.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {ready.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">Nothing pending dispensing.</p>
        ) : (
          ready.map((order) => {
            const patient = patients.find((p) => p.id === order.patientId);
            const suggested = api.getFefoBatch(order.medicationName);
            if (!patient) return null;
            return (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 w-40 flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                  <p className="text-[11px] text-slate-400">{patient.mrn}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700">{order.medicationName} {order.strength} — Qty {order.quantity}</p>
                  <p className="text-[11px] text-slate-400">
                    {suggested ? `FEFO batch: ${suggested.batchNo} · Exp ${suggested.expiryDate} · ${suggested.quantity} in stock` : "No available batch — will block dispensing"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDispense(order)}
                  disabled={!suggested || suggested.quantity < order.quantity}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 flex-shrink-0"
                >
                  <PackageCheck className="w-3.5 h-3.5" /> Dispense
                </button>
              </div>
            );
          })
        )}
      </div>
    </PharmacyLayout>
  );
}
