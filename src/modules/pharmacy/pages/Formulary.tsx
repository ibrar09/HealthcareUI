import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { FormularyItem, FormularyCategory } from "@modules/pharmacy/api";

const CATEGORY_STYLE: Record<FormularyCategory, string> = {
  Preferred: "bg-emerald-50 text-emerald-700 border-emerald-100", Restricted: "bg-amber-50 text-amber-700 border-amber-100",
  "Non-Formulary": "bg-rose-50 text-rose-700 border-rose-100", Specialty: "bg-blue-50 text-blue-700 border-blue-100", Emergency: "bg-violet-50 text-violet-700 border-violet-100",
};

export function Formulary() {
  const [items, setItems] = useState<FormularyItem[]>([]);
  useEffect(() => { api.getFormulary().then(setItems); }, []);

  return (
    <PharmacyLayout active="Formulary">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Formulary</h1>
        <p className="text-xs text-slate-500 mt-0.5">Hospital-approved medication list and restrictions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {items.map((f) => (
          <div key={f.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{f.medicationName} <span className="text-slate-400 font-normal">({f.genericName})</span></p>
              <p className="text-[11px] text-slate-400">{f.form} · {f.route}</p>
              {f.restrictionNote && <p className="text-[11px] text-amber-600 mt-0.5">{f.restrictionNote}</p>}
              {f.alternative && <p className="text-[11px] text-slate-500 mt-0.5">Alternative: {f.alternative}</p>}
            </div>
            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${CATEGORY_STYLE[f.category]}`}>{f.category}</span>
          </div>
        ))}
      </div>
    </PharmacyLayout>
  );
}
