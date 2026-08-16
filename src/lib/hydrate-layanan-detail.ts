/* ─── Hydrasi Service (DB) -> LayananDetail (view-model) ───
 * Service.detailContent nyimpen ikon sbg string key (Json gak bisa nyimpen
 * komponen React) — fungsi di sini convert balik jadi LucideIcon SEBELUM
 * dikirim ke komponen section (src/components/sections/LayananDetail*.tsx),
 * yg tetap gak berubah sama sekali dari desain awal.
 *
 * LayananDetail adalah tipe VIEW-MODEL (bukan tipe storage) — dulu didefinisikan
 * di layanan-detail.ts bareng data mock-nya, sekarang pindah ke sini krn
 * mock-nya udah gak dipakai (datanya dari Prisma).
 */
import type { LucideIcon } from "lucide-react";
import type { Service, ServicePackage, Faq, Testimonial, Cta, Media } from "@prisma/client";
import { resolveDetailIcon } from "@/lib/detail-icons";
import type { ServiceDetailContent } from "@/lib/types/service-detail-content";
import type { ServiceDetailContentLang } from "@/lib/service-detail-locale";
import { pickServiceDetailContent } from "@/lib/service-detail-locale";
import { pickLocalizedText } from "@/lib/locale-field";
import type { Locale } from "@/i18n/config";

function pickTextArray(base: string[], en: string[] | null | undefined, zh: string[] | null | undefined, locale: Locale): string[] {
  const variant = locale === "en" ? en : locale === "zh" ? zh : null;
  if (!variant) return base;
  return base.map((b, i) => (variant[i]?.trim() ? variant[i] : b));
}

export interface DetailHighlight {
  icon: LucideIcon;
  label: string;
}

export interface DetailStat {
  icon: LucideIcon;
  value: string;
  label: string;
  withStars?: boolean;
}

export interface DetailBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface DetailStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface DetailPackage {
  name: string;
  price: string;
  originalPrice?: string;
  features: string[];
  popular?: boolean;
}

export interface DetailType {
  title: string;
  description: string;
}

export interface DetailTestimonial {
  name: string;
  role: string;
  content: string;
}

export interface DetailFaq {
  question: string;
  answer: string;
}

