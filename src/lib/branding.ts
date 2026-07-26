import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { DEFAULT_LOGO_URL, DEFAULT_FAVICON_URL } from "@/lib/branding-constants";

export { DEFAULT_LOGO_URL, DEFAULT_FAVICON_URL };
const BRANDING_CACHE_TTL_MS = 60_000;

export const BRAND_ASSET_MAX_BYTES = 2 * 1024 * 1024;
export const BRAND_ASSET_ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
];
const BRAND_ASSET_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "branding");

type BrandingSettings = {
  appLogoUrl: string | null;
  faviconUrl: string | null;
};

const brandingCache = new Map<string, { value: BrandingSettings; expiresAt: number }>();

function getCacheKey() {
  return "branding-settings";
}

function readCache() {
  const cached = brandingCache.get(getCacheKey());
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    brandingCache.delete(getCacheKey());
    return null;
  }
  return cached.value;
}

function writeCache(value: BrandingSettings) {
  brandingCache.set(getCacheKey(), {
    value,
    expiresAt: Date.now() + BRANDING_CACHE_TTL_MS,
  });
}

export const getBrandingSettings = cache(async (): Promise<BrandingSettings> => {
  const cached = readCache();
  if (cached) return cached;

  const settings = await prisma.settings.findUnique({ where: { id: "1" } });
  const appLogoUrl = settings?.appLogoUrl ?? null;
  const faviconUrl = settings?.faviconUrl ?? null;
  const result = {
    appLogoUrl,
    faviconUrl,
  };
  writeCache(result);
  return result;
});

export function resolveBrandLogoUrl(logoUrl: string | null | undefined) {
  if (!logoUrl) return DEFAULT_LOGO_URL;
  return logoUrl;
}

export function resolveBrandFaviconUrl(faviconUrl: string | null | undefined) {
  if (!faviconUrl) return DEFAULT_FAVICON_URL;
  return faviconUrl;
}

export async function getPublicBrandingUrl(pathValue: string | null | undefined, fallback: string) {
  if (!pathValue) return fallback;

  try {
    await fs.access(path.join(process.cwd(), "public", pathValue));
    return pathValue;
  } catch {
    return fallback;
  }
}

export async function getBrandingAssetUrls() {
  const settings = await getBrandingSettings();
  const resolvedLogo = await getPublicBrandingUrl(settings.appLogoUrl, DEFAULT_LOGO_URL);
  const resolvedFavicon = await getPublicBrandingUrl(settings.faviconUrl, DEFAULT_FAVICON_URL);
  return {
    logoUrl: resolvedLogo,
    faviconUrl: resolvedFavicon,
  };
}

export function clearBrandingCache() {
  brandingCache.delete(getCacheKey());
}

/** File bawaan (mis. DEFAULT_LOGO_URL) gak pernah dihapus fisik — cuma
 * path upload di public/uploads/branding yang boleh kena unlink. */
function isDefaultBrandAsset(pathValue: string) {
  return pathValue === DEFAULT_LOGO_URL || pathValue === DEFAULT_FAVICON_URL;
}

export async function saveBrandAssetFile(file: File, kind: "logo" | "favicon") {
  if (!BRAND_ASSET_ALLOWED_MIME.includes(file.type)) {
    throw new Error("Format tidak didukung. Gunakan PNG, JPG, JPEG, SVG, atau WebP.");
  }
  if (file.size > BRAND_ASSET_MAX_BYTES) {
    throw new Error("Ukuran file terlalu besar. Maksimal 2MB.");
  }

  await fs.mkdir(BRAND_ASSET_UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".png";
  const fileName = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(BRAND_ASSET_UPLOAD_DIR, fileName), buffer);
  return `/uploads/branding/${fileName}`;
}

/** Best-effort — dipanggil SETELAH DB update berhasil (bukan sebelumnya),
 * jadi kalau unlink gagal, Settings tetap konsisten sama file yg beneran ada. */
export async function deleteBrandAssetFile(pathValue: string | null | undefined) {
  if (!pathValue || isDefaultBrandAsset(pathValue)) return;
  try {
    await fs.unlink(path.join(process.cwd(), "public", pathValue));
  } catch {
    // File mungkin udah gak ada — abaikan.
  }
}
