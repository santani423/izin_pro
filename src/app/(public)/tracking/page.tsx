import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import TrackingFormSection from "@/components/sections/TrackingFormSection";
import TrackingHeroVisual from "@/components/sections/TrackingHeroVisual";

/* ─── Lazy load sections below the fold ─── */
const TrackingInfoSection = dynamic(
  () => import("@/components/sections/TrackingInfoSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Tracking Perizinan — Lacak Status Order Anda",
  description:
    "Pantau status pengurusan perizinan Anda di IzinPro secara real-time. Masukkan nomor order untuk melihat proses perizinan sudah sampai tahap mana.",
  alternates: {
    canonical: "https://izinpro.co.id/tracking",
  },
};

/* ─── Halaman Tracking Perizinan ───
 * ?code=TRX-... (dari section tracking homepage / link WhatsApp) langsung
 * dilacak otomatis begitu halaman dimuat. */
export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Tracking" }]}
        title={
          <>
            Tracking <span className="text-primary">Perizinan</span>
          </>
        }
        description="Pantau status pengurusan perizinan Anda secara transparan. Masukkan kode transaksi untuk melihat prosesnya sudah sampai tahap mana."
        imageLabel="Ilustrasi pemantauan status perizinan"
        imageContent={<TrackingHeroVisual />}
        overlap
      />

      {/* 2. Form lacak + hasil timeline */}
      <TrackingFormSection initialCode={code} />

      {/* 3. Cara kerja */}
      <TrackingInfoSection />

      {/* 4. CTA Banner */}
      <CtaSection
        title="Tidak Menemukan Nomor Order Anda?"
        subtitle="Hubungi tim kami — kami bantu cek status perizinan Anda secara langsung."
      />
    </>
  );
}
