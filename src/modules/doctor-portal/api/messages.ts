import { mockRequest } from "@shared/lib/api/client";

// Doctor Portal's Messages module — secure in-app messaging with both
// patients and staff. No file attachments: real attachment handling needs
// backend validation/malware-scanning and non-public signed URLs (see
// CLAUDE.md §5), which this mock layer has no infrastructure for — better
// to leave it out than fake it.

export type ConversationParticipantType = "patient" | "staff";

export interface ConversationParticipant {
  id: string; // "rp-X" for patients (links to RosterPatient), "staff-X" for staff
  type: ConversationParticipantType;
  name: string;
  avatar: string;
  role: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: "me" | "them";
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant: ConversationParticipant;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

const staffDirectory: ConversationParticipant[] = [
  { id: "staff-1", type: "staff", name: "Front Desk", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", role: "Reception" },
  { id: "staff-2", type: "staff", name: "Sana Malik", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", role: "Registered Nurse" },
  { id: "staff-3", type: "staff", name: "Dr. Amina Farooqi", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80", role: "Neurology" },
];

const conversations: Conversation[] = [
  {
    id: "conv-1",
    participant: { id: "rp-4", type: "patient", name: "Ahsan Tariq", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", role: "Patient" },
    lastMessagePreview: "Should I be worried about the swelling in my ankles?",
    lastMessageAt: "Today, 10:20 AM",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participant: staffDirectory[0],
    lastMessagePreview: "Bilal Hussain's 1PM slot overlaps with a lab pickup — want me to shift it 15 min?",
    lastMessageAt: "Today, 09:05 AM",
    unreadCount: 1,
  },
  {
    id: "conv-3",
    participant: { id: "rp-8", type: "patient", name: "Hamza Butt", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80", role: "Patient" },
    lastMessagePreview: "Sorry I missed my appointment — can we reschedule?",
    lastMessageAt: "Yesterday, 4:40 PM",
    unreadCount: 1,
  },
  {
    id: "conv-4",
    participant: staffDirectory[2],
    lastMessagePreview: "Could you take a look at a shared post-concussion patient of mine?",
    lastMessageAt: "Yesterday, 2:15 PM",
    unreadCount: 1,
  },
  {
    id: "conv-5",
    participant: { id: "rp-11", type: "patient", name: "Layla Awan", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", role: "Patient" },
    lastMessagePreview: "Thank you, I'll pick up the new prescription today.",
    lastMessageAt: "Aug 26, 2026",
    unreadCount: 0,
  },
  {
    id: "conv-6",
    participant: staffDirectory[1],
    lastMessagePreview: "Ahsan Tariq's BP this morning was 142/90, noted in the chart.",
    lastMessageAt: "Aug 18, 2026",
    unreadCount: 0,
  },
  {
    id: "conv-7",
    participant: { id: "rp-5", type: "patient", name: "Bilal Hussain", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", role: "Patient" },
    lastMessagePreview: "Should I stop taking the antacid before my visit today?",
    lastMessageAt: "Today, 07:40 AM",
    unreadCount: 0,
  },
];

let messages: Message[] = [
  // conv-1 — Ahsan Tariq
  { id: "m-1", conversationId: "conv-1", sender: "them", text: "Good morning Dr. Raza, I noticed some swelling in my ankles since yesterday evening.", timestamp: "Today, 10:12 AM", read: true },
  { id: "m-2", conversationId: "conv-1", sender: "me", text: "Thanks for flagging this — with your CKD, ankle swelling is worth tracking closely. Any shortness of breath or weight gain?", timestamp: "Today, 10:16 AM", read: true },
  { id: "m-3", conversationId: "conv-1", sender: "them", text: "No shortness of breath. I did gain about 1kg this week though.", timestamp: "Today, 10:18 AM", read: false },
  { id: "m-4", conversationId: "conv-1", sender: "them", text: "Should I be worried about the swelling in my ankles?", timestamp: "Today, 10:20 AM", read: false },

  // conv-2 — Front Desk
  { id: "m-5", conversationId: "conv-2", sender: "them", text: "Bilal Hussain's 1PM slot overlaps with a lab pickup — want me to shift it 15 min?", timestamp: "Today, 09:05 AM", read: false },

  // conv-3 — Hamza Butt
  { id: "m-6", conversationId: "conv-3", sender: "them", text: "Sorry I missed my appointment — can we reschedule?", timestamp: "Yesterday, 4:40 PM", read: false },

  // conv-4 — Dr. Amina Farooqi
  { id: "m-7", conversationId: "conv-4", sender: "them", text: "Hi Dr. Raza, could you take a look at a shared post-concussion patient of mine? Kamal Siddiqui — I referred him to you last month.", timestamp: "Yesterday, 2:15 PM", read: false },

  // conv-5 — Layla Awan
  { id: "m-8", conversationId: "conv-5", sender: "me", text: "Your cholesterol came back a bit high — I'm adjusting your statin dose. New prescription is ready at the pharmacy.", timestamp: "Aug 26, 2026", read: true },
  { id: "m-9", conversationId: "conv-5", sender: "them", text: "Thank you, I'll pick up the new prescription today.", timestamp: "Aug 26, 2026", read: true },

  // conv-6 — Sana Malik
  { id: "m-10", conversationId: "conv-6", sender: "them", text: "Ahsan Tariq's BP this morning was 142/90, noted in the chart.", timestamp: "Aug 18, 2026", read: true },
  { id: "m-11", conversationId: "conv-6", sender: "me", text: "Thanks Sana, keeping an eye on it during today's consult.", timestamp: "Aug 18, 2026", read: true },

  // conv-7 — Bilal Hussain
  { id: "m-12", conversationId: "conv-7", sender: "them", text: "Should I stop taking the antacid before my visit today?", timestamp: "Today, 07:40 AM", read: true },
  { id: "m-13", conversationId: "conv-7", sender: "me", text: "No need to stop it — bring the bottle with you so we can review the dosage together.", timestamp: "Today, 07:52 AM", read: true },
];

export const getConversations = () => mockRequest([...conversations]);
export const getStaffDirectory = () => mockRequest([...staffDirectory]);

export function getMessages(conversationId: string) {
  return mockRequest(messages.filter((m) => m.conversationId === conversationId));
}

export function getUnreadCount() {
  return mockRequest(conversations.reduce((sum, c) => sum + c.unreadCount, 0));
}

export function sendMessage(conversationId: string, text: string) {
  const message: Message = { id: `m-${Date.now()}`, conversationId, sender: "me", text, timestamp: "Today, just now", read: true };
  messages = [...messages, message];
  const convo = conversations.find((c) => c.id === conversationId);
  if (convo) {
    convo.lastMessagePreview = text;
    convo.lastMessageAt = "Today, just now";
  }
  return mockRequest(messages.filter((m) => m.conversationId === conversationId));
}

export function markConversationRead(conversationId: string) {
  messages = messages.map((m) => (m.conversationId === conversationId ? { ...m, read: true } : m));
  const convo = conversations.find((c) => c.id === conversationId);
  if (convo) convo.unreadCount = 0;
  return mockRequest([...conversations]);
}

export function startConversation(participant: ConversationParticipant) {
  const existing = conversations.find((c) => c.participant.id === participant.id);
  if (existing) return mockRequest(existing);
  const convo: Conversation = { id: `conv-${Date.now()}`, participant, lastMessagePreview: "", lastMessageAt: "Today", unreadCount: 0 };
  conversations.unshift(convo);
  return mockRequest(convo);
}
