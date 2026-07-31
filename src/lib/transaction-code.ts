import { prisma } from "@/lib/db";

function pad(n: number, width: number) {
  return String(n).padStart(width, "0");
}

function yyyymmdd(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`;
}

function yyyymm(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}`;
}

/* ─── Kode transaksi & invoice ───
 * Format: TRX-{YYYYMMDD}-{6 digit urut per hari}, INV-{YYYYMM}-{4 digit
 * urut per bulan}. Sequence dihitung dari jumlah baris ber-prefix sama hari
 * ini/bulan ini +1 — cukup buat tool internal low-traffic (bukan e-commerce
 * publik dgn concurrent checkout tinggi). createTransactionAction yg
 * memanggil ini melakukan retry kecil kalau ternyata bentrok unique
 * constraint (lihat komentar di sana). */
export async function generateTransactionCode(date: Date, offset = 0): Promise<string> {
  const prefix = `TRX-${yyyymmdd(date)}-`;
  const count = await prisma.serviceTransaction.count({ where: { code: { startsWith: prefix } } });
  return `${prefix}${pad(count + 1 + offset, 6)}`;
}

export async function generateInvoiceNumber(date: Date, offset = 0): Promise<string> {
  const prefix = `INV-${yyyymm(date)}-`;
  const count = await prisma.serviceTransaction.count({ where: { invoiceNumber: { startsWith: prefix } } });
  return `${prefix}${pad(count + 1 + offset, 4)}`;
}
