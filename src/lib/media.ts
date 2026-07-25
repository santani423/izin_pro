import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@/lib/db";

/* Dipakai bareng oleh semua upload gambar admin (blog cover/inline, Media
 * Library) — satu tempat buat aturan resize & konversi WebP, biar konsisten
 * di semua modul. */

// 15MB — cuma guard mentah biar server gak kewalahan proses file raksasa;
// bukan ambang tolak/wajib-kecil, karena hasil akhir selalu dikompres jauh
// di bawah ini oleh resize + convert WebP di bawah.
export const IMAGE_MAX_BYTES = 15 * 1024 * 1024;
export const IMAGE_ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

/* Gambar apa pun ukurannya diresize turun kalau melebihi sisi terpanjang
 * ini — menjaga rasio asli, gak pernah upscale gambar kecil. Crop ke rasio
 * tampilan diatur lewat CSS object-cover di tempat render, bukan di sini. */
export const IMAGE_MAX_DIMENSION = 1600;
export const IMAGE_WEBP_QUALITY = 80;

/** "team-photo_v2.jpg" -> "Team Photo V2" — dasar Title (wajib diisi) yang
 * di-auto-generate dari nama file asli saat upload/sinkron. Admin bisa
 * edit lagi lewat preview di Media Library. */
export function humanizeFileName(name: string): string {
  const withoutExt = name.replace(/\.[^./]+$/, "");
  const words = withoutExt.replace(/[-_]+/g, " ").trim();
  if (!words) return "Untitled";
  return words.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export async function saveUploadedImage(file: File, subDir: string, uploaderId: string) {
  if (!IMAGE_ALLOWED_MIME.includes(file.type)) {
    throw new Error("Format gambar harus PNG, JPG, atau WebP.");
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error("Ukuran gambar maksimal 15MB.");
  }
  const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
  await fs.mkdir(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const original = Buffer.from(await file.arrayBuffer());
  const image = sharp(original)
    .rotate() // auto-orient berdasarkan EXIF (foto dari HP sering kesimpan miring)
    .resize({
      width: IMAGE_MAX_DIMENSION,
      height: IMAGE_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_WEBP_QUALITY });
  const buffer = await image.toBuffer();
  const { width, height } = await sharp(buffer).metadata();
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  const url = `/uploads/${subDir}/${fileName}`;
  const media = await prisma.media.create({
    data: {
      fileName,
      url,
      mimeType: "image/webp",
      sizeBytes: buffer.length,
      width: width ?? null,
      height: height ?? null,
      title: humanizeFileName(file.name),
      uploadedById: uploaderId,
    },
  });
  return media;
}

const EXT_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

async function walkImageFiles(dir: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkImageFiles(fullPath, baseDir)));
    } else if (EXT_MIME[path.extname(entry.name).toLowerCase()]) {
      // URL relatif dari public/, pakai forward slash biar konsisten walau di Windows
      results.push("/" + path.relative(baseDir, fullPath).split(path.sep).join("/"));
    }
  }
  return results;
}

/** Media Library nampilin SEMUA gambar di folder public/ (bukan cuma yang
 * diupload lewat CMS) — termasuk asset statis yang di-hardcode di kode
 * (logo, ilustrasi, dst). Dipanggil di awal src/app/[panel]/media/page.tsx
 * sebelum query: cari file gambar di public/ yang URL-nya BELUM ada di
 * tabel Media, lalu daftarkan (uploadedById dibiarkan null sbg penanda
 * "asset statis, bukan upload CMS" — dipakai UI buat kasih badge
 * peringatan sebelum dihapus). Idempoten & aman dipanggil berkali-kali. */
export async function syncStaticMediaFiles() {
  const publicDir = path.join(process.cwd(), "public");
  const foundUrls = await walkImageFiles(publicDir, publicDir);
  if (foundUrls.length === 0) return;

  const existing = await prisma.media.findMany({
    where: { url: { in: foundUrls } },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((m) => m.url));
  const newUrls = foundUrls.filter((u) => !existingUrls.has(u));
  if (newUrls.length === 0) return;

  for (const url of newUrls) {
    const filePath = path.join(publicDir, url.slice(1));
    const fileName = path.basename(url);
    const ext = path.extname(fileName).toLowerCase();
    try {
      const stat = await fs.stat(filePath);
      let width: number | null = null;
      let height: number | null = null;
      if (ext !== ".svg") {
        try {
          const meta = await sharp(filePath).metadata();
          width = meta.width ?? null;
          height = meta.height ?? null;
        } catch {
          // Gak fatal — gambar tetap didaftarkan tanpa dimensi kalau sharp gagal baca.
        }
      }
      await prisma.media.create({
        data: {
          fileName,
          url,
          mimeType: EXT_MIME[ext] ?? "application/octet-stream",
          sizeBytes: stat.size,
          width,
          height,
          title: humanizeFileName(fileName),
          uploadedById: null,
        },
      });
    } catch {
      // File gak kebaca (race condition dihapus barengan, dsb) — skip, jangan bikin seluruh sinkron gagal.
    }
  }
}

/** Hapus file fisik di public/uploads — best-effort, gak melempar error
 * kalau filenya udah gak ada (mis. kehapus manual). */
export async function deleteUploadedFile(url: string) {
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await fs.unlink(filePath);
  } catch {
    // File udah gak ada / gak bisa dihapus — abaikan, baris DB tetap dihapus.
  }
}
