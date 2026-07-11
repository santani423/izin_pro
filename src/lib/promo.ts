/* ─── Data halaman Promo /promo (desain baru) ───
 * Dipisah dari constants.ts (PROMOS dipakai homepage lama & admin).
 */

import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  CircleDollarSign,
  ClipboardList,
  Headset,
  MessagesSquare,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import type { HighlightItem } from "@/components/shared/HighlightsBar";
import type { DetailStep } from "@/lib/layanan-detail";

/* ─── Highlight bar di bawah hero ─── */
export const PROMO_HIGHLIGHTS: HighlightItem[] = [
  { icon: CircleDollarSign, label: "Harga Terbaik" },
  { icon: Zap, label: "Proses Cepat" },
  { icon: ShieldCheck, label: "100% Legal & Resmi" },
  { icon: MessagesSquare, label: "Konsultasi Gratis" },
  { icon: Award, label: "Garansi Kepuasan" },
];

/* ─── Paket promo ─── */
export interface PromoPackage {
  id: string;
  badge: string;
  title: string;
  price: string;
  originalPrice: string;
  saving: string;
  features: string[];
  href: string;
  /** Kartu tengah tampil gelap sesuai design */
  dark?: boolean;
}

export const PROMO_PACKAGES: PromoPackage[] = [
  {
    id: "pendirian-pt-lengkap",
    badge: "Most Popular",
    title: "Paket Pendirian PT Lengkap",
    price: "Rp 5.500.000",
    originalPrice: "Rp 6.500.000",
    saving: "Hemat Rp 1.000.000",
    features: [
      "Akta Pendirian",
      "SK Kemenkumham",
      "NPWP Badan",
      "NIB (Nomor Induk Berusaha)",
      "Konsultasi Gratis",
      "Gratis Revisi Dokumen",
    ],
    href: "/layanan/pendirian-pt",
  },
  {
    id: "izin-usaha-premium",
    badge: "Best Value",
    title: "Paket Izin Usaha Premium",
    price: "Rp 3.500.000",
    originalPrice: "Rp 4.500.000",
    saving: "Hemat Rp 1.000.000",
    features: [
      "NIB (Nomor Induk Berusaha)",
      "Izin Usaha Sesuai KBLI",
      "Sertifikat Standar (SS)",
      "Konsultasi Gratis",
      "Proses Cepat & Transparan",
    ],
    href: "/layanan/izin-usaha",
    dark: true,
  },
  {
    id: "perizinan-lengkap",
    badge: "Limited Time",
    title: "Paket Perizinan Lengkap",
    price: "Rp 8.500.000",
    originalPrice: "Rp 10.500.000",
    saving: "Hemat Rp 2.000.000",
    features: [
      "Pendirian PT",
      "NIB & Izin Usaha",
      "Izin Operasional",
      "Sertifikat & Dokumen Pendukung",
      "Pendampingan Penuh",
      "Gratis Konsultasi Selamanya",
    ],
    href: "/layanan",
  },
];

/* ─── Kenapa pilih promo ─── */
export interface PromoWhy {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PROMO_WHY: PromoWhy[] = [
  {
    icon: CircleDollarSign,
    title: "Hemat Biaya",
    description: "Dapatkan layanan berkualitas dengan harga terbaik.",
  },
  {
    icon: Zap,
    title: "Proses Cepat",
    description: "Kami bekerja cepat, efisien, dan tepat waktu.",
  },
  {
    icon: ShieldCheck,
    title: "Legal & Resmi",
    description: "Semua dokumen dijamin legal dan diakui pemerintah.",
  },
  {
    icon: Users,
    title: "Tim Profesional",
    description: "Didampingi oleh tim ahli yang berpengalaman.",
  },
  {
    icon: Headset,
    title: "Konsultasi Gratis",
    description: "Konsultasikan kebutuhan Anda tanpa biaya.",
  },
];

/* ─── Cara mendapatkan promo (4 langkah) ─── */
export const PROMO_STEPS: DetailStep[] = [
  {
    icon: ClipboardList,
    title: "Pilih Layanan",
    description: "Pilih paket layanan promosi yang sesuai kebutuhan Anda.",
  },
  {
    icon: MessagesSquare,
    title: "Konsultasi Gratis",
    description: "Hubungi kami untuk konsultasi dan informasi lebih lanjut.",
  },
  {
    icon: Zap,
    title: "Proses Cepat",
    description: "Kami proses dokumen Anda dengan cepat dan transparan.",
  },
  {
    icon: BadgeCheck,
    title: "Selesai & Legal",
    description: "Dokumen selesai, bisnis Anda siap berjalan secara legal.",
  },
];
