"use client";

import { Bell, MailCheck } from "lucide-react";
import type { UserNotification } from "@/lib/types";

interface NotificationsPanelProps {
  notifications: UserNotification[];
  unreadCount: number;
  title: string;
  unreadLabel: string;
  emptyLabel: string;
  markAllAsRead: () => Promise<void>;
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  title,
  unreadLabel,
  emptyLabel,
  markAllAsRead,
}: NotificationsPanelProps) {
  return (
    <aside className="rounded-2xl border border-white/50 bg-white/65 p-4 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600">
            {unreadCount} {unreadLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void markAllAsRead();
          }}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
        >
          <MailCheck className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            {emptyLabel}
          </p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white/80 p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {!item.read ? (
                  <Bell className="h-4 w-4 text-amber-500" />
                ) : null}
              </div>
              <p className="text-sm text-slate-700">{item.message}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

