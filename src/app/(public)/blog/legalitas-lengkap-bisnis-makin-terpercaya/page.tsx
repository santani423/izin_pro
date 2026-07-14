import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PanduanLegalitasHeroSection from "@/components/sections/PanduanLegalitasHeroSection";
import PanduanLegalitasBodySection from "@/components/sections/PanduanLegalitasBodySection";

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Legalitas Lengkap, Bisnis Makin Terpercaya",
  description:
    "Miliki semua legalitas usaha yang dibutuhkan untuk menjalankan bisnis secara aman, profesional, dan dipercaya klien maupun mitra. Konsultasi gratis bersama IzinPro.",
  alternates: {
    canonical: "https://izinpro.co.id/blog/legalitas-lengkap-bisnis-makin-terpercaya",
  },
};

/* ─── Halaman Legalitas Lengkap, Bisnis Makin Terpercaya (desain baru) ─── */
export default function PanduanLegalitasPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb + CTA */}
      <PanduanLegalitasHeroSection />

      {/* 2. Konten panduan legalitas & sidebar */}
      <PanduanLegalitasBodySection />

      {/* 3. CTA Banner */}
      <CtaSection
        title="Legalitas Lengkap, Bisnis Makin Terpercaya!"
        subtitle="Percayakan semua urusan legalitas usaha Anda kepada tim profesional kami."
      />
    </>
  );
}
