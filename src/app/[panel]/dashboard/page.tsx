import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import DashboardPageClient from "./DashboardPageClient";

/* ─── Halaman Dashboard Admin ───
 * Server Component: cek role vs panel, fetch ringkasan modul Transaksi asli
 * dari Prisma (digabung dari dashboard /transaksi yg lama — lihat komentar
 * di DashboardPageClient), sisanya (pengunjung/inquiry/traffic) masih mock
 * React state, belum tersambung Prisma. */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/dashboard");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    total, active, completed, pending, cancelled,
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

  return (
    <DashboardPageClient
      panel={panel}
      transactionStats={{
        total, active, completed, pending, cancelled,
        monthlyTransactions, monthlyRevenue, avgCompletionDays,
      }}
    />
  );
}
