import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import BerandaPageClient from "./BerandaPageClient";

/* ─── Halaman Hero Beranda (admin) ───
 * Server Component: cek akses (AUTHOR gak boleh) lalu baca HeroContent
 * (singleton id "1", selalu ada dari seed/migration) buat form awal. */
export default async function AdminBerandaPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/beranda");

  const hero = await prisma.heroContent.findUniqueOrThrow({ where: { id: "1" } });

  return (
    <BerandaPageClient
      titleLine1={hero.titleLine1}
      titleHighlight={hero.titleHighlight}
      titleLine3={hero.titleLine3}
      subtitle={hero.subtitle}
      highlights={hero.highlights as { title: string; subtitle: string }[]}
      ctaPrimaryLabel={hero.ctaPrimaryLabel}
      ctaSecondaryLabel={hero.ctaSecondaryLabel}
      ctaSecondaryHref={hero.ctaSecondaryHref}
      heroImageUrl={hero.heroImageUrl}
    />
  );
}
