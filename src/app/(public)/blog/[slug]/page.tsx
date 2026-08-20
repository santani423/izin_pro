import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";

import PageHero from "@/components/shared/PageHero";
import BlogDetailProseSection from "@/components/sections/BlogDetailProseSection";
import BlogCommentsSection from "@/components/sections/BlogCommentsSection";
import {
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
  getBlogSlugsForSitemap,
} from "@/lib/blog-data";
import { recordArticleVisit, getApprovedComments } from "@/lib/article-stats";
import { PANDUAN_LEGALITAS_SLUG } from "@/lib/panduan-legalitas";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";

/* Slug dengan route statis sendiri — dikeluarkan dari route dinamis */
const STATIC_ARTICLE_SLUGS = [PANDUAN_LEGALITAS_SLUG];

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

interface Props {
  params: Promise<{ slug: string }>;
}

/* Build-safe: pakai getBlogSlugsForSitemap() (query slug murni, tanpa
 * getLocale()/headers()) — bukan getPublicBlogPosts(), yang butuh locale
 * request-time dan gak bisa dipanggil saat build. */
export async function generateStaticParams() {
  const posts = await getBlogSlugsForSitemap();
  return posts
    .filter((p) => !STATIC_ARTICLE_SLUGS.includes(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) return { title: getDictionary(await getLocale()).pages.blogDetail.notFoundTitle };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const url = `https://izinpro.co.id/blog/${slug}`;
  const imageUrl = post.imageUrl || "/og-image.png";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/* ─── Halaman Detail Artikel (desain baru) ─── */
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const dict = getDictionary(await getLocale());
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) notFound();

  await recordArticleVisit(post.id);
  const comments = await getApprovedComments(post.id);

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
          { label: dict.common.breadcrumbHome, href: "/" },
          { label: dict.pages.blogDetail.breadcrumbArtikel, href: "/blog" },
          { label: post.title },
        ]}
        ariaBreadcrumb={dict.common.ariaBreadcrumb}
        kicker={post.categoryName}
        title={post.title}
        description={post.excerpt}
        imageLabel={format(dict.pages.blogDetail.imageLabelTemplate, { title: post.title })}
        imageUrl={post.imageUrl}
        mobileImageFirst
      >
        {/* Penulis & meta */}
        <div className="mt-5 flex items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-lime to-brand-green-dark text-xs font-bold text-white"
            aria-hidden="true"
          >
            {dict.pages.blogDetail.avatarInitials}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {dict.pages.blogDetail.authorLine}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {dict.pages.blogDetail.updatedPrefix}{post.dateLabel}
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

      {/* 2b. Komentar (approved only) + form komentar baru */}
      <BlogCommentsSection postId={post.id} comments={comments} />

      {/* 3. CTA Banner */}
      <CtaSection
        title={dict.pages.blogDetail.ctaTitle}
        subtitle={dict.pages.blogDetail.ctaSubtitle}
      />
    </>
  );
}
