import {
  FileText, Building2, ClipboardList, Clock, List, UserCheck, Briefcase, Globe,
  Receipt, Tag, Monitor, MapPin, BadgeCheck, Ship, Factory, Leaf, HardHat, RefreshCw,
  type LucideIcon,
} from "lucide-react";

/* Satu sumber map nama ikon (Service.icon, string bebas dari admin) -> Lucide
 * component — dipakai admin (LayananManager) & publik (ServicesSection) biar
 * konsisten. Nama gak dikenal -> DEFAULT_SERVICE_ICON. */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  building: Building2,
  clipboard: ClipboardList,
  "file-text": FileText,
  clock: Clock,
  list: List,
  "user-check": UserCheck,
  briefcase: Briefcase,
  globe: Globe,
  receipt: Receipt,
  tag: Tag,
  monitor: Monitor,
  "map-pin": MapPin,
  "badge-check": BadgeCheck,
  ship: Ship,
  factory: Factory,
  leaf: Leaf,
  "hard-hat": HardHat,
  refresh: RefreshCw,
};

export const DEFAULT_SERVICE_ICON: LucideIcon = FileText;
