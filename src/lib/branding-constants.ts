// Konstanta murni (tanpa node:fs / prisma) — dipisah dari branding.ts biar
// aman diimpor Client Component juga (mis. AdminSidebar, LoginFormClient,
// SettingsPageClient buat fallback/preview logo). branding.ts sendiri gak
// bisa diimpor langsung dari Client Component krn ada node:fs/promises &
// prisma di dalamnya.

export const DEFAULT_LOGO_URL = "/images/izinpro-logo.png";
// File .ico bawaan project (public/favicon.ico) — bukan dipakai sbg logo,
// cuma ikon tab browser default kalau admin belum atur favicon custom.
export const DEFAULT_FAVICON_URL = "/favicon.ico";
