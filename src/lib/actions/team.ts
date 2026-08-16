"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import { saveUploadedImage } from "@/lib/media";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

async function requireTeamEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/tim")) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

function revalidateTeam() {
  revalidateAdminPaths("/tim");
  revalidatePath("/tentang-kami");
}

export interface TeamMemberFormData {
  name: string;
  role: string;
  // Kosong = fallback ke `role` di publik (lihat TentangKamiPage).
  roleEn: string;
  roleZh: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  photoMediaId: string | null;
}

function validate(data: TeamMemberFormData): string | null {
  if (!data.name.trim()) return "Nama wajib diisi.";
  if (!data.role.trim()) return "Jabatan (Bahasa Indonesia) wajib diisi.";
  return null;
}

export async function createTeamMemberAction(data: TeamMemberFormData): Promise<ActionResult> {
  try {
    const session = await requireTeamEditor();
    const error = validate(data);
    if (error) return { ok: false, message: error };

    const count = await prisma.teamMember.count({ where: { deletedAt: null } });
    await prisma.teamMember.create({
      data: {
        name: data.name.trim(),
        role: data.role.trim(),
        roleEn: data.roleEn.trim() || null,
        roleZh: data.roleZh.trim() || null,
        department: data.department?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        location: data.location?.trim() || null,
        linkedinUrl: data.linkedinUrl?.trim() || null,
        photoMediaId: data.photoMediaId,
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidateTeam();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan anggota tim.") };
  }
}

export async function updateTeamMemberAction(id: string, data: TeamMemberFormData): Promise<ActionResult> {
  try {
    const session = await requireTeamEditor();
    const error = validate(data);
    if (error) return { ok: false, message: error };

    await prisma.teamMember.update({
      where: { id },
      data: {
        name: data.name.trim(),
        role: data.role.trim(),
        roleEn: data.roleEn.trim() || null,
        roleZh: data.roleZh.trim() || null,
        department: data.department?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        location: data.location?.trim() || null,
        linkedinUrl: data.linkedinUrl?.trim() || null,
        photoMediaId: data.photoMediaId,
        updatedById: session.user.id,
      },
    });
    revalidateTeam();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui anggota tim.") };
  }
}

/** Soft delete — sesuai keputusan desain schema (TeamMember punya deletedAt). */
export async function deleteTeamMemberAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireTeamEditor();
    await prisma.teamMember.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: session.user.id },
    });
    revalidateTeam();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus anggota tim.") };
  }
}

export async function toggleTeamMemberActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const session = await requireTeamEditor();
    await prisma.teamMember.update({ where: { id }, data: { isActive, updatedById: session.user.id } });
    revalidateTeam();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status anggota tim.") };
  }
}

export async function reorderTeamMembersAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireTeamEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.teamMember.update({ where: { id }, data: { sortOrder: index } })),
    );
    revalidateTeam();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah urutan anggota tim.") };
  }
}

export type UploadImageResult =
  | { ok: true; mediaId: string; url: string }
  | { ok: false; message: string };

/** Cuma upload & bikin Media row — belum nautin ke TeamMember, dipanggil
 * sebelum createTeamMemberAction/updateTeamMemberAction (mediaId dikirim
 * sbg bagian dari payload, sama pola kayak Service.featuredMediaId). */
export async function uploadTeamPhotoAction(formData: FormData): Promise<UploadImageResult> {
  try {
    const session = await requireTeamEditor();
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File foto wajib diunggah." };
    const media = await saveUploadedImage(file, "team", session.user.id);
    return { ok: true, mediaId: media.id, url: media.url };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah foto.") };
  }
}
