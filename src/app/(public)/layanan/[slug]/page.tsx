import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import LayananDetailHeroSection from "@/components/sections/LayananDetailHeroSection";
import LayananDetailAboutSection from "@/components/sections/LayananDetailAboutSection";
import LayananDetailBenefitsSection from "@/components/sections/LayananDetailBenefitsSection";
import LayananDetailTypesSection from "@/components/sections/LayananDetailTypesSection";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hydrateLayananDetail } from "@/lib/hydrate-layanan-detail";
import type { Role } from "@prisma/client";

/* ─── Lazy load sections below the fold ─── */
const LayananDetailProcessSection = nextDynamic(
  () => import("@/components/sections/LayananDetailProcessSection"),
);
const LayananDetailPricingSection = nextDynamic(
  () => import("@/components/sections/LayananDetailPricingSection"),
);
const LayananDetailTestimonialsSection = nextDynamic(
  () => import("@/components/sections/LayananDetailTestimonialsSection"),
);
const LayananDetailFaqSection = nextDynamic(
  () => import("@/components/sections/LayananDetailFaqSection"),
);
const CtaSection = nextDynamic(() => import("@/components/sections/CtaSection"));

const PREVIEW_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

/* Cek DRAFT-vs-PUBLISHED cuma manggil headers()/session KALAU statusnya
 * DRAFT — krn dynamic API itu manggilnya kondisional, Next.js bisa salah
 * nge-cache halaman ini sbg statis dari request pertama yg PUBLISHED (gak
 * pernah kepanggil headers()), bikin toggle ke DRAFT belakangan gak
 * ke-enforce ke pengunjung anonim. force-dynamic matiin caching itu sama
 * sekali biar gating publish/unpublish selalu di-re-evaluasi tiap request. */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { slug: true },
  });
  return services.map((s) => ({ slug: s.slug }));
}

/* Dipakai generateMetadata & halaman itu sendiri — satu query, gak dobel
 * hit DB (Next.js dedup fetch requests dalam satu render, tapi Prisma call
 * biasa gak otomatis dedup, jadi baca sekali lalu pakai bareng). */
async function getServiceForDetail(slug: string) {
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      featuredMedia: { select: { url: true } },
      packages: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
  if (!service || service.deletedAt) return null;

  if (service.status === "DRAFT") {
    const session = await auth.api.getSession({ headers: await headers() });
    const role = session?.user.role as Role | undefined;
    if (!role || !PREVIEW_ROLES.includes(role)) return null;
  }

  return service;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceForDetail(slug);
  if (!service) return { title: "Layanan Tidak Ditemukan" };

  return {
    title: service.metaTitle ?? service.title,
    description: service.metaDescription ?? service.description,
    alternates: {
      canonical: `https://izinpro.co.id/layanan/${slug}`,
    },
  };
}

/* ─── Halaman Detail Layanan (desain baru) ─── */
export default async function LayananDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceForDetail(slug);
  if (!service) notFound();

  const [faqs, testimonials, ctaDefault] = await Promise.all([
    prisma.faq.findMany({
      where: {
        isActive: true,
        OR: [{ scope: "SERVICE", serviceId: service.id }, { scope: "GLOBAL" }],
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.testimonial.findMany({
      where: { categoryId: service.categoryId, isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.cta.findUnique({ where: { location: "DETAIL_LAYANAN" } }),
  ]);

  const detail = hydrateLayananDetail(service, service.packages, faqs, testimonials, ctaDefault);

  return (
    <>
      {/* 1. Hero + breadcrumb + statistik */}
      <LayananDetailHeroSection detail={detail} />

      {/* 2. Apa itu layanan ini */}
      <LayananDetailAboutSection about={detail.about} imageUrl={detail.imageUrl} />

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
