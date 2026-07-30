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

interface RawValue {
  icon: string;
  title: string;
  description: string;
}

export function hydrateAboutContent(content: AboutPageContent): HydratedAboutContent {
  const rawStats = content.stats as unknown as RawStat[];
  const rawValues = content.values as unknown as RawValue[];

  return {
    hero: {
      kicker: content.heroKicker,
      title: content.heroTitle,
      titleHighlight: content.heroTitleHighlight,
      subtitleBold: content.heroSubtitleBold,
      subtitleBody: content.heroSubtitleBody,
      imageUrl: content.heroImageUrl,
    },
    about: {
      kicker: content.aboutKicker,
      title: content.aboutTitle,
      titleHighlight: content.aboutTitleHighlight,
      paragraphs: content.aboutParagraphs as string[],
      imageUrl: content.aboutImageUrl,
      stats: rawStats.map((s) => ({ icon: resolveDetailIcon(s.icon), value: s.value, label: s.label })),
    },
    values: {
      enabled: content.valuesEnabled,
      title: content.valuesTitle,
      titleHighlight: content.valuesTitleHighlight,
      subtitle: content.valuesSubtitle,
      items: rawValues.map((v) => ({ icon: resolveDetailIcon(v.icon), title: v.title, description: v.description })),
    },
    visiMisi: {
      enabled: content.visiMisiEnabled,
      vision: content.vision,
      visionImageUrl: content.visionImageUrl ?? DEFAULT_VISION_IMAGE_URL,
      mission: content.mission as string[],
      missionImageUrl: content.missionImageUrl,
    },
    team: {
      enabled: content.teamEnabled,
      title: content.teamTitle,
      titleHighlight: content.teamTitleHighlight,
      subtitle: content.teamSubtitle,
    },
  };
}
