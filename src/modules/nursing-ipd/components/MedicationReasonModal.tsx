import { useState } from "react";
import { X } from "lucide-react";
import type { MedicationOrder } from "@modules/nursing-ipd/api";

interface MedicationReasonModalProps {
  mode: "Held" | "Refused" | "Not Available";
  order: MedicationOrder;
  patientName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REASONS: Record<string, string[]> = {
  Held: ["Patient asleep", "NPO / procedure prep", "Clinical judgment — vitals out of range", "Pending physician review", "Other"],
  Refused: ["Patient refused — explained risks", "Patient refused — no reason given", "Family declined on patient's behalf", "Other"],
  "Not Available": ["Not in stock at ward", "Pharmacy delay", "Order requires clarification", "Other"],
};

/** Module-local — required-reason form for Hold/Refuse/Not Available, per the spec's medication-safety workflow (never a silent skip). */
export function MedicationReasonModal({ mode, order, patientName, onClose, onConfirm }: MedicationReasonModalProps) {
  const [reason, setReason] = useState(REASONS[mode][0]);
  const [notes, setNotes] = useState("");

  function handleConfirm() {
    onConfirm(notes.trim() ? `${reason} — ${notes.trim()}` : reason);
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-label={`${mode} medication`} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-800">{mode === "Held" ? "Hold Medication" : mode === "Refused" ? "Patient Refused" : "Medication Not Available"}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-xs text-slate-500 mb-1">{patientName}</p>
            <p className="text-xs font-semibold text-slate-700 mb-4">{order.name} {order.dose} · {order.route} · {order.time}</p>

            <p className="text-xs font-semibold text-slate-600 mb-2">Reason</p>
            <div className="flex flex-col gap-2 mb-4">
              {REASONS[mode].map((r) => (
                <label key={r} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input type="radio" name="med-reason" checked={reason === r} onChange={() => setReason(r)} className="accent-teal-600" />
                  {r}
                </label>
              ))}
            </div>

            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Cancel</button>
            <button type="button" onClick={handleConfirm} className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl">Confirm</button>
          </div>
        </div>
      </div>
    </>
  );
}
