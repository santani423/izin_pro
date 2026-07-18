import fs from "node:fs";
import path from "node:path";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";

import {
  COMPANY_INFO,
  SERVICES,
  TESTIMONIALS,
  BLOG_POSTS,
  PROMOS,
  FAQS,
  TEAM_MEMBERS,
} from "../src/lib/constants";
/* Sumber logo klien — sebelumnya LANDING_CLIENTS di landing.ts, dipindah ke
 * sini krn ClientsSection.tsx sekarang baca Partner dari Prisma langsung
 * (landing.ts gak butuh data ini lagi). */
const CLIENT_LOGOS = [
  { name: "bank bjb", logo: "/images/clients/bank-bjb.webp" },
  { name: "Alfamart", logo: "/images/clients/alfamart.png" },
  { name: "Telkom Indonesia", logo: "/images/clients/telkom.png" },
  { name: "Trive Invest", logo: "/images/clients/trive-invest.jpg" },
  { name: "JNE Express", logo: "/images/clients/jne.png" },
  { name: "Sinarmas", logo: "/images/clients/sinarmas.jpg" },
  { name: "WIKA", logo: "/images/clients/wika.webp" },
  { name: "Maybank", logo: "/images/clients/maybank.png" },
];

/* Sumber nav header/footer — sebelumnya NAV_LINKS/FOOTER_COLUMNS di
 * landing.ts, dipindah ke sini krn Navbar/Footer sekarang baca Menu dari
 * Prisma langsung (landing.ts gak butuh data ini lagi). */
const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  {
    label: "Layanan",
    href: "/layanan",
    children: [
      { label: "Pendirian PT", href: "/layanan/pendirian-pt" },
      { label: "NIB (Nomor Induk Berusaha)", href: "/layanan/nib" },
      { label: "Izin Usaha", href: "/layanan/izin-usaha" },
      { label: "Izin Komersial & Operasional", href: "/layanan/izin-komersial" },
      { label: "Perizinan Lainnya", href: "/layanan/perizinan-lainnya" },
    ],
  },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Panduan & Artikel", href: "/blog" },
  { label: "Testimoni", href: "/testimoni" },
  { label: "Promo", href: "/promo" },
  { label: "Kontak", href: "/kontak" },
];

