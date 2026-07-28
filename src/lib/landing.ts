/* ─── Data landing page (desain homepage baru) ───
 * Dipisah dari constants.ts agar tidak tabrakan dengan exports existing
 * (SERVICES, TESTIMONIALS, PROMOS, dll) yang dipakai halaman lain & admin.
 */

import type { LucideIcon } from "lucide-react";
import { Zap, ShieldCheck, Users } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";


/* ─── Hero ─── */
export interface HeroHighlight {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export const HERO_HIGHLIGHTS: HeroHighlight[] = [
  { icon: Zap, title: "Proses Cepat", subtitle: "& Efisien" },
  { icon: ShieldCheck, title: "Legal & Resmi", subtitle: "100%" },
  { icon: Users, title: "Tim Profesional", subtitle: "Berpengalaman" },
];

export interface HeroStat {
  value: string;
  label: string;
  withStars?: boolean;
}

export const HERO_STATS: HeroStat[] = [
  { value: "5.000+", label: "Perizinan Selesai" },
  { value: "99%", label: "Kepuasan Klien", withStars: true },
];

/* ─── Promo ─── */
export interface LandingPromo {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  variant: "discount" | "free" | "package";
}

export const LANDING_PROMOS: LandingPromo[] = [
  {
    id: "diskon-25",
    eyebrow: "DISKON",
    title: "25%",
    description: "Untuk Pendirian PT selama bulan ini",
    ctaLabel: "Klaim Sekarang",
    variant: "discount",
  },
  {
    id: "gratis-konsultasi",
    eyebrow: "GRATIS",
    title: "Konsultasi",
    description: "untuk semua layanan",
    ctaLabel: "Konsultasi Sekarang",
    variant: "free",
  },
  {
    id: "paket-hemat",
    eyebrow: "PAKET HEMAT",
    title: "Perizinan Lengkap",
    description: "Mulai dari Rp 5.200.000",
    ctaLabel: "Lihat Paket",
    variant: "package",
  },
];

/* ─── Tentang ─── */
export const ABOUT_POINTS: string[] = [
  "Legal & Resmi",
  "Proses Cepat & Efisien",
  "Konsultasi Gratis & Transparan",
  "Layanan Terlengkap & Terpercaya",
];

export const ABOUT_DESCRIPTION =
  "IzinPro adalah penyedia jasa layanan perizinan bisnis terpercaya yang berkomitmen memberikan layanan terbaik dengan proses cepat, transparan, dan aman.";

/* Video profil IzinPro (format embed YouTube) */
export const ABOUT_VIDEO_URL = "https://www.youtube.com/embed/kXz2t48t4zo";

/* ─── Kontak (derivasi dari COMPANY_INFO agar satu sumber data) ─── */
export interface LandingContactInfo {
  address: string;
  addressShort: string;
  phone: string;
  email: string;
  whatsapp: string;
  hours: string;
  mapsUrl: string;
}

export const CONTACT_INFO: LandingContactInfo = {
  address: COMPANY_INFO.address,
  addressShort: COMPANY_INFO.addressShort,
  phone: COMPANY_INFO.whatsappDisplay,
  email: COMPANY_INFO.email,
  whatsapp: COMPANY_INFO.whatsapp,
  hours: COMPANY_INFO.hours,
  mapsUrl: COMPANY_INFO.mapsUrl,
};

/* ─── Util ─── */
export const WHATSAPP_URL = `https://wa.me/${COMPANY_INFO.whatsapp}`;
