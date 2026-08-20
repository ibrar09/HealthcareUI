import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Target, CheckCircle2, Plus } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, CarePlan, CarePlanCategory } from "@modules/nursing-ipd/api";

const CATEGORIES: CarePlanCategory[] = ["Respiratory", "Cardiac", "Wound Care", "Pain Management", "Mobility", "Discharge Planning", "Post-operative"];

export function PatientCarePlansForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<NursePatient | null>(null);
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CarePlanCategory>("Mobility");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    if (!id) return;
    Promise.all([api.getPatientById(id), api.getCarePlansForPatient(id)]).then(([p, pl]) => {
      setPatient(p);
      setPlans(pl);
      setLoading(false);
    });
  }

  useEffect(refresh, [id]);

  function handleResolve(planId: string) {
    api.resolveCarePlan(planId).then(() => refresh());
  }

  function handleAdd() {
    if (!id || !title.trim() || !goal.trim()) return;
    setSaving(true);
    api.addCarePlan(id, { title: title.trim(), category, goal: goal.trim() }).then(() => {
      setTitle("");
      setGoal("");
      setShowAdd(false);
      setSaving(false);
      refresh();
    });
  }

  return (
    <NurseLayout active="Care Plans">
      <button type="button" onClick={() => navigate(ROUTES.NURSING.CARE_PLANS)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Care Plans
      </button>

      {loading && <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center text-sm text-slate-500">Loading…</div>}

      {!loading && !patient && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-600">Patient not found.</p>
        </div>
      )}

      {!loading && patient && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                <div>
                  <h1 className="text-base font-bold text-slate-800">{patient.name}</h1>
                  <p className="text-xs text-slate-500">{patient.age} yrs · {patient.gender} · Room {patient.room} · Bed {patient.bed}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-2"
              >
                <Plus className="w-3.5 h-3.5" /> New Care Plan
              </button>
            </div>
          </div>

          {showAdd && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">New Care Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nutrition support" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as CarePlanCategory)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Goal</label>
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} placeholder="Measurable, patient-specific goal…" className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200" />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!title.trim() || !goal.trim() || saving}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg px-4 py-2.5"
              >
                {saving ? "Saving…" : "Add Plan"}
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            {plans.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No care plans recorded yet.</p>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{plan.title}</p>
                      <p className="text-[11px] text-slate-400">{plan.category} · Started {plan.startedAt}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${
                        plan.status === "Active" ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 flex items-start gap-1.5">
                    <Target className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" /> {plan.goal}
                  </p>
                  {plan.status === "Active" && (
                    <button
                      type="button"
                      onClick={() => handleResolve(plan.id)}
                      className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg px-3 py-1.5 border border-emerald-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  )}
                  {plan.resolvedAt && <p className="text-[11px] text-slate-400 mt-2">Resolved {plan.resolvedAt}</p>}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </NurseLayout>
  );
}
