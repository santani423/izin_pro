"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { generateTransactionCode, generateInvoiceNumber } from "@/lib/transaction-code";
import { parseDeviceType } from "@/lib/article-stats";
import { saveTransactionAttachmentFile } from "@/lib/attachments";
import { deleteUploadedFile } from "@/lib/media";
import type { Role, TransactionStatus, TransactionPriority, WorkflowStepStatus } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };
export type CreateTransactionResult = { ok: true; id: string } | { ok: false; message: string };

const CONTENT_EDITOR_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

async function requireTransactionEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !CONTENT_EDITOR_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

// Halaman detail transaksi selalu di-refresh via router.refresh() di client
// setelah tiap action (sama pola dgn seluruh admin panel) — revalidatePath
// di sini cukup buat list & dashboard-nya, gak perlu tau prefix panel aktif.
function revalidateTransactions() {
  revalidateAdminPaths("/transaksi/daftar");
  revalidateAdminPaths("/transaksi");
}

async function requestMeta() {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  return {
    ipAddress: forwardedFor ? forwardedFor.split(",")[0].trim() : null,
    device: parseDeviceType(h.get("user-agent")),
    userAgent: h.get("user-agent"),
  };
}

async function logActivity(params: {
  transactionId: string;
  userId: string | null;
  action: string;
  description?: string;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  const meta = await requestMeta();
  await prisma.transactionActivityLog.create({
    data: {
      transactionId: params.transactionId,
      userId: params.userId,
      action: params.action,
      description: params.description ?? null,
      previousValue: params.previousValue === undefined ? undefined : (params.previousValue as object),
      newValue: params.newValue === undefined ? undefined : (params.newValue as object),
      ipAddress: meta.ipAddress,
      device: meta.device,
      userAgent: meta.userAgent,
    },
  });
}

/* ─── Buat transaksi baru ───
 * Menyalin langkah WorkflowTemplate AKTIF milik service terpilih (kalau
 * ada) jadi TransactionWorkflowStep milik transaksi ini — perubahan
 * template belakangan gak memengaruhi transaksi yg udah dibuat. */
export interface CreateTransactionFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string | null;
  serviceId: string;
  packageId: string | null;
  assignedStaffId: string | null;
  priority: TransactionPriority;
  startDate: string | null;
  estimatedCompletionDate: string | null;
  totalPrice: number;
  discount: number;
  tax: number;
  internalNotes: string | null;
  customerNotes: string | null;
}

export async function createTransactionAction(data: CreateTransactionFormData): Promise<CreateTransactionResult> {
  try {
    const session = await requireTransactionEditor();

    if (data.customerName.trim().length < 3) return { ok: false, message: "Nama customer minimal 3 karakter." };
    if (!/^\S+@\S+\.\S+$/.test(data.customerEmail)) return { ok: false, message: "Format email tidak valid." };
    if (data.customerPhone.trim().length < 9) return { ok: false, message: "Nomor telepon minimal 9 digit." };
    if (!data.serviceId) return { ok: false, message: "Layanan wajib dipilih." };

    const template = await prisma.workflowTemplate.findFirst({
      where: { serviceId: data.serviceId, isActive: true, deletedAt: null },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    const grandTotal = data.totalPrice - data.discount + data.tax;
    const now = new Date();

    // Retry kecil kalau kode/invoice bentrok unique constraint (jarang —
    // cuma bisa kejadian kalau 2 admin submit persis bersamaan).
    let transactionId: string | null = null;
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 5 && !transactionId; attempt++) {
      try {
        const code = await generateTransactionCode(now, attempt);
        const invoiceNumber = await generateInvoiceNumber(now, attempt);
        const created = await prisma.serviceTransaction.create({
          data: {
            code,
            invoiceNumber,
            customerName: data.customerName.trim(),
            customerEmail: data.customerEmail.trim(),
            customerPhone: data.customerPhone.trim(),
            customerCompany: data.customerCompany?.trim() || null,
            serviceId: data.serviceId,
            packageId: data.packageId,
            workflowTemplateId: template?.id ?? null,
            assignedStaffId: data.assignedStaffId,
            priority: data.priority,
            startDate: data.startDate ? new Date(data.startDate) : null,
            estimatedCompletionDate: data.estimatedCompletionDate ? new Date(data.estimatedCompletionDate) : null,
            totalPrice: data.totalPrice,
            discount: data.discount,
            tax: data.tax,
            grandTotal,
            internalNotes: data.internalNotes,
            customerNotes: data.customerNotes,
            createdById: session.user.id,
            updatedById: session.user.id,
            workflowSteps: template
              ? {
                  create: template.steps.map((s) => ({
                    templateStepId: s.id,
                    name: s.name,
                    description: s.description,
                    order: s.order,
                    status: s.defaultStatus,
                    estimatedDays: s.estimatedDays,
                  })),
                }
              : undefined,
          },
        });
        transactionId = created.id;
      } catch (e) {
        lastError = e;
      }
    }
    if (!transactionId) throw lastError ?? new Error("Gagal membuat kode transaksi unik.");

    await logActivity({
      transactionId,
      userId: session.user.id,
      action: "CREATED",
      description: "Transaksi dibuat",
    });

    revalidateTransactions();
    return { ok: true, id: transactionId };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal membuat transaksi.") };
  }
}

export interface UpdateTransactionFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string | null;
  packageId: string | null;
  assignedStaffId: string | null;
  priority: TransactionPriority;
  status: TransactionStatus;
  startDate: string | null;
  estimatedCompletionDate: string | null;
  totalPrice: number;
  discount: number;
  tax: number;
}

