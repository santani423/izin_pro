import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types";

const ICONS: Record<string, React.ElementType> = {};

/* ─── Kartu statistik dashboard ─── */
export default function StatsCard({ stat }: { stat: DashboardStat }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl text-lg"
          style={{ backgroundColor: stat.bgColor }}
        >
          {stat.icon}
        </div>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            stat.changeType === "up" && "text-emerald-600 bg-emerald-50",
            stat.changeType === "down" && "text-red-500 bg-red-50",
            stat.changeType === "neutral" && "text-gray-500 bg-gray-50",
          )}
        >
          {stat.changeType === "up" && <TrendingUp size={11} />}
          {stat.changeType === "down" && <TrendingDown size={11} />}
          {stat.changeType === "neutral" && <Minus size={11} />}
          {stat.change}
        </span>
      </div>
      <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
      <div className="text-xs text-gray-500 mt-1">{stat.title}</div>
    </div>
  );
}
