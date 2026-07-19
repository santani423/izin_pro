/* ─── Data landing page (desain homepage baru) ───
 * Dipisah dari constants.ts agar tidak tabrakan dengan exports existing
 * (SERVICES, TESTIMONIALS, PROMOS, dll) yang dipakai halaman lain & admin.
 */

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileBadge,
  FileCheck2,
  UserCheck,
  FileStack,
  Zap,
  ShieldCheck,
  Users,
} from "lucide-react";
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

/* ─── Layanan ─── */
export interface LandingService {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export const LANDING_SERVICES: LandingService[] = [
  {
    id: "pendirian-pt",
    icon: Briefcase,
    title: "Pendirian PT",
    description:
      "Dirikan PT dengan mudah sesuai regulasi dan legalitas yang berlaku.",
    href: "/layanan/pendirian-pt",
  },
  {
    id: "nib",
    icon: FileBadge,
    title: "NIB (Nomor Induk Berusaha)",
    description:
      "Urus NIB secara mudah, cepat dan resmi untuk memulai usaha Anda.",
    href: "/layanan/nib",
  },
  {
    id: "izin-usaha",
    icon: FileCheck2,
    title: "Izin Usaha",
    description: "Berbagai jenis izin usaha sesuai bidang bisnis Anda.",
    href: "/layanan/izin-usaha",
  },
  {
    id: "izin-komersial",
    icon: UserCheck,
    title: "Izin Komersial & Operasional",
    description:
      "Perizinan operasional untuk menunjang kegiatan bisnis secara legal.",
    href: "/layanan/izin-komersial",
  },
  {
    id: "perizinan-lainnya",
    icon: FileStack,
    title: "Perizinan Lainnya",
    description:
      "Layanan perizinan lainnya yang disesuaikan dengan kebutuhan usaha Anda.",
    href: "/layanan/perizinan-lainnya",
  },
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

/* ─── Artikel ─── */
export interface LandingArticle {
  id: string;
  category: string;
  views: string;
  date: string;
  title: string;
  excerpt: string;
  href: string;
  /** Kelas gradient Tailwind untuk thumbnail placeholder */
  gradient: string;
}

export const LANDING_ARTICLES: LandingArticle[] = [
  {
    id: "art-1",
    category: "Perizinan",
    views: "1.284",
    date: "24 Januari 2025",
    title: "Cara Mudah Membuat NIB Online 2025 — Panduan Lengkap",
    excerpt:
      "Nomor Induk Berusaha (NIB) adalah identitas resmi bagi pelaku usaha di Indonesia. Simak panduan lengkap cara membuatnya secara online.",
    href: "/blog/cara-mudah-membuat-nib-online-2024",
    gradient: "from-lime-500 to-green-800",
  },
  {
    id: "art-2",
    category: "Tips Bisnis",
    views: "856",
    date: "20 Januari 2025",
    title: "5 Tips Memilih Badan Usaha yang Tepat untuk Bisnis Anda",
    excerpt:
      "Pemilihan badan usaha sangat mempengaruhi legalitas, pajak, dan pertumbuhan bisnis. Pelajari perbedaan tiap jenisnya di sini.",
    href: "/blog/tips-memilih-badan-usaha",
    gradient: "from-blue-500 to-blue-800",
  },
  {
    id: "art-3",
    category: "Peraturan",
    views: "2.147",
    date: "18 Januari 2025",
    title: "Update Terbaru Peraturan Perizinan Usaha 2025 yang Wajib Diketahui",
    excerpt:
      "Pemerintah merilis sejumlah pembaruan regulasi perizinan usaha. Pastikan bisnis Anda tetap compliant dengan peraturan terbaru.",
    href: "/blog/update-peraturan-perizinan-2025",
    gradient: "from-orange-500 to-orange-800",
  },
  {
    id: "art-4",
    category: "Perizinan",
    views: "743",
    date: "15 Januari 2025",
    title: "Apa itu OSS? Penjelasan Lengkap Sistem Perizinan Terintegrasi",
    excerpt:
      "Online Single Submission (OSS) adalah sistem perizinan terintegrasi di Indonesia. Pelajari cara kerjanya dan manfaatnya bagi usaha Anda.",
    href: "/blog/apa-itu-oss-penjelasan-lengkap",
    gradient: "from-purple-500 to-purple-800",
  },
];

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
