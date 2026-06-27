import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { BLOG_POSTS } from "@/lib/constants";

/* ─── Section: Artikel Terbaru ─── */
export default function BlogSection() {
  /* Tampilkan 4 artikel di halaman beranda */
  const featured = BLOG_POSTS.slice(0, 4);

  return (
    <SectionWrapper id="artikel">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="reveal">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Blog &amp; Edukasi
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Artikel Terbaru
            </h2>
            <p className="text-gray-500 mt-2">
              Informasi terkini seputar perizinan dan dunia bisnis.
            </p>
          </div>
          <Link
            href="/blog"
            className="reveal flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all whitespace-nowrap"
          >
            Lihat Semua Artikel
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="reveal group flex flex-col rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 bg-white transition-all duration-300"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Gambar placeholder gradient */}
              <div
                className={`relative h-44 bg-gradient-to-br ${post.gradient} flex-shrink-0`}
              >
                <Badge className="absolute top-3 left-3 bg-white/20 hover:bg-white/30 text-white border-0 text-xs">
                  {post.category}
                </Badge>
              </div>

              {/* Konten */}
              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                  <Eye size={11} />
                  {post.views} views · {post.date}
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                  Baca selengkapnya
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
