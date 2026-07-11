import type { LucideIcon } from "lucide-react";

export interface HighlightItem {
  icon: LucideIcon;
  label: string;
}

/* ─── Bar highlight keunggulan — kartu putih menimpa bawah hero ─── */
export default function HighlightsBar({
  items,
  ariaLabel = "Keunggulan IzinPro",
}: {
  items: HighlightItem[];
  ariaLabel?: string;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <ul className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-background px-6 py-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold leading-snug text-foreground">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
