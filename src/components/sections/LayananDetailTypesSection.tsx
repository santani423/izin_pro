import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import { TYPE_ICONS, type LayananDetail } from "@/lib/layanan-detail";

/* ─── Jenis-jenis layanan yang ditangani (opsional, mis. Izin Usaha) ─── */
export default function LayananDetailTypesSection({
  types,
}: {
  types: NonNullable<LayananDetail["types"]>;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {types.title}
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {types.items.map(({ title, description }, index) => {
          const Icon = TYPE_ICONS[index % TYPE_ICONS.length];
          return (
            <Reveal key={title} delay={index * 0.08}>
              <Card className="h-full gap-0 overflow-hidden rounded-xl border-border/60 py-0">
                {/* Placeholder foto — gradient hijau brand */}
                <div
                  role="img"
                  aria-label={`Ilustrasi ${title}`}
                  className="grid aspect-[4/3] w-full place-items-center bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
                >
                  <Icon className="size-7 text-white/80" aria-hidden="true" />
                </div>
                <CardContent className="px-3 py-4">
                  <h3 className="text-sm font-bold leading-snug text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href={types.linkHref}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          {types.linkLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
