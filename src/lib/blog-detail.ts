/* ─── Data halaman Detail Artikel /blog/[slug] (desain baru) ───
 * Artikel dengan konten lengkap didefinisikan di ARTICLE_DETAILS;
 * artikel lain mendapat fallback generik dari BLOG_POSTS.
 */

import { BLOG_POSTS } from "@/lib/constants";

/* ─── Blok konten artikel ─── */
export type ArticleBlock =
  | {
      type: "text";
      heading: string;
      paragraphs: string[];
      imageLabel?: string;
    }
  | {
      type: "cards";
      heading: string;
      lead?: string;
      items: { title: string; description: string }[];
    }
  | {
      type: "steps";
      heading: string;
      lead?: string;
      steps: { title: string; description: string }[];
    }
  | {
      type: "info";
      heading: string;
      items: { title: string; value: string; description: string }[];
    }
  | {
      type: "faq";
      heading: string;
      items: { question: string; answer: string }[];
    };

export interface ArticleDetail {
  slug: string;
  /** Chip kecil di hero, mis. "100% Online" */
  chips: string[];
  /** Bullet di kartu Ringkasan Artikel */
  summary: string[];
  blocks: ArticleBlock[];
  /** Kartu bantuan di sidebar */
  help: { title: string; description: string };
}

/* ─── Konten lengkap per slug ─── */
const ARTICLE_DETAILS: Record<string, ArticleDetail> = {
  "cara-mudah-membuat-nib-online-2024": {
    slug: "cara-mudah-membuat-nib-online-2024",
    chips: ["100% Online", "Resmi & Legal", "Proses Cepat", "Gratis"],
    summary: [
      "NIB adalah identitas resmi pelaku usaha yang diterbitkan oleh pemerintah melalui sistem OSS.",
      "Dokumen ini menjadi syarat utama untuk memulai dan menjalankan usaha secara legal di Indonesia.",
    ],
    blocks: [
      {
        type: "text",
        heading: "Apa itu NIB?",
        paragraphs: [
          "NIB (Nomor Induk Berusaha) adalah identitas resmi pelaku usaha yang diterbitkan oleh pemerintah melalui sistem OSS (Online Single Submission). NIB berlaku sebagai Tanda Daftar Perusahaan (TDP), Angka Pengenal Importir (API), dan akses kepabeanan dalam satu nomor identitas.",
        ],
        imageLabel: "Ilustrasi dokumen NIB",
      },
      {
        type: "cards",
        heading: "Syarat Mengurus NIB",
        lead: "Siapkan dokumen dan data berikut sebelum memulai pendaftaran NIB melalui OSS.",
        items: [
          {
            title: "KTP Penanggung Jawab",
            description: "KTP masih berlaku.",
          },
          {
            title: "NPWP (Jika ada)",
            description: "Lampirkan NPWP perusahaan atau pribadi.",
          },
          {
            title: "Email Aktif",
            description: "Digunakan untuk verifikasi dan notifikasi.",
          },
          {
            title: "Nomor Handphone Aktif",
            description: "Untuk menerima kode OTP.",
          },
          {
            title: "Aktivitas Usaha",
            description: "Tentukan jenis dan bidang usaha Anda.",
          },
          {
            title: "Alamat Usaha",
            description: "Alamat lengkap sesuai dokumen legal.",
          },
        ],
      },
      {
        type: "steps",
        heading: "Langkah Mengurus NIB Melalui OSS",
        lead: "Ikuti langkah-langkah berikut untuk mendapatkan NIB dengan mudah.",
        steps: [
          {
            title: "Buat Akun OSS",
            description: "Kunjungi oss.go.id dan daftar akun baru.",
          },
          {
            title: "Login ke OSS",
            description:
              "Login menggunakan email dan password yang telah didaftarkan.",
          },
          {
            title: "Lengkapi Data",
            description:
              "Isi data pelaku usaha, data usaha, dan data penanggung jawab.",
          },
          {
            title: "Pilih KBLI",
            description: "Pilih kode KBLI sesuai dengan bidang usaha Anda.",
          },
          {
            title: "Perizinan Berusaha",
            description:
              "Pilih jenis perizinan yang dibutuhkan (NIB, Izin Usaha, atau Izin Komersial).",
          },
          {
            title: "Cek & Terbitkan NIB",
            description:
              "Periksa data yang telah diisi. Jika sudah benar, NIB akan terbit secara otomatis.",
          },
        ],
      },
      {
        type: "info",
        heading: "Biaya & Waktu Proses",
        items: [
          {
            title: "Biaya",
            value: "GRATIS",
            description:
              "Pendaftaran NIB melalui sistem OSS tidak dikenakan biaya apapun.",
          },
          {
            title: "Waktu Proses",
            value: "1 – 3 Hari Kerja",
            description:
              "Proses penerbitan NIB biasanya memakan waktu 1–3 hari kerja setelah semua data lengkap.",
          },
        ],
      },
      {
        type: "faq",
        heading: "FAQ Seputar NIB",
        items: [
          {
            question: "Apakah NIB wajib untuk semua jenis usaha?",
            answer:
              "Ya, semua pelaku usaha — dari UMK hingga perusahaan besar — wajib memiliki NIB sebagai legalitas dasar menjalankan usaha.",
          },
          {
            question: "Apakah NIB berlaku selamanya?",
            answer:
              "Ya, NIB berlaku selama usaha tetap berjalan dan tidak ada perubahan data yang belum dilaporkan.",
          },
          {
            question: "Apakah NIB sama dengan SIUP?",
            answer:
              "Berbeda. NIB adalah identitas pelaku usaha, sedangkan SIUP adalah izin operasional perdagangan. Untuk banyak bidang usaha, fungsi SIUP kini sudah tercakup dalam NIB berbasis risiko.",
          },
          {
            question: "Apakah NIB bisa berubah?",
            answer:
              "Bisa. Perubahan data usaha (alamat, KBLI, modal, dsb.) dapat dilakukan melalui menu perubahan di sistem OSS.",
          },
          {
            question: "Apakah NIB bisa diurus sendiri?",
            answer:
              "Bisa, melalui oss.go.id secara gratis. Namun jika ingin praktis dan bebas salah input, tim IzinPro siap membantu prosesnya sampai terbit.",
          },
          {
            question: "Apa yang harus dilakukan jika data NIB salah?",
            answer:
              "Segera lakukan perbaikan data melalui sistem OSS, atau hubungi tim IzinPro untuk didampingi proses koreksinya.",
          },
        ],
      },
    ],
    help: {
      title: "Butuh Bantuan Mengurus NIB?",
      description:
        "Tim ahli kami siap membantu Anda mendapatkan NIB dengan cepat, aman, dan 100% legal.",
    },
  },
};

