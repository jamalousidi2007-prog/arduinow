"use client";

import { AuthProvider } from "@/context/auth-context";
import { LocaleProvider } from "@/context/locale-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>{children}</AuthProvider>
    </LocaleProvider>
  );
}