export interface LayananDetail {
  slug: string;
  kicker: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string | null;
  highlights: DetailHighlight[];
  stats: DetailStat[];
  about: {
    title: string;
    paragraphs: string[];
    checklist?: string[];
    imageLabel: string;
    badge?: string;
    imageUrl: string | null;
  };
  benefits?: {
    title: string;
    items: DetailBenefit[];
  };
  types?: {
    title: string;
    items: DetailType[];
    linkLabel: string;
    linkHref: string;
  };
  process: {
    title: string;
    steps: DetailStep[];
  };
  packages?: {
    title: string;
    items: DetailPackage[];
    documents: { title: string; items: string[] };
    duration: { value: string; note: string };
  };
  testimonials: {
    items: DetailTestimonial[];
    help: { title: string; description: string };
  };
  faqs: {
    title: string;
    items: DetailFaq[];
  };
  cta?: {
    title: string;
    subtitle: string;
  };
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/** Belum diisi admin (detailContent null) -> bentuk minimal dari kolom
 * Service biasa, spirit sama kayak buildFallbackDetail() dulu: halaman gak
 * pernah kosong/rusak cuma krn kontennya belum diauthor. */
function fallbackContent(service: Service): ServiceDetailContent {
  return {
    kicker: "Layanan",
    tagline: "Cepat, Mudah & 100% Legal",
    heroDescription: service.description,
    highlights: [
      { icon: "zap", label: "Proses Cepat & Efisien" },
      { icon: "shield-check", label: "Legal & Resmi 100%" },
      { icon: "messages-square", label: "Konsultasi Gratis" },
      { icon: "circle-dollar-sign", label: "Biaya Transparan" },
    ],
    stats: [
      { icon: "file-check", value: "5.000+", label: "Perizinan Terselesaikan" },
      { icon: "star", value: "99%", label: "Kepuasan Klien", withStars: true },
    ],
    about: {
      title: `Apa itu ${service.title}?`,
      paragraphs: [service.description],
      checklist: service.features as string[],
      imageLabel: `Ilustrasi layanan ${service.title}`,
    },
    process: {
      title: `Proses Pengurusan ${service.title}`,
      steps: [
        { icon: "messages-square", title: "Konsultasi", description: "Konsultasi awal gratis via WhatsApp." },
        { icon: "clipboard-list", title: "Pengumpulan Data", description: "Kami akan meminta data dan dokumen yang diperlukan." },
        { icon: "send", title: "Pengajuan", description: "Pengajuan ke instansi terkait." },
        { icon: "clock", title: "Monitoring", description: "Monitoring proses secara berkala." },
        { icon: "file-check", title: "Selesai", description: "Perizinan selesai & dokumen diserahkan." },
      ],
    },
    packagesTitle: `Pilih Paket ${service.title}`,
    documents: {
      title: "Dokumen yang Diperlukan (Umum)",
      items: [
        "KTP Penanggung Jawab",
        "NPWP Pribadi / Badan",
        "Alamat & Domisili Usaha",
        "Email Aktif & No. Telepon",
        "Dokumen Legalitas Terkait (jika ada)",
      ],
    },
    duration: { value: "3 – 7 Hari Kerja", note: "(tergantung kelengkapan data)" },
    testimonialsHelp: {
      title: "Butuh Bantuan?",
      description: `Konsultasikan kebutuhan ${service.title} Anda sekarang juga!`,
    },
    faqsTitle: "Pertanyaan yang Sering Diajukan",
  };
}

export function hydrateLayananDetail(
  service: Service & { featuredMedia: Pick<Media, "url"> | null; aboutMedia: Pick<Media, "url"> | null },
  packages: ServicePackage[],
  faqs: Faq[],
  testimonials: Testimonial[],
  ctaDefault: Cta | null,
  locale: Locale,
): LayananDetail {
  const baseContent = (service.detailContent as ServiceDetailContent | null) ?? fallbackContent(service);
  const content = service.detailContent
    ? pickServiceDetailContent(
        baseContent,
        service.detailContentEn as ServiceDetailContentLang | null,
        service.detailContentZh as ServiceDetailContentLang | null,
        locale,
      )
    : baseContent;
  const title = pickLocalizedText(service.title, service.titleEn, service.titleZh, locale);

  const cta =
    content.cta ??
    (ctaDefault
      ? {
          title: pickLocalizedText(ctaDefault.title, ctaDefault.titleEn, ctaDefault.titleZh, locale),
          subtitle: ctaDefault.subtitle ? pickLocalizedText(ctaDefault.subtitle, ctaDefault.subtitleEn, ctaDefault.subtitleZh, locale) : "",
        }
      : undefined);

  return {
    slug: service.slug,
    kicker: content.kicker,
    title,
    tagline: content.tagline,
    description: content.heroDescription,
    imageUrl: service.featuredMedia?.url ?? null,
    highlights: content.highlights.map((h) => ({ icon: resolveDetailIcon(h.icon), label: h.label })),
    stats: content.stats.map((s) => ({
      icon: resolveDetailIcon(s.icon),
      value: s.value,
      label: s.label,
      withStars: s.withStars,
    })),
    about: {
      ...content.about,
      // Fallback ke gambar Hero kalau belum diisi tersendiri — biar semua
      // service yg udah ke-seed (belum punya aboutMediaId) gak berubah
      // tampilannya, tapi admin bisa override per-service kalau mau beda.
      imageUrl: service.aboutMedia?.url ?? service.featuredMedia?.url ?? null,
    },
    benefits: content.benefits
      ? {
          title: content.benefits.title,
          items: content.benefits.items.map((b) => ({
            icon: resolveDetailIcon(b.icon),
            title: b.title,
            description: b.description,
          })),
        }
      : undefined,
    types: content.types,
    process: {
      title: content.process.title,
      steps: content.process.steps.map((s) => ({
        icon: resolveDetailIcon(s.icon),
        title: s.title,
        description: s.description,
      })),
    },
    // Dokumen & durasi independen dari ada/tidaknya ServicePackage — dulu
    // ke-tumpuk jadi satu kondisi "packages.length > 0", jadi kalau service
    // belum punya paket harga, Dokumen & Durasi yg udah diisi admin ikut
    // gak muncul sama sekali padahal datanya ada. Section cuma disembunyikan
    // kalau ketiga-tiganya (paket, dokumen, durasi) sama sekali kosong.
    packages:
      packages.length > 0 || (content.documents?.items.length ?? 0) > 0 || content.duration?.value
        ? {
            title: content.packagesTitle ?? `Pilih Paket ${title}`,
            items: packages.map((p) => ({
              name: pickLocalizedText(p.name, p.nameEn, p.nameZh, locale),
              price: formatRupiah(Number(p.price)),
              originalPrice: p.originalPrice ? formatRupiah(Number(p.originalPrice)) : undefined,
              features: pickTextArray(p.features as string[], p.featuresEn as string[] | null, p.featuresZh as string[] | null, locale),
              popular: p.isPopular,
            })),
            documents: content.documents ?? { title: "Dokumen yang Diperlukan", items: [] },
            duration: content.duration ?? { value: "-", note: "" },
          }
        : undefined,
    testimonials: {
      items: testimonials.map((t) => ({
        name: t.name,
        role: [t.role, t.company].filter(Boolean).join(", "),
        content: t.content ?? "",
      })),
      help: content.testimonialsHelp,
    },
    faqs: {
      title: content.faqsTitle,
      items: faqs.map((f) => ({ question: f.question, answer: f.answer })),
    },
    cta,
  };
}
