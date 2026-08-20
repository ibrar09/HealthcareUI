import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { NotificationItem } from "@modules/nursing-ipd/api";

export function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  function refresh() {
    api.getNotifications().then(setItems);
  }

  useEffect(refresh, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <NurseLayout active="Notifications">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={() => api.markAllNotificationsRead().then(refresh)} className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => !n.read && api.markNotificationRead(n.id).then(refresh)}
            className={`w-full flex items-start gap-3 px-5 py-3.5 text-left ${n.read ? "" : "bg-teal-50/50 hover:bg-teal-50"}`}
          >
            <Bell className={`w-4 h-4 flex-shrink-0 mt-0.5 ${n.read ? "text-slate-300" : "text-teal-600"}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs ${n.read ? "text-slate-500" : "text-slate-800 font-semibold"}`}>{n.message}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{n.at}</p>
            </div>
            {!n.read && <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 mt-1.5" />}
          </button>
        ))}
      </div>
    </NurseLayout>
  );
}
