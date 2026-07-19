/* ─── Statistik statis halaman Testimoni Klien /testimoni ───
 * Data testimoni asli sekarang dari Prisma (lihat lib/testimonials-data.ts);
 * file ini tinggal menyimpan angka statistik yang bukan bagian model Testimonial. */

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

