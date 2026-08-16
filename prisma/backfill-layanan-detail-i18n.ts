/* ─── Backfill satu-kali: isi Service.detailContentEn/Zh + metaTitleEn/Zh +
 * metaDescriptionEn/Zh utk instalasi yang sudah ke-seed sebelum kolom EN/ZH
 * ada. Jalankan manual:
 *   npx tsx prisma/backfill-layanan-detail-i18n.ts [--force]
 * Idempoten (skip service yg detailContentEn-nya udah keisi) kecuali --force.
 * Sumber terjemahan: prisma/service-detail-i18n-content.ts (dipakai bareng
 * prisma/seed.ts biar konten fresh-install & backfill DB lama konsisten). */
import { prisma } from "../src/lib/db";
import { getDetailContentLang } from "./service-detail-i18n-content";
import type { ServiceDetailContent } from "../src/lib/types/service-detail-content";

async function main() {
  const force = process.argv.includes("--force");
  const services = await prisma.service.findMany({ where: { deletedAt: null } });
  console.log(`Ditemukan ${services.length} Service di DB.`);

  for (const service of services) {
    if (service.detailContentEn && service.detailContentZh && !force) {
      console.log(`[skip] ${service.slug} — detailContentEn/Zh udah keisi.`);
      continue;
    }
    const base = service.detailContent as ServiceDetailContent | null;
    if (!base) {
      console.log(`[skip] ${service.slug} — detailContent (ID) masih kosong, isi dulu lewat admin.`);
      continue;
    }

    const titleEn = service.titleEn?.trim() || service.title;
    const titleZh = service.titleZh?.trim() || service.title;
    const checklistEn = (service.featuresEn as string[] | null) ?? (service.features as string[]);
    const checklistZh = (service.featuresZh as string[] | null) ?? (service.features as string[]);

    const en = getDetailContentLang(service.slug, "en", titleEn, checklistEn);
    const zh = getDetailContentLang(service.slug, "zh", titleZh, checklistZh);

    // metaTitle/metaDescription — pola sama kayak seed.ts (`${title} — ${tagline}`
    // / heroDescription), dibangun dari konten EN/ZH yang baru dihitung di atas.
    const taglineEn = en.tagline ?? base.tagline;
    const taglineZh = zh.tagline ?? base.tagline;
    const heroDescEn = en.heroDescription ?? service.descriptionEn ?? base.heroDescription;
    const heroDescZh = zh.heroDescription ?? service.descriptionZh ?? base.heroDescription;

    await prisma.service.update({
      where: { id: service.id },
      data: {
        detailContentEn: en as object,
        detailContentZh: zh as object,
        metaTitleEn: `${titleEn} — ${taglineEn}`,
        metaTitleZh: `${titleZh} — ${taglineZh}`,
        metaDescriptionEn: heroDescEn,
        metaDescriptionZh: heroDescZh,
      },
    });
    console.log(`[ok] ${service.slug} -> "${titleEn}"`);
  }

  console.log("Selesai.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
