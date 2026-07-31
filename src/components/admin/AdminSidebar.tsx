"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY_INFO } from "@/lib/constants";
import { ADMIN_NAV_GROUPS, type AdminNavItem } from "@/lib/admin-nav";
import { useAdminSidebar } from "@/contexts/AdminSidebarContext";
import { useSession } from "@/lib/auth-client";
import { canAccessAdminRoute } from "@/lib/permissions";
import { useEffect, useState } from "react";
import { DEFAULT_LOGO_URL } from "@/lib/branding-constants";
import type { Role } from "@prisma/client";

/* ─── Sidebar Admin Panel ─── */
export default function AdminSidebar() {
  const pathname = usePathname();
  const { open, close, collapsed } = useAdminSidebar();
  const { data: session } = useSession();
  // useSession() client-side gak nge-infer custom additionalFields (role) di
  // tipenya walau datanya beneran ada di response — cast manual di sini.
  const role = (session?.user as { role?: Role } | undefined)?.role;
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_URL);
  // Panel (admin/editor/author) diambil dari segmen pertama URL yg aktif —
  // bukan dari role — supaya link sidebar selalu ikut prefix yg lagi dipakai.
  const panel = pathname.split("/")[1] || "admin";

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Grup dgn children yg lagi expanded — default semua expanded (cuma 1
  // grup skrg, "Transaksi Layanan"), toggle manual via chevron.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (href: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });

  useEffect(() => {
    fetch("/api/branding")
      .then((res) => res.json())
      .then((data) => setLogoUrl(data.logoUrl || DEFAULT_LOGO_URL))
      .catch(() => setLogoUrl(DEFAULT_LOGO_URL));
  }, []);

  /* Sembunyikan menu yg gak boleh diakses role ini — belum tau role (session
   * lom kebaca) -> tampilin semua dulu spy gak "flash" kosong, page.tsx tetap
   * jadi penjaga terakhir kalau nekat buka URL langsung. */
  const filterItem = (item: AdminNavItem): AdminNavItem | null => {
    if (!role) return item;
    const children = item.children?.filter((c) => canAccessAdminRoute(role, c.href));
    const ownAccess = canAccessAdminRoute(role, item.href);
    if (!ownAccess && (!children || children.length === 0)) return null;
    return { ...item, children };
  };

  const visibleGroups = ADMIN_NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.map(filterItem).filter((item): item is AdminNavItem => item !== null),
    }))
    .filter((group) => group.items.length > 0);

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
            src={logoUrl}
            alt={COMPANY_INFO.name}
            width={150}
            height={40}
            priority
            unoptimized
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
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon, children }) => {
                const fullHref = `/${panel}${href}`;
                const isGroupCollapsed = collapsedGroups.has(href);
                const hasChildren = !collapsed && children && children.length > 0;
                return (
                  <li key={href}>
                    <div className="flex items-center">
                      <Link
                        href={fullHref}
                        onClick={close}
                        title={collapsed ? label : undefined}
                        className={cn(
                          "flex flex-1 items-center rounded-xl text-sm font-medium transition-all",
                          collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                          isActive(fullHref)
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        <Icon size={17} className="flex-shrink-0" />
                        {!collapsed && <span className="flex-1">{label}</span>}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleGroup(href)}
                          aria-label={isGroupCollapsed ? `Buka submenu ${label}` : `Tutup submenu ${label}`}
                          className="mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        >
                          <ChevronDown
                            size={14}
                            className={cn("transition-transform", isGroupCollapsed && "-rotate-90")}
                          />
                        </button>
                      )}
                    </div>
                    {hasChildren && !isGroupCollapsed && (
                      <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-admin-line pl-3">
                        {children!.map((child) => {
                          const childHref = `/${panel}${child.href}`;
                          const ChildIcon = child.icon;
                          return (
                            <li key={child.href}>
                              <Link
                                href={childHref}
                                onClick={close}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                                  pathname === childHref
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                )}
                              >
                                <ChildIcon size={15} className="flex-shrink-0" />
                                <span className="flex-1">{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
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
