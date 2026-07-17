import React, { useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Globe, Wheat, Info } from "lucide-react";

/* -------------------------------------------------------------------- */
/*  PALETTE / TOKENS                                                      */
/*  Chalkboard market board: deep forest chalkboard, chalk cream text,    */
/*  mustard-gold marker accent, sage for the secondary data series.       */
/* -------------------------------------------------------------------- */
const C = {
  board: "#1e2a20",
  boardAlt: "#25352a",
  boardLine: "#3a4a3d",
  chalk: "#f2ede0",
  chalkDim: "#c9c4b3",
  gold: "#d9a441",
  goldDim: "#a97f34",
  sage: "#8ea88a",
  rust: "#a8563d",
};

/* -------------------------------------------------------------------- */
/*  SYNTHETIC DATA                                                        */
/*  Illustrative only — generated for this assignment, not real market    */
/*  data. Deterministic (seeded) so numbers stay stable between renders.  */
/* -------------------------------------------------------------------- */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const ITEMS = [
  {
    id: "cinnamon",
    en: "Ceylon Cinnamon Quills",
    fr: "Bâtons de cannelle de Ceylan",
    cat: "spices",
    origin: "Sri Lanka",
    base: 9.5,
    trend: 0.018,
    amp: 0.25,
    seed: 11,
  },
  {
    id: "chili",
    en: "Kashmiri Chili Powder",
    fr: "Poudre de chili du Cachemire",
    cat: "spices",
    origin: "India",
    base: 8.0,
    trend: 0.021,
    amp: 0.22,
    seed: 23,
  },
  {
    id: "paprika",
    en: "Smoked Applewood Paprika",
    fr: "Paprika fumé au bois de pommier",
    cat: "spices",
    origin: "USA",
    base: 7.25,
    trend: 0.015,
    amp: 0.18,
    seed: 37,
  },
  {
    id: "pepper",
    en: "Wild Malabar Peppercorns",
    fr: "Poivre sauvage du Malabar",
    cat: "spices",
    origin: "India",
    base: 11,
    trend: 0.024,
    amp: 0.2,
    seed: 41,
  },
  {
    id: "turmeric",
    en: "Alleppey Finger Turmeric",
    fr: "Curcuma Alleppey",
    cat: "spices",
    origin: "India",
    base: 6.5,
    trend: 0.016,
    amp: 0.16,
    seed: 53,
  },
  {
    id: "oliveoil",
    en: "Sicilian Frantoio Olive Oil",
    fr: "Huile d'olive Sicilienne Frantoio",
    cat: "oils",
    origin: "Italy",
    base: 24,
    trend: 0.03,
    amp: 0.45,
    seed: 61,
  },
  {
    id: "sesame",
    en: "Toasted Sesame Oil",
    fr: "Huile de sésame grillé",
    cat: "oils",
    origin: "Japan",
    base: 14.5,
    trend: 0.022,
    amp: 0.32,
    seed: 69,
  },
  {
    id: "argan",
    en: "Cold-Pressed Argan Oil",
    fr: "Huile d'argan pressée à froid",
    cat: "oils",
    origin: "Morocco",
    base: 28,
    trend: 0.027,
    amp: 0.40,
    seed: 77,
  },
  {
    id: "redrice",
    en: "Bhutanese Red Rice",
    fr: "Riz rouge du Bhoutan",
    cat: "grains",
    origin: "Bhutan",
    base: 9,
    trend: 0.018,
    amp: 0.20,
    seed: 83,
  },
  {
    id: "farro",
    en: "Heirloom Umbrian Farro",
    fr: "Farro traditionnel d'Ombrie",
    cat: "grains",
    origin: "Italy",
    base: 8.5,
    trend: 0.018,
    amp: 0.16,
    seed: 91,
  },
  {
    id: "quinoa",
    en: "Black Quinoa",
    fr: "Quinoa noir",
    cat: "grains",
    origin: "Peru",
    base: 10,
    trend: 0.02,
    amp: 0.18,
    seed: 101,
  },
  {
    id: "calabrian",
    en: "Calabrian Chili Paste",
    fr: "Pâte de piment calabrais",
    cat: "sauces",
    origin: "Italy",
    base: 12,
    trend: 0.023,
    amp: 0.22,
    seed: 111,
  },
  {
    id: "fishsauce",
    en: "Aged Three-Crab Fish Sauce",
    fr: "Sauce de poisson Trois Crabes",
    cat: "sauces",
    origin: "Vietnam",
    base: 16,
    trend: 0.026,
    amp: 0.25,
    seed: 121,
  },
  {
    id: "chipotle",
    en: "Smoked Chipotle Salsa",
    fr: "Salsa chipotle fumée",
    cat: "sauces",
    origin: "Mexico",
    base: 9.75,
    trend: 0.019,
    amp: 0.20,
    seed: 131,
  },
  {
    id: "lemon",
    en: "Wild Meyer Lemon Preserve",
    fr: "Conserve de citron Meyer",
    cat: "sauces",
    origin: "Morocco",
    base: 13,
    trend: 0.021,
    amp: 0.18,
    seed: 141,
  },
];

