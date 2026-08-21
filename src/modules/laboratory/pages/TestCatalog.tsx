import { useEffect, useState } from "react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabTest, LabPanel, LabSection } from "@modules/laboratory/api";

type Tab = "tests" | "panels";
const SECTIONS: (LabSection | "All")[] = ["All", "Hematology", "Chemistry", "Coagulation", "Microbiology", "Urinalysis", "Immunology"];

export function TestCatalog() {
  const [tab, setTab] = useState<Tab>("tests");
  const [tests, setTests] = useState<LabTest[]>([]);
  const [panels, setPanels] = useState<LabPanel[]>([]);
  const [section, setSection] = useState<LabSection | "All">("All");

  useEffect(() => {
    api.getTests().then(setTests);
    api.getPanels().then(setPanels);
  }, []);

  const filtered = tests.filter((t) => section === "All" || t.section === section);

  return (
    <LaboratoryLayout active="Test Catalog">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Test Catalog</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configurable tests, panels, sample types, and reference ranges.</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => setTab("tests")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "tests" ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Individual Tests</button>
        <button type="button" onClick={() => setTab("panels")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "panels" ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Panels</button>
      </div>

      {tab === "tests" ? (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {SECTIONS.map((s) => (
              <button key={s} type="button" onClick={() => setSection(s)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${section === s ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-500"}`}>{s}</button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{t.name} <span className="text-slate-400 font-normal">({t.code})</span></p>
                  <p className="text-[11px] text-slate-400">{t.sampleType} · {t.container} · {t.method}</p>
                </div>
                <p className="text-xs text-slate-600 flex-shrink-0">{t.refRangeText ?? `${t.refLow}–${t.refHigh} ${t.unit ?? ""}`}</p>
                <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600">{t.section}</span>
                <span className="text-[11px] text-slate-400 flex-shrink-0">TAT {t.tatHours}h</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {panels.map((p) => (
            <div key={p.id} className="px-5 py-3.5">
              <p className="text-sm font-semibold text-slate-800 mb-1">{p.name}</p>
              <p className="text-xs text-slate-500">{p.testIds.map((id) => tests.find((t) => t.id === id)?.name).filter(Boolean).join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </LaboratoryLayout>
  );
}