/** Update field transaksi (bukan serviceId — layanan & workflow-nya
 * permanen sejak dibuat, ganti layanan = bikin transaksi baru). Perubahan
 * status dicatat ke activity log dgn nilai sebelum/sesudah. */
export async function updateTransactionAction(id: string, data: UpdateTransactionFormData): Promise<ActionResult> {
  try {
    const session = await requireTransactionEditor();
    const current = await prisma.serviceTransaction.findUniqueOrThrow({ where: { id } });

    if (data.customerName.trim().length < 3) return { ok: false, message: "Nama customer minimal 3 karakter." };
    if (!/^\S+@\S+\.\S+$/.test(data.customerEmail)) return { ok: false, message: "Format email tidak valid." };

    const grandTotal = data.totalPrice - data.discount + data.tax;
    const completionDate =
      data.status === "COMPLETED" && current.status !== "COMPLETED" ? new Date() : current.completionDate;

    await prisma.serviceTransaction.update({
      where: { id },
      data: {
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.trim(),
        customerPhone: data.customerPhone.trim(),
        customerCompany: data.customerCompany?.trim() || null,
        packageId: data.packageId,
        assignedStaffId: data.assignedStaffId,
        priority: data.priority,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedCompletionDate: data.estimatedCompletionDate ? new Date(data.estimatedCompletionDate) : null,
        totalPrice: data.totalPrice,
        discount: data.discount,
        tax: data.tax,
        grandTotal,
        completionDate,
        updatedById: session.user.id,
      },
    });

    if (data.status !== current.status) {
      await logActivity({
        transactionId: id,
        userId: session.user.id,
        action: "STATUS_CHANGED",
        description: `Status transaksi diubah`,
        previousValue: { status: current.status },
        newValue: { status: data.status },
      });
    }

    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui transaksi.") };
  }
}

export async function updateTransactionNotesAction(
  id: string,
  data: { internalNotes: string | null; customerNotes: string | null },
): Promise<ActionResult> {
  try {
    const session = await requireTransactionEditor();
    await prisma.serviceTransaction.update({
      where: { id },
      data: { internalNotes: data.internalNotes, customerNotes: data.customerNotes, updatedById: session.user.id },
    });
    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan catatan.") };
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireTransactionEditor();
    await prisma.serviceTransaction.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: session.user.id, updatedById: session.user.id },
    });
    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus transaksi.") };
  }
}

/* ─── Workflow per-transaksi ─── */

