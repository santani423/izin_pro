import type { WorkflowStepStatus, TransactionStatus, TransactionPriority } from "@prisma/client";

/* ─── Label & warna status modul Transaksi — satu sumber kebenaran dipakai
 * WorkflowTemplateEditor, WorkflowTimeline, ServiceTransactionsManager,
 * TransactionDetailClient, dan halaman /tracking publik. Warna ikut Color
 * Rules di spec: hijau=selesai, biru=proses, oranye=menunggu/revisi,
 * merah=ditolak, abu=pending. ─── */

export const WORKFLOW_STEP_STATUS_LABELS: Record<WorkflowStepStatus, string> = {
  PENDING: "Menunggu",
  IN_PROGRESS: "Sedang Diproses",
  COMPLETED: "Selesai",
  REVISION: "Revisi",
  REJECTED: "Ditolak",
  SKIPPED: "Dilewati",
};

export const WORKFLOW_STEP_STATUS_COLORS: Record<WorkflowStepStatus, { text: string; bg: string; dot: string }> = {
  PENDING: { text: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  IN_PROGRESS: { text: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  COMPLETED: { text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  REVISION: { text: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
  REJECTED: { text: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  SKIPPED: { text: "text-gray-400", bg: "bg-gray-50", dot: "bg-gray-300" },
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  DRAFT: "Draft",
  WAITING_PAYMENT: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Diproses",
  ON_HOLD: "Ditahan",
  REVISION: "Revisi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, { text: string; bg: string }> = {
  DRAFT: { text: "text-gray-500", bg: "bg-gray-100" },
  WAITING_PAYMENT: { text: "text-amber-700", bg: "bg-amber-50" },
  PAID: { text: "text-sky-700", bg: "bg-sky-50" },
  PROCESSING: { text: "text-blue-700", bg: "bg-blue-50" },
  ON_HOLD: { text: "text-orange-700", bg: "bg-orange-50" },
  REVISION: { text: "text-orange-700", bg: "bg-orange-50" },
  COMPLETED: { text: "text-emerald-700", bg: "bg-emerald-50" },
  CANCELLED: { text: "text-red-700", bg: "bg-red-50" },
};

export const PRIORITY_LABELS: Record<TransactionPriority, string> = {
  LOW: "Rendah",
  NORMAL: "Normal",
  HIGH: "Tinggi",
  URGENT: "Mendesak",
};
