import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, NursingNote, NoteType } from "@modules/nursing-ipd/api";

const NOTE_TYPES: NoteType[] = ["Shift Note", "General", "Incident"];

export function PatientNotesForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<NursePatient | null>(null);
  const [notes, setNotes] = useState<NursingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteType, setNoteType] = useState<NoteType>("Shift Note");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    if (!id) return;
    Promise.all([api.getPatientById(id), api.getNotesForPatient(id)]).then(([p, n]) => {
      setPatient(p);
      setNotes(n);
      setLoading(false);
    });
  }

  useEffect(refresh, [id]);

  function handleSave() {
    if (!id || !content.trim()) return;
    setSaving(true);
    api.addNote(id, noteType, content.trim()).then(() => {
      setContent("");
      setSaving(false);
      refresh();
    });
  }

  return (
    <NurseLayout active="Nursing Notes">
      <button type="button" onClick={() => navigate(ROUTES.NURSING.NURSING_NOTES)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Nursing Notes
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
            <div className="flex items-center gap-3">
              <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div>
                <h1 className="text-base font-bold text-slate-800">{patient.name}</h1>
                <p className="text-xs text-slate-500">{patient.age} yrs · {patient.gender} · Room {patient.room} · Bed {patient.bed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3">New Note</h2>
            <div className="flex items-center gap-2 mb-3">
              {NOTE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNoteType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    noteType === t ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Document your observation…"
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg px-4 py-2.5"
            >
              <Send className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Note"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-3">History</h2>
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No notes recorded yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50">
                {notes.map((note) => (
                  <div key={note.id} className="py-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">{note.type}</span>
                      <span className="text-[11px] text-slate-400">· {note.authorName} · {note.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </NurseLayout>
  );
}
