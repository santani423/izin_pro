"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { HERO_HIGHLIGHTS, HERO_STATS, WHATSAPP_URL } from "@/lib/landing";
import { cn } from "@/lib/utils";

/* ─── Hero ─── */
export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: "easeOut" as const },
        };

  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-gradient-to-b from-muted/60 to-background"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-20">
        {/* Kolom kiri — teks */}
        <div>
          <motion.h1
            {...fadeUp(0)}
            className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Solusi Perizinan
            <br />
            <span className="text-primary">Bisnis Anda,</span>
            <br />
            Aman &amp; Terpercaya
          </motion.h1>

          <motion.p
            {...fadeUp(0.1)}
            className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            IzinPro hadir untuk membantu bisnis Anda mengurus perizinan dengan
            mudah, cepat, dan sesuai regulasi.
          </motion.p>

          {/* Highlight pills */}
          <motion.ul
            {...fadeUp(0.2)}
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
          >
            {HERO_HIGHLIGHTS.map(({ icon: Icon, title, subtitle }) => (
              <li key={title} className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold leading-snug whitespace-nowrap text-foreground sm:text-sm">
                  {title}
                  <br />
                  <span className="font-normal text-muted-foreground">
                    {subtitle}
                  </span>
                </span>
              </li>
            ))}
          </motion.ul>

          {/* CTA — 1 baris di mobile (flex-1 berbagi lebar), ukuran normal ≥sm */}
          <motion.div {...fadeUp(0.3)} className="mt-8 flex gap-2 sm:gap-3">
            <Button
              asChild
              size="lg"
              className="flex-1 justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:flex-none sm:gap-2 sm:px-5 sm:text-sm"
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Konsultasikan Gratis
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="flex-1 justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:flex-none sm:gap-2 sm:px-5 sm:text-sm"
            >
              <Link href="/layanan">
                Lihat Semua Layanan
                <ArrowRight className="size-3.5 sm:size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Kolom kanan — gambar + floating stats */}
        <motion.div {...fadeUp(0.2)} className="relative">
          {/* Kartu hero — gradient hijau brand berisi identitas IzinPro */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark shadow-sm">
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="grid size-20 place-items-center rounded-3xl bg-white/15">
                <CheckCircle2 className="size-9 text-white" aria-hidden="true" />
              </span>
              <p className="text-3xl font-extrabold tracking-tight text-white">
                IzinPro
              </p>
              <p className="text-sm text-white/85">
                Platform Perizinan Bisnis #1 Indonesia
              </p>
              <ul className="mt-1 flex flex-wrap justify-center gap-2">
                {["OSS Terintegrasi", "Bergaransi", "Transparan"].map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Floating stat cards — mobile: grid 2 kolom di bawah kartu;
              ≥sm: melayang di kiri bawah & kanan atas (sm:contents membuat
              wrapper "hilang" sehingga posisi absolute mengacu ke kolom kanan) */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:contents">
            {HERO_STATS.map((stat, index) => (
              <motion.div
                key={stat.value}
                className={cn(
                  "sm:absolute",
                  index === 0
                    ? "sm:-left-3 sm:bottom-8"
                    : "sm:-right-3 sm:top-5",
                )}
                {...(prefersReducedMotion
                  ? {}
                  : {
                      initial: { opacity: 0, x: index === 0 ? -32 : 32 },
                      animate: { opacity: 1, x: 0 },
                      transition: {
                        duration: 0.5,
                        delay: 0.5 + index * 0.15,
                        ease: "easeOut" as const,
                      },
                    })}
              >
                <Card
                  className="animate-float h-full w-full rounded-xl border-border/60 py-0 shadow-lg sm:h-auto sm:w-44"
                  style={{
                    animationDuration: `${4 + index * 1.5}s`,
                    animationDelay: `${1 + index * 0.5}s`,
                  }}
                >
                  <CardContent className="px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xl font-extrabold text-foreground">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BadgeCheck className="size-3.5" aria-hidden="true" />
                    </span>
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                  {stat.withStars && (
                    <div
                      className="mt-1 flex gap-0.5"
                      aria-label="Rating 5 dari 5 bintang"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-3.5 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
