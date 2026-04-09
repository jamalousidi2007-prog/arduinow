"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLocale } from "@/context/locale-context";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { user, profile, authError, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      router.replace("/");
    }
  }, [profile, router, user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error("Display name is required.");
        }
        await signUp(email, password, displayName.trim());
      }
      router.replace("/");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Auth failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-[120px]" />

      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl md:grid-cols-2 md:p-10">
          <section className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">AgriPulse</p>
            <h1 className="text-4xl font-black leading-tight text-white">
              {mode === "login" ? t("loginTitle") : t("registerTitle")}
            </h1>
            <p className="max-w-sm text-sm text-slate-200">
              {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
            </p>
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/40 px-4 py-2 text-sm text-white transition hover:border-white"
            >
              {t("openDashboard")}
            </Link>
          </section>

          <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
            <form className="space-y-4" onSubmit={submit}>
              {mode === "register" ? (
                <label className="block text-sm text-slate-200">
                  {t("displayName")}
                  <input
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-cyan-300"
                    placeholder="Alex Farm"
                  />
                </label>
              ) : null}

              <label className="block text-sm text-slate-200">
                {t("email")}
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-cyan-300"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm text-slate-200">
                {t("password")}
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-cyan-300"
                  placeholder="******"
                  minLength={6}
                />
              </label>

              {(localError || authError) && (
                <p className="rounded-xl border border-rose-300/50 bg-rose-500/15 p-2 text-sm text-rose-100">
                  {localError ?? authError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? t("loading")
                  : mode === "login"
                    ? t("submitLogin")
                    : t("submitRegister")}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
              className="mt-4 text-sm text-cyan-200 underline-offset-4 hover:underline"
            >
              {mode === "login" ? t("goToRegister") : t("goToLogin")}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

