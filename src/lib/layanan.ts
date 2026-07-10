/* ─── Data halaman Daftar Layanan (desain baru) ───
 * Dipisah dari constants.ts agar tidak tabrakan dengan exports existing
 * (SERVICES dipakai halaman detail, admin & sitemap). Slug di sini HARUS
 * cocok dengan SERVICES di constants.ts agar link detail tidak putus.
 */

import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  ClipboardList,
  Clock,
  Factory,
  FileStack,
  FileText,
  HardHat,
  Headset,
  Leaf,
  MapPin,
  RefreshCw,
  Ship,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

/* ─── Highlight keunggulan (bar di bawah hero) ─── */
export interface LayananHighlight {
  icon: LucideIcon;
  label: string;
}

export const LAYANAN_HIGHLIGHTS: LayananHighlight[] = [
  { icon: Clock, label: "Proses Cepat & Efisien" },
  { icon: ShieldCheck, label: "Legal & Resmi 100%" },
  { icon: Users, label: "Tim Profesional Berpengalaman" },
  { icon: BadgeCheck, label: "Layanan Transparan" },
  { icon: Headset, label: "Konsultasi Gratis" },
];

/* ─── Kategori filter katalog ─── */
export interface LayananCategory {
  id: string;
  label: string;
}

export const LAYANAN_CATEGORIES: LayananCategory[] = [
  { id: "semua", label: "Semua Layanan" },
  { id: "pendirian-perusahaan", label: "Pendirian Perusahaan" },
  { id: "perizinan-usaha", label: "Perizinan Usaha" },
  { id: "perizinan-operasional", label: "Perizinan Operasional" },
  { id: "perizinan-lainnya", label: "Perizinan Lainnya" },
];

/* ─── Kartu layanan ─── */
export interface LayananService {
  id: string;
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  /** id kategori — lihat LAYANAN_CATEGORIES */
  category: string;
}

export const LAYANAN_SERVICES: LayananService[] = [
  {
    id: "pendirian-pt",
    slug: "pendirian-pt",
    icon: Building2,
    title: "Pendirian PT",
    description:
      "Membantu pendirian PT secara cepat dan legal sesuai ketentuan hukum.",
    category: "pendirian-perusahaan",
  },
  {
    id: "nib",
    slug: "nib",
    icon: ClipboardList,
    title: "NIB (Nomor Induk Berusaha)",
    description:
      "Urus NIB secara mudah, cepat dan resmi untuk memulai usaha Anda.",
    category: "perizinan-usaha",
  },
  {
    id: "izin-usaha",
    slug: "izin-usaha",
    icon: FileText,
    title: "Izin Usaha",
    description: "Berbagai jenis izin usaha sesuai bidang bisnis Anda.",
    category: "perizinan-usaha",
  },
  {
    id: "izin-komersial",
    slug: "izin-komersial",
    icon: Store,
    title: "Izin Komersial & Operasional",
    description: "Perizinan operasional untuk kelancaran bisnis Anda.",
    category: "perizinan-operasional",
  },
  {
    id: "perizinan-lainnya",
    slug: "perizinan-lainnya",
    icon: FileStack,
    title: "Perizinan Lainnya",
    description:
      "Layanan perizinan lainnya yang disesuaikan dengan kebutuhan bisnis Anda.",
    category: "perizinan-lainnya",
  },
  {
    id: "perizinan-lokasi",
    slug: "perizinan-lokasi",
    icon: MapPin,
    title: "Perizinan Lokasi",
    description:
      "Membantu pengurusan izin lokasi usaha dengan mudah dan cepat.",
    category: "perizinan-lainnya",
  },
  {
    id: "sertifikasi",
    slug: "sertifikasi",
    icon: BadgeCheck,
    title: "Sertifikasi",
    description:
      "Pengurusan sertifikasi resmi untuk meningkatkan kepercayaan bisnis Anda.",
    category: "perizinan-operasional",
  },
  {
    id: "perizinan-impor",
    slug: "perizinan-impor",
    icon: Ship,
    title: "Perizinan Impor",
    description:
      "Layanan perizinan impor barang untuk mendukung kegiatan bisnis Anda.",
    category: "perizinan-usaha",
  },
  {
    id: "izin-industri",
    slug: "izin-industri",
    icon: Factory,
    title: "Izin Industri",
    description:
      "Membantu pengurusan izin industri sesuai regulasi yang berlaku.",
    category: "perizinan-usaha",
  },
  {
    id: "lingkungan-hidup",
    slug: "lingkungan-hidup",
    icon: Leaf,
    title: "Lingkungan Hidup",
    description:
      "Perizinan lingkungan untuk mendukung bisnis yang berkelanjutan.",
    category: "perizinan-operasional",
  },
  {
    id: "perizinan-konstruksi",
    slug: "perizinan-konstruksi",
    icon: HardHat,
    title: "Perizinan Konstruksi",
    description: "Pengurusan izin konstruksi untuk proyek bangunan Anda.",
    category: "perizinan-operasional",
  },
  {
    id: "perubahan-pembaruan-izin",
    slug: "perubahan-pembaruan-izin",
    icon: RefreshCw,
    title: "Perubahan & Pembaruan Izin",
    description: "Layanan perubahan atau pembaruan data izin usaha Anda.",
    category: "perizinan-lainnya",
  },
];
