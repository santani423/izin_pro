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
  const buffer = await sharp(original)
    .rotate() // auto-orient berdasarkan EXIF (foto dari HP sering kesimpan miring)
    .resize({
      width: IMAGE_MAX_DIMENSION,
      height: IMAGE_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_WEBP_QUALITY })
    .toBuffer();
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  const url = `/uploads/${subDir}/${fileName}`;
  const media = await prisma.media.create({
    data: { fileName, url, mimeType: "image/webp", sizeBytes: buffer.length, uploadedById: uploaderId },
  });
  return media;
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
