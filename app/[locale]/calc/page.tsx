"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "../../../components/Providers";

type Sex = "M" | "F";
type Drink = { id: string; name: string; volume: number; abv: number; atMin: number };

function gramsOfAlcohol(volumeMl: number, abvPct: number) {
  return volumeMl * (abvPct / 100) * 0.789;
}

// Safe UID generator (fallback when crypto.randomUUID is unavailable)
function uid() {
  // @ts-ignore
  if (typeof crypto !== "undefined" && crypto && typeof (crypto as any).randomUUID === "function") {
    // @ts-ignore
    return (crypto as any).randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export default function CalcPage() {
  const t = useT();
  const PRESETS: Array<Pick<Drink, "name" | "volume" | "abv">> = [
    { name: t("calc.presets.0"), volume: 330, abv: 5 },
    { name: t("calc.presets.1"), volume: 150, abv: 12.5 },
    { name: t("calc.presets.2"), volume: 200, abv: 11 },
    { name: t("calc.presets.3"), volume: 40, abv: 30 },
  ];

  const [weight, setWeight] = useState(75);
  const [sex, setSex] = useState<Sex>("M");
  const [withFood, setWithFood] = useState(true);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [minutes, setMinutes] = useState(60);
  const [showChart, setShowChart] = useState(false);

  const BETA = 0.15;
  const r = sex === "M" ? 0.68 : 0.55;

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
    const id = uid();
    const atMin = drinks.length ? Math.max(...drinks.map(x => x.atMin)) : 0;
    setDrinks(prev => [...prev, { id, name: d.name, volume: d.volume, abv: d.abv, atMin }]);
  };

  const updateDrink = (id: string, patch: Partial<Drink>) =>
    setDrinks(prev => prev.map(dr => (dr.id === id ? { ...dr, ...patch } : dr)));

  const removeDrink = (id: string) =>
    setDrinks(prev => prev.filter(dr => dr.id !== id));

  const tMaxMin = useMemo(
    () => (drinks.length ? Math.max(...drinks.map(d => d.atMin)) + 180 : 240),
    [drinks]
  );

  const bacAtMin = (tMin: number) => {
    const betaPerMin = BETA / 60;
    let sum = 0;
    for (const d of drinks) {
      if (tMin < d.atMin) continue;
      const g = gramsOfAlcohol(d.volume, d.abv) * (withFood ? 0.9 : 1);
      const elapsedMin = tMin - d.atMin;
      const bac0 = g / (weight * r);
      const bacNow = bac0 - betaPerMin * elapsedMin;
      if (bacNow > 0) sum += bacNow;
    }
    return +sum.toFixed(3);
  };

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("calc.session")}</h1>
          <button className="btn" onClick={() => setShowChart(true)}>📈 {t("calc.seeChart")}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <label className="space-y-1 col-span-1">
            <span className="label">{t("calc.weight")}</span>
            <input className="input" type="number" min={30} max={200} value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value || "0"))} />
          </label>
          <label className="space-y-1 col-span-1">
            <span className="label">{t("calc.sex")}</span>
            <select className="input" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="M">{t("calc.male")}</option>
              <option value="F">{t("calc.female")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 col-span-2 pt-6">
            <input type="checkbox" checked={withFood} onChange={(e) => setWithFood(e.target.checked)} />
            <span className="label">{t("calc.withFood")}</span>
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
            <p className="text-sm text-neutral-500">{t("calc.addHint")}</p>
          )}
          {drinks.map((d) => (
            <div key={d.id} className="grid grid-cols-12 gap-2 items-end border rounded-xl2 p-3">
              <div className="col-span-4">
                <span className="label">{t("calc.name")}</span>
                <input className="input" value={d.name}
                  onChange={(e) => updateDrink(d.id, { name: e.target.value })} />
              </div>
              <div className="col-span-2">
                <span className="label">{t("calc.volume")}</span>
                <input className="input" type="number" min={20} value={d.volume}
                  onChange={(e) => updateDrink(d.id, { volume: parseFloat(e.target.value || "0") })} />
              </div>
              <div className="col-span-2">
                <span className="label">{t("calc.abv")}</span>
                <input className="input" type="number" step={0.1} min={0} value={d.abv}
                  onChange={(e) => updateDrink(d.id, { abv: parseFloat(e.target.value || "0") })} />
              </div>
              <div className="col-span-3">
                <span className="label">{t("calc.time")}</span>
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
          <span className="label">{t("calc.timeline")}</span>
          <span className="text-sm">{minutes} min</span>
        </div>
        <input type="range" min={0} max={tMaxMin} step={5} value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value, 10))} className="w-full" />
        <div className="rounded-2xl border p-4 bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">{t("calc.bacAt")}</p>
          <p className={`text-3xl font-bold ${currentBac >= 0.5 ? "text-red-600" : "text-emerald-600"}`}>
            {currentBac} g/L
          </p>
          {currentBac > 0 && (
            <div className="mt-3 rounded-2xl border p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                {t("calc.newDrivers")}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">{t("calc.peak")}</p>
            <p className="text-xl font-semibold">{analysis.peak.bac} g/L</p>
            <p className="text-xs text-neutral-500">a {analysis.peak.t} min</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">{t("calc.below05")}</p>
            <p className="text-xl font-semibold">
              {analysis.below05At !== null ? `${analysis.below05At} min` : "—"}
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-neutral-500">{t("calc.atZero")}</p>
            <p className="text-xl font-semibold">
              {analysis.below00At !== null ? `${analysis.below00At} min` : "—"}
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-500">
          ℹ️ {t("calc.note")}
        </p>
      </div>

      {showChart && (
        <ChartOverlay
          onClose={() => setShowChart(false)}
          tMaxMin={tMaxMin}
          sample={(t) => bacAtMin(t)}
          peak={analysis.peak}
        />
      )}
    </div>
  );
}

