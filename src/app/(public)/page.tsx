import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import PromoSection from "@/components/sections/PromoSection";
import AboutSection from "@/components/sections/AboutSection";
import { getPublicTestimonials } from "@/lib/testimonials-data";
import { getPublicBlogPosts } from "@/lib/blog-data";

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

/* ─── Halaman Beranda (desain baru) ─── */
export default async function HomePage() {
  const { textTestimonials, videoTestimonials } = await getPublicTestimonials();
  const blogPosts = (await getPublicBlogPosts()).slice(0, 4);

  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Daftar Layanan */}
      <ServicesSection />

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
