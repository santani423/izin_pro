"use client";

import { useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "bulanan" | "mingguan" | "harian";

interface Point {
  label: string;
  full: string;
  pv: number;
  uv: number;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "bulanan", label: "Bulanan" },
  { key: "mingguan", label: "Mingguan" },
  { key: "harian", label: "Harian" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAY_MS = 86_400_000;
const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/* Dua seri — konsisten dgn metrik ±12rb pengunjung/bulan (pv ≈ 3× uv) */
const SERIES: Record<TabKey, Point[]> = {
  bulanan: MONTHS.map((m, i) => {
    const pv = Math.round(31000 + 8000 * Math.sin(i / 2.1) + ((i * 53) % 17) * 400 + (i > 6 ? i * 500 : 0));
    return { label: m, full: `${m} 2026`, pv, uv: Math.round(pv * (0.34 + ((i * 29) % 10) / 100)) };
  }),
  mingguan: Array.from({ length: 12 }, (_, i) => {
    const pv = Math.round(7600 + 1800 * Math.sin(i / 1.8) + ((i * 41) % 13) * 160);
    return { label: `M${i + 1}`, full: `Minggu ke-${i + 1}`, pv, uv: Math.round(pv * (0.35 + ((i * 31) % 8) / 100)) };
  }),
  harian: Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * DAY_MS);
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.62 : 1;
    const pv = Math.round((1150 + 280 * Math.sin(i / 4.2) + ((i * 37) % 19) * 22) * weekend);
    return {
      label: `${d.getDate()}`,
      full: `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`,
      pv,
      uv: Math.round(pv * (0.35 + ((i * 23) % 9) / 100)),
    };
  }),
};

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtTick = (n: number) =>
  n >= 1_000_000 ? `${n / 1_000_000}jt` : n >= 1000 ? `${n / 1000}rb` : fmt(n);

function niceCeil(v: number) {
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

/* Geometri SVG */
const W = 960;
const H = 260;
const PAD = { top: 14, right: 10, bottom: 26, left: 44 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

/* Warna seri — tervalidasi CVD: primary + hijau tua (chart-4) */
const C_PV = "var(--chart-1)";
const C_UV = "var(--chart-4)";

/* ─── Kartu statistik dua seri gaya TailAdmin ─── */
export default function StatisticsChart() {
  const [tab, setTab] = useState<TabKey>("bulanan");
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = SERIES[tab];
  const n = data.length;
  const yMax = niceCeil(Math.max(...data.map((d) => d.pv)));
  const yTicks = [0, 1, 2, 3, 4].map((i) => (yMax / 4) * i);
  const xStep = Math.max(1, Math.ceil(n / 12));

  const x = (i: number) => PAD.left + (n === 1 ? IW / 2 : (i / (n - 1)) * IW);
  const y = (v: number) => PAD.top + IH * (1 - v / yMax);

  const line = (key: "pv" | "uv") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
  const area = (key: "pv" | "uv") =>
    `${line(key)} L${x(n - 1).toFixed(1)},${PAD.top + IH} L${x(0).toFixed(1)},${PAD.top + IH} Z`;

  const moveTo = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((px - PAD.left) / IW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, idx)));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setHover((h) => Math.min(n - 1, (h ?? n - 1) + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setHover((h) => Math.max(0, (h ?? n - 1) - 1));
    } else if (e.key === "Escape") {
      setHover(null);
    }
  };

  const hovered = hover !== null ? data[hover] : null;
  const tipShift =
    hover === null ? "-50%" : hover < n * 0.15 ? "-8%" : hover > n * 0.85 ? "-92%" : "-50%";

  return (
    <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
      {/* Header: judul + tab + rentang tanggal */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-base text-gray-900">Statistik</h2>
          <p className="text-sm text-gray-400 mt-0.5">Page views & pengunjung unik website</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setHover(null);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-md text-sm font-medium transition-all",
                  tab === t.key
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
            <CalendarDays size={15} className="text-gray-400" />
            Jan – Des 2026
          </div>
        </div>
      </div>

      {/* Legend — wajib untuk 2 seri */}
      <div className="mt-4 flex items-center gap-5">
        {[
          { color: C_PV, label: "Page Views" },
          { color: C_UV, label: "Pengunjung Unik" },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Grafik */}
      <div
        className="relative mt-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
        tabIndex={0}
        role="img"
        aria-label={`Grafik statistik page views dan pengunjung unik, tampilan ${tab}`}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onPointerMove={(e) => moveTo(e.clientX)}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#f3f4f6" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t) + 3.5} textAnchor="end" className="fill-gray-400" fontSize={11}>
                {fmtTick(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) =>
            i % xStep === 0 ? (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-gray-400" fontSize={11}>
                {d.label}
              </text>
            ) : null,
          )}

          {/* Area & garis — seri gelap digambar terakhir */}
          <path d={area("pv")} fill={C_PV} opacity={0.1} />
          <path d={line("pv")} fill="none" stroke={C_PV} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={area("uv")} fill={C_UV} opacity={0.1} />
          <path d={line("uv")} fill="none" stroke={C_UV} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Crosshair + marker kedua seri */}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + IH} stroke="#d1d5db" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(data[hover].pv)} r={4} fill={C_PV} stroke="#fff" strokeWidth={2} />
              <circle cx={x(hover)} cy={y(data[hover].uv)} r={4} fill={C_UV} stroke="#fff" strokeWidth={2} />
            </g>
          )}
        </svg>

        {/* Tooltip — satu tooltip untuk semua seri */}
        {hovered && hover !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-gray-900 px-3 py-2.5 text-white shadow-lg"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              top: `${(Math.min(y(hovered.pv), y(hovered.uv)) / H) * 100}%`,
              transform: `translate(${tipShift}, calc(-100% - 12px))`,
            }}
          >
            <div className="text-[10px] text-gray-300 whitespace-nowrap">{hovered.full}</div>
            {[
              { color: C_PV, label: "Page Views", v: hovered.pv },
              { color: C_UV, label: "Pengunjung Unik", v: hovered.uv },
            ].map((row) => (
              <div key={row.label} className="mt-1 flex items-center gap-2 whitespace-nowrap">
                <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: row.color }} />
                <span className="text-sm font-bold leading-none">{fmt(row.v)}</span>
                <span className="text-[10px] text-gray-300">{row.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fallback non-visual untuk screen reader */}
      <table className="sr-only">
        <caption>Statistik page views dan pengunjung unik ({tab})</caption>
        <thead>
          <tr>
            <th>Periode</th>
            <th>Page Views</th>
            <th>Pengunjung Unik</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.full}</td>
              <td>{fmt(d.pv)}</td>
              <td>{fmt(d.uv)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
