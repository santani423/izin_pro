/* ─── Hydrasi AboutPageContent (DB) -> props section /tentang-kami ───
 * stats/values nyimpen ikon sbg string key (Json gak bisa nyimpen komponen
 * React) — fungsi di sini convert balik jadi LucideIcon SEBELUM dikirim ke
 * komponen section, mirip pola hydrate-layanan-detail.ts. Judul dua-warna
 * tetap 2 field terpisah (title + titleHighlight) — urutan/posisi highlight
 * di JSX tetap jadi urusan masing-masing komponen section (fixed template,
 * bukan generic builder), bukan urusan fungsi ini. */
import type { LucideIcon } from "lucide-react";
import type { AboutPageContent } from "@prisma/client";
import { resolveDetailIcon } from "@/lib/detail-icons";
import { pickLocalizedText } from "@/lib/locale-field";
import type { Locale } from "@/i18n/config";

export interface AboutHero {
  kicker: string | null;
  title: string;
  titleHighlight: string;
  subtitleBold: string;
  subtitleBody: string;
  imageUrl: string | null;
}

export interface AboutStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export interface AboutSection {
  kicker: string;
  title: string;
  titleHighlight: string;
  paragraphs: string[];
  imageUrl: string | null;
  stats: AboutStat[];
}

export interface AboutValueItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface AboutValues {
  enabled: boolean;
  title: string;
  titleHighlight: string;
  subtitle: string;
  items: AboutValueItem[];
}

export interface AboutVisiMisi {
  enabled: boolean;
  vision: string;
  visionImageUrl: string;
  mission: string[];
  missionImageUrl: string | null;
}

export interface AboutTeamSettings {
  enabled: boolean;
  title: string;
  titleHighlight: string;
  subtitle: string;
}

export interface HydratedAboutContent {
  hero: AboutHero;
  about: AboutSection;
  values: AboutValues;
  visiMisi: AboutVisiMisi;
  team: AboutTeamSettings;
}

/** Ilustrasi bawaan skyline Visi — bukan gradient, ini bagian desain asli
 * yang harus tetap tampil kalau admin belum unggah gambar sendiri. */
export const DEFAULT_VISION_IMAGE_URL = "/images/tentang-skyline-v3.png";

interface RawStat {
  icon: string;
  value: string;
  label: string;
}
interface RawStatLang {
  value: string;
  label: string;
}

interface RawValue {
  icon: string;
  title: string;
  description: string;
}
interface RawValueLang {
  title: string;
  description: string;
}

/** Fallback per-index (bukan per-array) — badge/nilai yang belum
 * diterjemahkan tetap tampil Bahasa Indonesia, bukan seluruh larik balik ke
 * default. Sama pola dgn pickHighlights() di (public)/page.tsx. */
function pickStringArray(base: string[], variant: string[] | null): string[] {
  if (!variant) return base;
  return base.map((b, i) => (variant[i]?.trim() ? variant[i] : b));
}

function pickStats(base: RawStat[], variant: RawStatLang[] | null): AboutStat[] {
  return base.map((b, i) => ({
    icon: resolveDetailIcon(b.icon),
    value: variant?.[i]?.value?.trim() ? variant[i].value : b.value,
    label: variant?.[i]?.label?.trim() ? variant[i].label : b.label,
  }));
}

function pickValues(base: RawValue[], variant: RawValueLang[] | null): AboutValueItem[] {
  return base.map((b, i) => ({
    icon: resolveDetailIcon(b.icon),
    title: variant?.[i]?.title?.trim() ? variant[i].title : b.title,
    description: variant?.[i]?.description?.trim() ? variant[i].description : b.description,
  }));
}

export function hydrateAboutContent(content: AboutPageContent, locale: Locale): HydratedAboutContent {
  const rawStats = content.stats as unknown as RawStat[];
  const rawValues = content.values as unknown as RawValue[];
  const statsVariant = (locale === "en" ? content.statsEn : locale === "zh" ? content.statsZh : null) as unknown as RawStatLang[] | null;
  const valuesVariant = (locale === "en" ? content.valuesEn : locale === "zh" ? content.valuesZh : null) as unknown as RawValueLang[] | null;
  const paragraphsVariant = (locale === "en" ? content.aboutParagraphsEn : locale === "zh" ? content.aboutParagraphsZh : null) as string[] | null;
  const missionVariant = (locale === "en" ? content.missionEn : locale === "zh" ? content.missionZh : null) as string[] | null;

  return {
    hero: {
      kicker: pickLocalizedText(content.heroKicker ?? "", content.heroKickerEn, content.heroKickerZh, locale) || null,
      title: pickLocalizedText(content.heroTitle, content.heroTitleEn, content.heroTitleZh, locale),
      titleHighlight: pickLocalizedText(content.heroTitleHighlight, content.heroTitleHighlightEn, content.heroTitleHighlightZh, locale),
      subtitleBold: pickLocalizedText(content.heroSubtitleBold, content.heroSubtitleBoldEn, content.heroSubtitleBoldZh, locale),
      subtitleBody: pickLocalizedText(content.heroSubtitleBody, content.heroSubtitleBodyEn, content.heroSubtitleBodyZh, locale),
      imageUrl: content.heroImageUrl,
    },
    about: {
      kicker: pickLocalizedText(content.aboutKicker, content.aboutKickerEn, content.aboutKickerZh, locale),
      title: pickLocalizedText(content.aboutTitle, content.aboutTitleEn, content.aboutTitleZh, locale),
      titleHighlight: pickLocalizedText(content.aboutTitleHighlight, content.aboutTitleHighlightEn, content.aboutTitleHighlightZh, locale),
      paragraphs: pickStringArray(content.aboutParagraphs as string[], paragraphsVariant),
      imageUrl: content.aboutImageUrl,
      stats: pickStats(rawStats, statsVariant),
    },
    values: {
      enabled: content.valuesEnabled,
      title: pickLocalizedText(content.valuesTitle, content.valuesTitleEn, content.valuesTitleZh, locale),
      titleHighlight: pickLocalizedText(content.valuesTitleHighlight, content.valuesTitleHighlightEn, content.valuesTitleHighlightZh, locale),
      subtitle: pickLocalizedText(content.valuesSubtitle, content.valuesSubtitleEn, content.valuesSubtitleZh, locale),
      items: pickValues(rawValues, valuesVariant),
    },
    visiMisi: {
      enabled: content.visiMisiEnabled,
      vision: pickLocalizedText(content.vision, content.visionEn, content.visionZh, locale),
      visionImageUrl: content.visionImageUrl ?? DEFAULT_VISION_IMAGE_URL,
      mission: pickStringArray(content.mission as string[], missionVariant),
      missionImageUrl: content.missionImageUrl,
    },
    team: {
      enabled: content.teamEnabled,
      title: pickLocalizedText(content.teamTitle, content.teamTitleEn, content.teamTitleZh, locale),
      titleHighlight: pickLocalizedText(content.teamTitleHighlight, content.teamTitleHighlightEn, content.teamTitleHighlightZh, locale),
      subtitle: pickLocalizedText(content.teamSubtitle, content.teamSubtitleEn, content.teamSubtitleZh, locale),
    },
  };
}
