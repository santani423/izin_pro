import fs from "node:fs";
import path from "node:path";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";
import type { Role } from "@prisma/client";

import {
  COMPANY_INFO,
  SERVICES,
  TESTIMONIALS,
  BLOG_POSTS,
  PROMOS,
  FAQS,
  TEAM_MEMBERS,
} from "../src/lib/constants";
import { HERO_HIGHLIGHTS } from "../src/lib/landing";
import { TENTANG_STATS, TENTANG_VALUES, TENTANG_VISION, TENTANG_MISSION } from "../src/lib/tentang";
import { DETAIL_ICONS } from "../src/lib/detail-icons";
import type { LucideIcon } from "lucide-react";

/* Reverse lookup ikon (komponen -> string key) — sama pola dgn
 * prisma/service-detail-seed-helpers.ts, biar gak perlu nulis ulang key
 * manual & gak salah transkripsi. */
const REVERSE_ICON_MAP = new Map<LucideIcon, string>(
  Object.entries(DETAIL_ICONS).map(([key, icon]) => [icon, key] as const),
);
function iconKey(icon: LucideIcon): string {
  return REVERSE_ICON_MAP.get(icon) ?? "file-text";
}
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
import { KONTAK_FAQS, KONTAK_INFO_CARDS, KONTAK_CHANNELS } from "../src/lib/kontak";
import { PROMO_PACKAGES, PROMO_HIGHLIGHTS, PROMO_WHY, PROMO_STEPS } from "../src/lib/promo";
import { getLayananDetail } from "../src/lib/layanan-detail";
import { toServiceDetailContent, parsePriceToNumber } from "./service-detail-seed-helpers";
import { getArticleDetail } from "../src/lib/blog-detail";
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

/** 4 testimoni ini sebelumnya cuma ada di mock LANDING_VIDEO_TESTIMONIALS —
 * sekarang jadi Testimonial asli dengan isVideo=true (durasi dipertahankan,
 * content/rating jadi null krn video testimoni gak butuh field itu lagi
 * sejak v2.2.8). videoUrl sama utk keempatnya — placeholder sampai klien
 * kasih video asli per klien. */
const TESTIMONIAL_VIDEO_DURATION_BY_NAME: Record<string, string> = {
  "Andi Setiawan": "1:28",
  "Siti Nurhaliza": "1:15",
  "Budi Santoso": "1:32",
  "Rina Wijaya": "1:27",
};
const TESTIMONIAL_VIDEO_URL = "https://www.youtube.com/watch?v=JihfflYaZWY";

/** 6 testimoni teks tambahan (v2.2.8) — user minta tab "Testimoni" jangan
 * cuma sisa 2 (Deni Hermawan, Laila Mahmud) setelah 4 lainnya dipindah jadi
 * video testimoni. */
