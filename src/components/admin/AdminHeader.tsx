"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, Menu, X, ChevronDown, LogOut, User, Settings, CornerDownLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAdminSidebar } from "@/contexts/AdminSidebarContext";
import { authClient, useSession } from "@/lib/auth-client";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

/* ─── Header Admin Panel — dirender otomatis dari layout admin ─── */
export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { toggle, toggleCollapse } = useAdminSidebar();
  const router = useRouter();
  const pathname = usePathname();
  // Panel (admin/editor/author) diambil dari segmen pertama URL yg aktif.
  const panel = pathname.split("/")[1] || "admin";
  const { data: session } = useSession();
  /* useSession() bisa langsung punya data dari cache client saat render
   * pertama (mis. setelah navigasi client-side), sedangkan SSR gak pernah
   * tahu session ini sama sekali -> mismatch hydration. Tahan tampilan
   * sampai after-mount supaya render pertama di client selalu sama dgn
   * server (placeholder), baru nama asli muncul sesudahnya. */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const displayName = mounted ? session?.user?.name ?? "..." : "...";
  const displayEmail = mounted ? session?.user?.email ?? "" : "";
  const displayImage = mounted ? session?.user?.image : undefined;
  const role = (session?.user as { role?: Role } | undefined)?.role;

  /* Search / command palette — cari & lompat ke halaman admin lewat menu. */
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items
        .filter((item) => (role ? canAccessAdminRoute(role, item.href) : true))
        .filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0);
  }, [query, role]);

  const flatResults = useMemo(() => searchResults.flatMap((group) => group.items), [searchResults]);

  const handleSearchOpenChange = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const goToResult = (href: string) => {
    handleSearchOpenChange(false);
    router.push(`/${panel}${href}`);
  };

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flatResults[activeIndex];
      if (target) goToResult(target.href);
    }
  };

  const notifications = [
    { id: 1, text: "Inquiry baru dari Budi Santoso", time: "5 menit lalu", unread: true },
    { id: 2, text: "Artikel berhasil dipublish", time: "1 jam lalu", unread: true },
    { id: 3, text: "Media baru diupload", time: "3 jam lalu", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm border-b border-admin-line">

      {/* Kiri: hamburger (collapse sidebar) + judul */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Mobile: buka/tutup drawer sidebar */}
        <button
          onClick={toggle}
          className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0"
          aria-label="Buka menu"
        >
          <Menu size={18} />
        </button>
        {/* Desktop: collapse/expand sidebar */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center w-11 h-11 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0"
          aria-label="Ciutkan sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Kanan: search + notif + profil */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Search / command palette — desktop: kotak lengkap */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50/60 text-sm text-gray-400 hover:border-primary/30 hover:text-primary transition-colors min-w-[220px]"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Cari atau ketik perintah...</span>
          <kbd className="hidden lg:inline-flex items-center rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            Ctrl K
          </kbd>
        </button>
        {/* Search / command palette — mobile: icon saja */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary transition-colors"
          aria-label="Cari"
        >
          <Search size={18} />
        </button>

        <Dialog open={searchOpen} onOpenChange={handleSearchOpenChange}>
          <DialogContent
            showCloseButton={false}
            className="top-24 max-w-lg translate-y-0 gap-0 rounded-2xl p-0 sm:max-w-lg"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-admin-line">
              <Search size={17} className="text-gray-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari menu, misal: blog, testimoni, pengguna..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
              <kbd className="flex-shrink-0 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                Esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {flatResults.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-400">
                  Tidak ada menu yang cocok dengan &quot;{query}&quot;
                </p>
              ) : (
                searchResults.map((group) => (
                  <div key={group.label} className="mb-1 last:mb-0">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {group.label}
                    </div>
                    <ul>
                      {group.items.map((item) => {
                        const index = flatResults.findIndex((r) => r.href === item.href);
                        const active = index === activeIndex;
                        const Icon = item.icon;
                        return (
                          <li key={item.href}>
                            <button
                              onClick={() => goToResult(item.href)}
                              onMouseEnter={() => setActiveIndex(index)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-colors ${
                                active ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Icon size={16} className="flex-shrink-0" />
                              <span className="flex-1">{item.label}</span>
                              {active && <CornerDownLeft size={13} className="text-primary/60 flex-shrink-0" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-admin-line px-4 py-2.5 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5">↑↓</kbd> navigasi
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5">Enter</kbd> buka
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5">Esc</kbd> tutup
              </span>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary transition-colors"
            aria-label="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-1 w-2.5 h-2.5 rounded-full bg-orange-400 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-admin-line overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-admin-line">
                <span className="font-semibold text-sm">Notifikasi</span>
                <button onClick={() => setNotifOpen(false)}>
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.unread ? "bg-primary/[0.03]" : ""}`}
                  >
                    <p className="text-xs text-gray-800 leading-relaxed">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profil user */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors outline-none">
            <Avatar className="w-9 h-9">
              {displayImage && <AvatarImage src={displayImage} alt={displayName} />}
              <AvatarFallback className="bg-primary text-white text-xs font-bold">
                {initialsOf(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-gray-800 leading-none">{displayName}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{displayEmail}</div>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-gray-400">Akun Saya</DropdownMenuLabel>
              <DropdownMenuItem className="text-sm cursor-pointer gap-2" onClick={() => router.push(`/${panel}/profile`)}>
                <User size={14} className="text-gray-400" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer gap-2">
                <Settings size={14} className="text-gray-400" />
                Pengaturan
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-sm text-red-500 cursor-pointer gap-2 focus:text-red-500 focus:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
