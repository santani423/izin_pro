"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Sama kayak readOnly di settings/page.tsx: cuma SUPER_ADMIN yang boleh
 * benar-benar ubah Pengaturan (ADMIN cuma bisa lihat). */
async function requireSettingsEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role as Role) !== "SUPER_ADMIN") {
    throw new Error("Anda tidak punya akses untuk mengubah Pengaturan.");
  }
  return session;
}

export async function updateMaintenanceModeAction(
  maintenanceMode: boolean,
  maintenanceMessage: string,
): Promise<ActionResult> {
  try {
    await requireSettingsEditor();
    await prisma.settings.update({
      where: { id: "1" },
      data: {
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim() || null,
      },
    });
    // Gate di (public)/layout.tsx baca sesi (cookies/headers) tiap request
    // -> segment itu otomatis dynamic, gak butuh revalidate manual di sini.
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah mode maintenance.") };
  }
}
