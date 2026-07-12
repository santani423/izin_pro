import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* Data mock target inquiry bulanan */
const TARGET = 60;
const TERCAPAI = 48;
const HARI_INI = 6;

const pct = Math.round((TERCAPAI / TARGET) * 1000) / 10; // 80%

/* Geometri gauge setengah lingkaran */
const R = 90;
const STROKE = 14;
const CX = R + STROKE / 2;
const CY = R + STROKE / 2;
const ARC_LEN = Math.PI * R;

const arcPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

interface FooterStat {
  label: string;
  value: string;
  dir?: "up" | "down";
}

const footer: FooterStat[] = [
  { label: "Target", value: String(TARGET), dir: "down" },
  { label: "Tercapai", value: String(TERCAPAI), dir: "up" },
  { label: "Hari Ini", value: String(HARI_INI), dir: "up" },
];

/* ─── Kartu gauge target inquiry gaya TailAdmin Monthly Target ─── */
export default function TargetGauge() {
  return (
    <div className="h-full bg-white rounded-2xl border border-admin-line overflow-hidden flex flex-col">
      <div className="p-5 sm:p-6 flex-1">
        <h2 className="font-bold text-base text-gray-900">Target Inquiry Bulanan</h2>
        <p className="text-sm text-gray-400 mt-0.5">Target inquiry yang Anda tetapkan tiap bulan</p>

        {/* Gauge */}
        <div className="relative mx-auto mt-6 w-full max-w-[240px]">
          <svg
            viewBox={`0 0 ${CX * 2} ${CY + STROKE / 2}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Pencapaian target inquiry ${pct}% (${TERCAPAI} dari ${TARGET})`}
          >
            <path
              d={arcPath}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
            <path
              d={arcPath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={ARC_LEN}
              strokeDashoffset={ARC_LEN * (1 - pct / 100)}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <div className="text-3xl font-bold text-gray-900">{pct}%</div>
            <span className="mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              +10%
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 leading-relaxed">
          Anda menerima {HARI_INI} inquiry hari ini, lebih tinggi dari kemarin.
          Pertahankan performanya!
        </p>
      </div>

      {/* Footer 3 kolom — background hijau brand */}
      <div className="grid grid-cols-3 divide-x divide-brand-600/40 bg-brand-700 text-white">
        {footer.map((f) => (
          <div key={f.label} className="py-4 text-center">
            <div className="text-xs text-brand-200">{f.label}</div>
            <div className="mt-1 flex items-center justify-center gap-1 text-base font-bold">
              {f.value}
              {f.dir && (
                <span className={cn(f.dir === "up" ? "text-emerald-300" : "text-red-300")}>
                  {f.dir === "up" ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
