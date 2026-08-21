"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import Image from "next/image";
import { ArrowRight, BadgeCheck, CheckCircle2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { useDictionary } from "@/contexts/LocaleContext";
import { HERO_HIGHLIGHTS, WHATSAPP_URL } from "@/lib/landing";
import { cn } from "@/lib/utils";
import { trackContact } from "@/lib/meta-pixel";

/* Ikon badge highlight tetap hardcode per-index (gak disimpan di DB) — cocokin
 * urutannya kalau HERO_HIGHLIGHTS di landing.ts diubah. */
const HIGHLIGHT_ICONS = HERO_HIGHLIGHTS.map((h) => h.icon);

export interface HeroContentData {
  titleLine1: string;
  titleHighlight: string;
  titleLine3: string;
  subtitle: string;
  highlights: { title: string; subtitle: string }[];
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  // null/undefined = pakai kartu gradient placeholder bawaan di bawah
  imageUrl?: string | null;
}

/* Default = copy asli (dipakai kalau HeroContent belum ke-seed / gagal
 * diambil) — jangan sampai beranda tampil kosong gara-gara DB kosong. */
export const DEFAULT_HERO_CONTENT: HeroContentData = {
  titleLine1: "Solusi Perizinan",
  titleHighlight: "Bisnis Anda,",
  titleLine3: "Aman & Terpercaya",
  subtitle:
    "IzinPro hadir untuk membantu bisnis Anda mengurus perizinan dengan mudah, cepat, dan sesuai regulasi.",
  highlights: HERO_HIGHLIGHTS.map(({ title, subtitle }) => ({ title, subtitle })),
  ctaPrimaryLabel: "Konsultasikan Gratis",
  ctaSecondaryLabel: "Lihat Semua Layanan",
  ctaSecondaryHref: "/layanan",
  imageUrl: null,
};

/* ─── Hero ─── */
export default function HeroSection({ content = DEFAULT_HERO_CONTENT }: { content?: HeroContentData }) {
  const dict = useDictionary();
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: "easeOut" as const },
        };

  /* Konten kartu gradient placeholder (dipakai di versi mobile & full-bleed) */
  const renderPlaceholder = () => (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="grid size-20 place-items-center rounded-3xl bg-white/15">
        <CheckCircle2 className="size-9 text-white" aria-hidden="true" />
      </span>
      <p className="text-3xl font-extrabold tracking-tight text-white">IzinPro</p>
      <p className="text-sm text-white/85">{dict.hero.placeholderTagline}</p>
      <ul className="mt-1 flex flex-wrap justify-center gap-2">
        {dict.hero.placeholderTags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white"
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );

  /* Isi kartu stat (dipakai di versi mobile & full-bleed, cuma posisi
   * pembungkusnya beda) */
  const renderStatCardContent = (stat: { value: string; label: string }, index: number) => (
    <CardContent className="px-4 py-3">
      <p className="flex items-center gap-1.5 text-xl font-extrabold text-foreground">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BadgeCheck className="size-3.5" aria-hidden="true" />
        </span>
        {stat.value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
      {index === 1 && (
        <div className="mt-1 flex gap-0.5" aria-label={dict.hero.ariaRating}>
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
  );

  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-gradient-to-b from-muted/60 to-background"
    >
      {/* Foto hero — full-bleed nempel tepi kanan & atas-bawah section
          (≥lg). Ditaruh di luar container max-w-7xl (posisinya absolute
          terhadap <section>) biar gak kepotong padding kanan, mirip hero
          split-layout di referensi desain. */}
      <div className="absolute inset-y-0 right-0 hidden w-[45%] lg:block">
        {/* Sisi kiri foto di-fade ke transparan (mask) biar nyatu sama
            background section, bukan potongan tegas — efeknya kayak
            gambar "meleleh" masuk ke area konten teks. */}
        <div className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,transparent,black_38%)] [mask-image:linear-gradient(to_right,transparent,black_38%)]">
          {content.imageUrl ? (
            <Image
              src={content.imageUrl}
              alt="IzinPro"
              fill
              sizes="45vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark">
              {renderPlaceholder()}
            </div>
          )}
        </div>

        {/* Floating stat cards di atas foto full-bleed */}
        {dict.hero.stats.map((stat, index) => (
          <motion.div
            key={stat.value}
            className={cn("absolute", index === 0 ? "right-8 top-14" : "left-10 bottom-14")}
            {...(prefersReducedMotion
              ? {}
              : {
                  initial: { opacity: 0, x: index === 0 ? 32 : -32 },
                  animate: { opacity: 1, x: 0 },
                  transition: {
                    duration: 0.5,
                    delay: 0.5 + index * 0.15,
                    ease: "easeOut" as const,
                  },
                })}
          >
            <Card
              className="animate-float w-44 rounded-xl border-border/60 py-0 shadow-lg"
              style={{
                animationDuration: `${4 + index * 1.5}s`,
                animationDelay: `${1 + index * 0.5}s`,
              }}
            >
              {renderStatCardContent(stat, index)}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-20">
        {/* Kolom kiri — teks */}
        <div>
          <motion.h1
            {...fadeUp(0)}
            className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {content.titleLine1}
            <br />
            <span className="text-primary">{content.titleHighlight}</span>
            <br />
            {content.titleLine3}
          </motion.h1>

          <motion.p
            {...fadeUp(0.1)}
            className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {content.subtitle}
          </motion.p>

          {/* Highlight pills */}
          <motion.ul
            {...fadeUp(0.2)}
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
          >
            {content.highlights.map(({ title, subtitle }, index) => {
              const Icon = HIGHLIGHT_ICONS[index];
              return (
                <li key={index} className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 text-primary">
                    {Icon && <Icon className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="text-xs font-semibold leading-snug whitespace-nowrap text-foreground sm:text-sm">
                    {title}
                    <br />
                    <span className="font-normal text-muted-foreground">
                      {subtitle}
                    </span>
                  </span>
                </li>
              );
            })}
          </motion.ul>

          {/* CTA — 1 baris di mobile (flex-1 berbagi lebar), ukuran normal ≥sm */}
          <motion.div {...fadeUp(0.3)} className="mt-8 flex gap-2 sm:gap-3">
            <Button
              asChild
              size="lg"
              className="flex-1 justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:flex-none sm:gap-2 sm:px-5 sm:text-sm"
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackContact()}>
                {content.ctaPrimaryLabel}
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="flex-1 justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:flex-none sm:gap-2 sm:px-5 sm:text-sm"
            >
              <Link href={content.ctaSecondaryHref}>
                {content.ctaSecondaryLabel}
                <ArrowRight className="size-3.5 sm:size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Kolom kanan — gambar + floating stats, cuma <lg (≥lg dipakai
            versi full-bleed di luar grid, lihat atas) */}
        <motion.div {...fadeUp(0.2)} className="relative lg:hidden">
          {content.imageUrl ? (
            /* Gambar hero custom dari admin — gantiin kartu gradient sepenuhnya */
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm">
              <Image
                src={content.imageUrl}
                alt="IzinPro"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            /* Kartu hero — gradient hijau brand berisi identitas IzinPro (fallback bawaan) */
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark shadow-sm">
              {renderPlaceholder()}
            </div>
          )}

          {/* Floating stat cards — tampil di atas foto (custom maupun kartu
              gradient bawaan). Mobile: grid 2 kolom di bawah kartu; ≥sm:
              melayang di kanan atas & kiri bawah (sm:contents membuat
              wrapper "hilang" sehingga posisi absolute mengacu ke kolom
              kanan). */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:contents">
            {dict.hero.stats.map((stat, index) => (
              <motion.div
                key={stat.value}
                className={cn(
                  "sm:absolute",
                  index === 0
                    ? "sm:-right-3 sm:top-5"
                    : "sm:-left-3 sm:bottom-8",
                )}
                {...(prefersReducedMotion
                  ? {}
                  : {
                      initial: { opacity: 0, x: index === 0 ? 32 : -32 },
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
                  {renderStatCardContent(stat, index)}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
