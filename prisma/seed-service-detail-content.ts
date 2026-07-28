/* ─── Backfill satu-kali: pindahin konten mock layanan-detail.ts ke DB ───
 * Jalankan manual: npx tsx prisma/seed-service-detail-content.ts [--force]
 * Idempoten (skip service yg detailContent-nya udah keisi) kecuali --force.
 *
 * Sengaja manggil getLayananDetail() (bukan nyalin ulang konten LAYANAN_DETAILS
 * / buildFallbackDetail secara manual) — biar konten yg dipindah ke DB PASTI
 * sama persis dengan yg dirender halaman publik hari ini (sumber kebenaran
 * tunggal), gak ada risiko salah transkripsi ulang.
 */
import { prisma } from "../src/lib/db";
import { getLayananDetail } from "../src/lib/layanan-detail";
import { FAQS } from "../src/lib/constants";
import { toServiceDetailContent, parsePriceToNumber } from "./service-detail-seed-helpers";

async function main() {
  const force = process.argv.includes("--force");
  const services = await prisma.service.findMany({ where: { deletedAt: null } });
  console.log(`Ditemukan ${services.length} Service di DB.`);

  let globalFaqCount = await prisma.faq.count({ where: { scope: "GLOBAL" } });

  for (const service of services) {
    if (service.detailContent && !force) {
      console.log(`[skip] ${service.slug} — detailContent udah keisi.`);
      continue;
    }

    const detail = getLayananDetail(service.slug);
    if (!detail) {
      console.log(`[skip] ${service.slug} — gak ketemu di layanan-detail.ts (aneh, harusnya selalu ada fallback).`);
      continue;
    }

    const detailContent = toServiceDetailContent(detail);

    await prisma.service.update({
      where: { id: service.id },
      data: {
        detailContent: detailContent as object,
        metaTitle: `${detail.title} — ${detail.tagline}`,
        metaDescription: detail.description,
        status: "PUBLISHED",
      },
    });

    // Paket harga -> ServicePackage (idempoten: skip kalau service ini udah punya paket)
    const existingPackages = await prisma.servicePackage.count({ where: { serviceId: service.id } });
    if (existingPackages === 0 && detail.packages) {
      for (const [index, pkg] of detail.packages.items.entries()) {
        await prisma.servicePackage.create({
          data: {
            serviceId: service.id,
            name: pkg.name,
            price: parsePriceToNumber(pkg.price),
            isPopular: pkg.popular ?? false,
            features: pkg.features,
            sortOrder: index,
          },
        });
      }
      console.log(`  + ${detail.packages.items.length} ServicePackage utk ${service.slug}`);
    }

    // FAQ khusus service — cuma utk 3 layanan yg konten aslinya hand-authored
    // (bukan hasil generate fallback), biar gak nyampah 15x FAQ generik yg
    // isinya sama kayak FAQS global.
    const HAND_AUTHORED_SLUGS = ["pendirian-pt", "nib", "izin-usaha"];
    if (HAND_AUTHORED_SLUGS.includes(service.slug)) {
      const existingServiceFaqs = await prisma.faq.count({ where: { serviceId: service.id } });
      if (existingServiceFaqs === 0) {
        for (const [index, faq] of detail.faqs.items.entries()) {
          await prisma.faq.create({
            data: {
              question: faq.question,
              answer: faq.answer,
              scope: "SERVICE",
              serviceId: service.id,
              sortOrder: index,
            },
          });
        }
        console.log(`  + ${detail.faqs.items.length} Faq (SERVICE) utk ${service.slug}`);
      }
    }

    console.log(`[ok] ${service.slug}`);
  }

  // FAQ global — seed FAQS sekali aja (dipakai fallback service tanpa FAQ khusus)
  if (globalFaqCount === 0) {
    for (const [index, faq] of FAQS.entries()) {
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          scope: "GLOBAL",
          sortOrder: index,
        },
      });
    }
    globalFaqCount = FAQS.length;
    console.log(`+ ${FAQS.length} Faq (GLOBAL) di-seed.`);
  } else {
    console.log(`[skip] Faq GLOBAL udah ada (${globalFaqCount}).`);
  }

  console.log("\nBackfill selesai.");
}

main()
  .catch((e) => {
    console.error("BACKFILL FAILED:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
