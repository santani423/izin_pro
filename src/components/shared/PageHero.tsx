import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

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
  /** Label kecil uppercase di atas judul (opsional) */
  kicker?: string;
  /** Konten tambahan kolom kiri: chip, tombol, dsb. (opsional) */
  children?: ReactNode;
  /** Beri ruang bawah ekstra saat ada bar yang menimpa hero */
  overlap?: boolean;
  /** Mobile: breadcrumb lalu foto dulu, baru judul (pola halaman artikel) */
  mobileImageFirst?: boolean;
}

/* ─── Hero halaman dalam — breadcrumb, judul & foto (pola seragam) ─── */
export default function PageHero({
  crumbs,
  title,
  description,
  imageLabel,
  kicker,
  children,
  overlap = false,
  mobileImageFirst = false,
}: PageHeroProps) {
  const breadcrumbNav = (
    <nav
      aria-label="Breadcrumb"
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

  return (
    <section className="bg-brand-surface">
      <div
        className={cn(
          "mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8",
          overlap ? "pb-20" : "pb-14",
        )}
      >
        {mobileImageFirst ? (
          <>
            {breadcrumbNav}
            <div className="order-last lg:order-none">{textContent}</div>
            <div
              role="img"
              aria-label={imageLabel}
              className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
            />
          </>
        ) : (
          <>
            <div>{textContent}</div>
            {/* Placeholder foto hero — gradient hijau brand */}
            <div
              role="img"
              aria-label={imageLabel}
              className="hidden aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark lg:block"
            />
          </>
        )}
      </div>
    </section>
  );
}
