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

/* ─── Navigasi ─── */
export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "Beranda", href: "/" },
  {
    label: "Layanan",
    href: "/layanan",
    children: [
      { label: "Pendirian PT", href: "/layanan/pendirian-pt" },
      { label: "NIB (Nomor Induk Berusaha)", href: "/layanan/nib" },
      { label: "Izin Usaha", href: "/layanan/izin-usaha" },
      { label: "Izin Komersial & Operasional", href: "/layanan/izin-komersial" },
      { label: "Perizinan Lainnya", href: "/layanan/perizinan-lainnya" },
    ],
  },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Blog", href: "/blog" },
  { label: "Kontak", href: "/kontak" },
];

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

/* ─── Testimoni ─── */
export interface LandingTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
}

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    id: "tes-1",
    quote: "Proses cepat dan mudah. Tim IzinPro sangat membantu bisnis kami.",
    name: "Andi Setiawan",
    role: "Direktur, PT Maju Bersama",
    rating: 5,
  },
  {
    id: "tes-2",
    quote: "Pelayanan profesional dan informasi sangat jelas.",
    name: "Siti Nurhaliza",
    role: "Owner, CV Kreatif Mandiri",
    rating: 5,
  },
  {
    id: "tes-3",
    quote: "Legalitas lengkap, proses terstruktur dan aman.",
    name: "Budi Santoso",
    role: "CEO, PT Solusi Digital",
    rating: 5,
  },
  {
    id: "tes-4",
    quote: "Izin selesai sesuai target yang dijanjikan.",
    name: "Rina Wijaya",
    role: "Owner, CV Sejahtera Abadi",
    rating: 5,
  },
  {
    id: "tes-5",
    quote:
      "Konsultasinya sangat membantu, semua pertanyaan dijawab dengan sabar dan detail.",
    name: "Hendra Gunawan",
    role: "Founder, PT Karya Nusantara",
    rating: 5,
  },
  {
    id: "tes-6",
    quote: "Harga transparan, tidak ada biaya tersembunyi. Sangat recommended!",
    name: "Dewi Lestari",
    role: "Owner, CV Berkah Jaya",
    rating: 5,
  },
  {
    id: "tes-7",
    quote:
      "Pengurusan NIB selesai lebih cepat dari perkiraan. Terima kasih IzinPro!",
    name: "Agus Prasetyo",
    role: "Direktur, PT Mitra Sukses",
    rating: 5,
  },
  {
    id: "tes-8",
    quote: "Tim yang responsif dan profesional. Proses dari awal sampai akhir lancar.",
    name: "Maya Anggraini",
    role: "CEO, PT Inovasi Digital",
    rating: 5,
  },
];

/* ─── Video Testimoni ─── */
export interface LandingVideoTestimonial {
  id: string;
  title: string;
  service: string;
  /** Nama & jabatan klien — ditampilkan di pop-up pemutar */
  name: string;
  role: string;
  duration: string;
  /** Kelas gradient Tailwind untuk thumbnail placeholder */
  gradient: string;
}

export const LANDING_VIDEO_TESTIMONIALS: LandingVideoTestimonial[] = [
  {
    id: "vid-1",
    title: "Testimoni PT Maju Bersama",
    service: "Layanan Pendirian PT",
    name: "Andi Setiawan",
    role: "Direktur, PT Maju Bersama",
    duration: "1:28",
    gradient: "from-lime-500 to-green-900",
  },
  {
    id: "vid-2",
    title: "Testimoni CV Kreatif Mandiri",
    service: "Layanan NIB",
    name: "Siti Nurhaliza",
    role: "Owner, CV Kreatif Mandiri",
    duration: "1:15",
    gradient: "from-cyan-600 to-blue-950",
  },
  {
    id: "vid-3",
    title: "Testimoni PT Solusi Digital",
    service: "Layanan Izin Usaha",
    name: "Budi Santoso",
    role: "CEO, PT Solusi Digital",
    duration: "1:32",
    gradient: "from-violet-500 to-indigo-950",
  },
  {
    id: "vid-4",
    title: "Testimoni CV Sejahtera Abadi",
    service: "Layanan Perizinan Lengkap",
    name: "Rina Wijaya",
    role: "Owner, CV Sejahtera Abadi",
    duration: "1:27",
    gradient: "from-red-500 to-red-950",
  },
];

/* ─── Klien ─── */
export interface LandingClient {
  id: string;
  name: string;
  logo: string;
}

export const LANDING_CLIENTS: LandingClient[] = [
  { id: "cl-1", name: "bank bjb", logo: "/images/clients/bank-bjb.webp" },
  { id: "cl-2", name: "Alfamart", logo: "/images/clients/alfamart.png" },
  { id: "cl-3", name: "Telkom Indonesia", logo: "/images/clients/telkom.png" },
  { id: "cl-4", name: "Trive Invest", logo: "/images/clients/trive-invest.jpg" },
  { id: "cl-5", name: "JNE Express", logo: "/images/clients/jne.png" },
  { id: "cl-6", name: "Sinarmas", logo: "/images/clients/sinarmas.jpg" },
  { id: "cl-7", name: "WIKA", logo: "/images/clients/wika.webp" },
  { id: "cl-8", name: "Maybank", logo: "/images/clients/maybank.png" },
];

/* ─── Footer ─── */
export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Layanan Kami",
    links: [
      { label: "Pendirian PT", href: "/layanan/pendirian-pt" },
      { label: "NIB & Berusaha", href: "/layanan/nib" },
      { label: "Izin Usaha", href: "/layanan/izin-usaha" },
      { label: "Izin Komersial & Operasional", href: "/layanan/izin-komersial" },
      { label: "Perizinan Lainnya", href: "/layanan/perizinan-lainnya" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Tentang Kami", href: "/tentang-kami" },
      { label: "Artikel", href: "/blog" },
      { label: "Testimoni", href: "/#testimoni" },
      { label: "Promo", href: "/#promo" },
      { label: "Karir", href: "/karir" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
      { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
      { label: "Hubungi Kami", href: "/kontak" },
    ],
  },
];

/* ─── Util ─── */
export const WHATSAPP_URL = `https://wa.me/${COMPANY_INFO.whatsapp}`;
