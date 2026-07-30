import {
  Award, BadgeCheck, Banknote, Briefcase, Building2, CircleDollarSign, ClipboardList, Clock,
  Factory, FileBadge, FileCheck2, FileText, Globe, HeartHandshake, Headset, Hotel, Landmark, Mail, MapPin,
  MessagesSquare, Receipt, Search, Send, ShieldCheck, Smile, Star, Stethoscope, Store, TrendingUp, UserCheck,
  Users, Zap, type LucideIcon,
} from "lucide-react";

/* Registry ikon bersama (Service Detail & About Us) — Json content (Service.
 * detailContent, AboutPageContent.stats/values) nyimpen ikon sbg string key
 * (Json gak bisa nyimpen komponen React), lalu di-hydrate balik jadi
 * LucideIcon di server sebelum dirender (lihat hydrate-layanan-detail.ts /
 * hydrate-about-content.ts) biar komponen section gak perlu berubah. */
export const DETAIL_ICONS: Record<string, LucideIcon> = {
  award: Award,
  "badge-check": BadgeCheck,
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
  "heart-handshake": HeartHandshake,
  headset: Headset,
  hotel: Hotel,
  landmark: Landmark,
  mail: Mail,
  "map-pin": MapPin,
  "messages-square": MessagesSquare,
  receipt: Receipt,
  search: Search,
  send: Send,
  "shield-check": ShieldCheck,
  smile: Smile,
  star: Star,
  stethoscope: Stethoscope,
  store: Store,
  "trending-up": TrendingUp,
  "user-check": UserCheck,
  users: Users,
  zap: Zap,
};

export const DEFAULT_DETAIL_ICON: LucideIcon = FileText;
export const DEFAULT_DETAIL_ICON_KEY = "file-text";

export function resolveDetailIcon(key: string | null | undefined): LucideIcon {
  if (!key) return DEFAULT_DETAIL_ICON;
  return DETAIL_ICONS[key] ?? DEFAULT_DETAIL_ICON;
}

/* Ikon kartu "Jenis Layanan" (types.items) — dipilih otomatis berdasarkan
 * urutan index, bukan per-item custom (sama kayak perilaku asli di
 * layanan-detail.ts). */
export const TYPE_ICONS: LucideIcon[] = [FileBadge, Store, Briefcase, Factory, Hotel, Stethoscope];
