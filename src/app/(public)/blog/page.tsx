import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { BLOG_POSTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog & Artikel",
  description:
    "Artikel terkini seputar perizinan bisnis, tips hukum usaha, dan regulasi terbaru di Indonesia.",
};

const categories = ["Semua", "Perizinan", "Tips Bisnis", "Peraturan", "Sertifikasi"];

/* ─── Halaman Blog ─── */
export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-br from-[#f3fae8] via-white to-[#f3fae8] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Blog &amp; Edukasi
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Artikel &amp; Panduan Perizinan
            </h1>
            <p className="text-lg text-gray-500 mt-4">
              Informasi terkini seputar perizinan bisnis, regulasi, dan tips untuk pengusaha
              Indonesia.
            </p>
          </div>

          {/* Search bar (UI saja) */}
          <div className="relative max-w-md mt-6">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari artikel..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-white"
            />
          </div>
        </div>
      </section>

      <SectionWrapper>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Filter kategori */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cat === "Semua"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Artikel featured */}
          <Link
            href={`/blog/${featured.slug}`}
            className="reveal group grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 mb-8 bg-white transition-all duration-300"
          >
            <div className={`h-60 md:h-auto bg-gradient-to-br ${featured.gradient}`} />
            <div className="p-7 flex flex-col">
              <Badge className="self-start bg-primary/10 text-primary border-0 hover:bg-primary/15 mb-3">
                {featured.category}
              </Badge>
              <h2 className="text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{featured.excerpt}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Eye size={12} />
                  {featured.views} views · {featured.date}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Baca
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>

          {/* Grid artikel lainnya */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="reveal group flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 bg-white transition-all"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`h-40 bg-gradient-to-br ${post.gradient} relative`}>
                  <Badge className="absolute top-3 left-3 bg-white/20 hover:bg-white/30 text-white border-0 text-xs">
                    {post.category}
                  </Badge>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                    <Eye size={11} />
                    {post.views} views · {post.date}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
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
    </>
  );
}
