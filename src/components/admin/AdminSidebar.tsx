"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Newspaper, Image as ImageIcon, Users, Settings,
  Star, Megaphone, Package, HelpCircle, BarChart3, ChevronRight, X,
  Inbox, Headset, UserCog,
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
      { label: "Inquiry", href: "/admin/inquiry", icon: Inbox },
    ],
  },
  {
    label: "Konten",
    items: [
      { label: "Halaman", href: "/admin/pages", icon: FileText },
      { label: "Blog & Artikel", href: "/admin/blog", icon: Newspaper },
      { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    label: "Company Profile",
    items: [
      { label: "Layanan", href: "/admin/layanan", icon: Package },
      { label: "Tim", href: "/admin/tim", icon: Users },
      { label: "Testimoni", href: "/admin/testimoni", icon: Star },
      { label: "Promo / Banner", href: "/admin/promo", icon: Megaphone },
      { label: "CTA Banner", href: "/admin/cta-banner", icon: Headset },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Pengguna", href: "/admin/users", icon: UserCog },
      { label: "Pengaturan", href: "/admin/settings", icon: Settings },
    ],
  },
];

/* ─── Sidebar Admin Panel ─── */
export default function AdminSidebar() {
  const pathname = usePathname();
  const { open, close, collapsed } = useAdminSidebar();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 border-r border-admin-line bg-white h-screen overflow-y-auto overflow-x-hidden scrollbar-slim",
        "lg:sticky lg:top-0 lg:translate-x-0 transition-all duration-300 ease-in-out",
        "fixed top-0 left-0 z-50",
        /* Desktop width: collapsed = w-16, expanded = w-64 */
        collapsed ? "lg:w-16" : "lg:w-64",
        /* Mobile: always w-64, slides in/out */
        open ? "w-64 translate-x-0 shadow-2xl" : "w-64 -translate-x-full lg:translate-x-0",
      )}
    >
      {/* Logo — collapsed (desktop only): logo mark di tengah */}
      {collapsed && (
        <div className="hidden lg:flex justify-center py-8">
          <Link href="/" title={COMPANY_INFO.name} className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15 4.5L7 13.5L3 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}

      {/* Logo — expanded (dan drawer mobile) */}
      <div className={cn("items-center justify-between py-8 px-5", collapsed ? "flex lg:hidden" : "flex")}>
        <Link href="/" onClick={close} className="flex justify-start">
          <Image
            src="/images/izinpro-logo.png"
            alt={COMPANY_INFO.name}
            width={150}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>
        {/* Close button — mobile */}
        <button
          onClick={close}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Tutup menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 p-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "flex items-center rounded-xl text-sm font-medium transition-all",
                      collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                      isActive(href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Icon size={17} className="flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — kartu info gaya TailAdmin saat expanded */}
      <div className={cn("border-t border-admin-line", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <Link
            href="/"
            target="_blank"
            onClick={close}
            title="Lihat Website"
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={15} />
          </Link>
        ) : (
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <div className="text-sm font-bold text-gray-900">IzinPro CMS</div>
            <p className="mt-1 text-xs text-gray-400 leading-relaxed">
              Kelola konten & pantau performa website dari satu tempat.
            </p>
            <Link
              href="/"
              target="_blank"
              onClick={close}
              className="mt-3 flex items-center justify-center gap-1 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Lihat Website
              <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
