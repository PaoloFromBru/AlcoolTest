"use client";

import { useMemo, useState } from "react";

type Sex = "M" | "F";

export default function CalcPage() {
  const [weight, setWeight] = useState(75); // kg
  const [sex, setSex] = useState<Sex>("M");
  const [volume, setVolume] = useState(500); // ml
  const [abv, setAbv] = useState(5); // % vol
  const [hours, setHours] = useState(0); // since first drink
  const [withFood, setWithFood] = useState(true);

  const result = useMemo(() => {
    // grams of pure alcohol = ml * (abv/100) * density (0.789 g/ml)
    const grams = volume * (abv / 100) * 0.789;
    const r = sex === "M" ? 0.68 : 0.55;
    // absorption: simple dampening if with food (approx 10%)
    const absorbed = grams * (withFood ? 0.9 : 1);
    // Widmark g/L (approx) – elimination beta 0.15 g/L/h
    let bac = absorbed / (weight * r) - 0.15 * hours;
    if (bac < 0) bac = 0;
    return { grams: +absorbed.toFixed(2), bac: +bac.toFixed(3) };
  }, [weight, sex, volume, abv, hours, withFood]);

  const legalLimit = 0.5;

  return (
    <div className="card space-y-6">
      <h1 className="text-2xl font-bold">Calcolatore BAC</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="label">Peso (kg)</span>
          <input className="input" type="number" min={30} max={200} value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value || "0"))} />
        </label>

        <label className="space-y-1">
          <span className="label">Sesso</span>
          <select className="input" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="label">Volume bevanda (ml)</span>
          <input className="input" type="number" min={50} max={2000} value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value || "0"))} />
        </label>

        <label className="space-y-1">
          <span className="label">Gradazione (% vol)</span>
          <input className="input" type="number" step="0.1" min={0} max={80} value={abv}
            onChange={(e) => setAbv(parseFloat(e.target.value || "0"))} />
        </label>

        <label className="space-y-1">
          <span className="label">Ore trascorse</span>
          <input className="input" type="number" step="0.25" min={0} max={24} value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value || "0"))} />
        </label>

        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={withFood} onChange={(e) => setWithFood(e.target.checked)} />
          <span className="label">Assunzione con cibo</span>
        </label>
      </div>

      <div className="rounded-2xl border p-4 bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
        <p className="text-sm text-neutral-500">Alcol ingerito (stimato)</p>
        <p className="text-2xl font-semibold">{result.grams} g di etanolo</p>
      </div>

      <div className="rounded-2xl border p-4 bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
        <p className="text-sm text-neutral-500">Tasso alcolemico stimato</p>
        <p className={`text-3xl font-bold ${result.bac >= legalLimit ? "text-red-600" : "text-emerald-600"}`}>
          {result.bac} g/L
        </p>
        <p className="mt-2 text-sm">
          Limite legale alla guida in Italia: <strong>{legalLimit} g/L</strong>.
        </p>
      </div>

      <p className="text-sm text-neutral-500">
        ℹ️ Modello semplificato (Widmark): risultato indicativo, non sostituisce test strumentali.
      </p>
    </div>
  );
}
