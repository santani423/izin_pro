/* ─── Data halaman Legalitas Lengkap, Bisnis Makin Terpercaya ───
 * Konten khusus artikel /blog/legalitas-lengkap-bisnis-makin-terpercaya
 * (desain baru bergaya landing page, terpisah dari template artikel lama).
 */

import {
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  FilePlus,
  FileSearch,
  FileText,
  Handshake,
  Headset,
  HelpCircle,
  IdCard,
  Leaf,
  ListChecks,
  MessageSquare,
  Scale,
  Send,
  Ship,
  ShieldCheck,
  Tag,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const PANDUAN_LEGALITAS_SLUG = "legalitas-lengkap-bisnis-makin-terpercaya";

/* ─── Hero ─── */
export const PANDUAN_LEGALITAS_HERO = {
  kicker: "Panduan Lengkap",
  titleLead: "Legalitas Lengkap, Bisnis",
  titleHighlight: "Makin Terpercaya",
  description:
    "Miliki semua legalitas usaha yang dibutuhkan untuk menjalankan bisnis secara aman, profesional, dan dipercaya oleh klien maupun mitra.",
  cta: "Konsultasikan Sekarang",
  waMessage:
    "Halo IzinPro, saya membaca panduan legalitas usaha di website dan ingin konsultasi mengenai legalitas bisnis saya.",
  image: "/images/panduan-legalitas-hero.jpg",
  imageAlt:
    "Konsultan IzinPro mendampingi klien membahas legalitas usaha — 5.000+ klien puas, 99% tingkat keberhasilan",
};

export interface PanduanLegalitasChip {
  label: string;
  icon: LucideIcon;
}

export const PANDUAN_LEGALITAS_CHIPS: PanduanLegalitasChip[] = [
  { label: "100% Resmi & Legal", icon: BadgeCheck },
  { label: "Proses Cepat & Mudah", icon: Zap },
  { label: "Tim Profesional Berpengalaman", icon: Users },
  { label: "Konsultasi Gratis", icon: MessageSquare },
];

/* ─── Navigasi antar bagian (Daftar Isi) ─── */
export interface PanduanLegalitasNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const PANDUAN_LEGALITAS_NAV: PanduanLegalitasNavItem[] = [
  { id: "mengapa-legalitas-penting", label: "Mengapa Legalitas Penting?", icon: Scale },
  { id: "legalitas-yang-kami-tangani", label: "Legalitas Usaha yang Kami Tangani", icon: FileText },
  { id: "proses-layanan", label: "Proses Layanan", icon: ListChecks },
  { id: "keunggulan-izinpro", label: "Keunggulan IzinPro", icon: BadgeCheck },
  { id: "faq-legalitas", label: "FAQ Seputar Legalitas Usaha", icon: HelpCircle },
];

/* ─── 1. Mengapa legalitas penting ─── */
export const PANDUAN_LEGALITAS_PENTING = {
  title: "Mengapa Legalitas Usaha Itu Penting?",
  icon: Scale,
  paragraph:
    "Dengan legalitas yang lengkap, bisnis Anda akan lebih kredibel, terhindar dari risiko hukum, dan membuka lebih banyak peluang, seperti akses pendanaan, kemitraan, dan tender proyek.",
  bullets: [
    "Menambah kepercayaan pelanggan & mitra",
    "Memenuhi persyaratan tender & kerjasama",
    "Menghindari sanksi & masalah hukum",
    "Mendukung pertumbuhan bisnis jangka panjang",
  ],
};

/* ─── 2. Legalitas yang kami tangani ─── */
export interface PanduanLegalitasLayanan {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PANDUAN_LEGALITAS_LAYANAN: PanduanLegalitasLayanan[] = [
  {
    title: "Pendirian PT",
    description: "Dirikan PT secara legal dan profesional.",
    icon: Building2,
  },
  {
    title: "NIB (Nomor Induk Berusaha)",
    description: "Langkah awal legalitas melalui sistem OSS.",
    icon: IdCard,
  },
  {
    title: "Izin Usaha",
    description: "Berbagai jenis izin usaha sesuai bidang bisnis Anda.",
    icon: FileText,
  },
  {
    title: "Izin Komersial & Operasional",
    description: "Untuk kegiatan komersial dan operasional perusahaan.",
    icon: Briefcase,
  },
  {
    title: "Sertifikat Standar (SS)",
    description: "Sertifikat standar untuk meningkatkan kredibilitas produk/jasa.",
    icon: Award,
  },
  {
    title: "Izin Impor",
    description: "Urus izin impor dengan mudah dan sesuai regulasi.",
    icon: Ship,
  },
  {
    title: "Izin Lingkungan",
    description: "Dokumen lingkungan untuk menjamin kelestarian dan kepatuhan.",
    icon: Leaf,
  },
  {
    title: "Perizinan Lainnya",
    description: "Berbagai perizinan lain sesuai kebutuhan bisnis Anda.",
    icon: FilePlus,
  },
];

/* ─── 3. Proses layanan ─── */
export interface PanduanLegalitasProses {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PANDUAN_LEGALITAS_PROSES: PanduanLegalitasProses[] = [
  {
    title: "Konsultasi",
    description: "Sampaikan kebutuhan legalitas usaha Anda.",
    icon: MessageSquare,
  },
  {
    title: "Analisis Kebutuhan",
    description: "Kami analisis jenis legalitas yang dibutuhkan.",
    icon: FileSearch,
  },
  {
    title: "Pengumpulan Data",
    description: "Siapkan dan kumpulkan dokumen yang diperlukan.",
    icon: ClipboardList,
  },
  {
    title: "Proses Pengurusan",
    description: "Kami urus legalitas Anda hingga selesai.",
    icon: Send,
  },
  {
    title: "Dokumen Terbit",
    description: "Legalitas terbit dan siap digunakan.",
    icon: CheckCircle2,
  },
  {
    title: "Pendampingan",
    description: "Kami dampingi hingga legalitas aktif & sesuai.",
    icon: Handshake,
  },
];

/* ─── 4. Keunggulan IzinPro ─── */
export interface PanduanLegalitasKeunggulan {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PANDUAN_LEGALITAS_KEUNGGULAN: PanduanLegalitasKeunggulan[] = [
  {
    title: "Tim Profesional & Berpengalaman",
    description: "Berpengalaman mengurus ribuan legalitas usaha berbagai bidang.",
    icon: Users,
  },
  {
    title: "Proses Cepat & Efisien",
    description: "Proses pengurusan cepat, efisien, dan tepat waktu.",
    icon: Clock,
  },
  {
    title: "Aman & Terpercaya",
    description: "Dokumen dijamin resmi, aman, dan sesuai regulasi.",
    icon: ShieldCheck,
  },
  {
    title: "Konsultasi Gratis",
    description: "Konsultasi gratis untuk semua kebutuhan legalitas Anda.",
    icon: Headset,
  },
  {
    title: "Harga Transparan",
    description: "Biaya jelas, tanpa biaya tambahan tersembunyi.",
    icon: Tag,
  },
];

/* ─── 5. FAQ ─── */
export const PANDUAN_LEGALITAS_FAQ: { question: string; answer: string }[] = [
  {
    question: "Apa saja legalitas usaha yang wajib dimiliki?",
    answer:
      "Minimal setiap usaha wajib memiliki NIB sebagai identitas pelaku usaha. Selebihnya tergantung jenis dan skala bisnis — misalnya akta pendirian untuk badan usaha, izin usaha sesuai bidang, sertifikat standar, hingga izin komersial & operasional.",
  },
  {
    question: "Apakah legalitas berlaku di seluruh Indonesia?",
    answer:
      "Ya. Legalitas yang diterbitkan melalui sistem OSS berlaku secara nasional. Namun beberapa kegiatan usaha tertentu tetap memerlukan izin tambahan dari pemerintah daerah setempat.",
  },
  {
    question: "Berapa lama proses pengurusan legalitas usaha?",
    answer:
      "Tergantung jenis legalitasnya — NIB bisa terbit dalam hitungan hari, sedangkan pendirian PT lengkap dengan izin turunannya umumnya membutuhkan 1–2 minggu selama dokumen persyaratan lengkap.",
  },
  {
    question: "Apakah saya perlu datang ke kantor?",
    answer:
      "Tidak perlu. Seluruh proses dapat dilakukan secara online — mulai dari konsultasi, pengumpulan dokumen, hingga penerbitan legalitas. Tim kami akan memandu Anda di setiap tahap.",
  },
  {
    question: "Apakah bisa mengurus legalitas jika usaha masih baru?",
    answer:
      "Sangat bisa. Justru sebaiknya legalitas diurus sejak awal usaha berdiri agar bisnis berjalan aman, kredibel, dan siap mengambil peluang kerjasama maupun pendanaan.",
  },
  {
    question: "Bagaimana jika dokumen usaha saya belum lengkap?",
    answer:
      "Tidak masalah. Tim kami akan membantu meninjau dokumen yang sudah ada, memberi tahu kekurangannya, dan mendampingi Anda melengkapinya hingga proses pengurusan bisa berjalan.",
  },
];

/* ─── Sidebar: kartu bantuan ─── */
export const PANDUAN_LEGALITAS_HELP = {
  title: "Butuh Bantuan Menentukan Legalitas yang Tepat?",
  description:
    "Tim kami siap membantu Anda memilih legalitas usaha yang sesuai dengan kebutuhan bisnis Anda secara gratis.",
  cta: "Konsultasikan Gratis",
  waMessage:
    "Halo IzinPro, saya ingin dibantu menentukan legalitas usaha yang tepat untuk bisnis saya.",
};

/* ─── Sidebar: kartu checklist gratis ─── */
export const PANDUAN_LEGALITAS_CHECKLIST = {
  title: "Gratis! Checklist Legalitas Usaha untuk Bisnis Anda",
  description:
    "Dapatkan checklist lengkap legalitas usaha sesuai jenis bisnis Anda.",
  cta: "Unduh Sekarang",
  image: "/images/panduan-legalitas-checklist.jpg",
  imageAlt: "Mockup dokumen Checklist Legalitas Usaha dari IzinPro",
};
