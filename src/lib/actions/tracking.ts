"use server";

import { prisma } from "@/lib/db";
import { getTrackingResult, findTransactionIdByCode, type PublicTrackingResult } from "@/lib/transaction-tracking";
import { parseDeviceType, getRequestGeo } from "@/lib/article-stats";
import { headers } from "next/headers";

export type TrackingLookupResult =
  | { ok: true; data: PublicTrackingResult }
  | { ok: false; message: string };

/* ─── Lacak transaksi via kode (form publik /tracking) ───
 * TANPA auth — dipakai pengunjung anonim. Sekalian nyatet TrackingLookupLog
 * (device + geolokasi) pakai helper yg sama dgn blog article-stats. ─── */
export async function submitTrackingLookupAction(code: string): Promise<TrackingLookupResult> {
  try {
    if (!code.trim()) return { ok: false, message: "Masukkan kode transaksi Anda." };

    const result = await getTrackingResult(code);
    if (!result) {
      return { ok: false, message: "Kode transaksi tidak ditemukan. Periksa kembali penulisannya." };
    }

    const transactionId = await findTransactionIdByCode(code);
    if (transactionId) {
      const h = await headers();
      const device = parseDeviceType(h.get("user-agent"));
      const { country, city } = await getRequestGeo();
      await prisma.trackingLookupLog.create({ data: { transactionId, device, country, city } });
    }

    return { ok: true, data: result };
  } catch {
    return { ok: false, message: "Gagal melacak transaksi. Coba lagi sebentar lagi." };
  }
}
