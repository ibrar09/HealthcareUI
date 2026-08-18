import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { RosterPatient, ConversationParticipant } from "@modules/doctor-portal/api";

interface NewConversationModalProps {
  roster: RosterPatient[];
  staff: ConversationParticipant[];
  onClose: () => void;
  onSelect: (participant: ConversationParticipant) => void;
}

/** Module-local — picker for starting a new conversation, searching across both patients and staff. */
export function NewConversationModal({ roster, staff, onClose, onSelect }: NewConversationModalProps) {
  const [search, setSearch] = useState("");

  const patientOptions: ConversationParticipant[] = useMemo(
    () => roster.map((p) => ({ id: p.id, type: "patient" as const, name: p.name, avatar: p.avatar, role: "Patient" })),
    [roster]
  );

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    const all = [...staff, ...patientOptions];
    if (!query) return all;
    return all.filter((p) => p.name.toLowerCase().includes(query) || p.role.toLowerCase().includes(query));
  }, [search, staff, patientOptions]);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-label="New message" className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-800">New Message</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 border-b border-slate-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients or staff…"
                aria-label="Search recipients"
                autoFocus
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-slate-50"
              >
                <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
