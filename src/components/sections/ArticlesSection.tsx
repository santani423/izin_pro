import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import type { PublicBlogPost } from "@/lib/blog-data";
import { cn } from "@/lib/utils";

/* ─── Artikel Terbaru ─── */
export default function ArticlesSection({ posts }: { posts: PublicBlogPost[] }) {
  return (
    <section id="artikel" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        title="Artikel Terbaru"
        subtitle="Informasi terbaru seputar perizinan usaha dan regulasi bisnis."
        linkLabel="Lihat Semua Artikel"
        linkHref="/blog"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, index) => (
          <Reveal key={post.id} delay={index * 0.08}>
            <Link href={`/blog/${post.slug}`} className="group block h-full">
              <Card className="h-full gap-0 overflow-hidden rounded-xl border-border/60 py-0 transition-shadow hover:shadow-md">
                {/* Thumbnail — gambar unggulan atau gradient fallback + badge kategori */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {post.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.imageUrl}
                      alt={`Thumbnail artikel: ${post.title}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={`Thumbnail artikel: ${post.title}`}
                      className={cn("size-full bg-gradient-to-br", post.gradient)}
                    />
                  )}
                  <Badge className="absolute left-3 top-3 rounded-full border-none bg-black/25 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {post.categoryName}
                  </Badge>
                </div>

                <CardContent className="flex h-full flex-col px-4 pb-5 pt-4">
                  {/* Meta: views + tanggal */}
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="size-3.5" aria-hidden="true" />
                    {post.viewsLabel} views · {post.dateLabel}
                  </p>

                  <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Baca selengkapnya
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
