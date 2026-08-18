import { useState } from "react";
import { Phone, Mail, CheckCircle2 } from "lucide-react";
import * as api from "@modules/doctor-portal/api";

const inputClass = "w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

/** Module-local — IT Support contact details plus a lightweight mock ticket form. */
export function ContactSupportCard() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    await api.submitSupportTicket({ subject: subject.trim(), description: description.trim() });
    setSubmitting(false);
    setSubmitted(true);
    setSubject("");
    setDescription("");
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-800 mb-3">Contact IT Support</h2>

      <div className="flex flex-col gap-2 mb-4">
        <a href="tel:+924235551234" className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <Phone className="w-3.5 h-3.5" /> +92 42 3555 1234
        </a>
        <a href="mailto:it-support@citygeneral.org" className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <Mail className="w-3.5 h-3.5" /> it-support@citygeneral.org
        </a>
        <p className="text-[11px] text-slate-400">Typical response time: within 1 business hour.</p>
      </div>

      {submitted ? (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-700">Ticket submitted</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">IT Support will follow up shortly.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-600">Or submit a ticket</p>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={inputClass} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the issue…" className={inputClass} />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!subject.trim() || !description.trim() || submitting}
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-2"
          >
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      )}
    </div>
  );
}
