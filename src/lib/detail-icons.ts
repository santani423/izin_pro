import {
  Award, Banknote, Briefcase, Building2, CircleDollarSign, ClipboardList, Clock,
  Factory, FileBadge, FileCheck2, FileText, Globe, Hotel, Landmark, MessagesSquare,
  Search, Send, ShieldCheck, Star, Stethoscope, Store, TrendingUp, UserCheck, Zap,
  type LucideIcon,
} from "lucide-react";

/* Registry ikon utk konten detail layanan (highlights/stats/benefits/proses
 * jenis izin) — Service.detailContent nyimpen ikon sbg string key (JSON gak
 * bisa nyimpen komponen React), lalu di-hydrate balik jadi LucideIcon di
 * server sebelum dirender (lihat src/lib/hydrate-layanan-detail.ts) biar
 * ke-8 komponen section (src/components/sections/LayananDetail*.tsx) gak
 * perlu berubah sama sekali. */
export const DETAIL_ICONS: Record<string, LucideIcon> = {
  award: Award,
  banknote: Banknote,
  briefcase: Briefcase,
  building: Building2,
  "circle-dollar-sign": CircleDollarSign,
  "clipboard-list": ClipboardList,
  clock: Clock,
  factory: Factory,
  "file-badge": FileBadge,
  "file-check": FileCheck2,
  "file-text": FileText,
  globe: Globe,
  hotel: Hotel,
  landmark: Landmark,
  "messages-square": MessagesSquare,
  search: Search,
  send: Send,
  "shield-check": ShieldCheck,
  star: Star,
  stethoscope: Stethoscope,
  store: Store,
  "trending-up": TrendingUp,
  "user-check": UserCheck,
  zap: Zap,
};

export const DEFAULT_DETAIL_ICON: LucideIcon = FileText;

export function resolveDetailIcon(key: string | null | undefined): LucideIcon {
  if (!key) return DEFAULT_DETAIL_ICON;
  return DETAIL_ICONS[key] ?? DEFAULT_DETAIL_ICON;
}

/* Ikon kartu "Jenis Layanan" (types.items) — dipilih otomatis berdasarkan
 * urutan index, bukan per-item custom (sama kayak perilaku asli di
 * layanan-detail.ts). */
export const TYPE_ICONS: LucideIcon[] = [FileBadge, Store, Briefcase, Factory, Hotel, Stethoscope];