const CATEGORIES = [
    { id: "spices", en: "Spices", fr: "Épices" },
    { id: "oils", en: "Oils", fr: "Huiles" },
    { id: "grains", en: "Grains", fr: "Céréales" },
    { id: "sauces", en: "Sauces & Condiments", fr: "Sauces et condiments" },
];

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FR = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

// build 72 months (Jan 2019 - Dec 2024) of synthetic price history per item
const HISTORY = ITEMS.reduce((acc, item) => {
  const rnd = seeded(item.seed);
  const points = [];
  for (let m = 0; m < YEARS.length * 12; m++) {
    const year = YEARS[Math.floor(m / 12)];
    const month = m % 12;
    const trendComponent = item.trend * m;
    const seasonal = item.amp * Math.sin((2 * Math.PI * month) / 12 + item.seed);
    const noise = (rnd() - 0.5) * item.amp * 0.6;
    const price = Math.max(0.5, item.base + trendComponent + seasonal + noise);
    points.push({ year, month, price: Math.round(price * 100) / 100 });
  }
  acc[item.id] = points;
  return acc;
}, {});

function yearlyAverage(itemId, year) {
  const pts = HISTORY[itemId].filter((p) => p.year === year);
  const avg = pts.reduce((s, p) => s + p.price, 0) / pts.length;
  return Math.round(avg * 100) / 100;
}

/* -------------------------------------------------------------------- */
/*  TRANSLATIONS                                                          */
/* -------------------------------------------------------------------- */
const T = {
  en: {
    langName: "EN",
    kicker: "A Larder project",
    title: "Larder Dashboard",
    subtitle: "Tracking pantry staple prices across a single-origin grocery basket",
    intro:
      "This board follows nine pantry staples — grains, legumes, oils and beverages — the same items behind the Larder shop. Pick an item below to watch its price move month by month, or compare a category's items side by side.",
    syntheticNotice:
      "All prices shown are synthetic, illustrative data generated for this assignment — not real market figures.",
    tickerLabel: "On the board today",
    chart1Kicker: "Chart 1 — Line",
    chart1Title: "Price over time",
    chart1Desc:
      "Context: this line follows one pantry item's monthly price so a shopper can spot a slow climb versus a seasonal blip. Kept clutter-free with a single series and light gridlines; contrast comes from the gold trend line against the dark board.",
    itemSelectLabel: "Item",
    rangeSelectLabel: "Range",
    range12: "Last 12 months",
    range36: "Last 3 years",
    range72: "Full history (6 years)",
    priceAxis: "CAD / kg",
    chart2Kicker: "Chart 2 — Bar",
    chart2Title: "Average Price By Product Category",
    chart2Desc:
      "Context: this bar chart sets a category's items side by side for a given year, against the year before, so the comparison itself carries the contrast. Clutter-free: no 3D, no extra gridlines, direct value labels instead of a dense legend.",
    categorySelectLabel: "Category",
    yearSelectLabel: "Year",
    legendCurrent: (y) => `${y}`,
    legendPrevious: (y) => `${y - 1}`,
    footer: "Part of the Larder pantry project — built with React and Recharts.",
    tooltipPrice: "Price",
  },
  fr: {
    langName: "FR",
    kicker: "Un projet Larder",
    title: "Le grand livre du garde-manger",
    subtitle: "Suivi des prix des produits de base d'un panier d'épicerie à origine unique",
    intro:
      "Ce tableau suit neuf produits de base — céréales, légumineuses, huiles et boissons — les mêmes que ceux de la boutique Larder. Choisissez un article ci-dessous pour suivre son prix mois après mois, ou comparez les articles d'une catégorie.",
    syntheticNotice:
      "Tous les prix affichés sont des données synthétiques et illustratives générées pour ce travail, et non de vrais chiffres du marché.",
    tickerLabel: "Sur le tableau aujourd'hui",
    chart1Kicker: "Graphique 1 — Ligne",
    chart1Title: "Prix dans le temps",
    chart1Desc:
      "Contexte : cette ligne suit le prix mensuel d'un seul article afin de repérer une hausse lente plutôt qu'un pic saisonnier. Épuré avec une seule série et des lignes de grille légères; le contraste vient de la ligne dorée sur fond foncé.",
    itemSelectLabel: "Article",
    rangeSelectLabel: "Période",
    range12: "12 derniers mois",
    range36: "3 dernières années",
    range72: "Historique complet (6 ans)",
    priceAxis: "CAD / kg",
    chart2Kicker: "Graphique 2 — Barres",
    chart2Title: "Comparaison par catégorie",
    chart2Desc:
      "Contexte : ce graphique à barres place les articles d'une catégorie côte à côte pour une année donnée, face à l'année précédente, la comparaison elle-même créant le contraste. Épuré : pas de 3D, peu de grilles, étiquettes directes plutôt qu'une légende dense.",
    categorySelectLabel: "Catégorie",
    yearSelectLabel: "Année",
    legendCurrent: (y) => `${y}`,
    legendPrevious: (y) => `${y - 1}`,
    footer: "Fait partie du projet de garde-manger Larder — conçu avec React et Recharts.",
    tooltipPrice: "Prix",
  },
};

