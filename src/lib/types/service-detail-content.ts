/* Bentuk data Service.detailContent (kolom Json) — konten halaman
 * /layanan/[slug] di luar field kolom biasa (title/description/dst) &
 * relasi (packages/faqs). Ikon disimpan sbg string key ke DETAIL_ICONS
 * (src/lib/detail-icons.ts), bukan komponen React (Json gak bisa nyimpen
 * itu) — di-hydrate balik di src/lib/hydrate-layanan-detail.ts. */

export interface ServiceDetailHighlight {
  icon: string;
  label: string;
}

export interface ServiceDetailStat {
  icon: string;
  value: string;
  label: string;
  withStars?: boolean;
}

export interface ServiceDetailAbout {
  title: string;
  paragraphs: string[];
  /** Varian kartu hijau checklist — eksklusif dgn badge (satu atau lainnya, bukan dua-duanya). */
  checklist?: string[];
  imageLabel: string;
  /** Badge lingkaran di atas gambar — eksklusif dgn checklist. */
  badge?: string;
}

export interface ServiceDetailBenefitItem {
  icon: string;
  title: string;
  description: string;
}

export interface ServiceDetailBenefits {
  title: string;
  items: ServiceDetailBenefitItem[];
}

export interface ServiceDetailTypeItem {
  title: string;
  description: string;
}

export interface ServiceDetailTypes {
  title: string;
  items: ServiceDetailTypeItem[];
  linkLabel: string;
  linkHref: string;
}

export interface ServiceDetailProcessStep {
  icon: string;
  title: string;
  description: string;
}

export interface ServiceDetailProcess {
  title: string;
  steps: ServiceDetailProcessStep[];
}

export interface ServiceDetailDocuments {
  title: string;
  items: string[];
}

export interface ServiceDetailDuration {
  value: string;
  note: string;
}

export interface ServiceDetailTestimonialsHelp {
  title: string;
  description: string;
}

export interface ServiceDetailCta {
  title: string;
  subtitle: string;
}

export interface ServiceDetailContent {
  kicker: string;
  tagline: string;
  /** Paragraf intro di Hero — beda dari Service.description (blurb pendek utk kartu list layanan). */
  heroDescription: string;
  highlights: ServiceDetailHighlight[];
  stats: ServiceDetailStat[];
  about: ServiceDetailAbout;
  benefits?: ServiceDetailBenefits;
  types?: ServiceDetailTypes;
  process: ServiceDetailProcess;
  /** Judul section paket harga, mis. "Pilih Paket Pendirian PT" — item paketnya sendiri di ServicePackage. */
  packagesTitle?: string;
  documents?: ServiceDetailDocuments;
  duration?: ServiceDetailDuration;
  testimonialsHelp: ServiceDetailTestimonialsHelp;
  faqsTitle: string;
  /** Override per-service utk CTA banner — kalau kosong, fallback ke Cta[DETAIL_LAYANAN] lalu default hardcode CtaSection. */
  cta?: ServiceDetailCta;
}