export async function updateWorkflowStepStatusAction(
  stepId: string,
  data: { status: WorkflowStepStatus; notes: string | null; progressPercent: number },
): Promise<ActionResult> {
  try {
    const session = await requireTransactionEditor();
    const step = await prisma.transactionWorkflowStep.findUniqueOrThrow({ where: { id: stepId } });

    const now = new Date();
    await prisma.transactionWorkflowStep.update({
      where: { id: stepId },
      data: {
        status: data.status,
        notes: data.notes,
        progressPercent: data.progressPercent,
        startedAt: step.startedAt ?? (data.status !== "PENDING" ? now : null),
        completedAt: data.status === "COMPLETED" ? now : data.status === step.status ? step.completedAt : null,
        updatedById: session.user.id,
      },
    });

    await logActivity({
      transactionId: step.transactionId,
      userId: session.user.id,
      action: "WORKFLOW_STEP_UPDATED",
      description: `Langkah "${step.name}" diubah statusnya`,
      previousValue: { status: step.status },
      newValue: { status: data.status },
    });

    // Auto-flip status transaksi mengikuti kondisi workflow-nya.
    const allSteps = await prisma.transactionWorkflowStep.findMany({ where: { transactionId: step.transactionId } });
    const transaction = await prisma.serviceTransaction.findUniqueOrThrow({ where: { id: step.transactionId } });
    if (transaction.status !== "CANCELLED") {
      if (allSteps.length > 0 && allSteps.every((s) => s.status === "COMPLETED")) {
        await prisma.serviceTransaction.update({
          where: { id: step.transactionId },
          data: { status: "COMPLETED", completionDate: now, updatedById: session.user.id },
        });
      } else if (data.status === "REVISION" && transaction.status !== "COMPLETED") {
        await prisma.serviceTransaction.update({
          where: { id: step.transactionId },
          data: { status: "REVISION", updatedById: session.user.id },
        });
      } else if (data.status === "IN_PROGRESS" && transaction.status === "PAID") {
        await prisma.serviceTransaction.update({
          where: { id: step.transactionId },
          data: { status: "PROCESSING", updatedById: session.user.id },
        });
      }
    }

    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui langkah workflow.") };
  }
}

/* ─── Pembayaran ─── */

export async function recordPaymentAction(
  transactionId: string,
  data: { amount: number; method: string | null; paidAt: string; note: string | null },
): Promise<ActionResult> {
  try {
    const session = await requireTransactionEditor();
    if (data.amount <= 0) return { ok: false, message: "Nominal pembayaran harus lebih dari 0." };

    await prisma.payment.create({
      data: {
        transactionId,
        amount: data.amount,
        method: data.method,
        paidAt: new Date(data.paidAt),
        note: data.note,
        recordedById: session.user.id,
      },
    });

    const transaction = await prisma.serviceTransaction.findUniqueOrThrow({ where: { id: transactionId } });
    const payments = await prisma.payment.findMany({ where: { transactionId } });
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const grandTotal = Number(transaction.grandTotal);
    const paymentStatus = totalPaid <= 0 ? "UNPAID" : totalPaid >= grandTotal ? "PAID" : "PARTIAL";

    await prisma.serviceTransaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus,
        status: paymentStatus === "PAID" && transaction.status === "WAITING_PAYMENT" ? "PAID" : transaction.status,
        updatedById: session.user.id,
      },
    });

    await logActivity({
      transactionId,
      userId: session.user.id,
      action: "PAYMENT_RECORDED",
      description: `Pembayaran Rp${data.amount.toLocaleString("id-ID")} dicatat`,
    });

    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mencatat pembayaran.") };
  }
}

/* ─── Lampiran ─── */

export async function uploadTransactionAttachmentAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireTransactionEditor();
    const transactionId = formData.get("transactionId") as string | null;
    const workflowStepId = formData.get("workflowStepId") as string | null;
    const visibleToCustomer = formData.get("visibleToCustomer") === "true";
    const file = formData.get("file") as File | null;
    if (!transactionId) return { ok: false, message: "Transaksi tidak valid." };
    if (!file || file.size === 0) return { ok: false, message: "File wajib diunggah." };

    const saved = await saveTransactionAttachmentFile(file, transactionId);
    await prisma.transactionAttachment.create({
      data: {
        transactionId,
        workflowStepId: workflowStepId || null,
        fileName: saved.fileName,
        url: saved.url,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        visibleToCustomer,
        uploadedById: session.user.id,
      },
    });

    await logActivity({
      transactionId,
      userId: session.user.id,
      action: "ATTACHMENT_UPLOADED",
      description: `Lampiran "${saved.fileName}" diunggah`,
    });

    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah lampiran.") };
  }
}

export async function deleteTransactionAttachmentAction(id: string): Promise<ActionResult> {
  try {
    await requireTransactionEditor();
    const attachment = await prisma.transactionAttachment.delete({ where: { id } });
    await deleteUploadedFile(attachment.url);
    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus lampiran.") };
  }
}

export async function toggleAttachmentVisibilityAction(id: string, visibleToCustomer: boolean): Promise<ActionResult> {
  try {
    await requireTransactionEditor();
    const attachment = await prisma.transactionAttachment.update({ where: { id }, data: { visibleToCustomer } });
    revalidateTransactions();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah visibilitas lampiran.") };
  }
}
