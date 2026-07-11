/* ─── Data & helper halaman Artikel /blog (desain baru) ───
 * Sumber artikel tetap BLOG_POSTS di constants.ts (dipakai juga admin &
 * homepage) — file ini hanya menambah data pelengkap halaman blog.
 */

import { BLOG_POSTS } from "@/lib/constants";
import type { BlogPost } from "@/types";

/* ─── Topik populer (chip di sidebar) ─── */
export const BLOG_TOPICS: string[] = [
  "Pendirian PT",
  "NIB",
  "Izin Usaha",
  "OSS RBA",
  "KBLI",
  "Perizinan Online",
  "Legalitas Bisnis",
];

/* ─── Kategori + jumlah artikel (dihitung dari BLOG_POSTS) ─── */
export interface BlogCategory {
  label: string;
  count: number;
}

export function getBlogCategories(): BlogCategory[] {
  const counts = new Map<string, number>();
  for (const post of BLOG_POSTS) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return [
    { label: "Semua Artikel", count: BLOG_POSTS.length },
    ...Array.from(counts, ([label, count]) => ({ label, count })),
  ];
}

/* ─── Estimasi lama baca (menit) — deterministik dari panjang konten ─── */
export function getReadTime(post: BlogPost): string {
  const minutes = 4 + ((post.title.length + post.excerpt.length) % 4);
  return `${minutes} menit baca`;
}
