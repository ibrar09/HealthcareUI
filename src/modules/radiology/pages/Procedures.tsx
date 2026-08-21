import { useEffect, useState } from "react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { RadiologyProcedure } from "@modules/radiology/api";

export function Procedures() {
  const [procedures, setProcedures] = useState<RadiologyProcedure[]>([]);
  useEffect(() => { api.getProcedures().then(setProcedures); }, []);

  return (
    <RadiologyLayout active="Procedures">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Procedure Catalog</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configurable procedures, preparation, and contrast requirements.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {procedures.map((p) => (
          <div key={p.id} className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
              <p className="text-sm font-semibold text-slate-800">{p.name}</p>
              <span className="text-[11px] text-slate-400">{p.durationMin} min{p.contrastRequired && " · Contrast required"}</span>
            </div>
            <p className="text-xs text-slate-500">{p.modality} · {p.bodyPart}</p>
            <p className="text-xs text-slate-600 mt-1">{p.prepInstructions}</p>
          </div>
        ))}
      </div>
    </RadiologyLayout>
  );
}
