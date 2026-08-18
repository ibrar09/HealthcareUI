import { useEffect, useMemo, useState } from "react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { ConversationList, type ConversationFilter } from "@modules/doctor-portal/components/ConversationList";
import { MessageThread } from "@modules/doctor-portal/components/MessageThread";
import { NewConversationModal } from "@modules/doctor-portal/components/NewConversationModal";
import * as api from "@modules/doctor-portal/api";
import type { Conversation, Message, RosterPatient, ConversationParticipant } from "@modules/doctor-portal/api";

export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [roster, setRoster] = useState<RosterPatient[]>([]);
  const [staff, setStaff] = useState<ConversationParticipant[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  function refreshConversations() {
    api.getConversations().then(setConversations);
  }

  useEffect(() => {
    refreshConversations();
    api.getPatientRoster().then(setRoster);
    api.getStaffDirectory().then(setStaff);
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    api.getMessages(activeConversationId).then(setMessages);
    const convo = conversations.find((c) => c.id === activeConversationId);
    if (convo && convo.unreadCount > 0) {
      api.markConversationRead(activeConversationId).then(setConversations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "patients" && c.participant.type !== "patient") return false;
      if (filter === "staff" && c.participant.type !== "staff") return false;
      if (filter === "unread" && c.unreadCount === 0) return false;
      if (query && !c.participant.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [conversations, search, filter]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  function handleSend(text: string) {
    if (!activeConversationId) return;
    api.sendMessage(activeConversationId, text).then((updated) => {
      setMessages(updated);
      refreshConversations();
    });
  }

  function handleSelectNewParticipant(participant: ConversationParticipant) {
    api.startConversation(participant).then((convo) => {
      refreshConversations();
      setActiveConversationId(convo.id);
      setNewMessageOpen(false);
    });
  }

  return (
    <DoctorLayout active="Messages">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Messages</h1>
      </div>

      <div className="flex gap-5 h-[calc(100vh-200px)]">
        <ConversationList
          conversations={filtered}
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewMessage={() => setNewMessageOpen(true)}
        />
        <MessageThread conversation={activeConversation} messages={messages} onSend={handleSend} />
      </div>

      {newMessageOpen && (
        <NewConversationModal roster={roster} staff={staff} onClose={() => setNewMessageOpen(false)} onSelect={handleSelectNewParticipant} />
      )}
    </DoctorLayout>
  );
}
