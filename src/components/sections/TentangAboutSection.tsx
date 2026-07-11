import { BadgeCheck } from "lucide-react";

import { TENTANG_STATS } from "@/lib/tentang";

/* ─── Tentang Kami — foto + deskripsi + statistik ringkas ─── */
export default function TentangAboutSection() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      {/* Foto + badge mengambang */}
      <div className="relative">
        <div
          role="img"
          aria-label="Foto tim IzinPro sedang berdiskusi dengan klien"
          className="aspect-[16/11] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
        />
        <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 shadow-md">
          <div>
            <p className="text-lg font-extrabold text-foreground">5.000+</p>
            <p className="text-xs text-muted-foreground">Perizinan Selesai</p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full border border-primary/30 text-primary">
            <BadgeCheck className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Tentang Kami
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          IzinPro, Partner Tepat untuk{" "}
          <span className="block text-primary">Legalitas Bisnis Anda</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          IzinPro adalah penyedia jasa perizinan usaha terpercaya di Indonesia
          yang berfokus pada kemudahan, kecepatan, dan kepastian hukum dalam
          setiap proses perizinan.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Kami memahami bahwa setiap bisnis membutuhkan legalitas yang kuat
          sebagai fondasi untuk berkembang. Karena itu, kami hadir dengan
          layanan terlengkap dan pendampingan dari tim ahli berpengalaman.
        </p>

        {/* Statistik ringkas */}
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TENTANG_STATS.map(({ icon: Icon, value, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-extrabold text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
