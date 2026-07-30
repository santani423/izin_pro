import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import type { KontakInfoCardItem } from "@/lib/hydrate-kontak-content";

/* ─── Bar info kontak — kartu putih menimpa bawah hero ─── */
export default function KontakInfoBar({ items }: { items: KontakInfoCardItem[] }) {
  return (
    <section
      aria-label="Kanal kontak IzinPro"
      className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <ul className="grid grid-cols-1 gap-5 rounded-2xl border border-border/60 bg-background px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, value, note }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
              {Icon === "whatsapp" ? (
                <WhatsAppIcon className="size-4" />
              ) : (
                <Icon className="size-4" aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="mt-0.5 text-sm text-foreground/90">{value}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
