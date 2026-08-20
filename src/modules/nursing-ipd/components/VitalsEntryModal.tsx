import { useState } from "react";
import { X } from "lucide-react";
import type { NursePatientVitals } from "@modules/nursing-ipd/api";

interface VitalsEntryModalProps {
  current: NursePatientVitals;
  onClose: () => void;
  onSave: (vitals: NursePatientVitals) => void;
}

const inputClass = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";

/** Module-local — the vitals recording form, reachable from the Bedside Workspace. Real functionality: saves to the patient's actual vitals and clears their "vitals due" flag. */
export function VitalsEntryModal({ current, onClose, onSave }: VitalsEntryModalProps) {
  const [bpSystolic, bpDiastolic] = (current.bp ?? "").split("/");
  const [systolic, setSystolic] = useState(bpSystolic ?? "");
  const [diastolic, setDiastolic] = useState(bpDiastolic ?? "");
  const [hr, setHr] = useState(current.hr?.toString() ?? "");
  const [rr, setRr] = useState(current.rr?.toString() ?? "");
  const [temp, setTemp] = useState(current.temp?.toString() ?? "");
  const [spo2, setSpo2] = useState(current.spo2?.toString() ?? "");
  const [painScore, setPainScore] = useState(current.painScore?.toString() ?? "0");

  const canSave = systolic.trim() && diastolic.trim() && hr.trim() && spo2.trim();

  function handleSave() {
    if (!canSave) return;
    onSave({
      bp: `${systolic.trim()}/${diastolic.trim()}`,
      hr: Number(hr), rr: rr ? Number(rr) : undefined, temp: temp ? Number(temp) : undefined,
      spo2: Number(spo2), painScore: Number(painScore),
    });
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-label="Record Vitals" className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-800">Record Vitals</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">BP Systolic</label>
                <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} className={inputClass} placeholder="120" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">BP Diastolic</label>
                <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} className={inputClass} placeholder="80" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Heart Rate (bpm)</label>
                <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Respiratory Rate</label>
                <input type="number" value={rr} onChange={(e) => setRr(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">SpO₂ (%)</label>
                <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Temperature (°C)</label>
                <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pain Score (0–10): {painScore}</label>
              <input type="range" min={0} max={10} value={painScore} onChange={(e) => setPainScore(e.target.value)} className="w-full accent-teal-600" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Cancel</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl"
            >
              Save Vitals
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
