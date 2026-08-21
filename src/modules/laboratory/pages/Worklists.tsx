import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, Send } from "lucide-react";
import { LaboratoryLayout } from "@/layouts/LaboratoryLayout";
import * as api from "@modules/laboratory/api";
import type { LabOrder, LabPatient, LabTest, LabResult, LabSection } from "@modules/laboratory/api";

const SECTIONS: LabSection[] = ["Hematology", "Chemistry", "Coagulation", "Microbiology", "Urinalysis", "Immunology"];
const FLAG_STYLE: Record<string, string> = {
  Normal: "bg-emerald-50 text-emerald-700", Low: "bg-amber-50 text-amber-700", High: "bg-amber-50 text-amber-700",
  "Critical Low": "bg-rose-50 text-rose-700", "Critical High": "bg-rose-50 text-rose-700", Abnormal: "bg-amber-50 text-amber-700",
};

export function Worklists() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<LabPatient[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);
  const [sectionFilter, setSectionFilter] = useState<LabSection | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function refresh() {
    api.getOrders().then((all) => setOrders(all.filter((o) => o.status === "Testing" || o.status === "Validation")));
    api.getLabPatients().then(setPatients);
    api.getTests().then(setTests);
    api.getResults().then(setResults);
  }
  useEffect(refresh, []);

  function testsForOrder(order: LabOrder) {
    return order.testIds.map((id) => tests.find((t) => t.id === id)).filter((t): t is LabTest => !!t);
  }

  function orderSections(order: LabOrder): LabSection[] {
    return Array.from(new Set(testsForOrder(order).map((t) => t.section)));
  }

  const filtered = orders.filter((o) => sectionFilter === "All" || orderSections(o).includes(sectionFilter));

  return (
    <LaboratoryLayout active="Worklists">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Worklists — Result Entry & Validation</h1>
        <p className="text-xs text-slate-500 mt-0.5">Enter, validate, and release results by section.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button type="button" onClick={() => setSectionFilter("All")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${sectionFilter === "All" ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>All Sections</button>
        {SECTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setSectionFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${sectionFilter === s ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>{s}</button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-sm text-slate-500">No orders match this view.</div>
        ) : (
          filtered.map((order) => {
            const patient = patients.find((p) => p.id === order.patientId);
            if (!patient) return null;
            const isOpen = expanded === order.id;
            const orderTests = testsForOrder(order);
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <button type="button" onClick={() => setExpanded(isOpen ? null : order.id)} className="w-full flex items-center gap-4 px-5 py-3.5 text-left flex-wrap">
                  <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{patient.name}</p><p className="text-[11px] text-slate-400">{order.accessionNo} · {order.panelName ?? orderTests.map((t) => t.code).join(", ")}</p></div>
                  <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${order.priority === "STAT" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{order.priority}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-50 flex flex-col divide-y divide-slate-50">
                    {orderTests.map((test) => {
                      const result = results.find((r) => r.orderId === order.id && r.testId === test.id);
                      const draftKey = `${order.id}-${test.id}`;
                      return (
                        <div key={test.id} className="py-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap mb-1.5">
                            <p className="text-sm font-semibold text-slate-800">{test.name} <span className="text-slate-400 font-normal">({test.code})</span></p>
                            {result && <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${FLAG_STYLE[result.flag]}`}>{result.flag}</span>}
                          </div>
                          {!result ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={drafts[draftKey] ?? ""}
                                onChange={(e) => setDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))}
                                placeholder={`Value (${test.unit ?? "text"}) — ref ${test.refRangeText ?? `${test.refLow}–${test.refHigh}`}`}
                                className="flex-1 text-xs rounded-lg border border-slate-200 px-3 py-2"
                              />
                              <button
                                type="button"
                                onClick={() => api.enterResult(order.id, order.patientId, test.id, drafts[draftKey] ?? "", "MLS Kamran Butt").then(refresh)}
                                disabled={!drafts[draftKey]?.trim()}
                                className="text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 rounded-lg px-3 py-2"
                              >
                                Enter
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-sm font-bold text-slate-800">{result.value} {result.unit}</p>
                              <span className="text-[11px] text-slate-400">Ref: {result.refRangeDisplay}</span>
                              <span className="text-[11px] font-semibold border rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 border-slate-200">{result.status}</span>
                              {result.status === "Entered" && (
                                <button type="button" onClick={() => api.validateResult(result.id, "Sr. MLS Fatima Zahra").then(refresh)} className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Validate
                                </button>
                              )}
                              {result.status === "Validated" && (
                                <button type="button" onClick={() => api.releaseResult(result.id).then(refresh)} className="flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5">
                                  <Send className="w-3.5 h-3.5" /> Authorize & Release
                                </button>
                              )}
                              {result.status === "Released" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </LaboratoryLayout>
  );
}