function ChartOverlay({
  onClose,
  tMaxMin,
  sample,
  peak,
}: {
  onClose: () => void;
  tMaxMin: number;
  sample: (t: number) => number;
  peak: { t: number; bac: number };
}) {
  const t = useT();
  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const [tooltip, setTooltip] = useState<{ x: number; y: number; t: number; bac: number } | null>(null);

  const data = useMemo(() => {
    const arr: Array<{ t: number; bac: number }> = [];
    for (let t = 0; t <= tMaxMin; t += 5) arr.push({ t, bac: sample(t) });
    if (arr[arr.length - 1]?.t !== tMaxMin) arr.push({ t: tMaxMin, bac: sample(tMaxMin) });
    return arr;
  }, [tMaxMin, sample]);

  const maxBac = Math.max(0.6, peak.bac * 1.2);

  const overlay = (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-3xl m-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">{t("calc.chartTitle")}</h2>
          <button className="btn" onClick={onClose}>{t("calc.chartClose")}</button>
        </div>
        <div className="p-4">
          <ResponsiveSvg
            padding={padding}
            data={data}
            maxBac={maxBac}
            peak={peak}
            onHover={setTooltip}
          />
          <div className="mt-2 text-sm text-neutral-500">
            {t("calc.chartInfo")}
          </div>
        </div>
      </div>
      {tooltip && (
        <div
          className="absolute text-xs bg-neutral-900 text-white px-2 py-1 rounded shadow"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          t={tooltip.t} min • {tooltip.bac} g/L
        </div>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}

function ResponsiveSvg({
  padding,
  data,
  maxBac,
  peak,
  onHover,
}: {
  padding: { top: number; right: number; bottom: number; left: number };
  data: Array<{ t: number; bac: number }>;
  maxBac: number;
  peak: { t: number; bac: number };
  onHover: (p: { x: number; y: number; t: number; bac: number } | null) => void;
}) {
  const t = useT();
  const width = 800;
  const height = 260;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const tMin = 0;
  const tMax = data[data.length - 1]?.t ?? 0;

  const x = (t: number) => padding.left + (t - tMin) / (tMax - tMin || 1) * innerW;
  const y = (bac: number) => padding.top + (1 - bac / (maxBac || 1)) * innerH;

  const path = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.t).toFixed(2)} ${y(p.bac).toFixed(2)}`)
    .join(" ");

  const gridX = Array.from({ length: 7 }, (_, i) => Math.round((tMax / 6) * i));
  const gridY = [0, 0.5, Math.round(maxBac * 100) / 100];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]">
      <g stroke="currentColor" opacity={0.1}>
        {gridX.map((t) => (
          <line key={`gx${t}`} x1={x(t)} x2={x(t)} y1={padding.top} y2={height - padding.bottom} />
        ))}
        {gridY.map((b) => (
          <line key={`gy${b}`} x1={padding.left} x2={width - padding.right} y1={y(b)} y2={y(b)} />
        ))}
      </g>

      <g fill="currentColor" opacity={0.6} fontSize={12}>
        {gridX.map((t) => (
          <text key={`lx${t}`} x={x(t)} y={height - 6} textAnchor="middle">{t}m</text>
        ))}
        <text x={padding.left - 10} y={y(0)} textAnchor="end">0</text>
        <text x={padding.left - 10} y={y(0.5)} textAnchor="end">0.5</text>
        <text x={padding.left - 10} y={y(maxBac)} textAnchor="end">{maxBac.toFixed(1)}</text>
        <text x={(padding.left + 800 - padding.right) / 2} y={height - 6} textAnchor="middle">{t("calc.chartTime")}</text>
        <text x={padding.left - 24} y={padding.top + 12} textAnchor="end">{t("calc.chartBac")}</text>
      </g>

      <line x1={padding.left} x2={800 - padding.right} y1={y(0)} y2={y(0)} stroke="currentColor" opacity={0.3} />
      <line x1={padding.left} x2={800 - padding.right} y1={y(0.5)} y2={y(0.5)} stroke="red" opacity={0.5} strokeDasharray="6 6" />

      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />
      <circle cx={x(peak.t)} cy={y(peak.bac)} r={4} fill="currentColor" />

      <rect
        x={padding.left} y={padding.top}
        width={innerW} height={innerH}
        fill="transparent"
        onMouseMove={(e) => {
          const rect = (e.target as SVGRectElement).getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const px = relX / rect.width * innerW + padding.left;
          const tGuess = Math.round((px - padding.left) / innerW * (tMax - tMin));
          let nearest = data[0];
          let best = Infinity;
          for (const p of data) {
            const dx = Math.abs(p.t - tGuess);
            if (dx < best) { best = dx; nearest = p; }
          }
          onHover({ x: x(nearest.t), y: y(nearest.bac), t: nearest.t, bac: nearest.bac });
        }}
        onMouseLeave={() => onHover(null)}
      />
    </svg>
  );
}
