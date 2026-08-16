/* ─── Varian EN/ZH dari Service.detailContent (Json) ───
 * detailContent-nya sendiri berat & bersarang (lihat
 * src/lib/types/service-detail-content.ts) — daripada bikin puluhan kolom
 * scalar terpisah kayak AboutPageContent, EN/ZH-nya disimpan sebagai SATU
 * kolom Json lain per bahasa (`detailContentEn`/`detailContentZh`) berisi
 * "deep partial" dari bentuk yang sama. Admin cuma perlu isi field yang mau
 * diterjemahkan — field yang dikosongkan otomatis fallback ke Bahasa
 * Indonesia per-field (bukan per-section), lewat pickServiceDetailContent()
 * di bawah. Icon/href/withStars/linkHref TIDAK per-bahasa (ikut base). */
import type {
  ServiceDetailContent,
  ServiceDetailHighlight,
  ServiceDetailStat,
  ServiceDetailAbout,
  ServiceDetailBenefitItem,
  ServiceDetailBenefits,
  ServiceDetailTypeItem,
  ServiceDetailTypes,
  ServiceDetailProcessStep,
  ServiceDetailProcess,
  ServiceDetailDocuments,
  ServiceDetailDuration,
  ServiceDetailTestimonialsHelp,
  ServiceDetailCta,
} from "@/lib/types/service-detail-content";
import type { Locale } from "@/i18n/config";

export interface ServiceDetailHighlightLang {
  label?: string;
}
export interface ServiceDetailStatLang {
  value?: string;
  label?: string;
}
export interface ServiceDetailAboutLang {
  title?: string;
  paragraphs?: string[];
  checklist?: string[];
  imageLabel?: string;
  badge?: string;
}
export interface ServiceDetailBenefitItemLang {
  title?: string;
  description?: string;
}
export interface ServiceDetailBenefitsLang {
  title?: string;
  items?: ServiceDetailBenefitItemLang[];
}
export interface ServiceDetailTypeItemLang {
  title?: string;
  description?: string;
}
export interface ServiceDetailTypesLang {
  title?: string;
  items?: ServiceDetailTypeItemLang[];
  linkLabel?: string;
}
export interface ServiceDetailProcessStepLang {
  title?: string;
  description?: string;
}
export interface ServiceDetailProcessLang {
  title?: string;
  steps?: ServiceDetailProcessStepLang[];
}
export interface ServiceDetailDocumentsLang {
  title?: string;
  items?: string[];
}
export interface ServiceDetailDurationLang {
  value?: string;
  note?: string;
}
export interface ServiceDetailTestimonialsHelpLang {
  title?: string;
  description?: string;
}
export interface ServiceDetailCtaLang {
  title?: string;
  subtitle?: string;
}

/** Bentuk yang disimpan di kolom `detailContentEn`/`detailContentZh`. */
export interface ServiceDetailContentLang {
  kicker?: string;
  tagline?: string;
  heroDescription?: string;
  highlights?: ServiceDetailHighlightLang[];
  stats?: ServiceDetailStatLang[];
  about?: ServiceDetailAboutLang;
  benefits?: ServiceDetailBenefitsLang;
  types?: ServiceDetailTypesLang;
  process?: ServiceDetailProcessLang;
  packagesTitle?: string;
  documents?: ServiceDetailDocumentsLang;
  duration?: ServiceDetailDurationLang;
  testimonialsHelp?: ServiceDetailTestimonialsHelpLang;
  faqsTitle?: string;
  cta?: ServiceDetailCtaLang;
}

function pick(base: string, variant: string | undefined): string {
  return variant?.trim() ? variant : base;
}
function pickOpt(base: string | undefined, variant: string | undefined): string | undefined {
  return variant?.trim() ? variant : base;
}
function pickArr(base: string[], variant: string[] | undefined): string[] {
  if (!variant) return base;
  return base.map((b, i) => (variant[i]?.trim() ? variant[i] : b));
}

