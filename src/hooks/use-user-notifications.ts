"use client";

import {
  collection,
  onSnapshot,
  query,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { UserNotification } from "@/lib/types";

export function useUserNotifications(userId: string | null | undefined) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
    );

    const unsub = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((entry) => {
          const data = entry.data() as Omit<UserNotification, "id">;
          return {
            id: entry.id,
            ...data,
          };
        });

        rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setNotifications(rows);
      },
      () => setNotifications([]),
    );

    return () => unsub();
  }, [userId]);

  const visibleNotifications = useMemo(
    () => (userId ? notifications : []),
    [notifications, userId],
  );

  const unreadCount = useMemo(
    () => visibleNotifications.filter((item) => !item.read).length,
    [visibleNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const unreadItems = visibleNotifications.filter((item) => !item.read);
    if (unreadItems.length === 0) return;

    const batch = writeBatch(db);
    unreadItems.forEach((item) => {
      const ref = doc(db, "notifications", item.id);
      batch.update(ref, { read: true });
    });

    await batch.commit();
  }, [userId, visibleNotifications]);

  return {
    notifications: visibleNotifications,
    unreadCount,
    markAllAsRead,
  };
}

