"use client";

import { Eye, Users, FileText, MessageSquare, TrendingUp, ArrowRight, Clock } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCard from "@/components/admin/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import type { DashboardStat } from "@/types";

/* ─── Data statis mock dashboard ─── */
const stats: DashboardStat[] = [
  { title: "Total Pengunjung Hari Ini", value: "1.284", change: "+12%", changeType: "up", icon: "👁️", color: "#5ba12b", bgColor: "#f3fae8" },
  { title: "Inquiry Masuk Bulan Ini", value: "48", change: "+8%", changeType: "up", icon: "💬", color: "#3b82f6", bgColor: "#eff6ff" },
  { title: "Artikel Published", value: "24", change: "+3", changeType: "up", icon: "📝", color: "#f97316", bgColor: "#fff7ed" },
  { title: "Rata-rata Waktu Kunjungan", value: "3m 42s", change: "-5s", changeType: "down", icon: "⏱️", color: "#8b5cf6", bgColor: "#f5f3ff" },
];

const recentInquiries = [
  { name: "Andi Setiawan", subject: "Pendirian PT", time: "5 menit lalu", status: "Baru" },
  { name: "Siti Nurhaliza", subject: "NIB Online", time: "1 jam lalu", status: "Diproses" },
  { name: "Budi Santoso", subject: "Izin Usaha", time: "3 jam lalu", status: "Selesai" },
  { name: "Rina Wijaya", subject: "Izin Komersial", time: "5 jam lalu", status: "Selesai" },
  { name: "Deni Hermawan", subject: "Pendirian PT", time: "Kemarin", status: "Diproses" },
];

const topPages = [
  { page: "Beranda", views: 892, percent: 90 },
  { page: "Layanan — Pendirian PT", views: 412, percent: 42 },
  { page: "Blog — NIB Online", views: 318, percent: 32 },
  { page: "Kontak", views: 245, percent: 25 },
  { page: "Tentang Kami", views: 198, percent: 20 },
];

const statusColor: Record<string, string> = {
  Baru: "bg-primary/10 text-primary",
  Diproses: "bg-amber-100 text-amber-700",
  Selesai: "bg-gray-100 text-gray-600",
};

/* ─── Halaman Dashboard ─── */
export default function DashboardPage() {
  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Selamat datang kembali, Super Admin!" />

      <div className="p-6 lg:p-8 space-y-6">

        {/* ─── Kartu Statistik ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatsCard key={s.title} stat={s} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">

          {/* ─── Inquiry Terbaru ─── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-sm text-gray-900">Inquiry Terbaru</h2>
              <Link href="/admin/inquiry" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentInquiries.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                    {item.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.subject}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[item.status]}`}>
                      {item.status}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={9} />
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Halaman Terpopuler ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-sm text-gray-900">Halaman Terpopuler</h2>
              <TrendingUp size={14} className="text-primary" />
            </div>
            <div className="p-4 space-y-4">
              {topPages.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 truncate max-w-[140px]">{p.page}</span>
                    <span className="text-xs font-semibold text-gray-500">{p.views.toLocaleString("id-ID")}</span>
                  </div>
                  <Progress value={p.percent} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Shortcut Aksi Cepat ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-sm text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Tulis Artikel Baru", href: "/admin/blog/baru", emoji: "✍️" },
              { label: "Upload Media", href: "/admin/media", emoji: "📎" },
              { label: "Tambah Layanan", href: "/admin/layanan/baru", emoji: "⚡" },
              { label: "Lihat Inquiry", href: "/admin/inquiry", emoji: "📩" },
              { label: "Edit Pengaturan", href: "/admin/settings", emoji: "⚙️" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <span>{a.emoji}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
