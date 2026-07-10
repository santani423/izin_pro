/* ─── Data halaman Detail Layanan /layanan/[slug] (desain baru) ───
 * Konten lengkap per layanan sesuai design UI/UX. Layanan yang belum punya
 * konten khusus mendapat fallback yang dibangun dari SERVICES (constants.ts)
 * lewat getLayananDetail() sehingga semua slug tetap tampil konsisten.
 */

import type { LucideIcon } from "lucide-react";
import {
  Award,
  Banknote,
  Briefcase,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Factory,
  FileBadge,
  FileCheck2,
  FileText,
  Globe,
  Hotel,
  Landmark,
  MessagesSquare,
  Search,
  Send,
  ShieldCheck,
  Star,
  Stethoscope,
  Store,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { SERVICES, TESTIMONIALS, FAQS } from "@/lib/constants";

/* ─── Tipe data ─── */
export interface DetailHighlight {
  icon: LucideIcon;
  label: string;
}

export interface DetailStat {
  icon: LucideIcon;
  value: string;
  label: string;
  /** Tampilkan deret bintang di bawah label (kartu kepuasan klien) */
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
  /** Label kecil di atas judul hero, mis. "Layanan NIB" */
  kicker: string;
  title: string;
  /** Baris hijau di bawah judul */
  tagline: string;
  description: string;
  highlights: DetailHighlight[];
  stats: DetailStat[];
  about: {
    title: string;
    paragraphs: string[];
    /** Checklist manfaat di kartu hijau (opsional — tanpa ini hanya gambar) */
    checklist?: string[];
    imageLabel: string;
    /** Badge lingkaran di atas gambar, mis. "Legal & Terpercaya" */
    badge?: string;
  };
  benefits?: {
    title: string;
    items: DetailBenefit[];
  };
  /** Jenis-jenis layanan (opsional — khusus mis. Izin Usaha) */
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

/* ─── Konten khusus per slug (sesuai design) ─── */
const LAYANAN_DETAILS: Record<string, LayananDetail> = {
  "pendirian-pt": {
    slug: "pendirian-pt",
    kicker: "Layanan",
    title: "Pendirian PT",
    tagline: "Mudah, Cepat & 100% Legal",
    description:
      "Kami membantu Anda mendirikan PT secara profesional sesuai regulasi hukum, dengan proses cepat, transparan, dan aman.",
    highlights: [
      { icon: Zap, label: "Proses Cepat & Efisien" },
      { icon: ShieldCheck, label: "Legal & Resmi 100%" },
      { icon: MessagesSquare, label: "Konsultasi Gratis" },
      { icon: CircleDollarSign, label: "Biaya Transparan" },
    ],
    stats: [
      { icon: Building2, value: "5.000+", label: "Perusahaan Terbantu" },
      { icon: Star, value: "99%", label: "Kepuasan Klien", withStars: true },
    ],
    about: {
      title: "Apa itu Pendirian PT?",
      paragraphs: [
        "Pendirian PT adalah proses hukum untuk mendirikan badan usaha berbentuk Perseroan Terbatas yang memiliki status badan hukum resmi dari negara.",
        "PT memberikan banyak keuntungan seperti perlindungan hukum, kredibilitas bisnis yang lebih tinggi, dan kemudahan dalam pengembangan usaha.",
      ],
      imageLabel: "Ilustrasi gedung perusahaan berbadan hukum",
      badge: "Legal & Terpercaya",
    },
    benefits: {
      title: "Keuntungan Mendirikan PT",
      items: [
        {
          icon: ShieldCheck,
          title: "Badan Hukum Resmi",
          description: "Diakui secara hukum dan dilindungi oleh negara.",
        },
        {
          icon: Star,
          title: "Kredibilitas Tinggi",
          description: "Meningkatkan kepercayaan klien, partner & investor.",
        },
        {
          icon: FileCheck2,
          title: "Akses Lebih Luas",
          description: "Memudahkan akses pendanaan, kerjasama & tender proyek.",
        },
        {
          icon: UserCheck,
          title: "Perlindungan Pribadi",
          description:
            "Harta pribadi pemilik tidak tercampur dengan aset perusahaan.",
        },
        {
          icon: TrendingUp,
          title: "Skalabilitas Mudah",
          description: "Mudah berkembang dan membuka cabang usaha lainnya.",
        },
      ],
    },
    process: {
      title: "Proses Pendirian PT",
      steps: [
        {
          icon: MessagesSquare,
          title: "Konsultasi",
          description: "Konsultasi kebutuhan & jenis usaha Anda.",
        },
        {
          icon: ClipboardList,
          title: "Pengumpulan Data",
          description: "Kami akan meminta data dan dokumen yang diperlukan.",
        },
        {
          icon: FileText,
          title: "Pembuatan Akta",
          description: "Pembuatan akta pendirian PT oleh notaris.",
        },
        {
          icon: Landmark,
          title: "Pengesahan",
          description: "Pengurusan SK Kemenkumham sebagai badan hukum.",
        },
        {
          icon: FileBadge,
          title: "Dokumen Selesai",
          description: "Seluruh dokumen lengkap siap diserahkan.",
        },
      ],
    },
    packages: {
      title: "Pilih Paket Pendirian PT",
      items: [
        {
          name: "Paket Basic",
          price: "Rp 3.500.000",
          features: ["Akta Pendirian", "SK Kemenkumham", "NPWP Perusahaan"],
        },
        {
          name: "Paket Standard",
          price: "Rp 5.500.000",
          features: [
            "Akta Pendirian",
            "SK Kemenkumham",
            "NPWP Perusahaan",
            "Dokumen Lengkap",
          ],
          popular: true,
        },
        {
          name: "Paket Premium",
          price: "Rp 7.500.000",
          features: [
            "Semua Layanan Standard",
            "SIUP / NIB",
            "Dokumen Perizinan Dasar",
          ],
        },
      ],
      documents: {
        title: "Dokumen yang Diperlukan",
        items: [
          "KTP Direksi & Komisaris",
          "NPWP Pribadi",
          "Alamat Usaha",
          "Email Aktif",
          "Nama Perusahaan & Bidang Usaha",
        ],
      },
      duration: {
        value: "3 – 7 Hari Kerja",
        note: "(tergantung kelengkapan data)",
      },
    },
    testimonials: {
      items: [
        {
          name: "Budi Santoso",
          role: "Direktur, CV Solusi Digital",
          content:
            "Proses cepat, tim ramah dan informatif. PT kami selesai kurang dari 5 hari kerja.",
        },
        {
          name: "Rina Wijaya",
          role: "Owner, PT Maju Bersama",
          content:
            "Pelayanan sangat profesional. Semua dijelaskan detail dan biayanya transparan.",
        },
        {
          name: "Ahmad Fauzi",
          role: "CEO, PT Artha Mandiri",
          content:
            "Dokumen lengkap dan legal. Sekarang bisnis kami lebih dipercaya klien.",
        },
        {
          name: "Dewi Lestari",
          role: "Direktur, PT Cipta Karya",
          content:
            "Tim sangat membantu dari awal sampai PT kami berdiri resmi.",
        },
      ],
      help: {
        title: "Butuh Bantuan?",
        description:
          "Konsultasikan kebutuhan pendirian PT Anda sekarang juga!",
      },
    },
    faqs: {
      title: "FAQ Seputar Pendirian PT",
      items: [
        {
          question: "Berapa lama proses pendirian PT?",
          answer:
            "Umumnya 3–7 hari kerja sejak dokumen lengkap, tergantung antrean pengesahan SK di Kemenkumham.",
        },
        {
          question: "Apakah saya harus datang langsung?",
          answer:
            "Tidak. Seluruh proses dapat dilakukan online — mulai dari konsultasi, pengiriman dokumen, hingga tanda tangan akta dapat difasilitasi secara elektronik.",
        },
        {
          question: "Berapa modal minimal pendirian PT?",
          answer:
            "Sesuai UU Cipta Kerja, besaran modal dasar PT ditentukan berdasarkan kesepakatan para pendiri tanpa nilai minimum tertentu, kecuali untuk bidang usaha tertentu yang diatur khusus.",
        },
        {
          question: "Apakah bisa 100% online?",
          answer:
            "Bisa. IzinPro melayani pendirian PT sepenuhnya online untuk klien di seluruh Indonesia.",
        },
      ],
    },
    cta: {
      title: "Siap Mendirikan PT Anda?",
      subtitle: "Percayakan pendirian PT Anda pada tim profesional kami.",
    },
  },

  nib: {
    slug: "nib",
    kicker: "Layanan NIB",
    title: "NIB (Nomor Induk Berusaha)",
    tagline: "Langkah Awal Legalitas Bisnis Anda",
    description:
      "Dapatkan NIB dengan mudah, cepat, dan resmi melalui sistem OSS (Online Single Submission).",
    highlights: [
      { icon: Clock, label: "Proses Cepat 1–3 Hari Kerja" },
      { icon: ShieldCheck, label: "Legal & Resmi 100%" },
      { icon: MessagesSquare, label: "Konsultasi Gratis" },
      { icon: CircleDollarSign, label: "Biaya Transparan" },
    ],
    stats: [
      { icon: Briefcase, value: "5.000+", label: "Pengusaha Terbantu" },
      { icon: Star, value: "99%", label: "Kepuasan Klien", withStars: true },
    ],
    about: {
      title: "Apa itu NIB?",
      paragraphs: [
        "NIB (Nomor Induk Berusaha) adalah identitas resmi pelaku usaha yang diterbitkan oleh pemerintah melalui sistem OSS. NIB berfungsi sebagai legalitas dasar untuk menjalankan kegiatan usaha.",
      ],
      checklist: [
        "Identitas resmi pelaku usaha",
        "Syarat utama perizinan dan akses fasilitas pemerintah",
        "Berlaku sebagai Tanda Daftar Perusahaan (TDP)",
        "Berlaku selamanya selama usaha berjalan",
      ],
      imageLabel: "Ilustrasi dokumen NIB",
    },
    benefits: {
      title: "Manfaat Memiliki NIB",
      items: [
        {
          icon: Award,
          title: "Legalitas Resmi",
          description: "Usaha menjadi sah dan diakui oleh pemerintah.",
        },
        {
          icon: Landmark,
          title: "Akses Perizinan",
          description: "Mempermudah pengajuan izin usaha lainnya.",
        },
        {
          icon: TrendingUp,
          title: "Kemudahan Berusaha",
          description: "Meningkatkan kepercayaan konsumen & mitra bisnis.",
        },
        {
          icon: Globe,
          title: "Kesempatan Lebih Luas",
          description: "Dapat mengikuti tender, kerja sama & ekspor.",
        },
        {
          icon: Banknote,
          title: "Fasilitas Pemerintah",
          description: "Akses ke program bantuan dan pembiayaan.",
        },
      ],
    },
    process: {
      title: "Proses Pembuatan NIB",
      steps: [
        {
          icon: MessagesSquare,
          title: "Konsultasi",
          description: "Sampaikan kebutuhan usaha Anda.",
        },
        {
          icon: ClipboardList,
          title: "Pengumpulan Data",
          description: "Kami akan meminta data dan dokumen yang diperlukan.",
        },
        {
          icon: Send,
          title: "Pengajuan OSS",
          description: "Pengajuan NIB melalui sistem OSS.",
        },
        {
          icon: FileCheck2,
          title: "NIB Terbit",
          description: "NIB Anda terbit dan siap digunakan.",
        },
        {
          icon: UserCheck,
          title: "Pendampingan",
          description: "Kami bantu hingga proses berjalan lancar.",
        },
      ],
    },
    packages: {
      title: "Pilih Paket NIB",
      items: [
        {
          name: "Paket Basic",
          price: "Rp 350.000",
          features: ["NIB Perorangan", "Konsultasi & Pendampingan"],
        },
        {
          name: "Paket Standard",
          price: "Rp 550.000",
          features: [
            "NIB Perusahaan (PT/CV/Firma)",
            "Konsultasi & Pendampingan",
            "Pengecekan KBLI Usaha",
            "Pengajuan NIB via OSS",
          ],
          popular: true,
        },
        {
          name: "Paket Premium",
          price: "Rp 850.000",
          features: [
            "NIB Perusahaan + PKKPR",
            "Konsultasi & Pendampingan",
            "Penyusunan KBLI Usaha",
            "Review Dokumen Usaha",
          ],
        },
      ],
      documents: {
        title: "Dokumen yang Diperlukan",
        items: [
          "KTP Penanggung Jawab",
          "NPWP (jika ada)",
          "Alamat Usaha",
          "Email Aktif",
          "Bidang Usaha / KBLI",
        ],
      },
      duration: {
        value: "1 – 3 Hari Kerja",
        note: "(tergantung kelengkapan data)",
      },
    },
    testimonials: {
      items: [
        {
          name: "Andi Setiawan",
          role: "Direktur, CV Maju Bersama",
          content: "Proses cepat dan mudah. NIB kami jadi dalam 2 hari!",
        },
        {
          name: "Siti Nurhaliza",
          role: "Owner, PT Sejahtera Abadi",
          content: "Pelayanan responsif dan sangat membantu.",
        },
        {
          name: "Budi Santoso",
          role: "CEO, PT Solusi Digital",
          content: "Sangat profesional, semua dijelaskan dengan jelas.",
        },
        {
          name: "Rina Wijaya",
          role: "Owner, CV Karya Mandiri",
          content: "NIB terbit tanpa ribet, terima kasih IzinPro!",
        },
      ],
      help: {
        title: "Butuh Bantuan?",
        description:
          "Tim kami siap membantu Anda mendapatkan NIB dengan cepat dan mudah.",
      },
    },
    faqs: {
      title: "FAQ Seputar NIB",
      items: [
        {
          question: "Apa itu NIB?",
          answer:
            "NIB (Nomor Induk Berusaha) adalah identitas resmi pelaku usaha yang diterbitkan pemerintah melalui sistem OSS dan menjadi legalitas dasar untuk menjalankan usaha.",
        },
        {
          question: "Berapa lama proses pembuatan NIB?",
          answer:
            "Umumnya 1–3 hari kerja sejak data dan dokumen Anda lengkap.",
        },
        {
          question: "Apakah NIB bisa diurus online?",
          answer:
            "Bisa. Seluruh proses dilakukan online melalui sistem OSS — tim kami yang mengurus prosesnya untuk Anda.",
        },
        {
          question: "Apakah NIB berlaku selamanya?",
          answer:
            "Ya, NIB berlaku selama usaha tetap berjalan dan data usaha tidak berubah. Perubahan data cukup dilaporkan melalui OSS.",
        },
        {
          question: "Apakah NIB sama dengan SIUP?",
          answer:
            "Berbeda. NIB adalah identitas pelaku usaha yang juga berlaku sebagai TDP, sedangkan SIUP adalah izin operasional perdagangan. Untuk banyak bidang usaha, fungsi SIUP kini sudah tercakup dalam NIB berbasis risiko.",
        },
        {
          question: "Apakah saya perlu datang ke kantor?",
          answer:
            "Tidak perlu. Semua proses dapat diselesaikan online dari mana saja di Indonesia.",
        },
      ],
    },
    cta: {
      title: "Mulai Legalitas Usaha Anda Sekarang!",
      subtitle:
        "Dapatkan NIB resmi dan tingkatkan peluang bisnis Anda bersama kami.",
    },
  },

  "izin-usaha": {
    slug: "izin-usaha",
    kicker: "Layanan Izin Usaha",
    title: "Izin Usaha",
    tagline: "Legalitas Lengkap untuk Kelancaran Bisnis Anda",
    description:
      "Kami membantu Anda mendapatkan berbagai jenis izin usaha sesuai bidang bisnis, cepat, aman, dan terpercaya.",
    highlights: [
      { icon: Zap, label: "Proses Cepat & Efisien" },
      { icon: ShieldCheck, label: "Legal & Resmi 100%" },
      { icon: UserCheck, label: "Tim Profesional Berpengalaman" },
      { icon: MessagesSquare, label: "Konsultasi Gratis" },
    ],
    stats: [
      { icon: FileCheck2, value: "2.000+", label: "Izin Usaha Diterbitkan" },
      { icon: Star, value: "98%", label: "Kepuasan Klien", withStars: true },
    ],
    about: {
      title: "Apa itu Izin Usaha?",
      paragraphs: [
        "Izin Usaha adalah dokumen legal yang dikeluarkan oleh instansi berwenang sebagai bukti sah bahwa kegiatan usaha Anda telah memenuhi persyaratan dan ketentuan yang berlaku.",
      ],
      checklist: [
        "Bukti legalitas usaha yang sah dan diakui pemerintah",
        "Membuka peluang kerja sama dan tender",
        "Meningkatkan kepercayaan pelanggan dan mitra",
        "Menghindari sanksi dan masalah hukum",
      ],
      imageLabel: "Ilustrasi dokumen izin usaha",
    },
    types: {
      title: "Jenis Izin Usaha yang Kami Tangani",
      items: [
        {
          title: "SIUP / NIB Usaha",
          description: "Legalitas dasar untuk menjalankan kegiatan bisnis.",
        },
        {
          title: "Izin Usaha Perdagangan (IUP)",
          description: "Untuk usaha impor dan ekspor perdagangan.",
        },
        {
          title: "Izin Usaha Jasa",
          description: "Untuk usaha di bidang jasa dan pelayanan.",
        },
        {
          title: "Izin Usaha Industri (IUI)",
          description: "Untuk usaha di bidang industri & manufaktur.",
        },
        {
          title: "Izin Usaha Pariwisata",
          description: "Untuk usaha di sektor pariwisata & perhotelan.",
        },
        {
          title: "Izin Usaha Kesehatan",
          description:
            "Untuk klinik, apotek, laboratorium, dan fasilitas kesehatan.",
        },
      ],
      linkLabel: "Lihat Semua Jenis Izin Usaha",
      linkHref: "/layanan",
    },
    process: {
      title: "Proses Pengurusan Izin Usaha",
      steps: [
        {
          icon: MessagesSquare,
          title: "Konsultasi",
          description: "Sampaikan kebutuhan izin usaha Anda.",
        },
        {
          icon: ClipboardList,
          title: "Pengumpulan Data",
          description: "Kami akan meminta data dan dokumen yang diperlukan.",
        },
        {
          icon: Search,
          title: "Pemeriksaan & Verifikasi",
          description:
            "Tim kami memeriksa dan memverifikasi kelengkapan data Anda.",
        },
        {
          icon: Landmark,
          title: "Pengajuan ke Instansi",
          description:
            "Dokumen diajukan ke instansi terkait sesuai jenis izin.",
        },
        {
          icon: FileCheck2,
          title: "Izin Terbit",
          description: "Izin usaha Anda terbit dan siap digunakan.",
        },
      ],
    },
    packages: {
      title: "Pilih Paket Izin Usaha",
      items: [
        {
          name: "Paket Basic",
          price: "Rp 1.000.000",
          features: [
            "Konsultasi & Analisa Kebutuhan",
            "Pengurusan 1 Jenis Izin Usaha",
          ],
        },
        {
          name: "Paket Standard",
          price: "Rp 2.500.000",
          features: [
            "Konsultasi & Analisa Kebutuhan",
            "Pengurusan Hingga 3 Jenis Izin",
            "Pendampingan & Revisi Dokumen",
            "Proses Lebih Cepat",
          ],
          popular: true,
        },
        {
          name: "Paket Premium",
          price: "Rp 5.000.000",
          features: [
            "Konsultasi & Analisa Kebutuhan",
            "Pengurusan Semua Jenis Izin",
            "Pendampingan Penuh",
            "Garansi Izin Terbit",
          ],
        },
      ],
      documents: {
        title: "Dokumen yang Diperlukan (Umum)",
        items: [
          "KTP Penanggung Jawab",
          "NPWP Perusahaan",
          "Akta Pendirian Perusahaan",
          "NIB Perusahaan",
          "Alamat Usaha",
          "Email Aktif & No. Telepon",
        ],
      },
      duration: {
        value: "3 – 14 Hari Kerja",
        note: "(tergantung jenis izin dan kelengkapan data)",
      },
    },
    testimonials: {
      items: [
        {
          name: "Budi Santoso",
          role: "Direktur, PT Solusi Digital",
          content:
            "Proses cepat dan mudah. Izin usaha kami terbit sesuai janji. Highly recommended!",
        },
        {
          name: "Rina Wijaya",
          role: "Owner, CV Karya Mandiri",
          content:
            "Pelayanan sangat profesional dan informatif. Semua dibantu sampai selesai.",
        },
        {
          name: "Ahmad Fauzi",
          role: "CEO, PT Artha Mandiri",
          content:
            "Terima kasih IzinPro, semua izin usaha kami beres tanpa ribet dan tepat waktu.",
        },
        {
          name: "Dewi Lestari",
          role: "Direktur, PT Cipta Karya",
          content:
            "Tim sangat responsif dan membantu mendapatkan izin dengan lancar.",
        },
      ],
      help: {
        title: "Butuh Bantuan Mengurus Izin Usaha?",
        description:
          "Konsultasikan kebutuhan Anda sekarang juga, GRATIS!",
      },
    },
    faqs: {
      title: "FAQ Seputar Izin Usaha",
      items: [
        {
          question: "Apa saja jenis izin usaha yang bisa diurus?",
          answer:
            "Hampir semua jenis: SIUP/NIB, izin perdagangan, izin jasa, izin industri, pariwisata, kesehatan, konstruksi, dan lainnya. Konsultasikan kebutuhan Anda untuk analisis jenis izin yang tepat.",
        },
        {
          question: "Berapa lama proses pengurusan izin usaha?",
          answer:
            "Umumnya 3–14 hari kerja, tergantung jenis izin dan kelengkapan data yang Anda siapkan.",
        },
        {
          question: "Apakah bisa mengurus lebih dari 1 izin sekaligus?",
          answer:
            "Bisa. Paket Standard mencakup hingga 3 jenis izin, dan Paket Premium mencakup semua jenis izin yang dibutuhkan bisnis Anda.",
        },
        {
          question: "Apakah izin usaha berlaku selamanya?",
          answer:
            "Tergantung jenisnya — sebagian berlaku selama usaha berjalan, sebagian perlu diperpanjang berkala. Masa berlaku setiap izin kami informasikan sejak awal.",
        },
        {
          question: "Apakah saya harus datang ke kantor?",
          answer:
            "Tidak. Seluruh proses dapat dilakukan online dari mana saja.",
        },
        {
          question: "Apakah bisa diurus di seluruh Indonesia?",
          answer:
            "Bisa. IzinPro melayani pengurusan izin usaha untuk klien di seluruh Indonesia.",
        },
      ],
    },
    cta: {
      title: "Legalitas Lengkap, Bisnis Semakin Maju!",
      subtitle:
        "Percayakan pengurusan izin usaha Anda kepada tim profesional kami.",
    },
  },
};

/* Ikon kartu jenis izin usaha — urutan sama dengan types.items */
export const TYPE_ICONS: LucideIcon[] = [
  FileBadge,
  Store,
  Briefcase,
  Factory,
  Hotel,
  Stethoscope,
];

/* ─── Harga paket fallback per slug ───
 * PLACEHOLDER — belum dikonfirmasi klien; ganti dengan harga resmi di sini.
 * Urutan: [Basic, Standard, Premium].
 */
const FALLBACK_PRICES: Record<string, [string, string, string]> = {
  "izin-komersial": ["Rp 2.500.000", "Rp 4.000.000", "Rp 6.000.000"],
  "perizinan-lainnya": ["Rp 1.500.000", "Rp 3.000.000", "Rp 5.000.000"],
  "pt-perorangan": ["Rp 1.500.000", "Rp 2.500.000", "Rp 4.000.000"],
  "cv-firma": ["Rp 3.000.000", "Rp 4.500.000", "Rp 6.000.000"],
  pma: ["Rp 8.000.000", "Rp 12.000.000", "Rp 18.000.000"],
  "npwp-badan-pkp": ["Rp 750.000", "Rp 1.500.000", "Rp 2.500.000"],
  "pendaftaran-merk": ["Rp 2.500.000", "Rp 4.000.000", "Rp 6.000.000"],
  "virtual-office": ["Rp 1.000.000", "Rp 2.000.000", "Rp 3.500.000"],
  "perizinan-lokasi": ["Rp 2.000.000", "Rp 3.500.000", "Rp 5.000.000"],
  sertifikasi: ["Rp 3.000.000", "Rp 5.000.000", "Rp 8.000.000"],
  "perizinan-impor": ["Rp 3.500.000", "Rp 5.500.000", "Rp 8.000.000"],
  "izin-industri": ["Rp 3.000.000", "Rp 5.000.000", "Rp 7.500.000"],
  "lingkungan-hidup": ["Rp 2.500.000", "Rp 4.000.000", "Rp 6.500.000"],
  "perizinan-konstruksi": ["Rp 4.000.000", "Rp 6.500.000", "Rp 10.000.000"],
  "perubahan-pembaruan-izin": ["Rp 1.000.000", "Rp 2.000.000", "Rp 3.500.000"],
};

/* ─── Fallback untuk slug tanpa konten khusus ───
 * Dibangun dari SERVICES agar semua halaman detail tetap konsisten.
 */
function buildFallbackDetail(slug: string): LayananDetail | null {
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return null;

  const [basicPrice, standardPrice, premiumPrice] = FALLBACK_PRICES[slug] ?? [
    "Rp 1.500.000",
    "Rp 3.000.000",
    "Rp 5.000.000",
  ];

  return {
    slug,
    kicker: "Layanan",
    title: service.title,
    tagline: "Cepat, Mudah & 100% Legal",
    description: service.description,
    highlights: [
      { icon: Zap, label: "Proses Cepat & Efisien" },
      { icon: ShieldCheck, label: "Legal & Resmi 100%" },
      { icon: MessagesSquare, label: "Konsultasi Gratis" },
      { icon: CircleDollarSign, label: "Biaya Transparan" },
    ],
    stats: [
      { icon: FileCheck2, value: "5.000+", label: "Perizinan Terselesaikan" },
      { icon: Star, value: "99%", label: "Kepuasan Klien", withStars: true },
    ],
    about: {
      title: `Apa itu ${service.title}?`,
      paragraphs: [service.description],
      checklist: service.features,
      imageLabel: `Ilustrasi layanan ${service.title}`,
    },
    process: {
      title: `Proses Pengurusan ${service.title}`,
      steps: [
        {
          icon: MessagesSquare,
          title: "Konsultasi",
          description: "Konsultasi awal gratis via WhatsApp.",
        },
        {
          icon: ClipboardList,
          title: "Pengumpulan Data",
          description: "Kami akan meminta data dan dokumen yang diperlukan.",
        },
        {
          icon: Send,
          title: "Pengajuan",
          description: "Pengajuan ke instansi terkait.",
        },
        {
          icon: Clock,
          title: "Monitoring",
          description: "Monitoring proses secara berkala.",
        },
        {
          icon: FileCheck2,
          title: "Selesai",
          description: "Perizinan selesai & dokumen diserahkan.",
        },
      ],
    },
    packages: {
      title: `Pilih Paket ${service.title}`,
      items: [
        {
          name: "Paket Basic",
          price: basicPrice,
          features: [
            "Konsultasi & Analisa Kebutuhan",
            `Pengurusan ${service.title}`,
            "Pendampingan Proses",
          ],
        },
        {
          name: "Paket Standard",
          price: standardPrice,
          features: [
            "Konsultasi & Analisa Kebutuhan",
            `Pengurusan ${service.title}`,
            "Pengecekan & Persiapan Dokumen",
            "Proses Lebih Cepat",
          ],
          popular: true,
        },
        {
          name: "Paket Premium",
          price: premiumPrice,
          features: [
            "Konsultasi & Analisa Kebutuhan",
            `Pengurusan ${service.title}`,
            "Pendampingan Penuh",
            "Prioritas Pengerjaan",
            "Garansi Selesai",
          ],
        },
      ],
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
      duration: {
        value: "3 – 7 Hari Kerja",
        note: "(tergantung kelengkapan data)",
      },
    },
    testimonials: {
      items: TESTIMONIALS.slice(0, 4).map((t) => ({
        name: t.name,
        role: `${t.role}, ${t.company}`,
        content: t.content,
      })),
      help: {
        title: "Butuh Bantuan?",
        description: `Konsultasikan kebutuhan ${service.title} Anda sekarang juga!`,
      },
    },
    faqs: {
      title: "Pertanyaan yang Sering Diajukan",
      items: FAQS,
    },
  };
}

/* ─── Ambil detail layanan per slug (null bila slug tak dikenal) ─── */
export function getLayananDetail(slug: string): LayananDetail | null {
  return LAYANAN_DETAILS[slug] ?? buildFallbackDetail(slug);
}
