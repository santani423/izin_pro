/* ─── Klien API WhaCenter (order.whacenter.com) — gateway WhatsApp pihak
 * ketiga dipakai modul Transaksi buat kirim invoice + link tracking + QR
 * code ke customer. Satu endpoint /api/send dipakai baik utk pesan teks
 * polos maupun teks+lampiran (param `file` WAJIB berupa URL publik, bukan
 * base64/multipart — batasan dari API-nya sendiri). */

const WHACENTER_SEND_URL = "https://app.whacenter.com/api/send";

interface WhacenterResponse {
  status: boolean;
  message?: string;
}

export type WhatsappSendResult = { ok: true } | { ok: false; message: string };

/** Pesan error WhaCenter aslinya bahasa Inggris/teknis — terjemahkan yg
 * paling sering muncul biar admin langsung ngerti apa yg perlu dibenerin,
 * bukan cuma nge-toss mentah-mentah. Pesan yg gak dikenali tetap
 * ditampilkan apa adanya (gak ditelan diam-diam). */
function translateWhacenterError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("not valid")) {
    return `Nomor WhatsApp customer tidak valid/tidak terdaftar di WhatsApp (${raw}). Periksa kembali nomor teleponnya.`;
  }
  if (lower.includes("device") && (lower.includes("not found") || lower.includes("not connect") || lower.includes("disconnect"))) {
    return `Device WhaCenter tidak terhubung (${raw}). Cek status device di dashboard WhaCenter, lalu scan ulang QR kalau perlu.`;
  }
  return raw;
}

/** "0812-3456-7890" / "+62 812-3456-7890" -> "62812345 6790" (digit only,
 * awalan 0 diganti 62) — format yg diminta gateway WhatsApp Indonesia. */
export function normalizeWhatsappNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

/** Kirim pesan WhatsApp via WhaCenter. `fileUrl` opsional — kalau diisi,
 * `message` otomatis jadi caption gambar/file tsb (dipakai buat kirim QR
 * code tracking sekaligus dgn teks invoice, satu pesan). */
export async function sendWhatsappMessage(opts: {
  deviceId: string;
  number: string;
  message: string;
  fileUrl?: string;
}): Promise<WhatsappSendResult> {
  try {
    const body = new URLSearchParams({
      device_id: opts.deviceId,
      number: normalizeWhatsappNumber(opts.number),
      message: opts.message,
      ...(opts.fileUrl ? { file: opts.fileUrl } : {}),
    });

    const res = await fetch(WHACENTER_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = (await res.json()) as WhacenterResponse;
    if (!res.ok || !data.status) {
      return { ok: false, message: translateWhacenterError(data.message || "WhaCenter menolak pengiriman pesan.") };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Gagal menghubungi server WhaCenter. Cek koneksi lalu coba lagi." };
  }
}

/** URL gambar QR code publik (qrserver.com, gratis tanpa API key) — dipakai
 * sbg `fileUrl` di atas biar WhaCenter bisa ambil gambarnya langsung. */
export function buildQrCodeUrl(data: string, size = 300): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
