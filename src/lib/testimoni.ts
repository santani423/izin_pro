/* ─── Data halaman Testimoni Klien /testimoni (desain baru) ───
 * Dipisah dari constants.ts (TESTIMONIALS dipakai admin & halaman lama).
 */

import type { LucideIcon } from "lucide-react";
import { Award, Building2, Smile, Users } from "lucide-react";

/* ─── Statistik bar di bawah hero ─── */
export interface TestimoniStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const TESTIMONI_STATS: TestimoniStat[] = [
  { icon: Users, value: "5.000+", label: "Perizinan Selesai" },
  { icon: Smile, value: "99%", label: "Kepuasan Klien" },
  { icon: Building2, value: "Berbagai", label: "Industri Terlayani" },
  { icon: Award, value: "10+", label: "Tahun Pengalaman" },
];

/* ─── Kategori filter ─── */
export interface TestimoniCategory {
  id: string;
  label: string;
}

export const TESTIMONI_CATEGORIES: TestimoniCategory[] = [
  { id: "semua", label: "Semua Testimoni" },
  { id: "pendirian-pt", label: "Pendirian PT" },
  { id: "perizinan-usaha", label: "Perizinan Usaha" },
  { id: "perizinan-operasional", label: "Perizinan Operasional" },
  { id: "perizinan-lainnya", label: "Perizinan Lainnya" },
];

/* ─── Testimoni ─── */
export interface TestimoniItem {
  id: string;
  name: string;
  role: string;
  content: string;
  /** id kategori — lihat TESTIMONI_CATEGORIES */
  category: string;
  /** Label chip di kartu, mis. "Pendirian PT" */
  categoryLabel: string;
}

export const TESTIMONI_ITEMS: TestimoniItem[] = [
  {
    id: "tst-1",
    name: "Andi Setiawan",
    role: "Direktur, PT Maju Bersama",
    content:
      "Proses pendirian PT kami sangat cepat dan mudah berkat bantuan tim IzinPro. Semua dokumen dijelaskan dengan detail dan transparan.",
    category: "pendirian-pt",
    categoryLabel: "Pendirian PT",
  },
  {
    id: "tst-2",
    name: "Siti Nurhaliza",
    role: "Owner, CV Kreatif Mandiri",
    content:
      "Izin usaha kami selesai lebih cepat dari ekspektasi. Tim IzinPro sangat profesional dan responsif.",
    category: "perizinan-usaha",
    categoryLabel: "Izin Usaha",
  },
  {
    id: "tst-3",
    name: "Budi Santoso",
    role: "CEO, PT Solusi Digital",
    content:
      "Terima kasih IzinPro atas pendampingannya dalam pengurusan izin operasional. Sangat membantu bisnis kami.",
    category: "perizinan-operasional",
    categoryLabel: "Izin Operasional",
  },
  {
    id: "tst-4",
    name: "Rina Wijaya",
    role: "Owner, CV Sejahtera Abadi",
    content:
      "Pelayanan prima, komunikasi jelas, dan biaya sesuai penawaran. Kami puas menggunakan layanan IzinPro.",
    category: "perizinan-lainnya",
    categoryLabel: "Perizinan Lainnya",
  },
  {
    id: "tst-5",
    name: "Fajar Nugroho",
    role: "Owner, PT Karya Abadi",
    content:
      "Dokumen lengkap dan proses legalitas berjalan lancar. IzinPro benar-benar partner terpercaya untuk bisnis kami.",
    category: "pendirian-pt",
    categoryLabel: "Pendirian PT",
  },
  {
    id: "tst-6",
    name: "Dewi Lestari",
    role: "Owner, UD Sukses Bersama",
    content:
      "Sangat membantu UMKM seperti kami dalam mengurus perizinan dengan mudah dan cepat. Terima kasih IzinPro!",
    category: "perizinan-usaha",
    categoryLabel: "Izin Usaha",
  },
];
