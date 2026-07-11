import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import KontakInfoBar from "@/components/sections/KontakInfoBar";
import KontakFormSection from "@/components/sections/KontakFormSection";

/* ─── Lazy load sections below the fold ─── */
const KontakLocationSection = dynamic(
  () => import("@/components/sections/KontakLocationSection"),
);
const KontakFaqSection = dynamic(
  () => import("@/components/sections/KontakFaqSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Hubungi IzinPro — Konsultasi Perizinan Gratis",
  description:
    "Hubungi IzinPro melalui form, WhatsApp, email, atau datang langsung ke kantor kami di Tebet, Jakarta Selatan. Konsultasi perizinan gratis.",
  alternates: {
    canonical: "https://izinpro.co.id/kontak",
  },
};

/* ─── Halaman Kontak (desain baru) ─── */
export default function KontakPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
        title={
          <>
            Hubungi <span className="text-primary">IzinPro</span>
          </>
        }
        description="Kami siap membantu kebutuhan perizinan bisnis Anda. Hubungi kami melalui form, WhatsApp, email, atau datang langsung ke kantor kami."
        imageLabel="Foto customer service IzinPro siap membantu"
        overlap
      />

      {/* 2. Bar info kontak */}
      <KontakInfoBar />

      {/* 3. Form + informasi kontak */}
      <KontakFormSection />

      {/* 4. Lokasi kantor — peta + kartu alamat */}
      <KontakLocationSection />

      {/* 5. FAQ singkat + kartu bantuan */}
      <KontakFaqSection />

      {/* 6. CTA Banner */}
      <CtaSection />
    </>
  );
}
