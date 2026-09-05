import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { canAccessAdminRoute } from "@/lib/permissions";
import DashboardPageClient from "./DashboardPageClient";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function monthRange(monthsAgo: number, from = new Date()) {
  const start = new Date(from.getFullYear(), from.getMonth() - monthsAgo, 1);
  const end = new Date(from.getFullYear(), from.getMonth() - monthsAgo + 1, 1);
  return { start, end, label: MONTHS_SHORT[start.getMonth()] };
}

/* ─── Halaman Dashboard Admin ───
 * Server Component: cek role vs panel, lalu fetch SEMUA data dashboard asli
 * dari Prisma — role menentukan modul apa yang boleh dilihat (mengikuti
 * ADMIN_ROUTE_ROLES di permissions.ts), tidak ada data dummy. */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const { session, role } = await requirePanelAccess(panel, "/dashboard");

  const canTransaksi = canAccessAdminRoute(role, "/transaksi/daftar");
  const canUsers = canAccessAdminRoute(role, "/users");
  const isAuthor = role === "AUTHOR";
  const authorScope = isAuthor ? { authorId: session.user.id } : {};

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    transactionStats,
    overdueCount,
    transactionMonthlyTrend,
    recentActivity,
  ] = await Promise.all([
    canTransaksi
      ? (async () => {
          const [total, active, completed, pending, cancelled, monthlyTransactions, completedWithDates] =
            await Promise.all([
              prisma.serviceTransaction.count({ where: { deletedAt: null } }),
              prisma.serviceTransaction.count({ where: { deletedAt: null, status: { in: ["PAID", "PROCESSING", "ON_HOLD", "REVISION"] } } }),
              prisma.serviceTransaction.count({ where: { deletedAt: null, status: "COMPLETED" } }),
              prisma.serviceTransaction.count({ where: { deletedAt: null, status: { in: ["DRAFT", "WAITING_PAYMENT"] } } }),
              prisma.serviceTransaction.count({ where: { deletedAt: null, status: "CANCELLED" } }),
              prisma.serviceTransaction.count({ where: { deletedAt: null, createdAt: { gte: monthStart } } }),
              prisma.serviceTransaction.findMany({
                where: { deletedAt: null, status: "COMPLETED", completionDate: { not: null } },
                select: { createdAt: true, completionDate: true },
              }),
            ]);
          const avgCompletionDays =
            completedWithDates.length > 0
              ? Math.round(
                  completedWithDates.reduce((sum, t) => sum + (t.completionDate!.getTime() - t.createdAt.getTime()) / 86400000, 0) /
                    completedWithDates.length,
                )
              : null;
          return { total, active, completed, pending, cancelled, monthlyTransactions, avgCompletionDays };
        })()
      : null,
    canTransaksi
      ? prisma.serviceTransaction.count({
          where: {
            deletedAt: null,
            estimatedCompletionDate: { lt: now },
            status: { notIn: ["COMPLETED", "CANCELLED"] },
          },
        })
      : 0,
    canTransaksi
      ? Promise.all(
          Array.from({ length: 6 }, (_, i) => 5 - i).map(async (monthsAgo) => {
            const { start, end, label } = monthRange(monthsAgo);
            const count = await prisma.serviceTransaction.count({
              where: { deletedAt: null, createdAt: { gte: start, lt: end } },
            });
            return { label, value: count };
          }),
        )
      : [],
    canTransaksi
      ? prisma.transactionActivityLog.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            transaction: { select: { code: true, customerName: true } },
            user: { select: { name: true } },
          },
        })
      : [],
  ]);

  const [
    blogPublishedThisMonth, blogPublishedLastMonth, blogTotalPublished,
    articleViewsThisMonth, articleViewsLastMonth, articleViewsTrend,
    pendingComments, recentPosts,
  ] = await Promise.all([
    prisma.blogPost.count({ where: { deletedAt: null, status: "PUBLISHED", publishedAt: { gte: monthStart }, ...authorScope } }),
    prisma.blogPost.count({ where: { deletedAt: null, status: "PUBLISHED", publishedAt: { gte: lastMonthStart, lt: monthStart }, ...authorScope } }),
    prisma.blogPost.count({ where: { deletedAt: null, status: "PUBLISHED", ...authorScope } }),
    prisma.articleView.count({ where: { createdAt: { gte: monthStart }, post: { deletedAt: null, ...authorScope } } }),
    prisma.articleView.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart }, post: { deletedAt: null, ...authorScope } } }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => 5 - i).map(async (monthsAgo) => {
        const { start, end, label } = monthRange(monthsAgo);
        const count = await prisma.articleView.count({
          where: { createdAt: { gte: start, lt: end }, post: { deletedAt: null, ...authorScope } },
        });
        return { label, value: count };
      }),
    ),
    prisma.comment.count({ where: { status: "PENDING", post: { deletedAt: null, ...authorScope } } }),
    isAuthor
      ? prisma.blogPost.findMany({
          where: { deletedAt: null, authorId: session.user.id },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, status: true, views: true, createdAt: true, publishedAt: true },
        })
      : [],
  ]);

  const [totalActiveUsers, totalInactiveUsers, usersByRole] = await Promise.all([
    canUsers ? prisma.user.count({ where: { deletedAt: null, isActive: true } }) : 0,
    canUsers ? prisma.user.count({ where: { deletedAt: null, isActive: false } }) : 0,
    canUsers ? prisma.user.groupBy({ by: ["role"], where: { deletedAt: null }, _count: { _all: true } }) : [],
  ]);

  return (
    <DashboardPageClient
      panel={panel}
      role={role}
      userName={session.user.name}
      canTransaksi={canTransaksi}
      canUsers={canUsers}
      isAuthor={isAuthor}
      transactionStats={transactionStats}
      overdueCount={overdueCount}
      transactionMonthlyTrend={transactionMonthlyTrend}
      recentActivity={recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        description: a.description,
        userName: a.user?.name ?? "Sistem",
        transactionCode: a.transaction.code,
        customerName: a.transaction.customerName,
        createdAt: a.createdAt.toISOString(),
      }))}
      blogStats={{
        publishedThisMonth: blogPublishedThisMonth,
        publishedLastMonth: blogPublishedLastMonth,
        totalPublished: blogTotalPublished,
      }}
      articleViewsStats={{ thisMonth: articleViewsThisMonth, lastMonth: articleViewsLastMonth }}
      articleViewsTrend={articleViewsTrend}
      pendingComments={pendingComments}
      recentPosts={recentPosts.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        views: p.views,
        createdAt: p.createdAt.toISOString(),
      }))}
      userStats={{
        active: totalActiveUsers,
        inactive: totalInactiveUsers,
        byRole: usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
      }}
    />
  );
}
