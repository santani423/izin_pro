import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { LANDING_PROMOS, type LandingPromo } from "@/lib/landing";
import { cn } from "@/lib/utils";

const VARIANT_STYLES: Record<
  LandingPromo["variant"],
  { card: string; eyebrow: string; button: string }
> = {
  discount: {
    card: "bg-gradient-to-br from-primary to-brand-green-dark text-white",
    eyebrow: "text-white/85",
    button:
      "bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25",
  },
  free: {
    card: "bg-gradient-to-br from-neutral-900 to-neutral-700 text-white",
    eyebrow: "text-brand-lime",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  package: {
    card: "bg-brand-surface text-foreground border border-border/60",
    eyebrow: "text-primary",
    button:
      "bg-transparent text-primary ring-1 ring-primary hover:bg-primary/10",
  },
};

/* ─── Promo Spesial ─── */
export default function PromoSection() {
  return (
    <section id="promo" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        title="Promo Spesial"
        subtitle="Dapatkan penawaran terbaik untuk layanan perizinan pilihan Anda."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {LANDING_PROMOS.map((promo, index) => {
          const style = VARIANT_STYLES[promo.variant];
          return (
            <Reveal key={promo.id} delay={index * 0.1}>
              <article
                className={cn(
                  "flex h-full min-h-44 flex-col justify-between rounded-xl p-6 shadow-sm",
                  style.card,
                )}
              >
                <div>
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      style.eyebrow,
                    )}
                  >
                    {promo.eyebrow}
                  </p>
                  <h3 className="mt-1 text-3xl font-extrabold tracking-tight">
                    {promo.title}
                  </h3>
                  <p className="mt-1.5 text-sm opacity-90">
                    {promo.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  className={cn(
                    "mt-5 w-fit rounded-md font-semibold shadow-none",
                    style.button,
                  )}
                >
                  {promo.ctaLabel}
                </Button>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
