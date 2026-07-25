import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

/* ─── Cron: auto-publish artikel blog yang statusnya SCHEDULED ───
 * Dipanggil Vercel Cron Job (lihat vercel.ts) tiap 5 menit. Vercel
 * otomatis nempelin header `Authorization: Bearer $CRON_SECRET` kalau
 * env var CRON_SECRET diset di project settings — WAJIB diset di
 * production, kalau enggak endpoint ini ditolak (default-deny, bukan
 * default-allow, biar gak ada yang bisa nge-trigger publish sembarangan
 * dari luar). */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.blogPost.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: new Date() }, deletedAt: null },
    select: { id: true, slug: true, scheduledAt: true },
  });

  if (due.length === 0) {
    return NextResponse.json({ ok: true, published: 0 });
  }

  await prisma.$transaction(
    due.map((post) =>
      prisma.blogPost.update({
        where: { id: post.id },
        // publishedAt = scheduledAt (bukan waktu cron jalan) supaya artikel
        // "terbit" persis di jam yang diniatkan editor, gak ngaret ngikut
        // interval cron.
        data: { status: "PUBLISHED", publishedAt: post.scheduledAt, scheduledAt: null },
      }),
    ),
  );

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const post of due) revalidatePath(`/blog/${post.slug}`);

  return NextResponse.json({ ok: true, published: due.length });
}
