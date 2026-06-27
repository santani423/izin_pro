"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Zap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY_INFO } from "@/lib/constants";

/* ─── Animasi counter angka ─── */
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

/* ─── Hero Section ─── */
export default function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative flex items-center overflow-hidden bg-gradient-to-br from-[#f3fae8] via-white to-[#f3fae8]"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #5ba12b22 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Dekorasi blob */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* ─── Konten Teks ─── */}
          <div className="space-y-5">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border-0 text-sm font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Terpercaya Sejak {COMPANY_INFO.foundedYear}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
              Solusi Perizinan
              <br />
              Bisnis Anda,
              <br />
              <span className="text-primary whitespace-nowrap">Aman &amp; Terpercaya</span>
            </h1>

            <p className="text-base text-gray-600 leading-relaxed max-w-lg">
              Urus perizinan usaha dengan mudah, cepat, dan legal bersama tim profesional
              IzinPro. Lebih dari 5.000 klien telah mempercayakan urusan perizinan mereka kepada
              kami.
            </p>

            {/* Pills keunggulan */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Zap, text: "Proses Cepat & Efisien" },
                { icon: Shield, text: "Legal & Resmi 100%" },
                { icon: Users, text: "Tim Profesional" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  <Icon size={14} className="text-primary" />
                  {text}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="gap-2.5 rounded-xl shadow-lg shadow-primary/25 font-semibold px-7 py-3.5 h-auto text-sm"
              >
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={17} />
                  Konsultasikan Gratis
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl border-gray-200 font-semibold px-7 py-3.5 h-auto text-sm"
              >
                <Link href="/layanan">
                  Lihat Layanan
                  <ArrowRight size={15} />
                </Link>
              </Button>
            </div>
          </div>

          {/* ─── Visual Hero ─── */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Kartu utama — diperbesar dari max-w-sm */}
            <div className="relative w-full max-w-md">
              <div className="bg-gradient-to-br from-primary to-[#43791b] rounded-3xl p-10 text-white shadow-2xl shadow-primary/30">
                <div className="flex items-center justify-center w-18 h-18 rounded-2xl bg-white/20 mb-6 mx-auto" style={{ width: 72, height: 72 }}>
                  <svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                    <circle cx="30" cy="30" r="28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    <path
                      d="M20 30l7 7 13-14"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold mb-1.5">{COMPANY_INFO.name}</div>
                  <div className="text-white/80 text-sm">Platform Perizinan Bisnis #1 Indonesia</div>
                  <div className="flex flex-wrap justify-center gap-2 mt-5">
                    {["OSS Terintegrasi", "Bergaransi", "Transparan"].map((tag) => (
                      <span
                        key={tag}
                        className="px-3.5 py-1 rounded-full bg-white/20 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating card: Perizinan Selesai */}
              <div className="absolute -bottom-5 -left-8 glass rounded-2xl shadow-xl p-4 border border-white/60 min-w-[150px]">
                <div className="text-2xl font-extrabold text-gray-900">
                  <AnimatedCounter target={5000} suffix="+" />
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Perizinan Selesai</div>
              </div>

              {/* Floating card: Kepuasan */}
              <div className="absolute -top-5 -right-5 glass rounded-2xl shadow-xl p-4 border border-white/60 min-w-[130px]">
                <div className="text-yellow-400 text-sm mb-1">★★★★★</div>
                <div className="text-2xl font-extrabold text-gray-900">99%</div>
                <div className="text-xs text-gray-500 mt-0.5">Kepuasan Klien</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
