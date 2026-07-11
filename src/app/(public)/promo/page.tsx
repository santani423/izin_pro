import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import HighlightsBar from "@/components/shared/HighlightsBar";
import PromoPackagesSection from "@/components/sections/PromoPackagesSection";
import LayananDetailProcessSection from "@/components/sections/LayananDetailProcessSection";
import { PROMO_HIGHLIGHTS, PROMO_STEPS } from "@/lib/promo";

/* ─── Lazy load sections below the fold ─── */
const PromoCountdownSection = dynamic(
  () => import("@/components/sections/PromoCountdownSection"),
);
const PromoWhySection = dynamic(
  () => import("@/components/sections/PromoWhySection"),
);
const PromoConsultSection = dynamic(
  () => import("@/components/sections/PromoConsultSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Promosi Spesial Layanan Perizinan",
  description:
    "Penawaran terbaik IzinPro — paket promo Pendirian PT, Izin Usaha, dan Perizinan Lengkap dengan harga hemat, proses cepat, dan 100% legal.",
  alternates: {
    canonical: "https://izinpro.co.id/promo",
  },
};

/* ─── Halaman Promo (desain baru) ─── */
export default function PromoPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Promo" }]}
        title={
          <>
            Promosi <span className="text-primary">Spesial</span>
          </>
        }
        description="Penawaran terbaik untuk membantu bisnis Anda tumbuh dengan legalitas yang lengkap dan profesional."
        imageLabel="Ilustrasi kado promo spesial IzinPro"
        overlap
      />

      {/* 2. Highlight keunggulan */}
      <HighlightsBar
        items={PROMO_HIGHLIGHTS}
        ariaLabel="Keunggulan promo IzinPro"
      />

      {/* 3. Paket promo pilihan */}
      <PromoPackagesSection />

      {/* 4. Countdown diskon */}
      <PromoCountdownSection />

      {/* 5. Kenapa pilih promo */}
      <PromoWhySection />

      {/* 6. Cara mendapatkan promo */}
      <LayananDetailProcessSection
        process={{ title: "Cara Mendapatkan Promo", steps: PROMO_STEPS }}
      />

      {/* 7. Banner ajakan klaim promo */}
      <PromoConsultSection />

      {/* 8. CTA Banner */}
      <CtaSection
        title="Butuh Bantuan Memilih Promo yang Tepat?"
        subtitle="Tim kami siap membantu Anda menemukan solusi terbaik untuk bisnis Anda."
        buttonLabel="Chat Konsultasi Gratis"
      />
    </>
  );
}
