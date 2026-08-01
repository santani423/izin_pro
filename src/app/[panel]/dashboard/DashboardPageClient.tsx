"use client";

import {
  Users, MessageSquare, FileText, Clock, ArrowRight, SlidersHorizontal,
  Receipt, Activity, CheckCircle2, XCircle, Wallet, ShoppingCart, Timer,
} from "lucide-react";
import MetricCard from "@/components/admin/MetricCard";
import MonthlyVisitsChart from "@/components/admin/MonthlyVisitsChart";
import TargetGauge from "@/components/admin/TargetGauge";
import StatisticsChart from "@/components/admin/StatisticsChart";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export interface TransactionStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
  cancelled: number;
  monthlyTransactions: number;
  monthlyRevenue: number;
  avgCompletionDays: number | null;
}

/* ─── Data statis mock dashboard ─── */
const recentInquiries = [
  { name: "Andi Setiawan", subject: "Pendirian PT", time: "5 menit lalu", status: "Baru" },
  { name: "Siti Nurhaliza", subject: "NIB Online", time: "1 jam lalu", status: "Diproses" },
  { name: "Budi Santoso", subject: "Izin Usaha", time: "3 jam lalu", status: "Selesai" },
  { name: "Rina Wijaya", subject: "Izin Komersial", time: "5 jam lalu", status: "Selesai" },
  { name: "Deni Hermawan", subject: "Pendirian PT", time: "Kemarin", status: "Diproses" },
];

const trafficSources = [
  { source: "Google Search", sessions: 1842, percent: 54 },
  { source: "Langsung (Direct)", sessions: 612, percent: 18 },
  { source: "Referral", sessions: 408, percent: 12 },
  { source: "WhatsApp Link", sessions: 272, percent: 8 },
  { source: "Facebook / IG", sessions: 204, percent: 6 },
  { source: "Lainnya", sessions: 68, percent: 2 },
];

const statusColor: Record<string, string> = {
  Baru: "bg-primary/10 text-primary",
  Diproses: "bg-amber-50 text-amber-600",
  Selesai: "bg-emerald-50 text-emerald-600",
};

/* ─── Halaman Dashboard — layout gaya TailAdmin ───
 * Ringkasan Transaksi (real, dari Prisma) digabung ke sini — sebelumnya
 * dashboard terpisah di /transaksi, sekarang satu pintu di Dashboard utama.
 * Kelola Workflow Template & Daftar Transaksi tetap di menu Transaksi
 * Layanan (sidebar), cuma ringkasan angkanya yg dipindah ke sini. */
export default function DashboardPageClient({
  panel,
  transactionStats,
}: {
  panel: string;
  transactionStats: TransactionStats;
}) {
  const transactionCards = [
    { label: "Total Transaksi", value: transactionStats.total.toLocaleString("id-ID"), icon: Receipt, color: "#5ba12b", bg: "#f3fae8" },
    { label: "Transaksi Aktif", value: transactionStats.active.toLocaleString("id-ID"), icon: Activity, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Selesai", value: transactionStats.completed.toLocaleString("id-ID"), icon: CheckCircle2, color: "#059669", bg: "#ecfdf5" },
    { label: "Menunggu", value: transactionStats.pending.toLocaleString("id-ID"), icon: Clock, color: "#d97706", bg: "#fffbeb" },
    { label: "Dibatalkan", value: transactionStats.cancelled.toLocaleString("id-ID"), icon: XCircle, color: "#dc2626", bg: "#fef2f2" },
    { label: "Pendapatan Bulan Ini", value: `Rp${transactionStats.monthlyRevenue.toLocaleString("id-ID")}`, icon: Wallet, color: "#5ba12b", bg: "#f3fae8" },
    { label: "Order Bulan Ini", value: transactionStats.monthlyTransactions.toLocaleString("id-ID"), icon: ShoppingCart, color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Rata-rata Waktu Selesai", value: transactionStats.avgCompletionDays != null ? `${transactionStats.avgCompletionDays} hari` : "-", icon: Timer, color: "#0891b2", bg: "#ecfeff" },
  ];

  return (
    <>

      <div className="p-4 sm:p-6 space-y-5">

        {/* ─── Ringkasan Transaksi (real) ─── */}
        <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-gray-900">Ringkasan Transaksi</h2>
              <p className="text-sm text-gray-400 mt-0.5">Modul Transaksi Layanan</p>
            </div>
            <Link
              href={`/${panel}/transaksi/daftar`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Lihat Semua Transaksi
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {transactionCards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="rounded-xl border border-admin-line p-4">
                  <div className="mb-3 p-2 rounded-lg w-fit" style={{ backgroundColor: c.bg }}>
                    <Icon size={16} style={{ color: c.color }} />
                  </div>
                  <div className="text-xl font-extrabold text-gray-900">{c.value}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Baris 1: 4 kartu metrik satu baris ─── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          <MetricCard
            label="Pengunjung Bulan Ini"
            value="12.483"
            change="+11,2%"
            changeType="up"
            icon={Users}
          />
          <MetricCard
            label="Inquiry Bulan Ini"
            value="48"
            change="-9,1%"
            changeType="down"
            icon={MessageSquare}
          />
          <MetricCard
            label="Artikel Published"
            value="24"
            change="+3"
            changeType="up"
            icon={FileText}
          />
          <MetricCard
            label="Rata-rata Waktu Kunjungan"
            value="3m 42s"
            change="-5s"
            changeType="down"
            icon={Clock}
          />
        </div>

        {/* ─── Baris 2: bar chart | gauge target ─── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <MonthlyVisitsChart />
          </div>
          <div className="lg:col-span-5">
            <TargetGauge />
          </div>
        </div>

        {/* ─── Baris 2: statistik dua seri ─── */}
        <StatisticsChart />

        {/* ─── Baris 3: sumber traffic | inquiry terbaru ─── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

          <div className="lg:col-span-5 bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
            <h2 className="font-bold text-base text-gray-900">Sumber Traffic</h2>
            <p className="text-sm text-gray-400 mt-0.5">Asal kunjungan website bulan ini</p>
            <div className="mt-5 space-y-4">
              {trafficSources.map((s) => (
                <div key={s.source} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-800 truncate">{s.source}</span>
                      <span className="text-gray-400 flex-shrink-0 ml-2">
                        {s.sessions.toLocaleString("id-ID")} · {s.percent}%
                      </span>
                    </div>
                    <Progress value={s.percent} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-base text-gray-900">Inquiry Terbaru</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal size={14} />
                  Filter
                </button>
                <Link
                  href={`/${panel}/inquiry`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Lihat Semua
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-y border-admin-line">
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400">Nama</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400">Layanan</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400">Waktu</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentInquiries.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                            {item.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">{item.subject}</td>
                      <td className="py-3.5 pr-4 text-gray-400 whitespace-nowrap">{item.time}</td>
                      <td className="py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
