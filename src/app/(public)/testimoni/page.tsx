import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import TestimoniStatsBar from "@/components/sections/TestimoniStatsBar";
import TestimoniGridSection from "@/components/sections/TestimoniGridSection";

/* ─── Lazy load sections below the fold (reuse dari homepage) ─── */
const VideoTestimonialsSection = dynamic(
  () => import("@/components/sections/VideoTestimonialsSection"),
);
const ClientsSection = dynamic(
  () => import("@/components/sections/ClientsSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Testimoni Klien IzinPro",
  description:
    "Kepercayaan dan kepuasan klien adalah prioritas kami. Simak pengalaman nyata klien yang telah menggunakan layanan perizinan IzinPro.",
  alternates: {
    canonical: "https://izinpro.co.id/testimoni",
  },
};

/* ─── Halaman Testimoni Klien (desain baru) ─── */
export default function TestimoniPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Testimoni" }]}
        title={
          <>
            Testimoni <span className="text-primary">Klien</span>
          </>
        }
        description="Kepercayaan dan kepuasan klien adalah prioritas kami. Berikut pengalaman mereka bersama IzinPro."
        imageLabel="Foto klien IzinPro yang puas dengan layanan"
        overlap
      />

      {/* 2. Bar statistik */}
      <TestimoniStatsBar />

      {/* 3. Grid testimoni + filter kategori */}
      <TestimoniGridSection />

      {/* 4. Video testimoni (reuse homepage) */}
      <VideoTestimonialsSection />

      {/* 5. Klien kami (reuse homepage) */}
      <ClientsSection />

      {/* 6. CTA Banner */}
      <CtaSection />
    </>
  );
}
