"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Newspaper, Image, Users, Settings,
  Star, Megaphone, Package, HelpCircle, BarChart3, ChevronRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY_INFO } from "@/lib/constants";
import { useAdminSidebar } from "@/contexts/AdminSidebarContext";

const navGroups = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analitik", href: "/admin/analitik", icon: BarChart3 },
    ],
  },
  {
    label: "Konten",
    items: [
      { label: "Halaman", href: "/admin/pages", icon: FileText },
      { label: "Blog & Artikel", href: "/admin/blog", icon: Newspaper },
      { label: "Media Library", href: "/admin/media", icon: Image },
    ],
  },
  {
    label: "Company Profile",
    items: [
      { label: "Layanan", href: "/admin/layanan", icon: Package },
      { label: "Tim", href: "/admin/tim", icon: Users },
      { label: "Testimoni", href: "/admin/testimoni", icon: Star },
      { label: "Promo / Banner", href: "/admin/promo", icon: Megaphone },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Pengaturan", href: "/admin/settings", icon: Settings },
    ],
  },
];

/* ─── Sidebar Admin Panel ─── */
export default function AdminSidebar() {
  const pathname = usePathname();
  const { open, close } = useAdminSidebar();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        /* Base */
        "flex flex-col w-64 flex-shrink-0 border-r border-gray-100 bg-white h-screen overflow-y-auto",
        /* Desktop: always visible as part of flex layout */
        "lg:sticky lg:top-0 lg:translate-x-0",
        /* Mobile: fixed drawer, slides in from left */
        "fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out",
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* Logo + close button */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow-sm flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15 4.5L7 13.5L3 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm truncate">{COMPANY_INFO.name}</div>
          <div className="text-xs text-gray-400">Admin Panel</div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={close}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Tutup menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                      isActive(href)
                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {isActive(href) && <ChevronRight size={13} />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <Link
          href="/"
          target="_blank"
          onClick={close}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
        >
          <span>Lihat Website</span>
          <ChevronRight size={13} className="ml-auto" />
        </Link>
      </div>
    </aside>
  );
}
