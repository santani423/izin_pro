"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebarProvider, useAdminSidebar } from "@/contexts/AdminSidebarContext";

const AUTH_PAGES = ["/admin/login"];

/* Judul & subjudul header per menu — dipakai otomatis oleh layout */
const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/admin/dashboard": { title: "Dashboard", subtitle: "Selamat datang kembali, Super Admin!" },
  "/admin/analitik": { title: "Analitik", subtitle: "Data kunjungan dan performa website" },
  "/admin/users": { title: "Pengguna", subtitle: "Kelola akun admin dan hak akses (role)" },
  "/admin/pages": { title: "Halaman", subtitle: "Kelola semua halaman statis website" },
  "/admin/menu": { title: "Menu", subtitle: "Kelola menu navigasi header dan footer website" },
  "/admin/blog": { title: "Blog & Artikel", subtitle: "Kelola semua artikel dan konten blog" },
  "/admin/media": { title: "Media Library", subtitle: "Kelola semua gambar dan file" },
  "/admin/layanan": { title: "Layanan", subtitle: "Kelola layanan yang ditampilkan di website" },
  "/admin/tim": { title: "Tim", subtitle: "Kelola profil anggota tim IzinPro" },
  "/admin/testimoni": { title: "Testimoni", subtitle: "Kelola testimoni klien yang ditampilkan di website" },
  "/admin/promo": { title: "Promo & Banner", subtitle: "Kelola penawaran dan banner promosi" },
  "/admin/klien": { title: "Klien", subtitle: "Kelola logo klien yang ditampilkan di website" },
  "/admin/faq": { title: "FAQ", subtitle: "Kelola pertanyaan yang sering diajukan" },
  "/admin/cta-banner": { title: "CTA Banner", subtitle: "Kelola ajakan konsultasi di berbagai halaman website" },
  "/admin/inquiry": { title: "Inquiry", subtitle: "Kelola pesan yang masuk dari form kontak" },
  "/admin/settings": { title: "Pengaturan", subtitle: "Konfigurasi website dan informasi perusahaan" },
};

/* Rute turunan (mis. /admin/blog/baru) mewarisi meta induknya */
function pageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  const parent = Object.keys(PAGE_META).find((p) => pathname.startsWith(p + "/"));
  return parent ? PAGE_META[parent] : { title: "Admin" };
}

/* ─── Inner layout (needs sidebar context) ─── */
function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { open, close } = useAdminSidebar();
  const pathname = usePathname();
  const meta = pageMeta(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Next.js fokus elemen baru tiap ganti route buat aksesibilitas —
     itu memicu browser "scroll into view" ke SEMUA ancestor yg punya
     overflow, termasuk shell terluar ini (overflow-hidden tapi tetap
     bisa ke-scroll via focus meski gak ada scrollbar-nya sendiri),
     bukan cuma div konten. Makanya dua-duanya harus direset.
     useLayoutEffect supaya reset kejadian SEBELUM browser sempat
     paint frame dgn scrollTop lama */
  useLayoutEffect(() => {
    rootRef.current?.scrollTo(0, 0);
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div ref={rootRef} className="fixed inset-0 flex overflow-hidden bg-admin-bg [overflow-anchor:none]">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title={meta.title} subtitle={meta.subtitle} />
        {/* Hanya area ini yang scroll — header & sidebar tetap fixed, jadi lebar header tidak pernah terpotong scrollbar */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto [overflow-anchor:none]">
          {children}
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

/* ─── Root admin layout ───
 * Proteksi akses beneran ada di middleware.ts (cek session cookie di edge,
 * redirect ke /admin/login sebelum halaman ini dirender sama sekali) —
 * jadi di sini gak perlu guard/spinner lagi, kalau kode ini jalan berarti
 * request-nya sudah lolos middleware. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname);

  /* Auth pages: render clean (no sidebar) */
  if (isAuthPage) return <>{children}</>;

  return (
    <AdminSidebarProvider>
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </AdminSidebarProvider>
  );
}
