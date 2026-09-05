"use client";

import {
  Receipt, Activity, CheckCircle2, XCircle, ShoppingCart, Timer, Clock,
  Eye, FileText, MessageCircle, UserCog,
  PlusCircle, PenSquare, ArrowRight, RefreshCw, Workflow, Paperclip, Send,
  CalendarClock, UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@prisma/client";
import MetricCard from "@/components/admin/MetricCard";
import BarTrendChart, { type TrendPoint } from "@/components/admin/BarTrendChart";
import Link from "next/link";

export interface TransactionStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
  cancelled: number;
  monthlyTransactions: number;
  avgCompletionDays: number | null;
}

interface RecentActivityItem {
  id: string;
  action: string;
  description: string | null;
  userName: string;
  transactionCode: string;
  customerName: string;
  createdAt: string;
}

interface RecentPostItem {
  id: string;
  title: string;
  status: string;
  views: number;
  createdAt: string;
}

interface DashboardPageClientProps {
  panel: string;
  role: Role;
  userName: string;
  canTransaksi: boolean;
  canUsers: boolean;
  isAuthor: boolean;
  transactionStats: TransactionStats | null;
  overdueCount: number;
  transactionMonthlyTrend: TrendPoint[];
  recentActivity: RecentActivityItem[];
  blogStats: { publishedThisMonth: number; publishedLastMonth: number; totalPublished: number };
  articleViewsStats: { thisMonth: number; lastMonth: number };
  articleViewsTrend: TrendPoint[];
  pendingComments: number;
  recentPosts: RecentPostItem[];
  userStats: { active: number; inactive: number; byRole: { role: string; count: number }[] };
}

/* ─── Helper: hitung tren % real dari dua periode, undefined kalau memang
 * gak ada dasar perbandingan (jangan pernah karang angka) ─── */
function trend(curr: number, prev: number): { change: string; changeType: "up" | "down" | "neutral" } | undefined {
  if (prev === 0 && curr === 0) return undefined;
  if (prev === 0) return { change: "Baru", changeType: "up" };
  const diff = ((curr - prev) / prev) * 100;
  if (Math.abs(diff) < 1) return { change: "0%", changeType: "neutral" };
  return { change: `${diff > 0 ? "+" : ""}${Math.round(diff)}%`, changeType: diff > 0 ? "up" : "down" };
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Kemarin";
  if (day < 7) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const BLOG_STATUS_LABEL: Record<string, string> = { DRAFT: "Draft", PUBLISHED: "Published", SCHEDULED: "Terjadwal" };
const BLOG_STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500",
  PUBLISHED: "bg-emerald-50 text-emerald-600",
  SCHEDULED: "bg-amber-50 text-amber-600",
};

const ACTIVITY_LABEL: Record<string, { label: string; icon: LucideIcon }> = {
  CREATED: { label: "Transaksi baru dibuat", icon: PlusCircle },
  STATUS_CHANGED: { label: "Status transaksi diubah", icon: RefreshCw },
  WORKFLOW_STEP_UPDATED: { label: "Progress workflow diperbarui", icon: Workflow },
  ATTACHMENT_UPLOADED: { label: "Lampiran diunggah", icon: Paperclip },
  WHATSAPP_SENT: { label: "Notifikasi WhatsApp dikirim", icon: Send },
};

interface AlertItem {
  icon: LucideIcon;
  label: string;
  description: string;
  count: number;
  href: string;
  color: string;
  bg: string;
}

