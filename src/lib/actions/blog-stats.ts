"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Comment, Role } from "@prisma/client";

/* Sama role set dgn BLOG_EDITOR_ROLES di actions/blog.ts — AUTHOR boleh
 * lihat statistik, tapi cuma milik artikelnya sendiri (assertOwnsPost). */
const BLOG_EDITOR_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"];

async function requireBlogViewer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !BLOG_EDITOR_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

export interface ArticleStatsData {
  totalViews: number;
  deviceBreakdown: { device: string; count: number }[];
  locationBreakdown: { label: string; count: number }[];
  comments: Comment[];
  pendingCount: number;
  approvedCount: number;
}

export type ArticleStatsResult = { ok: true; data: ArticleStatsData } | { ok: false; message: string };

/* ─── Statistik detail 1 artikel: total kunjungan, breakdown device &
 * lokasi (dari ArticleView), plus daftar komentar — dipakai panel
 * Statistik di /admin/blog. ─── */
export async function getArticleStatsAction(postId: string): Promise<ArticleStatsResult> {
  try {
    const session = await requireBlogViewer();
    const post = await prisma.blogPost.findUniqueOrThrow({
      where: { id: postId },
      select: { views: true, authorId: true },
    });
    if (session.user.role === "AUTHOR" && post.authorId !== session.user.id) {
      throw new Error("Anda hanya bisa melihat statistik artikel milik sendiri.");
    }

    const [deviceRows, locationRows, comments] = await Promise.all([
      prisma.articleView.groupBy({
        by: ["device"],
        where: { postId },
        _count: { _all: true },
      }),
      prisma.articleView.groupBy({
        by: ["country"],
        where: { postId },
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
        take: 5,
      }),
      prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: "desc" } }),
    ]);

    return {
      ok: true,
      data: {
        totalViews: post.views,
        deviceBreakdown: deviceRows.map((r) => ({ device: r.device, count: r._count._all })),
        locationBreakdown: locationRows.map((r) => ({
          label: r.country ?? "Tidak Terdeteksi",
          count: r._count._all,
        })),
        comments,
        pendingCount: comments.filter((c) => c.status === "PENDING").length,
        approvedCount: comments.filter((c) => c.status === "APPROVED").length,
      },
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal memuat statistik artikel." };
  }
}
