import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";

import PageHero from "@/components/shared/PageHero";
import BlogDetailProseSection from "@/components/sections/BlogDetailProseSection";
import { getPublicBlogPostBySlug, getPublicBlogPosts } from "@/lib/blog-data";
import { PANDUAN_NIB_SLUG } from "@/lib/panduan-nib";
import { PANDUAN_LEGALITAS_SLUG } from "@/lib/panduan-legalitas";

/* Slug dengan route statis sendiri — dikeluarkan dari route dinamis */
const STATIC_ARTICLE_SLUGS = [PANDUAN_NIB_SLUG, PANDUAN_LEGALITAS_SLUG];

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublicBlogPosts();
  return posts
    .filter((p) => !STATIC_ARTICLE_SLUGS.includes(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) return { title: "Artikel Tidak Ditemukan" };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: {
      canonical: `https://izinpro.co.id/blog/${slug}`,
    },
  };
}

/* ─── Halaman Detail Artikel (desain baru) ─── */
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPublicBlogPosts();
  const related = allPosts
    .filter((p) => p.slug !== slug && p.categoryName === post.categoryName)
    .slice(0, 4);
  const relatedFallback =
    related.length > 0 ? related : allPosts.filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <>
      {/* 1. Hero + breadcrumb + meta penulis */}
      <PageHero
        crumbs={[
          { label: "Beranda", href: "/" },
          { label: "Artikel", href: "/blog" },
          { label: post.title },
        ]}
        kicker={post.categoryName}
        title={post.title}
        description={post.excerpt}
        imageLabel={`Ilustrasi artikel ${post.title}`}
        mobileImageFirst
      >
        {/* Penulis & meta */}
        <div className="mt-5 flex items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-lime to-brand-green-dark text-xs font-bold text-white"
            aria-hidden="true"
          >
            IP
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Ditulis oleh Tim IzinPro
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Diperbarui: {post.dateLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {post.readTimeLabel}
              </span>
            </p>
          </div>
        </div>
      </PageHero>

      {/* 2. Badan artikel + sidebar */}
      <BlogDetailProseSection post={post} related={relatedFallback} />

      {/* 3. CTA Banner */}
      <CtaSection
        title="Ingin Proses Lebih Cepat & Tanpa Ribet?"
        subtitle="Serahkan pengurusan perizinan Anda kepada tim profesional kami. Lebih hemat waktu, aman, dan pasti selesai."
      />
    </>
  );
}
