import type { Role } from "@prisma/client";

/* ─── Panel URL per role (v2.4.0) ───
 * SUPER_ADMIN & ADMIN pakai /admin/..., EDITOR pakai /editor/...,
 * AUTHOR pakai /author/... — satu tree halaman (src/app/[panel]) dipakai
 * bertiga, panel mana yg dipakai ditentukan role, bukan pilihan bebas user
 * (lihat requirePanelAccess di admin-guard.ts). */
export type AdminPanel = "admin" | "editor" | "author";

export function getRolePanel(role: Role | string): AdminPanel {
  if (role === "EDITOR") return "editor";
  if (role === "AUTHOR") return "author";
  return "admin"; // SUPER_ADMIN, ADMIN, dan fallback
}

/* ─── Matrix akses menu per role — SATU sumber kebenaran ───
 * Key di sini adalah SUFFIX rute (tanpa prefix panel), mis. "/blog" cocok
 * utk /admin/blog, /editor/blog, maupun /author/blog. Dipakai di 2 tempat:
 * AdminSidebar.tsx (sembunyikan menu yg gak boleh diakses) & tiap page.tsx
 * di src/app/[panel] (redirect kalau nekat buka URL langsung).
 * Kalau nambah menu admin baru, cukup tambahin satu baris di sini —
 * gak perlu ubah 2 tempat terpisah.
 *
 * Ringkasan (lihat ROLE_DESC di UsersManager.tsx utk deskripsi lengkap):
 *   SUPER_ADMIN — semua menu, termasuk Pengaturan & Pengguna
 *   ADMIN       — semua menu, Pengaturan cuma view-only (bukan soal akses)
 *   EDITOR      — semua menu KECUALI Pengaturan & Pengguna
 *   AUTHOR      — CUMA Dashboard, Blog & Artikel, Media Library
 */
export const ADMIN_ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard": ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  "/profile": ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  "/blog": ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  "/media": ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  "/analitik": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/inquiry": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/pages": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/beranda": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/tentang-kami": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/layanan": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/tim": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/testimoni": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/promo": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/klien": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/kontak": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/cta-banner": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/faq": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/transaksi/workflow": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/transaksi/daftar": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/menu": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/users": ["SUPER_ADMIN", "ADMIN"],
  "/settings": ["SUPER_ADMIN", "ADMIN"], // ADMIN boleh akses tapi view-only, diatur terpisah di page-nya
};

export function canAccessAdminRoute(role: Role | string, href: string): boolean {
  const allowed = ADMIN_ROUTE_ROLES[href];
  if (!allowed) return true; // rute yg gak terdaftar (mis. root panel) -> gak dibatasi di sini
  return allowed.includes(role as Role);
}

/* ─── Role yg boleh dilihat & dikelola (list + create/edit) di halaman
 * /admin/users, tergantung role yg lagi login ───
 *   SUPER_ADMIN — lihat & kelola Admin, Editor, Author (Super Admin lain
 *                 disembunyikan; ganti profil Super Admin sendiri lewat
 *                 halaman Profil Saya)
 *   ADMIN       — lihat & kelola Editor, Author saja (gak bisa lihat/buat
 *                 Admin atau Super Admin)
 * EDITOR/AUTHOR gak pernah sampe sini (ketahan canAccessAdminRoute duluan). */
export function visibleUserRoles(viewerRole: Role | string): Role[] {
  if (viewerRole === "SUPER_ADMIN") return ["ADMIN", "EDITOR", "AUTHOR"];
  if (viewerRole === "ADMIN") return ["EDITOR", "AUTHOR"];
  return [];
}

/* ─── Hierarki antar-user: siapa boleh ubah/hapus/nonaktifkan siapa ───
 * Turunan dari visibleUserRoles — kalau role targetnya gak kelihatan di
 * list actor, actor juga gak boleh memodifikasinya lewat action manapun. */
export function canManageUser(actorRole: Role | string, targetRole: Role | string): boolean {
  return visibleUserRoles(actorRole).includes(targetRole as Role);
}
