import { mockRequest } from "@shared/lib/api/client";

export interface MessageThread {
  id: string;
  withName: string;
  withRole: string;
  unread: number;
}

export interface ThreadMessage {
  threadId: string;
  from: "me" | "them";
  text: string;
  at: string;
}

const threads: MessageThread[] = [
  { id: "th-1", withName: "Dr. Ahsan Malik", withRole: "Attending Physician", unread: 1 },
  { id: "th-2", withName: "Nurse Amina Riaz", withRole: "Charge Nurse", unread: 0 },
  { id: "th-3", withName: "Pharmacy", withRole: "City General Pharmacy", unread: 0 },
];

let messages: ThreadMessage[] = [
  { threadId: "th-1", from: "them", text: "Can you confirm Ahmed Ali's latest SpO₂ reading?", at: "08:05" },
  { threadId: "th-1", from: "me", text: "90% on room air, rechecking now.", at: "08:07" },
  { threadId: "th-2", from: "them", text: "Handover huddle at 14:45 today.", at: "07:15" },
  { threadId: "th-3", from: "me", text: "Please confirm Ceftriaxone stock for Room 204.", at: "07:40" },
];

export const getThreads = () => mockRequest([...threads]);
export const getThreadMessages = (threadId: string) => mockRequest(messages.filter((m) => m.threadId === threadId));

export function sendMessage(threadId: string, text: string) {
  const msg: ThreadMessage = { threadId, from: "me", text, at: "just now" };
  messages = [...messages, msg];
  const thread = threads.find((t) => t.id === threadId);
  if (thread) thread.unread = 0;
  return mockRequest(msg);
}
