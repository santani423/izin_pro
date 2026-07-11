import { TESTIMONI_STATS } from "@/lib/testimoni";

/* ─── Bar statistik — kartu putih menimpa bawah hero ─── */
export default function TestimoniStatsBar() {
  return (
    <section
      aria-label="Statistik IzinPro"
      className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <ul className="grid grid-cols-1 gap-6 rounded-2xl border border-border/60 bg-background px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border/60">
        {TESTIMONI_STATS.map(({ icon: Icon, value, label }) => (
          <li
            key={label}
            className="flex flex-col items-center gap-1 text-center"
          >
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <p className="mt-1 text-xl font-extrabold text-foreground">
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
