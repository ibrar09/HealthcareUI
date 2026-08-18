import { Search, SquarePen } from "lucide-react";
import type { Conversation } from "@modules/doctor-portal/api";

export type ConversationFilter = "all" | "patients" | "staff" | "unread";

interface ConversationListProps {
  conversations: Conversation[];
  search: string;
  onSearchChange: (value: string) => void;
  filter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewMessage: () => void;
}

const FILTER_TABS: { key: ConversationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "patients", label: "Patients" },
  { key: "staff", label: "Staff" },
  { key: "unread", label: "Unread" },
];

/** Module-local — the Messages left pane: search, filter tabs, and the conversation rows. */
export function ConversationList({
  conversations, search, onSearchChange, filter, onFilterChange, activeConversationId, onSelectConversation, onNewMessage,
}: ConversationListProps) {
  return (
    <div className="w-full max-w-[340px] flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">Messages</h2>
          <button type="button" onClick={onNewMessage} aria-label="New message" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
            <SquarePen className="w-4 h-4" />
          </button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                filter === tab.key ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {conversations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No conversations match.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectConversation(c.id)}
              className={`flex items-start gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${activeConversationId === c.id ? "bg-blue-50/60" : ""}`}
            >
              <img src={c.participant.avatar} alt={c.participant.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs truncate ${c.unreadCount > 0 ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}>{c.participant.name}</p>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{c.lastMessageAt}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-0.5">{c.participant.role}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[11px] truncate ${c.unreadCount > 0 ? "text-slate-700 font-medium" : "text-slate-400"}`}>{c.lastMessagePreview || "No messages yet"}</p>
                  {c.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{c.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
