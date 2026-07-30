import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import PageHero from "@/components/shared/PageHero";
import HighlightsBar from "@/components/shared/HighlightsBar";
import TentangAboutSection from "@/components/sections/TentangAboutSection";
import { LAYANAN_HIGHLIGHTS } from "@/lib/layanan";
import { prisma } from "@/lib/db";
import { hydrateAboutContent } from "@/lib/hydrate-about-content";
import type { TeamMemberCard } from "@/components/sections/TentangTeamSection";

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

/* Dipakai generateMetadata & halaman itu sendiri — satu query, gak dobel
 * hit DB (Next.js dedup fetch requests dalam satu render, tapi Prisma call
 * biasa gak otomatis dedup, jadi baca sekali lalu pakai bareng). */
async function getAboutPageContent() {
  return prisma.aboutPageContent.findUnique({ where: { id: "1" } });
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAboutPageContent();
  if (!content) return { title: "Tentang Kami" };

  return {
    title: content.metaTitle ?? `${content.heroTitle} ${content.heroTitleHighlight}`,
    description: content.metaDescription ?? content.heroSubtitleBody,
    alternates: {
      canonical: "https://izinpro.co.id/tentang-kami",
    },
  };
}

/* ─── Halaman Tentang IzinPro (desain baru) ─── */
export default async function TentangKamiPage() {
  const content = await getAboutPageContent();
  if (!content) notFound();
  const hydrated = hydrateAboutContent(content);

  const [teamMembers, cta] = await Promise.all([
    prisma.teamMember.findMany({
      where: { isActive: true, deletedAt: null },
      include: { photoMedia: { select: { url: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.cta.findUnique({ where: { location: "TENTANG_KAMI" } }),
  ]);

  const teamCards: TeamMemberCard[] = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    photoUrl: m.photoMedia?.url ?? null,
    linkedinUrl: m.linkedinUrl,
  }));

  const { hero, about, values, visiMisi, team } = hydrated;

  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Tentang Kami" }]}
        kicker={hero.kicker ?? undefined}
        title={
          <>
            {hero.title} <span className="text-primary">{hero.titleHighlight}</span>
          </>
        }
        description={
          <>
            <strong className="block text-base font-bold text-foreground sm:text-lg">
              {hero.subtitleBold}
            </strong>
            <span className="mt-3 block">{hero.subtitleBody}</span>
          </>
        }
        imageLabel="Foto kantor resepsionis IzinPro"
        imageUrl={hero.imageUrl}
        overlap
      />

      {/* 2. Highlight keunggulan */}
      <HighlightsBar items={LAYANAN_HIGHLIGHTS} />

      {/* 3. Tentang kami + statistik */}
      <TentangAboutSection content={about} />

      {/* 4. Nilai-nilai (opsional) */}
      {values.enabled && values.items.length > 0 && (
        <TentangValuesSection content={values} />
      )}

      {/* 5. Visi & Misi (opsional) */}
      {visiMisi.enabled && <TentangVisiMisiSection content={visiMisi} />}

      {/* 6. Tim profesional (opsional) */}
      {team.enabled && teamCards.length > 0 && (
        <TentangTeamSection settings={team} members={teamCards} />
      )}

      {/* 7. CTA Banner */}
      <CtaSection
        title={cta?.title}
        subtitle={cta?.subtitle ?? undefined}
        buttonLabel={cta?.buttonLabel ?? undefined}
      />
    </>
  );
}
