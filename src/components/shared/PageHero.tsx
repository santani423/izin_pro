import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  crumbs: Crumb[];
  /** Judul h1 — boleh ReactNode agar sebagian kata bisa hijau */
  title: ReactNode;
  description: ReactNode;
  imageLabel: string;
  /** Foto asli — kosong/null = pakai kartu gradient placeholder bawaan */
  imageUrl?: string | null;
  /** Ilustrasi custom (opsional) — override total kolom foto, dipakai
   * halaman yang butuh visual khusus (mis. mockup tracking). Prioritas
   * di atas imageUrl/gradient placeholder. */
  imageContent?: ReactNode;
  /** Label kecil uppercase di atas judul (opsional) */
  kicker?: string;
  /** Konten tambahan kolom kiri: chip, tombol, dsb. (opsional) */
  children?: ReactNode;
  /** Beri ruang bawah ekstra saat ada bar yang menimpa hero */
  overlap?: boolean;
  /** Mobile: breadcrumb lalu foto dulu, baru judul (pola halaman artikel) */
  mobileImageFirst?: boolean;
  /** aria-label nav breadcrumb — diteruskan per-locale dari page.tsx (Server
   * Component, gak bisa pakai useDictionary()) */
  ariaBreadcrumb?: string;
}

/* ─── Hero halaman dalam — breadcrumb, judul & foto (pola seragam) ─── */
export default function PageHero({
  crumbs,
  title,
  description,
  imageLabel,
  imageUrl,
  imageContent,
  kicker,
  children,
  overlap = false,
  mobileImageFirst = false,
  ariaBreadcrumb = "Breadcrumb",
}: PageHeroProps) {
  const breadcrumbNav = (
    <nav
      aria-label={ariaBreadcrumb}
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        mobileImageFirst && "lg:col-span-2",
      )}
    >
      {crumbs.map((crumb, index) => (
        <span key={crumb.label} className="flex items-center gap-1.5">
          {index > 0 && (
            <ChevronRight className="size-3.5" aria-hidden="true" />
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="transition-colors hover:text-primary"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );

  const textContent = (
    <>
      {!mobileImageFirst && breadcrumbNav}
      {kicker && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
          {kicker}
        </p>
      )}
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <div className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </div>
      {children}
    </>
  );

  /* imageContent (mis. mockup /tracking) tetap kartu contained biasa —
   * bukan foto asli, jadi gak dipaksa ke pola full-bleed di bawah. */
  const hasCustomVisual = Boolean(imageContent);

  return (
    <section className="relative overflow-hidden bg-brand-surface">
      {/* Foto hero — full-bleed nempel tepi kanan & atas-bawah section
          (≥lg), sisi kiri di-fade ke transparan biar nyatu sama konten.
          Konsisten sama pola di hero beranda & detail layanan. */}
      {!hasCustomVisual && (
        <div className="absolute inset-y-0 right-0 hidden w-[45%] lg:block">
          <div className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,transparent,black_38%)] [mask-image:linear-gradient(to_right,transparent,black_38%)]">
            {imageUrl ? (
              <Image src={imageUrl} alt={imageLabel} fill sizes="45vw" className="object-cover" priority />
            ) : (
              <div
                role="img"
                aria-label={imageLabel}
                className="h-full w-full bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
              />
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8",
          overlap ? "pb-20" : "pb-14",
        )}
      >
        {mobileImageFirst ? (
          <>
            {breadcrumbNav}
            <div className="order-last lg:order-none">{textContent}</div>
            <Reveal delay={0.15} className={cn(!hasCustomVisual && "lg:hidden")}>
              {imageContent ? (
                <div aria-hidden="true">{imageContent}</div>
              ) : imageUrl ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <Image src={imageUrl} alt={imageLabel} fill sizes="100vw" className="object-cover" priority />
                </div>
              ) : (
                <div
                  role="img"
                  aria-label={imageLabel}
                  className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
                />
              )}
            </Reveal>
          </>
        ) : (
          <>
            <div>{textContent}</div>
            <Reveal delay={0.15} className={hasCustomVisual ? "hidden lg:block" : "hidden"}>
              {imageContent ? (
                <div aria-hidden="true">{imageContent}</div>
              ) : imageUrl ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                  <Image src={imageUrl} alt={imageLabel} fill sizes="50vw" className="object-cover" priority />
                </div>
              ) : (
                /* Placeholder foto hero — gradient hijau brand */
                <div
                  role="img"
                  aria-label={imageLabel}
                  className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
                />
              )}
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
