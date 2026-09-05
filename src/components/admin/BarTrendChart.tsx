"use client";

import { useEffect, useRef, useState } from "react";

export interface TrendPoint {
  label: string;
  value: number;
}

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtTick = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}rb` : fmt(n));

const PAD = { top: 12, right: 6, bottom: 24, left: 42 };

function niceCeil(v: number) {
  if (v <= 0) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

/* ─── Bar chart tren bulanan generik — dipakai untuk data real apa pun
 * (transaksi, kunjungan artikel, dst), mengisi penuh kartu, responsif ─── */
export default function BarTrendChart({
  title,
  subtitle,
  data,
  valueLabel = "",
  valueFormatter = fmt,
}: {
  title: string;
  subtitle?: string;
  data: TrendPoint[];
  valueLabel?: string;
  valueFormatter?: (n: number) => string;
}) {
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

  const hasData = data.length > 0 && data.some((d) => d.value > 0);
  const yMax = niceCeil(Math.max(...data.map((d) => d.value), 0));
  const yTicks = [0, 1, 2, 3, 4].map((i) => (yMax / 4) * i);
  const band = data.length > 0 ? IW / data.length : IW;
  const barW = Math.min(32, band * 0.42);

  const barPath = (i: number) => {
    const v = data[i].value;
    const x = PAD.left + band * i + (band - barW) / 2;
    const y = PAD.top + IH * (1 - v / yMax);
    const base = PAD.top + IH;
    const r = Math.min(4, (base - y) / 2);
    return `M${x},${base} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${base} Z`;
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-admin-line p-5 sm:p-6 flex flex-col">
      <h2 className="font-bold text-base text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}

      {!hasData ? (
        <div className="flex-1 min-h-[220px] mt-4 flex items-center justify-center text-sm text-gray-400">
          Belum ada data untuk periode ini
        </div>
      ) : (
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

            {data.map((d, i) => {
              const cx = PAD.left + band * i + band / 2;
              return (
                <g key={d.label + i}>
                  <path
                    d={barPath(i)}
                    fill="var(--primary)"
                    opacity={hover === null || hover === i ? 1 : 0.35}
                    className="transition-opacity duration-150"
                  />
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
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {hover !== null && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg bg-gray-900 px-3 py-2 text-white shadow-lg"
              style={{
                left: PAD.left + band * hover + band / 2,
                top: PAD.top + IH * (1 - data[hover].value / yMax),
                transform: `translate(${hover < data.length * 0.2 ? "-10%" : hover > data.length * 0.8 ? "-90%" : "-50%"}, calc(-100% - 10px))`,
              }}
            >
              <div className="text-sm font-bold leading-tight">{valueFormatter(data[hover].value)}</div>
              <div className="text-[10px] text-gray-300 whitespace-nowrap">
                {valueLabel} · {data[hover].label}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
