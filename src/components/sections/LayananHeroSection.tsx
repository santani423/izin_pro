import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* ─── Hero halaman Daftar Layanan — breadcrumb, judul & foto ─── */
export default function LayananHeroSection() {
  return (
    <section className="bg-brand-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              Beranda
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground">Layanan</span>
          </nav>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Daftar <span className="text-primary">Layanan</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Berbagai layanan perizinan untuk mendukung legalitas dan kelancaran
            bisnis Anda.
          </p>
        </div>

        {/* Placeholder foto hero — gradient hijau brand */}
        <div
          role="img"
          aria-label="Ilustrasi konsultan IzinPro menganalisis dokumen perizinan"
          className="hidden aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark lg:block"
        />
      </div>
    </section>
  );
}