const FOOTER_COLUMNS = [
  {
    title: "Layanan Kami",
    links: [
      { label: "Pendirian PT", href: "/layanan/pendirian-pt" },
      { label: "NIB & Berusaha", href: "/layanan/nib" },
      { label: "Izin Usaha", href: "/layanan/izin-usaha" },
      { label: "Izin Komersial & Operasional", href: "/layanan/izin-komersial" },
      { label: "Perizinan Lainnya", href: "/layanan/perizinan-lainnya" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Tentang Kami", href: "/tentang-kami" },
      { label: "Panduan & Artikel", href: "/blog" },
      { label: "Testimoni", href: "/testimoni" },
      { label: "Promo", href: "/promo" },
      { label: "Tracking Perizinan", href: "/tracking" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
      { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
      { label: "Hubungi Kami", href: "/kontak" },
    ],
  },
];
import { LAYANAN_CATEGORIES } from "../src/lib/layanan";
import { KONTAK_FAQS } from "../src/lib/kontak";
import { PROMO_PACKAGES } from "../src/lib/promo";
import { getLayananDetail } from "../src/lib/layanan-detail";
import { getArticleDetail } from "../src/lib/blog-detail";
import {
  PANDUAN_NIB_HERO,
  PANDUAN_NIB_CHIPS,
  PANDUAN_NIB_SUMMARY,
  PANDUAN_NIB_NAV,
  PANDUAN_NIB_INTRO,
  PANDUAN_NIB_SYARAT_LEAD,
  PANDUAN_NIB_SYARAT,
  PANDUAN_NIB_LANGKAH_LEAD,
  PANDUAN_NIB_LANGKAH,
  PANDUAN_NIB_INFO,
  PANDUAN_NIB_FAQ,
  PANDUAN_NIB_HELP,
  PANDUAN_NIB_RELATED,
} from "../src/lib/panduan-nib";
import {
  PANDUAN_LEGALITAS_HERO,
  PANDUAN_LEGALITAS_CHIPS,
  PANDUAN_LEGALITAS_NAV,
  PANDUAN_LEGALITAS_PENTING,
  PANDUAN_LEGALITAS_LAYANAN,
  PANDUAN_LEGALITAS_PROSES,
  PANDUAN_LEGALITAS_KEUNGGULAN,
  PANDUAN_LEGALITAS_FAQ,
  PANDUAN_LEGALITAS_HELP,
  PANDUAN_LEGALITAS_CHECKLIST,
} from "../src/lib/panduan-legalitas";

/* ─── Helpers ─── */

/** "24 Januari 2025" / "7 Juli 2026" -> Date */
const BULAN: Record<string, number> = {
  januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
  juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
};
function parseIndoDate(s: string): Date {
  const [d, bulan, y] = s.trim().split(/\s+/);
  const m = BULAN[bulan.toLowerCase()];
  return new Date(Number(y), m, Number(d));
}

/** "Rp 5.500.000" -> 5500000 */
function parseRupiah(s: string): number {
  return Number(s.replace(/[^0-9]/g, ""));
}

/** "1.284" -> 1284 */
function parseViews(s: string): number {
  return Number(s.replace(/\./g, ""));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Objek konten kaya (blog-detail.ts, layanan-detail.ts, panduan-*.ts) menyimpan
 * komponen ikon Lucide (`icon: LucideIcon`) yang bukan JSON-serializable — harus
 * dibuang sebelum disimpan ke kolom Json Prisma. */
function stripIcons(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIcons);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "icon") continue;
      out[k] = stripIcons(v);
    }
    return out;
  }
  return value;
}

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/* ─── Mapping kategori layanan (13 dari layanan.ts, 6 sisanya judgment call
 * krn gak punya kategori di layanan.ts — lihat catatan di CHANGELOG) ─── */
const SERVICE_CATEGORY_BY_SLUG: Record<string, string> = {
  "pendirian-pt": "pendirian-perusahaan",
  nib: "perizinan-usaha",
  "izin-usaha": "perizinan-usaha",
  "izin-komersial": "perizinan-operasional",
  "perizinan-lainnya": "perizinan-lainnya",
  "perizinan-lokasi": "perizinan-lainnya",
  sertifikasi: "perizinan-operasional",
  "perizinan-impor": "perizinan-usaha",
  "izin-industri": "perizinan-usaha",
  "lingkungan-hidup": "perizinan-operasional",
  "perizinan-konstruksi": "perizinan-operasional",
  "perubahan-pembaruan-izin": "perizinan-lainnya",
  "pt-perorangan": "pendirian-perusahaan",
  "cv-firma": "pendirian-perusahaan",
  pma: "pendirian-perusahaan",
  "npwp-badan-pkp": "perizinan-usaha",
  "pendaftaran-merk": "perizinan-lainnya",
  "virtual-office": "perizinan-lainnya",
};

/** Slug layanan yang punya detailContent asli (sisanya null dulu — fallback
 * generator di layanan-detail.ts tetap jalan di frontend sampai v2.2.0). */
const SERVICE_SLUGS_WITH_DETAIL = ["pendirian-pt", "nib", "izin-usaha"];

/** categoryId testimoni — tebakan dari isi konten (constants.ts TESTIMONIALS
 * tidak punya field category sama sekali), lihat diskusi migrasi. */
const TESTIMONIAL_CATEGORY_BY_NAME: Record<string, string> = {
  "Andi Setiawan": "pendirian-perusahaan",
  "Siti Nurhaliza": "perizinan-usaha",
  "Budi Santoso": "perizinan-usaha",
  "Rina Wijaya": "perizinan-lainnya",
};

