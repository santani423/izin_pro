import { prisma } from "@/lib/db";
import { TRANSACTION_STATUS_LABELS } from "@/lib/transaction-status";
import type { WorkflowStepStatus } from "@prisma/client";

/* ─── Lookup transaksi publik ("/tracking") — data yg dikembalikan SENGAJA
 * dibatasi (public-safe): gak ada internalNotes, gak ada nama staff, gak
 * ada lampiran yg visibleToCustomer=false. Menggantikan mock
 * MOCK_ORDERS/findOrder di src/lib/tracking.ts (sudah dihapus) TOTAL. ─── */

export interface PublicTrackingStep {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStepStatus;
  completedAt: Date | null;
}

export interface PublicTrackingResult {
  code: string;
  customerName: string;
  serviceName: string;
  packageName: string | null;
  statusLabel: string;
  progressPercent: number;
  currentStageName: string;
  estimatedCompletionDate: Date | null;
  customerNotes: string | null;
  steps: PublicTrackingStep[];
  attachments: { id: string; fileName: string; url: string }[];
}

export async function getTrackingResult(rawCode: string): Promise<PublicTrackingResult | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const transaction = await prisma.serviceTransaction.findFirst({
    where: { code, deletedAt: null },
    include: {
      service: { select: { title: true } },
      package: { select: { name: true } },
      workflowSteps: { orderBy: { order: "asc" } },
      attachments: { where: { visibleToCustomer: true }, select: { id: true, fileName: true, url: true } },
    },
  });
  if (!transaction) return null;

  const totalSteps = transaction.workflowSteps.length;
  const completedSteps = transaction.workflowSteps.filter((s) => s.status === "COMPLETED").length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const currentStep = transaction.workflowSteps.find((s) => s.status !== "COMPLETED" && s.status !== "SKIPPED");
  const currentStageName = currentStep?.name ?? (totalSteps > 0 ? "Selesai" : TRANSACTION_STATUS_LABELS[transaction.status]);

  return {
    code: transaction.code,
    customerName: transaction.customerName,
    serviceName: transaction.service.title,
    packageName: transaction.package?.name ?? null,
    statusLabel: TRANSACTION_STATUS_LABELS[transaction.status],
    progressPercent,
    currentStageName,
    estimatedCompletionDate: transaction.estimatedCompletionDate,
    customerNotes: transaction.customerNotes,
    steps: transaction.workflowSteps.map((s) => ({
      id: s.id, name: s.name, description: s.description, status: s.status, completedAt: s.completedAt,
    })),
    attachments: transaction.attachments,
  };
}

export async function findTransactionIdByCode(rawCode: string): Promise<string | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  const transaction = await prisma.serviceTransaction.findFirst({ where: { code, deletedAt: null }, select: { id: true } });
  return transaction?.id ?? null;
}
