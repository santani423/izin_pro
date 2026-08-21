import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

/* ─── Hero halaman Daftar Layanan — breadcrumb, judul & foto ─── */
export default async function LayananHeroSection() {
  const dict = getDictionary(await getLocale());
  return (
    <section className="bg-brand-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          {/* Breadcrumb */}
          <nav
            aria-label={dict.common.ariaBreadcrumb}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              {dict.common.breadcrumbHome}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground">{dict.layananHero.breadcrumbLayanan}</span>
          </nav>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {dict.layananHero.headingPrefix} <span className="text-primary">{dict.layananHero.headingHighlight}</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {dict.layananHero.subtitle}
          </p>
        </div>

        {/* Placeholder foto hero — gradient hijau brand */}
        <Reveal delay={0.15} className="hidden lg:block">
          <div
            role="img"
            aria-label={dict.layananHero.ariaImage}
            className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
          />
        </Reveal>
      </div>
    </section>
  );
}
