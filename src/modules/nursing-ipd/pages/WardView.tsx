import { useEffect, useMemo, useState } from "react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { WardBedCard } from "@modules/nursing-ipd/components/WardBedCard";
import * as api from "@modules/nursing-ipd/api";
import type { WardBedSlot } from "@modules/nursing-ipd/api";

export function WardView() {
  const [layout, setLayout] = useState<WardBedSlot[]>([]);

  useEffect(() => {
    api.getWardLayout().then(setLayout);
  }, []);

  const rooms = useMemo(() => {
    const map = new Map<string, WardBedSlot[]>();
    layout.forEach((slot) => {
      if (!map.has(slot.room)) map.set(slot.room, []);
      map.get(slot.room)!.push(slot);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [layout]);

  const occupied = layout.filter((s) => s.patient).length;
  const empty = layout.length - occupied;
  const critical = layout.filter((s) => s.patient?.acuity === "Critical").length;

  return (
    <NurseLayout active="Ward">
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Medical Ward A</h1>
          <p className="text-xs text-slate-500 mt-0.5">{occupied} occupied · {empty} empty · {critical} critical</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {rooms.map(([room, slots]) => (
          <div key={room}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room {room}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => (
                <WardBedCard key={`${slot.room}-${slot.bed}`} slot={slot} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </NurseLayout>
  );
}
