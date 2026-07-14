import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PanduanNibHeroSection from "@/components/sections/PanduanNibHeroSection";
import PanduanNibBodySection from "@/components/sections/PanduanNibBodySection";

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Panduan Lengkap Mengurus NIB Melalui OSS",
  description:
    "Dapatkan NIB (Nomor Induk Berusaha) dengan mudah, cepat, dan legal melalui sistem OSS. Pelajari syarat, langkah, biaya, dan waktu proses pengurusan NIB di sini.",
  alternates: {
    canonical: "https://izinpro.co.id/blog/panduan-lengkap-mengurus-nib-melalui-oss",
  },
};

/* ─── Halaman Panduan Lengkap Mengurus NIB Melalui OSS (desain baru) ─── */
export default function PanduanNibPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb + meta penulis */}
      <PanduanNibHeroSection />

      {/* 2. Ringkasan, konten panduan & sidebar */}
      <PanduanNibBodySection />

      {/* 3. CTA Banner */}
      <CtaSection
        title="Ingin Proses Lebih Cepat & Tanpa Ribet?"
        subtitle="Serahkan pengurusan NIB Anda kepada tim profesional kami. Lebih hemat waktu, aman, dan pasti selesai."
      />
    </>
  );
}
