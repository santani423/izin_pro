import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import PromoPageClient from "./PromoPageClient";

/* ─── Halaman Kelola Konten Promo (admin) ───
 * Server Component: cek akses (AUTHOR gak boleh) lalu baca PromoPageContent
 * (singleton id "1"), daftar PromoPackage (kartu paket) & Service (buat link
 * paket ke halaman detail layanan), serahkan ke PromoPageClient (client). */
export default async function AdminPromoPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/promo");

  const [content, rawPackages, services, banners] = await Promise.all([
    prisma.promoPageContent.findUniqueOrThrow({ where: { id: "1" } }),
    prisma.promoPackage.findMany({
      include: { service: { select: { id: true, title: true, slug: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.service.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    }),
    prisma.promoBanner.findMany({
      where: { deletedAt: null },
      include: { image: { select: { url: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Prisma Decimal bukan plain object — gak bisa lolos batas Server -> Client
  // Component, harus dikonversi ke number dulu di sini (sama pola dgn
  // [id]/edit/page.tsx utk ServicePackage).
  const packages = rawPackages.map((pkg) => ({
    ...pkg,
    price: pkg.price.toNumber(),
    originalPrice: pkg.originalPrice ? pkg.originalPrice.toNumber() : null,
  }));

  return (
    <PromoPageClient
      content={content}
      packages={packages}
      services={services}
      banners={banners}
      panel={panel}
    />
  );
}
