import { useEffect, useState } from "react";
import { TestTube, CheckCircle2 } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { ClinicalOrder, NursePatient } from "@modules/nursing-ipd/api";

export function SpecimenCollection() {
  const [orders, setOrders] = useState<ClinicalOrder[]>([]);
  const [patients, setPatients] = useState<NursePatient[]>([]);

  function refresh() {
    api.getOrders().then(setOrders);
    api.getMyPatients().then(setPatients);
  }

  useEffect(refresh, []);

  const pending = orders.filter((o) => o.category === "Laboratory" && o.status === "Ordered");
  const collected = orders.filter((o) => o.category === "Laboratory" && o.status !== "Ordered");

  return (
    <NurseLayout active="Specimen Collection">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Specimen Collection</h1>
        <p className="text-xs text-slate-500 mt-0.5">Pending laboratory specimen collections across your assigned patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 mb-5">
        {pending.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No specimens pending collection.</p>
        ) : (
          pending.map((order) => {
            const patient = patients.find((p) => p.id === order.patientId);
            if (!patient) return null;
            return (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5">
                <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                  <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
                </div>
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 min-w-0 flex-1">
                  <TestTube className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {order.name}
                </p>
                <button
                  type="button"
                  onClick={() => api.collectSpecimen(order.id).then(refresh)}
                  className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 flex-shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Collected
                </button>
              </div>
            );
          })
        )}
      </div>

      {collected.length > 0 && (
        <>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Already Collected</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            {collected.map((order) => {
              const patient = patients.find((p) => p.id === order.patientId);
              if (!patient) return null;
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3">
                  <img src={patient.avatar} alt={patient.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <p className="text-xs font-semibold text-slate-700 min-w-0 flex-1">{patient.name} — {order.name}</p>
                  <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-emerald-50 text-emerald-700 border-emerald-100">
                    {order.status === "Final" ? "Resulted" : `Collected ${order.collectedAt}`}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </NurseLayout>
  );
}
