/* ─── Data landing page (desain homepage baru) ───
 * Dipisah dari constants.ts agar tidak tabrakan dengan exports existing
 * (SERVICES, TESTIMONIALS, PROMOS, dll) yang dipakai halaman lain & admin.
 */

import type { LucideIcon } from "lucide-react";
import { Zap, ShieldCheck, Users } from "lucide-react";


/* ─── Hero ─── */
export interface HeroHighlight {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export const HERO_HIGHLIGHTS: HeroHighlight[] = [
  { icon: Zap, title: "Proses Cepat", subtitle: "& Efisien" },
  { icon: ShieldCheck, title: "Legal & Resmi", subtitle: "100%" },
  { icon: Users, title: "Tim Profesional", subtitle: "Berpengalaman" },
];

/* ─── Promo ─── (data sekarang dari Prisma PromoBanner, lihat lib/promo-data.ts) */
export interface LandingPromo {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string | null;
  // null = pakai kartu gradient/warna bawaan per variant (lihat VARIANT_STYLES di PromoSection)
  imageUrl: string | null;
  variant: "discount" | "free" | "package";
}

/* ─── Tentang ─── (data sekarang dari Prisma AboutHomeContent, lihat getAboutHomeContent() di (public)/page.tsx) */

/* ─── Kontak: dipindah ke Settings (Prisma) — lihat getLocalizedGeneralSettings()
 * di server & useWhatsappUrl()/LocaleProvider di client, bukan lagi konstanta
 * statis di sini. */
