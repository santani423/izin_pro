import {
  Receipt, Activity, CheckCircle2, Clock, XCircle, Wallet, ShoppingCart, Timer,
} from "lucide-react";
import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

/* ─── Dashboard Modul Transaksi — kartu ringkasan saja (chart & laporan
 * ditunda ke sesi lanjutan, lihat plan Phase 1). Server Component murni,
 * gak ada interaksi client. ─── */
export default async function AdminTransaksiDashboardPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/transaksi");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    total, processing, completed, pending, cancelled,
    monthlyTransactions, monthlyPayments, completedWithDates,
  ] = await Promise.all([
    prisma.serviceTransaction.count({ where: { deletedAt: null } }),
    prisma.serviceTransaction.count({ where: { deletedAt: null, status: { in: ["PAID", "PROCESSING", "ON_HOLD", "REVISION"] } } }),
    prisma.serviceTransaction.count({ where: { deletedAt: null, status: "COMPLETED" } }),
    prisma.serviceTransaction.count({ where: { deletedAt: null, status: { in: ["DRAFT", "WAITING_PAYMENT"] } } }),
    prisma.serviceTransaction.count({ where: { deletedAt: null, status: "CANCELLED" } }),
    prisma.serviceTransaction.count({ where: { deletedAt: null, createdAt: { gte: monthStart } } }),
    prisma.payment.findMany({ where: { paidAt: { gte: monthStart } }, select: { amount: true } }),
    prisma.serviceTransaction.findMany({
      where: { deletedAt: null, status: "COMPLETED", completionDate: { not: null } },
      select: { createdAt: true, completionDate: true },
    }),
  ]);

  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
  const avgCompletionDays =
    completedWithDates.length > 0
      ? Math.round(
          completedWithDates.reduce((sum, t) => sum + (t.completionDate!.getTime() - t.createdAt.getTime()) / 86400000, 0) /
            completedWithDates.length,
        )
      : null;

  const cards = [
    { label: "Total Transaksi", value: total.toLocaleString("id-ID"), icon: Receipt, color: "#5ba12b", bg: "#f3fae8" },
    { label: "Transaksi Aktif", value: processing.toLocaleString("id-ID"), icon: Activity, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Selesai", value: completed.toLocaleString("id-ID"), icon: CheckCircle2, color: "#059669", bg: "#ecfdf5" },
    { label: "Menunggu", value: pending.toLocaleString("id-ID"), icon: Clock, color: "#d97706", bg: "#fffbeb" },
    { label: "Dibatalkan", value: cancelled.toLocaleString("id-ID"), icon: XCircle, color: "#dc2626", bg: "#fef2f2" },
    { label: "Pendapatan Bulan Ini", value: `Rp${monthlyRevenue.toLocaleString("id-ID")}`, icon: Wallet, color: "#5ba12b", bg: "#f3fae8" },
    { label: "Order Bulan Ini", value: monthlyTransactions.toLocaleString("id-ID"), icon: ShoppingCart, color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Rata-rata Waktu Selesai", value: avgCompletionDays != null ? `${avgCompletionDays} hari` : "-", icon: Timer, color: "#0891b2", bg: "#ecfeff" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-admin-line p-5">
              <div className="mb-4 p-2 rounded-xl w-fit" style={{ backgroundColor: c.bg }}>
                <Icon size={18} style={{ color: c.color }} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{c.value}</div>
              <div className="mt-0.5 text-xs text-gray-500">{c.label}</div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">
        Grafik & laporan detail modul Transaksi menyusul di pembaruan berikutnya.
      </p>
    </div>
  );
}
