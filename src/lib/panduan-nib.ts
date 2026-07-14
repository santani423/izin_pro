/* ─── Data halaman Panduan Lengkap Mengurus NIB Melalui OSS ───
 * Konten khusus artikel /blog/panduan-lengkap-mengurus-nib-melalui-oss
 * (desain baru, terpisah dari template detail artikel lama di blog-detail.ts).
 */

import {
  BadgeCheck,
  Clock,
  FileCheck,
  FileText,
  HelpCircle,
  House,
  IdCard,
  ListChecks,
  LogIn,
  Mail,
  MessageSquare,
  Network,
  ShieldCheck,
  Smartphone,
  UserPlus,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const PANDUAN_NIB_SLUG = "panduan-lengkap-mengurus-nib-melalui-oss";

/* ─── Hero ─── */
export interface PanduanNibHero {
  kicker: string;
  /** Judul dipecah agar bagian akhir bisa diberi warna hijau */
  titleLead: string;
  titleHighlight: string;
  description: string;
  image: string;
  imageAlt: string;
  author: string;
  updatedLabel: string;
  readTime: string;
  avatar: string;
}

export const PANDUAN_NIB_HERO: PanduanNibHero = {
  kicker: "Panduan Lengkap",
  titleLead: "Panduan Lengkap Mengurus",
  titleHighlight: "NIB Melalui OSS",
  description:
    "Dapatkan NIB (Nomor Induk Berusaha) dengan mudah, cepat, dan legal melalui sistem OSS. Ikuti panduan lengkap berikut agar proses pengajuan NIB Anda lancar tanpa kendala.",
  image: "/images/panduan-nib-hero.jpg",
  imageAlt: "Mengakses sistem OSS melalui laptop untuk mengurus NIB",
  author: "Tim IzinPro",
  updatedLabel: "Diperbarui: 24 Mei 2024",
  readTime: "8 menit baca",
  avatar: "/images/panduan-nib-penulis.jpg",
};

export interface PanduanNibChip {
  label: string;
  icon: LucideIcon;
}

export const PANDUAN_NIB_CHIPS: PanduanNibChip[] = [
  { label: "100% Online", icon: MessageSquare },
  { label: "Resmi & Legal", icon: ShieldCheck },
  { label: "Proses Cepat", icon: Zap },
  { label: "Gratis", icon: FileCheck },
];

/* ─── Ringkasan + navigasi antar bagian (dipakai chip ringkasan & Daftar Isi) ─── */
export const PANDUAN_NIB_SUMMARY: string[] = [
  "NIB adalah identitas resmi pelaku usaha yang diterbitkan oleh pemerintah melalui sistem OSS.",
  "Dokumen ini menjadi syarat utama untuk memulai dan menjalankan usaha secara legal di Indonesia.",
];

export interface PanduanNibNavItem {
  id: string;
  /** Label panjang di Daftar Isi */
  label: string;
  /** Label pendek di chip Ringkasan Artikel */
  shortLabel: string;
  icon: LucideIcon;
}

export const PANDUAN_NIB_NAV: PanduanNibNavItem[] = [
  { id: "apa-itu-nib", label: "Apa itu NIB?", shortLabel: "Apa itu NIB?", icon: FileText },
  { id: "syarat-mengurus-nib", label: "Syarat Mengurus NIB", shortLabel: "Syarat Mengurus NIB", icon: ShieldCheck },
  { id: "langkah-mengurus-nib", label: "Langkah Mengurus NIB", shortLabel: "Langkah Mengurus NIB", icon: ListChecks },
  { id: "biaya-waktu-proses", label: "Biaya & Waktu Proses", shortLabel: "Biaya & Waktu", icon: Clock },
  { id: "faq-seputar-nib", label: "FAQ Seputar NIB", shortLabel: "FAQ", icon: HelpCircle },
];

/* ─── 1. Apa itu NIB ─── */
export const PANDUAN_NIB_INTRO = {
  paragraphs: [
    "NIB (Nomor Induk Berusaha) adalah identitas resmi pelaku usaha yang diterbitkan oleh pemerintah melalui sistem OSS (Online Single Submission). NIB berlaku sebagai Tanda Daftar Perusahaan (TDP), Angka Pengenal Importir (API), dan akses kepabeanan dalam satu nomor identitas.",
  ],
  image: "/images/panduan-nib-kartu.png",
  imageAlt: "Ilustrasi kartu NIB — Nomor Induk Berusaha",
};

/* ─── 2. Syarat ─── */
export interface PanduanNibSyarat {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PANDUAN_NIB_SYARAT_LEAD =
  "Siapkan dokumen dan data berikut sebelum memulai pendaftaran NIB melalui OSS.";

export const PANDUAN_NIB_SYARAT: PanduanNibSyarat[] = [
  {
    title: "KTP Penanggung Jawab",
    description: "KTP masih berlaku",
    icon: IdCard,
  },
  {
    title: "NPWP (Jika ada)",
    description: "Lampirkan NPWP perusahaan atau pribadi",
    icon: FileCheck,
  },
  {
    title: "Email Aktif",
    description: "Digunakan untuk verifikasi dan notifikasi",
    icon: Mail,
  },
  {
    title: "Nomor Handphone Aktif",
    description: "Untuk menerima kode OTP",
    icon: Smartphone,
  },
  {
    title: "Aktivitas Usaha",
    description: "Tentukan jenis dan bidang usaha Anda",
    icon: Network,
  },
  {
    title: "Alamat Usaha",
    description: "Alamat lengkap sesuai dokumen legal",
    icon: House,
  },
];

/* ─── 3. Langkah ─── */
export interface PanduanNibLangkah {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PANDUAN_NIB_LANGKAH_LEAD =
  "Ikuti langkah-langkah berikut untuk mendapatkan NIB dengan mudah.";

export const PANDUAN_NIB_LANGKAH: PanduanNibLangkah[] = [
  {
    title: "Buat Akun OSS",
    description: "Kunjungi oss.go.id dan daftar akun baru.",
    icon: UserPlus,
  },
  {
    title: "Login ke OSS",
    description: "Login menggunakan email dan password yang telah didaftarkan.",
    icon: LogIn,
  },
  {
    title: "Lengkapi Data",
    description: "Isi data pelaku usaha, data usaha, dan data penanggung jawab.",
    icon: FileText,
  },
  {
    title: "Pilih KBLI",
    description: "Pilih Kode KBLI sesuai dengan bidang usaha Anda.",
    icon: ListChecks,
  },
  {
    title: "Perizinan Berusaha",
    description:
      "Pilih jenis perizinan yang dibutuhkan (NIB, Izin Usaha, atau Izin Komersial).",
    icon: FileCheck,
  },
  {
    title: "Cek & Terbitkan NIB",
    description:
      "Periksa data yang telah diisi. Jika sudah benar, NIB akan terbit secara otomatis.",
    icon: BadgeCheck,
  },
];

/* ─── 4. Biaya & Waktu ─── */
export interface PanduanNibInfoCard {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
}

export const PANDUAN_NIB_INFO: PanduanNibInfoCard[] = [
  {
    title: "Biaya",
    value: "GRATIS",
    description: "Pendaftaran NIB melalui sistem OSS tidak dikenakan biaya apapun.",
    icon: Wallet,
    image: "/images/panduan-nib-dompet.png",
    imageAlt: "Ilustrasi dompet — pendaftaran NIB gratis",
  },
  {
    title: "Waktu Proses",
    value: "1 — 3 Hari Kerja",
    description:
      "Proses penerbitan NIB biasanya memakan waktu 1 – 3 hari kerja setelah semua data lengkap.",
    icon: Clock,
    image: "/images/panduan-nib-jam.png",
    imageAlt: "Ilustrasi jam — estimasi waktu proses NIB",
  },
];

/* ─── 5. FAQ ─── */
export const PANDUAN_NIB_FAQ: { question: string; answer: string }[] = [
  {
    question: "Apakah NIB wajib untuk semua jenis usaha?",
    answer:
      "Ya. Setiap pelaku usaha, baik perorangan maupun badan usaha, wajib memiliki NIB sebagai identitas resmi untuk menjalankan kegiatan usaha secara legal di Indonesia.",
  },
  {
    question: "Apakah NIB berlaku selamanya?",
    answer:
      "Ya. NIB berlaku selama pelaku usaha masih menjalankan kegiatan usahanya dan tidak dicabut oleh pemerintah karena pelanggaran ketentuan.",
  },
  {
    question: "Apakah NIB sama dengan SIUP?",
    answer:
      "Tidak. NIB adalah identitas pelaku usaha, sedangkan SIUP adalah izin operasional perdagangan. Sejak berlakunya OSS, fungsi SIUP untuk sebagian besar usaha telah tergantikan oleh NIB dan perizinan berusaha berbasis risiko.",
  },
  {
    question: "Apakah NIB bisa berubah?",
    answer:
      "Bisa. Data NIB dapat diperbarui melalui sistem OSS apabila terjadi perubahan data usaha, misalnya perubahan alamat, bidang usaha (KBLI), atau penanggung jawab.",
  },
  {
    question: "Apakah NIB bisa diurus sendiri?",
    answer:
      "Bisa. Pendaftaran NIB dapat dilakukan sendiri melalui oss.go.id tanpa biaya. Namun jika ingin proses lebih cepat dan bebas kendala teknis, Anda dapat menggunakan jasa profesional seperti IzinPro.",
  },
  {
    question: "Apa yang harus dilakukan jika data NIB salah?",
    answer:
      "Segera lakukan perbaikan data melalui menu perubahan di sistem OSS. Pastikan seluruh data sesuai dokumen legal agar tidak menghambat proses perizinan berikutnya.",
  },
];

/* ─── Sidebar: kartu bantuan ─── */
export const PANDUAN_NIB_HELP = {
  title: "Butuh Bantuan Mengurus NIB?",
  description:
    "Tim ahli kami siap membantu Anda mendapatkan NIB dengan cepat, aman, dan 100% legal.",
  cta: "Konsultasikan Gratis",
  waMessage:
    "Halo IzinPro, saya membaca panduan mengurus NIB di website dan ingin dibantu mengurus NIB.",
};

/* ─── Sidebar: artikel terkait (artikel existing + thumbnail foto) ─── */
export interface PanduanNibRelated {
  slug: string;
  image: string;
}

export const PANDUAN_NIB_RELATED: PanduanNibRelated[] = [
  { slug: "cara-mudah-membuat-nib-online-2024", image: "/images/artikel-nib-vs-siup.jpg" },
  { slug: "apa-itu-oss-penjelasan-lengkap", image: "/images/artikel-akun-oss.jpg" },
  { slug: "update-peraturan-perizinan-2025", image: "/images/artikel-izin-umkm.jpg" },
  { slug: "tips-memilih-badan-usaha", image: "/images/artikel-importir-pemula.jpg" },
];
