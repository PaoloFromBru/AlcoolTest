"use client";

import React, { createContext, useContext } from "react";
import type { Locale } from "../i18n/config";

type Dict = Record<string, any>;

const I18nCtx = createContext<{ locale: Locale; dict: Dict } | null>(null);

export function Providers({ locale, dict, children } : { locale: Locale; dict: Dict; children: React.ReactNode }) {
  return <I18nCtx.Provider value={{ locale, dict }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within Providers");
  return ctx;
}

export function useT() {
  const { dict } = useI18n();
  function get(path: string, fallback?: string) {
    const parts = path.split(".");
    let cur: any = dict;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur === undefined) return fallback ?? path;
    }
    if (typeof cur === "string") return cur;
    return fallback ?? path;
  }
  return get;
}
