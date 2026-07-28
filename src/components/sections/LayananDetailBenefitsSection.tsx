import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import type { LayananDetail } from "@/lib/hydrate-layanan-detail";

/* ─── Keuntungan / manfaat layanan — grid 5 kartu ─── */
export default function LayananDetailBenefitsSection({
  benefits,
}: {
  benefits: NonNullable<LayananDetail["benefits"]>;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {benefits.title}
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {benefits.items.map(({ icon: Icon, title, description }, index) => (
          <Reveal key={index} delay={index * 0.08}>
            <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
              <CardContent className="flex h-full flex-col items-center px-4 py-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-lg border border-primary/30 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
