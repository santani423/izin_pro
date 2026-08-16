/* ─── Backfill satu-kali: isi EN/ZH ServiceCategory.name/description,
 * Service.title/description/features, & ServicePackage.name/features utk
 * instalasi yang sudah ke-seed sebelum kolom EN/ZH ada. Jalankan manual:
 *   npx tsx prisma/backfill-layanan-catalog-i18n.ts
 * Idempoten (overwrite aman — sumbernya konstan, bukan hasil edit admin).
 * Sumber terjemahan: prisma/service-catalog-i18n.ts (dipakai bareng
 * prisma/seed.ts biar konten fresh-install & backfill DB lama konsisten). */
import { prisma } from "../src/lib/db";
import { CATALOG_CATEGORY_I18N, CATALOG_SERVICE_I18N } from "./service-catalog-i18n";

async function main() {
  console.log("=== ServiceCategory ===");
  const cats = await prisma.serviceCategory.findMany();
  for (const c of cats) {
    const t = CATALOG_CATEGORY_I18N[c.name];
    if (!t) {
      console.warn("[skip] kategori tanpa terjemahan:", c.name);
      continue;
    }
    await prisma.serviceCategory.update({
      where: { id: c.id },
      data: {
        nameEn: t.name.en,
        nameZh: t.name.zh,
        descriptionEn: t.description?.en ?? null,
        descriptionZh: t.description?.zh ?? null,
      },
    });
    console.log(`[ok] ${c.name} -> ${t.name.en} / ${t.name.zh}`);
  }

  console.log("=== Service + ServicePackage ===");
  const services = await prisma.service.findMany({ include: { packages: { orderBy: { sortOrder: "asc" } } } });
  for (const s of services) {
    const t = CATALOG_SERVICE_I18N[s.slug];
    if (!t) {
      console.warn("[skip] layanan tanpa terjemahan:", s.slug);
      continue;
    }
    await prisma.service.update({
      where: { id: s.id },
      data: {
        titleEn: t.title.en,
        titleZh: t.title.zh,
        descriptionEn: t.description.en,
        descriptionZh: t.description.zh,
        featuresEn: t.features.map((f) => f.en),
        featuresZh: t.features.map((f) => f.zh),
      },
    });
    console.log(`[ok] service ${s.slug} -> ${t.title.en}`);

    for (let i = 0; i < s.packages.length; i++) {
      const pkg = s.packages[i];
      const pt = t.packages[i];
      if (!pt) continue;
      await prisma.servicePackage.update({
        where: { id: pkg.id },
        data: {
          nameEn: pt.name.en,
          nameZh: pt.name.zh,
          featuresEn: pt.features.map((f) => f.en),
          featuresZh: pt.features.map((f) => f.zh),
        },
      });
      console.log(`  [ok] package ${pkg.name} -> ${pt.name.en}`);
    }
  }

  console.log("Selesai.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
