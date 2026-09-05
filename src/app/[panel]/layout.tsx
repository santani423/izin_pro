"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Toaster } from "@/components/ui/sonner";
import AlertHost from "@/components/admin/AlertHost";
import { AdminSidebarProvider, useAdminSidebar } from "@/contexts/AdminSidebarContext";

/* Judul & subjudul header per menu — dipakai otomatis oleh layout.
 * Key = suffix rute (tanpa prefix panel), cocok di /admin, /editor & /author. */
const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Selamat datang kembali!" },
  "/profile": { title: "Profil Saya", subtitle: "Kelola nama dan password akun Anda" },
  "/analitik": { title: "Analitik", subtitle: "Data kunjungan dan performa website" },
  "/users": { title: "Pengguna", subtitle: "Kelola akun admin dan hak akses (role)" },
  "/pages": { title: "Halaman", subtitle: "Kelola semua halaman statis website" },
  "/menu": { title: "Menu", subtitle: "Kelola menu navigasi header dan footer website" },
  "/blog": { title: "Blog & Artikel", subtitle: "Kelola semua artikel dan konten blog" },
  "/media": { title: "Media Library", subtitle: "Kelola semua gambar dan file" },
  "/beranda": { title: "Hero Beranda", subtitle: "Kelola judul, subjudul, dan teks bagian paling atas beranda" },
  "/layanan": { title: "Layanan", subtitle: "Kelola layanan yang ditampilkan di website" },
  "/tim": { title: "Tim", subtitle: "Kelola profil anggota tim IzinPro" },
  "/testimoni": { title: "Testimoni", subtitle: "Kelola testimoni klien yang ditampilkan di website" },
  "/promo": { title: "Promo & Banner", subtitle: "Kelola penawaran dan banner promosi" },
  "/klien": { title: "Klien", subtitle: "Kelola logo klien yang ditampilkan di website" },
  "/faq": { title: "FAQ", subtitle: "Kelola pertanyaan yang sering diajukan" },
  "/cta-banner": { title: "CTA Banner", subtitle: "Kelola ajakan konsultasi di berbagai halaman website" },
  "/settings": { title: "Pengaturan", subtitle: "Konfigurasi website dan informasi perusahaan" },
};

/* Buang prefix panel (/admin, /editor, /author) dulu sebelum dicocokkan.
 * Rute turunan (mis. /admin/blog/new) mewarisi meta induknya. */
function pageMeta(pathname: string) {
  const suffix = pathname.replace(/^\/(admin|editor|author)/, "") || "/dashboard";
  if (PAGE_META[suffix]) return PAGE_META[suffix];
  const parent = Object.keys(PAGE_META).find((p) => suffix.startsWith(p + "/"));
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
      <AlertHost />
    </div>
  );
}

/* ─── Root layout panel (/admin, /editor, /author) ───
 * Login (/admin/login) ada di luar tree [panel] ini (rute statis
 * tersendiri), jadi di sini gak perlu guard "halaman auth" lagi.
 * Proteksi akses beneran ada di proxy.ts (cek session cookie di edge,
 * redirect ke /admin/login sebelum halaman ini dirender) + requirePanelAccess
 * di tiap page.tsx (cek role vs panel & rute yg diakses). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarProvider>
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </AdminSidebarProvider>
  );
}
