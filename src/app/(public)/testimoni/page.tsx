import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import TestimoniStatsBar from "@/components/sections/TestimoniStatsBar";
import TestimoniGridSection from "@/components/sections/TestimoniGridSection";
import { getPublicTestimonials } from "@/lib/testimonials-data";
import { prisma } from "@/lib/db";
import { resolveDetailIcon } from "@/lib/detail-icons";

interface RawTestimoniStat {
  icon: string;
  value: string;
  label: string;
}

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
export default async function TestimoniPage() {
  const [{ gridTestimonials, videoTestimonials }, banner] = await Promise.all([
    getPublicTestimonials(),
    prisma.testimoniPageContent.findUniqueOrThrow({ where: { id: "1" } }),
  ]);
  const stats = (banner.stats as unknown as RawTestimoniStat[]).map((s) => ({
    icon: resolveDetailIcon(s.icon),
    value: s.value,
    label: s.label,
  }));

  return (
    <>
      {/* 1. Hero + breadcrumb — dikelola admin di /testimoni tab Banner */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Testimoni" }]}
        kicker={banner.heroKicker ?? undefined}
        title={
          <>
            {banner.heroTitle} <span className="text-primary">{banner.heroTitleHighlight}</span>
          </>
        }
        description={banner.heroDescription}
        imageUrl={banner.heroImageUrl}
        imageLabel="Foto klien IzinPro yang puas dengan layanan"
        overlap
      />

      {/* 2. Bar statistik — dikelola admin di /testimoni tab Banner */}
      <TestimoniStatsBar stats={stats} />

      {/* 3. Grid testimoni + filter kategori */}
      <TestimoniGridSection testimonials={gridTestimonials} />

      {/* 4. Video testimoni (reuse homepage) */}
      <VideoTestimonialsSection videos={videoTestimonials} />

      {/* 5. Klien kami (reuse homepage) */}
      <ClientsSection />

      {/* 6. CTA Banner */}
      <CtaSection />
    </>
  );
}
