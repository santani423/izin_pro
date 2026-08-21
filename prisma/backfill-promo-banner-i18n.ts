/* ─── Backfill satu-kali: isi eyebrow/titleEn/titleZh/dll & variant/sortOrder
 * PromoBanner utk instalasi yang sudah ke-seed sebelum kolom-kolom itu ada
 * (migration 20260821114419_promo_banner_localized_variant cuma nge-rename
 * title->eyebrow & subtitle->title apa adanya, belum ngisi EN/ZH/variant).
 * Jalankan manual:
 *   npx tsx prisma/backfill-promo-banner-i18n.ts
 * Idempoten (overwrite aman — sumbernya konstan, bukan hasil edit admin).
 * Sumber terjemahan: prisma/promo-banner-i18n.ts (dipakai bareng
 * prisma/seed.ts biar konten fresh-install & backfill DB lama konsisten). */
import { prisma } from "../src/lib/db";
import { PROMO_BANNER_I18N } from "./promo-banner-i18n";

async function main() {
  const rows = await prisma.promoBanner.findMany();
  for (const row of rows) {
    const t = row.tag ? PROMO_BANNER_I18N[row.tag] : undefined;
    if (!t) {
      console.warn("[skip] banner tanpa terjemahan cocok (tag):", row.tag ?? row.id);
      continue;
    }
    await prisma.promoBanner.update({
      where: { id: row.id },
      data: {
        eyebrow: t.id.eyebrow,
        eyebrowEn: t.en.eyebrow,
        eyebrowZh: t.zh.eyebrow,
        title: t.id.title,
        titleEn: t.en.title,
        titleZh: t.zh.title,
        description: t.id.description,
        descriptionEn: t.en.description,
        descriptionZh: t.zh.description,
        ctaLabel: t.id.ctaLabel,
        ctaLabelEn: t.en.ctaLabel,
        ctaLabelZh: t.zh.ctaLabel,
        variant: t.variant,
        sortOrder: t.sortOrder,
      },
    });
    console.log(`[ok] ${row.tag} -> ${t.id.eyebrow} / ${t.id.title} (${t.variant})`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
