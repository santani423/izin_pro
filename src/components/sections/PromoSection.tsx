import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { PROMOS } from "@/lib/constants";

/* ─── Section: Promo Spesial ─── */
export default function PromoSection() {
  return (
    <SectionWrapper id="promo" alt>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-10 reveal">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Penawaran Terbatas
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Promo Spesial</h2>
          <p className="text-gray-500 mt-3">
            Dapatkan penawaran terbaik untuk layanan perizinan pilihan Anda. Terbatas!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PROMOS.map((promo, i) => (
            <div
              key={promo.id}
              className={`reveal relative overflow-hidden rounded-3xl bg-gradient-to-br ${promo.gradient} p-7 text-white flex flex-col`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Dekorasi background */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

              {/* Konten */}
              <div className="relative z-10 flex-1">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
                  {promo.tag}
                </span>
                <div className="text-4xl font-extrabold leading-none">{promo.title}</div>
                <div className="text-3xl font-extrabold mb-3">{promo.subtitle}</div>
                <p className="text-white/80 text-sm leading-relaxed">{promo.description}</p>
              </div>

              <div className="relative z-10 mt-6">
                {promo.ctaHref.startsWith("http") ? (
                  <a
                    href={promo.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {promo.ctaLabel}
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  <Link
                    href={promo.ctaHref}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {promo.ctaLabel}
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
