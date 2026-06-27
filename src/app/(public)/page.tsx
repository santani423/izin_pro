import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import AboutSection from "@/components/sections/AboutSection";
import StatsSection from "@/components/sections/StatsSection";
import PromoSection from "@/components/sections/PromoSection";

/* ─── Lazy load sections below the fold ─── */
const BlogSection = dynamic(() => import("@/components/sections/BlogSection"));
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"));
const VideoTestimonialsSection = dynamic(() => import("@/components/sections/VideoTestimonialsSection"));
const ClientsSection = dynamic(() => import("@/components/sections/ClientsSection"));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection"));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));
const CtaBannerSection = dynamic(() => import("@/components/sections/CtaBannerSection"));

export const metadata: Metadata = {
  title: "IzinPro — Solusi Perizinan Bisnis Terpercaya di Indonesia",
  description:
    "Urus perizinan usaha dengan mudah, cepat, dan legal bersama tim profesional IzinPro. Pendirian PT, NIB, Izin Usaha, dan lebih banyak layanan perizinan.",
  alternates: {
    canonical: "https://izinpro.co.id",
  },
};

/* ─── Halaman Beranda ─── */
export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Layanan */}
      <ServicesSection />

      {/* 3. Tentang Kami */}
      <AboutSection />

      {/* 4. Kenapa Kami / Statistik */}
      <StatsSection />

      {/* 5. Promo */}
      <PromoSection />

      {/* 6. Artikel */}
      <BlogSection />

      {/* 7. Testimoni */}
      <TestimonialsSection />

      {/* 8. Video Testimoni */}
      <VideoTestimonialsSection />

      {/* 9. Klien Kami */}
      <ClientsSection />

      {/* 10. FAQ */}
      <FaqSection />

      {/* 11. Kontak & Lokasi */}
      <ContactSection />

      {/* 12. CTA Banner */}
      <CtaBannerSection />
    </>
  );
}
