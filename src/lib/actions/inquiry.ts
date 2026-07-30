"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { InquiryStatus, Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

async function requireInquiryEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/inquiry")) {
    throw new Error("Anda tidak punya akses untuk mengubah inquiry.");
  }
  return session;
}

/* ─── Kirim pesan (form kontak publik) ───
 * TANPA auth — diisi pengunjung anonim, bukan admin. Validasi ringan di sini
 * cuma jaring pengaman kedua (validasi utama sudah di client via zod), krn
 * request bisa datang dari luar form (mis. curl langsung ke server action). */
export async function submitInquiryAction(data: {
  name: string;
  email: string;
  whatsapp: string;
  serviceId: string | null;
  message: string;
}): Promise<ActionResult> {
  try {
    const name = data.name.trim();
    const email = data.email.trim();
    const whatsapp = data.whatsapp.trim();
    const message = data.message.trim();

    if (name.length < 3) return { ok: false, message: "Nama minimal 3 karakter." };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: "Format email tidak valid." };
    if (whatsapp.length < 9) return { ok: false, message: "Nomor WhatsApp minimal 9 digit." };
    if (message.length < 10) return { ok: false, message: "Pesan minimal 10 karakter." };

    await prisma.inquiry.create({
      data: {
        name,
        email,
        whatsapp,
        serviceId: data.serviceId || null,
        message,
      },
    });

    revalidateAdminPaths("/inquiry");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengirim pesan. Coba lagi sebentar lagi.") };
  }
}

/* ─── Admin: ubah status & hapus inquiry ─── */
export async function updateInquiryStatusAction(id: string, status: InquiryStatus): Promise<ActionResult> {
  try {
    const session = await requireInquiryEditor();
    await prisma.inquiry.update({
      where: { id },
      data: { status, updatedById: session.user.id },
    });
    revalidateAdminPaths("/inquiry");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status.") };
  }
}

export async function deleteInquiryAction(id: string): Promise<ActionResult> {
  try {
    await requireInquiryEditor();
    await prisma.inquiry.delete({ where: { id } });
    revalidateAdminPaths("/inquiry");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus inquiry.") };
  }
}
