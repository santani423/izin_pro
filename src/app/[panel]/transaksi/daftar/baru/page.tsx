import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import TransactionFormPageClient from "./TransactionFormPageClient";

/* ─── Halaman Transaksi Baru ─── */
export default async function AdminNewTransactionPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/transaksi/daftar");

  const [services, staff] = await Promise.all([
    prisma.service.findMany({
      where: { deletedAt: null, isActive: true },
      select: {
        id: true,
        title: true,
        basePrice: true,
        estimatedDurationLabel: true,
        packages: { where: { isActive: true }, select: { id: true, name: true, price: true, estimatedDurationLabel: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const servicesForClient = services.map((s) => ({
    ...s,
    basePrice: s.basePrice ? s.basePrice.toNumber() : null,
    packages: s.packages.map((p) => ({ ...p, price: p.price.toNumber() })),
  }));

  return <TransactionFormPageClient services={servicesForClient} staff={staff} panel={panel} />;
}
