import { prisma } from "@/lib/db";
import type { BlogPost, Category, Media } from "@prisma/client";

/* Gradient thumbnail placeholder — dipakai kalau artikel belum punya
 * featuredMedia (dirotasi deterministik dari slug). */
const GRADIENTS = [
  "from-[#1b3309] to-[#5ba12b]",
  "from-[#1e3a5f] to-[#3b82f6]",
  "from-[#4a1d96] to-[#8b5cf6]",
  "from-[#7c2d12] to-[#ea580c]",
  "from-[#0f766e] to-[#34d399]",
];

function hashGradient(seed: string) {
  const sum = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

export interface PublicBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryName: string;
  dateLabel: string;
  readTimeLabel: string;
  viewsLabel: string;
  gradient: string;
  imageUrl: string | null;
  publishedAt: Date;
}

function toReadTimeLabel(content: string): string {
  const plainText = content.replace(/<[^>]+>/g, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} menit baca`;
}

function toDateLabel(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function mapPublicPost(
  row: BlogPost & { category: Category; featuredMedia: Media | null },
): PublicBlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    categoryName: row.category.name,
    dateLabel: toDateLabel(row.publishedAt),
    readTimeLabel: toReadTimeLabel(row.content),
    viewsLabel: row.views.toLocaleString("id-ID"),
    gradient: hashGradient(row.slug),
    imageUrl: row.featuredMedia?.url ?? null,
    publishedAt: row.publishedAt ?? row.createdAt,
  };
}

/* ─── Semua artikel published, dipakai katalog /blog & homepage ─── */
export async function getPublicBlogPosts(): Promise<PublicBlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    include: { category: true, featuredMedia: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapPublicPost);
}

export interface PublicBlogPostDetail extends PublicBlogPost {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
}

/* ─── Satu artikel by slug — dipakai halaman detail, sekalian nambah
 * views (raw incrementable counter, lihat komentar di schema). ─── */
export async function getPublicBlogPostBySlug(slug: string): Promise<PublicBlogPostDetail | null> {
  const existing = await prisma.blogPost.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
  });
  if (!existing) return null;

  const row = await prisma.blogPost.update({
    where: { id: existing.id },
    data: { views: { increment: 1 } },
    include: { category: true, featuredMedia: true, tags: { include: { tag: true } } },
  });

  return {
    ...mapPublicPost(row),
    content: row.content,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    tags: row.tags.map((t) => t.tag.name),
  };
}

/* ─── Kategori + jumlah artikel published, dipakai sidebar katalog ─── */
export interface BlogCategory {
  label: string;
  count: number;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: { where: { deletedAt: null, status: "PUBLISHED" } } } } },
    orderBy: { name: "asc" },
  });
  const total = categories.reduce((sum, c) => sum + c._count.posts, 0);
  return [
    { label: "Semua Artikel", count: total },
    ...categories.map((c) => ({ label: c.name, count: c._count.posts })),
  ];
}

/* ─── Slug + updatedAt ringan, dipakai sitemap.ts ─── */
export async function getBlogSlugsForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.blogPost.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
}
