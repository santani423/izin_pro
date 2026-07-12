"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/* Data mock kunjungan bulanan — konsisten dgn metrik ±12rb pengunjung/bulan */
const DATA = [8400, 11200, 9100, 12800, 9600, 10400, 13500, 7200, 10900, 14100, 12300, 12483];

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtTick = (n: number) => (n >= 1000 ? `${n / 1000}rb` : fmt(n));

const PAD = { top: 12, right: 6, bottom: 24, left: 38 };

function niceCeil(v: number) {
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

/* ─── Bar chart kunjungan bulanan — mengisi penuh kartu, responsif ─── */
export default function MonthlyVisitsChart() {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 560, h: 240 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDims({ w: Math.max(r.width, 240), h: Math.max(r.height, 160) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: W, h: H } = dims;
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;

  const yMax = niceCeil(Math.max(...DATA));
  const yTicks = [0, 1, 2, 3, 4].map((i) => (yMax / 4) * i);
  const band = IW / DATA.length;
  const barW = Math.min(24, band * 0.42);

  /* Bar: ujung atas membulat 4px, dasar siku di baseline */
  const barPath = (i: number) => {
    const v = DATA[i];
    const x = PAD.left + band * i + (band - barW) / 2;
    const y = PAD.top + IH * (1 - v / yMax);
    const base = PAD.top + IH;
    const r = Math.min(4, (base - y) / 2);
    return `M${x},${base} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${base} Z`;
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-admin-line p-5 sm:p-6 flex flex-col">
      <h2 className="font-bold text-base text-gray-900">Kunjungan Bulanan</h2>

      <div ref={wrapRef} className="relative flex-1 mt-4 min-h-[220px]">
        <svg width={W} height={H} className="absolute inset-0">
          {yTicks.map((t) => {
            const y = PAD.top + IH * (1 - t / yMax);
            return (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                <text x={PAD.left - 8} y={y + 3.5} textAnchor="end" className="fill-gray-400" fontSize={10}>
                  {fmtTick(t)}
                </text>
              </g>
            );
          })}

          {DATA.map((v, i) => {
            const cx = PAD.left + band * i + band / 2;
            return (
              <g key={i}>
                <path
                  d={barPath(i)}
                  fill="var(--primary)"
                  opacity={hover === null || hover === i ? 1 : 0.35}
                  className="transition-opacity duration-150"
                />
                {/* Hit area lebih besar dari bar */}
                <rect
                  x={PAD.left + band * i}
                  y={PAD.top}
                  width={band}
                  height={IH}
                  fill="transparent"
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                />
                <text x={cx} y={H - 6} textAnchor="middle" className="fill-gray-400" fontSize={10}>
                  {MONTHS[i]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hover !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-gray-900 px-3 py-2 text-white shadow-lg"
            style={{
              left: PAD.left + band * hover + band / 2,
              top: PAD.top + IH * (1 - DATA[hover] / yMax),
              transform: `translate(${hover < 2 ? "-10%" : hover > 9 ? "-90%" : "-50%"}, calc(-100% - 10px))`,
            }}
          >
            <div className="text-sm font-bold leading-tight">{fmt(DATA[hover])}</div>
            <div className="text-[10px] text-gray-300 whitespace-nowrap">
              Kunjungan · {MONTHS[hover]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
