"use client";

import { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [tab, setTab] = useState<"home" | "how">("home");

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
            Come funziona
          </button>
        </div>

        {tab === "home" && (
          <div className="mt-6">
            <h1 className="text-3xl font-bold">AlcoolTest</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Calcolatore di stima del tasso alcolemico (BAC).
            </p>
          </div>
        )}

        {tab === "how" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Come funziona</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-700 dark:text-neutral-300">
              <li>Installabile su desktop e mobile.</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
