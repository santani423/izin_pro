import fs from "node:fs/promises";
import path from "node:path";
import { humanizeFileName } from "@/lib/media";

/* Upload lampiran transaksi — file generik (PDF/DOC/XLS/gambar), BEDA dari
 * saveUploadedImage (lib/media.ts) yg cuma nerima gambar & selalu di-reencode
 * ke WebP lewat sharp. Di sini file disimpan APA ADANYA (dokumen kontrak/KTP
 * scan gak boleh diubah formatnya), gak dibikinin baris Media (Media
 * single-purpose gambar) — caller (actions/service-transactions.ts) yg
 * bikin baris TransactionAttachment sendiri pakai hasil fungsi ini. */

export const ATTACHMENT_MAX_BYTES = 15 * 1024 * 1024;
export const ATTACHMENT_ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export interface SavedAttachmentFile {
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export async function saveTransactionAttachmentFile(
  file: File,
  transactionId: string,
): Promise<SavedAttachmentFile> {
  if (!ATTACHMENT_ALLOWED_MIME.includes(file.type)) {
    throw new Error("Format file harus PDF, DOC/DOCX, XLS/XLSX, PNG, JPG, atau WebP.");
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    throw new Error("Ukuran file maksimal 15MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "transaksi", transactionId);
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  return {
    fileName: humanizeFileName(file.name) + ext,
    url: `/uploads/transaksi/${transactionId}/${fileName}`,
    mimeType: file.type,
    sizeBytes: buffer.length,
  };
}
