import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import BlogCatalogSection from "@/components/sections/BlogCatalogSection";
import { getPublicBlogPosts, getBlogCategories, getBlogPageContent } from "@/lib/blog-data";

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Blog dan Artikel Seputar Perizinan Usaha",
  description:
    "Informasi terbaru seputar perizinan usaha, regulasi, dan tips untuk mendukung pertumbuhan bisnis Anda — dari tim IzinPro.",
  alternates: {
    canonical: "https://izinpro.co.id/blog",
  },
};

/* ─── Halaman Artikel / Blog (desain baru) ─── */
export default async function BlogPage() {
  const [posts, categories, banner] = await Promise.all([
    getPublicBlogPosts(),
    getBlogCategories(),
    getBlogPageContent(),
  ]);

  return (
    <>
      {/* 1. Hero + breadcrumb (banner dikelola dari admin /blog tab "Banner Halaman") */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Artikel" }]}
        kicker={banner.heroKicker ?? undefined}
        title={
          <>
            {banner.heroTitle} <span className="text-primary">{banner.heroTitleHighlight}</span>
          </>
        }
        description={banner.heroDescription}
        imageLabel="Ilustrasi laptop menampilkan artikel IzinPro"
        imageUrl={banner.heroImageUrl}
        overlap
      />

      {/* 2. Search + sidebar + grid artikel */}
      <BlogCatalogSection posts={posts} categories={categories} />

      {/* 3. CTA Banner */}
      <CtaSection
        title="Butuh Bantuan Perizinan untuk Bisnis Anda?"
        subtitle="Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami."
      />
    </>
  );
}
