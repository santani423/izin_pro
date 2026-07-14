"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Eye, Users, Clock, MousePointerClick } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/* ─── Data mock analitik ─── */
const stats = [
  { label: "Page Views Hari Ini", value: "3.481", change: "+14%", up: true, icon: Eye, color: "#5ba12b", bg: "#f3fae8" },
  { label: "Pengunjung Unik", value: "1.284", change: "+8%", up: true, icon: Users, color: "#3b82f6", bg: "#eff6ff" },
  { label: "Bounce Rate", value: "38%", change: "-3%", up: true, icon: MousePointerClick, color: "#f97316", bg: "#fff7ed" },
  { label: "Rata-rata Durasi", value: "3m 42s", change: "+12s", up: true, icon: Clock, color: "#8b5cf6", bg: "#f5f3ff" },
];

const trendData = [
  { day: "Sen", views: 820 },
  { day: "Sel", views: 1240 },
  { day: "Rab", views: 980 },
  { day: "Kam", views: 1560 },
  { day: "Jum", views: 1890 },
  { day: "Sab", views: 1120 },
  { day: "Min", views: 740 },
];

const topPages = [
  { page: "Beranda", views: 1892, percent: 92 },
  { page: "Layanan — Pendirian PT", views: 812, percent: 54 },
  { page: "Blog — Cara Membuat NIB", views: 618, percent: 42 },
  { page: "Kontak", views: 445, percent: 30 },
  { page: "Tentang Kami", views: 398, percent: 26 },
  { page: "Layanan — NIB/OSS", views: 312, percent: 21 },
];

const trafficSources = [
  { source: "Google Search", sessions: 1842, percent: 54 },
  { source: "Langsung (Direct)", sessions: 612, percent: 18 },
  { source: "Referral", sessions: 408, percent: 12 },
  { source: "WhatsApp Link", sessions: 272, percent: 8 },
  { source: "Facebook / IG", sessions: 204, percent: 6 },
  { source: "Lainnya", sessions: 68, percent: 2 },
];

const maxViews = Math.max(...trendData.map((d) => d.views));

/* ─── Halaman Analitik Admin ─── */
export default function AdminAnalitikPage() {
  const [range, setRange] = useState<"7" | "30" | "90">("7");

  return (
    <>

      <div className="p-6 lg:p-8 space-y-6">

        {/* ─── Filter Rentang Waktu ─── */}
        <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-xl w-fit">
          {(["7", "30", "90"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === r ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r} Hari
            </button>
          ))}
        </div>

        {/* ─── Kartu Statistik ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-admin-line p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: s.bg }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      s.up ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {s.change}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ─── Grafik Tren Kunjungan ─── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-admin-line p-5">
            <h2 className="font-bold text-sm text-gray-900 mb-5">Tren Page Views — 7 Hari Terakhir</h2>
            <div className="flex items-end gap-3 h-40">
              {trendData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-gray-500">{d.views.toLocaleString("id-ID")}</span>
                  {/* Wrapper butuh tinggi definitif (h-28) supaya height:% pada bar di bawah bisa dihitung browser — tanpa ini bar collapse ke 0 krn parent flex (items-end) gak stretch */}
                  <div className="w-full h-28 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-primary/20 hover:bg-primary/40 transition-colors cursor-default relative group"
                      style={{ height: `${(d.views / maxViews) * 100}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-primary transition-all"
                        style={{ height: "60%" }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Sumber Traffic ─── */}
          <div className="bg-white rounded-2xl border border-admin-line p-5">
            <h2 className="font-bold text-sm text-gray-900 mb-5">Sumber Traffic</h2>
            <div className="space-y-3.5">
              {trafficSources.map((s) => (
                <div key={s.source}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-700">{s.source}</span>
                    <span className="text-gray-400">{s.percent}%</span>
                  </div>
                  <Progress value={s.percent} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Halaman Terpopuler ─── */}
        <div className="bg-white rounded-2xl border border-admin-line overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-sm text-gray-900">Halaman Terpopuler</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-line bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Halaman</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Views</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase w-1/3">Traffic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topPages.map((p) => (
                <tr key={p.page} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 text-sm">{p.page}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 hidden md:table-cell">{p.views.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Progress value={p.percent} className="h-1.5 flex-1" />
                      <span className="text-xs text-gray-400 w-8 text-right">{p.percent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
