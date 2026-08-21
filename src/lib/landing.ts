/* ─── Data landing page (desain homepage baru) ───
 * Dipisah dari constants.ts agar tidak tabrakan dengan exports existing
 * (SERVICES, TESTIMONIALS, PROMOS, dll) yang dipakai halaman lain & admin.
 */

import type { LucideIcon } from "lucide-react";
import { Zap, ShieldCheck, Users } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";


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

/* ─── Kontak (derivasi dari COMPANY_INFO agar satu sumber data) ─── */
export interface LandingContactInfo {
  address: string;
  addressShort: string;
  phone: string;
  email: string;
  whatsapp: string;
  hours: string;
  mapsUrl: string;
}

export const CONTACT_INFO: LandingContactInfo = {
  address: COMPANY_INFO.address,
  addressShort: COMPANY_INFO.addressShort,
  phone: COMPANY_INFO.whatsappDisplay,
  email: COMPANY_INFO.email,
  whatsapp: COMPANY_INFO.whatsapp,
  hours: COMPANY_INFO.hours,
  mapsUrl: COMPANY_INFO.mapsUrl,
};

/* ─── Util ─── */
export const WHATSAPP_URL = `https://wa.me/${COMPANY_INFO.whatsapp}`;
