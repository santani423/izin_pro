"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/id";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  whatsappUrl: string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** Dipasang sekali di PublicLayout (Server Component sudah tahu locale
 * lewat getLocale(), & kontak lewat getLocalizedGeneralSettings()) —
 * semua Client Component section di bawahnya tinggal pakai
 * useDictionary()/useLocale()/useWhatsappUrl() tanpa perlu prop-drilling. */
export function LocaleProvider({
  locale,
  dict,
  whatsappUrl,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  whatsappUrl: string;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict, whatsappUrl }}>
      {children}
    </LocaleContext.Provider>
  );
}

function useLocaleContext() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale/useDictionary must be used within LocaleProvider");
  }
  return ctx;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

export function useDictionary(): Dictionary {
  return useLocaleContext().dict;
}

/** URL wa.me dari Settings.whatsapp (tab Kontak /admin/settings) — dipakai
 * semua CTA WhatsApp lintas Client Component (Hero, FAB, CTA banner, dkk). */
export function useWhatsappUrl(): string {
  return useLocaleContext().whatsappUrl;
}
