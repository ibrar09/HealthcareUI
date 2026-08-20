import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { MessageThread, ThreadMessage } from "@modules/nursing-ipd/api";

export function Messages() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");

  function refreshThreads() {
    api.getThreads().then((t) => {
      setThreads(t);
      if (!activeId && t.length) setActiveId(t[0].id);
    });
  }

  useEffect(refreshThreads, []);

  useEffect(() => {
    if (activeId) api.getThreadMessages(activeId).then(setMessages);
  }, [activeId]);

  function handleSend() {
    if (!activeId || !draft.trim()) return;
    api.sendMessage(activeId, draft.trim()).then(() => {
      setDraft("");
      api.getThreadMessages(activeId).then(setMessages);
      refreshThreads();
    });
  }

  const activeThread = threads.find((t) => t.id === activeId);

  return (
    <NurseLayout active="Messages">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Messages</h1>
        <p className="text-xs text-slate-500 mt-0.5">Care team conversations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row min-h-[420px] overflow-hidden">
        <div className="sm:w-64 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 divide-y divide-slate-50">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${activeId === t.id ? "bg-teal-50" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-800 truncate">{t.withName}</p>
                {t.unread > 0 && <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400">{t.withRole}</p>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs ${m.from === "me" ? "self-end bg-teal-600 text-white" : "self-start bg-slate-100 text-slate-700"}`}>
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-teal-100" : "text-slate-400"}`}>{m.at}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 p-3 flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={activeThread ? `Message ${activeThread.withName}…` : "Select a thread…"}
              disabled={!activeThread}
              className="flex-1 text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-slate-50"
            />
            <button type="button" onClick={handleSend} disabled={!draft.trim()} className="p-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </NurseLayout>
  );
}
