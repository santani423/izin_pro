import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection, { type ServiceCardData } from "@/components/sections/ServicesSection";
import PromoSection from "@/components/sections/PromoSection";
import AboutSection from "@/components/sections/AboutSection";
import type { VideoDialogSource } from "@/components/shared/VideoDialog";
import { DEFAULT_HERO_CONTENT, type HeroContentData, DEFAULT_ABOUT_HOME_CONTENT, type AboutHomeContentData } from "@/lib/home-content";
import { getPublicTestimonials } from "@/lib/testimonials-data";
import { getPublicPromos } from "@/lib/promo-data";
import { getPublicBlogPosts } from "@/lib/blog-data";
import { prisma } from "@/lib/db";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";
import { pickLocalizedText } from "@/lib/locale-field";
import { extractYoutubeEmbedUrl } from "@/lib/youtube";
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

/* Fallback per-index (bukan per-array) — sama pola dgn pickHighlights() di
 * atas, dipakai utk AboutHomeContent.points. */
function pickStringArray(base: string[], en: string[] | null, zh: string[] | null, locale: Locale): string[] {
  const variant = locale === "en" ? en : locale === "zh" ? zh : null;
  if (!variant) return base;
  return base.map((b, i) => (variant[i]?.trim() ? variant[i] : b));
}

/* Baris AboutHomeContent selalu ada dari seed/migration — findUnique
 * (bukan findUniqueOrThrow) + fallback ke DEFAULT_ABOUT_HOME_CONTENT tetap
 * dipasang biar beranda gak pernah crash/kosong. Video: YouTube (link
 * ditempel admin dikonversi ke embed, fallback ke video default kalau
 * link kosong/invalid) atau file upload (dipakai apa adanya). */
async function getAboutHomeContent(locale: Locale): Promise<AboutHomeContentData> {
  const about = await prisma.aboutHomeContent.findUnique({ where: { id: "1" } });
  if (!about) return DEFAULT_ABOUT_HOME_CONTENT;

  const defaultEmbedUrl =
    DEFAULT_ABOUT_HOME_CONTENT.video.type === "youtube" ? DEFAULT_ABOUT_HOME_CONTENT.video.embedUrl : "";
  const video: VideoDialogSource =
    about.videoSource === "UPLOAD" && about.videoUploadUrl
      ? { type: "upload", url: about.videoUploadUrl }
      : {
          type: "youtube",
          embedUrl: (about.videoYoutubeUrl && extractYoutubeEmbedUrl(about.videoYoutubeUrl)) || defaultEmbedUrl,
        };

  return {
    heading: pickLocalizedText(about.heading, about.headingEn, about.headingZh, locale),
    description: pickLocalizedText(about.description, about.descriptionEn, about.descriptionZh, locale),
    points: pickStringArray(
      about.points as string[],
      about.pointsEn as string[] | null,
      about.pointsZh as string[] | null,
      locale,
    ),
    buttonLabel: pickLocalizedText(about.buttonLabel, about.buttonLabelEn, about.buttonLabelZh, locale),
    buttonHref: about.buttonHref,
    videoTitle: pickLocalizedText(about.videoTitle, about.videoTitleEn, about.videoTitleZh, locale),
    video,
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
  const [heroContent, aboutHomeContent, homeServices, homePromos, { textTestimonials, videoTestimonials }, { operatingHours, phoneDisplay, email, address, mapsUrl, mapsEmbedUrl }] = await Promise.all([
    getHeroContent(locale),
    getAboutHomeContent(locale),
    getHomeServices(locale),
    getPublicPromos(locale),
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
      <PromoSection promos={homePromos} />

      {/* 4. Tentang IzinPro */}
      <AboutSection content={aboutHomeContent} />

      {/* 5. Artikel Terbaru */}
      <ArticlesSection posts={blogPosts} />

      {/* 6. Lacak Layanan */}
      <TrackHomeSection />

      {/* 7. Lokasi Kami */}
      <LocationSection
        operatingHours={operatingHours}
        phone={phoneDisplay}
        email={email}
        address={address}
        mapsUrl={mapsUrl}
        mapsEmbedUrl={mapsEmbedUrl}
      />

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
