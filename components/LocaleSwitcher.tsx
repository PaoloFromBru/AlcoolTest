"use client";

import { locales } from "../i18n/config";
import { usePathname, useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments[0];

  const change = (loc: string) => {
    const rest = segments.slice(1).join("/");
    const next = `/${loc}/${rest}`.replace(/\/$/, "");
    router.push(next || `/${loc}`);
  };

  return (
    <select
      aria-label="Locale"
      defaultValue={currentLocale}
      onChange={(e) => change(e.target.value)}
      className="input w-auto">
      {locales.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  );
}
