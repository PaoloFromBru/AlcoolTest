"use client";

import { useState } from "react";
import { useT } from "../../components/Providers";

export default function Page() {
  const [tab, setTab] = useState<"home" | "how">("home");
  const t = useT();

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("home")}
            className={`px-3 py-1.5 rounded-xl2 border ${tab === "home" ? "bg-brand text-white border-brand" : "border-neutral-200 dark:border-neutral-800"}`}
            aria-pressed={tab === "home"}
          >
            Home
          </button>
          <button
            onClick={() => setTab("how")}
            className={`px-3 py-1.5 rounded-xl2 border ${tab === "how" ? "bg-brand text-white border-brand" : "border-neutral-200 dark:border-neutral-800"}`}
            aria-pressed={tab === "how"}
          >
            {t("home.how")}
          </button>
        </div>

        {tab === "home" && (
          <div className="mt-6">
            <h1 className="text-3xl font-bold">{t("home.title")}</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {t("home.subtitle")}
            </p>
          </div>
        )}

        {tab === "how" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">{t("home.how")}</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-700 dark:text-neutral-300">
              <li>{t("home.installable")}</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
