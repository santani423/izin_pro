import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import LayananDetailHeroSection from "@/components/sections/LayananDetailHeroSection";
import LayananDetailAboutSection from "@/components/sections/LayananDetailAboutSection";
import LayananDetailBenefitsSection from "@/components/sections/LayananDetailBenefitsSection";
import LayananDetailTypesSection from "@/components/sections/LayananDetailTypesSection";
import { SERVICES } from "@/lib/constants";
import { getLayananDetail } from "@/lib/layanan-detail";

/* ─── Lazy load sections below the fold ─── */
const LayananDetailProcessSection = dynamic(
  () => import("@/components/sections/LayananDetailProcessSection"),
);
const LayananDetailPricingSection = dynamic(
  () => import("@/components/sections/LayananDetailPricingSection"),
);
const LayananDetailTestimonialsSection = dynamic(
  () => import("@/components/sections/LayananDetailTestimonialsSection"),
);
const LayananDetailFaqSection = dynamic(
  () => import("@/components/sections/LayananDetailFaqSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = getLayananDetail(slug);
  if (!detail) return { title: "Layanan Tidak Ditemukan" };

  return {
    title: `${detail.title} — ${detail.tagline}`,
    description: detail.description,
    alternates: {
      canonical: `https://izinpro.co.id/layanan/${slug}`,
    },
  };
}

/* ─── Halaman Detail Layanan (desain baru) ─── */
export default async function LayananDetailPage({ params }: Props) {
  const { slug } = await params;
  const detail = getLayananDetail(slug);
  if (!detail) notFound();

  return (
    <>
      {/* 1. Hero + breadcrumb + statistik */}
      <LayananDetailHeroSection detail={detail} />

      {/* 2. Apa itu layanan ini */}
      <LayananDetailAboutSection about={detail.about} />

      {/* 3. Keuntungan / manfaat (opsional) */}
      {detail.benefits && (
        <LayananDetailBenefitsSection benefits={detail.benefits} />
      )}

      {/* 4. Jenis layanan yang ditangani (opsional) */}
      {detail.types && <LayananDetailTypesSection types={detail.types} />}

      {/* 5. Alur proses */}
      <LayananDetailProcessSection process={detail.process} />

      {/* 6. Paket harga + dokumen + waktu pengerjaan (opsional) */}
      {detail.packages && (
        <LayananDetailPricingSection
          title={detail.title}
          packages={detail.packages}
        />
      )}

      {/* 7. Testimoni klien */}
      <LayananDetailTestimonialsSection testimonials={detail.testimonials} />

      {/* 8. FAQ seputar layanan */}
      <LayananDetailFaqSection faqs={detail.faqs} />

      {/* 9. CTA Banner */}
      <CtaSection title={detail.cta?.title} subtitle={detail.cta?.subtitle} />
    </>
  );
}
