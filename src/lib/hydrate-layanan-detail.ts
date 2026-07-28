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
): LayananDetail {
  const content = (service.detailContent as ServiceDetailContent | null) ?? fallbackContent(service);

  const cta = content.cta ?? (ctaDefault ? { title: ctaDefault.title, subtitle: ctaDefault.subtitle ?? "" } : undefined);

  return {
    slug: service.slug,
    kicker: content.kicker,
    title: service.title,
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
    packages:
      packages.length > 0
        ? {
            title: content.packagesTitle ?? `Pilih Paket ${service.title}`,
            items: packages.map((p) => ({
              name: p.name,
              price: formatRupiah(Number(p.price)),
              features: p.features as string[],
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