/* -------------------------------------------------------------------- */
/*  UI PRIMITIVES                                                         */
/* -------------------------------------------------------------------- */
function ChalkSelect({ value, onChange, options, label }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span style={{ color: C.chalkDim, fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded outline-none"
        style={{
          background: C.boardAlt,
          color: C.chalk,
          border: `1.5px dashed ${C.goldDim}`,
          fontFamily: "'IBM Plex Sans', sans-serif",
          minWidth: 180,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: C.board, color: C.chalk }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionCard({ kicker, title, desc, children }) {
  return (
    <section
      className="rounded-lg p-5 md:p-6"
      style={{ background: C.boardAlt, border: `1px solid ${C.boardLine}` }}
    >
      <p
        className="text-xs tracking-widest uppercase mb-1"
        style={{ color: C.gold, fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {kicker}
      </p>
      <h2
        className="text-2xl mb-2"
        style={{ color: C.chalk, fontFamily: "'Kalam', cursive" }}
      >
        {title}
      </h2>
      <p className="text-sm mb-4 max-w-2xl" style={{ color: C.chalkDim, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {desc}
      </p>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                        */
/* -------------------------------------------------------------------- */
export default function LarderLedger() {
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [selectedItem, setSelectedItem] = useState("coffee");
  const [range, setRange] = useState("36");
  const [selectedCategory, setSelectedCategory] = useState("grains");
  const [selectedYear, setSelectedYear] = useState(2024);

  const months = lang === "en" ? MONTHS_EN : MONTHS_FR;

  const lineData = useMemo(() => {
    const full = HISTORY[selectedItem];
    const n = parseInt(range, 10);
    const slice = full.slice(full.length - n);
    return slice.map((p) => ({
      label: `${months[p.month]} ${String(p.year).slice(2)}`,
      price: p.price,
    }));
  }, [selectedItem, range, lang]);

  const itemLabel = (id) => ITEMS.find((i) => i.id === id)[lang];

  const barData = useMemo(() => {
    const items = ITEMS.filter((i) => i.cat === selectedCategory);
    return items.map((i) => ({
      name: i[lang],
      [t.legendCurrent(selectedYear)]: yearlyAverage(i.id, selectedYear),
      [t.legendPrevious(selectedYear)]: yearlyAverage(i.id, selectedYear - 1),
    }));
  }, [selectedCategory, selectedYear, lang]);

  const tickerItems = ITEMS.map((i) => {
    const last = HISTORY[i.id][HISTORY[i.id].length - 1];
    return `${i[lang]} · $${last.price.toFixed(2)}`;
  });

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: C.board, fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes tickerMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { display: flex; width: max-content; animation: tickerMove 32s linear infinite; }
        select:focus { outline: 2px solid ${C.gold}; }
      `}</style>

      {/* header */}
      <header className="px-5 md:px-10 pt-8 pb-4 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Wheat size={28} color={C.gold} />
            <div>
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: C.chalkDim, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {t.kicker}
              </p>
              <h1 style={{ color: C.chalk, fontFamily: "'Kalam', cursive", fontSize: 40, lineHeight: 1 }}>
                {t.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe size={16} color={C.chalkDim} />
            {["en", "fr"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-3 py-1 rounded text-sm"
                style={{
                  background: lang === l ? C.gold : "transparent",
                  color: lang === l ? C.board : C.chalk,
                  border: `1px solid ${C.goldDim}`,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                }}
                aria-pressed={lang === l}
              >
                {T[l].langName}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2 text-base" style={{ color: C.chalkDim }}>{t.subtitle}</p>
        <p className="mt-3 text-sm max-w-2xl" style={{ color: C.chalk, opacity: 0.85 }}>{t.intro}</p>

        <div
          className="mt-4 flex items-start gap-2 px-3 py-2 rounded text-xs"
          style={{ background: "rgba(168,86,61,0.15)", border: `1px solid ${C.rust}`, color: C.chalk }}
        >
          <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} color={C.rust} />
          <span>{t.syntheticNotice}</span>
        </div>
      </header>

      {/* ticker — signature element */}
      <div
        className="overflow-hidden py-2 mt-2"
        style={{ borderTop: `1px dashed ${C.boardLine}`, borderBottom: `1px dashed ${C.boardLine}` }}
      >
        <p
          className="px-5 md:px-10 text-xs uppercase tracking-widest mb-1"
          style={{ color: C.chalkDim, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {t.tickerLabel}
        </p>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((txt, idx) => (
            <span
              key={idx}
              className="px-6 whitespace-nowrap text-sm"
              style={{ color: C.gold, fontFamily: "'Kalam', cursive" }}
            >
              {txt}
            </span>
          ))}
        </div>
      </div>

      {/* charts */}
      <main className="px-5 md:px-10 py-6 max-w-5xl mx-auto flex flex-col gap-6">
        <SectionCard kicker={t.chart1Kicker} title={t.chart1Title} desc={t.chart1Desc}>
          <div className="flex flex-wrap gap-4 mb-4">
            <ChalkSelect
              label={t.itemSelectLabel}
              value={selectedItem}
              onChange={setSelectedItem}
              options={ITEMS.map((i) => ({ value: i.id, label: i[lang] }))}
            />
            <ChalkSelect
              label={t.rangeSelectLabel}
              value={range}
              onChange={setRange}
              options={[
                { value: "12", label: t.range12 },
                { value: "36", label: t.range36 },
                { value: "72", label: t.range72 },
              ]}
            />
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={lineData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid stroke={C.boardLine} strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: C.chalkDim, fontSize: 11 }}
                  interval={Math.max(0, Math.floor(lineData.length / 8))}
                  axisLine={{ stroke: C.boardLine }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: C.chalkDim, fontSize: 11 }}
                  axisLine={{ stroke: C.boardLine }}
                  tickLine={false}
                  label={{ value: t.priceAxis, angle: -90, position: "insideLeft", fill: C.chalkDim, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ background: C.board, border: `1px solid ${C.goldDim}`, borderRadius: 6 }}
                  labelStyle={{ color: C.chalk }}
                  itemStyle={{ color: C.gold }}
                  formatter={(v) => [`$${v.toFixed(2)}`, t.tooltipPrice]}
                />
                <Line type="monotone" dataKey="price" stroke={C.gold} strokeWidth={2.5} dot={false} name={itemLabel(selectedItem)} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard kicker={t.chart2Kicker} title={t.chart2Title} desc={t.chart2Desc}>
          <div className="flex flex-wrap gap-4 mb-4">
            <ChalkSelect
              label={t.categorySelectLabel}
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={CATEGORIES.map((c) => ({ value: c.id, label: c[lang] }))}
            />
            <ChalkSelect
              label={t.yearSelectLabel}
              value={String(selectedYear)}
              onChange={(v) => setSelectedYear(parseInt(v, 10))}
              options={YEARS.filter((y) => y > 2019).map((y) => ({ value: String(y), label: String(y) }))}
            />
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid stroke={C.boardLine} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.chalkDim, fontSize: 11 }} axisLine={{ stroke: C.boardLine }} tickLine={false} />
                <YAxis
                  tick={{ fill: C.chalkDim, fontSize: 11 }}
                  axisLine={{ stroke: C.boardLine }}
                  tickLine={false}
                  label={{ value: t.priceAxis, angle: -90, position: "insideLeft", fill: C.chalkDim, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ background: C.board, border: `1px solid ${C.goldDim}`, borderRadius: 6 }}
                  labelStyle={{ color: C.chalk }}
                  formatter={(v) => [`$${v.toFixed(2)}`, t.tooltipPrice]}
                />
                <Legend wrapperStyle={{ color: C.chalkDim, fontSize: 12 }} />
                <Bar dataKey={t.legendPrevious(selectedYear)} fill={C.sage} radius={[3, 3, 0, 0]} />
                <Bar dataKey={t.legendCurrent(selectedYear)} fill={C.gold} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </main>

      <footer className="px-5 md:px-10 pb-8 max-w-5xl mx-auto">
        <p className="text-xs" style={{ color: C.chalkDim, fontFamily: "'IBM Plex Mono', monospace" }}>
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

export default App
