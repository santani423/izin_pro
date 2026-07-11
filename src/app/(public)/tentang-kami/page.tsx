import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import HighlightsBar from "@/components/shared/HighlightsBar";
import TentangAboutSection from "@/components/sections/TentangAboutSection";
import { LAYANAN_HIGHLIGHTS } from "@/lib/layanan";

/* ─── Lazy load sections below the fold ─── */
const TentangValuesSection = dynamic(
  () => import("@/components/sections/TentangValuesSection"),
);
const TentangVisiMisiSection = dynamic(
  () => import("@/components/sections/TentangVisiMisiSection"),
);
const TentangTeamSection = dynamic(
  () => import("@/components/sections/TentangTeamSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Tentang IzinPro — Solusi Perizinan Terpercaya",
  description:
    "Kenali IzinPro — penyedia jasa perizinan usaha terpercaya di Indonesia dengan 10+ tahun pengalaman, 5.000+ perizinan selesai, dan tim profesional berpengalaman.",
  alternates: {
    canonical: "https://izinpro.co.id/tentang-kami",
  },
};

/* ─── Halaman Tentang IzinPro (desain baru) ─── */
export default function TentangKamiPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Tentang Kami" }]}
        title={
          <>
            Tentang <span className="text-primary">IzinPro</span>
          </>
        }
        description={
          <>
            <strong className="block text-base font-bold text-foreground sm:text-lg">
              Solusi Perizinan Terpercaya untuk Mendukung Pertumbuhan Bisnis
              Anda
            </strong>
            <span className="mt-3 block">
              IzinPro hadir untuk memberikan layanan perizinan usaha yang
              mudah, cepat, transparan, dan legal. Kami berkomitmen menjadi
              partner terbaik bagi setiap pelaku bisnis dalam mewujudkan
              legalitas usaha yang aman dan berkelanjutan.
            </span>
          </>
        }
        imageLabel="Foto kantor resepsionis IzinPro"
        overlap
      />

      {/* 2. Highlight keunggulan */}
      <HighlightsBar items={LAYANAN_HIGHLIGHTS} />

      {/* 3. Tentang kami + statistik */}
      <TentangAboutSection />

      {/* 4. Nilai-nilai */}
      <TentangValuesSection />

      {/* 5. Visi & Misi */}
      <TentangVisiMisiSection />

      {/* 6. Tim profesional */}
      <TentangTeamSection />

      {/* 7. CTA Banner */}
      <CtaSection
        title="Butuh Bantuan Perizinan untuk Bisnis Anda?"
        subtitle="Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami."
      />
    </>
  );
}
