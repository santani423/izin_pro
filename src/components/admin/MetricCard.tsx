import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  /** Opsional — hanya tampilkan pill tren kalau memang bisa dihitung dari data real */
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

const TREND_ICON = { up: ArrowUp, down: ArrowDown, neutral: Minus };

/* Warna tren: naik hijau, turun merah (lingkaran panah & pill persentase) */
const TREND_COLOR = {
  up: "bg-emerald-50 text-emerald-600",
  down: "bg-red-50 text-red-500",
  neutral: "bg-gray-100 text-gray-500",
};

/* ─── Kartu metrik model Berry: kartu hijau solid + lingkaran dekoratif ─── */
export default function MetricCard({
  label,
  value,
  change,
  changeType,
  icon: Icon,
}: MetricCardProps) {
  const Trend = changeType ? TREND_ICON[changeType] : null;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-700 p-4 sm:p-6 text-white">
      {/* Lingkaran dekoratif pojok kanan atas */}
      <div className="absolute -top-20 -right-24 w-44 h-44 rounded-full bg-brand-800" aria-hidden="true" />
      <div className="absolute -top-2 -right-32 w-44 h-44 rounded-full bg-brand-800/50" aria-hidden="true" />

      <div className="relative">
        {/* Baris atas: avatar ikon */}
        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-800 text-white">
          <Icon size={20} />
        </div>

        {/* Nilai besar + lingkaran tren */}
        <div className="mt-5 flex items-center gap-2.5">
          <div className="text-xl sm:text-2xl lg:text-[28px] font-bold leading-none">{value}</div>
          {Trend && changeType && (
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full ${TREND_COLOR[changeType]}`}
              title={`${change} dibanding periode lalu`}
            >
              <Trend size={15} strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* Label + pill perubahan */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-sm text-brand-200 truncate">{label}</p>
          {Trend && changeType && change && (
            <span
              className={`flex items-center gap-1 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${TREND_COLOR[changeType]}`}
            >
              <Trend size={11} strokeWidth={2.5} />
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
