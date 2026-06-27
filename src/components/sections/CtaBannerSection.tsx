import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO } from "@/lib/constants";

/* ─── Section: CTA Banner Full-Width ─── */
export default function CtaBannerSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#43791b] via-primary to-[#2e5511] py-16 md:py-20">
      {/* Dekorasi */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Siap Memulai Perizinan
              <br className="hidden md:block" />
              Bisnis Anda?
            </h2>
            <p className="text-white/80 mt-3 text-lg">
              Konsultasikan kebutuhan Anda sekarang <strong>gratis</strong> bersama tim ahli
              kami.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 flex-shrink-0">
            <Button
              asChild
              size="lg"
              className="gap-2.5 bg-white text-primary font-bold hover:bg-gray-50 rounded-xl shadow-xl shadow-black/25 px-7"
            >
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                Konsultasikan Gratis Sekarang
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="gap-2.5 bg-transparent border border-white/60 text-white font-semibold hover:bg-white/15 hover:border-white rounded-xl px-7"
            >
              <Link href="/layanan">
                Lihat Layanan
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
