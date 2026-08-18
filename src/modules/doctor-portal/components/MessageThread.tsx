import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ExternalLink, MessageSquareOff } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { Conversation, Message } from "@modules/doctor-portal/api";

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  onSend: (text: string) => void;
}

/** Module-local — the Messages right pane: thread header, chronological bubbles, and the reply composer. */
export function MessageThread({ conversation, messages, onSend }: MessageThreadProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");

  function handleSend() {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  }

  if (!conversation) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 h-full">
        <MessageSquareOff className="w-8 h-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">Select a conversation</p>
        <p className="text-xs text-slate-400">Choose a patient or staff thread from the left to view messages.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={conversation.participant.avatar} alt={conversation.participant.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          <div>
            <p className="text-sm font-bold text-slate-800">{conversation.participant.name}</p>
            <p className="text-[11px] text-slate-400">{conversation.participant.role}</p>
          </div>
        </div>
        {conversation.participant.type === "patient" && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(conversation.participant.id))}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Patient Record
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${m.sender === "me" ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-700 rounded-bl-sm"}`}>
              <p className="text-xs leading-relaxed">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.sender === "me" ? "text-blue-100" : "text-slate-400"}`}>{m.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="Type a message…"
          aria-label="Message text"
          className="flex-1 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