function pickHighlight(base: ServiceDetailHighlight, variant: ServiceDetailHighlightLang | undefined): ServiceDetailHighlight {
  return { ...base, label: pick(base.label, variant?.label) };
}
function pickStat(base: ServiceDetailStat, variant: ServiceDetailStatLang | undefined): ServiceDetailStat {
  return { ...base, value: pick(base.value, variant?.value), label: pick(base.label, variant?.label) };
}
function pickAbout(base: ServiceDetailAbout, variant: ServiceDetailAboutLang | undefined): ServiceDetailAbout {
  return {
    title: pick(base.title, variant?.title),
    paragraphs: pickArr(base.paragraphs, variant?.paragraphs),
    checklist: base.checklist ? pickArr(base.checklist, variant?.checklist) : undefined,
    imageLabel: pick(base.imageLabel, variant?.imageLabel),
    badge: pickOpt(base.badge, variant?.badge),
  };
}
function pickBenefitItem(base: ServiceDetailBenefitItem, variant: ServiceDetailBenefitItemLang | undefined): ServiceDetailBenefitItem {
  return { ...base, title: pick(base.title, variant?.title), description: pick(base.description, variant?.description) };
}
function pickBenefits(base: ServiceDetailBenefits | undefined, variant: ServiceDetailBenefitsLang | undefined): ServiceDetailBenefits | undefined {
  if (!base) return undefined;
  return {
    title: pick(base.title, variant?.title),
    items: base.items.map((b, i) => pickBenefitItem(b, variant?.items?.[i])),
  };
}
function pickTypeItem(base: ServiceDetailTypeItem, variant: ServiceDetailTypeItemLang | undefined): ServiceDetailTypeItem {
  return { title: pick(base.title, variant?.title), description: pick(base.description, variant?.description) };
}
function pickTypes(base: ServiceDetailTypes | undefined, variant: ServiceDetailTypesLang | undefined): ServiceDetailTypes | undefined {
  if (!base) return undefined;
  return {
    title: pick(base.title, variant?.title),
    items: base.items.map((b, i) => pickTypeItem(b, variant?.items?.[i])),
    linkLabel: pick(base.linkLabel, variant?.linkLabel),
    linkHref: base.linkHref,
  };
}
function pickProcessStep(base: ServiceDetailProcessStep, variant: ServiceDetailProcessStepLang | undefined): ServiceDetailProcessStep {
  return { ...base, title: pick(base.title, variant?.title), description: pick(base.description, variant?.description) };
}
function pickProcess(base: ServiceDetailProcess, variant: ServiceDetailProcessLang | undefined): ServiceDetailProcess {
  return {
    title: pick(base.title, variant?.title),
    steps: base.steps.map((b, i) => pickProcessStep(b, variant?.steps?.[i])),
  };
}
function pickDocuments(base: ServiceDetailDocuments | undefined, variant: ServiceDetailDocumentsLang | undefined): ServiceDetailDocuments | undefined {
  if (!base) return undefined;
  return { title: pick(base.title, variant?.title), items: pickArr(base.items, variant?.items) };
}
function pickDuration(base: ServiceDetailDuration | undefined, variant: ServiceDetailDurationLang | undefined): ServiceDetailDuration | undefined {
  if (!base) return undefined;
  return { value: pick(base.value, variant?.value), note: pick(base.note, variant?.note) };
}
function pickTestimonialsHelp(base: ServiceDetailTestimonialsHelp, variant: ServiceDetailTestimonialsHelpLang | undefined): ServiceDetailTestimonialsHelp {
  return { title: pick(base.title, variant?.title), description: pick(base.description, variant?.description) };
}
function pickCta(base: ServiceDetailCta | undefined, variant: ServiceDetailCtaLang | undefined): ServiceDetailCta | undefined {
  if (!base) return undefined;
  return { title: pick(base.title, variant?.title), subtitle: pick(base.subtitle, variant?.subtitle) };
}

/** Base (Bahasa Indonesia) + varian EN/ZH -> ServiceDetailContent siap
 * render, fallback per-field (bukan per-section) ke Bahasa Indonesia. */
export function pickServiceDetailContent(
  base: ServiceDetailContent,
  en: ServiceDetailContentLang | null | undefined,
  zh: ServiceDetailContentLang | null | undefined,
  locale: Locale,
): ServiceDetailContent {
  const variant = locale === "en" ? en : locale === "zh" ? zh : null;
  if (!variant) return base;

  return {
    kicker: pick(base.kicker, variant.kicker),
    tagline: pick(base.tagline, variant.tagline),
    heroDescription: pick(base.heroDescription, variant.heroDescription),
    highlights: base.highlights.map((h, i) => pickHighlight(h, variant.highlights?.[i])),
    stats: base.stats.map((s, i) => pickStat(s, variant.stats?.[i])),
    about: pickAbout(base.about, variant.about),
    benefits: pickBenefits(base.benefits, variant.benefits),
    types: pickTypes(base.types, variant.types),
    process: pickProcess(base.process, variant.process),
    packagesTitle: pickOpt(base.packagesTitle, variant.packagesTitle),
    documents: pickDocuments(base.documents, variant.documents),
    duration: pickDuration(base.duration, variant.duration),
    testimonialsHelp: pickTestimonialsHelp(base.testimonialsHelp, variant.testimonialsHelp),
    faqsTitle: pick(base.faqsTitle, variant.faqsTitle),
    cta: pickCta(base.cta, variant.cta),
  };
}
