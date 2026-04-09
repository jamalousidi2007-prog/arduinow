"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";
import { db } from "@/lib/firebase";
import { defaultEditableContent } from "@/lib/site-content";
import type { EditableContent, UserProfile } from "@/lib/types";

export default function AdminPage() {
  const { t } = useLocale();
  const { user, profile } = useAuth();

  const [content, setContent] = useState<EditableContent>(defaultEditableContent);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const [targetUserId, setTargetUserId] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");

  useEffect(() => {
    if (profile?.role !== "admin") return;

    const unsubContent = onSnapshot(doc(db, "siteContent", "main"), (snap) => {
      if (!snap.exists()) {
        setContent(defaultEditableContent);
        return;
      }

      setContent({
        ...defaultEditableContent,
        ...(snap.data() as Partial<EditableContent>),
      });
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const nextUsers = snapshot.docs.map((entry) => entry.data() as UserProfile);
      nextUsers.sort((a, b) => b.createdAtMs - a.createdAtMs);
      setUsers(nextUsers);
      if (!targetUserId && nextUsers.length > 0) {
        setTargetUserId(nextUsers[0].uid);
      }
    });

    return () => {
      unsubContent();
      unsubUsers();
    };
  }, [profile?.role, targetUserId]);

  const userMap = useMemo(() => {
    return users.reduce<Record<string, UserProfile>>((acc, current) => {
      acc[current.uid] = current;
      return acc;
    }, {});
  }, [users]);

  if (!user || !profile) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <p>{t("loading")}</p>
      </main>
    );
  }

  if (profile.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-center">
          <p className="mb-3 text-lg font-semibold">{t("accessDenied")}</p>
          <Link href="/" className="underline">
            {t("openDashboard")}
          </Link>
        </div>
      </main>
    );
  }

  const saveContent = async () => {
    await setDoc(doc(db, "siteContent", "main"), content, { merge: true });
    setStatus(t("changesSaved"));
  };

  const toggleBan = async (selected: UserProfile) => {
    await updateDoc(doc(db, "users", selected.uid), {
      banned: !selected.banned,
    });
  };

  const makeAdmin = async (selected: UserProfile) => {
    await updateDoc(doc(db, "users", selected.uid), {
      role: "admin",
    });
  };

  const pushNotification = async () => {
    if (!targetUserId || !notifTitle.trim() || !notifMessage.trim()) return;

    await addDoc(collection(db, "notifications"), {
      userId: targetUserId,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      read: false,
      createdAtMs: Date.now(),
      createdByUid: user.uid,
    });

    setNotifTitle("");
    setNotifMessage("");
    setStatus(`${t("sendNotification")} OK`);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
              {t("adminDashboard")}
            </p>
            <h1 className="text-3xl font-black">{t("appTitle")}</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/35 px-4 py-2 text-sm hover:border-white"
          >
            {t("openDashboard")}
          </Link>
        </header>

        {status ? (
          <p className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 p-3 text-sm text-emerald-100">
            {status}
          </p>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold">{t("contentStudio")}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Hero title (EN)
                <textarea
                  className="mt-1 h-24 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.heroTitleEn}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      heroTitleEn: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm">
                Hero title (FR)
                <textarea
                  className="mt-1 h-24 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.heroTitleFr}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      heroTitleFr: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm">
                Hero subtitle (EN)
                <textarea
                  className="mt-1 h-24 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.heroSubtitleEn}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      heroSubtitleEn: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm">
                Hero subtitle (FR)
                <textarea
                  className="mt-1 h-24 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.heroSubtitleFr}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      heroSubtitleFr: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm">
                Stats headline (EN)
                <textarea
                  className="mt-1 h-20 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.statsHeadlineEn}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      statsHeadlineEn: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm">
                Stats headline (FR)
                <textarea
                  className="mt-1 h-20 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.statsHeadlineFr}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      statsHeadlineFr: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm">
                Footer (EN)
                <input
                  className="mt-1 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.footerTextEn}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      footerTextEn: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm">
                Footer (FR)
                <input
                  className="mt-1 w-full rounded-xl border border-white/20 bg-black/20 p-2"
                  value={content.footerTextFr}
                  onChange={(event) =>
                    setContent((prev) => ({
                      ...prev,
                      footerTextFr: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                void saveContent();
              }}
              className="mt-4 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 font-semibold text-slate-900"
            >
              {t("saveChanges")}
            </button>
          </article>

          <article className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold">{t("users")}</h2>
            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-sm text-slate-300">{t("emptyUsers")}</p>
              ) : (
                users.map((entry) => (
                  <div
                    key={entry.uid}
                    className="rounded-xl border border-white/15 bg-black/20 p-3"
                  >
                    <p className="font-semibold">{entry.displayName}</p>
                    <p className="text-sm text-slate-300">{entry.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/25 px-2 py-1 text-xs">
                        {entry.role === "admin" ? t("roleAdmin") : t("roleUser")}
                      </span>
                      {entry.banned ? (
                        <span className="rounded-full border border-rose-300/40 bg-rose-500/20 px-2 py-1 text-xs text-rose-200">
                          {t("accountBannedBadge")}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void toggleBan(entry);
                        }}
                        className="rounded-lg border border-white/25 px-3 py-1 text-xs hover:border-white"
                      >
                        {entry.banned ? t("unbanUser") : t("banUser")}
                      </button>
                      {entry.role !== "admin" ? (
                        <button
                          type="button"
                          onClick={() => {
                            void makeAdmin(entry);
                          }}
                          className="rounded-lg border border-cyan-300/40 px-3 py-1 text-xs text-cyan-100 hover:border-cyan-200"
                        >
                          {t("makeAdmin")}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-bold">{t("notificationCenter")}</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm md:col-span-1">
              {t("targetUser")}
              <select
                value={targetUserId}
                onChange={(event) => setTargetUserId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-black/20 p-2"
              >
                {users.map((entry) => (
                  <option key={entry.uid} value={entry.uid}>
                    {entry.displayName} ({entry.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm md:col-span-1">
              {t("notificationTitle")}
              <input
                value={notifTitle}
                onChange={(event) => setNotifTitle(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-black/20 p-2"
              />
            </label>
            <label className="text-sm md:col-span-3">
              {t("notificationMessage")}
              <textarea
                value={notifMessage}
                onChange={(event) => setNotifMessage(event.target.value)}
                className="mt-1 h-24 w-full rounded-xl border border-white/20 bg-black/20 p-2"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              void pushNotification();
            }}
            className="mt-4 rounded-xl bg-gradient-to-r from-fuchsia-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950"
            disabled={!userMap[targetUserId]}
          >
            {t("sendNow")}
          </button>
        </section>
      </div>
    </main>
  );
}

