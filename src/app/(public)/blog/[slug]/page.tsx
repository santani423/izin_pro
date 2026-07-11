import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, Clock } from "lucide-react";

import PageHero from "@/components/shared/PageHero";
import BlogDetailBodySection from "@/components/sections/BlogDetailBodySection";
import { BLOG_POSTS } from "@/lib/constants";
import { getArticleDetail } from "@/lib/blog-detail";
import { getReadTime } from "@/lib/blog";

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Artikel Tidak Ditemukan" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://izinpro.co.id/blog/${slug}`,
    },
  };
}

/* ─── Halaman Detail Artikel (desain baru) ─── */
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const detail = getArticleDetail(slug);
  if (!post || !detail) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <>
      {/* 1. Hero + breadcrumb + meta penulis */}
      <PageHero
        crumbs={[
          { label: "Beranda", href: "/" },
          { label: "Artikel", href: "/blog" },
          { label: post.title },
        ]}
        kicker={post.category}
        title={post.title}
        description={post.excerpt}
        imageLabel={`Ilustrasi artikel ${post.title}`}
      >
        {/* Chip highlight */}
        <ul className="mt-5 flex flex-wrap gap-2">
          {detail.chips.map((chip) => (
            <li
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              {chip}
            </li>
          ))}
        </ul>

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
                Diperbarui: {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {getReadTime(post)}
              </span>
            </p>
          </div>
        </div>
      </PageHero>

      {/* 2. Badan artikel + sidebar */}
      <BlogDetailBodySection detail={detail} related={related} />

      {/* 3. CTA Banner */}
      <CtaSection
        title="Ingin Proses Lebih Cepat & Tanpa Ribet?"
        subtitle="Serahkan pengurusan perizinan Anda kepada tim profesional kami. Lebih hemat waktu, aman, dan pasti selesai."
      />
    </>
  );
}
