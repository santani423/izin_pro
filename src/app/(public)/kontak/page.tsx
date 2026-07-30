import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import KontakInfoBar from "@/components/sections/KontakInfoBar";
import KontakFormSection from "@/components/sections/KontakFormSection";
import { prisma } from "@/lib/db";
import { hydrateKontakContent } from "@/lib/hydrate-kontak-content";

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

/* ─── Halaman Kontak (desain baru) — seluruh konten dikelola admin di /kontak ─── */
export default async function KontakPage() {
  const [rawContent, faqRows, services] = await Promise.all([
    prisma.kontakPageContent.findUniqueOrThrow({ where: { id: "1" } }),
    prisma.faq.findMany({
      where: { scope: "KONTAK", isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.service.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const content = hydrateKontakContent(rawContent);
  const faqs = faqRows.map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
        kicker={content.hero.kicker ?? undefined}
        title={
          <>
            {content.hero.title} <span className="text-primary">{content.hero.titleHighlight}</span>
          </>
        }
        description={content.hero.description}
        imageUrl={content.hero.imageUrl}
        imageLabel="Foto customer service IzinPro siap membantu"
        overlap
      />

      {/* 2. Bar info kontak */}
      <KontakInfoBar items={content.infoCards} />

      {/* 3. Form + informasi kontak */}
      <KontakFormSection
        title={content.form.title}
        subtitle={content.form.subtitle}
        sidebarTitle={content.form.sidebarTitle}
        sidebarSubtitle={content.form.sidebarSubtitle}
        channels={content.form.channels}
        services={services}
      />

      {/* 4. Lokasi kantor — peta + kartu alamat */}
      <KontakLocationSection title={content.location.title} mapsEmbedUrl={content.location.mapsEmbedUrl} />

      {/* 5. FAQ singkat + kartu bantuan */}
      <KontakFaqSection
        titlePrefix={content.faq.titlePrefix}
        titleHighlight={content.faq.titleHighlight}
        faqs={faqs}
        helpCard={content.faq.helpCard}
      />

      {/* 6. CTA Banner */}
      <CtaSection />
    </>
  );
}