/* ─── Fallback artikel tanpa konten khusus ─── */
function buildFallbackDetail(slug: string): ArticleDetail | null {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return null;

  return {
    slug,
    chips: ["Terverifikasi", "Resmi & Legal", "Update Terbaru", "Gratis Konsultasi"],
    summary: [post.excerpt],
    blocks: [
      {
        type: "text",
        heading: "Poin Penting",
        paragraphs: [
          post.excerpt,
          "Regulasi perizinan di Indonesia terus berkembang. Pastikan Anda selalu mengikuti ketentuan terbaru agar bisnis tetap patuh dan berjalan lancar.",
        ],
        imageLabel: `Ilustrasi artikel ${post.title}`,
      },
      {
        type: "text",
        heading: "Bagaimana IzinPro Dapat Membantu?",
        paragraphs: [
          "Tim IzinPro siap mendampingi Anda mengurus seluruh kebutuhan legalitas dan perizinan usaha — mulai dari konsultasi gratis, persiapan dokumen, hingga izin terbit. Hubungi kami untuk solusi yang sesuai dengan bisnis Anda.",
        ],
      },
    ],
    help: {
      title: "Butuh Bantuan Perizinan?",
      description:
        "Tim ahli kami siap membantu kebutuhan legalitas dan perizinan bisnis Anda secara cepat dan aman.",
    },
  };
}

/* ─── Ambil detail artikel per slug (null bila slug tak dikenal) ─── */
export function getArticleDetail(slug: string): ArticleDetail | null {
  return ARTICLE_DETAILS[slug] ?? buildFallbackDetail(slug);
}
