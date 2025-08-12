"use client";

import { useEffect, useMemo, useState } from "react";

type Sex = "M" | "F";
type Drink = { id: string; name: string; volume: number; abv: number; atMin: number };

const PRESETS: Array<Pick<Drink, "name" | "volume" | "abv">> = [
  { name: "Birra 5%", volume: 330, abv: 5 },
  { name: "Calice vino 12.5%", volume: 150, abv: 12.5 },
  { name: "Spritz 11%", volume: 200, abv: 11 },
  { name: "Amaro 30%", volume: 40, abv: 30 },
];

function gramsOfAlcohol(volumeMl: number, abvPct: number) {
  // ml * % * densità etanolo (0.789 g/ml)
  return volumeMl * (abvPct / 100) * 0.789;
}

export default function CalcPage() {
  const [weight, setWeight] = useState(75);
  const [sex, setSex] = useState<Sex>("M");
  const [withFood, setWithFood] = useState(true);

  // timeline: minuti passati dalla prima bevuta
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [minutes, setMinutes] = useState(60); // slider: momento della serata da analizzare

  // beta: eliminazione media 0.15 g/L/ora
  const BETA = 0.15; // g/L per ora
  const r = sex === "M" ? 0.68 : 0.55;

  // persistenza locale
  useEffect(() => {
    const saved = localStorage.getItem("alcooltest.session");
    if (saved) {
      const parsed = JSON.parse(saved);
      setWeight(parsed.weight ?? 75);
      setSex(parsed.sex ?? "M");
      setWithFood(parsed.withFood ?? true);
      setDrinks(parsed.drinks ?? []);
      setMinutes(parsed.minutes ?? 60);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "alcooltest.session",
      JSON.stringify({ weight, sex, withFood, drinks, minutes })
    );
  }, [weight, sex, withFood, drinks, minutes]);

  const addDrink = (d: Pick<Drink, "name" | "volume" | "abv">) => {
    const id = crypto.randomUUID();
    // orario: mettiamo di default alla fine della timeline corrente
    const atMin = drinks.length ? Math.max(...drinks.map(x => x.atMin)) : 0;
    setDrinks(prev => [...prev, { id, name: d.name, volume: d.volume, abv: d.abv, atMin }]);
  };

  const updateDrink = (id: string, patch: Partial<Drink>) =>
    setDrinks(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));

  const removeDrink = (id: string) =>
    setDrinks(prev => prev.filter(d => d.id !== id));

  const tMaxMin = useMemo(() => (drinks.length ? Math.max(...drinks.map(d => d.atMin)) + 180 : 240), [drinks]); // esplora fino a 3 ore dopo l’ultima

  // BAC in un certo minuto t: somma dei contributi di ogni drink dalla sua "atMin"
  const bacAtMin = (tMin: number) => {
    const betaPerMin = BETA / 60;
    let sum = 0;
    for (const d of drinks) {
      if (tMin < d.atMin) continue;
      const g = gramsOfAlcohol(d.volume, d.abv) * (withFood ? 0.9 : 1); // attenuazione cibo
      const elapsedMin = tMin - d.atMin;
      const bac0 = g / (weight * r); // g/L immediatamente dopo assorbimento (sempl.)
      const bacNow = bac0 - betaPerMin * elapsedMin;
      if (bacNow > 0) sum += bacNow;
    }
    return +sum.toFixed(3);
  };

  // curva, picco, quando si torna sotto soglie
  const analysis = useMemo(() => {
    let peak = { t: 0, bac: 0 };
    let below05At: number | null = null;
    let below00At: number | null = null;

    for (let t = 0; t <= tMaxMin; t += 5) {
      const b = bacAtMin(t);
      if (b > peak.bac) peak = { t, bac: b };
      if (below05At === null && b < 0.5) below05At = t;
      if (below00At === null && b <= 0) below00At = t;
    }
    return { peak, below05At, below00At };
  }, [drinks, tMaxMin, weight, r, withFood]);

  const currentBac = bacAtMin(minutes);

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h1 className="text-2xl font-bold">Sessione serata</h1>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <label className="space-y-1 col-span-1">
            <span className="label">Peso (kg)</span>
            <input className="input" type="number" min={30} max={200} value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value || "0"))} />
          </label>
          <label className="space-y-1 col-span-1">
            <span className="label">Sesso</span>
            <select className="input" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
            </select>
          </label>
          <label className="flex items-center gap-2 col-span-2 pt-6">
            <input type="checkbox" checked={withFood} onChange={(e) => setWithFood(e.target.checked)} />
            <span className="label">Assunzione con cibo</span>
          </label>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.name} className="btn" onClick={() => addDrink(p)}>
              + {p.name}
            </button>
          ))}
        </div>

        <div className="mt-2 space-y-3">
          {drinks.length === 0 && (
            <p className="text-sm text-neutral-500">Aggiungi una bevanda con i preset qui sopra.</p>
          )}
          {drinks.map((d, idx) => (
            <div key={d.id} className="grid grid-cols-12 gap-2 items-end border rounded-xl2 p-3">
              <div className="col-span-4">
                <span className="label">Nome</span>
                <input className="input" value={d.name}
                  onChange={(e) => updateDrink(d.id, { name: e.target.value })} />
              </div>
              <div className="col-span-2">
                <span className="label">Volume (ml)</span>
                <input className="input" type="number" min={20} value={d.volume}
                  onChange={(e) => updateDrink(d.id, { volume: parseFloat(e.target.value || "0") })} />
              </div>
              <div className="col-span-2">
                <span className="label">% vol</span>
                <input className="input" type="number" step="0.1" min={0} value={d.abv}
                  onChange={(e) => updateDrink(d.id, { abv: parseFloat(e.target.value || "0") })} />
              </div>
              <div className="col-span-3">
                <span className="label">Orario (min da inizio)</span>
                <input className="input" type="number" min={0} value={d.atMin}
                  onChange={(e) => updateDrink(d.id, { atMin: parseFloat(e.target.value || "0") })} />
              </div>
              <div className="col-span-1">
                <button className="btn" onClick={() => removeDrink(d.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="label">Tempo trascorso (min)</span>
          <span className="text-sm">{minutes} min</span>
        </div>
        <input type="range" min={0} max={tMaxMin} step={5} value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value, 10))} className="w-full" />
        <div className="rounded-2xl border p-4 bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Tasso alcolemico stimato al minuto selezionato</p>
          <p className={`text-3xl font-bold ${currentBac >= 0.5 ? "text-red-600" : "text-emerald-600"}`}>
            {currentBac} g/L
          </p>
          {currentBac > 0 && (
            <div className="mt-3 rounded-2xl border p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                Neopatentati: limite 0 g/L (tolleranza zero).
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">Picco previsto</p>
            <p className="text-xl font-semibold">{analysis.peak.bac} g/L</p>
            <p className="text-xs text-neutral-500">a {analysis.peak.t} min</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">Sotto 0,5 g/L</p>
            <p className="text-xl font-semibold">
              {analysis.below05At !== null ? `${analysis.below05At} min` : "—"}
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">A 0 g/L</p>
            <p className="text-xl font-semibold">
              {analysis.below00At !== null ? `${analysis.below00At} min` : "—"}
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-500">
          ℹ️ Modello semplificato (Widmark). Stima indicativa, non usare per decidere se guidare.
        </p>
      </div>
    </div>
  );
}