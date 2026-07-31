import { notFound } from "next/navigation";
import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import TransactionDetailClient from "./TransactionDetailClient";

/* ─── Halaman Detail Transaksi Admin ─── */
export default async function AdminTransactionDetailPage({
  params,
}: {
  params: Promise<{ panel: string; id: string }>;
}) {
  const { panel, id } = await params;
  await requirePanelAccess(panel, "/transaksi/daftar");

  const [transaction, services, staff] = await Promise.all([
    prisma.serviceTransaction.findFirst({
      where: { id, deletedAt: null },
      include: {
        service: { select: { id: true, title: true, estimatedDurationLabel: true } },
        package: { select: { id: true, name: true, price: true } },
        assignedStaff: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
        workflowSteps: { orderBy: { order: "asc" } },
        payments: { orderBy: { paidAt: "desc" } },
        attachments: { orderBy: { createdAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
        activityLogs: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
      },
    }),
    prisma.service.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, title: true, packages: { where: { isActive: true }, select: { id: true, name: true, price: true } } },
      orderBy: { title: "asc" },
    }),
    prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!transaction) notFound();

  // Prisma Decimal bukan plain object — konversi ke number dulu spy bisa
  // lolos batas Server -> Client Component.
  const transactionForClient = {
    ...transaction,
    totalPrice: transaction.totalPrice.toNumber(),
    discount: transaction.discount.toNumber(),
    tax: transaction.tax.toNumber(),
    grandTotal: transaction.grandTotal.toNumber(),
    package: transaction.package ? { ...transaction.package, price: transaction.package.price.toNumber() } : null,
    payments: transaction.payments.map((p) => ({ ...p, amount: p.amount.toNumber() })),
  };
  const packagesByService = Object.fromEntries(
    services.map((s) => [s.id, s.packages.map((p) => ({ ...p, price: p.price.toNumber() }))]),
  );

  return (
    <TransactionDetailClient
      transaction={transactionForClient}
      packagesByService={packagesByService}
      staff={staff}
      panel={panel}
    />
  );
}
