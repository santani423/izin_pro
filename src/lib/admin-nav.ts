import {
  LayoutDashboard, FileText, Newspaper, Image as ImageIcon, Users, Settings,
  Star, Megaphone, Package, HelpCircle, BarChart3, Inbox, Headset, UserCog,
  Building2, Menu as MenuIcon, UserCircle, type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/* Sumber tunggal menu admin — dipakai AdminSidebar (navigasi) & AdminHeader
 * (search/command palette). href di sini adalah SUFFIX rute (tanpa prefix
 * panel) — konsumen (AdminSidebar/AdminHeader) yang menambahkan prefix
 * /admin, /editor, atau /author sesuai panel yg lagi aktif. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analitik", href: "/analitik", icon: BarChart3 },
      { label: "Inquiry", href: "/inquiry", icon: Inbox },
    ],
  },
  {
    label: "Konten",
    items: [
      { label: "Halaman", href: "/pages", icon: FileText },
      { label: "Menu", href: "/menu", icon: MenuIcon },
      { label: "Blog & Artikel", href: "/blog", icon: Newspaper },
      { label: "Media Library", href: "/media", icon: ImageIcon },
    ],
  },
  {
    label: "Company Profile",
    items: [
      { label: "Layanan", href: "/layanan", icon: Package },
      { label: "Tim", href: "/tim", icon: Users },
      { label: "Testimoni", href: "/testimoni", icon: Star },
      { label: "Promo / Banner", href: "/promo", icon: Megaphone },
      { label: "Klien", href: "/klien", icon: Building2 },
      { label: "CTA Banner", href: "/cta-banner", icon: Headset },
      { label: "FAQ", href: "/faq", icon: HelpCircle },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Pengguna", href: "/users", icon: UserCog },
      { label: "Pengaturan", href: "/settings", icon: Settings },
    ],
  },
  {
    label: "Akun",
    items: [
      { label: "Profil Saya", href: "/profile", icon: UserCircle },
    ],
  },
];
