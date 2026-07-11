/* ─── Data halaman Tentang IzinPro /tentang-kami (desain baru) ─── */

import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  FileCheck2,
  HeartHandshake,
  Receipt,
  ShieldCheck,
  Smile,
  UserCheck,
} from "lucide-react";

/* ─── Statistik ringkas di section Tentang Kami ─── */
export interface TentangStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const TENTANG_STATS: TentangStat[] = [
  { icon: FileCheck2, value: "5.000+", label: "Perizinan Selesai" },
  { icon: Smile, value: "99%", label: "Kepuasan Klien" },
  { icon: Award, value: "10+", label: "Tahun Pengalaman" },
];

/* ─── Nilai-nilai perusahaan ─── */
export interface TentangValue {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const TENTANG_VALUES: TentangValue[] = [
  {
    icon: ShieldCheck,
    title: "Integritas",
    description:
      "Kami bekerja dengan jujur, amanah, dan bertanggung jawab dalam setiap layanan.",
  },
  {
    icon: UserCheck,
    title: "Profesional",
    description:
      "Didukung oleh tim ahli yang berpengalaman dan kompeten di bidang perizinan.",
  },
  {
    icon: Clock,
    title: "Efisien",
    description:
      "Proses cepat dan tepat waktu untuk menghemat waktu berharga Anda.",
  },
  {
    icon: Receipt,
    title: "Transparan",
    description:
      "Informasi jelas, biaya terbuka, dan proses terpantau dengan baik.",
  },
  {
    icon: HeartHandshake,
    title: "Fokus pada Klien",
    description:
      "Kepuasan klien adalah prioritas utama dalam setiap layanan yang kami berikan.",
  },
];

/* ─── Misi ─── */
export const TENTANG_MISSION: string[] = [
  "Memberikan layanan perizinan yang cepat, mudah, dan akurat.",
  "Memberikan solusi terbaik sesuai kebutuhan bisnis klien.",
  "Menjaga kepatuhan terhadap peraturan dan perundang-undangan.",
  "Membangun hubungan jangka panjang dengan klien berdasarkan kepercayaan.",
];

export const TENTANG_VISION =
  "Menjadi perusahaan jasa perizinan terdepan dan paling terpercaya di Indonesia.";

/* ─── Tim ─── */
export interface TentangTeamMember {
  name: string;
  role: string;
}

export const TENTANG_TEAM: TentangTeamMember[] = [
  { name: "Andi Setiawan", role: "CEO & Founder" },
  { name: "Siti Nurhaliza", role: "Senior Legal Consultant" },
  { name: "Budi Santoso", role: "Business Consultant" },
  { name: "Rina Wijaya", role: "Client Relations" },
];
