"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { FaqScope, Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

async function requireFaqEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/faq")) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export interface FaqFormData {
  question: string;
  answer: string;
  scope: FaqScope;
  serviceId: string | null;
}

function validate(data: FaqFormData): string | null {
  if (!data.question.trim()) return "Pertanyaan wajib diisi.";
  if (!data.answer.trim()) return "Jawaban wajib diisi.";
  if (data.scope === "SERVICE" && !data.serviceId) return "Layanan wajib dipilih untuk FAQ scope Service.";
  return null;
}

async function revalidateFaqPaths(serviceId: string | null) {
  revalidateAdminPaths("/faq");
  revalidatePath("/");
  revalidatePath("/kontak");
  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { slug: true } });
    if (service) revalidatePath(`/layanan/${service.slug}`);
  }
}

export async function createFaqAction(data: FaqFormData): Promise<ActionResult> {
  try {
    await requireFaqEditor();
    const error = validate(data);
    if (error) return { ok: false, message: error };

    const count = await prisma.faq.count();
    await prisma.faq.create({
      data: {
        question: data.question.trim(),
        answer: data.answer.trim(),
        scope: data.scope,
        serviceId: data.scope === "SERVICE" ? data.serviceId : null,
        sortOrder: count,
      },
    });
    await revalidateFaqPaths(data.scope === "SERVICE" ? data.serviceId : null);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan FAQ.") };
  }
}

export async function updateFaqAction(id: string, data: FaqFormData): Promise<ActionResult> {
  try {
    await requireFaqEditor();
    const error = validate(data);
    if (error) return { ok: false, message: error };

    await prisma.faq.update({
      where: { id },
      data: {
        question: data.question.trim(),
        answer: data.answer.trim(),
        scope: data.scope,
        serviceId: data.scope === "SERVICE" ? data.serviceId : null,
      },
    });
    await revalidateFaqPaths(data.scope === "SERVICE" ? data.serviceId : null);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui FAQ.") };
  }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  try {
    await requireFaqEditor();
    const faq = await prisma.faq.delete({ where: { id } });
    await revalidateFaqPaths(faq.serviceId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus FAQ.") };
  }
}

export async function toggleFaqActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireFaqEditor();
    const faq = await prisma.faq.update({ where: { id }, data: { isActive } });
    await revalidateFaqPaths(faq.serviceId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status FAQ.") };
  }
}

/** Reorder di-scope per grup (scope + serviceId) — urutan cuma bermakna
 * dalam grup yg sama, sesuai cara halaman publik nge-query-nya. */
export async function reorderFaqAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireFaqEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.faq.update({ where: { id }, data: { sortOrder: index } })),
    );
    revalidateAdminPaths("/faq");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah urutan FAQ.") };
  }
}
