import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection, { DEFAULT_HERO_CONTENT, type HeroContentData } from "@/components/sections/HeroSection";
import ServicesSection, { type ServiceCardData } from "@/components/sections/ServicesSection";
import PromoSection from "@/components/sections/PromoSection";
import AboutSection from "@/components/sections/AboutSection";
import { getPublicTestimonials } from "@/lib/testimonials-data";
import { getPublicBlogPosts } from "@/lib/blog-data";
import { prisma } from "@/lib/db";

/* ─── Lazy load sections below the fold ─── */
const ArticlesSection = dynamic(() => import("@/components/sections/ArticlesSection"));
const LocationSection = dynamic(() => import("@/components/sections/LocationSection"));
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"));
const VideoTestimonialsSection = dynamic(() => import("@/components/sections/VideoTestimonialsSection"));
const ClientsSection = dynamic(() => import("@/components/sections/ClientsSection"));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection"));
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "IzinPro — Solusi Perizinan Bisnis Terpercaya di Indonesia",
  description:
    "Urus perizinan usaha dengan mudah, cepat, dan legal bersama tim profesional IzinPro. Pendirian PT, NIB, Izin Usaha, dan lebih banyak layanan perizinan.",
  alternates: {
    canonical: "https://izinpro.co.id",
  },
};

/* Baris HeroContent selalu ada dari seed/migration — findUnique (bukan
 * findUniqueOrThrow) + fallback ke DEFAULT_HERO_CONTENT tetap dipasang biar
 * beranda gak pernah crash/kosong kalau baris itu somehow hilang. */
async function getHeroContent(): Promise<HeroContentData> {
  const hero = await prisma.heroContent.findUnique({ where: { id: "1" } });
  if (!hero) return DEFAULT_HERO_CONTENT;
  return {
    titleLine1: hero.titleLine1,
    titleHighlight: hero.titleHighlight,
    titleLine3: hero.titleLine3,
    subtitle: hero.subtitle,
    highlights: hero.highlights as { title: string; subtitle: string }[],
    ctaPrimaryLabel: hero.ctaPrimaryLabel,
    ctaSecondaryLabel: hero.ctaSecondaryLabel,
    ctaSecondaryHref: hero.ctaSecondaryHref,
    imageUrl: hero.heroImageUrl,
  };
}

/* 5 layanan pertama (urut sortOrder dari admin) buat kartu "Daftar Layanan"
 * di beranda — sama kayak kurasi LANDING_SERVICES sebelumnya, cuma sekarang
 * beneran dari Prisma (termasuk gambar titel kalau admin pasang). */
async function getHomeServices(): Promise<ServiceCardData[]> {
  const services = await prisma.service.findMany({
    where: { deletedAt: null, isActive: true },
    include: { featuredMedia: { select: { url: true } } },
    orderBy: { sortOrder: "asc" },
    take: 5,
  });
  return services.map((s) => ({
    id: s.id,
    icon: s.icon,
    title: s.title,
    description: s.description,
    href: `/layanan/${s.slug}`,
    imageUrl: s.featuredMedia?.url ?? null,
  }));
}

/* ─── Halaman Beranda (desain baru) ─── */
export default async function HomePage() {
  const [heroContent, homeServices, { textTestimonials, videoTestimonials }] = await Promise.all([
    getHeroContent(),
    getHomeServices(),
    getPublicTestimonials(),
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

      {/* 6. Lokasi Kami */}
      <LocationSection />

      {/* 7. Testimoni Klien */}
      <TestimonialsSection testimonials={textTestimonials} />

      {/* 8. Video Testimoni */}
      <VideoTestimonialsSection videos={videoTestimonials} />

      {/* 9. Klien Kami */}
      <ClientsSection />

      {/* 10. FAQ */}
      <FaqSection />

      {/* 11. CTA Banner */}
      <CtaSection />
    </>
  );
}
