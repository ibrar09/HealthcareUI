import { useEffect, useState } from "react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { BedManagementSlot, EmptyBedStatus } from "@modules/nursing-ipd/api";

const STATUS_OPTIONS: EmptyBedStatus[] = ["Vacant", "Cleaning", "Reserved"];
const STATUS_STYLE: Record<EmptyBedStatus, string> = {
  Vacant: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Cleaning: "bg-amber-50 text-amber-700 border-amber-100",
  Reserved: "bg-slate-100 text-slate-600 border-slate-200",
};

export function BedManagement() {
  const [slots, setSlots] = useState<BedManagementSlot[]>([]);

  function refresh() {
    api.getBedManagement().then(setSlots);
  }

  useEffect(refresh, []);

  const grouped = slots.reduce<Record<string, BedManagementSlot[]>>((acc, slot) => {
    (acc[slot.room] ??= []).push(slot);
    return acc;
  }, {});

  return (
    <NurseLayout active="Bed Management">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Bed Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">Occupancy and turnover status across Medical Ward A.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(grouped).map(([room, roomSlots]) => (
          <div key={room} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Room {room}</p>
            <div className="flex flex-col gap-2.5">
              {roomSlots.map((slot) => (
                <div key={slot.bed} className="border border-slate-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">Bed {slot.bed}</span>
                    {slot.patient ? (
                      <span className="text-[11px] font-semibold border rounded-full px-2 py-0.5 bg-teal-50 text-teal-700 border-teal-100">Occupied</span>
                    ) : (
                      <span className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 ${STATUS_STYLE[slot.emptyStatus ?? "Vacant"]}`}>{slot.emptyStatus}</span>
                    )}
                  </div>
                  {slot.patient ? (
                    <p className="text-xs text-slate-600">{slot.patient.name}</p>
                  ) : (
                    <div className="flex gap-1.5 mt-1.5">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => api.setEmptyBedStatus(slot.room, slot.bed, opt).then(refresh)}
                          className={`text-[10px] font-semibold rounded-full px-2 py-1 border ${slot.emptyStatus === opt ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </NurseLayout>
  );
}
