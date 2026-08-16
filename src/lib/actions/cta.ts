"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { CtaLocation, Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

async function requireCtaEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/cta-banner")) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export interface CtaLangData {
  title: string;
  subtitle: string;
  buttonLabel: string;
}

export interface CtaFormData {
  // null = CTA default (dipakai halaman yg gak punya varian sendiri)
  location: CtaLocation | null;
  id: CtaLangData;
  en: CtaLangData;
  zh: CtaLangData;
  whatsapp: string | null;
}

/** location itu @unique di schema, tapi Prisma gak bisa nge-upsert pakai
 * where:{location: null} (MySQL nganggep tiap NULL di kolom unique itu beda-
 * beda, jadi Prisma gak generate filter unique utk nullable @unique field).
 * Baris default (location null) makanya di-handle manual: cari dulu, baru
 * create/update — location beneran (bukan null) tetap bisa upsert normal. */
export async function upsertCtaAction(data: CtaFormData): Promise<ActionResult> {
  try {
    const session = await requireCtaEditor();
    if (!data.id.title.trim()) return { ok: false, message: "Judul CTA (Bahasa Indonesia) wajib diisi." };
    if (!data.id.buttonLabel.trim()) return { ok: false, message: "Label tombol (Bahasa Indonesia) wajib diisi." };

    const values = {
      title: data.id.title.trim(),
      subtitle: data.id.subtitle.trim() || null,
      buttonLabel: data.id.buttonLabel.trim(),
      titleEn: data.en.title.trim() || null,
      subtitleEn: data.en.subtitle.trim() || null,
      buttonLabelEn: data.en.buttonLabel.trim() || null,
      titleZh: data.zh.title.trim() || null,
      subtitleZh: data.zh.subtitle.trim() || null,
      buttonLabelZh: data.zh.buttonLabel.trim() || null,
      whatsapp: data.whatsapp?.trim() || null,
      updatedById: session.user.id,
    };

    if (data.location === null) {
      const existing = await prisma.cta.findFirst({ where: { location: null } });
      if (existing) {
        await prisma.cta.update({ where: { id: existing.id }, data: values });
      } else {
        await prisma.cta.create({ data: { ...values, location: undefined, createdById: session.user.id } });
      }
    } else {
      await prisma.cta.upsert({
        where: { location: data.location },
        create: { ...values, location: data.location, createdById: session.user.id },
        update: values,
      });
    }

    revalidateAdminPaths("/cta-banner");
    revalidatePath("/");
    revalidatePath("/layanan/[slug]", "page");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan CTA banner.") };
  }
}

export async function deleteCtaAction(id: string): Promise<ActionResult> {
  try {
    await requireCtaEditor();
    await prisma.cta.delete({ where: { id } });
    revalidateAdminPaths("/cta-banner");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus CTA banner.") };
  }
}
