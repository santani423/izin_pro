import type { Metadata } from "next";
import dynamic from "next/dynamic";
import LayananHeroSection from "@/components/sections/LayananHeroSection";
import LayananHighlightsSection from "@/components/sections/LayananHighlightsSection";
import LayananCatalogSection from "@/components/sections/LayananCatalogSection";

/* ─── Lazy load sections below the fold ─── */
const LayananConsultSection = dynamic(
  () => import("@/components/sections/LayananConsultSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Daftar Layanan Perizinan Bisnis",
  description:
    "Berbagai layanan perizinan untuk mendukung legalitas dan kelancaran bisnis Anda — Pendirian PT, NIB, Izin Usaha, Sertifikasi, hingga Perizinan Impor. Cepat, legal, dan transparan.",
  alternates: {
    canonical: "https://izinpro.co.id/layanan",
  },
};

/* ─── Halaman Daftar Layanan (desain baru) ─── */
export default function LayananPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <LayananHeroSection />

      {/* 2. Highlight keunggulan */}
      <LayananHighlightsSection />

      {/* 3. Katalog layanan + filter kategori */}
      <LayananCatalogSection />

      {/* 4. Banner konsultasi */}
      <LayananConsultSection />

      {/* 5. CTA Banner */}
      <CtaSection />
    </>
  );
}
