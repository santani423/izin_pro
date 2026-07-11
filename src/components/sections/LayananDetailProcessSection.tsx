import { ChevronRight } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";
import type { LayananDetail } from "@/lib/layanan-detail";

/* ─── Alur proses layanan — 5 langkah bernomor ─── */
export default function LayananDetailProcessSection({
  process,
}: {
  process: LayananDetail["process"];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {process.title}
      </h2>

      <ol
        className={cn(
          "mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2",
          process.steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5",
        )}
      >
        {process.steps.map(({ icon: Icon, title, description }, index) => (
          <Reveal key={title} delay={index * 0.08}>
            <li className="relative flex flex-col items-center text-center">
              {/* Panah putus-putus ke langkah berikutnya — hanya saat 5 kolom sejajar (lg) */}
              {index < process.steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-[calc(50%+2.25rem)] right-[calc(-50%+2.25rem)] top-7 hidden -translate-y-1/2 items-center lg:flex"
                >
                  <span className="flex-1 border-t-2 border-dashed border-primary/40" />
                  <ChevronRight className="-ml-1.5 size-4 shrink-0 text-primary/60" />
                </div>
              )}
              <div className="relative">
                <span className="grid size-14 place-items-center rounded-full border border-primary/30 bg-background text-primary shadow-sm">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span
                  className="absolute -left-2 -top-1 grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {title}
              </h3>
              <p className="mt-1.5 max-w-[180px] text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
