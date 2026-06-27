import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CtaBannerSection from "@/components/sections/CtaBannerSection";
import { BLOG_POSTS } from "@/lib/constants";

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
  return { title: post.title, description: post.excerpt };
}

/* ─── Halaman Detail Blog ─── */
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.category === post.category,
  ).slice(0, 3);

  return (
    <>
      {/* ─── Hero ─── */}
      <div className={`h-64 md:h-80 bg-gradient-to-br ${post.gradient} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-full flex items-end pb-8 relative z-10">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
            {post.category}
          </Badge>
        </div>
      </div>

      {/* ─── Konten ─── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Kembali ke Blog
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Eye size={12} />
            {post.views} views · {post.date}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed border-l-4 border-primary pl-4 mb-8">
            {post.excerpt}
          </p>

          {/* Konten placeholder */}
          <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
            <p>
              Artikel ini membahas secara mendalam mengenai <strong>{post.title}</strong>.
              Konten lengkap akan diisi oleh tim editorial IzinPro.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proses perizinan di
              Indonesia terus berkembang mengikuti regulasi yang ada. Penting bagi setiap pelaku
              usaha untuk selalu mengikuti perkembangan terkini.
            </p>
            <h2 className="text-xl font-bold text-gray-900">Poin Penting</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pastikan semua dokumen lengkap sebelum mengajukan permohonan.</li>
              <li>Ikuti prosedur yang telah ditetapkan pemerintah.</li>
              <li>Konsultasikan dengan ahli jika ada yang kurang jelas.</li>
              <li>Monitor status pengajuan secara berkala.</li>
            </ul>
            <p>
              IzinPro siap membantu Anda menavigasi proses perizinan yang kompleks dengan
              mudah dan efisien.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Artikel Terkait ─── */}
      {related.length > 0 && (
        <section className="py-12 bg-[#f8fdf9]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Artikel Terkait</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 bg-white transition-all"
                >
                  <div className={`h-36 bg-gradient-to-br ${r.gradient}`} />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                      Baca <ArrowRight size={11} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBannerSection />
    </>
  );
}
