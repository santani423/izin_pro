"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu, X, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAdminSidebar } from "@/contexts/AdminSidebarContext";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

/* ─── Header Admin Panel ─── */
export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { toggle } = useAdminSidebar();
  const router = useRouter();

  const notifications = [
    { id: 1, text: "Inquiry baru dari Budi Santoso", time: "5 menit lalu", unread: true },
    { id: 2, text: "Artikel berhasil dipublish", time: "1 jam lalu", unread: true },
    { id: 3, text: "Media baru diupload", time: "3 jam lalu", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    sessionStorage.removeItem("admin-auth");
    router.replace("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[72px] px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm border-b border-gray-100">

      {/* Kiri: hamburger (mobile) + judul */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggle}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 leading-none truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Kanan: search + notif + profil */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-400 hover:border-primary/30 hover:text-primary transition-colors min-w-[160px]">
          <Search size={14} />
          <span>Cari...</span>
          <span className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded">⌘K</span>
        </button>

        {/* Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
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
          <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors outline-none">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary text-white text-xs font-bold">
                SA
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-gray-800 leading-none">Super Admin</div>
              <div className="text-[10px] text-gray-400 mt-0.5">admin@izinpro.co.id</div>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-gray-400">Akun Saya</DropdownMenuLabel>
              <DropdownMenuItem className="text-sm cursor-pointer gap-2">
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
