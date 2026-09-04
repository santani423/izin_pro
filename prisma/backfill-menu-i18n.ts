/* ─── Backfill satu-kali: isi labelEn/labelZh MenuItem (header & footer) utk
 * instalasi yang menunya udah ke-seed sebelum kolom i18n itu ada (migration
 * 20260810214852_add_menu_settings_i18n_fields cuma nambah kolom, gak ngisi
 * data lama). Jalankan manual:
 *   npx tsx prisma/backfill-menu-i18n.ts
 * Idempoten (overwrite aman — sumbernya konstan, bukan hasil edit admin).
 * Match by posisi (sortOrder), bukan href, krn 3 kolom judul footer
 * sama-sama href "#". Urutan harus persis sama dgn urutan create di
 * seed.ts — sumber terjemahan: prisma/menu-i18n.ts (dipakai bareng
 * prisma/seed.ts biar install baru & backfill DB lama konsisten). */
import { prisma } from "../src/lib/db";
import { NAV_LINKS, FOOTER_COLUMNS } from "./menu-i18n";

async function backfillMenu(
  key: string,
  parents: { label: string; labelEn: string; labelZh: string; children?: { label: string; labelEn: string; labelZh: string }[] }[],
) {
  const menu = await prisma.menu.findUnique({
    where: { key },
    include: {
      items: {
        where: { parentId: null, deletedAt: null },
        include: { children: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!menu) {
    console.warn(`[skip] menu "${key}" belum ada — jalankan seed dulu.`);
    return;
  }

  for (let i = 0; i < menu.items.length; i++) {
    const item = menu.items[i];
    const src = parents[i];
    if (!src || src.label !== item.label) {
      console.warn(`[skip] "${key}" item #${i} label DB ("${item.label}") gak cocok sumber ("${src?.label}")`);
      continue;
    }
    await prisma.menuItem.update({
      where: { id: item.id },
      data: { labelEn: src.labelEn, labelZh: src.labelZh },
    });
    console.log(`[ok] ${key} > ${src.label} -> ${src.labelEn} / ${src.labelZh}`);

    const children = item.children;
    const srcChildren = src.children ?? [];
    for (let j = 0; j < children.length; j++) {
      const child = children[j];
      const srcChild = srcChildren[j];
      if (!srcChild || srcChild.label !== child.label) {
        console.warn(
          `[skip] "${key}" item #${i} child #${j} label DB ("${child.label}") gak cocok sumber ("${srcChild?.label}")`,
        );
        continue;
      }
      await prisma.menuItem.update({
        where: { id: child.id },
        data: { labelEn: srcChild.labelEn, labelZh: srcChild.labelZh },
      });
      console.log(`[ok] ${key} > ${src.label} > ${srcChild.label} -> ${srcChild.labelEn} / ${srcChild.labelZh}`);
    }
  }
}

async function main() {
  await backfillMenu("header", NAV_LINKS);
  await backfillMenu(
    "footer",
    FOOTER_COLUMNS.map((col) => ({
      label: col.title,
      labelEn: col.titleEn,
      labelZh: col.titleZh,
      children: col.links,
    })),
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
