/* ─── Data halaman Kontak /kontak (desain baru) ─── */

import type { LucideIcon } from "lucide-react";
import { Clock, Headset, Mail, MapPin } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

/* ─── Kartu info di bar bawah hero ─── */
export interface KontakInfoCard {
  icon: LucideIcon | "whatsapp";
  title: string;
  value: string;
  note: string;
}

export const KONTAK_INFO_CARDS: KontakInfoCard[] = [
  {
    icon: "whatsapp",
    title: "WhatsApp",
    value: COMPANY_INFO.whatsappDisplay,
    note: "Fast Response",
  },
  {
    icon: Mail,
    title: "Email",
    value: COMPANY_INFO.email,
    note: "Kirim Email",
  },
  {
    icon: Clock,
    title: "Jam Operasional",
    value: "Senin – Jumat",
    note: COMPANY_INFO.hours.replace("Senin – Jumat, ", ""),
  },
  {
    icon: Headset,
    title: "Konsultasi Gratis",
    value: "Dapatkan solusi terbaik",
    note: "untuk bisnis Anda",
  },
];

/* ─── Baris info kontak di sidebar form ─── */
export interface KontakChannel {
  icon: LucideIcon | "whatsapp";
  title: string;
  value: string;
  href: string;
}

export const KONTAK_CHANNELS: KontakChannel[] = [
  {
    icon: "whatsapp",
    title: "WhatsApp",
    value: `${COMPANY_INFO.whatsappDisplay} — chat langsung dengan tim kami`,
    href: `https://wa.me/${COMPANY_INFO.whatsapp}`,
  },
  {
    icon: Mail,
    title: "Email",
    value: `${COMPANY_INFO.email} — kirim pertanyaan melalui email`,
    href: `mailto:${COMPANY_INFO.email}`,
  },
  {
    icon: MapPin,
    title: "Alamat Kantor",
    value: COMPANY_INFO.address,
    href: COMPANY_INFO.mapsUrl,
  },
  {
    icon: Clock,
    title: "Jam Operasional",
    value: COMPANY_INFO.hours,
    href: `https://wa.me/${COMPANY_INFO.whatsapp}`,
  },
];

/* ─── FAQ singkat halaman kontak ─── */
export interface KontakFaq {
  question: string;
  answer: string;
}

export const KONTAK_FAQS: KontakFaq[] = [
  {
    question: "Berapa lama proses perizinan berlangsung?",
    answer:
      "Rata-rata 3–7 hari kerja tergantung jenis perizinan dan kelengkapan dokumen. Estimasi akurat kami sampaikan di awal konsultasi.",
  },
  {
    question: "Apakah bisa konsultasi terlebih dahulu sebelum memulai?",
    answer:
      "Tentu. Konsultasi awal sepenuhnya gratis — hubungi kami via WhatsApp atau isi form di halaman ini.",
  },
  {
    question: "Dokumen apa saja yang dibutuhkan?",
    answer:
      "Umumnya KTP & NPWP penanggung jawab, alamat usaha, dan email aktif. Kebutuhan detail per layanan akan dipandu tim kami.",
  },
  {
    question: "Apakah layanan tersedia untuk seluruh Indonesia?",
    answer:
      "Ya. Seluruh proses dapat dilakukan online, sehingga kami melayani klien dari seluruh Indonesia.",
  },
];
