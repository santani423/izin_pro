import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import BlogCatalogSection from "@/components/sections/BlogCatalogSection";
import { getPublicBlogPosts, getBlogCategories, getBlogPageContent } from "@/lib/blog-data";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    title: dict.pages.blog.metaTitle,
    description: dict.pages.blog.metaDescription,
    alternates: {
      canonical: "https://izinpro.co.id/blog",
    },
  };
}

/* ─── Halaman Artikel / Blog (desain baru) ─── */
export default async function BlogPage() {
  const dict = getDictionary(await getLocale());
  const [posts, categories, banner] = await Promise.all([
    getPublicBlogPosts(),
    getBlogCategories(),
    getBlogPageContent(),
  ]);

  return (
    <>
      {/* 1. Hero + breadcrumb (banner dikelola dari admin /blog tab "Banner Halaman") */}
      <PageHero
        crumbs={[{ label: dict.common.breadcrumbHome, href: "/" }, { label: dict.pages.blog.breadcrumbArtikel }]}
        ariaBreadcrumb={dict.common.ariaBreadcrumb}
        kicker={banner.heroKicker ?? undefined}
        title={
          <>
            {banner.heroTitle} <span className="text-primary">{banner.heroTitleHighlight}</span>
          </>
        }
        description={banner.heroDescription}
        imageLabel={dict.pages.blog.imageLabel}
        imageUrl={banner.heroImageUrl}
        overlap
      />

      {/* 2. Search + sidebar + grid artikel */}
      <BlogCatalogSection posts={posts} categories={categories} />

      {/* 3. CTA Banner */}
      <CtaSection
        title={dict.pages.blog.ctaTitle}
        subtitle={dict.pages.blog.ctaSubtitle}
      />
    </>
  );
}
