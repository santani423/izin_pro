"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import type { Role, WorkflowStepStatus } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

const CONTENT_EDITOR_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

async function requireContentEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !CONTENT_EDITOR_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

function revalidateWorkflow() {
  revalidateAdminPaths("/transaksi/workflow");
}

export interface WorkflowTemplateFormData {
  name: string;
  description: string | null;
  serviceId: string;
}

export async function createWorkflowTemplateAction(data: WorkflowTemplateFormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    if (!data.name.trim()) return { ok: false, message: "Nama template wajib diisi." };
    if (!data.serviceId) return { ok: false, message: "Layanan wajib dipilih." };

    await prisma.workflowTemplate.create({
      data: {
        name: data.name.trim(),
        description: data.description,
        serviceId: data.serviceId,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan template workflow.") };
  }
}

export async function updateWorkflowTemplateAction(
  id: string,
  data: WorkflowTemplateFormData,
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    if (!data.name.trim()) return { ok: false, message: "Nama template wajib diisi." };

    await prisma.workflowTemplate.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description,
        serviceId: data.serviceId,
        updatedById: session.user.id,
      },
    });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui template workflow.") };
  }
}

export async function toggleWorkflowTemplateActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.workflowTemplate.update({ where: { id }, data: { isActive, updatedById: session.user.id } });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status template.") };
  }
}

export async function deleteWorkflowTemplateAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.workflowTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: session.user.id, updatedById: session.user.id },
    });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus template workflow.") };
  }
}

/** Duplikat template + semua langkahnya — nama baru otomatis dapat suffix
 * "(Copy)", template hasil duplikat non-aktif dulu spy admin sempat review. */
export async function duplicateWorkflowTemplateAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const original = await prisma.workflowTemplate.findUniqueOrThrow({
      where: { id },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    await prisma.workflowTemplate.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        serviceId: original.serviceId,
        isActive: false,
        createdById: session.user.id,
        updatedById: session.user.id,
        steps: {
          create: original.steps.map((s) => ({
            name: s.name,
            description: s.description,
            order: s.order,
            estimatedDays: s.estimatedDays,
            requiredDocuments: s.requiredDocuments ?? undefined,
            defaultStatus: s.defaultStatus,
          })),
        },
      },
    });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menduplikat template workflow.") };
  }
}

/* ─── Langkah (step) template ─── */

export interface WorkflowStepFormData {
  name: string;
  description: string | null;
  estimatedDays: number | null;
  requiredDocuments: string[];
  defaultStatus: WorkflowStepStatus;
}

export async function createWorkflowStepAction(
  templateId: string,
  data: WorkflowStepFormData,
): Promise<ActionResult> {
  try {
    await requireContentEditor();
    if (!data.name.trim()) return { ok: false, message: "Nama langkah wajib diisi." };

    const count = await prisma.workflowTemplateStep.count({ where: { templateId } });
    await prisma.workflowTemplateStep.create({
      data: {
        templateId,
        name: data.name.trim(),
        description: data.description,
        order: count,
        estimatedDays: data.estimatedDays,
        requiredDocuments: data.requiredDocuments,
        defaultStatus: data.defaultStatus,
      },
    });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan langkah.") };
  }
}

export async function updateWorkflowStepAction(id: string, data: WorkflowStepFormData): Promise<ActionResult> {
  try {
    await requireContentEditor();
    if (!data.name.trim()) return { ok: false, message: "Nama langkah wajib diisi." };

    await prisma.workflowTemplateStep.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description,
        estimatedDays: data.estimatedDays,
        requiredDocuments: data.requiredDocuments,
        defaultStatus: data.defaultStatus,
      },
    });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui langkah.") };
  }
}

export async function deleteWorkflowStepAction(id: string): Promise<ActionResult> {
  try {
    await requireContentEditor();
    await prisma.workflowTemplateStep.delete({ where: { id } });
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus langkah.") };
  }
}

export async function reorderWorkflowStepsAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireContentEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.workflowTemplateStep.update({ where: { id }, data: { order: index } })),
    );
    revalidateWorkflow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah urutan langkah.") };
  }
}
