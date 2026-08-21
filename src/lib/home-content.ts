import { HERO_HIGHLIGHTS } from "@/lib/landing";
import type { VideoDialogSource } from "@/components/shared/VideoDialog";

/* Tipe & default konten Hero/AboutHome sengaja ditaruh di sini (bukan di
 * HeroSection.tsx / AboutSection.tsx yang "use client") — Server Component
 * yang import const dari file "use client" cuma dapet client reference
 * (stub), bukan objek aslinya, jadi akses nested property (mis.
 * DEFAULT_ABOUT_HOME_CONTENT.video.type) di server bakal undefined/crash. */

export interface HeroContentData {
  titleLine1: string;
  titleHighlight: string;
  titleLine3: string;
  subtitle: string;
  highlights: { title: string; subtitle: string }[];
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  // null/undefined = pakai kartu gradient placeholder bawaan di bawah
  imageUrl?: string | null;
}

/* Default = copy asli (dipakai kalau HeroContent belum ke-seed / gagal
 * diambil) — jangan sampai beranda tampil kosong gara-gara DB kosong. */
export const DEFAULT_HERO_CONTENT: HeroContentData = {
  titleLine1: "Solusi Perizinan",
  titleHighlight: "Bisnis Anda,",
  titleLine3: "Aman & Terpercaya",
  subtitle:
    "IzinPro hadir untuk membantu bisnis Anda mengurus perizinan dengan mudah, cepat, dan sesuai regulasi.",
  highlights: HERO_HIGHLIGHTS.map(({ title, subtitle }) => ({ title, subtitle })),
  ctaPrimaryLabel: "Konsultasikan Gratis",
  ctaSecondaryLabel: "Lihat Semua Layanan",
  ctaSecondaryHref: "/layanan",
  imageUrl: null,
};

export interface AboutHomeContentData {
  heading: string;
  description: string;
  points: string[];
  buttonLabel: string;
  buttonHref: string;
  videoTitle: string;
  video: VideoDialogSource;
}

/* Default = copy asli (dipakai kalau AboutHomeContent belum ke-seed / gagal
 * diambil) — jangan sampai section ini tampil kosong gara-gara DB kosong. */
export const DEFAULT_ABOUT_HOME_CONTENT: AboutHomeContentData = {
  heading: "Tentang IzinPro",
  description:
    "IzinPro adalah penyedia jasa layanan perizinan bisnis terpercaya yang berkomitmen memberikan layanan terbaik dengan proses cepat, transparan, dan aman.",
  points: [
    "Legal & Resmi",
    "Proses Cepat & Efisien",
    "Konsultasi Gratis & Transparan",
    "Layanan Terlengkap & Terpercaya",
  ],
  buttonLabel: "Selengkapnya Tentang Kami",
  buttonHref: "/tentang-kami",
  videoTitle: "Video profil IzinPro",
  video: { type: "youtube", embedUrl: "https://www.youtube.com/embed/kXz2t48t4zo" },
};