const ADDITIONAL_TEXT_TESTIMONIALS = [
  {
    name: "Hendra Wijaya",
    role: "Owner",
    company: "UD Sumber Rezeki",
    content:
      "Pengurusan izin operasional toko kami jadi jauh lebih mudah lewat IzinPro. Tim-nya sabar jelasin tiap tahapan sampai selesai.",
    rating: 5,
    categorySlug: "perizinan-operasional",
  },
  {
    name: "Maya Anggraini",
    role: "Direktur",
    company: "PT Cipta Sentosa",
    content:
      "Pendirian PT kami rampung dalam waktu singkat, semua dokumen legalnya rapi dan sesuai regulasi terbaru. IzinPro benar-benar paham kebutuhan pengusaha.",
    rating: 5,
    categorySlug: "pendirian-perusahaan",
  },
  {
    name: "Rudi Hartono",
    role: "Founder",
    company: "CV Berkah Jaya",
    content:
      "NIB usaha kami keluar lebih cepat dari perkiraan. Komunikasi tim IzinPro juga enak, selalu update progress tanpa perlu ditanya duluan.",
    rating: 5,
    categorySlug: "perizinan-usaha",
  },
  {
    name: "Fitriani Kusuma",
    role: "Owner",
    company: "Toko Fitri Fashion",
    content:
      "Awalnya bingung soal sertifikasi halal buat produk kami, untung ada IzinPro yang bantu dari konsultasi sampai terbit. Prosesnya jelas, gak berbelit.",
    rating: 4,
    categorySlug: "perizinan-lainnya",
  },
  {
    name: "Agus Prasetyo",
    role: "CEO",
    company: "PT Global Teknindo",
    content:
      "Izin lingkungan untuk pabrik kami biasanya ribet, tapi IzinPro bantu urus semua persyaratannya dengan rapi dan tepat waktu. Recommended banget.",
    rating: 5,
    categorySlug: "perizinan-operasional",
  },
  {
    name: "Nia Ramadhani",
    role: "Manajer",
    company: "CV Anugerah Sejahtera",
    content:
      "Tim IzinPro membantu kami dari nol sampai badan usaha resmi berdiri. Konsultasinya gratis dan benar-benar informatif, jadi paham alur perizinannya.",
    rating: 5,
    categorySlug: "pendirian-perusahaan",
  },
];

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

  /* ═══ 1b. Akun demo per role (buat mempermudah demo di halaman login —
   * ditampilkan lewat tombol "Lihat Akun Demo", lihat LoginFormClient.tsx).
   * Idempotent sama kayak Super Admin di atas. */
  const DEMO_ACCOUNTS: { email: string; password: string; name: string; role: Role }[] = [
    { email: "demo-admin@izinpro.co.id", password: "demo1234", name: "Demo Admin", role: "ADMIN" },
    { email: "demo-editor@izinpro.co.id", password: "demo1234", name: "Demo Editor", role: "EDITOR" },
    { email: "demo-author@izinpro.co.id", password: "demo1234", name: "Demo Author", role: "AUTHOR" },
  ];
  for (const acc of DEMO_ACCOUNTS) {
    const existing = await prisma.user.findUnique({ where: { email: acc.email } });
    if (!existing) {
      const result = await auth.api.signUpEmail({
        body: { email: acc.email, password: acc.password, name: acc.name },
      });
      await prisma.user.update({ where: { id: result.user.id }, data: { role: acc.role } });
      console.log(`Akun demo dibuat: ${acc.email} / ${acc.password} (${acc.role})`);
    } else {
      console.log(`Akun demo sudah ada: ${acc.email}`);
    }
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
      appLogoUrl: null,
      faviconUrl: null,
      // Belum ada input SEO dari klien — placeholder pending revisi
      seoTitle: `${COMPANY_INFO.name} — ${COMPANY_INFO.tagline}`,
      seoDescription: COMPANY_INFO.description,
      seoKeywords:
        "perizinan usaha, pendirian pt, nib, izin usaha, konsultan perizinan, jasa perizinan indonesia",
      updatedById: admin.id,
    },
  });
  console.log("Settings di-seed.");

  /* ═══ 3b. HeroContent (singleton) — teks hero beranda, copy asli dari HeroSection.tsx ═══ */
  await prisma.heroContent.create({
    data: {
      id: "1",
      titleLine1: "Solusi Perizinan",
      titleHighlight: "Bisnis Anda,",
      titleLine3: "Aman & Terpercaya",
      subtitle:
        "IzinPro hadir untuk membantu bisnis Anda mengurus perizinan dengan mudah, cepat, dan sesuai regulasi.",
      highlights: HERO_HIGHLIGHTS.map(({ title, subtitle }) => ({ title, subtitle })),
      ctaPrimaryLabel: "Konsultasikan Gratis",
      ctaSecondaryLabel: "Lihat Semua Layanan",
      ctaSecondaryHref: "/layanan",
      updatedById: admin.id,
    },
  });
  console.log("HeroContent di-seed.");

  /* ═══ 3c. AboutPageContent (singleton) — teks /tentang-kami, copy asli dari
   * (public)/tentang-kami/page.tsx + src/lib/tentang.ts (biar tampilan gak
   * berubah begitu diaktifkan) ═══ */
  await prisma.aboutPageContent.create({
    data: {
      id: "1",
      heroKicker: null,
      heroTitle: "Tentang",
      heroTitleHighlight: "IzinPro",
      heroSubtitleBold:
        "Solusi Perizinan Terpercaya untuk Mendukung Pertumbuhan Bisnis Anda",
      heroSubtitleBody:
        "IzinPro hadir untuk memberikan layanan perizinan usaha yang mudah, cepat, transparan, dan legal. Kami berkomitmen menjadi partner terbaik bagi setiap pelaku bisnis dalam mewujudkan legalitas usaha yang aman dan berkelanjutan.",
      heroImageUrl: null,

      aboutKicker: "Tentang Kami",
      aboutTitle: "IzinPro, Partner Tepat untuk",
      aboutTitleHighlight: "Legalitas Bisnis Anda",
      aboutParagraphs: [
        "IzinPro adalah penyedia jasa perizinan usaha terpercaya di Indonesia yang berfokus pada kemudahan, kecepatan, dan kepastian hukum dalam setiap proses perizinan.",
        "Kami memahami bahwa setiap bisnis membutuhkan legalitas yang kuat sebagai fondasi untuk berkembang. Karena itu, kami hadir dengan layanan terlengkap dan pendampingan dari tim ahli berpengalaman.",
      ],
      aboutImageUrl: null,
      stats: TENTANG_STATS.map((s) => ({ icon: iconKey(s.icon), value: s.value, label: s.label })),

      valuesEnabled: true,
      // Tampil "{highlight} {title}" di komponen (beda urutan dari About/Team,
      // krn desain aslinya kata primary-nya di depan) — lihat TentangValuesSection.
      valuesTitle: "yang Kami Junjung",
      valuesTitleHighlight: "Nilai-Nilai",
      valuesSubtitle:
        "Nilai-nilai ini menjadi komitmen kami dalam memberikan layanan terbaik bagi klien.",
      values: TENTANG_VALUES.map((v) => ({ icon: iconKey(v.icon), title: v.title, description: v.description })),

      visiMisiEnabled: true,
      vision: TENTANG_VISION,
      visionImageUrl: null,
      mission: TENTANG_MISSION,
      missionImageUrl: null,

      teamEnabled: true,
      teamTitle: "Tim",
      teamTitleHighlight: "Profesional",
      teamSubtitle:
        "Didukung oleh tim ahli berpengalaman yang siap membantu kebutuhan perizinan bisnis Anda.",

      metaTitle: "Tentang IzinPro — Solusi Perizinan Terpercaya",
      metaDescription:
        "Kenali IzinPro — penyedia jasa perizinan usaha terpercaya di Indonesia dengan 10+ tahun pengalaman, 5.000+ perizinan selesai, dan tim profesional berpengalaman.",

      updatedById: admin.id,
    },
  });
  console.log("AboutPageContent di-seed.");

  /* ═══ 3d. TestimoniPageContent (singleton) — teks Hero + kartu statistik
   * /testimoni, copy asli dari (public)/testimoni/page.tsx + TestimoniStatsBar
   * (lib/testimoni.ts) ═══ */
  await prisma.testimoniPageContent.create({
    data: {
      id: "1",
      heroKicker: null,
      heroTitle: "Testimoni",
      heroTitleHighlight: "Klien",
      heroDescription:
        "Kepercayaan dan kepuasan klien adalah prioritas kami. Berikut pengalaman mereka bersama IzinPro.",
      heroImageUrl: null,
      stats: [
        { icon: "users", value: "5.000+", label: "Perizinan Selesai" },
        { icon: "smile", value: "99%", label: "Kepuasan Klien" },
        { icon: "building", value: "Berbagai", label: "Industri Terlayani" },
        { icon: "award", value: "10+", label: "Tahun Pengalaman" },
      ],
      updatedById: admin.id,
    },
  });
  console.log("TestimoniPageContent di-seed.");

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

  /* ═══ 6. Service (18) ═══
   * detailContent (halaman /layanan/[slug]) langsung diisi lengkap sejak
   * install baru — bukan cuma 3 slug hand-authored, SEMUA service dapet
   * konten (yang 15 sisanya dari buildFallbackDetail() di layanan-detail.ts)
   * + ServicePackage + Faq scope SERVICE (khusus 3 slug asli, sisanya pakai
   * fallback Faq GLOBAL) — sama persis hasil akhir prisma/seed-service-detail-content.ts,
   * cuma dijalanin sekali di sini biar install baru gak perlu backfill manual lagi. */
  const serviceIdBySlug: Record<string, string> = {};
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    const categorySlug = SERVICE_CATEGORY_BY_SLUG[s.slug];
    const categoryId = categoryIdBySlug[categorySlug];
    const detail = getLayananDetail(s.slug)!; // selalu ada — fallback generator jamin ini
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
        detailContent: toServiceDetailContent(detail) as object,
        metaTitle: `${detail.title} — ${detail.tagline}`,
        metaDescription: detail.description,
        status: "PUBLISHED",
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    serviceIdBySlug[s.slug] = created.id;

    if (detail.packages) {
      for (const [pkgIndex, pkg] of detail.packages.items.entries()) {
        await prisma.servicePackage.create({
          data: {
            serviceId: created.id,
            name: pkg.name,
            price: parsePriceToNumber(pkg.price),
            isPopular: pkg.popular ?? false,
            features: pkg.features,
            sortOrder: pkgIndex,
          },
        });
      }
    }

    // FAQ scope SERVICE cuma utk 3 layanan hand-authored — sisanya pakai
    // fallback Faq GLOBAL (dari FAQS, di-seed di step 9) biar gak nyampah
    // 15x FAQ generik yang isinya sama.
    if (SERVICE_SLUGS_WITH_DETAIL.includes(s.slug)) {
      for (const [faqIndex, faq] of detail.faqs.items.entries()) {
        await prisma.faq.create({
          data: {
            question: faq.question,
            answer: faq.answer,
            scope: "SERVICE",
            serviceId: created.id,
            sortOrder: faqIndex,
          },
        });
      }
    }
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

  /* ═══ 8. Testimonial (6 dari mock + 4 jadi video + 6 teks tambahan v2.2.8) ═══ */
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    const categorySlug = TESTIMONIAL_CATEGORY_BY_NAME[t.name];
    const videoDuration = TESTIMONIAL_VIDEO_DURATION_BY_NAME[t.name];
    const isVideo = Boolean(videoDuration);
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        company: t.company,
        content: isVideo ? null : t.content,
        rating: isVideo ? null : t.rating,
        categoryId: categorySlug ? categoryIdBySlug[categorySlug] : null,
        isVideo,
        videoUrl: isVideo ? TESTIMONIAL_VIDEO_URL : null,
        duration: videoDuration ?? null,
        sortOrder: i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  for (let i = 0; i < ADDITIONAL_TEXT_TESTIMONIALS.length; i++) {
    const t = ADDITIONAL_TEXT_TESTIMONIALS[i];
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        company: t.company,
        content: t.content,
        rating: t.rating,
        categoryId: categoryIdBySlug[t.categorySlug] ?? null,
        isVideo: false,
        sortOrder: TESTIMONIALS.length + i,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${TESTIMONIALS.length + ADDITIONAL_TEXT_TESTIMONIALS.length} Testimonial di-seed.`);

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
        title: `Logo ${c.name}`,
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

  /* ═══ 12b. PromoPageContent (singleton) — teks Hero + tiap section body
   * /promo, copy asli dari (public)/promo/page.tsx + lib/promo.ts (paket
   * promo-nya sendiri tetap di PromoPackage di atas) ═══ */
  await prisma.promoPageContent.create({
    data: {
      id: "1",
      heroKicker: null,
      heroTitle: "Promosi",
      heroTitleHighlight: "Spesial",
      heroDescription:
        "Penawaran terbaik untuk membantu bisnis Anda tumbuh dengan legalitas yang lengkap dan profesional.",
      heroImageUrl: null,
      highlights: PROMO_HIGHLIGHTS.map((h) => ({ icon: iconKey(h.icon), label: h.label })),
      packagesTitlePrefix: "Promo",
      packagesTitleHighlight: "Pilihan",
      packagesTitleSuffix: "untuk Anda",
      packagesSubtitle: "Pilih paket layanan yang paling sesuai dengan kebutuhan bisnis Anda.",
      countdownTitlePrefix: "Diskon Spesial",
      countdownTitleHighlight: "Konsultasi Gratis",
      countdownDescription:
        "Dapatkan diskon hingga 25% untuk setiap layanan pilihan Anda. Promo terbatas bulan ini!",
      whyTitlePrefix: "Kenapa Pilih Promo",
      whyTitleHighlight: "IzinPro?",
      whyItems: PROMO_WHY.map((w) => ({ icon: iconKey(w.icon), title: w.title, description: w.description })),
      stepsTitle: "Cara Mendapatkan Promo",
      steps: PROMO_STEPS.map((s) => ({ icon: iconKey(s.icon), title: s.title, description: s.description })),
      consultTitlePrefix: "Siap Dapatkan",
      consultTitleHighlight: "Promo Spesial Ini?",
      consultDescription:
        "Konsultasikan kebutuhan perizinan bisnis Anda sekarang juga dan dapatkan penawaran terbaik dari kami.",
      consultImageUrl: null,
      ctaTitle: "Butuh Bantuan Memilih Promo yang Tepat?",
      ctaSubtitle: "Tim kami siap membantu Anda menemukan solusi terbaik untuk bisnis Anda.",
      ctaButtonLabel: "Chat Konsultasi Gratis",
      updatedById: admin.id,
    },
  });
  console.log("PromoPageContent di-seed.");

  /* ═══ 12c. KontakPageContent (singleton) — teks Hero + tiap section body
   * /kontak, copy asli dari (public)/kontak/page.tsx + lib/kontak.ts. Daftar
   * FAQ-nya sendiri udah di-seed di Faq (scope KONTAK) di atas, pesan yang
   * dikirim pengunjung disimpan di Inquiry (bukan di sini). ═══ */
  await prisma.kontakPageContent.create({
    data: {
      id: "1",
      heroKicker: null,
      heroTitle: "Hubungi",
      heroTitleHighlight: "IzinPro",
      heroDescription:
        "Kami siap membantu kebutuhan perizinan bisnis Anda. Hubungi kami melalui form, WhatsApp, email, atau datang langsung ke kantor kami.",
      heroImageUrl: null,
      infoCards: KONTAK_INFO_CARDS.map((c) => ({
        icon: c.icon === "whatsapp" ? "whatsapp" : iconKey(c.icon),
        title: c.title,
        value: c.value,
        note: c.note,
      })),
      formTitle: "Kirim Pesan Kepada Kami",
      formSubtitle: "Isi form di bawah ini dan tim kami akan segera menghubungi Anda.",
      sidebarTitle: "Informasi Kontak",
      sidebarSubtitle: "Pilih cara terbaik untuk menghubungi kami.",
      channels: KONTAK_CHANNELS.map((c) => ({
        icon: c.icon === "whatsapp" ? "whatsapp" : iconKey(c.icon),
        title: c.title,
        value: c.value ?? null,
        note: c.note ?? null,
        href: c.href,
      })),
      locationTitle: "Lokasi Kantor",
      mapsEmbedUrl:
        "https://www.google.com/maps?q=Wisma+Laena+Jl+KH+Abdullah+Syafei+No+7+Jakarta+Selatan&z=15&output=embed",
      faqTitlePrefix: "Pertanyaan yang",
      faqTitleHighlight: "Sering Diajukan",
      helpCardTitle: "Masih Punya Pertanyaan?",
      helpCardDescription:
        "Tim ahli kami siap membantu Anda memberikan solusi terbaik untuk kebutuhan bisnis Anda.",
      helpCardButtonLabel: "Konsultasikan Gratis Sekarang",
      helpCardImageUrl: null,
      updatedById: admin.id,
    },
  });
  console.log("KontakPageContent di-seed.");

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

  /* Konten HTML asli (v2.3.2) — hasil konversi dari panduan-nib.ts,
   * panduan-legalitas.ts & blog-detail.ts (3 artikel), + 1 artikel baru
   * (apa-itu-oss) yang ditulis manual krn belum ada sumber sebelumnya.
   * Menggantikan placeholder `content: post.excerpt` utk 4 slug ini saja. */
  const RICH_BLOG_CONTENT: Record<string, string> = {
    "cara-mudah-membuat-nib-online-2024": `
<h2>Apa itu NIB?</h2>
<p>NIB (Nomor Induk Berusaha) adalah identitas resmi pelaku usaha yang diterbitkan oleh pemerintah melalui sistem OSS (Online Single Submission). NIB berlaku sebagai Tanda Daftar Perusahaan (TDP), Angka Pengenal Importir (API), dan akses kepabeanan dalam satu nomor identitas.</p>
<h2>Syarat Mengurus NIB</h2>
<p>Siapkan dokumen dan data berikut sebelum memulai pendaftaran NIB melalui OSS.</p>
<ul>
<li><p><strong>KTP Penanggung Jawab</strong> — KTP masih berlaku.</p></li>
<li><p><strong>NPWP (Jika ada)</strong> — Lampirkan NPWP perusahaan atau pribadi.</p></li>
<li><p><strong>Email Aktif</strong> — Digunakan untuk verifikasi dan notifikasi.</p></li>
<li><p><strong>Nomor Handphone Aktif</strong> — Untuk menerima kode OTP.</p></li>
<li><p><strong>Aktivitas Usaha</strong> — Tentukan jenis dan bidang usaha Anda.</p></li>
<li><p><strong>Alamat Usaha</strong> — Alamat lengkap sesuai dokumen legal.</p></li>
</ul>
<h2>Langkah Mengurus NIB Melalui OSS</h2>
<p>Ikuti langkah-langkah berikut untuk mendapatkan NIB dengan mudah.</p>
<ol>
<li><p><strong>Buat Akun OSS</strong> — Kunjungi oss.go.id dan daftar akun baru.</p></li>
<li><p><strong>Login ke OSS</strong> — Login menggunakan email dan password yang telah didaftarkan.</p></li>
<li><p><strong>Lengkapi Data</strong> — Isi data pelaku usaha, data usaha, dan data penanggung jawab.</p></li>
<li><p><strong>Pilih KBLI</strong> — Pilih kode KBLI sesuai dengan bidang usaha Anda.</p></li>
<li><p><strong>Perizinan Berusaha</strong> — Pilih jenis perizinan yang dibutuhkan (NIB, Izin Usaha, atau Izin Komersial).</p></li>
<li><p><strong>Cek & Terbitkan NIB</strong> — Periksa data yang telah diisi. Jika sudah benar, NIB akan terbit secara otomatis.</p></li>
</ol>
<h2>Biaya &amp; Waktu Proses</h2>
<ul>
<li><p><strong>Biaya: GRATIS</strong> — Pendaftaran NIB melalui sistem OSS tidak dikenakan biaya apapun.</p></li>
<li><p><strong>Waktu Proses: 1–3 Hari Kerja</strong> — Proses penerbitan NIB biasanya memakan waktu 1–3 hari kerja setelah semua data lengkap.</p></li>
</ul>
<h2>FAQ Seputar NIB</h2>
<h3>Apakah NIB wajib untuk semua jenis usaha?</h3>
<p>Ya, semua pelaku usaha — dari UMK hingga perusahaan besar — wajib memiliki NIB sebagai legalitas dasar menjalankan usaha.</p>
<h3>Apakah NIB berlaku selamanya?</h3>
<p>Ya, NIB berlaku selama usaha tetap berjalan dan tidak ada perubahan data yang belum dilaporkan.</p>
<h3>Apakah NIB sama dengan SIUP?</h3>
<p>Berbeda. NIB adalah identitas pelaku usaha, sedangkan SIUP adalah izin operasional perdagangan. Untuk banyak bidang usaha, fungsi SIUP kini sudah tercakup dalam NIB berbasis risiko.</p>
<h3>Apakah NIB bisa berubah?</h3>
<p>Bisa. Perubahan data usaha (alamat, KBLI, modal, dsb.) dapat dilakukan melalui menu perubahan di sistem OSS.</p>
<h3>Apakah NIB bisa diurus sendiri?</h3>
<p>Bisa, melalui oss.go.id secara gratis. Namun jika ingin praktis dan bebas salah input, tim IzinPro siap membantu prosesnya sampai terbit.</p>
<h3>Apa yang harus dilakukan jika data NIB salah?</h3>
<p>Segera lakukan perbaikan data melalui sistem OSS, atau hubungi tim IzinPro untuk didampingi proses koreksinya.</p>
`.trim(),
    "panduan-lengkap-mengurus-nib-melalui-oss": `
<h2>Apa itu NIB?</h2>
<p>NIB (Nomor Induk Berusaha) adalah identitas resmi pelaku usaha yang diterbitkan oleh pemerintah melalui sistem OSS (Online Single Submission). NIB berlaku sebagai Tanda Daftar Perusahaan (TDP), Angka Pengenal Importir (API), dan akses kepabeanan dalam satu nomor identitas.</p>
<h2>Syarat Mengurus NIB</h2>
<p>Siapkan dokumen dan data berikut sebelum memulai pendaftaran NIB melalui OSS.</p>
<div data-type="card-grid" data-items='[{"icon":"id-card","title":"KTP Penanggung Jawab","description":"KTP masih berlaku."},{"icon":"file-check","title":"NPWP (Jika ada)","description":"Lampirkan NPWP perusahaan atau pribadi."},{"icon":"mail","title":"Email Aktif","description":"Digunakan untuk verifikasi dan notifikasi."},{"icon":"smartphone","title":"Nomor Handphone Aktif","description":"Untuk menerima kode OTP."},{"icon":"network","title":"Aktivitas Usaha","description":"Tentukan jenis dan bidang usaha Anda."},{"icon":"house","title":"Alamat Usaha","description":"Alamat lengkap sesuai dokumen legal."}]' class="not-prose my-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"><div class="flex h-full flex-col items-center rounded-xl border border-gray-200 px-3 py-4 text-center"><div class="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M16 10h2"></path><path d="M16 14h2"></path><path d="M6.17 15a3 3 0 0 1 5.66 0"></path><circle cx="9" cy="11" r="2"></circle><rect x="2" y="5" width="20" height="14" rx="2"></rect></svg></div><p class="mt-2 text-xs font-bold text-gray-900">KTP Penanggung Jawab</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">KTP masih berlaku.</p></div><div class="flex h-full flex-col items-center rounded-xl border border-gray-200 px-3 py-4 text-center"><div class="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="m9 15 2 2 4-4"></path></svg></div><p class="mt-2 text-xs font-bold text-gray-900">NPWP (Jika ada)</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Lampirkan NPWP perusahaan atau pribadi.</p></div><div class="flex h-full flex-col items-center rounded-xl border border-gray-200 px-3 py-4 text-center"><div class="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg></div><p class="mt-2 text-xs font-bold text-gray-900">Email Aktif</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Digunakan untuk verifikasi dan notifikasi.</p></div><div class="flex h-full flex-col items-center rounded-xl border border-gray-200 px-3 py-4 text-center"><div class="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg></div><p class="mt-2 text-xs font-bold text-gray-900">Nomor Handphone Aktif</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Untuk menerima kode OTP.</p></div><div class="flex h-full flex-col items-center rounded-xl border border-gray-200 px-3 py-4 text-center"><div class="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><path d="M12 12V8"></path></svg></div><p class="mt-2 text-xs font-bold text-gray-900">Aktivitas Usaha</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Tentukan jenis dan bidang usaha Anda.</p></div><div class="flex h-full flex-col items-center rounded-xl border border-gray-200 px-3 py-4 text-center"><div class="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></div><p class="mt-2 text-xs font-bold text-gray-900">Alamat Usaha</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Alamat lengkap sesuai dokumen legal.</p></div></div>
<h2>Langkah Mengurus NIB Melalui OSS</h2>
<p>Ikuti langkah-langkah berikut untuk mendapatkan NIB dengan mudah.</p>
<div data-type="step-list" data-items='[{"icon":"user-plus","title":"Buat Akun OSS","description":"Kunjungi oss.go.id dan daftar akun baru."},{"icon":"log-in","title":"Login ke OSS","description":"Login menggunakan email dan password yang telah didaftarkan."},{"icon":"file-text","title":"Lengkapi Data","description":"Isi data pelaku usaha, data usaha, dan data penanggung jawab."},{"icon":"list-checks","title":"Pilih KBLI","description":"Pilih Kode KBLI sesuai dengan bidang usaha Anda."},{"icon":"file-check","title":"Perizinan Berusaha","description":"Pilih jenis perizinan yang dibutuhkan (NIB, Izin Usaha, atau Izin Komersial)."},{"icon":"badge-check","title":"Cek &amp; Terbitkan NIB","description":"Periksa data yang telah diisi. Jika sudah benar, NIB akan terbit secara otomatis."}]' class="not-prose my-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6"><div class="relative flex flex-col items-center text-center"><div class="absolute left-[calc(50%+1.875rem)] right-[calc(-50%+1.875rem)] top-[1.375rem] hidden -translate-y-1/2 items-center lg:flex" aria-hidden="true"><span class="flex-1 border-t-2 border-dashed border-primary/40"></span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="-ml-1.5 shrink-0 text-primary/60"><path d="m9 18 6-6-6-6"></path></svg></div><div class="relative"><span class="grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg></span><span class="absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">1</span></div><p class="mt-2 text-xs font-bold text-gray-900">Buat Akun OSS</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Kunjungi oss.go.id dan daftar akun baru.</p></div><div class="relative flex flex-col items-center text-center"><div class="absolute left-[calc(50%+1.875rem)] right-[calc(-50%+1.875rem)] top-[1.375rem] hidden -translate-y-1/2 items-center lg:flex" aria-hidden="true"><span class="flex-1 border-t-2 border-dashed border-primary/40"></span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="-ml-1.5 shrink-0 text-primary/60"><path d="m9 18 6-6-6-6"></path></svg></div><div class="relative"><span class="grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg></span><span class="absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">2</span></div><p class="mt-2 text-xs font-bold text-gray-900">Login ke OSS</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Login menggunakan email dan password yang telah didaftarkan.</p></div><div class="relative flex flex-col items-center text-center"><div class="absolute left-[calc(50%+1.875rem)] right-[calc(-50%+1.875rem)] top-[1.375rem] hidden -translate-y-1/2 items-center lg:flex" aria-hidden="true"><span class="flex-1 border-t-2 border-dashed border-primary/40"></span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="-ml-1.5 shrink-0 text-primary/60"><path d="m9 18 6-6-6-6"></path></svg></div><div class="relative"><span class="grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg></span><span class="absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">3</span></div><p class="mt-2 text-xs font-bold text-gray-900">Lengkapi Data</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Isi data pelaku usaha, data usaha, dan data penanggung jawab.</p></div><div class="relative flex flex-col items-center text-center"><div class="absolute left-[calc(50%+1.875rem)] right-[calc(-50%+1.875rem)] top-[1.375rem] hidden -translate-y-1/2 items-center lg:flex" aria-hidden="true"><span class="flex-1 border-t-2 border-dashed border-primary/40"></span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="-ml-1.5 shrink-0 text-primary/60"><path d="m9 18 6-6-6-6"></path></svg></div><div class="relative"><span class="grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><path d="m3 7 2 2 4-4"></path></svg></span><span class="absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">4</span></div><p class="mt-2 text-xs font-bold text-gray-900">Pilih KBLI</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Pilih Kode KBLI sesuai dengan bidang usaha Anda.</p></div><div class="relative flex flex-col items-center text-center"><div class="absolute left-[calc(50%+1.875rem)] right-[calc(-50%+1.875rem)] top-[1.375rem] hidden -translate-y-1/2 items-center lg:flex" aria-hidden="true"><span class="flex-1 border-t-2 border-dashed border-primary/40"></span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="-ml-1.5 shrink-0 text-primary/60"><path d="m9 18 6-6-6-6"></path></svg></div><div class="relative"><span class="grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="m9 15 2 2 4-4"></path></svg></span><span class="absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">5</span></div><p class="mt-2 text-xs font-bold text-gray-900">Perizinan Berusaha</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Pilih jenis perizinan yang dibutuhkan (NIB, Izin Usaha, atau Izin Komersial).</p></div><div class="relative flex flex-col items-center text-center"><div class="relative"><span class="grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg></span><span class="absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">6</span></div><p class="mt-2 text-xs font-bold text-gray-900">Cek &amp; Terbitkan NIB</p><p class="mt-1 text-[11px] leading-relaxed text-gray-500">Periksa data yang telah diisi. Jika sudah benar, NIB akan terbit secara otomatis.</p></div></div>
<h2>Biaya &amp; Waktu Proses</h2>
<div data-type="info-box" data-items='[{"label":"Biaya","value":"GRATIS","description":"Pendaftaran NIB melalui sistem OSS tidak dikenakan biaya apapun."},{"label":"Waktu Proses","value":"1–3 Hari Kerja","description":"Proses penerbitan NIB biasanya memakan waktu 1–3 hari kerja setelah semua data lengkap."}]' class="not-prose my-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><div class="rounded-xl border border-primary/20 bg-primary/5 p-4"><p class="text-xs font-medium text-gray-500">Biaya</p><p class="mt-1 text-lg font-bold text-primary">GRATIS</p><p class="mt-1 text-xs leading-relaxed text-gray-500">Pendaftaran NIB melalui sistem OSS tidak dikenakan biaya apapun.</p></div><div class="rounded-xl border border-primary/20 bg-primary/5 p-4"><p class="text-xs font-medium text-gray-500">Waktu Proses</p><p class="mt-1 text-lg font-bold text-primary">1–3 Hari Kerja</p><p class="mt-1 text-xs leading-relaxed text-gray-500">Proses penerbitan NIB biasanya memakan waktu 1–3 hari kerja setelah semua data lengkap.</p></div></div>
<h2>FAQ Seputar NIB</h2>
<div data-type="faq-list" data-items='[{"question":"Apakah NIB wajib untuk semua jenis usaha?","answer":"Ya. Setiap pelaku usaha, baik perorangan maupun badan usaha, wajib memiliki NIB sebagai identitas resmi untuk menjalankan kegiatan usaha secara legal di Indonesia."},{"question":"Apakah NIB berlaku selamanya?","answer":"Ya. NIB berlaku selama pelaku usaha masih menjalankan kegiatan usahanya dan tidak dicabut oleh pemerintah karena pelanggaran ketentuan."},{"question":"Apakah NIB sama dengan SIUP?","answer":"Tidak. NIB adalah identitas pelaku usaha, sedangkan SIUP adalah izin operasional perdagangan. Sejak berlakunya OSS, fungsi SIUP untuk sebagian besar usaha telah tergantikan oleh NIB dan perizinan berusaha berbasis risiko."},{"question":"Apakah NIB bisa berubah?","answer":"Bisa. Data NIB dapat diperbarui melalui sistem OSS apabila terjadi perubahan data usaha, misalnya perubahan alamat, bidang usaha (KBLI), atau penanggung jawab."},{"question":"Apakah NIB bisa diurus sendiri?","answer":"Bisa. Pendaftaran NIB dapat dilakukan sendiri melalui oss.go.id tanpa biaya. Namun jika ingin proses lebih cepat dan bebas kendala teknis, Anda dapat menggunakan jasa profesional seperti IzinPro."},{"question":"Apa yang harus dilakukan jika data NIB salah?","answer":"Segera lakukan perbaikan data melalui menu perubahan di sistem OSS. Pastikan seluruh data sesuai dokumen legal agar tidak menghambat proses perizinan berikutnya."}]' class="not-prose my-4 divide-y divide-gray-200 rounded-xl border border-gray-200"><details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900">Apakah NIB wajib untuk semua jenis usaha?<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-gray-400 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"></path></svg></summary><p class="mt-2 text-xs leading-relaxed text-gray-500">Ya. Setiap pelaku usaha, baik perorangan maupun badan usaha, wajib memiliki NIB sebagai identitas resmi untuk menjalankan kegiatan usaha secara legal di Indonesia.</p></details><details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900">Apakah NIB berlaku selamanya?<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-gray-400 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"></path></svg></summary><p class="mt-2 text-xs leading-relaxed text-gray-500">Ya. NIB berlaku selama pelaku usaha masih menjalankan kegiatan usahanya dan tidak dicabut oleh pemerintah karena pelanggaran ketentuan.</p></details><details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900">Apakah NIB sama dengan SIUP?<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-gray-400 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"></path></svg></summary><p class="mt-2 text-xs leading-relaxed text-gray-500">Tidak. NIB adalah identitas pelaku usaha, sedangkan SIUP adalah izin operasional perdagangan. Sejak berlakunya OSS, fungsi SIUP untuk sebagian besar usaha telah tergantikan oleh NIB dan perizinan berusaha berbasis risiko.</p></details><details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900">Apakah NIB bisa berubah?<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-gray-400 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"></path></svg></summary><p class="mt-2 text-xs leading-relaxed text-gray-500">Bisa. Data NIB dapat diperbarui melalui sistem OSS apabila terjadi perubahan data usaha, misalnya perubahan alamat, bidang usaha (KBLI), atau penanggung jawab.</p></details><details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900">Apakah NIB bisa diurus sendiri?<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-gray-400 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"></path></svg></summary><p class="mt-2 text-xs leading-relaxed text-gray-500">Bisa. Pendaftaran NIB dapat dilakukan sendiri melalui oss.go.id tanpa biaya. Namun jika ingin proses lebih cepat dan bebas kendala teknis, Anda dapat menggunakan jasa profesional seperti IzinPro.</p></details><details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900">Apa yang harus dilakukan jika data NIB salah?<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-gray-400 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"></path></svg></summary><p class="mt-2 text-xs leading-relaxed text-gray-500">Segera lakukan perbaikan data melalui menu perubahan di sistem OSS. Pastikan seluruh data sesuai dokumen legal agar tidak menghambat proses perizinan berikutnya.</p></details></div>
`.trim(),
    "legalitas-lengkap-bisnis-makin-terpercaya": `
<h2>Mengapa Legalitas Usaha Itu Penting?</h2>
<p>Dengan legalitas yang lengkap, bisnis Anda akan lebih kredibel, terhindar dari risiko hukum, dan membuka lebih banyak peluang, seperti akses pendanaan, kemitraan, dan tender proyek.</p>
<ul>
<li><p>Menambah kepercayaan pelanggan &amp; mitra</p></li>
<li><p>Memenuhi persyaratan tender &amp; kerjasama</p></li>
<li><p>Menghindari sanksi &amp; masalah hukum</p></li>
<li><p>Mendukung pertumbuhan bisnis jangka panjang</p></li>
</ul>
<h2>Legalitas Usaha yang Kami Tangani</h2>
<ul>
<li><p><strong>Pendirian PT</strong> — Dirikan PT secara legal dan profesional.</p></li>
<li><p><strong>NIB (Nomor Induk Berusaha)</strong> — Langkah awal legalitas melalui sistem OSS.</p></li>
<li><p><strong>Izin Usaha</strong> — Berbagai jenis izin usaha sesuai bidang bisnis Anda.</p></li>
<li><p><strong>Izin Komersial &amp; Operasional</strong> — Untuk kegiatan komersial dan operasional perusahaan.</p></li>
<li><p><strong>Sertifikat Standar (SS)</strong> — Sertifikat standar untuk meningkatkan kredibilitas produk/jasa.</p></li>
<li><p><strong>Izin Impor</strong> — Urus izin impor dengan mudah dan sesuai regulasi.</p></li>
<li><p><strong>Izin Lingkungan</strong> — Dokumen lingkungan untuk menjamin kelestarian dan kepatuhan.</p></li>
<li><p><strong>Perizinan Lainnya</strong> — Berbagai perizinan lain sesuai kebutuhan bisnis Anda.</p></li>
</ul>
<h2>Proses Layanan Kami</h2>
<ol>
<li><p><strong>Konsultasi</strong> — Sampaikan kebutuhan legalitas usaha Anda.</p></li>
<li><p><strong>Analisis Kebutuhan</strong> — Kami analisis jenis legalitas yang dibutuhkan.</p></li>
<li><p><strong>Pengumpulan Data</strong> — Siapkan dan kumpulkan dokumen yang diperlukan.</p></li>
<li><p><strong>Proses Pengurusan</strong> — Kami urus legalitas Anda hingga selesai.</p></li>
<li><p><strong>Dokumen Terbit</strong> — Legalitas terbit dan siap digunakan.</p></li>
<li><p><strong>Pendampingan</strong> — Kami dampingi hingga legalitas aktif &amp; sesuai.</p></li>
</ol>
<h2>Mengapa Memilih IzinPro?</h2>
<ul>
<li><p><strong>Tim Profesional &amp; Berpengalaman</strong> — Berpengalaman mengurus ribuan legalitas usaha berbagai bidang.</p></li>
<li><p><strong>Proses Cepat &amp; Efisien</strong> — Proses pengurusan cepat, efisien, dan tepat waktu.</p></li>
<li><p><strong>Aman &amp; Terpercaya</strong> — Dokumen dijamin resmi, aman, dan sesuai regulasi.</p></li>
<li><p><strong>Konsultasi Gratis</strong> — Konsultasi gratis untuk semua kebutuhan legalitas Anda.</p></li>
<li><p><strong>Harga Transparan</strong> — Biaya jelas, tanpa biaya tambahan tersembunyi.</p></li>
</ul>
<h2>FAQ Seputar Legalitas Usaha</h2>
<h3>Apa saja legalitas usaha yang wajib dimiliki?</h3>
<p>Minimal setiap usaha wajib memiliki NIB sebagai identitas pelaku usaha. Selebihnya tergantung jenis dan skala bisnis — misalnya akta pendirian untuk badan usaha, izin usaha sesuai bidang, sertifikat standar, hingga izin komersial &amp; operasional.</p>
<h3>Apakah legalitas berlaku di seluruh Indonesia?</h3>
<p>Ya. Legalitas yang diterbitkan melalui sistem OSS berlaku secara nasional. Namun beberapa kegiatan usaha tertentu tetap memerlukan izin tambahan dari pemerintah daerah setempat.</p>
<h3>Berapa lama proses pengurusan legalitas usaha?</h3>
<p>Tergantung jenis legalitasnya — NIB bisa terbit dalam hitungan hari, sedangkan pendirian PT lengkap dengan izin turunannya umumnya membutuhkan 1–2 minggu selama dokumen persyaratan lengkap.</p>
<h3>Apakah saya perlu datang ke kantor?</h3>
<p>Tidak perlu. Seluruh proses dapat dilakukan secara online — mulai dari konsultasi, pengumpulan dokumen, hingga penerbitan legalitas. Tim kami akan memandu Anda di setiap tahap.</p>
<h3>Apakah bisa mengurus legalitas jika usaha masih baru?</h3>
<p>Sangat bisa. Justru sebaiknya legalitas diurus sejak awal usaha berdiri agar bisnis berjalan aman, kredibel, dan siap mengambil peluang kerjasama maupun pendanaan.</p>
<h3>Bagaimana jika dokumen usaha saya belum lengkap?</h3>
<p>Tidak masalah. Tim kami akan membantu meninjau dokumen yang sudah ada, memberi tahu kekurangannya, dan mendampingi Anda melengkapinya hingga proses pengurusan bisa berjalan.</p>
`.trim(),
    "apa-itu-oss-penjelasan-lengkap": `
<h2>Apa itu OSS?</h2>
<p>OSS (Online Single Submission) adalah sistem perizinan berusaha terintegrasi yang dikelola oleh Kementerian Investasi/BKPM. Melalui OSS, pelaku usaha bisa mengurus berbagai jenis perizinan — mulai dari NIB, izin usaha, hingga izin komersial atau operasional — dalam satu platform online, tanpa perlu datang ke banyak instansi berbeda.</p>
<p>Sistem ini menerapkan pendekatan perizinan berbasis risiko (risk-based approach), di mana jenis dan jumlah izin yang dibutuhkan sebuah usaha disesuaikan dengan tingkat risiko kegiatan usahanya — rendah, menengah, atau tinggi.</p>
<h2>Manfaat OSS bagi Pelaku Usaha</h2>
<ul>
<li><p><strong>Proses Lebih Cepat</strong> — Tidak perlu mengurus izin satu per satu ke berbagai instansi.</p></li>
<li><p><strong>Transparan</strong> — Status dan progres perizinan dapat dipantau langsung secara online.</p></li>
<li><p><strong>Terintegrasi</strong> — Data usaha tersimpan dalam satu sistem dan dapat digunakan untuk berbagai jenis perizinan.</p></li>
<li><p><strong>Berlaku Nasional</strong> — Perizinan yang terbit melalui OSS diakui di seluruh wilayah Indonesia.</p></li>
</ul>
<h2>Cara Kerja Sistem OSS</h2>
<p>Secara umum, alur penggunaan OSS dimulai dari pembuatan akun, pengisian data pelaku usaha dan data usaha (termasuk kode KBLI sesuai bidang usaha), hingga penerbitan dokumen perizinan berbasis tingkat risiko usaha yang terdeteksi otomatis oleh sistem.</p>
<p>Setelah data lengkap dan sesuai, OSS akan menerbitkan NIB sebagai identitas dasar pelaku usaha, yang kemudian dapat dilanjutkan dengan izin usaha atau izin komersial/operasional sesuai kebutuhan.</p>
<h2>Siapa yang Wajib Menggunakan OSS?</h2>
<p>Seluruh pelaku usaha di Indonesia — baik perorangan (UMK) maupun badan usaha seperti PT dan CV — wajib mendaftarkan usahanya melalui OSS untuk mendapatkan NIB dan perizinan berusaha yang sah.</p>
<h2>Perizinan Apa Saja yang Bisa Diurus Lewat OSS?</h2>
<ul>
<li><p><strong>NIB (Nomor Induk Berusaha)</strong> — Identitas dasar pelaku usaha.</p></li>
<li><p><strong>Izin Usaha</strong> — Izin untuk menjalankan kegiatan usaha sesuai bidangnya.</p></li>
<li><p><strong>Izin Komersial &amp; Operasional</strong> — Izin tambahan sebelum usaha mulai beroperasi secara komersial.</p></li>
<li><p><strong>Sertifikat Standar</strong> — Untuk usaha dengan tingkat risiko menengah hingga tinggi.</p></li>
</ul>
<h2>FAQ Seputar OSS</h2>
<h3>Apakah pendaftaran di OSS berbayar?</h3>
<p>Tidak. Pendaftaran akun dan penerbitan NIB melalui OSS tidak dikenakan biaya apapun.</p>
<h3>Apakah OSS bisa diakses kapan saja?</h3>
<p>Ya. OSS dapat diakses secara online 24 jam melalui oss.go.id menggunakan perangkat apa saja yang terhubung internet.</p>
<h3>Apa bedanya OSS dengan NIB?</h3>
<p>OSS adalah sistemnya, sedangkan NIB adalah salah satu dokumen yang diterbitkan melalui sistem OSS. Selain NIB, OSS juga menerbitkan izin usaha dan izin komersial/operasional.</p>
<h3>Apakah saya perlu bantuan profesional untuk mengurus OSS?</h3>
<p>Tidak wajib, karena OSS bisa diurus sendiri secara gratis. Namun jika ingin memastikan data terisi tepat dan proses berjalan lancar tanpa kendala teknis, Anda bisa menggunakan bantuan tim profesional seperti IzinPro.</p>
`.trim(),
  };

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

  /* Tag (v2.2.8) — dipakai admin CRUD blog baru (TagPicker), belum ada
   * data tag sama sekali sebelumnya. 2 tag dilekatkan per artikel biar
   * picker & tampilan publik ada contoh isinya sejak awal. */
  const BLOG_TAG_NAMES = ["NIB", "OSS", "PT", "CV", "Legalitas", "Perizinan", "UMKM", "Pajak"];
  const tagIdByName: Record<string, string> = {};
  for (const name of BLOG_TAG_NAMES) {
    const created = await prisma.tag.create({ data: { name, slug: slugify(name) } });
    tagIdByName[name] = created.id;
  }

  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const post = BLOG_POSTS[i];
    const createdPost = await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        // Belum ada body artikel lengkap utk sisa post — pakai excerpt sbg
        // placeholder sampai konten asli tersedia (lihat RICH_BLOG_CONTENT
        // utk 4 artikel yg sudah punya konten asli/lengkap).
        content: RICH_BLOG_CONTENT[post.slug] ?? post.excerpt,
        detailContent: richDetailBuilders[post.slug]?.(),
        categoryId: categoryIdByName[post.category],
        authorId: admin.id,
        views: parseViews(post.views),
        status: "PUBLISHED",
        publishedAt: parseIndoDate(post.date),
        updatedById: admin.id,
      },
    });
    const tagNames = [
      BLOG_TAG_NAMES[i % BLOG_TAG_NAMES.length],
      BLOG_TAG_NAMES[(i + 3) % BLOG_TAG_NAMES.length],
    ];
    for (const tagName of tagNames) {
      await prisma.postTag.create({
        data: { postId: createdPost.id, tagId: tagIdByName[tagName] },
      });
    }
  }
  console.log(
    `${blogCategoryNames.length} Category + ${BLOG_TAG_NAMES.length} Tag + ${BLOG_POSTS.length} BlogPost di-seed.`,
  );

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
