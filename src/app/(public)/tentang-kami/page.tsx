import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import PageHero from "@/components/shared/PageHero";
import HighlightsBar from "@/components/shared/HighlightsBar";
import TentangAboutSection from "@/components/sections/TentangAboutSection";
import { LAYANAN_HIGHLIGHTS } from "@/lib/layanan";
import { prisma } from "@/lib/db";
import { hydrateAboutContent } from "@/lib/hydrate-about-content";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { pickLocalizedText, getLocalizedCta } from "@/lib/locale-field";
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
  const locale = await getLocale();
  const content = await getAboutPageContent();
  if (!content) return { title: getDictionary(locale).pages.tentangKami.notFoundTitle };

  const metaTitle = pickLocalizedText(content.metaTitle ?? "", content.metaTitleEn, content.metaTitleZh, locale);
  const metaDescription = pickLocalizedText(content.metaDescription ?? "", content.metaDescriptionEn, content.metaDescriptionZh, locale);
  const heroTitle = pickLocalizedText(content.heroTitle, content.heroTitleEn, content.heroTitleZh, locale);
  const heroTitleHighlight = pickLocalizedText(content.heroTitleHighlight, content.heroTitleHighlightEn, content.heroTitleHighlightZh, locale);
  const heroSubtitleBody = pickLocalizedText(content.heroSubtitleBody, content.heroSubtitleBodyEn, content.heroSubtitleBodyZh, locale);

  return {
    title: metaTitle || `${heroTitle} ${heroTitleHighlight}`,
    description: metaDescription || heroSubtitleBody,
    alternates: {
      canonical: "https://izinpro.co.id/tentang-kami",
    },
  };
}

/* ─── Halaman Tentang IzinPro (desain baru) ─── */
export default async function TentangKamiPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const content = await getAboutPageContent();
  if (!content) notFound();
  const hydrated = hydrateAboutContent(content, locale);

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
    role: pickLocalizedText(m.role, m.roleEn, m.roleZh, locale),
    photoUrl: m.photoMedia?.url ?? null,
    linkedinUrl: m.linkedinUrl,
  }));

  const { hero, about, values, visiMisi, team } = hydrated;

  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: dict.common.breadcrumbHome, href: "/" }, { label: dict.pages.tentangKami.breadcrumbTentangKami }]}
        ariaBreadcrumb={dict.common.ariaBreadcrumb}
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
        imageLabel={dict.pages.tentangKami.imageLabel}
        imageUrl={hero.imageUrl}
        overlap
      />

      {/* 2. Highlight keunggulan */}
      <HighlightsBar
        items={LAYANAN_HIGHLIGHTS.map((h, i) => ({ ...h, label: dict.layananCatalog.highlights[i] ?? h.label }))}
        ariaLabel={dict.layananCatalog.highlightsAriaLabel}
      />

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
      <CtaSection {...getLocalizedCta(cta, locale)} />
    </>
  );
}
