"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Shield, Sparkles } from "lucide-react";
import { SensorCards } from "@/components/dashboard/sensor-cards";
import { SensorChart } from "@/components/dashboard/sensor-chart";
import { SensorIndividualCharts } from "@/components/dashboard/sensor-individual-charts";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";
import { useSensorStream } from "@/hooks/use-sensor-stream";
import { useSiteContent } from "@/hooks/use-site-content";
import { useUserNotifications } from "@/hooks/use-user-notifications";
import type { SensorKey } from "@/lib/types";

const sensorKeys: SensorKey[] = [
  "temperature",
  "humidity",
  "rain",
  "light",
  "pressure",
];

const sensorUnits: Record<SensorKey, string> = {
  temperature: "C",
  humidity: "%",
  rain: "%",
  light: "lx",
  pressure: "hPa",
};

export default function Home() {
  const { locale, setLocale, t } = useLocale();
  const {
    user,
    profile,
    loading: authLoading,
    authError,
    logout,
    updatePreferredLocale,
  } = useAuth();
  const { localized } = useSiteContent(locale);
  const { chartData, latest, loading, error, lastUpdated, getStats } =
    useSensorStream();
  const { notifications, unreadCount, markAllAsRead } = useUserNotifications(
    user?.uid,
  );

  useEffect(() => {
    if (!profile) return;
    if (profile.locale !== locale) {
      setLocale(profile.locale);
    }
  }, [locale, profile, setLocale]);

  const switchLocale = async () => {
    const next = locale === "en" ? "fr" : "en";
    setLocale(next);
    if (user) {
      await updatePreferredLocale(next);
    }
  };

  const sensorLabels: Record<SensorKey, string> = {
    temperature: t("temperature"),
    humidity: t("humidity"),
    rain: t("rain"),
    light: t("light"),
    pressure: t("pressure"),
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        {t("loading")}
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-40 -top-28 h-[28rem] w-[28rem] rounded-full bg-cyan-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-emerald-400/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8">
        <header className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{t("liveNow")}</p>
              <h1 className="text-3xl font-black text-white">{t("appTitle")}</h1>
              <p className="max-w-xl text-sm text-slate-200">{t("appTagline")}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void switchLocale();
                }}
                className="rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
              >
                {t("language")}: {locale.toUpperCase()}
              </button>

              {profile?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-200/50 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-100"
                >
                  <Shield className="h-4 w-4" />
                  {t("openAdmin")}
                </Link>
              ) : null}

              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                  }}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  {t("logout")}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </div>
        </header>

        {authError ? (
          <p className="mb-5 rounded-2xl border border-rose-300/50 bg-rose-500/20 p-3 text-sm text-rose-100">
            {authError.includes("banned") ? t("bannedMessage") : authError}
          </p>
        ) : null}

        {!user || !profile ? (
          <section className="grid flex-1 gap-6 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <article className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Agriculture
              </p>
              <h2 className="max-w-2xl text-4xl font-black leading-tight text-white">
                {localized.heroTitle || t("heroAnonTitle")}
              </h2>
              <p className="max-w-xl text-base text-slate-200">
                {localized.heroSubtitle || t("heroAnonSubtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-900 transition hover:brightness-110"
                >
                  {t("ctaSignIn")}
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/45 px-5 py-3 text-sm font-semibold transition hover:border-white"
                >
                  {t("ctaCreate")}
                </Link>
              </div>
            </article>

            <article className="space-y-3 rounded-2xl border border-white/25 bg-black/20 p-4">
              <p className="text-sm text-slate-300">{t("sessionStats")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {sensorKeys.map((key) => (
                  <div key={key} className="rounded-xl border border-white/15 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-300">
                      {sensorLabels[key]}
                    </p>
                    <p className="text-2xl font-black text-white">-- {sensorUnits[key]}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : (
          <section className="grid flex-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-6">
              <article className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-md">
                <h2 className="text-2xl font-black text-white">{localized.heroTitle}</h2>
                <p className="mt-1 text-sm text-slate-200">{localized.heroSubtitle}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span>
                    {t("lastUpdated")}:{" "}
                    {lastUpdated
                      ? new Date(lastUpdated).toLocaleTimeString(locale)
                      : "--"}
                  </span>
                  <span>•</span>
                  <span>{profile.displayName}</span>
                </div>
              </article>

              <SensorCards latest={latest} labels={sensorLabels} />

              {error ? (
                <p className="rounded-xl border border-amber-300/40 bg-amber-500/15 p-3 text-sm text-amber-100">
                  {t("pollingError")} {error}
                </p>
              ) : null}

              {loading && chartData.length === 0 ? (
                <p className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-slate-200">
                  {t("loading")}
                </p>
              ) : chartData.length === 0 ? (
                <p className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-slate-200">
                  {t("noSensorData")}
                </p>
              ) : (
                <>
                  <article className="space-y-3 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-md">
                    <h3 className="text-lg font-bold text-white">
                      {localized.statsHeadline}
                    </h3>
                    <SensorChart data={chartData} labels={sensorLabels} />
                  </article>

                  <article className="space-y-3 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-md">
                    <h3 className="text-lg font-bold text-white">
                      {t("individualGraphs")}
                    </h3>
                    <SensorIndividualCharts
                      data={chartData}
                      labels={sensorLabels}
                      units={sensorUnits}
                    />
                  </article>

                  <article className="grid gap-3 md:grid-cols-5">
                    {sensorKeys.map((key) => {
                      const stats = getStats(key);

                      return (
                        <div
                          key={key}
                          className="rounded-2xl border border-white/20 bg-white/10 p-3 text-sm"
                        >
                          <p className="mb-2 font-semibold text-white">{sensorLabels[key]}</p>
                          <p className="text-slate-200">
                            {t("average")}: {stats ? stats.average.toFixed(1) : "--"} {sensorUnits[key]}
                          </p>
                          <p className="text-slate-300">
                            {t("minimum")}: {stats ? stats.min.toFixed(1) : "--"} {sensorUnits[key]}
                          </p>
                          <p className="text-slate-300">
                            {t("maximum")}: {stats ? stats.max.toFixed(1) : "--"} {sensorUnits[key]}
                          </p>
                        </div>
                      );
                    })}
                  </article>
                </>
              )}
            </div>

            <NotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              title={t("notifications")}
              unreadLabel={t("unread")}
              emptyLabel={t("noNotifications")}
              markAllAsRead={markAllAsRead}
            />
          </section>
        )}

        <footer className="mt-6 pb-2 text-center text-xs text-slate-300">
          {localized.footerText} • {t("pageFooter")}
        </footer>
      </div>
    </main>
  );
}

