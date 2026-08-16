import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection, { DEFAULT_HERO_CONTENT, type HeroContentData } from "@/components/sections/HeroSection";
import ServicesSection, { type ServiceCardData } from "@/components/sections/ServicesSection";
import PromoSection from "@/components/sections/PromoSection";
import AboutSection from "@/components/sections/AboutSection";
import { getPublicTestimonials } from "@/lib/testimonials-data";
import { getPublicBlogPosts } from "@/lib/blog-data";
import { prisma } from "@/lib/db";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";
import { pickLocalizedText } from "@/lib/locale-field";
import type { Locale } from "@/i18n/config";

/* ─── Lazy load sections below the fold ─── */
const ArticlesSection = dynamic(() => import("@/components/sections/ArticlesSection"));
const TrackHomeSection = dynamic(() => import("@/components/sections/TrackHomeSection"));
const LocationSection = dynamic(() => import("@/components/sections/LocationSection"));
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"));
const VideoTestimonialsSection = dynamic(() => import("@/components/sections/VideoTestimonialsSection"));
const ClientsSection = dynamic(() => import("@/components/sections/ClientsSection"));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection"));
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    title: dict.pages.home.metaTitle,
    description: dict.pages.home.metaDescription,
    alternates: {
      canonical: "https://izinpro.co.id",
    },
  };
}

/* Fallback per-badge (bukan per-array) kalau admin baru isi sebagian badge
 * highlight EN/ZH — badge yang belum diterjemahkan tetap tampil Bahasa
 * Indonesia, bukan seluruh array balik ke default. */
function pickHighlights(
  base: { title: string; subtitle: string }[],
  en: { title: string; subtitle: string }[] | null,
  zh: { title: string; subtitle: string }[] | null,
  locale: Locale,
) {
  const variant = locale === "en" ? en : locale === "zh" ? zh : null;
  if (!variant) return base;
  return base.map((b, i) => ({
    title: variant[i]?.title?.trim() ? variant[i].title : b.title,
    subtitle: variant[i]?.subtitle?.trim() ? variant[i].subtitle : b.subtitle,
  }));
}

/* Baris HeroContent selalu ada dari seed/migration — findUnique (bukan
 * findUniqueOrThrow) + fallback ke DEFAULT_HERO_CONTENT tetap dipasang biar
 * beranda gak pernah crash/kosong kalau baris itu somehow hilang.
 * *En/*Zh dipilih sesuai locale aktif, fallback per-field ke Bahasa
 * Indonesia kalau admin belum isi (lihat BerandaPageClient.tsx). */
async function getHeroContent(locale: Locale): Promise<HeroContentData> {
  const hero = await prisma.heroContent.findUnique({ where: { id: "1" } });
  if (!hero) return DEFAULT_HERO_CONTENT;
  return {
    titleLine1: pickLocalizedText(hero.titleLine1, hero.titleLine1En, hero.titleLine1Zh, locale),
    titleHighlight: pickLocalizedText(hero.titleHighlight, hero.titleHighlightEn, hero.titleHighlightZh, locale),
    titleLine3: pickLocalizedText(hero.titleLine3, hero.titleLine3En, hero.titleLine3Zh, locale),
    subtitle: pickLocalizedText(hero.subtitle, hero.subtitleEn, hero.subtitleZh, locale),
    highlights: pickHighlights(
      hero.highlights as { title: string; subtitle: string }[],
      hero.highlightsEn as { title: string; subtitle: string }[] | null,
      hero.highlightsZh as { title: string; subtitle: string }[] | null,
      locale,
    ),
    ctaPrimaryLabel: pickLocalizedText(hero.ctaPrimaryLabel, hero.ctaPrimaryLabelEn, hero.ctaPrimaryLabelZh, locale),
    ctaSecondaryLabel: pickLocalizedText(hero.ctaSecondaryLabel, hero.ctaSecondaryLabelEn, hero.ctaSecondaryLabelZh, locale),
    ctaSecondaryHref: hero.ctaSecondaryHref,
    imageUrl: hero.heroImageUrl,
  };
}

/* 5 layanan pertama (urut sortOrder dari admin) buat kartu "Daftar Layanan"
 * di beranda — sama kayak kurasi LANDING_SERVICES sebelumnya, cuma sekarang
 * beneran dari Prisma (termasuk gambar titel kalau admin pasang). */
async function getHomeServices(locale: Locale): Promise<ServiceCardData[]> {
  const services = await prisma.service.findMany({
    where: { deletedAt: null, isActive: true },
    include: { featuredMedia: { select: { url: true } } },
    orderBy: { sortOrder: "asc" },
    take: 5,
  });
  return services.map((s) => ({
    id: s.id,
    icon: s.icon,
    title: pickLocalizedText(s.title, s.titleEn, s.titleZh, locale),
    description: pickLocalizedText(s.description, s.descriptionEn, s.descriptionZh, locale),
    href: `/layanan/${s.slug}`,
    imageUrl: s.featuredMedia?.url ?? null,
  }));
}

/* ─── Halaman Beranda (desain baru) ─── */
export default async function HomePage() {
  const locale = await getLocale();
  const [heroContent, homeServices, { textTestimonials, videoTestimonials }, { operatingHours }] = await Promise.all([
    getHeroContent(locale),
    getHomeServices(locale),
    getPublicTestimonials(),
    getLocalizedGeneralSettings(),
  ]);
  const blogPosts = (await getPublicBlogPosts()).slice(0, 4);

  return (
    <>
      {/* 1. Hero */}
      <HeroSection content={heroContent} />

      {/* 2. Daftar Layanan */}
      <ServicesSection services={homeServices} />

      {/* 3. Promo Spesial */}
      <PromoSection />

      {/* 4. Tentang IzinPro */}
      <AboutSection />

      {/* 5. Artikel Terbaru */}
      <ArticlesSection posts={blogPosts} />

      {/* 6. Lacak Layanan */}
      <TrackHomeSection />

      {/* 7. Lokasi Kami */}
      <LocationSection operatingHours={operatingHours} />

      {/* 8. Testimoni Klien */}
      <TestimonialsSection testimonials={textTestimonials} />

      {/* 9. Video Testimoni */}
      <VideoTestimonialsSection videos={videoTestimonials} />

      {/* 10. Klien Kami */}
      <ClientsSection />

      {/* 11. FAQ */}
      <FaqSection />

      {/* 12. CTA Banner */}
      <CtaSection />
    </>
  );
}
