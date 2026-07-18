import type { Role } from "@prisma/client";

/* ─── Matrix akses admin per role — SATU sumber kebenaran ───
 * Dipakai di 2 tempat: AdminSidebar.tsx (sembunyikan menu yg gak boleh
 * diakses) & tiap page.tsx di src/app/admin (redirect kalau nekat buka URL
 * langsung).
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
  "/admin/dashboard": ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  "/admin/blog": ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  "/admin/media": ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"],
  "/admin/analitik": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/inquiry": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/pages": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/layanan": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/tim": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/testimoni": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/promo": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/klien": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/cta-banner": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/faq": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/menu": ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  "/admin/users": ["SUPER_ADMIN", "ADMIN"],
  "/admin/settings": ["SUPER_ADMIN", "ADMIN"], // ADMIN boleh akses tapi view-only, diatur terpisah di page-nya
};

export function canAccessAdminRoute(role: Role | string, href: string): boolean {
  const allowed = ADMIN_ROUTE_ROLES[href];
  if (!allowed) return true; // rute yg gak terdaftar (mis. /admin, /admin/login) -> gak dibatasi di sini
  return allowed.includes(role as Role);
}

/* ─── Hierarki antar-user: siapa boleh ubah/hapus/nonaktifkan siapa ───
 * Cuma SUPER_ADMIN yg boleh modifikasi akun SUPER_ADMIN lain (termasuk
 * dirinya sendiri — tapi self-action punya guard terpisah di users.ts). */
export function canManageUser(actorRole: Role | string, targetRole: Role | string): boolean {
  if (targetRole === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") return false;
  return true;
}