export default function DashboardPageClient({
  panel,
  userName,
  canTransaksi,
  canUsers,
  isAuthor,
  transactionStats,
  overdueCount,
  transactionMonthlyTrend,
  recentActivity,
  blogStats,
  articleViewsStats,
  articleViewsTrend,
  pendingComments,
  recentPosts,
  userStats,
}: DashboardPageClientProps) {
  const firstName = userName?.split(" ")[0] || "";

  /* ─── Alert: hanya tampil kalau memang ada data yang butuh perhatian ─── */
  const alerts: AlertItem[] = [];
  if (canTransaksi && overdueCount > 0) {
    alerts.push({
      icon: CalendarClock,
      label: "Transaksi Terlambat",
      description: `${overdueCount} transaksi melewati estimasi selesai`,
      count: overdueCount,
      href: `/${panel}/transaksi/daftar`,
      color: "#d97706",
      bg: "#fffbeb",
    });
  }
  if (pendingComments > 0) {
    alerts.push({
      icon: MessageCircle,
      label: "Komentar Menunggu Moderasi",
      description: `${pendingComments} komentar belum ditinjau`,
      count: pendingComments,
      href: `/${panel}/komentar`,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    });
  }

  const transactionCards = transactionStats
    ? [
        { label: "Total Transaksi", value: transactionStats.total.toLocaleString("id-ID"), icon: Receipt, color: "#5ba12b", bg: "#f3fae8" },
        { label: "Transaksi Aktif", value: transactionStats.active.toLocaleString("id-ID"), icon: Activity, color: "#3b82f6", bg: "#eff6ff" },
        { label: "Selesai", value: transactionStats.completed.toLocaleString("id-ID"), icon: CheckCircle2, color: "#059669", bg: "#ecfdf5" },
        { label: "Menunggu", value: transactionStats.pending.toLocaleString("id-ID"), icon: Clock, color: "#d97706", bg: "#fffbeb" },
        { label: "Dibatalkan", value: transactionStats.cancelled.toLocaleString("id-ID"), icon: XCircle, color: "#dc2626", bg: "#fef2f2" },
        { label: "Order Bulan Ini", value: transactionStats.monthlyTransactions.toLocaleString("id-ID"), icon: ShoppingCart, color: "#8b5cf6", bg: "#f5f3ff" },
        { label: "Rata-rata Waktu Selesai", value: transactionStats.avgCompletionDays != null ? `${transactionStats.avgCompletionDays} hari` : "-", icon: Timer, color: "#0891b2", bg: "#ecfeff" },
      ]
    : [];

  const articleViewsTrendData = trend(articleViewsStats.thisMonth, articleViewsStats.lastMonth);
  const blogTrendData = trend(blogStats.publishedThisMonth, blogStats.publishedLastMonth);

  const quickActions: { label: string; href: string; icon: LucideIcon }[] = [
    ...(canTransaksi ? [{ label: "Transaksi Baru", href: `/${panel}/transaksi/daftar/baru`, icon: PlusCircle }] : []),
    { label: "Tulis Artikel", href: `/${panel}/blog/new`, icon: PenSquare },
    { label: "Moderasi Komentar", href: `/${panel}/komentar`, icon: MessageCircle },
    ...(canUsers ? [{ label: "Tambah Pengguna", href: `/${panel}/users`, icon: UserPlus }] : []),
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ─── Sapaan ─── */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">Halo, {firstName || "Admin"} 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">Berikut ringkasan kondisi aplikasi hari ini.</p>
      </div>

      {/* ─── Alerts / Attention Required ─── */}
      <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
        <h2 className="font-bold text-base text-gray-900">Perlu Perhatian</h2>
        {alerts.length === 0 ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700">Semua dalam kondisi baik, tidak ada yang butuh perhatian saat ini.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {alerts.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-start gap-3 rounded-xl border border-admin-line p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: a.bg }}>
                    <Icon size={16} style={{ color: a.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{a.label}</div>
                    <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Ringkasan Transaksi (real) — hanya utk role dgn akses modul Transaksi ─── */}
      {canTransaksi && transactionStats && (
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
      )}

      {/* ─── KPI konten — role-aware ─── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {canUsers && (
          <MetricCard
            label="Pengguna Aktif"
            value={userStats.active.toLocaleString("id-ID")}
            {...(userStats.inactive > 0 ? { change: `${userStats.inactive} nonaktif`, changeType: "neutral" as const } : {})}
            icon={UserCog}
          />
        )}
        <MetricCard
          label={isAuthor ? "Artikel Saya Published" : "Artikel Published Bulan Ini"}
          value={(isAuthor ? blogStats.totalPublished : blogStats.publishedThisMonth).toLocaleString("id-ID")}
          {...(!isAuthor && blogTrendData ? blogTrendData : {})}
          icon={FileText}
        />
        <MetricCard
          label={isAuthor ? "Views Artikel Saya Bulan Ini" : "Views Artikel Bulan Ini"}
          value={articleViewsStats.thisMonth.toLocaleString("id-ID")}
          {...(articleViewsTrendData ?? {})}
          icon={Eye}
        />
        <MetricCard
          label="Komentar Menunggu Moderasi"
          value={pendingComments.toLocaleString("id-ID")}
          icon={MessageCircle}
        />
      </div>

      {/* ─── Chart tren real ─── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {canTransaksi && (
          <div className={isAuthor ? "hidden" : "lg:col-span-6"}>
            <BarTrendChart
              title="Transaksi per Bulan"
              subtitle="6 bulan terakhir"
              data={transactionMonthlyTrend}
              valueLabel="Transaksi"
            />
          </div>
        )}
        <div className={canTransaksi ? "lg:col-span-6" : "lg:col-span-12"}>
          <BarTrendChart
            title={isAuthor ? "Kunjungan Artikel Saya per Bulan" : "Kunjungan Artikel per Bulan"}
            subtitle="6 bulan terakhir"
            data={articleViewsTrend}
            valueLabel="Views"
          />
        </div>
      </div>

      {/* ─── Aktivitas Terbaru ─── */}
      {canTransaksi && (
        <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
          <h2 className="font-bold text-base text-gray-900">Aktivitas Terbaru</h2>
          <p className="text-sm text-gray-400 mt-0.5">Aktivitas terakhir pada modul Transaksi Layanan</p>
          {recentActivity.length === 0 ? (
            <p className="mt-5 text-sm text-gray-400">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="mt-4 space-y-1 max-h-[320px] overflow-y-auto">
              {recentActivity.map((a) => {
                const meta = ACTIVITY_LABEL[a.action] ?? { label: a.action, icon: Activity };
                const Icon = meta.icon;
                return (
                  <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="p-1.5 rounded-lg bg-gray-100 flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{a.userName}</span> — {meta.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {a.transactionCode} · {a.customerName} · {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Artikel Terbaru Saya (khusus AUTHOR, gak punya akses Transaksi) ─── */}
      {isAuthor && (
        <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-base text-gray-900">Artikel Terbaru Saya</h2>
            <Link
              href={`/${panel}/blog`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Lihat Semua
              <ArrowRight size={13} />
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className="mt-5 text-sm text-gray-400">Anda belum menulis artikel apa pun.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-y border-admin-line">
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400">Judul</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400">Views</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400">Dibuat</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentPosts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-4 font-medium text-gray-900 max-w-[280px] truncate">{p.title}</td>
                      <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">{p.views.toLocaleString("id-ID")}</td>
                      <td className="py-3.5 pr-4 text-gray-400 whitespace-nowrap">{timeAgo(p.createdAt)}</td>
                      <td className="py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${BLOG_STATUS_COLOR[p.status]}`}>
                          {BLOG_STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Quick Actions ─── */}
      <div className="bg-white rounded-2xl border border-admin-line p-5 sm:p-6">
        <h2 className="font-bold text-base text-gray-900">Aksi Cepat</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-admin-line p-4 text-center hover:border-primary/30 hover:bg-primary/[0.03] transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Icon size={18} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-gray-700">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