async function main() {
  /* ═══ 1. Super Admin (sudah ada dari v2.0.0, idempotent) ═══ */
  const adminEmail = "admin@izinpro.co.id";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const result = await auth.api.signUpEmail({
      body: { email: adminEmail, password: "admin123", name: "Super Admin" },
    });
    admin = await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "SUPER_ADMIN" },
    });
    console.log(`Super Admin dibuat: ${adminEmail} / admin123`);
  } else {
    console.log(`Super Admin sudah ada: ${adminEmail}`);
  }

  /* ═══ 2. Guard: kalau data konten sudah pernah di-seed, skip semua di bawah ═══ */
  const settingsExists = await prisma.settings.findUnique({ where: { id: "1" } });
  if (settingsExists) {
    console.log("Data konten (Settings dkk) sudah pernah di-seed — skip.");
    return;
  }

  /* ═══ 3. Settings (singleton) ═══ */
  await prisma.settings.create({
    data: {
      id: "1",
      companyName: COMPANY_INFO.name,
      tagline: COMPANY_INFO.tagline,
      description: COMPANY_INFO.description,
      operatingHours: COMPANY_INFO.hours,
      whatsapp: COMPANY_INFO.whatsapp,
      email: COMPANY_INFO.email,
      address: COMPANY_INFO.address,
      mapsUrl: COMPANY_INFO.mapsUrl,
      // social.* di mock semuanya "#" (placeholder, bukan link asli) -> null
      // spy ikon disembunyikan sampai klien kasih link beneran
      socialLinkedin: null,
      socialFacebook: null,
      socialInstagram: null,
      socialX: null,
      socialYoutube: null,
      // Belum ada input SEO dari klien — placeholder pending revisi
      seoTitle: `${COMPANY_INFO.name} — ${COMPANY_INFO.tagline}`,
      seoDescription: COMPANY_INFO.description,
      seoKeywords:
        "perizinan usaha, pendirian pt, nib, izin usaha, konsultan perizinan, jasa perizinan indonesia",
      updatedById: admin.id,
    },
  });
  console.log("Settings di-seed.");

  /* ═══ 4. Menu + MenuItem (header dari landing.ts, footer dari FOOTER_COLUMNS) ═══ */
  const headerMenu = await prisma.menu.create({
    data: { key: "header", name: "Navigasi Utama", createdById: admin.id, updatedById: admin.id },
  });
  for (let i = 0; i < NAV_LINKS.length; i++) {
    const link = NAV_LINKS[i];
    const parent = await prisma.menuItem.create({
      data: {
        menuId: headerMenu.id,
        label: link.label,
        href: link.href,
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    for (let j = 0; j < (link.children?.length ?? 0); j++) {
      const child = link.children![j];
      await prisma.menuItem.create({
        data: {
          menuId: headerMenu.id,
          parentId: parent.id,
          label: child.label,
          href: child.href,
          sortOrder: j,
          createdById: admin.id,
          updatedById: admin.id,
        },
      });
    }
  }

  const footerMenu = await prisma.menu.create({
    data: { key: "footer", name: "Navigasi Footer", createdById: admin.id, updatedById: admin.id },
  });
  for (let i = 0; i < FOOTER_COLUMNS.length; i++) {
    const col = FOOTER_COLUMNS[i];
    const parent = await prisma.menuItem.create({
      data: {
        menuId: footerMenu.id,
        label: col.title,
        href: "#",
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    for (let j = 0; j < col.links.length; j++) {
      const link = col.links[j];
      await prisma.menuItem.create({
        data: {
          menuId: footerMenu.id,
          parentId: parent.id,
          label: link.label,
          href: link.href,
          sortOrder: j,
          createdById: admin.id,
          updatedById: admin.id,
        },
      });
    }
  }
  console.log("Menu header & footer di-seed.");

  /* ═══ 5. ServiceCategory ═══ */
  const categoryIdBySlug: Record<string, string> = {};
  for (const cat of LAYANAN_CATEGORIES) {
    if (cat.id === "semua") continue; // filter UI "Semua Layanan", bukan kategori asli
    const created = await prisma.serviceCategory.create({
      data: { slug: cat.id, name: cat.label, createdById: admin.id, updatedById: admin.id },
    });
    categoryIdBySlug[cat.id] = created.id;
  }
  console.log(`${Object.keys(categoryIdBySlug).length} ServiceCategory di-seed.`);

  /* ═══ 6. Service (18) ═══ */
  const serviceIdBySlug: Record<string, string> = {};
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    const categorySlug = SERVICE_CATEGORY_BY_SLUG[s.slug];
    const categoryId = categoryIdBySlug[categorySlug];
    const detailContent = SERVICE_SLUGS_WITH_DETAIL.includes(s.slug)
      ? (stripIcons(getLayananDetail(s.slug)) as object)
      : undefined;
    const created = await prisma.service.create({
      data: {
        slug: s.slug,
        title: s.title,
        description: s.description,
        icon: s.icon,
        color: s.color,
        bgColor: s.bgColor,
        categoryId,
        features: s.features,
        detailContent,
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    serviceIdBySlug[s.slug] = created.id;
  }
  console.log(`${SERVICES.length} Service di-seed.`);

  /* ═══ 7. TeamMember (6) ═══ */
  for (let i = 0; i < TEAM_MEMBERS.length; i++) {
    const t = TEAM_MEMBERS[i];
    await prisma.teamMember.create({
      data: { name: t.name, role: t.role, sortOrder: i, createdById: admin.id, updatedById: admin.id },
    });
  }
  console.log(`${TEAM_MEMBERS.length} TeamMember di-seed.`);

  /* ═══ 8. Testimonial (6, teks — video testimonial di-skip krn gak ada
   * teks testimoni asli, cuma nama+durasi) ═══ */
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    const categorySlug = TESTIMONIAL_CATEGORY_BY_NAME[t.name];
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        company: t.company,
        content: t.content,
        rating: t.rating,
        categoryId: categorySlug ? categoryIdBySlug[categorySlug] : null,
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${TESTIMONIALS.length} Testimonial di-seed.`);

  /* ═══ 9. Media (logo partner) + Partner (8, cuma yg punya file logo asli) ═══ */
  const publicDir = path.join(process.cwd(), "public");
  for (let i = 0; i < CLIENT_LOGOS.length; i++) {
    const c = CLIENT_LOGOS[i];
    const absPath = path.join(publicDir, c.logo);
    const ext = path.extname(c.logo).toLowerCase();
    const sizeBytes = fs.existsSync(absPath) ? fs.statSync(absPath).size : 0;
    const media = await prisma.media.create({
      data: {
        fileName: path.basename(c.logo),
        url: c.logo,
        mimeType: MIME_BY_EXT[ext] ?? "application/octet-stream",
        sizeBytes,
        uploadedById: admin.id,
      },
    });
    await prisma.partner.create({
      data: {
        name: c.name,
        logoMediaId: media.id,
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${CLIENT_LOGOS.length} Partner (+ Media logo) di-seed.`);

  /* ═══ 10. Faq (6 GLOBAL + 4 KONTAK) ═══ */
  for (let i = 0; i < FAQS.length; i++) {
    const f = FAQS[i];
    await prisma.faq.create({
      data: {
        question: f.question,
        answer: f.answer,
        scope: "GLOBAL",
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  for (let i = 0; i < KONTAK_FAQS.length; i++) {
    const f = KONTAK_FAQS[i];
    await prisma.faq.create({
      data: {
        question: f.question,
        answer: f.answer,
        scope: "KONTAK",
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${FAQS.length + KONTAK_FAQS.length} Faq di-seed.`);

  /* ═══ 11. PromoBanner (3) ═══ */
  for (let i = 0; i < PROMOS.length; i++) {
    const p = PROMOS[i];
    await prisma.promoBanner.create({
      data: {
        tag: p.tag,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        ctaLabel: p.ctaLabel,
        ctaHref: p.ctaHref,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${PROMOS.length} PromoBanner di-seed.`);

  /* ═══ 12. PromoPackage (3, harga asli — bukan placeholder) ═══ */
  for (let i = 0; i < PROMO_PACKAGES.length; i++) {
    const p = PROMO_PACKAGES[i];
    const slugMatch = p.href.match(/^\/layanan\/(.+)$/);
    const serviceId = slugMatch ? serviceIdBySlug[slugMatch[1]] ?? null : null;
    await prisma.promoPackage.create({
      data: {
        badge: p.badge,
        title: p.title,
        price: parseRupiah(p.price),
        originalPrice: parseRupiah(p.originalPrice),
        features: p.features,
        serviceId,
        isDark: p.dark ?? false,
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${PROMO_PACKAGES.length} PromoPackage di-seed.`);

  /* ═══ 13. Cta (default + 3 varian, dari mock admin/cta-banner) ═══ */
  await prisma.cta.create({
    data: {
      location: null,
      title: "Siap Memulai Perizinan Bisnis Anda?",
      subtitle: "Konsultasikan kebutuhan perizinan Anda sekarang gratis bersama tim ahli kami.",
      buttonLabel: "Konsultasikan Gratis Sekarang",
      whatsapp: COMPANY_INFO.whatsapp,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  await prisma.cta.create({
    data: {
      location: "TENTANG_KAMI",
      title: "Siap Bekerja Sama dengan Kami?",
      subtitle:
        "Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami.",
      buttonLabel: "Konsultasikan Gratis Sekarang",
      whatsapp: COMPANY_INFO.whatsapp,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  await prisma.cta.create({
    data: {
      location: "BLOG",
      title: "Butuh Bantuan Mengurus Perizinan?",
      subtitle:
        "Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami.",
      buttonLabel: "Konsultasikan Gratis Sekarang",
      whatsapp: COMPANY_INFO.whatsapp,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  await prisma.cta.create({
    data: {
      location: "DETAIL_LAYANAN",
      title: "Siap Memulai Perizinan Bisnis Anda?",
      subtitle: "Konsultasikan kebutuhan layanan Anda sekarang juga, GRATIS!",
      buttonLabel: "Konsultasikan Sekarang",
      whatsapp: COMPANY_INFO.whatsapp,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });
  console.log("4 Cta (default + 3 varian) di-seed.");

  /* ═══ 14. Category + BlogPost (8) ═══ */
  const blogCategoryNames = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
  const categoryIdByName: Record<string, string> = {};
  for (const name of blogCategoryNames) {
    const created = await prisma.category.create({
      data: { name, slug: slugify(name), createdById: admin.id, updatedById: admin.id },
    });
    categoryIdByName[name] = created.id;
  }

  const richDetailBuilders: Record<string, () => object> = {
    "cara-mudah-membuat-nib-online-2024": () =>
      stripIcons(getArticleDetail("cara-mudah-membuat-nib-online-2024")) as object,
    "panduan-lengkap-mengurus-nib-melalui-oss": () =>
      stripIcons({
        hero: PANDUAN_NIB_HERO,
        chips: PANDUAN_NIB_CHIPS,
        summary: PANDUAN_NIB_SUMMARY,
        nav: PANDUAN_NIB_NAV,
        intro: PANDUAN_NIB_INTRO,
        syaratLead: PANDUAN_NIB_SYARAT_LEAD,
        syarat: PANDUAN_NIB_SYARAT,
        langkahLead: PANDUAN_NIB_LANGKAH_LEAD,
        langkah: PANDUAN_NIB_LANGKAH,
        info: PANDUAN_NIB_INFO,
        faq: PANDUAN_NIB_FAQ,
        help: PANDUAN_NIB_HELP,
        related: PANDUAN_NIB_RELATED,
      }) as object,
    "legalitas-lengkap-bisnis-makin-terpercaya": () =>
      stripIcons({
        hero: PANDUAN_LEGALITAS_HERO,
        chips: PANDUAN_LEGALITAS_CHIPS,
        nav: PANDUAN_LEGALITAS_NAV,
        penting: PANDUAN_LEGALITAS_PENTING,
        layanan: PANDUAN_LEGALITAS_LAYANAN,
        proses: PANDUAN_LEGALITAS_PROSES,
        keunggulan: PANDUAN_LEGALITAS_KEUNGGULAN,
        faq: PANDUAN_LEGALITAS_FAQ,
        help: PANDUAN_LEGALITAS_HELP,
        checklist: PANDUAN_LEGALITAS_CHECKLIST,
      }) as object,
  };

  for (const post of BLOG_POSTS) {
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        // Belum ada body artikel lengkap utk 5/8 post — pakai excerpt sbg
        // placeholder sampai konten asli tersedia (lihat detailContent utk 3
        // artikel yg sudah punya rich content).
        content: post.excerpt,
        detailContent: richDetailBuilders[post.slug]?.(),
        categoryId: categoryIdByName[post.category],
        authorId: admin.id,
        views: parseViews(post.views),
        status: "PUBLISHED",
        publishedAt: parseIndoDate(post.date),
        updatedById: admin.id,
      },
    });
  }
  console.log(`${blogCategoryNames.length} Category + ${BLOG_POSTS.length} BlogPost di-seed.`);

  /* ═══ 15. Inquiry (6, dari mock admin/inquiry inline SEED) ═══ */
  const now = new Date();
  const minutesAgo = (n: number) => new Date(now.getTime() - n * 60_000);
  const INQUIRY_SERVICE_SLUG: Record<string, string> = {
    "Pendirian PT": "pendirian-pt",
    "NIB Online": "nib",
    "Izin Usaha": "izin-usaha",
    "Izin Komersial": "izin-komersial",
  };
  const inquiries = [
    { name: "Andi Setiawan", email: "andi.s@gmail.com", whatsapp: "0812-1111-2233", layanan: "Pendirian PT", pesan: "Halo, saya ingin mendirikan PT untuk usaha kuliner. Kira-kira butuh dokumen apa saja dan berapa lama prosesnya?", ago: 5, status: "BARU" as const },
    { name: "Siti Nurhaliza", email: "siti.nur@yahoo.com", whatsapp: "0813-2222-3344", layanan: "NIB Online", pesan: "Saya butuh NIB untuk toko online saya. Apakah bisa dibantu prosesnya sampai selesai?", ago: 60, status: "DIPROSES" as const },
    { name: "Budi Santoso", email: "budi.santoso@gmail.com", whatsapp: "0821-3333-4455", layanan: "Izin Usaha", pesan: "Usaha bengkel saya belum ada izin resmi. Mohon info paket dan biayanya.", ago: 180, status: "SELESAI" as const },
    { name: "Rina Wijaya", email: "rina.w@outlook.com", whatsapp: "0856-4444-5566", layanan: "Izin Komersial", pesan: "Perusahaan kami mau ekspansi dan butuh izin komersial baru. Bisa konsultasi dulu?", ago: 300, status: "SELESAI" as const },
    { name: "Deni Hermawan", email: "deni.hermawan@gmail.com", whatsapp: "0877-5555-6677", layanan: "Pendirian PT", pesan: "Mau tanya paket pendirian PT yang termasuk virtual office ada tidak ya?", ago: 60 * 24, status: "DIPROSES" as const },
    { name: "Maya Kusuma", email: "maya.k@gmail.com", whatsapp: "0898-6666-7788", layanan: "Lainnya", pesan: "Saya ingin mengurus sertifikasi halal untuk produk makanan ringan. Apakah IzinPro melayani ini?", ago: 60 * 27, status: "BARU" as const },
  ];
  for (const inq of inquiries) {
    const slug = INQUIRY_SERVICE_SLUG[inq.layanan];
    await prisma.inquiry.create({
      data: {
        name: inq.name,
        email: inq.email,
        whatsapp: inq.whatsapp,
        serviceId: slug ? serviceIdBySlug[slug] ?? null : null,
        message: inq.pesan,
        status: inq.status,
        createdAt: minutesAgo(inq.ago),
        updatedById: admin.id,
      },
    });
  }
  console.log(`${inquiries.length} Inquiry di-seed.`);

  /* ═══ 16. Page (8, dari mock admin/pages inline SEED) ═══ */
  const pages = [
    { slug: "/", title: "Beranda", heroTitle: "Urus Perizinan Bisnis Tanpa Ribet", heroSubtitle: "Layanan pengurusan legalitas & perizinan usaha yang cepat, transparan, dan terpercaya." },
    { slug: "/layanan", title: "Layanan", heroTitle: "Layanan Perizinan Lengkap", heroSubtitle: "Semua kebutuhan legalitas usaha Anda di satu tempat." },
    { slug: "/blog", title: "Blog", heroTitle: "Blog & Artikel", heroSubtitle: "Wawasan terbaru seputar perizinan dan legalitas usaha." },
    { slug: "/promo", title: "Promo", heroTitle: "Promo Spesial", heroSubtitle: "Penawaran terbaik untuk memulai legalitas usaha Anda." },
    { slug: "/tentang-kami", title: "Tentang Kami", heroTitle: "Tentang IzinPro", heroSubtitle: "Partner terpercaya pengurusan perizinan bisnis di Indonesia." },
    { slug: "/testimoni", title: "Testimoni", heroTitle: "Apa Kata Klien Kami", heroSubtitle: "Cerita nyata dari klien yang sudah kami bantu." },
    { slug: "/kontak", title: "Kontak", heroTitle: "Hubungi Kami", heroSubtitle: "Tim kami siap membantu kebutuhan perizinan Anda." },
    { slug: "/tracking", title: "Tracking", heroTitle: "Lacak Status Pengurusan", heroSubtitle: "Pantau progres dokumen Anda secara real-time." },
  ];
  for (const p of pages) {
    await prisma.page.create({
      data: { ...p, status: "PUBLISHED", isCore: true, createdById: admin.id, updatedById: admin.id },
    });
  }
  console.log(`${pages.length} Page di-seed.`);

  /* ═══ 17. Order (3, model baru — dari tracking.ts MOCK_ORDERS) ═══ */
  const ORDER_SERVICE_SLUG: Record<string, string> = {
    "Pendirian PT": "pendirian-pt",
    "NIB (Nomor Induk Berusaha)": "nib",
    "Izin Usaha": "izin-usaha",
  };
  const orders = [
    { orderNo: "IZN-2025-0001", service: "Pendirian PT", submittedDate: "7 Juli 2026", estimatedDone: "16 Juli 2026", currentStep: 3, stepDates: ["7 Juli 2026", "9 Juli 2026", null, null, null] },
    { orderNo: "IZN-2025-0002", service: "NIB (Nomor Induk Berusaha)", submittedDate: "3 Juli 2026", estimatedDone: "6 Juli 2026", currentStep: 5, stepDates: ["3 Juli 2026", "4 Juli 2026", "4 Juli 2026", "5 Juli 2026", "6 Juli 2026"] },
    { orderNo: "IZN-2025-0003", service: "Izin Usaha", submittedDate: "10 Juli 2026", estimatedDone: "24 Juli 2026", currentStep: 1, stepDates: [null, null, null, null, null] },
  ];
  for (const o of orders) {
    const slug = ORDER_SERVICE_SLUG[o.service];
    await prisma.order.create({
      data: {
        orderNo: o.orderNo,
        serviceId: slug ? serviceIdBySlug[slug] ?? null : null,
        currentStep: o.currentStep,
        submittedAt: parseIndoDate(o.submittedDate),
        estimatedDoneAt: parseIndoDate(o.estimatedDone),
        stepDates: o.stepDates.map((d) => (d ? parseIndoDate(d).toISOString() : null)),
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${orders.length} Order di-seed.`);

  console.log("Selesai — semua data mock berhasil di-migrasi ke database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
