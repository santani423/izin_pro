/* ─── Helper bersama: LayananDetail (mock, ikon = komponen) -> ServiceDetailContent
 * (bentuk Json Prisma, ikon = string key) ───
 * Dipakai prisma/seed.ts (install baru) & prisma/seed-service-detail-content.ts
 * (backfill satu-kali) — satu sumber konversi, gak nyalin logic dua kali. */
import type { LucideIcon } from "lucide-react";
import { DETAIL_ICONS } from "../src/lib/detail-icons";
import type { LayananDetail } from "../src/lib/layanan-detail";
import type { ServiceDetailContent } from "../src/lib/types/service-detail-content";

const REVERSE_ICON_MAP = new Map<LucideIcon, string>(
  Object.entries(DETAIL_ICONS).map(([key, icon]) => [icon, key] as const),
);

function iconKey(icon: LucideIcon): string {
  return REVERSE_ICON_MAP.get(icon) ?? "file-text";
}

/** "Rp 3.500.000" -> 3500000 */
export function parsePriceToNumber(price: string): number {
  const digits = price.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

export function toServiceDetailContent(detail: LayananDetail): ServiceDetailContent {
  return {
    kicker: detail.kicker,
    tagline: detail.tagline,
    heroDescription: detail.description,
    highlights: detail.highlights.map((h) => ({ icon: iconKey(h.icon), label: h.label })),
    stats: detail.stats.map((s) => ({
      icon: iconKey(s.icon),
      value: s.value,
      label: s.label,
      withStars: s.withStars,
    })),
    about: {
      title: detail.about.title,
      paragraphs: detail.about.paragraphs,
      checklist: detail.about.checklist,
      imageLabel: detail.about.imageLabel,
      badge: detail.about.badge,
    },
    benefits: detail.benefits
      ? {
          title: detail.benefits.title,
          items: detail.benefits.items.map((b) => ({
            icon: iconKey(b.icon),
            title: b.title,
            description: b.description,
          })),
        }
      : undefined,
    types: detail.types
      ? {
          title: detail.types.title,
          items: detail.types.items.map((t) => ({ title: t.title, description: t.description })),
          linkLabel: detail.types.linkLabel,
          linkHref: detail.types.linkHref,
        }
      : undefined,
    process: {
      title: detail.process.title,
      steps: detail.process.steps.map((s) => ({
        icon: iconKey(s.icon),
        title: s.title,
        description: s.description,
      })),
    },
    packagesTitle: detail.packages?.title,
    documents: detail.packages?.documents,
    duration: detail.packages?.duration,
    testimonialsHelp: detail.testimonials.help,
    faqsTitle: detail.faqs.title,
    cta: detail.cta,
  };
}
