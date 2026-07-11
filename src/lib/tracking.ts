/* ─── Data halaman Tracking Perizinan /tracking ───
 * Masih frontend-only: status order menggunakan MOCK DATA. Saat backend
 * tersedia (roadmap v2.x), ganti lookup di sini dengan panggilan API.
 */

import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileCheck2,
  Landmark,
  MessagesSquare,
  Search,
} from "lucide-react";

/* ─── Tahapan proses perizinan (sama untuk semua order) ─── */
export interface TrackingStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const TRACKING_STEPS: TrackingStep[] = [
  {
    icon: MessagesSquare,
    title: "Konsultasi & Verifikasi",
    description: "Kebutuhan Anda dianalisis dan data awal diverifikasi.",
  },
  {
    icon: ClipboardList,
    title: "Persiapan Dokumen",
    description: "Tim kami menyiapkan dan memeriksa seluruh dokumen.",
  },
  {
    icon: Search,
    title: "Pengajuan ke Instansi",
    description: "Dokumen diajukan ke instansi pemerintah terkait.",
  },
  {
    icon: Landmark,
    title: "Proses di Instansi",
    description: "Menunggu verifikasi dan penerbitan dari instansi.",
  },
  {
    icon: FileCheck2,
    title: "Selesai & Diserahkan",
    description: "Dokumen perizinan selesai dan diserahkan kepada Anda.",
  },
];

/* ─── Order mock ─── */
export interface TrackingOrder {
  orderNo: string;
  service: string;
  submittedDate: string;
  estimatedDone: string;
  /** Tahap berjalan saat ini, 1–5 (5 = selesai) */
  currentStep: number;
  /** Tanggal selesai per tahap (index sama dengan TRACKING_STEPS) */
  stepDates: (string | null)[];
}

export const MOCK_ORDERS: Record<string, TrackingOrder> = {
  "IZN-2025-0001": {
    orderNo: "IZN-2025-0001",
    service: "Pendirian PT",
    submittedDate: "7 Juli 2026",
    estimatedDone: "16 Juli 2026",
    currentStep: 3,
    stepDates: ["7 Juli 2026", "9 Juli 2026", null, null, null],
  },
  "IZN-2025-0002": {
    orderNo: "IZN-2025-0002",
    service: "NIB (Nomor Induk Berusaha)",
    submittedDate: "3 Juli 2026",
    estimatedDone: "6 Juli 2026",
    currentStep: 5,
    stepDates: [
      "3 Juli 2026",
      "4 Juli 2026",
      "4 Juli 2026",
      "5 Juli 2026",
      "6 Juli 2026",
    ],
  },
  "IZN-2025-0003": {
    orderNo: "IZN-2025-0003",
    service: "Izin Usaha",
    submittedDate: "10 Juli 2026",
    estimatedDone: "24 Juli 2026",
    currentStep: 1,
    stepDates: [null, null, null, null, null],
  },
};

/* Nomor demo untuk dicoba pengunjung */
export const DEMO_ORDER_NUMBERS = Object.keys(MOCK_ORDERS);

/* ─── Cari order berdasar nomor (case-insensitive) ─── */
export function findOrder(orderNo: string): TrackingOrder | null {
  return MOCK_ORDERS[orderNo.trim().toUpperCase()] ?? null;
}
