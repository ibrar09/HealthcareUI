import { mockRequest } from "@shared/lib/api/client";

export interface NotificationItem {
  id: string;
  message: string;
  at: string;
  read: boolean;
}

let notifications: NotificationItem[] = [
  { id: "ntf-1", message: "Medication overdue — Sara Khan, Paracetamol 09:00 dose", at: "09:05", read: false },
  { id: "ntf-2", message: "Assessment due — Omar Ahmed", at: "08:00", read: false },
  { id: "ntf-3", message: "New lab result available — Fatima Iqbal, Basic Metabolic Panel", at: "07:45", read: true },
  { id: "ntf-4", message: "Shift handover huddle at 14:45 today", at: "07:15", read: true },
];

export const getNotifications = () => mockRequest([...notifications]);

export function markNotificationRead(id: string) {
  const n = notifications.find((x) => x.id === id);
  if (n) n.read = true;
  notifications = [...notifications];
  return mockRequest([...notifications]);
}

export function markAllNotificationsRead() {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  return mockRequest([...notifications]);
}
