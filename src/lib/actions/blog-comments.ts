"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type { Comment, Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };
export type SubmitCommentResult = { ok: true; comment: Comment } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Sama role dgn pengelola artikel (lihat BLOG_EDITOR_ROLES di actions/blog.ts)
 * — AUTHOR boleh moderasi komentar, tapi cuma di artikel miliknya sendiri. */
const BLOG_EDITOR_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"];

async function requireCommentModerator() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !BLOG_EDITOR_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

/* AUTHOR cuma boleh moderasi komentar di artikel miliknya sendiri — sama
 * pola dgn assertOwnsPost di actions/blog.ts. */
async function assertOwnsComment(
  session: Awaited<ReturnType<typeof requireCommentModerator>>,
  commentId: string,
) {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: { post: { select: { authorId: true, slug: true } } },
  });
  if (session.user.role === "AUTHOR" && comment.post.authorId !== session.user.id) {
    throw new Error("Anda hanya bisa mengelola komentar di artikel milik sendiri.");
  }
  return comment;
}

/* ─── Kirim komentar (form publik di halaman artikel) ───
 * TANPA auth — diisi pengunjung anonim, bukan admin. Langsung dibuat
 * APPROVED (tampil publik seketika, gak nunggu admin) — moderasi jadi
 * reaktif, admin hapus dari /admin/komentar kalau ada yg spam/gak pantas.
 * Comment yg dibuat dibalikin ke caller spy BlogCommentsSection bisa
 * langsung nambahin ke list tanpa reload (lihat BlogCommentForm.tsx). */
export async function submitCommentAction(data: {
  postId: string;
  name: string;
  email: string;
  content: string;
}): Promise<SubmitCommentResult> {
  const dict = getDictionary(await getLocale());
  try {
    const name = data.name.trim();
    const email = data.email.trim();
    const content = data.content.trim();

    if (name.length < 3) return { ok: false, message: dict.actions.commentNameMin };
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: dict.actions.commentEmailInvalid };
    if (content.length < 5) return { ok: false, message: dict.actions.commentMin };

    const post = await prisma.blogPost.findFirst({
      where: { id: data.postId, deletedAt: null, status: "PUBLISHED" },
      select: { id: true, slug: true },
    });
    if (!post) return { ok: false, message: dict.actions.commentPostNotFound };

    const comment = await prisma.comment.create({
      data: { postId: post.id, name, email: email || null, content, status: "APPROVED" },
    });

    revalidateAdminPaths("/blog");
    revalidateAdminPaths("/komentar");
    revalidatePath(`/blog/${post.slug}`);
    return { ok: true, comment };
  } catch (e) {
    return { ok: false, message: errorMessage(e, dict.actions.commentGenericError) };
  }
}

/* ─── Admin: setujui / hapus komentar (dari panel Statistik per artikel) ─── */
export async function approveCommentAction(commentId: string): Promise<ActionResult> {
  try {
    const session = await requireCommentModerator();
    const comment = await assertOwnsComment(session, commentId);
    await prisma.comment.update({ where: { id: commentId }, data: { status: "APPROVED" } });
    revalidateAdminPaths("/blog");
    revalidateAdminPaths("/komentar");
    revalidatePath(`/blog/${comment.post.slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyetujui komentar.") };
  }
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  try {
    const session = await requireCommentModerator();
    const comment = await assertOwnsComment(session, commentId);
    await prisma.comment.delete({ where: { id: commentId } });
    revalidateAdminPaths("/blog");
    revalidateAdminPaths("/komentar");
    revalidatePath(`/blog/${comment.post.slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus komentar.") };
  }
}
