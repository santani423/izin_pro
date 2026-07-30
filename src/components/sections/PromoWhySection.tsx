import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";

export interface PromoWhyItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

/* ─── Kenapa pilih promo IzinPro — grid 5 kartu ─── */
export default function PromoWhySection({
  titlePrefix,
  titleHighlight,
  items,
}: {
  titlePrefix: string;
  titleHighlight: string;
  items: PromoWhyItem[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {titlePrefix} <span className="text-primary">{titleHighlight}</span>
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ icon: Icon, title, description }, index) => (
          <Reveal key={title} delay={index * 0.08}>
            <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
              <CardContent className="flex h-full flex-col px-4 py-5">
                <span className="flex size-10 items-center justify-center rounded-lg border border-primary/30 text-primary">
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
