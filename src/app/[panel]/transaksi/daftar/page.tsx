import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import ServiceTransactionsManager from "./ServiceTransactionsManager";

/* ─── Halaman Daftar Transaksi Admin (list) ─── */
export default async function AdminServiceTransactionsPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/transaksi/daftar");

  const transactions = await prisma.serviceTransaction.findMany({
    where: { deletedAt: null },
    include: {
      service: { select: { id: true, title: true } },
      package: { select: { id: true, name: true } },
      assignedStaff: { select: { id: true, name: true } },
      _count: { select: { workflowSteps: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Prisma Decimal bukan plain object — konversi ke number dulu spy bisa
  // lolos batas Server -> Client Component (sama pola dgn PromoPageClient).
  const transactionsForClient = transactions.map((t) => ({
    ...t,
    totalPrice: t.totalPrice.toNumber(),
    discount: t.discount.toNumber(),
    tax: t.tax.toNumber(),
    grandTotal: t.grandTotal.toNumber(),
  }));

  return <ServiceTransactionsManager initialTransactions={transactionsForClient} panel={panel} />;
}
