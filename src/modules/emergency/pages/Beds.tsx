import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmergencyLayout } from "@/layouts/EmergencyLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/emergency/api";
import type { BedBoardEntry, BedStatus, EDPatient } from "@modules/emergency/api";

const STATUS_STYLE: Record<BedStatus, string> = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-100", Occupied: "bg-red-50 text-red-700 border-red-100",
  Reserved: "bg-blue-50 text-blue-700 border-blue-100", Cleaning: "bg-amber-50 text-amber-700 border-amber-100",
  Isolation: "bg-violet-50 text-violet-700 border-violet-100", Maintenance: "bg-slate-100 text-slate-500 border-slate-200",
};

export function Beds() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<BedBoardEntry[]>([]);
  const [patients, setPatients] = useState<EDPatient[]>([]);

  function refresh() {
    api.getBedBoard().then(setBoard);
    api.getEDPatients().then(setPatients);
  }
  useEffect(refresh, []);

  const grouped = board.reduce<Record<string, BedBoardEntry[]>>((acc, b) => {
    (acc[b.area] ??= []).push(b);
    return acc;
  }, {});

  return (
    <EmergencyLayout active="Bed Management">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Bed Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">Resuscitation, Trauma, Acute Care, Fast Track, and Observation areas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(grouped).map(([area, beds]) => (
          <div key={area} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{area}</p>
            <div className="flex flex-col gap-2.5">
              {beds.map((b) => {
                const patient = b.encounter ? patients.find((p) => p.id === b.encounter!.patientId) : null;
                return (
                  <div key={b.id} className={`border rounded-xl p-3 ${b.status === "Occupied" ? "border-red-100 cursor-pointer hover:bg-red-50" : "border-slate-100"}`} onClick={() => b.encounter && navigate(ROUTES.EMERGENCY.ENCOUNTER(b.encounter.id))}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">{b.bedNo}</span>
                      <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                    </div>
                    {patient ? <p className="text-xs text-slate-600">{patient.name}</p> : (
                      b.status === "Available" && (
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); api.setManualBedStatus(b.id, "Cleaning").then(refresh); }} className="text-[10px] font-semibold text-slate-400 hover:text-slate-600">Mark for Cleaning</button>
                      )
                    )}
                    {!patient && b.status === "Cleaning" && (
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); api.setManualBedStatus(b.id, "Available").then(refresh); }} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700">Mark Clean</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </EmergencyLayout>
  );
}
